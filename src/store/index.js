import { reactive } from 'vue'

// 全局状态管理
export const store = reactive({
  // 参赛选手
  players: [
    { id: 1, name: '33', avatar: '🏸' },
    { id: 2, name: '左手', avatar: '🎯' },
    { id: 3, name: '大哥', avatar: '⭐' },
    { id: 4, name: '腰子', avatar: '🔥' },
    { id: 5, name: '网红', avatar: '🍜' },
    { id: 6, name: 'cy', avatar: '🎪' }
  ],
  
  // 比赛信息
  matchInfo: {
    title: '6人多人轮转赛',
    date: '12-13发布',
    time: '12月13日 上周六 (2小时21:00-23:00)',
    location: '钱塘区·钱塘文体中心',
    organizer: 'cy',
    type: '多人轮转赛'
  },
  
  // 比赛场次
  matches: [],
  
  // 比赛结果
  results: [],
  
  // 当前比赛进度
  currentMatchIndex: 0,
  
  // 可选头像列表
  avatarOptions: ['🏸', '🎯', '⭐', '🔥', '🍜', '🎪', '🎨', '🎵', '⚡', '🌟', '🎲', '🎭', '🎪', '🎨', '🎯', '🏆', '💎', '🌈', '🎊', '🎉'],
  
  // 添加参赛选手
  addPlayer(name, avatar) {
    if (this.players.length >= 6) {
      return { success: false, message: '参赛人数已满（最多6人）' }
    }
    
    if (!name.trim()) {
      return { success: false, message: '请输入选手姓名' }
    }
    
    if (this.players.some(p => p.name === name.trim())) {
      return { success: false, message: '选手姓名已存在' }
    }
    
    const newPlayer = {
      id: Date.now(),
      name: name.trim(),
      avatar: avatar || this.getRandomAvatar()
    }
    
    this.players.push(newPlayer)
    return { success: true, message: '添加成功' }
  },
  
  // 删除参赛选手
  removePlayer(playerId) {
    const index = this.players.findIndex(p => p.id === playerId)
    if (index > -1) {
      this.players.splice(index, 1)
      // 如果有比赛数据，需要重新生成
      if (this.matches.length > 0) {
        this.matches = []
        this.results = []
      }
      return { success: true, message: '删除成功' }
    }
    return { success: false, message: '选手不存在' }
  },
  
  // 编辑参赛选手
  editPlayer(playerId, name, avatar) {
    const player = this.players.find(p => p.id === playerId)
    if (!player) {
      return { success: false, message: '选手不存在' }
    }
    
    if (!name.trim()) {
      return { success: false, message: '请输入选手姓名' }
    }
    
    if (this.players.some(p => p.name === name.trim() && p.id !== playerId)) {
      return { success: false, message: '选手姓名已存在' }
    }
    
    player.name = name.trim()
    player.avatar = avatar
    return { success: true, message: '修改成功' }
  },
  
  // 获取随机头像
  getRandomAvatar() {
    const usedAvatars = this.players.map(p => p.avatar)
    const availableAvatars = this.avatarOptions.filter(avatar => !usedAvatars.includes(avatar))
    
    if (availableAvatars.length > 0) {
      return availableAvatars[Math.floor(Math.random() * availableAvatars.length)]
    }
    
    return this.avatarOptions[Math.floor(Math.random() * this.avatarOptions.length)]
  },
  
  // 生成比赛对阵 - 新规则：相同组合不能连续，组合次数均等
  generateMatches() {
    const players = [...this.players]
    
    if (players.length !== 6) {
      console.error('需要6名选手才能生成比赛')
      return
    }
    
    // 生成所有可能的组合（C(6,2) = 15种组合）
    const allPairs = this.generateAllPairs(players)
    console.log('所有可能的组合：', allPairs.map(pair => `${pair[0].name}-${pair[1].name}`))
    
    let bestMatches = []
    let bestScore = -1
    
    // 尝试多次生成最优方案
    for (let attempt = 0; attempt < 100; attempt++) {
      const result = this.generateOptimalSchedule(players, allPairs)
      
      if (result.success && result.score > bestScore) {
        bestScore = result.score
        bestMatches = result.matches
        
        // 如果找到完美方案，直接使用
        if (result.score >= 95) {
          break
        }
      }
    }
    
    this.matches = bestMatches
    this.currentMatchIndex = 0
    
    // 输出统计信息
    this.printNewScheduleStats(bestMatches, players, allPairs)
  },
  
  // 生成所有可能的选手组合
  generateAllPairs(players) {
    const pairs = []
    for (let i = 0; i < players.length; i++) {
      for (let j = i + 1; j < players.length; j++) {
        pairs.push([players[i], players[j]])
      }
    }
    return pairs
  },
  
  // 生成最优赛程 - 固定12场，每种组合最多2次，每人场次相等，连续上场限制
  generateOptimalSchedule(players, allPairs) {
    const matches = []
    const pairUsageCount = new Map() // 记录每个组合使用次数
    const pairLastUsed = new Map() // 记录每个组合最后使用的场次
    const playerGameCount = {} // 记录每个选手的参赛次数
    const playerConsecutiveGames = {} // 记录每个选手连续参赛次数
    const playerLastPlayed = {} // 记录每个选手最后参赛的场次
    const maxUsagePerPair = 2 // 每种组合最多使用2次
    const targetMatches = 12 // 固定12场比赛
    const targetGamesPerPlayer = 8 // 每人8场 (12场 × 4人 ÷ 6人 = 8场)
    const maxConsecutiveGames = 2 // 最多连续上场2次
    
    // 初始化组合统计
    allPairs.forEach(pair => {
      const pairKey = this.getPairKey(pair)
      pairUsageCount.set(pairKey, 0)
      pairLastUsed.set(pairKey, -2) // -2表示可以立即使用
    })
    
    // 初始化选手统计
    players.forEach(player => {
      playerGameCount[player.id] = 0
      playerConsecutiveGames[player.id] = 0
      playerLastPlayed[player.id] = -2 // -2表示可以立即参赛
    })
    
    let round = 0
    let consecutiveFailures = 0
    const maxConsecutiveFailures = 30 // 增加失败容忍度
    
    // 生成固定12场比赛
    while (matches.length < targetMatches && round < 100 && consecutiveFailures < maxConsecutiveFailures) {
      // 选择本轮的两个组合
      const selectedPairs = this.selectPairsForRound(
        allPairs, 
        pairUsageCount, 
        pairLastUsed, 
        playerGameCount,
        playerConsecutiveGames,
        playerLastPlayed,
        matches.length, // 当前场次
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
        team2: selectedPairs[1],
        score1: 0,
        score2: 0,
        status: 'pending',
        winner: null
      })
      
      // 更新组合使用统计
      selectedPairs.forEach(pair => {
        const pairKey = this.getPairKey(pair)
        pairUsageCount.set(pairKey, pairUsageCount.get(pairKey) + 1)
        pairLastUsed.set(pairKey, currentMatchIndex)
      })
      
      // 更新选手统计
      players.forEach(player => {
        const isPlaying = allPlayersInRound.some(p => p.id === player.id)
        
        if (isPlaying) {
          // 选手参赛
          playerGameCount[player.id]++
          playerConsecutiveGames[player.id]++
          playerLastPlayed[player.id] = currentMatchIndex
        } else {
          // 选手休息，重置连续参赛计数
          playerConsecutiveGames[player.id] = 0
        }
      })
      
      round++
    }
    
    // 评估赛程质量
    const score = this.evaluateFixedSchedule(matches, players, allPairs, pairUsageCount, playerGameCount, maxUsagePerPair, targetGamesPerPlayer)
    
    return {
      success: matches.length === targetMatches,
      matches,
      score,
      pairUsageCount,
      playerGameCount
    }
  },
  
  // 为当前轮次选择组合
  selectPairsForRound(allPairs, pairUsageCount, pairLastUsed, playerGameCount, playerConsecutiveGames, playerLastPlayed, currentRound, maxUsagePerPair, targetGamesPerPlayer, maxConsecutiveGames) {
    // 获取可用的组合
    const availablePairs = allPairs.filter(pair => {
      const pairKey = this.getPairKey(pair)
      const lastUsed = pairLastUsed.get(pairKey)
      const usageCount = pairUsageCount.get(pairKey)
      
      // 组合不能连续使用（至少间隔1场）且未达到使用上限
      if (currentRound - lastUsed <= 1 || usageCount >= maxUsagePerPair) {
        return false
      }
      
      // 检查组合中的选手是否还能参赛（总场次限制）
      const canPlayTotal = pair.every(player => playerGameCount[player.id] < targetGamesPerPlayer)
      
      if (!canPlayTotal) {
        return false
      }
      
      // 检查组合中的选手是否超过连续参赛限制
      const canPlayConsecutive = pair.every(player => 
        playerConsecutiveGames[player.id] < maxConsecutiveGames
      )
      
      return canPlayConsecutive
    })
    
    if (availablePairs.length < 2) {
      return null
    }
    
    // 按优先级排序选择组合
    availablePairs.sort((a, b) => {
      const countA = pairUsageCount.get(this.getPairKey(a))
      const countB = pairUsageCount.get(this.getPairKey(b))
      
      // 优先选择使用次数少的组合
      if (countA !== countB) {
        return countA - countB
      }
      
      // 优先选择参赛次数少的选手组合
      const gamesA = a.reduce((sum, player) => sum + playerGameCount[player.id], 0)
      const gamesB = b.reduce((sum, player) => sum + playerGameCount[player.id], 0)
      
      if (gamesA !== gamesB) {
        return gamesA - gamesB
      }
      
      // 优先选择连续参赛次数少的选手组合
      const consecutiveA = a.reduce((sum, player) => sum + playerConsecutiveGames[player.id], 0)
      const consecutiveB = b.reduce((sum, player) => sum + playerConsecutiveGames[player.id], 0)
      
      if (consecutiveA !== consecutiveB) {
        return consecutiveA - consecutiveB
      }
      
      // 最后随机选择
      return Math.random() - 0.5
    })
    
    // 尝试找到两个不重复选手的组合
    for (let i = 0; i < availablePairs.length; i++) {
      for (let j = i + 1; j < availablePairs.length; j++) {
        const pair1 = availablePairs[i]
        const pair2 = availablePairs[j]
        
        // 检查是否有选手重复
        const players1 = pair1.map(p => p.id)
        const players2 = pair2.map(p => p.id)
        const hasOverlap = players1.some(id => players2.includes(id))
        
        if (!hasOverlap) {
          return [pair1, pair2]
        }
      }
    }
    
    return null
  },
  
  // 获取组合的唯一标识
  getPairKey(pair) {
    const ids = pair.map(p => p.id).sort()
    return `${ids[0]}-${ids[1]}`
  },
  

  
  // 评估固定赛程质量
  evaluateFixedSchedule(matches, players, allPairs, pairUsageCount, playerGameCount, maxUsagePerPair, targetGamesPerPlayer) {
    let score = 100
    
    // 检查是否达到目标场次数
    if (matches.length !== 12) {
      score -= (12 - matches.length) * 10 // 严重扣分
    }
    
    // 检查每个选手的参赛次数是否均等
    const gameCounts = Object.values(playerGameCount)
    const minGames = Math.min(...gameCounts)
    const maxGames = Math.max(...gameCounts)
    const gamesDiff = maxGames - minGames
    
    // 参赛次数差异扣分（最重要的指标）
    score -= gamesDiff * 20
    
    // 奖励达到目标参赛次数的选手
    const playersAtTarget = gameCounts.filter(count => count === targetGamesPerPlayer).length
    score += playersAtTarget * 5
    
    // 检查组合使用次数的均衡性
    const pairCounts = Array.from(pairUsageCount.values())
    const minPairCount = Math.min(...pairCounts)
    const maxPairCount = Math.max(...pairCounts)
    const pairCountDiff = maxPairCount - minPairCount
    
    // 组合使用次数差异扣分
    score -= pairCountDiff * 3
    
    // 奖励达到最大使用次数的组合
    const maxUsedPairs = pairCounts.filter(count => count === maxUsagePerPair).length
    score += maxUsedPairs * 2
    
    // 检查组合连续使用情况
    let pairConsecutivePenalty = 0
    for (let i = 1; i < matches.length; i++) {
      const prevMatch = matches[i - 1]
      const currMatch = matches[i]
      
      const prevPairs = [
        this.getPairKey(prevMatch.team1),
        this.getPairKey(prevMatch.team2)
      ]
      
      const currPairs = [
        this.getPairKey(currMatch.team1),
        this.getPairKey(currMatch.team2)
      ]
      
      // 检查是否有相同组合连续出现
      const hasConsecutive = prevPairs.some(pair => currPairs.includes(pair))
      if (hasConsecutive) {
        pairConsecutivePenalty += 50 // 严重扣分
      }
    }
    
    score -= pairConsecutivePenalty
    
    // 检查选手连续参赛情况
    let playerConsecutivePenalty = 0
    players.forEach(player => {
      let consecutiveCount = 0
      let maxConsecutive = 0
      
      for (let i = 0; i < matches.length; i++) {
        const match = matches[i]
        const isPlaying = [...match.team1, ...match.team2].some(p => p.id === player.id)
        
        if (isPlaying) {
          consecutiveCount++
          maxConsecutive = Math.max(maxConsecutive, consecutiveCount)
        } else {
          consecutiveCount = 0
        }
      }
      
      // 连续超过2场扣分
      if (maxConsecutive > 2) {
        playerConsecutivePenalty += (maxConsecutive - 2) * 30
      }
    })
    
    score -= playerConsecutivePenalty
    
    return Math.max(0, score)
  },
  
  // 输出固定赛程统计
  printNewScheduleStats(matches, players, allPairs) {
    console.log('=== 固定12场比赛赛程生成完成 ===')
    console.log(`总场次: ${matches.length}/12`)
    
    // 统计每个选手的参赛场次
    const playerGameCount = {}
    players.forEach(player => {
      playerGameCount[player.id] = 0
    })
    
    matches.forEach(match => {
      [...match.team1, ...match.team2].forEach(player => {
        playerGameCount[player.id]++
      })
    })
    
    console.log('\n选手参赛统计（目标8场）：')
    players.forEach(player => {
      const count = playerGameCount[player.id]
      const status = count === 8 ? '✓' : count < 8 ? '↓' : '↑'
      console.log(`${player.name}: ${count}/8场 ${status}`)
    })
    
    // 统计组合使用次数
    const pairUsageCount = new Map()
    allPairs.forEach(pair => {
      pairUsageCount.set(this.getPairKey(pair), 0)
    })
    
    matches.forEach(match => {
      const pair1Key = this.getPairKey(match.team1)
      const pair2Key = this.getPairKey(match.team2)
      
      pairUsageCount.set(pair1Key, pairUsageCount.get(pair1Key) + 1)
      pairUsageCount.set(pair2Key, pairUsageCount.get(pair2Key) + 1)
    })
    
    console.log('\n组合使用统计（最多2次）：')
    let usedPairs = 0
    let maxUsedPairs = 0
    allPairs.forEach(pair => {
      const pairKey = this.getPairKey(pair)
      const count = pairUsageCount.get(pairKey)
      if (count > 0) usedPairs++
      if (count === 2) maxUsedPairs++
      const status = count === 2 ? '✓' : count === 1 ? '○' : '×'
      console.log(`${pair[0].name}-${pair[1].name}: ${count}/2次 ${status}`)
    })
    
    console.log(`\n组合使用概况: ${usedPairs}/15种组合被使用，${maxUsedPairs}种达到上限`)
    
    // 检查连续使用情况
    console.log('\n连续使用检查：')
    let hasViolation = false
    for (let i = 1; i < matches.length; i++) {
      const prevMatch = matches[i - 1]
      const currMatch = matches[i]
      
      const prevPairs = [
        this.getPairKey(prevMatch.team1),
        this.getPairKey(prevMatch.team2)
      ]
      
      const currPairs = [
        this.getPairKey(currMatch.team1),
        this.getPairKey(currMatch.team2)
      ]
      
      const hasConsecutive = prevPairs.some(pair => currPairs.includes(pair))
      if (hasConsecutive) {
        console.log(`⚠️ 第${i}场和第${i + 1}场有相同组合连续出现`)
        hasViolation = true
      }
    }
    
    if (!hasViolation) {
      console.log('✓ 无连续使用违规')
    }
    
    console.log('\n比赛对阵：')
    matches.forEach((match, index) => {
      console.log(`第${index + 1}场: ${match.team1[0].name}-${match.team1[1].name} VS ${match.team2[0].name}-${match.team2[1].name}`)
    })
    
    // 检查选手连续参赛情况
    console.log('\n选手连续参赛检查（最多2场）：')
    let hasPlayerViolation = false
    players.forEach(player => {
      let consecutiveCount = 0
      let maxConsecutive = 0
      const schedule = []
      
      for (let i = 0; i < matches.length; i++) {
        const match = matches[i]
        const isPlaying = [...match.team1, ...match.team2].some(p => p.id === player.id)
        
        schedule.push(isPlaying ? '●' : '○')
        
        if (isPlaying) {
          consecutiveCount++
          maxConsecutive = Math.max(maxConsecutive, consecutiveCount)
        } else {
          consecutiveCount = 0
        }
      }
      
      const status = maxConsecutive <= 2 ? '✓' : '×'
      console.log(`${player.name}: ${schedule.join('')} (最大连续${maxConsecutive}场) ${status}`)
      
      if (maxConsecutive > 2) {
        hasPlayerViolation = true
      }
    })
    
    // 总结
    const gameCounts = Object.values(playerGameCount)
    const minGames = Math.min(...gameCounts)
    const maxGames = Math.max(...gameCounts)
    const isBalanced = maxGames - minGames <= 0
    
    console.log('\n=== 赛程质量评估 ===')
    console.log(`场次均衡: ${isBalanced ? '✓ 完全均衡' : `× 差异${maxGames - minGames}场`}`)
    console.log(`组合限制: ${maxUsedPairs}/${allPairs.length}种组合达到上限`)
    console.log(`组合连续: ${hasViolation ? '× 有违规' : '✓ 无违规'}`)
    console.log(`选手连续: ${hasPlayerViolation ? '× 有违规' : '✓ 无违规'}`)
  },
  

  
  // 更新比分
  updateScore(matchId, team1Score, team2Score) {
    const match = this.matches.find(m => m.id === matchId)
    if (match) {
      match.score1 = team1Score
      match.score2 = team2Score
      
      // 确定胜负
      if (team1Score > team2Score) {
        match.winner = 1
      } else if (team2Score > team1Score) {
        match.winner = 2
      } else {
        match.winner = null
      }
      
      // 更新比赛状态：如果有比分输入且不为0:0，则标记为已完成
      if (team1Score > 0 || team2Score > 0) {
        match.status = 'finished'
      } else {
        match.status = 'pending'
      }
      
      // 重新计算结果
      this.calculateResults()
    }
  },
  
  // 完成比赛（保留此方法以兼容现有代码）
  finishMatch(matchId) {
    const match = this.matches.find(m => m.id === matchId)
    if (match && (match.score1 > 0 || match.score2 > 0)) {
      match.status = 'finished'
      this.calculateResults()
    }
  },
  
  // 计算比赛结果
  calculateResults() {
    const playerResults = {}
    
    // 初始化结果
    this.players.forEach(player => {
      playerResults[player.id] = {
        ...player,
        wins: 0,
        losses: 0,
        totalScore: 0,
        opponentScore: 0,
        scoreDiff: 0
      }
    })
    
    // 统计每场比赛结果
    this.matches.filter(m => m.status === 'finished').forEach(match => {
      const { team1, team2, score1, score2, winner } = match
      
      // 更新队伍1选手数据
      team1.forEach(player => {
        const result = playerResults[player.id]
        result.totalScore += score1
        result.opponentScore += score2
        
        if (winner === 1) {
          result.wins++
        } else if (winner === 2) {
          result.losses++
        }
      })
      
      // 更新队伍2选手数据
      team2.forEach(player => {
        const result = playerResults[player.id]
        result.totalScore += score2
        result.opponentScore += score1
        
        if (winner === 2) {
          result.wins++
        } else if (winner === 1) {
          result.losses++
        }
      })
    })
    
    // 计算净胜分
    Object.values(playerResults).forEach(result => {
      result.scoreDiff = result.totalScore - result.opponentScore
    })
    
    // 排序：胜局优先，然后按净胜分
    this.results = Object.values(playerResults).sort((a, b) => {
      if (b.wins !== a.wins) {
        return b.wins - a.wins // 胜局多的在前
      }
      return b.scoreDiff - a.scoreDiff // 净胜分高的在前
    })
  }
})

// 不自动生成比赛对阵，等待用户手动添加选手后生成