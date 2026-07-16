# Naoii 生产部署指南

## 一、项目部署条件检查

| 项目 | 当前值 | 生产建议 |
|---|---|---|
| Node.js | 24.14.1（本地） | 22 LTS（Docker 镜像） |
| Next.js | 16.2.10 | 不变 |
| Prisma | 7.8.0 | 不变 |
| 数据库 | PostgreSQL 16 Alpine | 不变 |
| 构建方式 | `next build` + `npx prisma generate` | Docker 多阶段构建 |
| 构建依赖数据库 | 否（Prisma Client 在构建阶段生成） | ✓ |
| 运行时依赖数据库 | 是（server actions / 页面查询） | ✓ |
| 持久化需求 | PostgreSQL 数据 + 用户上传文件（暂无） | pgdata volume |
| 反向代理 | 无 | Caddy（自动 HTTPS） |
| 多语言 | Cookie: `naoii_lang` | 已支持 |

### 生产环境必须最小修改的代码项

| 问题 | 文件 | 修改 |
|---|---|---|
| 种子脚本含开发管理员密码 | `prisma/seed.ts` | 生产环境不执行 seed，或 seed 不创建 admin |
| `docker-compose.yml` 暴露 5432 端口 | `docker-compose.yml` | 生产用 `docker-compose.prod.yml`，不暴露端口 |
| 无健康检查端点 | — | 已新增 `app/api/health/route.ts` |

---

## 二、部署架构

```
Internet
   │
   ▼
Cloudflare (DNS + Full Strict SSL)
   │
   ▼
Caddy (HTTPS 终止 + 反向代理 + 安全头)
   │
   ▼
Naoii App (Next.js, 容器内 :3000, 不对外暴露)
   │
   ▼
PostgreSQL (容器内 :5432, 不对外暴露, 仅 Docker 网络)
```

- **Caddy** 自动申请 Let's Encrypt 证书（Cloudflare Full Strict 模式下使用 Cloudflare Origin 证书）
- **所有内部端口**（3000, 5432）不映射到宿主机
- **数据库** 仅通过 Docker 内部 DNS `db` 访问

---

## 三、新增文件清单

| 文件 | 用途 |
|---|---|
| `Dockerfile` | 多阶段构建（build + runner） |
| `docker-compose.prod.yml` | Caddy + App + PostgreSQL |
| `Caddyfile` | HTTPS 反向代理配置 |
| `.dockerignore` | 排除不必要文件 |
| `.env.production.example` | 生产环境变量模板 |
| `scripts/deploy.sh` | 一键部署 / 更新 |
| `scripts/backup.sh` | 数据库自动备份 |
| `scripts/restore.sh` | 数据库恢复 |
| `app/api/health/route.ts` | 健康检查端点 |

---

## 四、从全新 Ubuntu 24.04 开始部署

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

### 3. 克隆项目

```bash
su - ubuntu
git clone https://github.com/your-org/naoii.git ~/naoii
cd ~/naoii
```

### 4. 创建生产环境变量

```bash
# 生成随机密码
DB_PASSWORD=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 32)

# 创建 .env.production
cat > .env.production << EOF
POSTGRES_USER=naoii
POSTGRES_PASSWORD=${DB_PASSWORD}
POSTGRES_DB=naoii
DATABASE_URL=postgresql://naoii:${DB_PASSWORD}@db:5432/naoii
JWT_SECRET=${JWT_SECRET}
EOF

chmod 600 .env.production
```

### 5. 构建并启动

```bash
docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml up -d
```

### 6. 运行数据库迁移

```bash
docker compose -f docker-compose.prod.yml exec app npx prisma migrate deploy
```

### 7. 初始化种子数据（仅首次）

```bash
docker compose -f docker-compose.prod.yml exec app npx tsx prisma/seed.ts
```

### 8. 验证

```bash
# 检查容器状态
docker compose -f docker-compose.prod.yml ps

# 健康检查
curl http://localhost:3000/api/health

# 检查日志
docker compose -f docker-compose.prod.yml logs app
```

---

## 五、Cloudflare 控制台设置

1. **DNS 记录**
   - A 记录: `naoii.site` → `47.89.212.88`（已设置）
   - A 记录: `www.naoii.site` → `47.89.212.88`
   - 代理状态：开启（橙色云朵）

2. **SSL/TLS**
   - 加密模式：**Full (strict)**
   - 边缘证书：开启

3. **Origin Certificate**（Caddy 使用 Cloudflare 签发的源站证书）
   - SSL/TLS → Origin Server → Create Certificate
   - 生成 15 年证书，下载 `.pem` 和 `.key`
   - 上传到服务器，修改 `Caddyfile` 引用证书

   或者，Caddyfile 简化为：
   ```
   naoii.site {
       reverse_proxy app:3000
       tls internal  # 使用 Caddy 自签名（Cloudflare Full Strict 兼容）
   }
   ```

4. **安全设置**
   - 始终使用 HTTPS：开启
   - 最小 TLS 版本：1.2

---

## 六、后续更新

```bash
cd ~/naoii
git pull origin main
./scripts/deploy.sh
```

---

## 七、数据库备份与恢复

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

### 回滚到指定版本

```bash
cd ~/naoii
git checkout <commit-hash>
./scripts/deploy.sh
```

---

## 八、日常运维命令

```bash
# 查看日志
docker compose -f docker-compose.prod.yml logs -f --tail=100 app

# 重启应用
docker compose -f docker-compose.prod.yml restart app

# 进入应用容器
docker compose -f docker-compose.prod.yml exec app sh

# 进入数据库
docker compose -f docker-compose.prod.yml exec db psql -U naoii -d naoii

# 查看磁盘使用
df -h
docker system df

# 清理旧镜像和缓存
docker system prune -a --filter "until=168h"
```

---

## 九、上线前安全检查清单

- [ ] `.env.production` 中密码是随机生成的（非 `naoii_dev`）
- [ ] `JWT_SECRET` 是随机生成的（非 `your-jwt-secret-here`）
- [ ] PostgreSQL 端口 5432 不映射到宿主机（`docker-compose.prod.yml` 无 `ports`）
- [ ] App 端口 3000 不映射到宿主机
- [ ] Caddyfile 域名正确
- [ ] Cloudflare SSL 设置为 Full (strict)
- [ ] 数据库备份 cron 已配置
- [ ] `docker compose ps` 所有容器 `Up` 状态
- [ ] `curl http://localhost:3000/api/health` 返回 `{"status":"ok"}`
- [ ] `curl https://naoii.site/api/health` 返回 `{"status":"ok"}`
- [ ] 首页、登录、注册可正常访问
- [ ] `POSTGRES_PASSWORD` 和 `DATABASE_URL` 中密码一致
- [ ] 种子数据中的 admin 密码不是 `$2b$10$placeholder_hash_for_dev_only`
