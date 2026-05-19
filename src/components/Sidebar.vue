<template>
  <aside class="sidebar" :class="{ 'collapsed': collapsed }">
    <div class="sidebar-header">
      <h1 class="sidebar-title">
        <svg class="logo-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path>
        </svg>
        <transition name="fade">
          <span v-show="!collapsed" class="logo-text">BLOG ADMIN</span>
        </transition>
      </h1>
      <button @click="$emit('toggle-collapse')" class="collapse-btn" :title="collapsed ? '展开侧边栏' : '收起侧边栏'">
        <svg class="collapse-icon" :class="{ 'rotated': collapsed }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"></path>
        </svg>
      </button>
    </div>

    <nav class="sidebar-nav">
      <router-link
        to="/"
        :class="['nav-item', { 'nav-active': activeMenu === 'Dashboard' }]"
        @click="$emit('navigate', 'Dashboard')"
      >
        <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2-2h-2a2 2 0 01-2-2v-2z"></path>
        </svg>
        <transition name="fade">
          <span v-show="!collapsed" class="nav-text">仪表板</span>
        </transition>
      </router-link>

      <router-link
        to="/articles"
        :class="['nav-item', { 'nav-active': isArticleActive }]"
        @click="$emit('navigate', 'Articles')"
      >
        <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2-2z"></path>
        </svg>
        <transition name="fade">
          <span v-show="!collapsed" class="nav-text">文章管理</span>
        </transition>
      </router-link>

      <router-link
        to="/projects"
        :class="['nav-item', { 'nav-active': isProjectActive }]"
        @click="$emit('navigate', 'Projects')"
      >
        <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
        </svg>
        <transition name="fade">
          <span v-show="!collapsed" class="nav-text">项目管理</span>
        </transition>
      </router-link>

      <router-link
        v-if="isAdmin"
        to="/visitors"
        :class="['nav-item', { 'nav-active': activeMenu === 'VisitorList' }]"
        @click="$emit('navigate', 'Visitors')"
      >
        <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
        </svg>
        <transition name="fade">
          <span v-show="!collapsed" class="nav-text">访客列表</span>
        </transition>
      </router-link>

      <router-link
        v-if="isAdmin"
        to="/dictionary"
        :class="['nav-item', { 'nav-active': activeMenu === 'DictionaryList' }]"
        @click="$emit('navigate', 'Dictionary')"
      >
        <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
        </svg>
        <transition name="fade">
          <span v-show="!collapsed" class="nav-text">字典管理</span>
        </transition>
      </router-link>
    </nav>

    <transition name="slide-up">
      <div v-if="!collapsed" class="sidebar-footer">
        <div class="user-info">
          <div class="user-info-left">
            <div class="user-avatar">
              {{ userInitial }}
            </div>
            <div class="user-details">
              <p class="user-name">{{ userName || 'Admin' }}</p>
            </div>
          </div>
          <button @click="handleLogout" class="logout-btn" title="退出登录">
            <svg class="logout-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </transition>
    <transition name="fade">
      <div v-if="collapsed" class="sidebar-footer-collapsed">
        <div class="user-avatar-small" :title="userName || 'Admin'">
          {{ userInitial }}
        </div>
        <button @click="handleLogout" class="logout-btn-small" title="退出登录">
          <svg class="logout-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </transition>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import auth from '@/utils/auth'

const props = defineProps({
  activeMenu: String,
  collapsed: {
    type: Boolean,
    default: false
  }
})

defineEmits(['navigate', 'toggle-collapse'])

const router = useRouter()

const isArticleActive = computed(() => {
  return props.activeMenu?.includes('Article')
})

const isProjectActive = computed(() => {
  return props.activeMenu?.includes('Project')
})

const isAdmin = computed(() => {
  return auth.isAdmin()
})

const userInfo = computed(() => {
  return auth.getUser() || {}
})

const isGuestUser = computed(() => {
  const user = auth.getUser()
  return user?.user_name === 'tourist' || auth.isGuest()
})

