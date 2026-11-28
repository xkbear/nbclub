import os
from datetime import date, timedelta
from zoneinfo import ZoneInfo

from django.core.management.base import BaseCommand, CommandError

from stats.wechat import ACCOUNT_ID, WeChatAPI, WeChatError, sync_range


class Command(BaseCommand):
    help = "Read official WeChat analytics for completed China dates only."

    def add_arguments(self, parser):
        parser.add_argument("--days", type=int, default=7, help="Completed dates to refresh (1–30)")
        parser.add_argument("--date", type=date.fromisoformat, help="Only one completed YYYY-MM-DD date")

    def handle(self, *args, **options):
        from datetime import datetime
        yesterday = datetime.now(ZoneInfo("Asia/Shanghai")).date() - timedelta(days=1)
        days = options["days"]
        if not 1 <= days <= 30:
            raise CommandError("--days must be between 1 and 30")
        end = options["date"] or yesterday
        if end > yesterday:
            raise CommandError("Only completed China dates can be synced")
        start = end if options["date"] else end - timedelta(days=days - 1)
        appid = os.environ.get("WECHAT_APP_ID")
        secret = os.environ.get("WECHAT_APP_SECRET")
        if not appid or not secret:
            raise CommandError("WECHAT_APP_ID and WECHAT_APP_SECRET must be configured on the server")
        if appid != ACCOUNT_ID:
            raise CommandError("Configured AppID does not match the verified NewBee service account")
        try:
            run_id = sync_range(WeChatAPI(appid, secret), start, end)
        except WeChatError as exc:
            raise CommandError(str(exc)) from None
        self.stdout.write(self.style.SUCCESS(f"同步完成：{start} 至 {end}；批次 {run_id}"))
