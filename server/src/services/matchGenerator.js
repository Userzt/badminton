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
  const targetMatches = 12
  const targetGamesPerPlayer = 8
  const maxConsecutiveGames = 2

  // 初始化选手统计
  players.forEach(player => {
    playerGameCount[player.id] = 0
    playerConsecutiveGames[player.id] = 0
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
  const score = evaluateSchedule(selectedMatches, playerGameCount, usedMatchKeys)

  return {
    success: selectedMatches.length === targetMatches,
    matches: selectedMatches,
    score
  }
}

// 重新计算连续参赛次数
function recalculateConsecutiveGames(matches, players, playerConsecutiveGames) {
  // 重置
  players.forEach(player => {
    playerConsecutiveGames[player.id] = 0
  })

  // 从后往前计算最后的连续参赛
  if (matches.length === 0) return

  for (let i = matches.length - 1; i >= 0; i--) {
    const match = matches[i]
    const allPlayers = [...match.team1, ...match.team2]

    players.forEach(player => {
      const isPlaying = allPlayers.some(p => p.id === player.id)

      if (i === matches.length - 1) {
        // 最后一场
        if (isPlaying) {
          playerConsecutiveGames[player.id] = 1
        }
      } else {
        // 检查是否连续
        if (isPlaying && playerConsecutiveGames[player.id] > 0) {
          playerConsecutiveGames[player.id]++
        } else if (!isPlaying) {
          playerConsecutiveGames[player.id] = 0
        }
      }
    })
  }
}

// 评估赛程质量
function evaluateSchedule(matches, playerGameCount, usedMatchKeys) {
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

  return Math.max(0, score)
}

module.exports = {
  generateMatchSchedule
}
