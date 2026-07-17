# Naoii 生产部署指南

## 架构

```
开发者 git push → GitHub Actions → ghcr.io/skylar-deepmind/naoii:latest
                                            │
服务器 ./scripts/deploy.sh                   │
  → git pull                                 │
  → docker compose pull app  ←───────────────┘
  → docker compose up -d
  → npx prisma migrate deploy
```

**镜像在 GitHub Actions 上构建**（7GB RAM runner），服务器只负责拉取和运行，不需要在服务器上做 `docker build`。

---

## 一、从全新 Ubuntu 24.04 开始部署

### 1. 登录服务器

```bash
ssh root@47.89.212.88
```

### 2. 安装 Docker

```bash
curl -fsSL https://get.docker.com | sh
usermod -aG docker ubuntu
# 退出重新登录
```

### 3. 克隆项目（如果还没有）

```bash
su - ubuntu
git clone https://github.com/skylar-deepmind/Naoii.git ~/naoii
cd ~/naoii
```

### 4. 创建生产环境变量

```bash
DB_PASSWORD=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 32)

cat > .env.production << EOF
POSTGRES_USER=naoii
POSTGRES_PASSWORD=${DB_PASSWORD}
POSTGRES_DB=naoii
DATABASE_URL=postgresql://naoii:${DB_PASSWORD}@db:5432/naoii
JWT_SECRET=${JWT_SECRET}
EOF

chmod 600 .env.production
```

### 5. 登录 GitHub Container Registry

```bash
# 在 GitHub 上创建 Personal Access Token (classic), 勾选 read:packages
echo "你的PAT" | docker login ghcr.io -u skylar-deepmind --password-stdin
```

### 6. 拉取镜像并启动

```bash
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

### 7. 运行数据库迁移

```bash
docker compose -f docker-compose.prod.yml exec app npx prisma migrate deploy
```

### 8. 初始化种子数据（仅首次）

```bash
docker compose -f docker-compose.prod.yml exec app npx tsx prisma/seed.ts
```

### 9. 验证

```bash
docker compose -f docker-compose.prod.yml ps
curl http://localhost:3000/api/health
```

---

## 二、GitHub Actions 自动构建

推送代码到 `main` 分支后，自动触发 `.github/workflows/deploy.yml`：

- 在 GitHub 提供的 7GB RAM runner 上执行 `docker build`
- 构建产物推送到 `ghcr.io/skylar-deepmind/naoii:latest`
- 支持 Docker layer 缓存（`cache-from: gha`），后续构建很快

无需任何配置 — GitHub 仓库自带的 `GITHUB_TOKEN` 即有 push 权限。

在仓库 Settings → Actions → General → Workflow permissions 中确认勾选 **Read and write permissions**。

---

## 三、后续更新

```bash
cd ~/naoii
./scripts/deploy.sh
```

**脚本做的事**：
1. `git pull` 获取最新代码（Caddyfile、compose 配置等可能更新）
2. `docker compose pull app` 拉取 Actions 构建好的新镜像
3. `docker compose up -d` 用新镜像重启
4. `npx prisma migrate deploy` 执行数据库迁移

---

## 四、Cloudflare 设置

1. **DNS**: `naoii.site` → `47.89.212.88`（橙色云朵代理）
2. **SSL/TLS**: **Full (strict)**
3. **始终使用 HTTPS**: 开启

---

## 五、备份与恢复

### 自动备份（每日凌晨 3 点）

```bash
crontab -e
# 添加：
0 3 * * * /home/ubuntu/naoii/scripts/backup.sh >> /home/ubuntu/naoii/backups/backup.log 2>&1
```

### 手动恢复

```bash
cd ~/naoii
./scripts/restore.sh backups/naoii_20260716_030000.sql.gz
```

### 回滚

```bash
# 回滚到前一个镜像版本
docker compose -f docker-compose.prod.yml pull app  # 默认 latest，已更新
# 或指定 SHA 版本:
# docker pull ghcr.io/skylar-deepmind/naoii:abc1234
# 修改 docker-compose.prod.yml 中的 image tag 为 abc1234
# docker compose -f docker-compose.prod.yml up -d
```

---

## 六、日常命令

```bash
# 日志
docker compose -f docker-compose.prod.yml logs -f --tail=100 app

# 重启
docker compose -f docker-compose.prod.yml restart app

# 进入容器
docker compose -f docker-compose.prod.yml exec app sh

# 数据库控制台
docker compose -f docker-compose.prod.yml exec db psql -U naoii -d naoii

# 磁盘
docker system df
docker system prune -a --filter "until=168h"
```

---

## 七、上线前检查清单

- [ ] `.env.production` 密码为随机生成（非 `naoii_dev`）
- [ ] `JWT_SECRET` 为随机生成
- [ ] PostgreSQL 不暴露端口到宿主机
- [ ] Caddyfile 域名正确
- [ ] Cloudflare SSL = Full (strict)
- [ ] GitHub Actions 成功构建过至少一次
- [ ] `docker login ghcr.io` 已执行
- [ ] 备份 cron 已配置
- [ ] `curl https://naoii.site/api/health` → `{"status":"ok"}`
