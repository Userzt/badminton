// API 服务层 - 统一管理所有接口调用

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002/api'

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL
  }

  // 通用请求方法
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || `HTTP error! status: ${response.status}`)
      }

      return data
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  // GET 请求
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' })
  }

  // POST 请求
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  // PUT 请求
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  // DELETE 请求
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' })
  }

  // 比赛相关接口
  async getMatches() {
    return this.get('/matches')
  }

  async createMatch(matchData) {
    return this.post('/matches', matchData)
  }

  async getMatch(matchId) {
    return this.get(`/matches/${matchId}`)
  }

  async updateMatch(matchId, matchData) {
    return this.put(`/matches/${matchId}`, matchData)
  }

  // 选手相关接口
  async getPlayers(matchId) {
    return this.get(`/matches/${matchId}/players`)
  }

  async addPlayer(matchId, playerData) {
    return this.post(`/matches/${matchId}/players`, playerData)
  }

  async updatePlayer(matchId, playerId, playerData) {
    return this.put(`/matches/${matchId}/players/${playerId}`, playerData)
  }

  async deletePlayer(matchId, playerId) {
    return this.delete(`/matches/${matchId}/players/${playerId}`)
  }

  // 比赛对阵相关接口
  async generateGames(matchId) {
    return this.post(`/matches/${matchId}/generate-games`)
  }

  async getGames(matchId) {
    return this.get(`/matches/${matchId}/games`)
  }

  async clearGames(matchId) {
    return this.delete(`/matches/${matchId}/games`)
  }

  async updateGameScore(matchId, gameId, scoreData) {
    return this.put(`/matches/${matchId}/games/${gameId}/score`, scoreData)
  }

  // 比赛结果相关接口
  async getResults(matchId) {
    return this.get(`/matches/${matchId}/results`)
  }

  async getStats(matchId) {
    return this.get(`/matches/${matchId}/stats`)
  }
}

// 创建单例实例
export const apiService = new ApiService()

// 导出具体的 API 方法，方便使用
export const matchApi = {
  create: (data) => apiService.createMatch(data),
  get: (id) => apiService.getMatch(id),
  update: (id, data) => apiService.updateMatch(id, data)
}

export const playerApi = {
  list: (matchId) => apiService.getPlayers(matchId),
  add: (matchId, data) => apiService.addPlayer(matchId, data),
  update: (matchId, playerId, data) => apiService.updatePlayer(matchId, playerId, data),
  delete: (matchId, playerId) => apiService.deletePlayer(matchId, playerId)
}

export const gameApi = {
  generate: (matchId) => apiService.generateGames(matchId),
  list: (matchId) => apiService.getGames(matchId),
  updateScore: (matchId, gameId, data) => apiService.updateGameScore(matchId, gameId, data)
}

export const resultApi = {
  get: (matchId) => apiService.getResults(matchId),
  getStats: (matchId) => apiService.getStats(matchId)
}

export default apiService