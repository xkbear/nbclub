from datetime import timedelta

from .models import Observation
from .wechat import ACCOUNT_KEY, PLATFORM


def previous_week(today):
    start = today - timedelta(days=today.weekday() + 7)
    return start, start + timedelta(days=6)


def format_weekly_report(week_start, week_end):
    observations = Observation.objects.filter(
        platform=PLATFORM,
        account_key=ACCOUNT_KEY,
        stat_date__gte=week_start,
        stat_date__lte=week_end,
        metric_key__in=("followers", "new_followers", "unfollowed"),
    )
    values = {(item.metric_key, item.stat_date): item.value for item in observations}
    followers = values.get(("followers", week_end))
    days = [week_start + timedelta(days=offset) for offset in range(7)]

    def weekly_total(key):
        daily = [values.get((key, day)) for day in days]
        return sum(daily) if all(value is not None for value in daily) else None

    new = weekly_total("new_followers")
    unfollowed = weekly_total("unfollowed")
    net = new - unfollowed if new is not None and unfollowed is not None else None

    def shown(value):
        return f"{value:,} 人" if value is not None else "暂无数据"

    subject = f"先蜂 AI 俱乐部｜公众号周报 {week_start:%m.%d}–{week_end:%m.%d}"
    lines = [
        f"公众号周报｜{week_start:%Y.%m.%d}–{week_end:%Y.%m.%d}",
        "账号：先蜂 AI 俱乐部",
        "",
        f"周末关注总数：{shown(followers)}",
        f"本周新增关注：{shown(new)}",
        f"本周取消关注：{shown(unfollowed)}",
        f"本周净增关注：{shown(net)}",
    ]
    if any(value is None for value in (followers, new, unfollowed)):
        lines += ["", "部分日期的官方数据尚未取得；“暂无数据”不代表 0。"]
    lines += ["", "视频号：等待官方授权接口，目前没有自动数据。", "来源：微信公众号官方数据接口；日期按北京时间。"]
    return subject, "\n".join(lines), followers is not None
