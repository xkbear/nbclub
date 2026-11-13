"""Responsive weekly report with local PNG charts and inline email assets."""

from dataclasses import dataclass
from email.mime.image import MIMEImage
from email.utils import formataddr
from io import BytesIO
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
from matplotlib.backends.backend_agg import FigureCanvasAgg
from matplotlib.figure import Figure
from matplotlib.ticker import MaxNLocator

from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string

from .reports import format_weekly_report

ACCENT = "#C85A2E"
MUTED = "#6B6B62"


@dataclass(frozen=True)
class InlineAsset:
    cid: str
    filename: str
    content: bytes


def _chart(rows, key, bars=False):
    available = [row[key] for row in rows if row[key] is not None]
    if not available:
        return None
    figure = Figure(figsize=(8, 3.1), dpi=150, facecolor="white")
    FigureCanvasAgg(figure)
    axis = figure.add_subplot(111)
    figure.subplots_adjust(left=0.075, right=0.97, bottom=0.20, top=0.91)
    positions = list(range(len(rows)))
    values = [row[key] if row[key] is not None else float("nan") for row in rows]
    axis.set_xticks(positions, [row["day"].strftime("%m/%d") for row in rows], fontsize=15)
    axis.tick_params(axis="both", length=0, labelcolor=MUTED, pad=9)
    axis.tick_params(axis="y", labelsize=14)
    axis.yaxis.set_major_locator(MaxNLocator(nbins=4, integer=True))
    for spine in axis.spines.values():
        spine.set_visible(False)
    axis.set_axisbelow(True)
    axis.grid(axis="y", color="#E8E7E0", linewidth=0.7)
    axis.set_xlim(-0.45, len(rows) - 0.55)
    if bars:
        maximum = max(available)
        axis.set_ylim(0, max(4, maximum * 1.24))
        axis.axhline(0, color="#E8E7E0", linewidth=0.8)
        for position, row in zip(positions, rows):
            value = row[key]
            if value is None:
                axis.annotate("—", (position, 0), xytext=(0, 8), textcoords="offset points", ha="center", fontsize=16, color=MUTED)
                continue
            axis.bar(position, value, width=0.50, color=ACCENT if value == maximum and maximum > 0 else "#B7B5AB", zorder=3)
            axis.annotate(f"{value:,}", (position, value), xytext=(0, 9), textcoords="offset points", ha="center", fontsize=17, color="#363B36", fontweight="bold" if value == maximum else "normal")
    else:
        spread = max(available) - min(available)
        padding = max(3, spread * 0.35)
        axis.set_ylim(max(0, min(available) - padding), max(available) + padding)
        # NaN values break the line: no interpolation across missing dates.
        axis.plot(positions, values, color=ACCENT, linewidth=2.6, marker="o", markersize=7, markerfacecolor="white", markeredgewidth=2, zorder=3)
        for position, row in zip(positions, rows):
            value = row[key]
            if value is not None and (position == 0 or position == len(rows) - 1 or value != rows[position - 1][key]):
                axis.annotate(f"{value:,}", (position, value), xytext=(0, 12), textcoords="offset points", ha="center", fontsize=17, color="#363B36")
    output = BytesIO()
    figure.savefig(output, format="png", dpi=150, facecolor="white")
    return output.getvalue()


def _number(value, signed=False):
    if value is None:
        return "—"
    return f"{value:+,}" if signed else f"{value:,}"


def render_weekly_email(report):
    logo = Path(__file__).resolve().parent / "static/stats/newbee-logo.png"
    assets = [InlineAsset("newbee-logo", "newbee-logo.png", logo.read_bytes())]
    context = dict(report)
    for key, cid, filename, bars in (
        ("followers", "followers-trend", "followers-trend.png", False),
        ("readers", "reading-trend", "reading-trend.png", True),
    ):
        chart = _chart(report["daily"], key, bars=bars)
        context[f"has_{key}_chart"] = chart is not None
        context[f"{key}_alt"] = "；".join(f"{row['day']:%m月%d日}：{_number(row[key])}" for row in report["daily"])
        if chart:
            assets.append(InlineAsset(cid, filename, chart))
    context.update({
        "followers_display": _number(report["followers"]),
        "opening_display": _number(report["opening"]),
        "net_display": _number(report["net"], signed=True),
        "net_color": "#216A51" if report["net"] is not None and report["net"] >= 0 else "#B34734",
        "growth_display": f"{report['growth_pct']:+.1f}%" if report["growth_pct"] is not None else None,
        "published_display": _number(report["published"]),
        "new_display": _number(report["new"]),
        "unfollowed_display": _number(report["unfollowed"]),
        "net_peak_display": _number(report["net_peak"]["net"], signed=True) if report["net_peak"] else None,
    })
    return render_to_string("stats/weekly_email.html", context), assets


def build_weekly_message(report, sender, recipients, test=False):
    subject, text, _ = format_weekly_report(report["week_start"], report["week_end"], report=report)
    html, assets = render_weekly_email(report)
    if test:
        subject = "【测试·图表版】" + subject
        text = "这是仅发给指定收件人的测试预览，不计入正式周报发送记录。\n\n" + text
    message = EmailMultiAlternatives(subject, text, formataddr(("NewBee AI Club", sender)), recipients)
    message.mixed_subtype = "related"
    message.attach_alternative(html, "text/html")
    for asset in assets:
        image = MIMEImage(asset.content, _subtype="png")
        image.add_header("Content-ID", f"<{asset.cid}>")
        image.add_header("Content-Disposition", "inline", filename=asset.filename)
        message.attach(image)
    return message


def write_weekly_preview(report, directory):
    directory = Path(directory)
    directory.mkdir(parents=True, exist_ok=True)
    html, assets = render_weekly_email(report)
    for asset in assets:
        (directory / asset.filename).write_bytes(asset.content)
        html = html.replace(f"cid:{asset.cid}", asset.filename)
    (directory / "index.html").write_text(html, encoding="utf-8")
    _, text, _ = format_weekly_report(report["week_start"], report["week_end"], report=report)
    (directory / "report.txt").write_text(text, encoding="utf-8")
    return directory / "index.html"
