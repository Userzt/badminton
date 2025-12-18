# 自有服务器部署指南

本指南适用于在自己的 VPS 或云服务器上部署后端服务。

## 📋 服务器要求

- **操作系统**: Ubuntu 20.04+ / CentOS 7+ / Debian 10+
- **内存**: 至少 512MB（推荐 1GB+）
- **Node.js**: 18.x 或更高版本
- **端口**: 需要开放一个端口（如 3002）

## 🚀 部署步骤

### 第一步：连接到服务器

```bash
# 使用 SSH 连接到服务器
ssh root@你的服务器IP

# 或使用指定用户
ssh 用户名@你的服务器IP
```

### 第二步：安装 Node.js

#### Ubuntu/Debian

```bash
# 更新包管理器
sudo apt update

# 安装 Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 验证安装
node --version
npm --version
```

#### CentOS/RHEL

```bash
# 安装 Node.js 18.x
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# 验证安装
node --version
npm --version
```

### 第三步：安装 Git

```bash
# Ubuntu/Debian
sudo apt install -y git

# CentOS/RHEL
sudo yum install -y git

# 验证安装
git --version
```

### 第四步：克隆项目

```bash
# 创建项目目录
mkdir -p /var/www
cd /var/www

# 从 GitHub 克隆（推荐）
git clone https://github.com/Userzt/badminton.git

# 或从 GitLab 克隆
# git clone https://gitlab.com/ztspace/wenti911.git badminton

# 进入项目目录
cd badminton/server
```

### 第五步：安装依赖

```bash
# 安装项目依赖
npm install --production

# 如果遇到 sqlite3 编译问题
npm rebuild sqlite3
```

### 第六步：配置环境变量

```bash
# 创建 .env 文件
cat > .env << EOF
# 服务器端口
PORT=3002

# 运行环境
NODE_ENV=production

# CORS 允许的源（替换为你的前端域名）
CORS_ORIGIN=https://your-netlify-site.netlify.app

# 数据库文件路径
DATABASE_PATH=./database.sqlite
EOF

# 查看配置
cat .env
```

### 第七步：测试运行

```bash
# 测试启动
npm start

# 如果看到类似输出，说明启动成功：
# Database connection established successfully.
# Server is running on port 3002
# Environment: production
# API URL: http://localhost:3002/api
```

按 `Ctrl+C` 停止测试。

### 第八步：安装 PM2（进程管理器）

PM2 可以让你的应用在后台运行，并在崩溃时自动重启。

```bash
# 全局安装 PM2
sudo npm install -g pm2

# 验证安装
pm2 --version
```

### 第九步：使用 PM2 启动应用

```bash
# 启动应用
pm2 start src/app.js --name badminton-api

# 查看应用状态
pm2 status

# 查看日志
pm2 logs badminton-api

# 查看实时日志
pm2 logs badminton-api --lines 50
```

### 第十步：配置 PM2 开机自启

```bash
# 保存当前 PM2 进程列表
pm2 save

# 生成开机启动脚本
pm2 startup

# 按照提示执行命令（通常是类似这样的命令）
# sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u 你的用户名 --hp /home/你的用户名
```

### 第十一步：配置防火墙

#### Ubuntu/Debian (UFW)

```bash
# 允许 3002 端口
sudo ufw allow 3002/tcp

# 查看防火墙状态
sudo ufw status
```

#### CentOS/RHEL (firewalld)

```bash
# 允许 3002 端口
sudo firewall-cmd --permanent --add-port=3002/tcp
sudo firewall-cmd --reload

# 查看防火墙规则
sudo firewall-cmd --list-all
```

### 第十二步：配置 Nginx 反向代理（推荐）

使用 Nginx 可以：
- 提供 HTTPS 支持
- 更好的性能
- 隐藏真实端口

#### 安装 Nginx

