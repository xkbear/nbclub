"""Create a consistent local SQLite snapshot. Off-host copy must be configured separately."""
import os
import sqlite3
import subprocess
from datetime import datetime, timedelta, timezone
from pathlib import Path

source = Path(os.environ["DASHBOARD_DB_PATH"])
backup_dir = Path(os.environ.get("DASHBOARD_BACKUP_DIR", "/var/lib/newbee-social-stats/backups"))
backup_dir.mkdir(parents=True, exist_ok=True, mode=0o700)
destination = backup_dir / f"db-{datetime.now(timezone.utc):%Y%m%dT%H%M%SZ}.sqlite3"
with sqlite3.connect(source) as live, sqlite3.connect(destination) as snapshot:
    live.backup(snapshot)
destination.chmod(0o600)
bucket = os.environ.get("OCI_BACKUP_BUCKET")
if bucket:
    subprocess.run([
        os.environ.get("OCI_CLI", "oci"), "os", "object", "put", "--auth", "instance_principal",
        "--bucket-name", bucket, "--name", f"newbee-stats/{destination.name}",
        "--file", str(destination), "--verify-checksum", "--output", "json",
    ], check=True, stdout=subprocess.DEVNULL)
cutoff = datetime.now(timezone.utc) - timedelta(days=30)
for old in backup_dir.glob("db-*.sqlite3"):
    if datetime.fromtimestamp(old.stat().st_mtime, timezone.utc) < cutoff:
        old.unlink()
print(destination)
