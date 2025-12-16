<template>
  <div class="home">
    <a-row :gutter="24">
      <a-col :span="24">
        <a-card title="欢迎使用 Vue 3 + Ant Design Vue">
          <p>这是一个基于 Vue 3、Ant Design Vue 和 Vite 构建的项目框架。</p>
          
          <a-divider />
          
          <a-space direction="vertical" size="middle" style="width: 100%">
            <a-alert
              message="项目特性"
              description="Vue 3 Composition API、Ant Design Vue 组件库、Vite 快速构建、History 路由模式"
              type="info"
              show-icon
            />
            
            <a-button type="primary" @click="showMessage">
              <template #icon>
                <CheckCircleOutlined />
              </template>
              点击测试
            </a-button>
          </a-space>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script>
import { message } from 'ant-design-vue'
import { CheckCircleOutlined } from '@ant-design/icons-vue'

export default {
  name: 'Home',
  components: {
    CheckCircleOutlined
  },
  setup() {
    const showMessage = () => {
      message.success('Vue 3 + Ant Design Vue 运行正常！')
    }

    return {
      showMessage
    }
  }
}
</script>

<style scoped>
.home {
  padding: 20px;
}
</style>