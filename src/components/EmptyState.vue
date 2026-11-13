<template>
  <div class="empty">
    <div class="empty-icon">
      <component :is="icon" :size="20" :stroke-width="1.5" />
    </div>
    <div class="empty-title">{{ title }}</div>
    <p v-if="text" class="empty-text">{{ text }}</p>
    <div v-if="$slots.action" class="empty-action">
      <slot name="action" />
    </div>
  </div>
</template>

<script setup>
import { Inbox } from 'lucide-vue-next'

defineProps({
  // 空状态图标，默认是收件箱
  icon: { type: Object, default: () => Inbox },
  // 一句话说清现在的状况
  title: { type: String, default: '这里还是空的' },
  // 下一步该做什么，写给用户看
  text: { type: String, default: '' }
})
</script>