```bash
# Ubuntu/Debian
sudo apt install -y nginx

# CentOS/RHEL
sudo yum install -y nginx

# 启动 Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

#### 配置 Nginx

```bash
# 创建配置文件
sudo nano /etc/nginx/sites-available/badminton-api

# 或使用 vim
# sudo vim /etc/nginx/sites-available/badminton-api
```

添加以下配置：

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;  # 替换为你的域名或服务器IP

    # 日志
    access_log /var/log/nginx/badminton-api-access.log;
    error_log /var/log/nginx/badminton-api-error.log;

    # 反向代理到 Node.js 应用
    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # 静态文件（如果需要）
    location /static {
        alias /var/www/badminton/server/public;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

保存并退出（nano: `Ctrl+X`, `Y`, `Enter`）

#### 启用配置

```bash
# Ubuntu/Debian
sudo ln -s /etc/nginx/sites-available/badminton-api /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

#### CentOS/RHEL

```bash
# 配置文件位置不同
sudo cp /etc/nginx/sites-available/badminton-api /etc/nginx/conf.d/badminton-api.conf

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

### 第十三步：配置 HTTPS（可选但推荐）

使用 Let's Encrypt 免费 SSL 证书：

```bash
# 安装 Certbot
# Ubuntu/Debian
sudo apt install -y certbot python3-certbot-nginx

# CentOS/RHEL
sudo yum install -y certbot python3-certbot-nginx

# 获取证书并自动配置 Nginx
sudo certbot --nginx -d api.yourdomain.com

# 按照提示操作：
# 1. 输入邮箱
# 2. 同意服务条款
# 3. 选择是否重定向 HTTP 到 HTTPS（推荐选择 2）

# 测试自动续期
sudo certbot renew --dry-run
```

配置完成后，你的 API 将通过 HTTPS 访问：
```
https://api.yourdomain.com/api
```

## 🔧 常用 PM2 命令

```bash
# 查看所有应用
pm2 list

# 查看应用详情
pm2 show badminton-api

# 重启应用
pm2 restart badminton-api

# 停止应用
pm2 stop badminton-api

# 删除应用
pm2 delete badminton-api

# 查看日志
pm2 logs badminton-api

# 清空日志
pm2 flush

# 监控
pm2 monit
```

## 🔄 更新部署

当你更新代码后：

```bash
# 进入项目目录
cd /var/www/badminton

# 拉取最新代码
git pull origin main

# 进入 server 目录
cd server

# 安装新依赖（如果有）
npm install --production

# 重启应用
pm2 restart badminton-api

# 查看日志确认启动成功
pm2 logs badminton-api --lines 50
```

## 📊 监控和维护

### 查看系统资源

```bash
# 查看内存使用
free -h

# 查看磁盘使用
df -h

# 查看 CPU 和内存
top

# 或使用 htop（需要安装）
sudo apt install htop  # Ubuntu/Debian
htop
```

### 查看应用日志

```bash
# PM2 日志
pm2 logs badminton-api

# Nginx 访问日志
sudo tail -f /var/log/nginx/badminton-api-access.log

# Nginx 错误日志
sudo tail -f /var/log/nginx/badminton-api-error.log

# 系统日志
sudo journalctl -u nginx -f
```

### 备份数据库

```bash
# 创建备份目录
mkdir -p /var/backups/badminton

# 备份数据库
cp /var/www/badminton/server/database.sqlite /var/backups/badminton/database-$(date +%Y%m%d-%H%M%S).sqlite

# 创建自动备份脚本
cat > /usr/local/bin/backup-badminton.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/badminton"
DB_PATH="/var/www/badminton/server/database.sqlite"
DATE=$(date +%Y%m%d-%H%M%S)

mkdir -p $BACKUP_DIR
cp $DB_PATH $BACKUP_DIR/database-$DATE.sqlite

# 只保留最近 7 天的备份
find $BACKUP_DIR -name "database-*.sqlite" -mtime +7 -delete

echo "Backup completed: database-$DATE.sqlite"
EOF

