const { sequelize, Match, Player, Game, PlayerStat } = require('../src/models')

async function viewDatabase() {
  try {
    console.log('=== 数据库表结构和数据 ===\n')
    
    // 查看所有表
    const [tables] = await sequelize.query("SELECT name FROM sqlite_master WHERE type='table'")
    console.log('数据库表列表:')
    tables.forEach(table => console.log(`- ${table.name}`))
    console.log()
    
    // 查看比赛表
    console.log('=== 比赛表 (matches) ===')
    const matches = await Match.findAll()
    if (matches.length > 0) {
      matches.forEach(match => {
        console.log(`ID: ${match.id}, 标题: ${match.title}, 状态: ${match.status}`)
        console.log(`时间: ${match.time}, 地点: ${match.location}`)
        console.log(`组织者: ${match.organizer}, 创建时间: ${match.createdAt}`)
        console.log('---')
      })
    } else {
      console.log('暂无比赛数据')
    }
    console.log()
    
    // 查看选手表
    console.log('=== 选手表 (players) ===')
    const players = await Player.findAll({
      include: [{ model: Match }]
    })
    if (players.length > 0) {
      players.forEach(player => {
        console.log(`ID: ${player.id}, 姓名: ${player.name}, 头像: ${player.avatar}`)
        console.log(`比赛ID: ${player.matchId}, 比赛: ${player.Match?.title || '未知'}`)
        console.log('---')
      })
    } else {
      console.log('暂无选手数据')
    }
    console.log()
    
    // 查看比赛场次表
    console.log('=== 比赛场次表 (games) ===')
    const games = await Game.findAll({
      include: [
        { model: Player, as: 'team1Player1' },
        { model: Player, as: 'team1Player2' },
        { model: Player, as: 'team2Player1' },
        { model: Player, as: 'team2Player2' }
      ]
    })
    if (games.length > 0) {
      games.forEach(game => {
        console.log(`${game.roundName}: ${game.team1Player1?.name || '?'}-${game.team1Player2?.name || '?'} VS ${game.team2Player1?.name || '?'}-${game.team2Player2?.name || '?'}`)
        console.log(`比分: ${game.score1}:${game.score2}, 状态: ${game.status}, 胜者: ${game.winner || '未定'}`)
        console.log('---')
      })
    } else {
      console.log('暂无比赛场次数据')
    }
    console.log()
    
    // 查看选手统计表
    console.log('=== 选手统计表 (player_stats) ===')
    const stats = await PlayerStat.findAll({
      include: [{ model: Player }]
    })
    if (stats.length > 0) {
      stats.forEach(stat => {
        console.log(`选手: ${stat.Player?.name || '未知'}, 胜: ${stat.wins}, 负: ${stat.losses}`)
        console.log(`总得分: ${stat.totalScore}, 总失分: ${stat.opponentScore}, 净胜分: ${stat.scoreDiff}`)
        console.log(`参赛场次: ${stat.gamesPlayed}`)
        console.log('---')
      })
    } else {
      console.log('暂无选手统计数据')
    }
    
  } catch (error) {
    console.error('查看数据库失败:', error)
  } finally {
    await sequelize.close()
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  viewDatabase()
}

module.exports = { viewDatabase }