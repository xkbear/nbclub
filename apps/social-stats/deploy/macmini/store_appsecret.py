"""Store a pasted WeChat AppSecret locally without printing it."""

import os
import shlex
import sys
import tempfile
from pathlib import Path


def main():
    path = Path(os.environ.get(
        "NEWBEE_STATS_ENV",
        str(Path.home() / "Library/Application Support/NewBeeSocialStats/report.env"),
    ))
    secret = sys.stdin.readline().rstrip("\r\n")
    if not 16 <= len(secret) <= 128 or any(not 33 <= ord(char) <= 126 for char in secret):
        raise SystemExit("输入无效：密钥应是一串不带空格的字符，未保存。")
    if path.is_symlink() or not path.is_file():
        raise SystemExit("本机私有配置文件不存在或不是普通文件，未保存。")
    content = path.read_text()
    if content.count("WECHAT_APP_SECRET=") != 1:
        raise SystemExit("本机密钥配置项数量异常，未保存。")
    lines = content.splitlines(keepends=True)
    lines = [
        "WECHAT_APP_SECRET=" + shlex.quote(secret) + "\n"
        if line.startswith("WECHAT_APP_SECRET=") else line
        for line in lines
    ]
    fd, tmp_name = tempfile.mkstemp(prefix=".report-env-", dir=path.parent)
    try:
        os.fchmod(fd, 0o600)
        with os.fdopen(fd, "w") as output:
            output.writelines(lines)
        os.replace(tmp_name, path)
    finally:
        if os.path.exists(tmp_name):
            os.unlink(tmp_name)
    print("密钥已保存在 Mac Mini 本机私有配置中。")


if __name__ == "__main__":
    main()
