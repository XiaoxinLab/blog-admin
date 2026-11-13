<template>
  <div class="toast-wrap">
    <transition-group name="fade">
      <div v-for="item in toastList" :key="item.id" class="toast" :class="'toast-' + item.type">
        <span class="toast-dot"></span>
        <span>{{ item.message }}</span>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { toastList } from '@/utils/toast'
</script>
