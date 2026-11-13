/* ============================================================
   Blog 后台管理系统 - 入口
   ============================================================ */

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './styles/main.css'
import './styles/variants.css'
import { useVariant } from './composables/useVariant'

// 标题用衬线体（Newsreader + 思源宋体），正文用无衬线，数字和标签用等宽
import '@fontsource/newsreader/400.css'
import '@fontsource/newsreader/500.css'
import '@fontsource/newsreader/600.css'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/500.css'
import '@fontsource/noto-sans-sc/400.css'
import '@fontsource/noto-sans-sc/500.css'
import '@fontsource/noto-serif-sc/400.css'
import '@fontsource/noto-serif-sc/500.css'
import '@fontsource/noto-serif-sc/600.css'

const { applyToDocument } = useVariant()

// 立刻把主题套到 html 上，界面马上就是对的
applyToDocument()

// 应用入口：把路由和根组件挂到页面上
createApp(App).use(router).mount('#app')
