import ipaddress
import os
from datetime import datetime
from urllib.request import ProxyHandler, build_opener
from zoneinfo import ZoneInfo

from django.core.mail import EmailMessage
from django.core.management import call_command
from django.core.management.base import BaseCommand, CommandError

from stats.models import ReportDelivery
from stats.reports import previous_week


def current_public_ipv4():
    opener = build_opener(ProxyHandler({}))
    for url in ("https://api.ipify.org", "https://checkip.amazonaws.com"):
        try:
            with opener.open(url, timeout=10) as response:
                address = response.read(64).decode("ascii").strip()
            return str(ipaddress.IPv4Address(address))
        except (OSError, ValueError, UnicodeError):
            continue
    raise CommandError("无法确认当前对外 IP，今天暂停取数。")


def alert_maintainer(message):
    recipient = os.environ.get("REPORT_ALERT_EMAIL", "").strip()
    sender = os.environ.get("REPORT_FROM_EMAIL", "").strip()
    if not recipient or not sender or not os.environ.get("REPORT_SMTP_HOST"):
        return False
    try:
        return EmailMessage("NewBee 公众号周报运行异常", message, sender, [recipient]).send(fail_silently=False) == 1
    except Exception:
        return False


class Command(BaseCommand):
    help = "Run daily Mac mini sync, then send the previous week's email once."

    def handle(self, *args, **options):
        approved = os.environ.get("WECHAT_ALLOWED_EGRESS_IPV4", "").strip()
        if not approved:
            raise CommandError("先把已加入公众号名单的对外 IP 配置到 WECHAT_ALLOWED_EGRESS_IPV4。")
        try:
            approved = str(ipaddress.IPv4Address(approved))
        except ValueError:
            raise CommandError("已配置的对外 IP 格式不正确。") from None
        try:
            current = current_public_ipv4()
        except CommandError:
            alert_maintainer("Mac mini 今天无法确认对外 IP，公众号取数已暂停；请检查网络和本机任务日志。")
            raise
        if current != approved:
            message = f"Mac mini 对外 IP 已从 {approved} 变为 {current}；公众号名单需更新，今天未取数。"
            alert_maintainer(message)
            raise CommandError(message)

        today = datetime.now(ZoneInfo("Asia/Shanghai")).date()
        _, week_end = previous_week(today)
        already_sent = ReportDelivery.objects.filter(report_kind="wechat_mp_weekly", period_end=week_end).exists()
        days = 7 if already_sent else 7 + today.weekday()
        try:
            call_command("sync_wechat", days=days)
            call_command("send_weekly_report", today=today)
        except CommandError as exc:
            alert_maintainer("Mac mini 公众号取数或周报发送失败。请检查本机任务日志；未发送虚构数据。")
            raise exc
