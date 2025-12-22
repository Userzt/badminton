// 比赛对阵生成服务 - 确保12场对局完全不重复

function generateMatchSchedule(players) {
  if (players.length !== 6) {
    return {
      success: false,
      message: '需要6名选手才能生成比赛对阵'
    }
  }

  // 生成所有可能的对局（不是组合，而是完整的对局）
  const allMatches = generateAllPossibleMatches(players)

  let bestMatches = []
  let bestScore = -1

  // 尝试多次生成最优方案
  for (let attempt = 0; attempt < 200; attempt++) {
    const result = generateOptimalSchedule(players, allMatches)

    if (result.success && result.score > bestScore) {
      bestScore = result.score
      bestMatches = result.matches

      // 如果找到完美方案，直接使用
      if (result.score >= 95) {
        break
      }
    }
  }

  // 统计并打印组队次数
  console.log('开始统计组队次数...')
  if (bestMatches.length > 0) {
    console.log(`成功生成 ${bestMatches.length} 场对局`)
    printTeammateStats(bestMatches, players)
  } else {
    console.log('未能生成对局')
  }

  return {
    success: bestMatches.length > 0,
    matches: bestMatches,
    stats: {
      totalGames: bestMatches.length,
      score: bestScore
    }
  }
}

// 生成所有可能的对局（team1 vs team2）
function generateAllPossibleMatches(players) {
  const matches = []
  const n = players.length

  // 生成所有可能的4人组合，然后分成2v2
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      for (let k = 0; k < n; k++) {
        if (k === i || k === j) continue
        for (let l = k + 1; l < n; l++) {
          if (l === i || l === j) continue

          const team1 = [players[i], players[j]]
          const team2 = [players[k], players[l]]

          matches.push({
            team1,
            team2,
            key: getMatchKey(team1, team2)
          })
        }
      }
    }
  }

  // 去重：A+B vs C+D 和 C+D vs A+B 是同一场比赛
  const uniqueMatches = []
  const seenKeys = new Set()

  for (const match of matches) {
    if (!seenKeys.has(match.key)) {
      seenKeys.add(match.key)
      uniqueMatches.push(match)
    }
  }

  return uniqueMatches
}

// 获取对局的唯一标识（不考虑队伍顺序）
function getMatchKey(team1, team2) {
  const team1Ids = team1.map(p => p.id).sort().join('-')
  const team2Ids = team2.map(p => p.id).sort().join('-')
  const teams = [team1Ids, team2Ids].sort()
  return `${teams[0]}vs${teams[1]}`
}

// 生成最优赛程
function generateOptimalSchedule(players, allPossibleMatches) {
  const selectedMatches = []
  const usedMatchKeys = new Set()
  const playerGameCount = {}
  const playerConsecutiveGames = {}
  const teammateCount = {} // 组队次数统计
  const targetMatches = 12
  const targetGamesPerPlayer = 8
  const maxConsecutiveGames = 2
  const maxTeammateCount = 2 // 最多组队2次

  // 初始化选手统计
  players.forEach(player => {
    playerGameCount[player.id] = 0
    playerConsecutiveGames[player.id] = 0
    teammateCount[player.id] = {}
    // 初始化与其他选手的组队次数
    players.forEach(other => {
      if (player.id !== other.id) {
        teammateCount[player.id][other.id] = 0
      }
    })
  })

  // 随机打乱对局顺序，增加多样性
  const shuffledMatches = [...allPossibleMatches].sort(() => Math.random() - 0.5)

  let attempts = 0
  const maxAttempts = 1000

  // 生成12场不重复的对局
  while (selectedMatches.length < targetMatches && attempts < maxAttempts) {
    attempts++

    // 找到一个可用的对局
    const availableMatch = shuffledMatches.find(match => {
      // 检查是否已使用
      if (usedMatchKeys.has(match.key)) {
        return false
      }

      const allPlayers = [...match.team1, ...match.team2]

      // 检查选手参赛次数
      const wouldExceedLimit = allPlayers.some(player =>
        playerGameCount[player.id] >= targetGamesPerPlayer
      )
      if (wouldExceedLimit) {
        return false
      }

      // 检查连续参赛限制
      const wouldExceedConsecutive = allPlayers.some(player =>
        playerConsecutiveGames[player.id] >= maxConsecutiveGames
      )
      if (wouldExceedConsecutive) {
        return false
      }

      // 检查组队次数限制
      const [t1p1, t1p2] = match.team1
      const [t2p1, t2p2] = match.team2

      // 检查 team1 的两人组队次数
      if (teammateCount[t1p1.id][t1p2.id] >= maxTeammateCount) {
        return false
      }

      // 检查 team2 的两人组队次数
      if (teammateCount[t2p1.id][t2p2.id] >= maxTeammateCount) {
        return false
      }

      return true
    })

    if (!availableMatch) {
      // 如果找不到可用对局，回溯
      if (selectedMatches.length > 0) {
        const lastMatch = selectedMatches.pop()
        usedMatchKeys.delete(lastMatch.key)

        const allPlayers = [...lastMatch.team1, ...lastMatch.team2]
        allPlayers.forEach(player => {
          playerGameCount[player.id]--
        })

        // 回退组队次数
        const [t1p1, t1p2] = lastMatch.team1
        const [t2p1, t2p2] = lastMatch.team2
        teammateCount[t1p1.id][t1p2.id]--
        teammateCount[t1p2.id][t1p1.id]--
        teammateCount[t2p1.id][t2p2.id]--
        teammateCount[t2p2.id][t2p1.id]--

        // 重新计算连续参赛
        recalculateConsecutiveGames(selectedMatches, players, playerConsecutiveGames)
      }
      continue
    }

    // 添加这场对局
    const currentMatchIndex = selectedMatches.length
    selectedMatches.push({
      id: currentMatchIndex + 1,
      round: `第${currentMatchIndex + 1}场`,
      team1: availableMatch.team1,
      team2: availableMatch.team2,
      key: availableMatch.key
    })

    usedMatchKeys.add(availableMatch.key)

    // 更新组队次数
    const [t1p1, t1p2] = availableMatch.team1
    const [t2p1, t2p2] = availableMatch.team2
    teammateCount[t1p1.id][t1p2.id]++
    teammateCount[t1p2.id][t1p1.id]++
    teammateCount[t2p1.id][t2p2.id]++
    teammateCount[t2p2.id][t2p1.id]++

    // 更新选手统计
    const allPlayers = [...availableMatch.team1, ...availableMatch.team2]
    players.forEach(player => {
      const isPlaying = allPlayers.some(p => p.id === player.id)

      if (isPlaying) {
        playerGameCount[player.id]++
        playerConsecutiveGames[player.id]++
      } else {
        playerConsecutiveGames[player.id] = 0
      }
    })
  }

  // 评估赛程质量
  const score = evaluateSchedule(selectedMatches, playerGameCount, usedMatchKeys, teammateCount)

  return {
    success: selectedMatches.length === targetMatches,
    matches: selectedMatches,
    score
  }
}

