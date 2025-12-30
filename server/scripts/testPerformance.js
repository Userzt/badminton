// 性能测试脚本
const { generateMatchSchedule } = require('../src/services/matchGenerator')

// 模拟6名选手
const mockPlayers = [
    { id: 1, name: '选手1' },
    { id: 2, name: '选手2' },
    { id: 3, name: '选手3' },
    { id: 4, name: '选手4' },
    { id: 5, name: '选手5' },
    { id: 6, name: '大哥' }
]

console.log('开始性能测试...\n')

// 测试5次，取平均值
const testRuns = 5
const times = []

for (let i = 0; i < testRuns; i++) {
    console.log(`\n========== 第 ${i + 1} 次测试 ==========`)
    const startTime = Date.now()

    const result = generateMatchSchedule(mockPlayers)

    const endTime = Date.now()
    const duration = endTime - startTime
    times.push(duration)

    console.log(`\n测试结果:`)
    console.log(`- 耗时: ${duration}ms`)
    console.log(`- 成功: ${result.success}`)
    console.log(`- 生成场次: ${result.matches.length}`)
    console.log(`- 得分: ${result.stats.score}`)
}

console.log('\n\n========== 性能统计 ==========')
console.log(`测试次数: ${testRuns}`)
console.log(`平均耗时: ${(times.reduce((a, b) => a + b, 0) / testRuns).toFixed(2)}ms`)
console.log(`最快: ${Math.min(...times)}ms`)
console.log(`最慢: ${Math.max(...times)}ms`)
console.log('==============================\n')
