#!/bin/bash
set -euo pipefail

# ── Naoii 数据库备份脚本 ──────────────────────
# 用法: ./scripts/backup.sh
# 建议 crontab: 0 3 * * * /home/ubuntu/naoii/scripts/backup.sh

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="$PROJECT_DIR/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/naoii_${TIMESTAMP}.sql.gz"

cd "$PROJECT_DIR"

mkdir -p "$BACKUP_DIR"

echo ">>> 备份数据库到 $BACKUP_FILE ..."
docker compose -f docker-compose.prod.yml exec -T db \
  pg_dump -U naoii -d naoii | gzip > "$BACKUP_FILE"

echo ">>> 清理 7 天前的备份..."
find "$BACKUP_DIR" -name "naoii_*.sql.gz" -mtime +7 -delete

echo ">>> 备份完成: $(du -h "$BACKUP_FILE" | cut -f1)"
