const express = require('express')
const { Game, Player, Match, PlayerStat } = require('../models')
const { generateMatchSchedule } = require('../services/matchGenerator')
const { calculatePlayerStats } = require('../services/statsCalculator')

const router = express.Router()

// 生成比赛对阵
router.post('/:matchId/generate-games', async (req, res, next) => {
  try {
    const matchId = req.params.matchId

    // 检查比赛是否存在
    const match = await Match.findByPk(matchId)
    if (!match) {
      return res.status(404).json({
        success: false,
        error: { message: '比赛不存在' }
      })
    }

    // 获取选手列表
    const players = await Player.findAll({
      where: { matchId },
      order: [['id', 'ASC']]
    })

    if (players.length !== 6) {
      return res.status(400).json({
        success: false,
        error: { message: '需要6名选手才能生成比赛对阵' }
      })
    }

    // 检查是否已经有对阵
    const existingGames = await Game.findAll({ where: { matchId } })
    if (existingGames.length > 0) {
      return res.status(400).json({
        success: false,
        error: { message: '对阵已经生成，不能重复生成' }
      })
    }

    // 删除现有的比赛对阵（这里实际上不会有，但保留以防万一）
    await Game.destroy({ where: { matchId } })

    // 生成新的比赛对阵
    console.log('准备生成比赛对阵，选手数量:', players.length)
    console.log('选手列表:', players.map(p => ({ id: p.id, name: p.name })))

    const schedule = generateMatchSchedule(players)

    console.log('对阵生成完成，结果:', schedule.success)
    console.log('生成的对局数量:', schedule.matches ? schedule.matches.length : 0)

    if (!schedule.success) {
      console.error('生成对阵失败:', schedule.message)
      return res.status(400).json({
        success: false,
        error: { message: schedule.message || '生成比赛对阵失败' }
      })
    }

    // 优化：使用批量插入代替逐条插入
    const gamesData = schedule.matches.map((match, i) => ({
      matchId,
      roundNumber: i + 1,
      roundName: `第${i + 1}场`,
      team1Player1Id: match.team1[0].id,
      team1Player2Id: match.team1[1].id,
      team2Player1Id: match.team2[0].id,
      team2Player2Id: match.team2[1].id,
      score1: 0,
      score2: 0,
      status: 'pending'
    }))

    const games = await Game.bulkCreate(gamesData)

    res.json({
      success: true,
      data: {
        games,
        stats: schedule.stats
      }
    })
  } catch (error) {
    next(error)
  }
})

// 获取比赛对阵
router.get('/:matchId/games', async (req, res, next) => {
  try {
    const games = await Game.findAll({
      where: { matchId: req.params.matchId },
      include: [
        { model: Player, as: 'team1Player1' },
        { model: Player, as: 'team1Player2' },
        { model: Player, as: 'team2Player1' },
        { model: Player, as: 'team2Player2' }
      ],
      order: [['roundNumber', 'ASC']]
    })

    // 格式化数据
    const formattedGames = games.map(game => ({
      id: game.id,
      roundNumber: game.roundNumber,
      roundName: game.roundName,
      team1: [game.team1Player1, game.team1Player2],
      team2: [game.team2Player1, game.team2Player2],
      score1: game.score1,
      score2: game.score2,
      status: game.status,
      winner: game.winner
    }))

    res.json({
      success: true,
      data: formattedGames
    })
  } catch (error) {
    next(error)
  }
})

// 更新比分
router.put('/:matchId/games/:gameId/score', async (req, res, next) => {
  try {
    const { score1, score2 } = req.body

    // 验证比分
    if (typeof score1 !== 'number' || typeof score2 !== 'number' ||
      score1 < 0 || score2 < 0 || score1 > 30 || score2 > 30) {
      return res.status(400).json({
        success: false,
        error: { message: '比分必须是0-30之间的数字' }
      })
    }

    const game = await Game.findOne({
      where: {
        id: req.params.gameId,
        matchId: req.params.matchId
      }
    })

    if (!game) {
      return res.status(404).json({
        success: false,
        error: { message: '比赛场次不存在' }
      })
    }

    // 确定胜负
    let winner = null
    let status = 'pending'

    if (score1 > 0 || score2 > 0) {
      status = 'finished'
      if (score1 > score2) {
        winner = 1
      } else if (score2 > score1) {
        winner = 2
      }
    }

    // 更新比分
    await game.update({
      score1,
      score2,
      status,
      winner
    })

    // 重新计算选手统计
    await calculatePlayerStats(req.params.matchId)

    res.json({
      success: true,
      data: {
        id: game.id,
        score1: game.score1,
        score2: game.score2,
        status: game.status,
        winner: game.winner
      }
    })
  } catch (error) {
    next(error)
  }
})

// 清空比赛对阵
router.delete('/:matchId/games', async (req, res, next) => {
  try {
    const matchId = req.params.matchId

    // 检查比赛是否存在
    const match = await Match.findByPk(matchId)
    if (!match) {
      return res.status(404).json({
        success: false,
        error: { message: '比赛不存在' }
      })
    }

    // 删除所有比赛对阵
    await Game.destroy({ where: { matchId } })

    // 删除所有选手统计
    await PlayerStat.destroy({ where: { matchId } })

    res.json({
      success: true,
      message: '比赛对阵已清空'
    })
  } catch (error) {
    next(error)
  }
})

// 获取比赛结果
router.get('/:matchId/results', async (req, res, next) => {
  try {
    const results = await PlayerStat.findAll({
      where: { matchId: req.params.matchId },
      include: [{ model: Player }],
      order: [
        ['wins', 'DESC'],
        ['scoreDiff', 'DESC'],
        ['totalScore', 'DESC']
      ]
    })

    // 去重处理 - 确保每个选手只出现一次
    const uniqueResults = new Map()

    results.forEach(stat => {
      const playerId = stat.playerId
      if (!uniqueResults.has(playerId) ||
        uniqueResults.get(playerId).wins < stat.wins ||
        (uniqueResults.get(playerId).wins === stat.wins && uniqueResults.get(playerId).scoreDiff < stat.scoreDiff)) {
        uniqueResults.set(playerId, stat)
      }
    })

    // 转换为数组并重新排序
    const sortedResults = Array.from(uniqueResults.values()).sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins
      if (b.scoreDiff !== a.scoreDiff) return b.scoreDiff - a.scoreDiff
      return b.totalScore - a.totalScore
    })

    const formattedResults = sortedResults.map((stat, index) => ({
      playerId: stat.playerId,
      name: stat.Player.name,
      avatar: stat.Player.avatar,
      wins: stat.wins,
      losses: stat.losses,
      totalScore: stat.totalScore,
      opponentScore: stat.opponentScore,
      scoreDiff: stat.scoreDiff,
      gamesPlayed: stat.gamesPlayed,
      rank: index + 1
    }))

    res.json({
      success: true,
      data: formattedResults
    })
  } catch (error) {
    next(error)
  }
})

module.exports = router