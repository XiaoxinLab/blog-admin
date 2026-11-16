import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Vite 构建配置
// 说明：后台是纯前端单页应用，通过 hash 路由访问，后端不需要额外做路径重写规则
export default defineConfig({
  // 用相对路径打包，产物放到任何目录下都能正常加载
  // 说明：默认的 '/' 会让浏览器去请求域名根目录的 /assets/xxx.js，
  //       放到 /admin/ 这种子目录下就会 404，页面一片空白。
  //       './' 会按当前页面所在目录去找，放在 / 或 /admin/ 都行。
  base: './',
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
