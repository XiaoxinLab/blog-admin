import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Vite 构建配置
// 说明：后台是纯前端单页应用，通过 hash 路由访问，后端不需要额外做路径重写规则
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5174,
    open: false
  },
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 900
  }
})
