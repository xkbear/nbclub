from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

from django.contrib.auth.decorators import login_required
from django.views.decorators.cache import never_cache
from django.shortcuts import render

from .models import ConnectorStatus, Observation

METRICS = [
    ("followers", "关注总数", "人", "followers"),
    ("new_followers", "新增关注", "人", "follower_changes"),
    ("unfollowed", "取消关注", "人", "follower_changes"),
    ("content_readers", "当日发表内容阅读人数", "人", "content"),
    ("content_sharers", "当日发表内容分享人数", "人", "content"),
    ("content_likes", "当日发表内容点赞人数", "人", "content"),
    ("content_comments", "当日发表内容留言数", "条", "content"),
    ("content_published", "发表篇数", "篇", "content"),
]


@never_cache
@login_required
def dashboard(request):
    today = datetime.now(ZoneInfo("Asia/Shanghai")).date()
    yesterday = today - timedelta(days=1)
    observations = list(Observation.objects.filter(platform="wechat_mp", stat_date__lte=yesterday, stat_date__gte=yesterday - timedelta(days=45)).order_by("-stat_date"))
    by_key = {}
    for observation in observations:
        by_key.setdefault(observation.metric_key, []).append(observation)
    statuses = {s.feed: s for s in ConnectorStatus.objects.filter(platform="wechat_mp")}
    cards = []
    for key, label, unit, feed in METRICS:
        latest = by_key.get(key, [None])[0]
        status = statuses.get(feed)
        cards.append({
            "key": key, "label": label, "unit": unit, "latest": latest, "status": status,
            "stale": bool(latest and latest.stat_date < yesterday),
        })

    days = [yesterday - timedelta(days=offset) for offset in range(13, -1, -1)]
    daily = {key: {o.stat_date: o.value for o in by_key.get(key, [])} for key, _, _, _ in METRICS}
    new_peak = max(daily["new_followers"].values(), default=0) or 1
    reader_peak = max(daily["content_readers"].values(), default=0) or 1
    chart = [{
        "date": day, "new": daily["new_followers"].get(day), "readers": daily["content_readers"].get(day),
        "new_height": max(3, round(daily["new_followers"][day] / new_peak * 100)) if daily["new_followers"].get(day) else 0,
        "reader_height": max(3, round(daily["content_readers"][day] / reader_peak * 100)) if daily["content_readers"].get(day) else 0,
    } for day in days]

    week_days = [yesterday - timedelta(days=n) for n in range(7)]
    week = {}
    for key in ("new_followers", "unfollowed", "content_readers", "content_sharers"):
        values = [daily[key].get(day) for day in week_days]
        week[key] = sum(values) if all(value is not None for value in values) else None
    week["net"] = week["new_followers"] - week["unfollowed"] if week["new_followers"] is not None and week["unfollowed"] is not None else None

    response = render(request, "stats/dashboard.html", {
        "cards": cards, "statuses": statuses, "chart": chart, "week": week,
        "week_start": week_days[-1], "week_end": yesterday, "yesterday": yesterday,
        "has_chart_data": any(item["new"] is not None or item["readers"] is not None for item in chart),
    })
    response["X-Robots-Tag"] = "noindex, nofollow, noarchive"
    return response
