from django.db import models


class Observation(models.Model):
    platform = models.CharField(max_length=32)
    account_key = models.CharField(max_length=64)
    subject_kind = models.CharField(max_length=16, default="account")
    subject_id = models.CharField(max_length=128)
    metric_key = models.CharField(max_length=64)
    metric_label = models.CharField(max_length=80)
    unit = models.CharField(max_length=16)
    stat_date = models.DateField()
    timezone = models.CharField(max_length=40, default="Asia/Shanghai")
    value = models.PositiveBigIntegerField()
    value_semantics = models.CharField(max_length=32)
    source_provider = models.CharField(max_length=64)
    source_reference = models.URLField(max_length=500)
    fetched_at = models.DateTimeField()
    run_id = models.CharField(max_length=64)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["platform", "account_key", "subject_kind", "subject_id", "metric_key", "stat_date", "source_provider"], name="unique_social_observation")]
        indexes = [models.Index(fields=["platform", "metric_key", "stat_date"])]


class ConnectorStatus(models.Model):
    platform = models.CharField(max_length=32)
    account_key = models.CharField(max_length=64)
    feed = models.CharField(max_length=64)
    state = models.CharField(max_length=32)
    last_attempt_at = models.DateTimeField(null=True, blank=True)
    last_success_at = models.DateTimeField(null=True, blank=True)
    data_through = models.DateField(null=True, blank=True)
    message = models.CharField(max_length=240, blank=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["platform", "account_key", "feed"], name="unique_social_connector")]


class ReportDelivery(models.Model):
    report_kind = models.CharField(max_length=40)
    period_end = models.DateField()
    sent_at = models.DateTimeField()

    class Meta:
        constraints = [models.UniqueConstraint(fields=["report_kind", "period_end"], name="unique_social_report_delivery")]
