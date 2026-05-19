<template>
  <div v-if="isAuthChecking" class="auth-loading">
    <div class="loading-spinner"></div>
  </div>
  <div v-else-if="isLoginPage" class="min-h-screen">
    <router-view />
  </div>
  <div v-else class="app-layout" :class="{ 'sidebar-collapsed': isSidebarCollapsed }">
    <Sidebar :activeMenu="activeMenu" :collapsed="isSidebarCollapsed" @navigate="handleNavigate" @toggle-collapse="toggleSidebar" />
    <div class="main-wrapper">
      <Header @toggle-sidebar="toggleSidebar" :sidebar-collapsed="isSidebarCollapsed" />
      <main class="main-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from './components/Sidebar.vue'
import Header from './components/Header.vue'

const route = useRoute()
const isAuthChecking = ref(true)
const isSidebarCollapsed = ref(window.innerWidth < 768)

const activeMenu = computed(() => route.name)
const isLoginPage = computed(() => route.name === 'Login')

const handleNavigate = (menuName) => {
  console.log('Navigate to:', menuName)
}

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
}

onMounted(() => {
  setTimeout(() => {
    isAuthChecking.value = false
  }, 0)
})
</script>

<style scoped>
.app-layout {
  display: flex;
  height: 100vh;
  background-color: #1f2029;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.auth-loading {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #1f2029;
  z-index: 9999;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 235, 167, 0.1);
  border-top-color: #ffeba7;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .main-content {
    padding: 16px;
  }

  .app-layout.sidebar-collapsed .main-wrapper {
    margin-left: 0;
  }
}
</style>