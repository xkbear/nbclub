from datetime import date
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.core.management.base import CommandError
from django.test import TestCase
from django.urls import reverse

from .models import ConnectorStatus, Observation
from .wechat import WeChatError, _observations, sync_range


class FixtureAPI:
    def __init__(self, delayed=False):
        self.delayed = delayed

    def authenticate(self):
        pass

    def fetch(self, feed, day):
        if self.delayed and feed == "content":
            raise WeChatError("data_delayed")
        stamp = day.isoformat()
        if feed == "followers":
            return [{"ref_date": stamp, "cumulate_user": 1200}]
        if feed == "follower_changes":
            return [
                {"ref_date": stamp, "user_source": 0, "new_user": 2, "cancel_user": 1},
                {"ref_date": stamp, "user_source": 17, "new_user": 5, "cancel_user": 0},
            ]
        return [{"ref_date": stamp, "detail": {"read_user": 87, "share_user": 3, "send_page_count": 1}}]


class ConnectorTests(TestCase):
    def test_official_rows_are_mapped_without_treating_source_zero_as_total(self):
        day = date(2026, 9, 27)
        sync_range(FixtureAPI(), day, day)
        values = dict(Observation.objects.values_list("metric_key", "value"))
        self.assertEqual(values["followers"], 1200)
        self.assertEqual(values["new_followers"], 7)
        self.assertEqual(values["unfollowed"], 1)
        self.assertEqual(values["content_readers"], 87)
        self.assertEqual(Observation.objects.get(metric_key="content_readers").value_semantics, "publication_cohort_snapshot")
        sync_range(FixtureAPI(), day, day)
        self.assertEqual(Observation.objects.count(), 6)

    def test_empty_source_does_not_create_zero_and_delay_is_visible(self):
        day = date(2026, 9, 27)
        self.assertEqual(list(_observations("follower_changes", day, [])), [])
        with self.assertRaises(WeChatError):
            sync_range(FixtureAPI(delayed=True), day, day)
        self.assertFalse(Observation.objects.filter(metric_key="content_readers").exists())
        self.assertEqual(ConnectorStatus.objects.get(feed="content").state, "sync_error")

    def test_bad_credentials_are_tried_once_and_all_feeds_show_error(self):
        class RejectedAPI:
            attempts = 0

            def authenticate(self):
                self.attempts += 1
                raise WeChatError(40164)

        api = RejectedAPI()
        with self.assertRaises(WeChatError):
            sync_range(api, date(2026, 9, 27), date(2026, 9, 27))
        self.assertEqual(api.attempts, 1)
        self.assertEqual(ConnectorStatus.objects.filter(state="sync_error").count(), 3)

    def test_wrong_appid_is_rejected_before_any_api_call(self):
        with patch.dict("os.environ", {"WECHAT_APP_ID": "other-account", "WECHAT_APP_SECRET": "local-test-secret"}):
            with self.assertRaises(CommandError):
                call_command("sync_wechat", date=date(2026, 9, 27))

    def test_dashboard_requires_login_and_never_exposes_credentials(self):
        anonymous = self.client.get(reverse("dashboard"))
        self.assertEqual(anonymous.status_code, 302)
        self.assertIn("/login/", anonymous["Location"])
        user = get_user_model().objects.create_user("harry", password="SafePassword-98271")
        self.client.force_login(user)
        response = self.client.get(reverse("dashboard"))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "暂无数据")
        self.assertContains(response, "等待官方接口")
        self.assertEqual(response["X-Robots-Tag"], "noindex, nofollow, noarchive")
