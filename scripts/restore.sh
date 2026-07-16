#!/bin/bash
set -euo pipefail

# ── Naoii 数据库恢复脚本 ──────────────────────
# 用法: ./scripts/restore.sh backups/naoii_20260716_030000.sql.gz

if [ $# -ne 1 ]; then
    echo "用法: $0 <备份文件路径>"
    echo "示例: $0 backups/naoii_20260716_030000.sql.gz"
    exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "错误: 文件 $BACKUP_FILE 不存在"
    exit 1
fi

echo "!!! 警告: 这将覆盖当前数据库 !!!"
echo "备份文件: $BACKUP_FILE"
read -p "确认恢复? 输入 'yes' 继续: " confirm
if [ "$confirm" != "yes" ]; then
    echo "已取消"
    exit 0
fi

echo ">>> 停止应用..."
docker compose -f docker-compose.prod.yml stop app

echo ">>> 恢复数据库..."
gunzip -c "$BACKUP_FILE" | docker compose -f docker-compose.prod.yml exec -T db \
  psql -U naoii -d naoii

echo ">>> 启动应用..."
docker compose -f docker-compose.prod.yml start app

echo ">>> 恢复完成!"
