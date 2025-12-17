const express = require('express')
const matchRoutes = require('./matches')
const playerRoutes = require('./players')
const gameRoutes = require('./games')

const router = express.Router()

// API 版本信息
router.get('/', (req, res) => {
  res.json({
    message: '羽毛球比赛管理系统 API',
    version: '1.0.0',
    endpoints: {
      matches: '/matches',
      players: '/matches/:matchId/players',
      games: '/matches/:matchId/games'
    }
  })
})

// 路由模块
router.use('/matches', matchRoutes)
router.use('/matches', playerRoutes)
router.use('/matches', gameRoutes)

module.exports = router