<template>
  <div class="registration">
    <!-- 测试基本显示 -->
    <div style="padding: 20px; background: white; margin: 10px; border-radius: 8px;">
      <h2>羽毛球比赛报名</h2>
      <p>当前参赛人数: {{ store.players.length }}/6</p>
      
      <!-- 比赛信息 -->
      <a-card title="比赛信息" style="margin-bottom: 16px;">
        <p><strong>比赛名称:</strong> {{ store.matchInfo.title }}</p>
        <p><strong>比赛时间:</strong> {{ store.matchInfo.time }}</p>
        <p><strong>比赛地点:</strong> {{ store.matchInfo.location }}</p>
        <p><strong>管理员:</strong> {{ store.matchInfo.organizer }}</p>
      </a-card>
      
      <!-- 添加选手 -->
      <a-card title="添加参赛选手" style="margin-bottom: 16px;">
        <div style="display: flex; gap: 8px; margin-bottom: 16px;">
          <a-input 
            v-model:value="newPlayerName" 
            placeholder="输入选手姓名"
            style="flex: 1;"
            @pressEnter="addPlayer"
          />
          <a-select v-model:value="selectedAvatar" style="width: 80px;">
            <a-select-option v-for="avatar in availableAvatars" :key="avatar" :value="avatar">
              {{ avatar }}
            </a-select-option>
          </a-select>
          <a-button type="primary" @click="addPlayer" :loading="adding">
            添加
          </a-button>
        </div>
        
        <!-- 选手列表 -->
        <div v-if="store.players.length === 0" style="text-align: center; padding: 20px; color: #999;">
          还没有参赛选手，快来添加第一位选手吧！
        </div>
        
        <div v-for="(player, index) in store.players" :key="player.id" 
             style="display: flex; align-items: center; padding: 8px; border: 1px solid #f0f0f0; margin-bottom: 8px; border-radius: 4px;">
          <span style="margin-right: 12px; font-weight: bold;">{{ index + 1 }}.</span>
          <span style="margin-right: 12px; font-size: 20px;">{{ player.avatar }}</span>
          <span style="flex: 1;">{{ player.name }}</span>
          <a-button size="small" @click="removePlayer(player.id)" danger>删除</a-button>
        </div>
        
        <!-- 开始比赛按钮 -->
        <div v-if="store.players.length === 6" style="margin-top: 16px;">
          <a-button 
            v-if="store.matches.length === 0"
            type="primary" 
            size="large" 
            block 
            @click="startMatch" 
            :loading="generating"
          >
            开始比赛 (6人已满)
          </a-button>
          <a-button 
            v-else
            type="primary" 
            size="large" 
            block 
            @click="goToScoring"
          >
            进入计分页面 (对阵已生成)
          </a-button>
        </div>
        <div v-else-if="store.players.length > 0" style="margin-top: 16px;">
          <a-button block disabled>
            还需要 {{ 6 - store.players.length }} 人才能开始比赛
          </a-button>
        </div>
        
        <!-- 再来一场按钮 -->
        <div v-if="store.players.length > 0" style="margin-top: 16px;">
          <a-button type="default" size="large" block @click="startNewRound" :loading="newRoundLoading">
            🔄 再来一场
          </a-button>
        </div>
      </a-card>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { store } from '@/store'
import { message } from 'ant-design-vue'

