<template>
  <div class="scoring">
    <!-- 比赛进度 -->
    <a-card class="mobile-card progress-card">
      <div class="match-title">{{ store.matchInfo.title }} | {{ store.matchInfo.date }}</div>
      <div class="progress-info">
        <span>比赛进度</span>
        <a-progress 
          :percent="Math.round((finishedMatches / store.matches.length) * 100)" 
          :show-info="false"
          stroke-color="#1890ff"
        />
        <span class="progress-text">{{ finishedMatches }}/{{ store.matches.length }}场</span>
      </div>
    </a-card>
    
    <!-- 比赛列表 -->
    <div class="matches-list">
      <div 
        v-for="match in store.matches" 
        :key="match.id"
        class="match-card"
        :class="{ 
          'finished': match.status === 'finished',
          'current': match.id === currentMatch?.id 
        }"
      >
        <div class="match-header">
          <div class="match-number">{{ match.id }}</div>
          <div class="match-status">
            <div v-if="match.status === 'finished'" class="status-badge finished">
              <CheckCircleOutlined />
              已结束
            </div>
            <div v-else class="status-badge pending">
              <ClockCircleOutlined />
              未开始
            </div>
          </div>
        </div>
        
        <div class="match-content">
          <!-- 队伍1 -->
          <div class="team team-left">
            <div class="player" v-for="player in match.team1" :key="player.id">
              <div class="player-avatar">{{ player.avatar }}</div>
              <div class="player-name">{{ player.name }}</div>
            </div>
          </div>
          
          <!-- 比分 -->
          <div class="score-section">
            <div class="score" :class="{ 'winner': match.winner === 1 }">
              {{ match.score1 }}
            </div>
            <div class="vs">:</div>
            <div class="score" :class="{ 'winner': match.winner === 2 }">
              {{ match.score2 }}
            </div>
          </div>
          
          <!-- 队伍2 -->
          <div class="team team-right">
            <div class="player" v-for="player in match.team2" :key="player.id">
              <div class="player-avatar">{{ player.avatar }}</div>
              <div class="player-name">{{ player.name }}</div>
            </div>
          </div>
        </div>
        
        <!-- 操作按钮 -->
        <div class="match-actions">
          <a-button 
            v-if="match.status === 'pending'"
            type="primary" 
            size="small" 
            @click="showScoreModal(match)"
          >
            录入比分
          </a-button>
          <a-button 
            v-if="match.status === 'finished'"
            size="small" 
            @click="showScoreModal(match)"
          >
            修改比分
          </a-button>
        </div>
        
        <!-- 比赛信息 -->
        <div class="match-info" v-if="match.status === 'finished'">
          <span>用时00分00秒 计分员: cy 让分记录</span>
        </div>
      </div>
    </div>
    
    <!-- 查看成绩按钮 -->
    <div class="bottom-actions">
      <a-button 
        type="primary" 
        class="mobile-btn" 
        block
        @click="$router.push('/results')"
      >
        查看成绩
      </a-button>
    </div>
    
    <!-- 比分输入弹窗 -->
    <a-modal
      v-model:open="scoreModalVisible"
      title="修改比分"
      :footer="null"
      centered
    >
      <div class="score-modal" v-if="selectedMatch">
        <div class="score-input-section">
          <div class="team-score">
            <div class="team-info">
              <div class="team-players">
                <div v-for="player in selectedMatch.team1" :key="player.id" class="player-mini">
                  <span class="player-avatar-mini">{{ player.avatar }}</span>
                  <span>{{ player.name }}</span>
                </div>
              </div>
            </div>
            <a-input-number 
              v-model:value="tempScore1" 
              :min="0" 
              :max="30"
              :precision="0"
              size="large"
              class="score-input"
              placeholder="0-30"
              @change="validateScore1"
            />
            <div class="score-hint">0-30分</div>
          </div>
          
          <div class="vs-divider">VS</div>
          
          <div class="team-score">
            <div class="team-info">
              <div class="team-players">
                <div v-for="player in selectedMatch.team2" :key="player.id" class="player-mini">
                  <span class="player-avatar-mini">{{ player.avatar }}</span>
                  <span>{{ player.name }}</span>
                </div>
              </div>
            </div>
            <a-input-number 
              v-model:value="tempScore2" 
              :min="0" 
              :max="30"
              :precision="0"
              size="large"
              class="score-input"
              placeholder="0-30"
              @change="validateScore2"
            />
            <div class="score-hint">0-30分</div>
          </div>
        </div>
        
        <div class="modal-actions">
          <a-button @click="scoreModalVisible = false">取消</a-button>
          <a-button type="primary" @click="saveScore">确定</a-button>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { store } from '@/store'
