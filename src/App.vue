<template>
  <router-view />
  <!-- 全局提示条与确认弹窗挂在根组件上，任何页面都能用 -->
  <ToastHost />
  <ConfirmDialog />
</template>

<script setup>
import ToastHost from '@/components/ToastHost.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
</script>
