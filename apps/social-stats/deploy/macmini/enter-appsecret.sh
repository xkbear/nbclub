#!/bin/bash
set -euo pipefail

app_dir=$(cd "$(dirname "$0")/../.." && pwd)
osascript \
  -e 'set answer to display dialog "把公众号后台新显示的 AppSecret 粘贴到这里。只保存在这台 Mac Mini，不会发到聊天。" default answer "" buttons {"取消", "保存到本机"} default button "保存到本机" with hidden answer' \
  -e 'return text returned of answer' \
  | "$app_dir/.venv/bin/python" "$app_dir/deploy/macmini/store_appsecret.py"
