#!/bin/bash
set -euo pipefail

# ── Naoii 部署 / 更新脚本（镜像由 GitHub Actions 预构建）──
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

COMPOSE="docker compose -f docker-compose.prod.yml --env-file .env.production"

echo ">>> 拉取最新代码..."
git pull origin main

echo ">>> 拉取最新 Docker 镜像..."
$COMPOSE pull app

echo ">>> 重启容器..."
$COMPOSE up -d --remove-orphans

echo ">>> 等待数据库就绪..."
sleep 5

echo ">>> 执行数据库迁移..."
$COMPOSE exec -T app npx prisma migrate deploy

echo ">>> 健康检查..."
sleep 3
$COMPOSE exec -T app node -e "fetch('http://localhost:3000/api/health').then(r=>r.json()).then(d=>{console.log('  ✓',JSON.stringify(d));process.exit(0)}).catch(e=>{console.log('  ⚠ 失败');process.exit(1)})"

echo ">>> 部署完成!"
