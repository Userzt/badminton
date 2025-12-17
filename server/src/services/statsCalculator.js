const { Game, Player, PlayerStat } = require('../models')

// 计算选手统计数据
async function calculatePlayerStats(matchId) {
  try {
    // 获取所有已完成的比赛
    const games = await Game.findAll({
      where: { 
        matchId,
        status: 'finished'
      },
      include: [
        { model: Player, as: 'team1Player1' },
        { model: Player, as: 'team1Player2' },
        { model: Player, as: 'team2Player1' },
        { model: Player, as: 'team2Player2' }
      ]
    })

    // 获取所有选手
    const players = await Player.findAll({
      where: { matchId }
    })

    // 初始化选手统计
    const playerResults = {}
    players.forEach(player => {
      playerResults[player.id] = {
        playerId: player.id,
        matchId,
        wins: 0,
        losses: 0,
        totalScore: 0,
        opponentScore: 0,
        scoreDiff: 0,
        gamesPlayed: 0
      }
    })

    // 统计每场比赛结果
    games.forEach(game => {
      const team1Players = [game.team1Player1, game.team1Player2]
      const team2Players = [game.team2Player1, game.team2Player2]
      
      // 更新队伍1选手数据
      team1Players.forEach(player => {
        if (player && playerResults[player.id]) {
          const result = playerResults[player.id]
          result.totalScore += game.score1
          result.opponentScore += game.score2
          result.gamesPlayed++
          
          if (game.winner === 1) {
            result.wins++
          } else if (game.winner === 2) {
            result.losses++
          }
        }
      })
      
      // 更新队伍2选手数据
      team2Players.forEach(player => {
        if (player && playerResults[player.id]) {
          const result = playerResults[player.id]
          result.totalScore += game.score2
          result.opponentScore += game.score1
          result.gamesPlayed++
          
          if (game.winner === 2) {
            result.wins++
          } else if (game.winner === 1) {
            result.losses++
          }
        }
      })
    })

    // 计算净胜分
    Object.values(playerResults).forEach(result => {
      result.scoreDiff = result.totalScore - result.opponentScore
    })

    // 更新或创建统计记录
    for (const result of Object.values(playerResults)) {
      // 先删除可能存在的重复记录
      await PlayerStat.destroy({
        where: {
          matchId: result.matchId,
          playerId: result.playerId
        }
      })
      
      // 创建新的统计记录
      await PlayerStat.create(result)
    }

    return playerResults
  } catch (error) {
    console.error('计算选手统计失败:', error)
    throw error
  }
}

// 获取比赛进度统计
async function getMatchProgress(matchId) {
  try {
    const totalGames = await Game.count({
      where: { matchId }
    })

    const finishedGames = await Game.count({
      where: { 
        matchId,
        status: 'finished'
      }
    })

    const pendingGames = totalGames - finishedGames

    return {
      total: totalGames,
      finished: finishedGames,
      pending: pendingGames,
      progress: totalGames > 0 ? Math.round((finishedGames / totalGames) * 100) : 0
    }
  } catch (error) {
    console.error('获取比赛进度失败:', error)
    throw error
  }
}

// 获取组合使用统计
async function getPairStats(matchId) {
  try {
    const games = await Game.findAll({
      where: { matchId },
      include: [
        { model: Player, as: 'team1Player1' },
        { model: Player, as: 'team1Player2' },
        { model: Player, as: 'team2Player1' },
        { model: Player, as: 'team2Player2' }
      ]
    })

    const pairUsage = new Map()

    games.forEach(game => {
      // 统计队伍1组合
      if (game.team1Player1 && game.team1Player2) {
        const pair1Key = getPairKey(game.team1Player1, game.team1Player2)
        const pair1Name = `${game.team1Player1.name}-${game.team1Player2.name}`
        
        if (!pairUsage.has(pair1Key)) {
          pairUsage.set(pair1Key, {
            player1: game.team1Player1.name,
            player2: game.team1Player2.name,
            usageCount: 0,
            lastUsedRound: -1
          })
        }
        
        const pair1Stats = pairUsage.get(pair1Key)
        pair1Stats.usageCount++
        pair1Stats.lastUsedRound = Math.max(pair1Stats.lastUsedRound, game.roundNumber)
      }

      // 统计队伍2组合
      if (game.team2Player1 && game.team2Player2) {
        const pair2Key = getPairKey(game.team2Player1, game.team2Player2)
        
        if (!pairUsage.has(pair2Key)) {
          pairUsage.set(pair2Key, {
            player1: game.team2Player1.name,
            player2: game.team2Player2.name,
            usageCount: 0,
            lastUsedRound: -1
          })
        }
        
        const pair2Stats = pairUsage.get(pair2Key)
        pair2Stats.usageCount++
        pair2Stats.lastUsedRound = Math.max(pair2Stats.lastUsedRound, game.roundNumber)
      }
    })

    return Array.from(pairUsage.values())
  } catch (error) {
    console.error('获取组合统计失败:', error)
    throw error
  }
}

// 获取组合的唯一标识
function getPairKey(player1, player2) {
  const ids = [player1.id, player2.id].sort()
  return `${ids[0]}-${ids[1]}`
}

module.exports = {
  calculatePlayerStats,
  getMatchProgress,
  getPairStats
}