# Zeabur 部署详细指南

Zeabur 是一个对中国用户友好的部署平台，支持支付宝/微信支付，有免费额度。

## 🎯 为什么选择 Zeabur

- ✅ **中文界面**，操作简单
- ✅ **支持支付宝/微信支付**
- ✅ **免费额度**：每月 $5 免费额度
- ✅ **不会休眠**，性能稳定
- ✅ **自动 HTTPS**
- ✅ **中国访问速度快**

## 📋 准备工作

确保代码已推送到 GitHub：
```bash
git push github main
```

## 🚀 部署步骤

### 第一步：注册 Zeabur 账号

1. 访问 https://zeabur.com
2. 点击右上角 **登录**
3. 选择 **使用 GitHub 登录**
4. 授权 Zeabur 访问你的 GitHub

### 第二步：创建项目

1. 登录后，点击 **创建项目**（Create Project）
2. 输入项目名称：`badminton`（或其他名字）
3. 选择区域：
   - **推荐**：`ap-east (香港)` - 中国访问最快
   - 备选：`us-west (美国西部)`
4. 点击 **创建**

### 第三步：部署服务

1. 在项目页面，点击 **添加服务**（Add Service）
2. 选择 **Git**
3. 选择你的 GitHub 仓库：`Userzt/badminton`
4. Zeabur 会自动检测到你的项目

### 第四步：配置服务

#### 4.1 选择服务目录

Zeabur 检测到项目后：

1. 点击刚创建的服务卡片
2. 在 **设置**（Settings）标签页中
3. 找到 **根目录**（Root Directory）
4. 设置为：`server`
5. 点击 **保存**

#### 4.2 配置环境变量

在 **变量**（Variables）标签页中添加：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `NODE_ENV` | `production` | 运行环境 |
| `PORT` | `3002` | 服务端口 |

暂时不需要添加 `CORS_ORIGIN`，等前端部署后再添加。

#### 4.3 重新部署

配置完成后，点击右上角的 **重新部署**（Redeploy）按钮。

### 第五步：获取部署 URL

1. 部署成功后，在服务卡片上会显示状态为 **运行中**（Running）
2. 点击 **域名**（Domains）标签
3. Zeabur 会自动生成一个域名，例如：
   ```
   badminton-api-xxx.zeabur.app
   ```
4. 或者点击 **生成域名**（Generate Domain）
5. **复制这个 URL**，后面会用到

### 第六步：测试后端 API

在浏览器中访问：

```
https://你的zeabur域名/api
```

应该看到类似这样的响应：

```json
{
  "message": "羽毛球比赛管理系统 API",
  "version": "1.0.0",
  "endpoints": {
    "matches": "/matches",
    "players": "/matches/:matchId/players",
    "games": "/matches/:matchId/games"
  }
}
```

## 📱 部署前端到 Netlify

### 第一步：配置 Netlify

在 Netlify 部署设置中：

| 配置项 | 值 |
|--------|-----|
| **Branch to deploy** | `main` |
| **Base directory** | 留空 |
| **Build command** | `npm run build` |
| **Publish directory** | `dist` |

### 第二步：添加环境变量

在 Netlify 的环境变量中添加：

| Key | Value |
|-----|-------|
| `VITE_API_BASE_URL` | `https://你的zeabur域名/api` |

⚠️ **重要**：将 `你的zeabur域名` 替换为你在 Zeabur 获取的实际域名！

例如：
```
https://badminton-api-xxx.zeabur.app/api
```

### 第三步：部署

点击 **Deploy site**，等待部署完成。

## 🔗 连接前后端

### 更新后端 CORS 配置

1. 回到 Zeabur 项目
2. 点击你的服务
3. 进入 **变量**（Variables）标签
4. 添加新变量：
   - 变量名：`CORS_ORIGIN`
   - 值：`https://你的netlify域名.netlify.app`
5. 点击 **保存**
6. Zeabur 会自动重新部署

### 测试完整应用

1. 访问你的 Netlify 网站
2. 尝试添加选手、创建比赛等功能
3. 检查是否能正常与后端通信

## 💰 费用说明

### 免费额度

Zeabur 提供：
- **$5/月** 免费额度
- 约 **500 小时** 运行时间
- 对于小项目完全够用

### 计费方式

