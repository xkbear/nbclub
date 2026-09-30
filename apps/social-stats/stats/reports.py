from datetime import timedelta

from .models import Observation
from .wechat import ACCOUNT_KEY, PLATFORM


def previous_week(today):
    start = today - timedelta(days=today.weekday() + 7)
    return start, start + timedelta(days=6)


def collect_weekly_report(week_start, week_end):
    observations = Observation.objects.filter(
        platform=PLATFORM,
        account_key=ACCOUNT_KEY,
        stat_date__gte=week_start - timedelta(days=1),
        stat_date__lte=week_end,
        metric_key__in=(
            "followers", "new_followers", "unfollowed", "content_readers",
            "content_published", "content_sharers", "content_likes", "content_comments",
        ),
    )
    values = {(item.metric_key, item.stat_date): item.value for item in observations}
    followers = values.get(("followers", week_end))
    opening = values.get(("followers", week_start - timedelta(days=1)))
    days = [week_start + timedelta(days=offset) for offset in range(7)]

    def weekly_total(key):
        daily = [values.get((key, day)) for day in days]
        return sum(daily) if all(value is not None for value in daily) else None

    new = weekly_total("new_followers")
    unfollowed = weekly_total("unfollowed")
    net = new - unfollowed if new is not None and unfollowed is not None else None
    net_from_snapshots = False
    if net is None and followers is not None:
        if opening is not None:
            net = followers - opening
            net_from_snapshots = True

    daily = []
    for day in days:
        total = values.get(("followers", day))
        prior = values.get(("followers", day - timedelta(days=1)))
        daily.append({
            "day": day,
            "followers": total,
            "net": total - prior if total is not None and prior is not None else None,
            "readers": values.get(("content_readers", day)),
            "published": values.get(("content_published", day)),
            "sharers": values.get(("content_sharers", day)),
            "likes": values.get(("content_likes", day)),
            "comments": values.get(("content_comments", day)),
        })
    with_readers = [row for row in daily if row["readers"] is not None]
    with_net = [row for row in daily if row["net"] is not None]
    return {
        "week_start": week_start, "week_end": week_end, "daily": daily,
        "followers": followers, "opening": opening, "new": new, "unfollowed": unfollowed,
        "net": net, "net_from_snapshots": net_from_snapshots,
        "growth_pct": net / opening * 100 if net is not None and opening else None,
        "published": weekly_total("content_published"),
        "reading_peak": max(with_readers, key=lambda row: row["readers"]) if with_readers else None,
        "net_peak": max(with_net, key=lambda row: row["net"]) if with_net else None,
        "follower_days": sum(row["followers"] is not None for row in daily),
        "content_days": len(with_readers),
        "change_days": sum(("new_followers", day) in values and ("unfollowed", day) in values for day in days),
    }


def format_weekly_report(week_start, week_end, report=None):
    report = report or collect_weekly_report(week_start, week_end)
    followers, new, unfollowed, net = (report[key] for key in ("followers", "new", "unfollowed", "net"))

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
    if report["net_from_snapshots"]:
        lines += ["本周净增关注按统计周开始前一天和结束当天的官方关注总数之差计算。"]
    if report["published"] is not None:
        lines += ["", f"本周发布篇数：{report['published']} 篇"]
    if report["reading_peak"]:
        peak = report["reading_peak"]
        lines += [f"发表内容概览阅读峰值：{peak['day']:%m.%d}，{peak['readers']:,} 人"]
    lines += ["", "视频号：等待官方授权接口，目前没有自动数据。", "来源：微信公众号官方数据接口；日期按北京时间。"]
    return subject, "\n".join(lines), followers is not None
