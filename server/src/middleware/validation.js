const Joi = require('joi')

// 比赛验证规则
const matchSchema = Joi.object({
  title: Joi.string().min(1).max(255).required(),
  date: Joi.string().min(1).max(50).required(),
  time: Joi.string().min(1).max(100).required(),
  location: Joi.string().min(1).max(255).required(),
  organizer: Joi.string().min(1).max(100).required(),
  type: Joi.string().min(1).max(50).optional()
})

// 选手验证规则
const playerSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  avatar: Joi.string().min(1).max(10).required()
})

// 验证中间件工厂函数
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body)
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.details[0].message,
          details: error.details
        }
      })
    }
    
    next()
  }
}

// 导出验证中间件
const validateMatch = validate(matchSchema)
const validatePlayer = validate(playerSchema)

module.exports = {
  validateMatch,
  validatePlayer,
  validate
}