const userName = computed(() => {
  if (auth.isAdmin()) return '管理员'
  if (isGuestUser.value) return '游客'
  return userInfo.value?.user_name || 'Admin'
})

const userEmail = computed(() => {
  if (auth.isAdmin()) return 'admin@system.io'
  if (isGuestUser.value) return ''
  return userInfo.value?.email || 'admin@system.io'
})

const userInitial = computed(() => {
  const name = userName.value || 'A'
  return name.charAt(0).toUpperCase()
})

const handleLogout = () => {
  auth.clearUser()
  router.push('/login')
}
</script>

<style scoped>
.sidebar {
  width: 256px;
  min-width: 256px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #2a2b38 0%, #1f2029 100%);
  border-right: 1px solid rgba(255, 235, 167, 0.08);
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  position: relative;
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.3);
}

.sidebar.collapsed {
  width: 80px;
  min-width: 80px;
}

.sidebar-header {
  padding: 20px 16px;
  border-bottom: 1px solid rgba(255, 235, 167, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  background: rgba(255, 235, 167, 0.02);
}

.sidebar.collapsed .sidebar-header {
  padding: 20px 12px;
  justify-content: center;
  flex-direction: column;
  gap: 16px;
}

.sidebar-title {
  font-size: 18px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 10px;
  letter-spacing: 0.5px;
}

.logo-icon {
  width: 32px;
  height: 32px;
  color: #ffeba7;
  flex-shrink: 0;
  filter: drop-shadow(0 0 8px rgba(255, 235, 167, 0.4));
  transition: transform 0.3s ease;
}

.logo-icon:hover {
  transform: rotate(5deg) scale(1.05);
}

.logo-text {
  color: #ffeba7;
  text-shadow: 0 0 12px rgba(255, 235, 167, 0.5), 0 0 24px rgba(255, 235, 167, 0.3);
  white-space: nowrap;
  font-family: 'Fira Code', 'Consolas', monospace;
  letter-spacing: 2px;
}

.collapse-btn {
  width: 28px;
  height: 28px;
  padding: 6px;
  border-radius: 6px;
  transition: all 0.25s ease;
  color: #c4c3ca;
  background: rgba(255, 235, 167, 0.05);
  border: 1px solid rgba(255, 235, 167, 0.1);
  cursor: pointer;
  opacity: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.collapse-btn:hover {
  background: rgba(255, 235, 167, 0.15);
  color: #ffeba7;
  border-color: rgba(255, 235, 167, 0.3);
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(255, 235, 167, 0.2);
}

.collapse-btn:active {
  transform: scale(0.95);
}

.sidebar.collapsed .collapse-btn {
  position: relative;
  right: auto;
  background: linear-gradient(135deg, rgba(255, 235, 167, 0.15) 0%, rgba(255, 235, 167, 0.08) 100%);
  border-color: rgba(255, 235, 167, 0.25);
  box-shadow: 0 2px 12px rgba(255, 235, 167, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.sidebar.collapsed .collapse-btn:hover {
  box-shadow: 0 4px 20px rgba(255, 235, 167, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.collapse-icon {
  width: 16px;
  height: 16px;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.collapse-icon.rotated {
  transform: rotate(180deg);
}

.sidebar-nav {
  flex: 1;
  padding: 20px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
  overflow-x: hidden;
}

.sidebar.collapsed .sidebar-nav {
  padding: 20px 10px;
  align-items: center;
  gap: 6px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 13px 14px;
  border-radius: 10px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  color: #c4c3ca;
  text-decoration: none;
  border-left: 3px solid transparent;
  white-space: nowrap;
  position: relative;
  overflow: hidden;
}

.nav-item::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255, 235, 167, 0.1) 0%, transparent 100%);
  opacity: 0;
  transition: opacity 0.25s ease;
}

.sidebar.collapsed .nav-item {
  padding: 14px;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 12px;
  border-left: none;
  border-bottom: 2px solid transparent;
}

.nav-item:hover {
  background-color: rgba(255, 235, 167, 0.06);
  color: #fff;
  transform: translateX(4px);
}

.sidebar.collapsed .nav-item:hover {
  transform: scale(1.05);
}

.nav-item:hover::before {
  opacity: 1;
}

.nav-active {
  background: linear-gradient(135deg, rgba(255, 235, 167, 0.15) 0%, rgba(255, 235, 167, 0.05) 100%);
  border-left-color: #ffeba7;
  color: #ffeba7;
  box-shadow: 0 4px 16px rgba(255, 235, 167, 0.15), inset 0 1px 0 rgba(255, 235, 167, 0.1);
}

.nav-active::before {
  opacity: 1;
}

.sidebar.collapsed .nav-active {
  border-left: none;
  border-bottom-color: #ffeba7;
  background: linear-gradient(180deg, rgba(255, 235, 167, 0.18) 0%, rgba(255, 235, 167, 0.08) 100%);
  box-shadow: 0 4px 20px rgba(255, 235, 167, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.12);
}

.nav-active:hover {
  color: #ffeba7;
  transform: translateX(4px);
}

.sidebar.collapsed .nav-active:hover {
  transform: scale(1.05);
}

.nav-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  transition: all 0.25s ease;
}

.sidebar.collapsed .nav-icon {
  width: 24px;
  height: 24px;
}

.nav-item:hover .nav-icon {
  transform: scale(1.1);
}

.nav-active .nav-icon {
  color: #ffeba7;
  filter: drop-shadow(0 0 6px rgba(255, 235, 167, 0.5));
}

.nav-text {
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.3px;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid rgba(255, 235, 167, 0.08);
  background: rgba(0, 0, 0, 0.2);
}

.sidebar-footer-collapsed {
  padding: 20px 10px;
  border-top: 1px solid rgba(255, 235, 167, 0.08);
  background: rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.user-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-radius: 8px;
  transition: all 0.25s ease;
  background: rgba(255, 235, 167, 0.03);
}

.user-info:hover {
  background: rgba(255, 235, 167, 0.08);
}

.user-info-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  box-shadow: 0 4px 16px rgba(255, 235, 167, 0.4), 0 0 0 2px rgba(255, 235, 167, 0.2);
  background: linear-gradient(135deg, #ffeba7 0%, #ffd666 100%);
  color: #102770;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.user-avatar:hover {
  transform: scale(1.05) rotate(-3deg);
  box-shadow: 0 6px 20px rgba(255, 235, 167, 0.5);
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 2px;
}

.user-email {
  font-size: 11px;
  color: #c4c3ca;
  opacity: 0.6;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.logout-btn {
  width: 32px;
  height: 32px;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.25s ease;
  color: #ff4d4f;
  background: transparent;
  border: none;
  cursor: pointer;
  opacity: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-info:hover .logout-btn {
  opacity: 1;
}

.logout-btn:hover {
  background: rgba(255, 77, 79, 0.15);
  transform: scale(1.1);
}

.logout-icon {
  width: 16px;
  height: 16px;
}

.user-avatar-small {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 15px;
  box-shadow: 0 4px 20px rgba(255, 235, 167, 0.4), 0 0 0 2px rgba(255, 235, 167, 0.25);
  background: linear-gradient(135deg, #ffeba7 0%, #ffd666 100%);
  color: #102770;
  transition: all 0.3s ease;
}

.user-avatar-small:hover {
  transform: scale(1.08) rotate(-3deg);
  box-shadow: 0 6px 24px rgba(255, 235, 167, 0.5);
}

.logout-btn-small {
  width: 36px;
  height: 36px;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.25s ease;
  color: #ff4d4f;
  background: rgba(255, 77, 79, 0.08);
  border: 1px solid rgba(255, 77, 79, 0.15);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logout-btn-small:hover {
  background: rgba(255, 77, 79, 0.18);
  border-color: rgba(255, 77, 79, 0.3);
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(255, 77, 79, 0.2);
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    z-index: 1000;
    transform: translateX(-100%);
    box-shadow: 8px 0 32px rgba(0, 0, 0, 0.5);
  }

  .sidebar:not(.collapsed) {
    transform: translateX(0);
  }

  .collapse-btn {
    opacity: 1 !important;
  }
}
</style>
