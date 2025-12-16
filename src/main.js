import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import './styles/mobile.css'
import './store' // 初始化状态管理

const app = createApp(App)

app.use(router)
app.use(Antd)

app.mount('#app')