<template>
  <div class="pagination">
    <div class="pagination-info">
      共 <strong>{{ total }}</strong> 条，第 {{ pageNum }} / {{ totalPages }} 页
    </div>
    <div class="pagination-btns">
      <button class="page-btn" :disabled="pageNum <= 1" @click="go(pageNum - 1)">上一页</button>
      <button
        v-for="item in pageNumbers"
        :key="item"
        class="page-btn"
        :class="{ active: item === pageNum }"
        @click="go(item)"
      >
        {{ item }}
      </button>
      <button class="page-btn" :disabled="pageNum >= totalPages" @click="go(pageNum + 1)">下一页</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  // 当前页码
  pageNum: { type: Number, default: 1 },
  // 每页条数
  pageSize: { type: Number, default: 10 },
  // 总条数
  total: { type: Number, default: 0 },
  // 最多显示多少个页码按钮
  maxButtons: { type: Number, default: 7 }
})

const emit = defineEmits(['change'])

/**
 * 总页数，至少是 1
 * @returns {number} 计算出来的总页数
 */
const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))

/**
 * 需要显示的页码按钮列表
 * 说明：页数多的时候只保留当前页附近的几页，其余用省略号思路裁掉
 * @returns {number[]} 页码数组
 */
const pageNumbers = computed(() => {
  const total = totalPages.value
  const max = props.maxButtons
  if (total <= max) {
    return Array.from({ length: total }, (_, index) => index + 1)
  }
  let start = props.pageNum - Math.floor(max / 2)
  if (start < 1) start = 1
  if (start + max - 1 > total) start = total - max + 1
  return Array.from({ length: max }, (_, index) => start + index)
})

/**
 * 跳到指定页
 * @param {number} page - 目标页码
 * @returns {void}
 */
function go(page) {
  if (page < 1 || page > totalPages.value || page === props.pageNum) return
  emit('change', page)
}
</script>
