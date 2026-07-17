#!/bin/bash
set -euo pipefail

# ── Naoii 部署 / 更新脚本（镜像由 GitHub Actions 预构建）──
# 用法: ./scripts/deploy.sh

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

echo ">>> 拉取最新代码..."
git pull origin main

echo ">>> 拉取最新 Docker 镜像..."
docker compose -f docker-compose.prod.yml pull app

echo ">>> 重启容器..."
docker compose -f docker-compose.prod.yml up -d --remove-orphans

echo ">>> 等待数据库就绪..."
sleep 5

echo ">>> 执行数据库迁移..."
docker compose -f docker-compose.prod.yml exec -T app npx prisma migrate deploy

echo ">>> 健康检查..."
sleep 3
curl -fsS http://localhost:3000/api/health && echo "  ✓ OK" || echo "  ⚠ 健康检查失败，请检查日志"

echo ">>> 部署完成!"
