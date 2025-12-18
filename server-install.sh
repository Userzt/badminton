#!/bin/bash

# 羽毛球比赛管理系统 - 服务器一键部署脚本
# 适用于 Ubuntu 20.04+

set -e

echo "🏸 羽毛球比赛管理系统 - 服务器部署脚本"
echo "============================================"
echo ""

# 检查是否为 root 用户
if [ "$EUID" -ne 0 ]; then 
    echo "❌ 请使用 root 用户或 sudo 运行此脚本"
    echo "   sudo bash server-install.sh"
    exit 1
fi

# 获取配置
read -p "请输入项目安装目录 [/var/www]: " INSTALL_DIR
INSTALL_DIR=${INSTALL_DIR:-/var/www}

read -p "请输入服务端口 [3002]: " PORT
PORT=${PORT:-3002}

read -p "请输入前端域名（用于CORS，如 https://your-site.netlify.app）: " FRONTEND_URL

echo ""
echo "📋 配置信息："
echo "   安装目录: $INSTALL_DIR"
echo "   服务端口: $PORT"
echo "   前端域名: $FRONTEND_URL"
echo ""
read -p "确认开始安装？(y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ 安装已取消"
    exit 1
fi

echo ""
echo "🚀 开始安装..."
echo ""

# 1. 更新系统
echo "📦 更新系统包..."
apt update -qq

# 2. 安装 Node.js
echo "📦 安装 Node.js 18.x..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
fi
echo "   Node.js 版本: $(node --version)"
echo "   npm 版本: $(npm --version)"

# 3. 安装 Git
echo "📦 安装 Git..."
if ! command -v git &> /dev/null; then
    apt install -y git
fi
echo "   Git 版本: $(git --version)"

# 4. 安装 PM2
echo "📦 安装 PM2..."
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi
echo "   PM2 版本: $(pm2 --version)"

# 5. 克隆项目
echo "📥 克隆项目..."
mkdir -p $INSTALL_DIR
cd $INSTALL_DIR

if [ -d "badminton" ]; then
    echo "   项目目录已存在，拉取最新代码..."
    cd badminton
    git pull origin main
else
    git clone https://github.com/Userzt/badminton.git
    cd badminton
fi

# 6. 安装依赖
echo "📦 安装项目依赖..."
cd server
npm install --production

# 7. 配置环境变量
echo "⚙️  配置环境变量..."
cat > .env << EOF
PORT=$PORT
NODE_ENV=production
CORS_ORIGIN=$FRONTEND_URL
DATABASE_PATH=./database.sqlite
EOF

echo "   环境变量已配置"

# 8. 启动应用
echo "🚀 启动应用..."
pm2 delete badminton-api 2>/dev/null || true
pm2 start src/app.js --name badminton-api
pm2 save

# 9. 配置开机自启
echo "⚙️  配置开机自启..."
pm2 startup systemd -u root --hp /root

# 10. 配置防火墙
echo "🔥 配置防火墙..."
if command -v ufw &> /dev/null; then
    ufw allow $PORT/tcp
    echo "   已允许端口 $PORT"
fi

# 11. 安装 Nginx（可选）
read -p "是否安装 Nginx 反向代理？(y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📦 安装 Nginx..."
    apt install -y nginx
    
    read -p "请输入域名（如 api.yourdomain.com，留空则使用IP）: " DOMAIN
    
    if [ -z "$DOMAIN" ]; then
        DOMAIN="_"
    fi
    
    # 创建 Nginx 配置
    cat > /etc/nginx/sites-available/badminton-api << EOF
server {
    listen 80;
    server_name $DOMAIN;

    access_log /var/log/nginx/badminton-api-access.log;
    error_log /var/log/nginx/badminton-api-error.log;

    location / {
        proxy_pass http://localhost:$PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

    ln -sf /etc/nginx/sites-available/badminton-api /etc/nginx/sites-enabled/
    nginx -t && systemctl restart nginx
    
    echo "   Nginx 已配置"
    
    # 配置 HTTPS
    if [ "$DOMAIN" != "_" ]; then
        read -p "是否配置 HTTPS（需要域名已解析）？(y/n) " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo "📦 安装 Certbot..."
            apt install -y certbot python3-certbot-nginx
            certbot --nginx -d $DOMAIN
        fi
    fi
fi

echo ""
echo "============================================"
echo "✅ 部署完成！"
echo "============================================"
echo ""
echo "📊 应用信息："
pm2 status
echo ""
echo "🌐 访问地址："
if [ "$DOMAIN" != "_" ]; then
    echo "   HTTP:  http://$DOMAIN/api"
    echo "   HTTPS: https://$DOMAIN/api"
else
    SERVER_IP=$(curl -s ifconfig.me)
    echo "   直接访问: http://$SERVER_IP:$PORT/api"
    if command -v nginx &> /dev/null; then
        echo "   Nginx:    http://$SERVER_IP/api"
    fi
fi
echo ""
echo "📝 常用命令："
echo "   查看状态: pm2 status"
echo "   查看日志: pm2 logs badminton-api"
echo "   重启应用: pm2 restart badminton-api"
echo "   停止应用: pm2 stop badminton-api"
echo ""
echo "📚 详细文档: SERVER_DEPLOYMENT.md"
echo ""
