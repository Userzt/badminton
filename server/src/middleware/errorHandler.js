// 404 处理中间件
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`)
  res.status(404)
  next(error)
}

// 错误处理中间件
const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode
  let message = err.message

  // Sequelize 验证错误
  if (err.name === 'SequelizeValidationError') {
    statusCode = 400
    message = err.errors.map(e => e.message).join(', ')
  }

  // Sequelize 唯一约束错误
  if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 400
    message = '数据已存在，请检查输入'
  }

  // Sequelize 外键约束错误
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    statusCode = 400
    message = '关联数据不存在'
  }

  // 数据库连接错误
  if (err.name === 'SequelizeConnectionError') {
    statusCode = 503
    message = '数据库连接失败'
  }

  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  })

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  })
}

module.exports = {
  notFound,
  errorHandler
}