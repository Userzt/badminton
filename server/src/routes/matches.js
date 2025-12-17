const express = require('express')
const { Match, Player, Game } = require('../models')
const { validateMatch } = require('../middleware/validation')

const router = express.Router()

// 创建比赛
router.post('/', validateMatch, async (req, res, next) => {
  try {
    const match = await Match.create(req.body)
    res.status(201).json({
      success: true,
      data: match
    })
  } catch (error) {
    next(error)
  }
})

// 获取比赛信息
router.get('/:id', async (req, res, next) => {
  try {
    const match = await Match.findByPk(req.params.id, {
      include: [
        { model: Player, as: 'players' },
        { model: Game, as: 'games' }
      ]
    })

    if (!match) {
      return res.status(404).json({
        success: false,
        error: { message: '比赛不存在' }
      })
    }

    res.json({
      success: true,
      data: match
    })
  } catch (error) {
    next(error)
  }
})

// 更新比赛信息
router.put('/:id', validateMatch, async (req, res, next) => {
  try {
    const match = await Match.findByPk(req.params.id)
    
    if (!match) {
      return res.status(404).json({
        success: false,
        error: { message: '比赛不存在' }
      })
    }

    await match.update(req.body)
    
    res.json({
      success: true,
      data: match
    })
  } catch (error) {
    next(error)
  }
})

// 删除比赛
router.delete('/:id', async (req, res, next) => {
  try {
    const { PlayerStat } = require('../models')
    const matchId = req.params.id
    
    const match = await Match.findByPk(matchId)
    
    if (!match) {
      return res.status(404).json({
        success: false,
        error: { message: '比赛不存在' }
      })
    }

    // 按依赖顺序删除关联数据
    // 1. 删除选手统计
    await PlayerStat.destroy({
      where: { matchId }
    })
    
    // 2. 删除比赛场次
    await Game.destroy({
      where: { matchId }
    })
    
    // 3. 删除选手
    await Player.destroy({
      where: { matchId }
    })
    
    // 4. 最后删除比赛
    await match.destroy()
    
    res.json({
      success: true,
      message: '比赛删除成功'
    })
  } catch (error) {
    next(error)
  }
})

// 获取所有比赛
router.get('/', async (req, res, next) => {
  try {
    const matches = await Match.findAll({
      include: [
        { model: Player, as: 'players' }
      ],
      order: [['created_at', 'DESC']]
    })

    res.json({
      success: true,
      data: matches
    })
  } catch (error) {
    next(error)
  }
})

module.exports = router