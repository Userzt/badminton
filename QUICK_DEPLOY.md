# 🚀 快速部署清单

## 第一步：部署后端到 Railway（5-10分钟）

⚠️ **注意**：Railway 只支持 GitHub，不支持 GitLab。你需要先将代码同步到 GitHub。

### 方案 A：同步到 GitHub（推荐）

1. **在 GitHub 创建新仓库**
   - 访问 https://github.com/new
   - 仓库名：`badminton` 或其他名字
   - 设置为 Public 或 Private
   - 不要初始化（不勾选 README、.gitignore 等）

2. **添加 GitHub 远程仓库**
   ```bash
   git remote add github https://github.com/你的用户名/badminton.git
   git push github main
   ```

3. **在 Railway 部署**
   - 访问 https://railway.app
   - 用 GitHub 账号登录
   - 点击 "New Project" > "Deploy from GitHub repo"
   - 选择你刚创建的仓库
   - 进入 Settings，Root Directory 设置为：`server`
   - 在 Variables 添加：
     - `NODE_ENV=production`
     - `PORT=3002`
   - 点击 Deploy，等待完成
   - 在 Settings > Domains 点击 "Generate Domain"
   - **复制这个 URL**（例如：`https://xxx.up.railway.app`）

### 方案 B：使用 Railway CLI（适合高级用户）

1. **安装 Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **登录 Railway**
   ```bash
   railway login
   ```

3. **初始化项目**
   ```bash
   cd server
   railway init
   ```

4. **部署**
   ```bash
   railway up
   ```

5. **获取 URL**
   ```bash
   railway domain
   ```

## 第二步：部署前端到 Netlify（5分钟）

1. **访问** https://www.netlify.com
2. **登录** 使用 GitLab 账号
3. **新建站点** "Add new site" > "Import an existing project"
4. **选择仓库** `ztspace/wenti911`
5. **配置构建**
   - Branch: `main`
   - Base directory: 留空
   - Build command: `npm run build`
   - Publish directory: `dist`
6. **添加环境变量**
   - 点击 "Show advanced" > "New variable"
   - Key: `VITE_API_BASE_URL`
   - Value: `https://xxx.up.railway.app/api` （你的 Railway URL + /api）
7. **部署** 点击 "Deploy site"，等待完成
8. **获取 URL** 复制 Netlify 给你的网站地址

## 第三步：连接前后端（2分钟）

1. **回到 Railway**
2. **添加 CORS 环境变量**
   - 进入 Variables 标签
   - 添加：`CORS_ORIGIN=https://xxx.netlify.app` （你的 Netlify URL）
3. **等待重新部署** Railway 会自动重启

## 第四步：测试（1分钟）

1. **访问你的 Netlify 网站**
2. **测试功能**
   - 添加选手
   - 创建比赛
   - 查看成绩
3. **完成！** 🎉

---

## 📋 需要的信息

部署过程中你会得到：

- ✅ Railway 后端 URL：`https://xxx.up.railway.app`
- ✅ Netlify 前端 URL：`https://xxx.netlify.app`

## ⚠️ 注意事项

1. Railway 免费额度：$5/月（够用）
2. Netlify 免费额度：100GB 带宽/月（够用）
3. 数据会在 Railway 重启时丢失（如需持久化，添加 PostgreSQL）

## 🆘 遇到问题？

查看详细文档：`RAILWAY_DEPLOYMENT.md`
