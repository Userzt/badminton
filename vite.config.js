import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 3003,
    open: true,
    host: '0.0.0.0' // 允许外部访问，便于移动端调试
  },
  css: {
    postcss: './postcss.config.js'
  }
})