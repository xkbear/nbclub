#!/bin/bash
set -eu
umask 077

app_dir=$(cd "$(dirname "$0")/../.." && pwd)
env_file=${NEWBEE_STATS_ENV:-"$HOME/Library/Application Support/NewBeeSocialStats/report.env"}
if [[ ! -r "$env_file" ]]; then
  echo "缺少私有配置文件：$env_file" >&2
  exit 1
fi

set -a
source "$env_file"
set +a

# Reuse the Mac Mini's existing NewBee digest sender and Keychain entry.
digest_root=${NEWBEE_DIGEST_ROOT:-/Users/harryzheng/Workspace/NewBee_AI}
if [[ -r "$digest_root/scripts/digest/load-env.sh" ]]; then
  PROJECT_ROOT="$digest_root" source "$digest_root/scripts/digest/load-env.sh"
  export REPORT_FROM_EMAIL="${REPORT_FROM_EMAIL:-${DIGEST_FROM:-${SMTP_USER:-}}}"
  export REPORT_ALERT_EMAIL="${REPORT_ALERT_EMAIL:-${DIGEST_ALERT_EMAIL:-}}"
  export REPORT_SMTP_HOST="${REPORT_SMTP_HOST:-${SMTP_HOST:-}}"
  export REPORT_SMTP_PORT="${REPORT_SMTP_PORT:-${SMTP_PORT:-465}}"
  export REPORT_SMTP_USER="${REPORT_SMTP_USER:-${SMTP_USER:-}}"
  export REPORT_SMTP_PASSWORD="${REPORT_SMTP_PASSWORD:-${SMTP_PASS:-}}"
  export REPORT_SMTP_SSL="${REPORT_SMTP_SSL:-1}"
  export REPORT_SMTP_TLS="${REPORT_SMTP_TLS:-0}"
fi

if "$app_dir/.venv/bin/python" "$app_dir/manage.py" run_macmini_mail; then
  job_status=0
else
  job_status=$?
fi
"$app_dir/.venv/bin/python" "$app_dir/deploy/backup.py" >/dev/null
exit "$job_status"
