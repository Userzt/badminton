# 🚀 Zeabur 快速部署清单

## 第一步：部署后端到 Zeabur（5分钟）

### 1. 注册登录
- 访问 https://zeabur.com
- 点击 **登录** → **使用 GitHub 登录**

### 2. 创建项目
- 点击 **创建项目**
- 项目名：`badminton`
- 区域：`ap-east (香港)` 推荐
- 点击 **创建**

### 3. 添加服务
- 点击 **添加服务** → **Git**
- 选择仓库：`Userzt/badminton`

### 4. 配置服务
**设置 → 根目录：**
```
server
```

**变量：**
- `NODE_ENV` = `production`
- `PORT` = `3002`

### 5. 获取 URL
- 进入 **域名** 标签
- 点击 **生成域名**
- 复制 URL（例如：`https://xxx.zeabur.app`）

### 6. 测试
访问：`https://你的域名/api`

---

## 第二步：部署前端到 Netlify（5分钟）

### 1. 配置构建
| 配置项 | 值 |
|--------|-----|
| Branch | `main` |
| Build command | `npm run build` |
| Publish directory | `dist` |

### 2. 环境变量
- Key: `VITE_API_BASE_URL`
- Value: `https://你的zeabur域名/api`

### 3. 部署
点击 **Deploy site**

---

## 第三步：连接前后端（2分钟）

### 回到 Zeabur
**变量 → 添加：**
- `CORS_ORIGIN` = `https://你的netlify域名.netlify.app`

点击 **保存**，等待重新部署。

---

## ✅ 完成！

访问你的 Netlify 网站，测试功能。

---

## 💰 费用

- **免费额度**：$5/月（约 500 小时）
- **支付方式**：支付宝/微信/信用卡
- **小项目完全够用**

---

## 📚 详细文档

查看 `ZEABUR_DEPLOYMENT.md` 了解更多。
