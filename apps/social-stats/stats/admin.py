from django.contrib import admin
from .models import ConnectorStatus, Observation


@admin.register(Observation)
class ObservationAdmin(admin.ModelAdmin):
    list_display = ("platform", "metric_label", "stat_date", "value", "source_provider", "fetched_at")
    list_filter = ("platform", "metric_key")
    search_fields = ("account_key", "subject_id")
    readonly_fields = tuple(field.name for field in Observation._meta.fields)
    def has_add_permission(self, request):
        return False
    def has_change_permission(self, request, obj=None):
        return False
    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(ConnectorStatus)
class ConnectorStatusAdmin(admin.ModelAdmin):
    list_display = ("platform", "feed", "state", "data_through", "last_success_at")
    readonly_fields = tuple(field.name for field in ConnectorStatus._meta.fields)
    def has_add_permission(self, request):
        return False
    def has_change_permission(self, request, obj=None):
        return False
    def has_delete_permission(self, request, obj=None):
        return False
