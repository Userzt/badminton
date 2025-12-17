// 使用全局 fetch (Node.js 18+)
const fetch = globalThis.fetch

const API_BASE = 'http://localhost:3002/api'

async function testApi() {
  try {
    console.log('=== 测试 API 接口 ===\n')
    
    // 1. 测试获取比赛信息
    console.log('1. 获取比赛信息 (GET /matches/1)')
    const matchResponse = await fetch(`${API_BASE}/matches/1`)
    const matchData = await matchResponse.json()
    console.log('响应:', JSON.stringify(matchData, null, 2))
    console.log()
    
    // 2. 测试获取选手列表
    console.log('2. 获取选手列表 (GET /matches/1/players)')
    const playersResponse = await fetch(`${API_BASE}/matches/1/players`)
    const playersData = await playersResponse.json()
    console.log('响应:', JSON.stringify(playersData, null, 2))
    console.log()
    
    // 3. 测试生成比赛对阵
    console.log('3. 生成比赛对阵 (POST /matches/1/generate-games)')
    const generateResponse = await fetch(`${API_BASE}/matches/1/generate-games`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
    const generateData = await generateResponse.json()
    console.log('响应:', JSON.stringify(generateData, null, 2))
    console.log()
    
    // 4. 测试获取比赛对阵
    console.log('4. 获取比赛对阵 (GET /matches/1/games)')
    const gamesResponse = await fetch(`${API_BASE}/matches/1/games`)
    const gamesData = await gamesResponse.json()
    console.log('响应:', JSON.stringify(gamesData.data?.slice(0, 2), null, 2)) // 只显示前2场
    console.log(`... 总共 ${gamesData.data?.length || 0} 场比赛`)
    console.log()
    
    console.log('✓ API 测试完成！')
    
  } catch (error) {
    console.error('API 测试失败:', error.message)
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  testApi()
}

module.exports = { testApi }