from datetime import date, timedelta
from io import StringIO
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.core.management.base import CommandError
from django.core import mail
from django.test import TestCase, override_settings
from django.urls import reverse
from django.utils import timezone

from .models import ConnectorStatus, Observation, ReportDelivery
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

    def test_dashboard_requires_shared_password_and_never_exposes_credentials(self):
        anonymous = self.client.get(reverse("dashboard"))
        self.assertEqual(anonymous.status_code, 302)
        self.assertIn("/login/", anonymous["Location"])
        get_user_model().objects.create_user("viewer", password="SafePassword-98271")
        admin = get_user_model().objects.create_superuser("admin", password="AdminPassword-98271")
        login_page = self.client.get(reverse("login"))
        self.assertNotContains(login_page, 'name="username"')
        self.assertEqual(self.client.post(reverse("login"), {"password": "wrong"}).status_code, 200)
        self.assertEqual(self.client.post(reverse("login"), {"username": "admin", "password": "AdminPassword-98271"}).status_code, 200)
        self.client.force_login(admin)
        self.assertEqual(self.client.get(reverse("dashboard")).status_code, 302)
        self.client.logout()
        self.assertEqual(self.client.post(reverse("login"), {"password": "SafePassword-98271"}).status_code, 302)
        response = self.client.get(reverse("dashboard"))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "暂无数据")
        self.assertContains(response, "尚无统计数据")
        self.assertContains(response, "等待官方接口")
        self.assertEqual(response["X-Robots-Tag"], "noindex, nofollow, noarchive")


@override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
class WeeklyEmailTests(TestCase):
    def add_observation(self, key, day, value):
        Observation.objects.create(
            platform="wechat_mp", account_key="newbee_wechat_mp", subject_kind="account",
            subject_id="wx8245fdb4104c1756", metric_key=key, metric_label=key,
            unit="人", stat_date=day, timezone="Asia/Shanghai", value=value,
            value_semantics="daily_total", source_provider="WeChat Official API",
            source_reference="https://developers.weixin.qq.com/doc/service/api/wedata/user/api_getusersummary",
            fetched_at=timezone.now(), run_id="test-weekly-mail",
        )

    def test_sends_one_weekly_email_with_official_totals_and_no_duplicates(self):
        monday = date(2026, 9, 21)
        for offset in range(7):
            day = monday + timedelta(days=offset)
            self.add_observation("new_followers", day, 2)
            self.add_observation("unfollowed", day, 1)
        self.add_observation("followers", date(2026, 9, 27), 1200)
        with patch.dict("os.environ", {
            "REPORT_FROM_EMAIL": "office@example.com", "REPORT_RECIPIENTS": "a@example.com,b@example.com",
            "REPORT_SMTP_HOST": "smtp.example.com",
        }):
            call_command("send_weekly_report", today=date(2026, 9, 28), stdout=StringIO())
            call_command("send_weekly_report", today=date(2026, 9, 28), stdout=StringIO())
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, ["a@example.com", "b@example.com"])
        self.assertIn("周末关注总数：1,200 人", mail.outbox[0].body)
        self.assertIn("本周净增关注：7 人", mail.outbox[0].body)
        self.assertEqual(ReportDelivery.objects.count(), 1)

    def test_missing_data_does_not_send_or_invent_zero(self):
        with patch.dict("os.environ", {
            "REPORT_FROM_EMAIL": "office@example.com", "REPORT_RECIPIENTS": "a@example.com",
            "REPORT_SMTP_HOST": "smtp.example.com",
        }):
            with self.assertRaises(CommandError):
                call_command("send_weekly_report", today=date(2026, 9, 28), stdout=StringIO())
        self.assertEqual(len(mail.outbox), 0)
        self.assertEqual(ReportDelivery.objects.count(), 0)
        output = StringIO()
        call_command("send_weekly_report", today=date(2026, 9, 28), dry_run=True, stdout=output)
        self.assertIn("暂无数据", output.getvalue())
        self.assertNotIn("本周净增关注：0 人", output.getvalue())

    def test_net_change_uses_official_end_of_week_snapshots_when_daily_changes_missing(self):
        self.add_observation("followers", date(2026, 9, 20), 102)
        self.add_observation("followers", date(2026, 9, 27), 124)
        output = StringIO()
        call_command("send_weekly_report", today=date(2026, 9, 28), dry_run=True, stdout=output)
        self.assertIn("本周净增关注：22 人", output.getvalue())
        self.assertIn("本周新增关注：暂无数据", output.getvalue())
        self.assertIn("官方关注总数之差", output.getvalue())

    def test_changed_ip_stops_before_wechat_sync(self):
        with patch.dict("os.environ", {"WECHAT_ALLOWED_EGRESS_IPV4": "192.0.2.10"}):
            with patch("stats.management.commands.run_macmini_mail.current_public_ipv4", return_value="192.0.2.11"):
                with patch("stats.management.commands.run_macmini_mail.call_command") as nested:
                    with self.assertRaises(CommandError):
                        call_command("run_macmini_mail", stdout=StringIO())
                    nested.assert_not_called()

    def test_first_period_guard_only_syncs_before_agreed_first_report(self):
        with patch.dict("os.environ", {
            "WECHAT_ALLOWED_EGRESS_IPV4": "192.0.2.10",
            "REPORT_FIRST_PERIOD_END": "2100-01-01",
        }):
            with patch("stats.management.commands.run_macmini_mail.current_public_ipv4", return_value="192.0.2.10"):
                with patch("stats.management.commands.run_macmini_mail.call_command") as nested:
                    call_command("run_macmini_mail", stdout=StringIO())
        nested.assert_called_once_with("sync_wechat", days=7)
