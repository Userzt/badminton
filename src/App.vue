<template>
  <div id="app">
    <a-layout style="min-height: 100vh">
      <a-layout-header>
        <div class="logo">Vue 3 + Ant Design</div>
        <a-menu
          theme="dark"
          mode="horizontal"
          :default-selected-keys="['1']"
          style="line-height: 64px"
        >
          <a-menu-item key="1">
            <router-link to="/">首页</router-link>
          </a-menu-item>
          <a-menu-item key="2">
            <router-link to="/about">关于</router-link>
          </a-menu-item>
        </a-menu>
      </a-layout-header>
      
      <a-layout-content style="padding: 24px">
        <router-view />
      </a-layout-content>
      
      <a-layout-footer style="text-align: center">
        Vue 3 + Ant Design Vue + Vite ©2024
      </a-layout-footer>
    </a-layout>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
}

.logo {
  float: left;
  color: white;
  font-size: 18px;
  font-weight: bold;
  margin-right: 24px;
}

.ant-menu-horizontal {
  border-bottom: none;
}

.ant-menu-item a {
  color: rgba(255, 255, 255, 0.65);
}

.ant-menu-item-selected a {
  color: #1890ff;
}
</style>