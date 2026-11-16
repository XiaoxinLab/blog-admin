import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

// Vite 构建配置
// 说明：后台是纯前端单页应用，通过 hash 路由访问，后端不需要额外做路径重写规则
export default defineConfig(({ mode }) => {
  // 从 .env 文件里读配置
  // 说明：配置文件里直接用 process.env 读不到 .env 里的值，
  //       必须用 loadEnv 显式加载。
  const env = loadEnv(mode, process.cwd(), '')

  return {
  // 打包时的资源路径前缀
  // 说明：history 模式下必须用绝对路径（不能是 './'），
  //       否则刷新 /admin/articles 这类深层路径时，
  //       浏览器会把 ./assets/x.js 拼成 /admin/assets/x.js，找不到文件。
  //       本地开发用 /，线上放 /admin/ 子目录，都由 .env 里的
  //       VITE_BASE_PATH 控制。
  base: env.VITE_BASE_PATH || '/',
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
  }
})
