<template>
  <header class="app-header">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
          <button @click="$emit('toggle-sidebar')" class="menu-toggle md:hidden" :title="sidebarCollapsed ? '显示菜单' : '隐藏菜单'">
            <svg v-if="sidebarCollapsed" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
            <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
          <div class="flex items-center gap-3">
            <component :is="pageIconComponent" v-if="pageIconComponent" class="header-icon" />
            <div>
              <h2 class="header-title">{{ pageTitle }}</h2>
              <p class="header-desc hidden sm:block">{{ pageDescription }}</p>
            </div>
          </div>
        </div>
      <div class="flex items-center gap-4">
        <button class="notify-btn">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
          </svg>
          <span class="notify-dot"></span>
        </button>
        <div class="text-right hidden sm:block">
          <p class="time-text">{{ currentTime }}</p>
          <p class="date-text">{{ currentDate }}</p>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, h } from 'vue'
import { useRoute } from 'vue-router'
import { dynamicTitle } from '../utils/pageTitle'

defineProps({
  sidebarCollapsed: {
    type: Boolean,
    default: false
  }
})

defineEmits(['toggle-sidebar'])

const route = useRoute()

const pageTitleMap = {
  'Dashboard': '仪表板',
  'ArticleList': '文章管理',
  'ArticleNew': '新建文章',
  'ArticleEdit': '编辑文章',
  'ArticleDetail': '文章详情',
  'ProjectList': '项目管理',
  'ProjectNew': '新建项目',
  'ProjectEdit': '编辑项目',
  'ProjectDetail': '项目详情',
  'VisitorList': '访客列表'
}

const pageDescMap = {
  'Dashboard': '查看博客运营数据概览',
  'ArticleList': '管理您的所有文章内容',
  'ArticleNew': '创建一篇新的博客文章',
  'ArticleEdit': '编辑文章内容',
  'ArticleDetail': '阅读文章完整内容',
  'ProjectList': '管理和维护您的项目展示',
  'ProjectNew': '创建一个新的项目展示',
  'ProjectEdit': '编辑项目信息',
  'ProjectDetail': '查看项目的详细信息',
  'VisitorList': '查看所有访问记录和访客信息'
}

const pageIconMap = {
  'Dashboard': () => h('svg', {
    fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24',
    class: 'w-7 h-7'
  }, [
    h('path', {
      'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2',
      d: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
    })
  ]),
  'ArticleList': () => h('svg', {
    fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24',
    class: 'w-7 h-7'
  }, [
    h('path', {
      'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2',
      d: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
    })
  ]),
  'ArticleNew': () => h('svg', {
    fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24',
    class: 'w-7 h-7'
  }, [
    h('path', {
      'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2',
      d: 'M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V17a2 2 0 01-2 2z'
    })
  ]),
  'ArticleEdit': () => h('svg', {
    fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24',
    class: 'w-7 h-7'
  }, [
    h('path', {
      'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2',
      d: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
    })
  ]),
  'ProjectList': () => h('svg', {
    fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24',
    class: 'w-7 h-7'
  }, [
    h('path', {
      'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2',
      d: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
    })
  ]),
  'ProjectNew': () => h('svg', {
    fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24',
    class: 'w-7 h-7'
  }, [
    h('path', {
      'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2',
      d: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'
    })
  ]),
  'ProjectEdit': () => h('svg', {
    fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24',
    class: 'w-7 h-7'
  }, [
    h('path', {
      'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2',
      d: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
    })
  ]),
  'ProjectDetail': () => h('svg', {
    fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24',
    class: 'w-7 h-7'
  }, [
    h('path', {
      'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2',
      d: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z'
    }),
    h('path', {
      'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2',
      d: 'M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
    })
  ]),
  'VisitorList': () => h('svg', {
    fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24',
    class: 'w-7 h-7'
  }, [
    h('path', {
      'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2',
      d: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
    })
  ])
}

const pageTitle = computed(() => {
  if (route.name === 'ArticleDetail' && dynamicTitle.value) {
    return dynamicTitle.value
  }
  return pageTitleMap[route.name] || ''
})
const pageDescription = computed(() => pageDescMap[route.name] || '')
const pageIconComponent = computed(() => pageIconMap[route.name] || null)

let timer = null
const currentTime = ref('')
const currentDate = ref('')

const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  currentDate.value = now.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })
}

onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.app-header {
  border-bottom: 1px solid rgba(255, 235, 167, 0.08);
  padding: 16px 24px;
  background: linear-gradient(180deg, rgba(42, 43, 56, 0.98) 0%, rgba(42, 43, 56, 0.95) 100%);
  backdrop-filter: blur(20px);
  position: relative;
}

.app-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 24px;
  right: 24px;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(255, 235, 167, 0.2) 50%, transparent 100%);
}

.header-title {
  font-size: 22px;
  font-weight: 700;
  color: #ffeba7;
  text-shadow: 0 0 12px rgba(255, 235, 167, 0.3);
  letter-spacing: 0.5px;
}

.header-icon {
  width: 28px;
  height: 28px;
  color: #ffeba7;
  filter: drop-shadow(0 0 8px rgba(255, 235, 167, 0.4));
}

.header-desc {
  font-size: 13px;
  margin-top: 4px;
  color: #c4c3ca;
  opacity: 0.7;
}

.menu-toggle {
  padding: 8px;
  transition: all 0.25s ease;
  color: #c4c3ca;
  background: rgba(255, 235, 167, 0.05);
  border: 1px solid rgba(255, 235, 167, 0.1);
  cursor: pointer;
  border-radius: 6px;
  backdrop-filter: blur(10px);
}

.menu-toggle:hover {
  background: rgba(255, 235, 167, 0.15);
  color: #ffeba7;
  border-color: rgba(255, 235, 167, 0.25);
  transform: scale(1.05);
}

.menu-toggle:active {
  transform: scale(0.95);
}

.notify-btn {
  position: relative;
  padding: 10px;
  transition: all 0.25s ease;
  color: #c4c3ca;
  background: rgba(255, 235, 167, 0.05);
  border: 1px solid rgba(255, 235, 167, 0.1);
  border-radius: 6px;
  cursor: pointer;
  backdrop-filter: blur(10px);
}

.notify-btn:hover {
  background: rgba(255, 235, 167, 0.15);
  color: #ffeba7;
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(255, 235, 167, 0.15);
}

.notify-dot {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #ff4d4f;
  animation: pulse-dot 2s infinite;
}

@keyframes pulse-dot {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(255, 77, 79, 0.5);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.1);
    box-shadow: 0 0 0 6px rgba(255, 77, 79, 0);
  }
}

.time-text {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  letter-spacing: 0.3px;
}

.date-text {
  font-size: 11px;
  color: #c4c3ca;
  opacity: 0.6;
  margin-top: 2px;
}

@media (max-width: 640px) {
  .app-header {
    padding: 12px 16px;
  }

  .header-title {
    font-size: 18px;
  }

  .header-desc {
    display: none;
  }

  .notify-btn {
    padding: 8px;
  }
}
</style>
