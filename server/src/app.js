const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const compression = require('compression')
const path = require('path')
require('dotenv').config()

const { sequelize } = require('./database/connection')
const routes = require('./routes')
const { errorHandler, notFound } = require('./middleware/errorHandler')
const { seedTestData } = require('../scripts/seedData')

const app = express()
const PORT = process.env.PORT || 3002

// 中间件 - CORS 必须在最前面
app.use(cors({
  origin: true, // 允许所有来源
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Length', 'Content-Type'],
  maxAge: 86400
}))

app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: false
}))
app.use(compression())
app.use(morgan('combined'))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// 静态文件服务
app.use('/static', express.static(path.join(__dirname, '../public')))
app.use(express.static(path.join(__dirname, '../public')))

// 数据库管理界面
app.get('/db-viewer', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/db-viewer.html'))
})

// 种子数据接口
app.post('/seed-data', async (req, res) => {
  try {
    await seedTestData()
    res.json({ success: true, message: '测试数据添加成功' })
  } catch (error) {
    console.error('添加测试数据失败:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// 处理所有 OPTIONS 预检请求
app.options('*', cors())

// API 路由
app.use('/api', routes)

// 错误处理
app.use(notFound)
app.use(errorHandler)

// 启动服务器
async function startServer() {
  try {
    // 测试数据库连接
    await sequelize.authenticate()
    console.log('Database connection established successfully.')

    // 同步数据库模型（开发环境）
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true })
      console.log('Database models synchronized.')
    }

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
      console.log(`Environment: ${process.env.NODE_ENV}`)
      console.log(`API URL: http://localhost:${PORT}/api`)
    })
  } catch (error) {
    console.error('Unable to start server:', error)
    process.exit(1)
  }
}

startServer()

module.exports = app