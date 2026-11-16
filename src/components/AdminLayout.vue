<template>
  <div class="shell">
    <!-- 左侧边栏 -->
    <aside class="sidebar" :class="{ open: mobileMenuOpen }">
      <div class="sidebar-brand">
        <span class="brand-logo">B</span>
        <span class="brand-text">Blog 后台</span>
      </div>

      <nav class="sidebar-nav">
        <div v-for="group in visibleGroups" :key="group.label" class="nav-group">
          <div class="nav-group-title">{{ group.label }}</div>
          <router-link
            v-for="item in group.items"
            :key="item.path"
            :to="item.path"
            class="nav-item"
            :class="{ active: isActive(item.path) }"
            @click="mobileMenuOpen = false"
          >
            <component :is="item.icon" :size="16" :stroke-width="1.6" />
            <span>{{ item.label }}</span>
            <span v-if="item.count !== undefined" class="nav-badge">{{ item.count }}</span>
          </router-link>
        </div>
      </nav>

      <div class="sidebar-foot">
        <div class="user-box">
          <span class="user-avatar">{{ avatarText }}</span>
          <div style="min-width: 0">
            <div class="user-name">{{ user?.user_name || '未登录' }}</div>
            <div class="user-role">{{ isAdmin() ? '管理员' : '普通用户' }}</div>
          </div>
        </div>
      </div>
    </aside>

    <!-- 右侧主区 -->
    <div class="main">
      <header class="topbar">
        <button
          class="icon-btn mobile-menu-btn"
          aria-label="打开菜单"
          @click="mobileMenuOpen = !mobileMenuOpen"
        >
          <Menu :size="18" :stroke-width="1.6" />
        </button>

        <div class="breadcrumb">
          <span>后台</span>
          <ChevronRight :size="14" :stroke-width="1.6" />
          <span class="current">{{ pageTitle }}</span>
        </div>

        <div class="topbar-spacer"></div>

        <button
          class="icon-btn"
          :aria-label="theme === 'dark' ? '切换成白天' : '切换成黑夜'"
          :title="theme === 'dark' ? '切换成白天' : '切换成黑夜'"
          @click="toggleTheme"
        >
          <Sun v-if="theme === 'dark'" :size="16" :stroke-width="1.6" />
          <Moon v-else :size="16" :stroke-width="1.6" />
        </button>

        <button class="icon-btn" aria-label="退出登录" title="退出登录" @click="handleLogout">
          <LogOut :size="16" :stroke-width="1.6" />
        </button>
      </header>

      <main class="content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  BarChart3,
  BookText,
  ChevronRight,
  FolderKanban,
  LogOut,
  Menu,
  Moon,
  Puzzle,
  Sun,
  Tags,
  UserCog
} from 'lucide-vue-next'
import { isAdmin, getUser, clearAuth } from '@/utils/auth'
import { useVariant } from '@/composables/useVariant'

const route = useRoute()
const router = useRouter()

// 主题
const { theme, setTheme } = useVariant()

// 手机上侧边栏是否展开
const mobileMenuOpen = ref(false)

// 当前登录用户
const user = getUser()

/**
 * 侧边栏导航分组
 */
const navGroups = [
  {
    label: '内容管理',
    items: [
      { path: '/articles', label: '文章', icon: BookText, admin: true },
      { path: '/projects', label: '项目', icon: FolderKanban, admin: true },
      { path: '/dictionary', label: '字典', icon: Tags, admin: true },
      { path: '/widgets', label: '组件', icon: Puzzle, admin: true }
    ]
  },
  {
    label: '数据分析',
    items: [{ path: '/visit', label: '访问统计', icon: BarChart3 }]
  },
  {
    label: '系统',
    items: [{ path: '/account', label: '账号设置', icon: UserCog }]
  }
]

/**
 * 按权限过滤后的导航分组
 * @returns {object[]} 看得见的分组
 */
const visibleGroups = computed(() => {
  return navGroups
    .map((group) => ({
      label: group.label,
      items: group.items.filter((item) => !item.admin || isAdmin())
    }))
    .filter((group) => group.items.length)
})

/**
 * 某条导航是不是当前所在页面
 * @param {string} path - 导航路径
 * @returns {boolean} 当前页返回 true
 */
function isActive(path) {
  return route.path === path || route.path.startsWith(path + '/')
}

/**
 * 顶部栏显示的当前页面名
 * @returns {string} 页面名
 */
const pageTitle = computed(() => {
  for (const group of navGroups) {
    for (const item of group.items) {
      if (route.path === item.path || route.path.startsWith(item.path + '/')) {
        // 编辑页显示更具体的名字
        if (route.path.includes('/new')) return '新建' + item.label
        if (route.path.includes('/edit')) return '编辑' + item.label
        return item.label
      }
    }
  }
  return '后台'
})

/**
 * 头像里显示的文字：取用户名第一个字
 * @returns {string} 单个字符
 */
const avatarText = computed(() => {
  const name = user?.user_name || '?'
  return name.charAt(0).toUpperCase()
})

/**
 * 切换白天 / 黑夜
 * @returns {void}
 */
function toggleTheme() {
  setTheme(theme.value === 'dark' ? 'light' : 'dark')
}

/**
 * 退出登录，清掉本地令牌并回到登录页
 * @returns {void}
 */
function handleLogout() {
  clearAuth()
  router.replace('/login')
}
</script>
