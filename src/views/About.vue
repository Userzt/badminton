<template>
  <div class="about">
    <a-card title="关于项目">
      <a-descriptions :column="1" bordered>
        <a-descriptions-item label="框架">Vue 3</a-descriptions-item>
        <a-descriptions-item label="UI 组件库">Ant Design Vue</a-descriptions-item>
        <a-descriptions-item label="构建工具">Vite</a-descriptions-item>
        <a-descriptions-item label="路由模式">History</a-descriptions-item>
        <a-descriptions-item label="开发语言">JavaScript</a-descriptions-item>
      </a-descriptions>
      
      <a-divider />
      
      <a-typography-title :level="4">技术栈说明</a-typography-title>
      <a-typography-paragraph>
        <ul>
          <li><strong>Vue 3:</strong> 采用 Composition API，提供更好的逻辑复用和类型推导</li>
          <li><strong>Ant Design Vue:</strong> 企业级 UI 设计语言和组件库</li>
          <li><strong>Vite:</strong> 下一代前端构建工具，提供极速的开发体验</li>
          <li><strong>Vue Router:</strong> 使用 History 模式，提供更友好的 URL</li>
        </ul>
      </a-typography-paragraph>
    </a-card>
  </div>
</template>

<script>
export default {
  name: 'About'
}
</script>

<style scoped>
.about {
  padding: 20px;
}
</style>