import { message } from 'ant-design-vue'
import { CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons-vue'

export default {
  name: 'Scoring',
  components: {
    CheckCircleOutlined,
    ClockCircleOutlined
  },
  setup() {
    const scoreModalVisible = ref(false)
    const selectedMatch = ref(null)
    const tempScore1 = ref(0)
    const tempScore2 = ref(0)
    
    // 页面加载时滚动到顶部
    onMounted(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    })
    
    const finishedMatches = computed(() => {
      return store.matches.filter(m => m.status === 'finished').length
    })
    
    const currentMatch = computed(() => {
      return store.matches.find(m => m.status !== 'finished')
    })
    
    const showScoreModal = (match) => {
      selectedMatch.value = match
      tempScore1.value = match.score1
      tempScore2.value = match.score2
      scoreModalVisible.value = true
    }
    
    const validateScore1 = (value) => {
      if (value < 0) {
        tempScore1.value = 0
        message.warning('比分不能为负数')
      } else if (value > 30) {
        tempScore1.value = 30
        message.warning('比分不能超过30分')
      }
    }
    
    const validateScore2 = (value) => {
      if (value < 0) {
        tempScore2.value = 0
        message.warning('比分不能为负数')
      } else if (value > 30) {
        tempScore2.value = 30
        message.warning('比分不能超过30分')
      }
    }
    
    const saveScore = () => {
      if (selectedMatch.value) {
        // 再次验证比分范围
        const score1 = Math.max(0, Math.min(30, tempScore1.value || 0))
        const score2 = Math.max(0, Math.min(30, tempScore2.value || 0))
        
        store.updateScore(selectedMatch.value.id, score1, score2)
        message.success('比分已保存！')
        scoreModalVisible.value = false
      }
    }
    
    return {
      store,
      scoreModalVisible,
      selectedMatch,
      tempScore1,
      tempScore2,
      finishedMatches,
      currentMatch,
      showScoreModal,
      validateScore1,
      validateScore2,
      saveScore
    }
  }
}
</script>

<style scoped>
.scoring {
  padding: 12px;
  padding-bottom: 80px;
}

.progress-card {
  margin-bottom: 16px;
}

.match-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 12px;
}

.progress-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-text {
  font-size: 14px;
  color: #666;
  white-space: nowrap;
}

.matches-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.match-card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 2px solid transparent;
}

.match-card.current {
  border-color: #1890ff;
}

.match-card.finished {
  background: #f9f9f9;
}

.match-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.match-number {
  width: 24px;
  height: 24px;
  background: #1890ff;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.finished {
  background: #f6ffed;
  color: #52c41a;
  border: 1px solid #b7eb8f;
}

.status-badge.pending {
  background: #fff7e6;
  color: #fa8c16;
  border: 1px solid #ffd591;
}

.match-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.team {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.team-right {
  align-items: flex-end;
}

.player {
  display: flex;
  align-items: center;
  gap: 8px;
}

.team-right .player {
  flex-direction: row-reverse;
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

.score-section {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 20px;
}

.score {
  font-size: 24px;
  font-weight: bold;
  color: #666;
  min-width: 30px;
  text-align: center;
}

.score.winner {
  color: #1890ff;
}

.vs {
  font-size: 18px;
  color: #999;
}

.match-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.match-info {
  text-align: center;
  font-size: 12px;
  color: #999;
  margin-top: 8px;
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

.score-modal {
  padding: 20px 0;
}

.score-input-section {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
}

.team-score {
  flex: 1;
  text-align: center;
}

.team-info {
  margin-bottom: 12px;
}

.team-players {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.player-mini {
  display: flex;
  align-items: center;
  gap: 6px;
  justify-content: center;
  font-size: 12px;
}

.player-avatar-mini {
  width: 20px;
  height: 20px;
  background: #e6f7ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.score-input {
  width: 80px;
}

.score-hint {
  font-size: 12px;
  color: #999;
  text-align: center;
  margin-top: 4px;
}

.vs-divider {
  font-size: 16px;
  font-weight: bold;
  color: #999;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}
</style>