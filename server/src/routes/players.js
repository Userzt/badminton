const express = require('express')
const { Player, Match } = require('../models')
const { validatePlayer } = require('../middleware/validation')

const router = express.Router()

// 获取比赛的所有选手
router.get('/:matchId/players', async (req, res, next) => {
  try {
    const players = await Player.findAll({
      where: { matchId: req.params.matchId },
      order: [['created_at', 'ASC']]
    })

    res.json({
      success: true,
      data: players
    })
  } catch (error) {
    next(error)
  }
})

// 添加选手
router.post('/:matchId/players', validatePlayer, async (req, res, next) => {
  try {
    // 检查比赛是否存在
    const match = await Match.findByPk(req.params.matchId)
    if (!match) {
      return res.status(404).json({
        success: false,
        error: { message: '比赛不存在' }
      })
    }

    // 检查选手数量限制
    const playerCount = await Player.count({
      where: { matchId: req.params.matchId }
    })

    if (playerCount >= 6) {
      return res.status(400).json({
        success: false,
        error: { message: '参赛人数已满（最多6人）' }
      })
    }

    // 检查姓名是否重复
    const existingPlayer = await Player.findOne({
      where: {
        matchId: req.params.matchId,
        name: req.body.name
      }
    })

    if (existingPlayer) {
      return res.status(400).json({
        success: false,
        error: { message: '选手姓名已存在' }
      })
    }

    const player = await Player.create({
      ...req.body,
      matchId: req.params.matchId
    })

    res.status(201).json({
      success: true,
      data: player
    })
  } catch (error) {
    next(error)
  }
})

// 更新选手信息
router.put('/:matchId/players/:playerId', validatePlayer, async (req, res, next) => {
  try {
    const player = await Player.findOne({
      where: {
        id: req.params.playerId,
        matchId: req.params.matchId
      }
    })

    if (!player) {
      return res.status(404).json({
        success: false,
        error: { message: '选手不存在' }
      })
    }

    // 检查姓名是否重复（排除自己）
    const existingPlayer = await Player.findOne({
      where: {
        matchId: req.params.matchId,
        name: req.body.name,
        id: { [require('sequelize').Op.ne]: req.params.playerId }
      }
    })

    if (existingPlayer) {
      return res.status(400).json({
        success: false,
        error: { message: '选手姓名已存在' }
      })
    }

    await player.update(req.body)

    res.json({
      success: true,
      data: player
    })
  } catch (error) {
    next(error)
  }
})

// 删除选手
router.delete('/:matchId/players/:playerId', async (req, res, next) => {
  try {
    const { Game, PlayerStat } = require('../models')
    
    const player = await Player.findOne({
      where: {
        id: req.params.playerId,
        matchId: req.params.matchId
      }
    })

    if (!player) {
      return res.status(404).json({
        success: false,
        error: { message: '选手不存在' }
      })
    }

    // 检查是否有相关的游戏数据
    const gameCount = await Game.count({
      where: { matchId: req.params.matchId }
    })

    // 如果有游戏数据，先清空所有游戏和统计数据
    if (gameCount > 0) {
      await Game.destroy({ where: { matchId: req.params.matchId } })
      await PlayerStat.destroy({ where: { matchId: req.params.matchId } })
    }

    // 删除选手
    await player.destroy()

    res.json({
      success: true,
      message: gameCount > 0 ? '选手删除成功，赛程已清空' : '选手删除成功'
    })
  } catch (error) {
    next(error)
  }
})

module.exports = router