<template>
  <!-- 表格骨架：按列数铺一排灰条 -->
  <div v-if="variant === 'rows'" class="sk-rows">
    <div v-for="row in rows" :key="row" class="sk-row">
      <span
        v-for="col in cols"
        :key="col"
        class="sk-cell skeleton"
        :style="{ width: widthFor(col) }"
      ></span>
    </div>
  </div>

  <!-- 图表骨架：几根高低不一的柱子 -->
  <div v-else class="sk-panel">
    <div class="sk-bars">
      <span
        v-for="(bar, index) in bars"
        :key="index"
        class="sk-bar skeleton"
        :style="{ height: bar + '%' }"
      ></span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  // rows：铺一排表格行；panel：铺一块图表
  variant: { type: String, default: 'rows' },
  // 铺几行
  rows: { type: Number, default: 5 },
  // 每行几个格子
  cols: { type: Number, default: 5 }
})

// 柱状骨架的高度，做成高低错落，看起来像真数据
const bars = computed(() => [38, 62, 26, 78, 44, 90, 30, 56, 70, 34, 48, 66])

/**
 * 算出每一格的宽度，让第一列宽一点、后面的窄一点，像真的表格
 * @param {number} col - 第几格，从 1 开始
 * @returns {string} 百分比宽度
 */
function widthFor(col) {
  if (col === 1) return '38%'
  if (col === 2) return '16%'
  return '9%'
}
</script>

<style scoped>
.sk-rows {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--pad-card);
}

.sk-row {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.sk-cell {
  height: 12px;
}

.sk-panel {
  padding: var(--pad-card);
}

.sk-bars {
  display: flex;
  align-items: flex-end;
  gap: var(--space-3);
  height: 220px;
}

.sk-bar {
  flex: 1;
  border-radius: var(--radius-tag) var(--radius-tag) 0 0;
}
</style>
