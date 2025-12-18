# 羽毛球比赛管理系统

这是一个基于 Vue 3、Ant Design Vue 和 Vite 构建的羽毛球比赛管理系统。

## 功能特性

- 📝 **报名信息管理** - 选手报名和信息管理
- 🏆 **对局计分** - 实时比赛计分和进度跟踪
- 📊 **比赛成绩** - 成绩统计和排名展示
- 💰 **球费计算** - 智能球费和场地费用分摊计算

## 技术栈

- **Vue 3** - 渐进式 JavaScript 框架
- **Ant Design Vue** - 企业级 UI 组件库
- **Vite** - 下一代前端构建工具
- **Vue Router** - 官方路由管理器（History 模式）

## 项目结构

```
├── public/                 # 静态资源
├── src/
│   ├── views/             # 页面组件
│   │   ├── Registration.vue      # 报名信息
│   │   ├── Scoring.vue           # 对局计分
│   │   ├── Results.vue           # 比赛成绩
│   │   └── BallFeeCalculator.vue # 球费计算
│   ├── router/            # 路由配置
│   ├── store/             # 状态管理
│   ├── styles/            # 样式文件
│   ├── App.vue            # 根组件
│   └── main.js            # 入口文件
├── index.html             # HTML 模板
├── vite.config.js         # Vite 配置
└── package.json           # 项目依赖
```

## 开始使用

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 特性

- ⚡️ Vite 提供极速的开发体验
- 🎨 Ant Design Vue 丰富的组件库
- 🔥 Vue 3 Composition API
- 📱 移动端 H5 适配（vw 方案）
- 🛣️ History 路由模式
- 📦 开箱即用的项目配置
- 🎯 移动端友好的底部导航
- 🔧 PostCSS 自动化适配

## 移动端适配

项目采用 `postcss-px-to-viewport` 插件实现移动端适配：

- **设计稿宽度**: 375px
- **适配单位**: vw
- **适配方案**: px 自动转换为 vw
- **兼容性**: 支持现代移动端浏览器

### 开发建议

1. 设计稿按 375px 宽度设计
2. 开发时直接使用 px 单位
3. 构建时自动转换为 vw 单位
4. 使用 `0.0.0.0:3000` 进行移动端真机调试

## 浏览器支持

- 现代移动端浏览器
- iOS Safari 9+
- Android Chrome 4.4+
- 微信内置浏览器
