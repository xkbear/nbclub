"""Read-only, official WeChat service account analytics APIs."""

import json
import uuid
from datetime import date, timedelta
from urllib.error import HTTPError, URLError
from urllib.parse import quote
from urllib.request import Request, urlopen

from django.utils import timezone

from .models import ConnectorStatus, Observation

PLATFORM = "wechat_mp"
ACCOUNT_KEY = "newbee_wechat_mp"
ACCOUNT_ID = "wx8245fdb4104c1756"
API_ROOT = "https://api.weixin.qq.com"
DOC_ROOT = "https://developers.weixin.qq.com/doc/service/api/wedata/"
FEEDS = {
    "followers": ("getusercumulate", "user/api_getusercumulate"),
    "follower_changes": ("getusersummary", "user/api_getusersummary"),
    "content": ("getbizsummary", "news/api_getbizsummary"),
}


class WeChatError(Exception):
    def __init__(self, code):
        self.code = str(code)
        super().__init__(f"微信接口返回错误码 {self.code}")


class WeChatAPI:
    def __init__(self, appid, secret, opener=urlopen):
        self.appid = appid
        self.secret = secret
        self.opener = opener
        self.token = None

    def _post(self, url, payload):
        request = Request(url, data=json.dumps(payload).encode("utf-8"), headers={"Content-Type": "application/json"}, method="POST")
        try:
            with self.opener(request, timeout=20) as response:
                result = json.load(response)
        except (HTTPError, URLError, TimeoutError, ValueError) as exc:
            # Never include URLs, response bodies or exceptions: URLs can hold an access token.
            raise WeChatError(type(exc).__name__) from None
        if not isinstance(result, dict):
            raise WeChatError("invalid_response")
        code = result.get("errcode", 0)
        if isinstance(code, bool) or not (isinstance(code, int) or (isinstance(code, str) and code.lstrip("-").isdigit())):
            raise WeChatError("invalid_error_code")
        if code not in (0, "0"):
            raise WeChatError(code)
        return result

    def authenticate(self):
        data = self._post(f"{API_ROOT}/cgi-bin/stable_token", {
            "grant_type": "client_credential", "appid": self.appid, "secret": self.secret,
            "force_refresh": False,
        })
        if not isinstance(data.get("access_token"), str) or not data["access_token"]:
            raise WeChatError("missing_token")
        self.token = data["access_token"]

    def fetch(self, feed, day):
        if not self.token:
            self.authenticate()
        method, _ = FEEDS[feed]
        data = self._post(f"{API_ROOT}/datacube/{method}?access_token={quote(self.token, safe='')}", {
            "begin_date": day.isoformat(), "end_date": day.isoformat(),
        })
        if data.get("is_delay") in (True, "true", "True"):
            raise WeChatError("data_delayed")
        if not isinstance(data.get("list"), list):
            raise WeChatError("missing_list")
        return data["list"]


def _nonnegative(value):
    if isinstance(value, bool) or not isinstance(value, int) or value < 0:
        raise WeChatError("invalid_metric")
    return value


def _observations(feed, day, rows):
    for row in rows:
        if not isinstance(row, dict) or row.get("ref_date") != day.isoformat():
            raise WeChatError("invalid_date")
    if feed in ("followers", "content") and len(rows) > 1:
        raise WeChatError("unexpected_multiple_rows")
    if feed == "followers":
        for row in rows:
            if "cumulate_user" in row:
                yield "followers", "关注总数", "人", _nonnegative(row["cumulate_user"]), "end_of_day_snapshot"
    elif feed == "follower_changes" and rows:
        # user_source=0 is one acquisition channel, not the total.
        for field, key, label in [("new_user", "new_followers", "新增关注",), ("cancel_user", "unfollowed", "取消关注",)]:
            if all(field in row for row in rows):
                yield key, label, "人", sum(_nonnegative(row[field]) for row in rows), "daily_total"
    elif feed == "content":
        fields = [
            ("read_user", "content_readers", "当日发表内容阅读人数", "人"),
            ("share_user", "content_sharers", "当日发表内容分享人数", "人"),
            ("like_user", "content_likes", "当日发表内容点赞人数", "人"),
            ("comment_count", "content_comments", "当日发表内容留言数", "条"),
            ("send_page_count", "content_published", "发表篇数", "篇"),
        ]
        for row in rows:
            detail = row.get("detail")
            if not isinstance(detail, dict):
                raise WeChatError("invalid_detail")
            for field, key, label, unit in fields:
                if field in detail:
                    yield key, label, unit, _nonnegative(detail[field]), "publication_cohort_snapshot"


def sync_range(api, start, end):
    """Upsert official observations. Partial feed failures remain visible and raise at end."""
    run_id = uuid.uuid4().hex
    failed = {}
    try:
        api.authenticate()
    except WeChatError as exc:
        for feed in FEEDS:
            status, _ = ConnectorStatus.objects.get_or_create(platform=PLATFORM, account_key=ACCOUNT_KEY, feed=feed, defaults={"state": "awaiting_authorization"})
            status.last_attempt_at = timezone.now()
            status.state = "sync_error"
            status.message = f"官方接口错误码：{exc.code}"
            status.save()
        raise
    for feed in FEEDS:
        status, _ = ConnectorStatus.objects.get_or_create(platform=PLATFORM, account_key=ACCOUNT_KEY, feed=feed, defaults={"state": "awaiting_authorization"})
        latest_success = status.data_through
        for offset in range((end - start).days + 1):
            day = start + timedelta(days=offset)
            if feed == "content" and day < date(2025, 11, 1):
                continue
            status.last_attempt_at = timezone.now()
            try:
                rows = api.fetch(feed, day)
                observations = list(_observations(feed, day, rows))
                _, doc_path = FEEDS[feed]
                fetched_at = timezone.now()
                for key, label, unit, value, semantics in observations:
                    Observation.objects.update_or_create(
                        platform=PLATFORM, account_key=ACCOUNT_KEY, subject_kind="account",
                        subject_id=ACCOUNT_ID, metric_key=key, stat_date=day,
                        source_provider="WeChat Official API",
                        defaults={
                            "metric_label": label, "unit": unit, "timezone": "Asia/Shanghai",
                            "value": value, "value_semantics": semantics,
                            "source_reference": DOC_ROOT + doc_path,
                            "fetched_at": fetched_at, "run_id": run_id,
                        },
                    )
                status.last_success_at = fetched_at
                latest_success = max(day, latest_success) if latest_success else day
                status.data_through = latest_success
                status.state = "connected"
                status.message = ""
            except WeChatError as exc:
                failed[feed] = exc.code
                status.state = "sync_error"
                status.message = f"官方接口错误码：{exc.code}"
                # Continue to check other feeds, but avoid repeated failed calls to this feed.
                break
            finally:
                status.save()
    if failed:
        raise WeChatError(", ".join(f"{feed}: {code}" for feed, code in failed.items()))
    return run_id
