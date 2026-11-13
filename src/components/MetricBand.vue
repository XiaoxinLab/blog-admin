<template>
  <div class="metric-band" :class="{ 'is-stacked': stacked }">
    <div v-for="item in items" :key="item.label" class="metric">
      <div class="metric-label">{{ item.label }}</div>
      <div class="metric-value">{{ item.value }}</div>
      <div v-if="item.hint" class="metric-hint">{{ item.hint }}</div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  // 指标列表，每项形如 { label, value, hint }
  items: { type: Array, required: true },
  // 是否竖着排（放在页面左边当一列用）
  stacked: { type: Boolean, default: false }
})
</script>

<style scoped>
.metric-band.is-stacked {
  flex-direction: column;
}

.metric-band.is-stacked .metric {
  flex: 0 0 auto;
  border-left: none;
  padding-left: 0;
}

.metric-band.is-stacked .metric + .metric {
  border-left: none;
  border-top: 1px solid var(--line);
}
</style>
