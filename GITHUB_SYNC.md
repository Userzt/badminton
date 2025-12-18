# 将 GitLab 代码同步到 GitHub

由于 Railway 只支持 GitHub，你需要将代码同步到 GitHub。

## 📋 准备工作

确保你有 GitHub 账号，如果没有请先注册：https://github.com/signup

## 🔄 同步步骤

### 第一步：在 GitHub 创建新仓库

1. 访问 https://github.com/new
2. 填写仓库信息：
   - **Repository name**: `badminton`（或其他名字）
   - **Description**: `羽毛球比赛管理系统`
   - **Public/Private**: 选择 Public（推荐）或 Private
   - ⚠️ **重要**：不要勾选任何初始化选项（README、.gitignore、license）
3. 点击 **Create repository**
4. **复制仓库 URL**，例如：`https://github.com/你的用户名/badminton.git`

### 第二步：添加 GitHub 远程仓库

在你的项目目录执行：

```bash
# 添加 GitHub 作为第二个远程仓库
git remote add github https://github.com/你的用户名/badminton.git

# 验证远程仓库
git remote -v
```

你应该看到类似这样的输出：

```
github  https://github.com/你的用户名/badminton.git (fetch)
github  https://github.com/你的用户名/badminton.git (push)
origin  https://gitlab.com/ztspace/wenti911.git (fetch)
origin  https://gitlab.com/ztspace/wenti911.git (push)
```

### 第三步：推送代码到 GitHub

```bash
# 推送 main 分支到 GitHub
git push github main
```

如果遇到认证问题，GitHub 会提示你使用 Personal Access Token。

### 第四步：验证

访问你的 GitHub 仓库页面，确认代码已经上传成功。

## 🔐 GitHub 认证（如果需要）

如果推送时提示需要认证：

### 方式 1：使用 Personal Access Token（推荐）

1. 访问 https://github.com/settings/tokens
2. 点击 **Generate new token** > **Generate new token (classic)**
3. 填写信息：
   - **Note**: `Railway Deployment`
   - **Expiration**: 选择过期时间
   - **Select scopes**: 勾选 `repo`（完整仓库访问权限）
4. 点击 **Generate token**
5. **复制 token**（只显示一次！）

6. 推送时使用 token：
   ```bash
   # 方式 A：在 URL 中包含 token
   git remote set-url github https://YOUR_TOKEN@github.com/你的用户名/badminton.git
   git push github main
   
   # 方式 B：推送时输入
   # 用户名：你的 GitHub 用户名
   # 密码：使用 token（不是你的 GitHub 密码）
   git push github main
   ```

### 方式 2：使用 SSH（推荐给熟悉 SSH 的用户）

1. 生成 SSH 密钥（如果还没有）：
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   ```

2. 添加 SSH 密钥到 GitHub：
   - 复制公钥：`cat ~/.ssh/id_ed25519.pub`
   - 访问 https://github.com/settings/keys
   - 点击 **New SSH key**
   - 粘贴公钥并保存

3. 使用 SSH URL：
   ```bash
   git remote set-url github git@github.com:你的用户名/badminton.git
   git push github main
   ```

## 🔄 持续同步

以后每次更新代码，你可以同时推送到 GitLab 和 GitHub：

```bash
# 提交更改
git add .
git commit -m "更新说明"

# 推送到 GitLab（主仓库）
git push origin main

# 推送到 GitHub（用于 Railway 部署）
git push github main
```

或者使用快捷脚本：

```bash
# 使用提供的同步脚本
./sync-to-github.sh
```

## 🤖 自动同步（可选）

如果你想自动同步 GitLab 到 GitHub，可以使用 GitLab CI/CD：

创建 `.gitlab-ci.yml`：

```yaml
sync_to_github:
  stage: deploy
  only:
    - main
  script:
    - git remote add github https://$GITHUB_TOKEN@github.com/你的用户名/badminton.git || true
    - git push github main
  variables:
    GIT_STRATEGY: clone
```

在 GitLab 项目设置中添加 `GITHUB_TOKEN` 变量。

## ❓ 常见问题

### Q: 推送时提示 "remote: Support for password authentication was removed"

**A**: GitHub 已经禁用密码认证，必须使用 Personal Access Token 或 SSH。

### Q: 我可以只用 GitHub 吗？

**A**: 可以，但建议保留 GitLab 作为备份。你可以：
- 主要使用 GitHub
- GitLab 作为镜像备份

### Q: 每次都要推送两次吗？

**A**: 是的，或者：
1. 使用自动同步脚本
2. 配置 GitLab CI/CD 自动同步
3. 只使用 GitHub（删除 GitLab 远程仓库）

### Q: 如何删除 GitHub 远程仓库？

**A**: 
```bash
git remote remove github
```

## 📝 总结

完成同步后，你就可以：

1. ✅ 在 Railway 使用 GitHub 仓库部署
2. ✅ 继续在 GitLab 管理代码（如果需要）
3. ✅ 两个平台都有代码备份

---

下一步：查看 `RAILWAY_DEPLOYMENT.md` 继续部署到 Railway
