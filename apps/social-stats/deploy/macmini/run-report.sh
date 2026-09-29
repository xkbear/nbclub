#!/bin/zsh
set -eu
umask 077

app_dir=$(cd "$(dirname "$0")/../.." && pwd)
env_file=${NEWBEE_STATS_ENV:-"$HOME/Library/Application Support/NewBeeSocialStats/report.env"}
if [[ ! -r "$env_file" ]]; then
  print -u2 "缺少私有配置文件：$env_file"
  exit 1
fi

set -a
source "$env_file"
set +a
if "$app_dir/.venv/bin/python" "$app_dir/manage.py" run_macmini_mail; then
  job_status=0
else
  job_status=$?
fi
"$app_dir/.venv/bin/python" "$app_dir/deploy/backup.py" >/dev/null
exit "$job_status"
