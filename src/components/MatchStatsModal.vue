<template>
  <a-modal
    v-model:open="visible"
    title="对局详情"
    width="600px"
    :footer="null"
  >
    <div v-if="stats" class="stats-container">
      <!-- 上场次数统计 -->
      <div class="stats-section">
        <h3>上场次数统计</h3>
        <div v-for="player in players" :key="player.id" class="stat-item">
          <span class="player-name">{{ player.name }}:</span>
          <span>上场 {{ stats.playerGameCount[player.id] || 0 }} 次</span>
          <span class="consecutive">
            最大连续上场 {{ stats.playerMaxConsecutive[player.id] || 0 }} 次
          </span>
          <span v-if="(stats.playerMaxConsecutive[player.id] || 0) >= 3" class="warning">
            ⚠️ 连续3场
          </span>
        </div>
      </div>
    </div>
    <div v-else class="no-stats">
      <a-empty description="暂无对局统计信息" />
    </div>
  </a-modal>
</template>

<script>
import { ref, watch } from 'vue'

export default {
  name: 'MatchStatsModal',
  props: {
    open: {
      type: Boolean,
      default: false
    },
    stats: {
      type: Object,
      default: null
    },
    players: {
      type: Array,
      default: () => []
    }
  },
  emits: ['update:open'],
  setup(props, { emit }) {
    const visible = ref(props.open)

    watch(() => props.open, (newVal) => {
      visible.value = newVal
    })

    watch(visible, (newVal) => {
      emit('update:open', newVal)
    })

    const getTeammateCount = (playerId, teammateId) => {
      if (!props.stats || !props.stats.teammateCount) return 0
      return props.stats.teammateCount[playerId]?.[teammateId] || 0
    }

    return {
      visible,
      getTeammateCount
    }
  }
}
</script>

<style scoped>
.stats-container {
  max-height: 600px;
  overflow-y: auto;
}

.stats-section {
  margin-bottom: 24px;
}

.stats-section h3 {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 12px;
  color: #1890ff;
  border-bottom: 2px solid #1890ff;
  padding-bottom: 8px;
}

.stat-item {
  padding: 8px 12px;
  margin-bottom: 8px;
  background: #f5f5f5;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.player-name {
  font-weight: bold;
  min-width: 60px;
}

.consecutive {
  color: #666;
}

.warning {
  color: #ff4d4f;
  font-weight: bold;
}

.teammate-section {
  margin-bottom: 16px;
  padding: 12px;
  background: #fafafa;
  border-radius: 4px;
}

.player-title {
  font-weight: bold;
  margin-bottom: 8px;
  color: #333;
}

.teammate-list {
  padding-left: 16px;
}

.teammate-item {
  display: block;
  padding: 4px 0;
  color: #666;
}

.no-stats {
  padding: 40px 0;
  text-align: center;
}
</style>