# 添加执行权限
sudo chmod +x /usr/local/bin/backup-badminton.sh

# 添加到 crontab（每天凌晨 2 点备份）
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-badminton.sh") | crontab -
```

## 🔐 安全建议

### 1. 配置防火墙

```bash
# 只允许必要的端口
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 2. 禁用 root 登录

```bash
# 编辑 SSH 配置
sudo nano /etc/ssh/sshd_config

# 修改以下行：
# PermitRootLogin no
# PasswordAuthentication no  # 如果使用 SSH 密钥

# 重启 SSH 服务
sudo systemctl restart sshd
```

### 3. 定期更新系统

```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# CentOS/RHEL
sudo yum update -y
```

### 4. 配置环境变量权限

```bash
# 限制 .env 文件权限
chmod 600 /var/www/badminton/server/.env
```

## 🌐 域名配置

如果你有域名，需要配置 DNS：

### A 记录配置

在你的域名服务商（如阿里云、腾讯云、Cloudflare）添加 A 记录：

| 类型 | 主机记录 | 记录值 | TTL |
|------|---------|--------|-----|
| A | api | 你的服务器IP | 600 |

配置后，可以通过 `api.yourdomain.com` 访问你的 API。

## 📝 完整部署脚本

创建一键部署脚本：

```bash
cat > /var/www/deploy.sh << 'EOF'
#!/bin/bash

echo "🚀 开始部署..."

# 进入项目目录
cd /var/www/badminton

# 拉取最新代码
echo "📥 拉取最新代码..."
git pull origin main

# 进入 server 目录
cd server

# 安装依赖
echo "📦 安装依赖..."
npm install --production

# 重启应用
echo "🔄 重启应用..."
pm2 restart badminton-api

# 等待启动
sleep 3

# 查看状态
echo "✅ 部署完成！"
pm2 status badminton-api

# 显示最新日志
echo ""
echo "📋 最新日志："
pm2 logs badminton-api --lines 20 --nostream
EOF

chmod +x /var/www/deploy.sh
```

使用脚本：

```bash
/var/www/deploy.sh
```

## ❓ 常见问题

### Q: 端口被占用

```bash
# 查看端口占用
sudo lsof -i :3002

# 或
sudo netstat -tulpn | grep 3002

# 杀死占用进程
sudo kill -9 进程ID
```

### Q: 应用启动失败

```bash
# 查看详细日志
pm2 logs badminton-api --err

# 查看应用信息
pm2 show badminton-api

# 手动启动测试
cd /var/www/badminton/server
npm start
```

### Q: Nginx 502 错误

```bash
# 检查 Node.js 应用是否运行
pm2 status

# 检查 Nginx 配置
sudo nginx -t

# 查看 Nginx 错误日志
sudo tail -f /var/log/nginx/error.log
```

### Q: 数据库文件权限问题

```bash
# 修改权限
sudo chown -R www-data:www-data /var/www/badminton/server/database.sqlite

# 或使用当前用户
sudo chown -R $USER:$USER /var/www/badminton/server/database.sqlite
```

## 🎯 性能优化

### 1. 启用 Gzip 压缩

在 Nginx 配置中添加：

```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss;
```

### 2. 配置缓存

```nginx
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 30d;
    add_header Cache-Control "public, immutable";
}
```

### 3. 限制请求速率

```nginx
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

server {
    location /api {
        limit_req zone=api_limit burst=20 nodelay;
        proxy_pass http://localhost:3002;
    }
}
```

## 📞 需要帮助？

- 查看 PM2 文档：https://pm2.keymetrics.io/docs/
- 查看 Nginx 文档：https://nginx.org/en/docs/
- 查看 Let's Encrypt 文档：https://letsencrypt.org/docs/

---

部署完成后，你的 API 将通过以下方式访问：

- **HTTP**: `http://你的服务器IP:3002/api`
- **Nginx 反向代理**: `http://你的域名/api`
- **HTTPS**: `https://你的域名/api`
