const { sequelize, Match, Player, Game, PlayerStat } = require('../src/models')

// 获取当前时间的格式化字符串
function getCurrentTimeString() {
  const now = new Date()
  const month = now.getMonth() + 1
  const day = now.getDate()
  const weekdays = ['日', '一', '二', '三', '四', '五', '六']
  const weekday = weekdays[now.getDay()]
  
  return `${month}月${day}日 周${weekday} (2小时21:00-23:00)`
}

async function seedTestData() {
  try {
    console.log('开始添加测试数据...\n')
    
    // 创建测试比赛
    const match = await Match.create({
      title: '6人多人轮转赛',
      date: '12-13发布',
      time: getCurrentTimeString(),
      location: '钱塘区·钱塘文体中心',
      organizer: 'cy',
      type: '多人轮转赛',
      status: 'preparing'
    })
    
    console.log(`✓ 创建比赛: ${match.title} (ID: ${match.id})`)
    
    // 创建测试选手
    const playersData = [
      { name: '33', avatar: '🏸' },
      { name: '左手', avatar: '🎯' },
      { name: '大哥', avatar: '⭐' },
      { name: '腰子', avatar: '🔥' },
      { name: '网红', avatar: '🍜' },
      { name: 'cy', avatar: '🎪' }
    ]
    
    const players = []
    for (const playerData of playersData) {
      const player = await Player.create({
        ...playerData,
        matchId: match.id
      })
      players.push(player)
      console.log(`✓ 创建选手: ${player.name} (ID: ${player.id})`)
    }
    
    console.log(`\n✓ 成功创建 ${players.length} 名选手`)
    console.log('✓ 测试数据添加完成！')
    
    return { match, players }
    
  } catch (error) {
    console.error('添加测试数据失败:', error)
    throw error
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  seedTestData()
    .then(() => {
      console.log('\n现在可以运行以下命令查看数据:')
      console.log('node scripts/viewDatabase.js')
      process.exit(0)
    })
    .catch(error => {
      console.error('脚本执行失败:', error)
      process.exit(1)
    })
}

module.exports = { seedTestData }