from django import template

register = template.Library()


@register.filter
def number(value):
    return "暂无数据" if value is None else f"{value:,}"