// 重新计算连续参赛次数（从最后一场往前数连续参赛）
function recalculateConsecutiveGames(matches, players, playerConsecutiveGames) {
  // 重置所有选手的连续参赛次数
  players.forEach(player => {
    playerConsecutiveGames[player.id] = 0
  })

  // 如果没有比赛，直接返回
  if (matches.length === 0) return

  // 从最后一场开始往前数，计算每个选手在末尾连续参赛了多少场
  for (let i = matches.length - 1; i >= 0; i--) {
    const match = matches[i]
    const playingPlayerIds = [...match.team1, ...match.team2].map(p => p.id)

    // 对每个选手检查
    for (const player of players) {
      const isPlaying = playingPlayerIds.includes(player.id)

      if (i === matches.length - 1) {
        // 最后一场：如果上场则设为1，否则为0
        playerConsecutiveGames[player.id] = isPlaying ? 1 : 0
      } else {
        // 不是最后一场
        if (playerConsecutiveGames[player.id] > 0) {
          // 如果该选手已经有连续记录
          if (isPlaying) {
            // 继续连续
            playerConsecutiveGames[player.id]++
          } else {
            // 连续中断，不再往前查找
            // 保持当前值不变
          }
        }
        // 如果该选手还没有连续记录（=0），则不处理
      }
    }
  }
}

// 评估赛程质量
function evaluateSchedule(matches, playerGameCount, usedMatchKeys, teammateCount) {
  let score = 100

  // 检查是否达到12场
  if (matches.length !== 12) {
    score -= (12 - matches.length) * 10
  }

  // 检查每人是否都是8场
  const gameCounts = Object.values(playerGameCount)
  const minGames = Math.min(...gameCounts)
  const maxGames = Math.max(...gameCounts)
  const gamesDiff = maxGames - minGames

  score -= gamesDiff * 20

  // 检查是否有重复对局
  if (usedMatchKeys.size !== matches.length) {
    score -= (matches.length - usedMatchKeys.size) * 30
  }

  // 检查组队次数是否均衡
  if (teammateCount) {
    const allCounts = []
    Object.keys(teammateCount).forEach(p1 => {
      Object.keys(teammateCount[p1]).forEach(p2 => {
        if (parseInt(p1) < parseInt(p2)) { // 避免重复计数
          allCounts.push(teammateCount[p1][p2])
        }
      })
    })

    if (allCounts.length > 0) {
      const minCount = Math.min(...allCounts)
      const maxCount = Math.max(...allCounts)
      const countDiff = maxCount - minCount
      score -= countDiff * 5
    }
  }

  return Math.max(0, score)
}

// 统计并打印组队次数
function printTeammateStats(matches, players) {
  console.log('printTeammateStats 函数被调用')
  console.log(`matches 数量: ${matches.length}`)
  console.log(`players 数量: ${players.length}`)

  // 初始化组队次数统计
  const teammateCount = {}
  players.forEach(p1 => {
    teammateCount[p1.id] = {}
    players.forEach(p2 => {
      if (p1.id !== p2.id) {
        teammateCount[p1.id][p2.id] = 0
      }
    })
  })

  // 统计每场比赛的组队情况
  matches.forEach(match => {
    // team1 的两个人是队友
    const [p1, p2] = match.team1
    teammateCount[p1.id][p2.id]++
    teammateCount[p2.id][p1.id]++

    // team2 的两个人是队友
    const [p3, p4] = match.team2
    teammateCount[p3.id][p4.id]++
    teammateCount[p4.id][p3.id]++
  })

  // 打印统计结果
  console.log('\n========== 组队次数统计 ==========')
  players.forEach(player => {
    console.log(`\n${player.name} 的组队情况：`)
    players.forEach(teammate => {
      if (player.id !== teammate.id) {
        const count = teammateCount[player.id][teammate.id]
        console.log(`  与 ${teammate.name} 组队: ${count} 次`)
      }
    })
  })
  console.log('\n==================================\n')
}

module.exports = {
  generateMatchSchedule
}
