// 比赛对阵生成服务 - 移植前端算法到后端

function generateMatchSchedule(players) {
  if (players.length !== 6) {
    return {
      success: false,
      message: '需要6名选手才能生成比赛对阵'
    }
  }

  // 生成所有可能的组合（C(6,2) = 15种组合）
  const allPairs = generateAllPairs(players)
  
  let bestMatches = []
  let bestScore = -1
  
  // 尝试多次生成最优方案
  for (let attempt = 0; attempt < 100; attempt++) {
    const result = generateOptimalSchedule(players, allPairs)
    
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

// 生成所有可能的选手组合
function generateAllPairs(players) {
  const pairs = []
  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      pairs.push([players[i], players[j]])
    }
  }
  return pairs
}

// 生成最优赛程
function generateOptimalSchedule(players, allPairs) {
  const matches = []
  const pairUsageCount = new Map()
  const pairLastUsed = new Map()
  const playerGameCount = {}
  const playerConsecutiveGames = {}
  const playerLastPlayed = {}
  const maxUsagePerPair = 2
  const targetMatches = 12
  const targetGamesPerPlayer = 8
  const maxConsecutiveGames = 2
  
  // 初始化组合统计
  allPairs.forEach(pair => {
    const pairKey = getPairKey(pair)
    pairUsageCount.set(pairKey, 0)
    pairLastUsed.set(pairKey, -2)
  })
  
  // 初始化选手统计
  players.forEach(player => {
    playerGameCount[player.id] = 0
    playerConsecutiveGames[player.id] = 0
    playerLastPlayed[player.id] = -2
  })
  
  let round = 0
  let consecutiveFailures = 0
  const maxConsecutiveFailures = 30
  
  // 生成固定12场比赛
  while (matches.length < targetMatches && round < 100 && consecutiveFailures < maxConsecutiveFailures) {
    const selectedPairs = selectPairsForRound(
      allPairs,
      pairUsageCount,
      pairLastUsed,
      playerGameCount,
      playerConsecutiveGames,
      playerLastPlayed,
      matches.length,
      maxUsagePerPair,
      targetGamesPerPlayer,
      maxConsecutiveGames
    )
    
    if (!selectedPairs || selectedPairs.length !== 2) {
      consecutiveFailures++
      round++
      continue
    }
    
    // 检查是否有选手重复
    const allPlayersInRound = [...selectedPairs[0], ...selectedPairs[1]]
    const uniquePlayers = new Set(allPlayersInRound.map(p => p.id))
    
    if (uniquePlayers.size !== 4) {
      consecutiveFailures++
      round++
      continue
    }
    
    // 检查选手参赛次数是否会超限
    const wouldExceedLimit = allPlayersInRound.some(player => 
      playerGameCount[player.id] >= targetGamesPerPlayer
    )
    
    if (wouldExceedLimit) {
      consecutiveFailures++
      round++
      continue
    }
    
    // 检查连续参赛限制
    const wouldExceedConsecutive = allPlayersInRound.some(player => 
      playerConsecutiveGames[player.id] >= maxConsecutiveGames
    )
    
    if (wouldExceedConsecutive) {
      consecutiveFailures++
      round++
      continue
    }
    
    // 重置连续失败计数
    consecutiveFailures = 0
    
    // 创建比赛
    const currentMatchIndex = matches.length
    matches.push({
      id: currentMatchIndex + 1,
      round: `第${currentMatchIndex + 1}场`,
      team1: selectedPairs[0],
      team2: selectedPairs[1]
    })
    
    // 更新组合使用统计
    selectedPairs.forEach(pair => {
      const pairKey = getPairKey(pair)
      pairUsageCount.set(pairKey, pairUsageCount.get(pairKey) + 1)
      pairLastUsed.set(pairKey, currentMatchIndex)
    })
    
    // 更新选手统计
    players.forEach(player => {
      const isPlaying = allPlayersInRound.some(p => p.id === player.id)
      
      if (isPlaying) {
        playerGameCount[player.id]++
        playerConsecutiveGames[player.id]++
        playerLastPlayed[player.id] = currentMatchIndex
      } else {
        playerConsecutiveGames[player.id] = 0
      }
    })
    
    round++
  }
  
  // 评估赛程质量
  const score = evaluateSchedule(matches, players, pairUsageCount, playerGameCount)
  
  return {
    success: matches.length === targetMatches,
    matches,
    score
  }
}