- 按使用量计费
- 只有超出免费额度才收费
- 可以设置预算上限

### 充值方式

支持：
- ✅ 支付宝
- ✅ 微信支付
- ✅ 信用卡

## 📊 监控和日志

### 查看日志

1. 在 Zeabur 项目中点击你的服务
2. 进入 **日志**（Logs）标签
3. 可以看到实时日志输出

### 查看监控

1. 进入 **监控**（Monitoring）标签
2. 可以看到：
   - CPU 使用率
   - 内存使用率
   - 网络流量
   - 请求数量

## 🔄 更新部署

当你更新代码后：

```bash
# 提交更改
git add .
git commit -m "更新说明"

# 推送到 GitHub
git push github main
```

Zeabur 会自动检测到代码更新并重新部署。

## 🔧 常见问题

### Q: 部署失败怎么办？

**A**: 
1. 检查 **日志**（Logs）标签查看错误信息
2. 确认 Root Directory 设置为 `server`
3. 确认环境变量配置正确

### Q: 如何查看使用量？

**A**: 
1. 点击右上角头像
2. 选择 **账单**（Billing）
3. 可以看到当前使用量和剩余额度

### Q: 如何设置预算上限？

**A**: 
1. 进入 **账单**（Billing）
2. 设置 **预算上限**（Budget Limit）
3. 超出后会自动停止服务，避免意外扣费

### Q: 域名可以自定义吗？

**A**: 
可以，在 **域名**（Domains）标签中：
1. 点击 **添加自定义域名**
2. 输入你的域名
3. 按照提示配置 DNS

### Q: 数据会丢失吗？

**A**: 
- SQLite 数据库文件会持久化保存
- 但建议定期备份
- 或者升级使用 Zeabur 的 PostgreSQL 服务

## 🎯 自定义域名（可选）

### 添加自定义域名

1. 在服务的 **域名**（Domains）标签中
2. 点击 **添加域名**（Add Domain）
3. 输入你的域名（如 `api.yourdomain.com`）
4. 按照提示配置 DNS CNAME 记录：
   - 类型：CNAME
   - 主机记录：api
   - 记录值：Zeabur 提供的域名
   - TTL：600

### 自动 HTTPS

Zeabur 会自动为你的域名配置 HTTPS 证书，无需额外操作。

## 📝 部署检查清单

### 后端（Zeabur）

- [ ] 代码已推送到 GitHub
- [ ] Zeabur 项目已创建
- [ ] 服务已添加并连接到 GitHub 仓库
- [ ] Root Directory 设置为 `server`
- [ ] 环境变量已配置（NODE_ENV, PORT）
- [ ] 部署成功，状态为运行中
- [ ] 获取了部署 URL
- [ ] API 可以访问

### 前端（Netlify）

- [ ] Netlify 站点已创建
- [ ] 构建设置正确
- [ ] 环境变量已配置（VITE_API_BASE_URL）
- [ ] 部署成功
- [ ] 网站可以访问
- [ ] 获取了网站 URL

### 连接

- [ ] 后端 CORS 已配置 Netlify 域名
- [ ] 前端可以正常调用后端 API
- [ ] 所有功能正常工作

## 🚀 持续部署

配置完成后，每次推送代码到 GitHub：

- **Zeabur** 会自动检测并重新部署后端
- **Netlify** 会自动检测并重新部署前端

无需手动操作！

## 💡 优化建议

### 1. 使用 PostgreSQL（可选）

如果需要数据持久化：

1. 在 Zeabur 项目中点击 **添加服务**
2. 选择 **PostgreSQL**
3. Zeabur 会自动创建数据库并设置环境变量
4. 需要修改后端代码以支持 PostgreSQL

### 2. 配置 Redis（可选）

如果需要缓存：

1. 在 Zeabur 项目中点击 **添加服务**
2. 选择 **Redis**
3. 用于缓存 API 响应，提升性能

### 3. 监控告警

在 Zeabur 设置中配置：
- CPU 使用率告警
- 内存使用率告警
- 错误率告警

## 📞 需要帮助？

- Zeabur 官方文档：https://zeabur.com/docs
- Zeabur Discord 社区：https://discord.gg/zeabur
- GitHub Issues：https://github.com/zeabur/zeabur

---

祝部署顺利！🎉