export default {
  name: 'Registration',
  setup() {
    const router = useRouter()
    const newPlayerName = ref('')
    const selectedAvatar = ref('🏸')
    const adding = ref(false)
    const generating = ref(false)
    const newRoundLoading = ref(false)
    
    // 刷新数据（Registration 页面不需要刷新，因为数据在本地 store）
    // 但添加监听以保持一致性
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // 可以在这里添加从服务器同步数据的逻辑
      }
    }
    
    onMounted(() => {
      document.addEventListener('visibilitychange', handleVisibilityChange)
    })
    
    onUnmounted(() => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    })
    
    // 可用头像（排除已使用的）
    const availableAvatars = computed(() => {
      const used = store.players.map(p => p.avatar)
      return store.avatarOptions.filter(avatar => !used.includes(avatar))
    })
    
    const addPlayer = async () => {
      if (!newPlayerName.value.trim()) {
        message.warning('请输入选手姓名')
        return
      }
      
      if (store.players.length >= 6) {
        message.warning('参赛人数已满')
        return
      }
      
      adding.value = true
      
      try {
        const result = await store.addPlayer(newPlayerName.value, selectedAvatar.value)
        
        if (result.success) {
          message.success('添加成功')
          newPlayerName.value = ''
          // 选择下一个可用头像
          const nextAvatar = availableAvatars.value[0]
          if (nextAvatar) {
            selectedAvatar.value = nextAvatar
          }
        } else {
          message.error(result.message)
        }
      } catch (error) {
        message.error('添加失败: ' + error.message)
      } finally {
        adding.value = false
      }
    }
    
    const removePlayer = async (playerId) => {
      try {
        const result = await store.removePlayer(playerId)
        
        if (result.success) {
          message.success(result.message || '删除成功')
        } else if (result.needConfirm) {
          // 需要用户确认
          const { Modal } = await import('ant-design-vue')
          Modal.confirm({
            title: '确认删除',
            content: result.message,
            okText: '确定删除',
            cancelText: '取消',
            okType: 'danger',
            onOk: async () => {
              try {
                const confirmResult = await store.removePlayer(playerId, true)
                if (confirmResult.success) {
                  message.success(confirmResult.message || '删除成功')
                } else {
                  message.error(confirmResult.message)
                }
              } catch (error) {
                message.error('删除失败: ' + error.message)
              }
            }
          })
        } else {
          message.error(result.message)
        }
      } catch (error) {
        message.error('删除失败: ' + error.message)
      }
    }
    
    const startMatch = async () => {
      if (store.players.length !== 6) {
        message.warning('需要6名选手才能开始比赛')
        return
      }
      
      // 检查是否已经有对阵
      if (store.matches.length > 0) {
        message.warning('对阵已经生成，请直接进入计分页面')
        return
      }
      
      generating.value = true
      
      try {
        const result = await store.generateMatches()
        if (result.success) {
          message.success('比赛对阵生成成功！')
          setTimeout(() => {
            router.push('/scoring').then(() => {
              // 跳转后滚动到顶部
              window.scrollTo({ top: 0, behavior: 'smooth' })
            })
          }, 1000)
        } else {
          message.error(result.message)
        }
      } catch (error) {
        message.error('生成比赛失败: ' + error.message)
      } finally {
        generating.value = false
      }
    }
    
    const goToScoring = () => {
      router.push('/scoring').then(() => {
        // 跳转后滚动到顶部
        window.scrollTo({ top: 0, behavior: 'smooth' })
      })
    }
    
    const startNewRound = async () => {
      try {
        // 显示确认对话框
        const { Modal } = await import('ant-design-vue')
        Modal.confirm({
          title: '确认再来一场',
          content: '将创建新的比赛场次，当前的赛程数据将被清空，但选手信息会保留。确定要继续吗？',
          okText: '确定',
          cancelText: '取消',
          okType: 'primary',
          onOk: async () => {
            newRoundLoading.value = true
            
            try {
              const result = await store.startNewRound()
              if (result.success) {
                message.success(result.message || '新比赛创建成功！')
              } else {
                message.error(result.message)
              }
            } catch (error) {
              message.error('创建新比赛失败: ' + error.message)
            } finally {
              newRoundLoading.value = false
            }
          }
        })
      } catch (error) {
        message.error('操作失败: ' + error.message)
      }
    }
    
    return {
      store,
      newPlayerName,
      selectedAvatar,
      adding,
      generating,
      newRoundLoading,
      availableAvatars,
      addPlayer,
      removePlayer,
      startMatch,
      goToScoring,
      startNewRound
    }
  }
}
</script>

<style scoped>
.registration {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 80px;
}
</style>