// 为当前轮次选择组合
function selectPairsForRound(allPairs, pairUsageCount, pairLastUsed, playerGameCount, playerConsecutiveGames, playerLastPlayed, currentRound, maxUsagePerPair, targetGamesPerPlayer, maxConsecutiveGames) {
  const availablePairs = allPairs.filter(pair => {
    const pairKey = getPairKey(pair)
    const lastUsed = pairLastUsed.get(pairKey)
    const usageCount = pairUsageCount.get(pairKey)
    
    if (currentRound - lastUsed <= 1 || usageCount >= maxUsagePerPair) {
      return false
    }
    
    const canPlayTotal = pair.every(player => playerGameCount[player.id] < targetGamesPerPlayer)
    if (!canPlayTotal) {
      return false
    }
    
    const canPlayConsecutive = pair.every(player => 
      playerConsecutiveGames[player.id] < maxConsecutiveGames
    )
    
    return canPlayConsecutive
  })
  
  if (availablePairs.length < 2) {
    return null
  }
  
  // 按优先级排序
  availablePairs.sort((a, b) => {
    const countA = pairUsageCount.get(getPairKey(a))
    const countB = pairUsageCount.get(getPairKey(b))
    
    if (countA !== countB) {
      return countA - countB
    }
    
    const gamesA = a.reduce((sum, player) => sum + playerGameCount[player.id], 0)
    const gamesB = b.reduce((sum, player) => sum + playerGameCount[player.id], 0)
    
    if (gamesA !== gamesB) {
      return gamesA - gamesB
    }
    
    const consecutiveA = a.reduce((sum, player) => sum + playerConsecutiveGames[player.id], 0)
    const consecutiveB = b.reduce((sum, player) => sum + playerConsecutiveGames[player.id], 0)
    
    if (consecutiveA !== consecutiveB) {
      return consecutiveA - consecutiveB
    }
    
    return Math.random() - 0.5
  })
  
  // 找到两个不重复选手的组合
  for (let i = 0; i < availablePairs.length; i++) {
    for (let j = i + 1; j < availablePairs.length; j++) {
      const pair1 = availablePairs[i]
      const pair2 = availablePairs[j]
      
      const players1 = pair1.map(p => p.id)
      const players2 = pair2.map(p => p.id)
      const hasOverlap = players1.some(id => players2.includes(id))
      
      if (!hasOverlap) {
        return [pair1, pair2]
      }
    }
  }
  
  return null
}

// 获取组合的唯一标识
function getPairKey(pair) {
  const ids = pair.map(p => p.id).sort()
  return `${ids[0]}-${ids[1]}`
}

// 评估赛程质量
function evaluateSchedule(matches, players, pairUsageCount, playerGameCount) {
  let score = 100
  
  if (matches.length !== 12) {
    score -= (12 - matches.length) * 10
  }
  
  const gameCounts = Object.values(playerGameCount)
  const minGames = Math.min(...gameCounts)
  const maxGames = Math.max(...gameCounts)
  const gamesDiff = maxGames - minGames
  
  score -= gamesDiff * 20
  
  const pairCounts = Array.from(pairUsageCount.values())
  const minPairCount = Math.min(...pairCounts)
  const maxPairCount = Math.max(...pairCounts)
  const pairCountDiff = maxPairCount - minPairCount
  
  score -= pairCountDiff * 3
  
  return Math.max(0, score)
}

module.exports = {
  generateMatchSchedule
}