import os
from datetime import date, datetime
from zoneinfo import ZoneInfo

from django.core.mail import EmailMessage
from django.core.management.base import BaseCommand, CommandError
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.utils import timezone

from stats.models import ReportDelivery
from stats.reports import format_weekly_report, previous_week


class Command(BaseCommand):
    help = "Email the previous complete Beijing week of official account followers."

    def add_arguments(self, parser):
        parser.add_argument("--today", type=date.fromisoformat, help="Override Beijing today (YYYY-MM-DD)")
        parser.add_argument("--dry-run", action="store_true", help="Show report without sending email")

    def handle(self, *args, **options):
        today = options["today"] or datetime.now(ZoneInfo("Asia/Shanghai")).date()
        week_start, week_end = previous_week(today)
        subject, body, has_followers = format_weekly_report(week_start, week_end)
        if options["dry_run"]:
            self.stdout.write(subject + "\n\n" + body)
            return
        if ReportDelivery.objects.filter(report_kind="wechat_mp_weekly", period_end=week_end).exists():
            self.stdout.write("本周邮件已发送，跳过。")
            return
        if not has_followers:
            raise CommandError("上周末关注总数尚未取得，暂不发送周报。")

        sender = os.environ.get("REPORT_FROM_EMAIL", "").strip()
        recipients = [item.strip() for item in os.environ.get("REPORT_RECIPIENTS", "").split(",") if item.strip()]
        if not sender or not recipients or not os.environ.get("REPORT_SMTP_HOST"):
            raise CommandError("需要配置发件邮箱、收件邮箱和 SMTP 主机。")
        try:
            for address in (sender, *recipients):
                validate_email(address)
        except ValidationError:
            raise CommandError("发件邮箱或收件邮箱格式不正确。") from None
        try:
            sent = EmailMessage(subject, body, sender, recipients).send(fail_silently=False)
        except Exception as exc:
            # Do not include provider exception text: it can contain credentials.
            raise CommandError(f"邮件发送失败：{type(exc).__name__}") from None
        if sent != 1:
            raise CommandError("邮件服务未确认发送。")
        ReportDelivery.objects.create(report_kind="wechat_mp_weekly", period_end=week_end, sent_at=timezone.now())
        self.stdout.write(self.style.SUCCESS(f"已发送公众号周报：{week_start} 至 {week_end}；收件人 {len(recipients)} 位。"))
