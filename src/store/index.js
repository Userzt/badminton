import { reactive } from 'vue'
import { apiService } from '../services/api.js'

// 获取当前时间的格式化字符串
function getCurrentTimeString() {
  const now = new Date()
  const month = now.getMonth() + 1
  const day = now.getDate()
  const weekdays = ['日', '一', '二', '三', '四', '五', '六']
  const weekday = weekdays[now.getDay()]

  return `${month}月${day}日 周${weekday} (2小时21:00-23:00)`
}

// 全局状态管理
export const store = reactive({
  // 当前比赛ID
  currentMatchId: null,

  // 参赛选手
  players: [],

  // 比赛信息
  matchInfo: {
    title: '6人多人轮转赛',
    date: '12-13发布',
    time: getCurrentTimeString(),
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

  // 可选头像列表 - 使用public/avatars中的6张图片
  avatarOptions: [
    '/avatars/1.jpg',
    '/avatars/2.png',
    '/avatars/3.jpg',
    '/avatars/4.jpg',
    '/avatars/5.jpg',
    '/avatars/6.jpg'
  ],

  // 初始化数据
  async init() {
    try {
      await this.loadCurrentMatch()
      if (this.currentMatchId) {
        await this.loadPlayers()
        await this.loadMatches()
      }
    } catch (error) {
      console.error('初始化失败:', error)
    }
  },

  // 刷新所有数据（用于切换标签页时）
  async refresh() {
    try {
      if (this.currentMatchId) {
        await Promise.all([
          this.loadPlayers(),
          this.loadMatches()
        ])
        console.log('数据已刷新')
      }
    } catch (error) {
      console.error('刷新数据失败:', error)
    }
  },

  // 加载当前比赛
  async loadCurrentMatch() {
    try {
      const response = await apiService.getMatches()
      if (response.success && response.data && response.data.length > 0) {
        // 使用最新的比赛
        const latestMatch = response.data[0]
        this.currentMatchId = latestMatch.id
        this.matchInfo = {
          title: latestMatch.title,
          date: latestMatch.date,
          time: latestMatch.time,
          location: latestMatch.location,
          organizer: latestMatch.organizer,
          type: latestMatch.type
        }
      } else {
        // 如果没有比赛，创建一个新比赛
        await this.createNewMatch()
      }
    } catch (error) {
      console.error('加载比赛失败:', error)
      // 创建新比赛作为后备方案
      await this.createNewMatch()
    }
  },

  // 创建新比赛
  async createNewMatch() {
    try {
      const matchData = {
        title: '6人多人轮转赛',
        date: '12-13发布',
        time: getCurrentTimeString(),
        location: '钱塘区·钱塘文体中心',
        organizer: 'cy',
        type: '多人轮转赛'
      }

      const response = await apiService.createMatch(matchData)
      if (response.success) {
        this.currentMatchId = response.data.id
        this.matchInfo = matchData
      }
    } catch (error) {
      console.error('创建比赛失败:', error)
    }
  },

  // 再来一场 - 创建新比赛并保留选手
  async startNewRound() {
    if (!this.currentMatchId) {
      return { success: false, message: '没有当前比赛' }
    }

    try {
      // 1. 保存当前选手信息
      const currentPlayers = [...this.players]

      // 2. 直接创建新比赛（不清空当前比赛数据，保留历史记录）
      const matchData = {
        title: '6人多人轮转赛',
        date: '12-13发布',
        time: getCurrentTimeString(),
        location: '钱塘区·钱塘文体中心',
        organizer: 'cy',
        type: '多人轮转赛'
      }

      const response = await apiService.createMatch(matchData)
      if (!response.success) {
        return { success: false, message: '创建新比赛失败' }
      }

      // 3. 更新当前比赛信息
      this.currentMatchId = response.data.id
      this.matchInfo = matchData

      // 4. 将选手添加到新比赛中
      for (const player of currentPlayers) {
        await apiService.addPlayer(this.currentMatchId, {
          name: player.name,
          avatar: player.avatar
        })
      }

      // 5. 重新加载数据
      await this.loadPlayers()
      await this.loadMatches()

      return { success: true, message: '新比赛创建成功，选手已保留，历史数据已保存' }

    } catch (error) {
      console.error('再来一场失败:', error)
      return { success: false, message: '网络错误，创建失败' }
    }
  },

  // 加载选手数据
  async loadPlayers() {
    if (!this.currentMatchId) {
      console.warn('没有当前比赛ID，无法加载选手')
      return
    }

    try {
      const response = await apiService.getPlayers(this.currentMatchId)
      if (response.success) {
        this.players = response.data || []
      }
    } catch (error) {
      console.error('加载选手失败:', error)
      // 如果API失败，使用默认数据
      this.players = [
        { id: 1, name: '33', avatar: '/avatars/1.jpg' },
        { id: 2, name: '左手', avatar: '/avatars/2.png' },
        { id: 3, name: '大哥', avatar: '/avatars/3.jpg' },
        { id: 4, name: '腰子', avatar: '/avatars/4.jpg' },
        { id: 5, name: '网红', avatar: '/avatars/5.jpg' },
        { id: 6, name: 'cy', avatar: '/avatars/6.jpg' }
      ]
    }
  },

  // 加载比赛数据
  async loadMatches() {
    if (!this.currentMatchId) {
      console.warn('没有当前比赛ID，无法加载比赛数据')
      return
    }

    try {
      const response = await apiService.getGames(this.currentMatchId)
      if (response.success) {
        this.matches = response.data || []
        this.calculateResults()
      }
    } catch (error) {
      console.error('加载比赛失败:', error)
      this.matches = []
    }
  },

  // 添加参赛选手
  async addPlayer(name) {
    if (this.players.length >= 6) {
      return { success: false, message: '参赛人数已满（最多6人）' }
    }

    if (!name.trim()) {
      return { success: false, message: '请输入选手姓名' }
    }

    if (this.players.some(p => p.name === name.trim())) {
      return { success: false, message: '选手姓名已存在' }
    }

    try {
      const playerData = {
        name: name.trim(),
        avatar: this.getRandomAvatar()
      }

      const response = await apiService.addPlayer(this.currentMatchId, playerData)
      if (response.success) {
        await this.loadPlayers() // 重新加载选手列表
        return { success: true, message: '添加成功' }
      } else {
        return { success: false, message: response.message || '添加失败' }
      }
    } catch (error) {
      console.error('添加选手失败:', error)
      return { success: false, message: '网络错误，添加失败' }
    }
  },

  // 删除参赛选手
  async removePlayer(playerId, confirmed = false) {
    // 如果已经生成了赛程，需要用户确认
    if (this.matches.length > 0 && !confirmed) {
      return {
        success: false,
        needConfirm: true,
        message: '已生成赛程，删除选手将清空所有赛程数据，确定要删除吗？'
      }
    }

    try {
      // 如果有赛程数据，先清空赛程
      if (this.matches.length > 0) {
        const clearResponse = await apiService.clearGames(this.currentMatchId)
        if (!clearResponse.success) {
          return { success: false, message: '清空赛程失败' }
        }
      }

      // 删除选手
      const response = await apiService.deletePlayer(this.currentMatchId, playerId)
      if (response.success) {
        await this.loadPlayers() // 重新加载选手列表
        await this.loadMatches() // 重新加载比赛数据（应该为空）
        return { success: true, message: '删除成功，赛程已清空' }
      } else {
        return { success: false, message: response.message || '删除失败' }
      }
    } catch (error) {
      console.error('删除选手失败:', error)
      return { success: false, message: '网络错误，删除失败' }
    }
  },

  // 编辑参赛选手
  async editPlayer(playerId, name, avatar) {
    if (!name.trim()) {
      return { success: false, message: '请输入选手姓名' }
    }

    if (this.players.some(p => p.name === name.trim() && p.id !== playerId)) {
      return { success: false, message: '选手姓名已存在' }
    }

    try {
      const playerData = {
        name: name.trim(),
        avatar: avatar
      }

      const response = await apiService.updatePlayer(this.currentMatchId, playerId, playerData)
      if (response.success) {
        await this.loadPlayers() // 重新加载选手列表
        return { success: true, message: '修改成功' }
      } else {
        return { success: false, message: response.message || '修改失败' }
      }
    } catch (error) {
      console.error('修改选手失败:', error)
      return { success: false, message: '网络错误，修改失败' }
    }
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

  // 生成比赛对阵 - 调用后端API
  async generateMatches() {
    if (this.players.length !== 6) {
      console.error('需要6名选手才能生成比赛')
      return { success: false, message: '需要6名选手才能生成比赛' }
    }

    try {
      const response = await apiService.generateGames(this.currentMatchId)
      if (response.success) {
        await this.loadMatches() // 重新加载比赛数据
        this.currentMatchIndex = 0
        return { success: true, message: '比赛对阵生成成功' }
      } else {
        return { success: false, message: response.message || '生成失败' }
      }
    } catch (error) {
      console.error('生成比赛失败:', error)
      return { success: false, message: '网络错误，生成失败' }
    }
  },

  // 更新比分
  async updateScore(matchId, team1Score, team2Score) {
    try {
      const scoreData = {
        score1: team1Score,
        score2: team2Score
      }

      const response = await apiService.updateGameScore(this.currentMatchId, matchId, scoreData)
      if (response.success) {
        await this.loadMatches() // 重新加载比赛数据
        return { success: true, message: '比分更新成功' }
      } else {
        return { success: false, message: response.message || '更新失败' }
      }
    } catch (error) {
      console.error('更新比分失败:', error)
      return { success: false, message: '网络错误，更新失败' }
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

  // 计算比赛结果 - 调用后端API
  async calculateResults() {
    try {
      const response = await apiService.getResults(this.currentMatchId)
      if (response.success) {
        this.results = response.data || []
      }
    } catch (error) {
      console.error('获取结果失败:', error)
      this.results = []
    }
  }
})

// 初始化应用时加载数据
store.init()