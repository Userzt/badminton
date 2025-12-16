<template>
  <div id="app" class="mobile-container">
    <!-- 移动端顶部导航 -->
    <div class="mobile-header">
      <a-row align="middle" style="height: 50px; padding: 0 16px">
        <a-col flex="auto">
          <div class="logo-mobile">Vue 3 + Ant Design</div>
        </a-col>
        <a-col>
          <a-dropdown>
            <a-button type="text" size="small">
              <template #icon>
                <MenuOutlined />
              </template>
            </a-button>
            <template #overlay>
              <a-menu>
                <a-menu-item key="1">
                  <router-link to="/">报名信息</router-link>
                </a-menu-item>
                <a-menu-item key="2">
                  <router-link to="/scoring">对局计分</router-link>
                </a-menu-item>
                <a-menu-item key="3">
                  <router-link to="/results">比赛成绩</router-link>
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </a-col>
      </a-row>
    </div>
    
    <!-- 主要内容区域 -->
    <div class="mobile-content mobile-scroll">
      <router-view />
    </div>
    
    <!-- 移动端底部导航 -->
    <div class="mobile-bottom-nav mobile-safe-area">
      <a-row>
        <a-col :span="8">
          <div class="nav-item" @click="$router.push('/')" :class="{ active: $route.name === 'Registration' }">
            <UserAddOutlined />
            <div>报名信息</div>
          </div>
        </a-col>
        <a-col :span="8">
          <div class="nav-item" @click="$router.push('/scoring')" :class="{ active: $route.name === 'Scoring' }">
            <TrophyOutlined />
            <div>对局计分</div>
          </div>
        </a-col>
        <a-col :span="8">
          <div class="nav-item" @click="$router.push('/results')" :class="{ active: $route.name === 'Results' }">
            <BarChartOutlined />
            <div>比赛成绩</div>
          </div>
        </a-col>
      </a-row>
    </div>
  </div>
</template>

<script>
import { MenuOutlined, UserAddOutlined, TrophyOutlined, BarChartOutlined } from '@ant-design/icons-vue'
import { watch } from 'vue'
import { useRoute } from 'vue-router'

export default {
  name: 'App',
  components: {
    MenuOutlined,
    UserAddOutlined,
    TrophyOutlined,
    BarChartOutlined
  },
  setup() {
    const route = useRoute()
    
    // 监听路由变化，自动滚动到顶部
    watch(() => route.path, () => {
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }, 100)
    })
  }
}
</script>

<style>
@import './styles/mobile.css';

#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

.logo-mobile {
  font-size: 18px;
  font-weight: bold;
  color: #1890ff;
}

.mobile-content {
  min-height: calc(100vh - 100px);
  padding-bottom: 60px;
}

.mobile-bottom-nav {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 750px;
  background: #fff;
  border-top: 1px solid #f0f0f0;
  z-index: 100;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 50px;
  font-size: 12px;
  color: #666;
  cursor: pointer;
  transition: color 0.3s;
}

.nav-item:hover,
.nav-item.active {
  color: #1890ff;
}

.nav-item .anticon {
  font-size: 20px;
  margin-bottom: 2px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .mobile-header {
    position: sticky;
    top: 0;
    z-index: 100;
    background: #fff;
    border-bottom: 1px solid #f0f0f0;
  }
}
</style>