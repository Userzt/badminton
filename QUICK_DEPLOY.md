# 🚀 快速部署清单

## 第一步：部署后端到 Railway（5分钟）

1. **访问** https://railway.app
2. **登录** 使用 GitHub 或 GitLab 账号
3. **新建项目** 点击 "New Project" > "Deploy from GitLab repo"
4. **选择仓库** `ztspace/wenti911`
5. **配置根目录**
   - 进入 Settings
   - Root Directory 设置为：`server`
6. **添加环境变量**
   - 进入 Variables 标签
   - 添加：`NODE_ENV=production`
   - 添加：`PORT=3002`
7. **部署** 点击 Deploy，等待完成
8. **获取 URL**
   - 进入 Settings > Domains
   - 点击 "Generate Domain"
   - **复制这个 URL**（例如：`https://xxx.up.railway.app`）

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
