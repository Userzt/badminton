<template>
  <div class="results">
    <!-- 成绩排行榜 -->
    <a-card class="mobile-card">
      <template #title>
        <div class="results-header">
          <span>比赛成绩</span>
        </div>
      </template>
      
      <div class="ranking-header">
        <div class="col-rank">排名</div>
        <div class="col-player">组合</div>
        <div class="col-record">胜局</div>
        <div class="col-score">胜分</div>
      </div>
      
      <div class="ranking-list">
        <div 
          v-for="(result, index) in store.results" 
          :key="result.id"
          class="ranking-item"
          :class="getRankingClass(index)"
        >
          <div class="col-rank">
            <div class="rank-number" :class="getRankClass(index)">
              {{ index + 1 }}
            </div>
          </div>
          
          <div class="col-player">
            <div class="player-info">
              <div class="player-avatar">{{ result.avatar }}</div>
              <div class="player-name">{{ result.name }}</div>
            </div>
          </div>
          
          <div class="col-record">
            <span class="wins">{{ result.wins }}</span>
            <span class="separator">-</span>
            <span class="losses">{{ result.losses }}</span>
          </div>
          
          <div class="col-score">
            <span :class="{ 'positive': result.scoreDiff > 0, 'negative': result.scoreDiff < 0 }">
              {{ result.scoreDiff > 0 ? '+' : '' }}{{ result.scoreDiff }}
            </span>
          </div>
        </div>
      </div>
    </a-card>
    
    <!-- 详细统计 -->
    <a-card class="mobile-card stats-card">
      <template #title>
        <span>详细统计</span>
      </template>
      
      <a-collapse ghost>
        <a-collapse-panel 
          v-for="(result, index) in store.results" 
          :key="result.id"
          :header="getPlayerStatsHeader(result, index)"
        >
          <div class="player-stats">
            <div class="stat-row">
              <span class="stat-label">总得分:</span>
              <span class="stat-value">{{ result.totalScore }}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">总失分:</span>
              <span class="stat-value">{{ result.opponentScore }}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">净胜分:</span>
              <span class="stat-value" :class="{ 'positive': result.scoreDiff > 0, 'negative': result.scoreDiff < 0 }">
                {{ result.scoreDiff > 0 ? '+' : '' }}{{ result.scoreDiff }}
              </span>
            </div>
            <div class="stat-row">
              <span class="stat-label">胜率:</span>
              <span class="stat-value">
                {{ result.wins + result.losses > 0 ? Math.round((result.wins / (result.wins + result.losses)) * 100) : 0 }}%
              </span>
            </div>
          </div>
        </a-collapse-panel>
      </a-collapse>
    </a-card>
    
    <!-- 底部操作 -->
    <div class="bottom-actions">
      <a-button 
        type="primary" 
        class="mobile-btn" 
        block
        @click="downloadReport"
      >
        <DownloadOutlined />
        成绩海报
      </a-button>
    </div>
  </div>
</template>

<script>
import { onMounted, onUnmounted } from 'vue'
import { store } from '@/store'
import { message } from 'ant-design-vue'
import { DownloadOutlined } from '@ant-design/icons-vue'

export default {
  name: 'Results',
  components: {
    DownloadOutlined
  },
  setup() {
    // 刷新数据
    const refreshData = () => {
      store.calculateResults()
    }
    
    // 监听页面可见性变化
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshData()
      }
    }
    
    onMounted(() => {
      document.addEventListener('visibilitychange', handleVisibilityChange)
    })
    
    onUnmounted(() => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    })
    
    const getRankingClass = (index) => {
      if (index === 0) return 'first-place'
      if (index === 1) return 'second-place'
      if (index === 2) return 'third-place'
      return ''
    }
    
    const getRankClass = (index) => {
      if (index === 0) return 'gold'
      if (index === 1) return 'silver'
      if (index === 2) return 'bronze'
      return ''
    }
    
    const getPlayerStatsHeader = (result, index) => {
      const medal = index < 3 ? ['🥇', '🥈', '🥉'][index] : ''
      return `${medal} ${result.name} - ${result.wins}胜${result.losses}负 (${result.scoreDiff > 0 ? '+' : ''}${result.scoreDiff}分)`
    }
    

    
    const downloadReport = () => {
      message.success('成绩海报生成中...')
    }
    
    return {
      store,
      getRankingClass,
      getRankClass,
      getPlayerStatsHeader,
      downloadReport
    }
  }
}
</script>

<style scoped>
.results {
  padding: 12px;
  padding-bottom: 120px;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.ranking-header {
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 2px solid #f0f0f0;
  font-weight: bold;
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.ranking-list {
  display: flex;
  flex-direction: column;
}

.ranking-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
  transition: background-color 0.3s;
}

.ranking-item:hover {
  background-color: #fafafa;
}

.ranking-item.first-place {
  background: linear-gradient(135deg, #fff7e6 0%, #fff2e6 100%);
}

.ranking-item.second-place {
  background: linear-gradient(135deg, #f6f6f6 0%, #f0f0f0 100%);
}

.ranking-item.third-place {
  background: linear-gradient(135deg, #fff7e6 0%, #ffeee6 100%);
}

.col-rank {
  width: 50px;
  display: flex;
  justify-content: center;
}

.col-player {
  flex: 1;
  padding-left: 8px;
}

.col-record {
  width: 60px;
  text-align: center;
}

.col-score {
  width: 60px;
  text-align: center;
}

.rank-number {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
  background: #f0f0f0;
  color: #666;
}

.rank-number.gold {
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  color: #d48806;
}

.rank-number.silver {
  background: linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%);
  color: #595959;
}

.rank-number.bronze {
  background: linear-gradient(135deg, #cd7f32 0%, #daa520 100%);
  color: #8c4a00;
}

.player-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.player-avatar {
  width: 32px;
  height: 32px;
  background: #e6f7ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.player-name {
  font-size: 14px;
  font-weight: 500;
}

.wins {
  color: #52c41a;
  font-weight: bold;
}

.losses {
  color: #ff4d4f;
  font-weight: bold;
}

.separator {
  color: #999;
  margin: 0 2px;
}

.positive {
  color: #52c41a;
  font-weight: bold;
}

.negative {
  color: #ff4d4f;
  font-weight: bold;
}

.stats-card {
  margin-top: 12px;
}

.player-stats {
  padding: 8px 0;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
}

.stat-label {
  color: #666;
  font-size: 14px;
}

.stat-value {
  font-weight: bold;
  font-size: 14px;
}

.bottom-actions {
  position: fixed;
  bottom: 70px;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 24px);
  max-width: 726px;
  padding: 0 12px;
}
</style>