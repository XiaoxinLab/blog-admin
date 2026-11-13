<template>
  <div class="trend" ref="wrapRef">
    <svg :width="width" :height="height" :viewBox="`0 0 ${width} ${height}`" role="img" aria-label="访问趋势图">
      <!-- 网格线和刻度 -->
      <g class="trend-grid">
        <line v-for="line in gridLines" :key="line.value" :x1="pad.left" :x2="width - pad.right" :y1="line.y" :y2="line.y" />
      </g>
      <g class="trend-axis-label">
        <text v-for="line in gridLines" :key="'t' + line.value" :x="pad.left - 8" :y="line.y + 4" text-anchor="end">
          {{ line.value }}
        </text>
      </g>

      <!-- 面积和折线 -->
      <path v-if="areaPath" class="trend-area" :d="areaPath" />
      <path v-if="linePath" class="trend-line" :d="linePath" />

      <!-- 今天的位置画一条虚线，指出来 -->
      <line
        v-if="lastPoint"
        class="trend-guide"
        :x1="lastPoint.x"
        :x2="lastPoint.x"
        :y1="pad.top"
        :y2="pad.top + plotHeight"
      />

      <!-- 数据点 -->
      <circle
        v-for="(point, index) in points"
        :key="index"
        :class="index === points.length - 1 ? 'trend-dot-last' : 'trend-dot'"
        :cx="point.x"
        :cy="point.y"
        r="3"
      />

      <!-- 最后一天的数值 -->
      <text v-if="lastPoint" class="trend-label" :x="lastPoint.x" :y="lastPoint.y - 12" text-anchor="middle">
        {{ lastValue }}
      </text>

      <!-- 横轴日期 -->
      <g class="trend-axis-label">
        <text
          v-for="(point, index) in points"
          v-show="showLabel(index)"
          :key="'x' + index"
          :x="point.x"
          :y="height - 8"
          text-anchor="middle"
        >
          {{ point.label }}
        </text>
      </g>
    </svg>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps({
  // 数据点，元素形如 { date: '2026-11-11', dayName: '周四', count: 14 }
  items: { type: Array, default: () => [] },
  // 图表高度（像素）
  height: { type: Number, default: 264 }
})

// 容器，用来量宽度
const wrapRef = ref(null)

// 图表宽度，初始值先给一个常见的宽度，挂载后再按实际宽度修正
const width = ref(720)

// 图表四周留白
const pad = { left: 40, right: 16, top: 24, bottom: 28 }

// 监听窗口变化重新计算
let observer = null

/**
 * 按容器实际宽度更新图表宽度
 * @returns {void}
 */
function measure() {
  if (wrapRef.value) {
    width.value = wrapRef.value.clientWidth || 720
  }
}

/**
 * 把最大值向上取整成一个好看的刻度
 * 说明：只取偶数，这样中间那条刻度线的数值也是整数，不会出现 13 这种半截数
 * @param {number} value - 实际最大值
 * @returns {number} 刻度上限
 */
function niceMax(value) {
  if (value <= 0) return 2
  if (value <= 2) return 2
  if (value <= 4) return 4
  if (value <= 10) return 10
  if (value <= 20) return 20
  if (value <= 40) return 40
  if (value <= 100) return 100
  if (value <= 200) return 200
  if (value <= 400) return 400
  if (value <= 1000) return 1000
  if (value <= 2000) return 2000
  if (value <= 4000) return 4000
  return 10000
}

// 绘图区的高度
const plotHeight = computed(() => props.height - pad.top - pad.bottom)

// 刻度上限
const scaleMax = computed(() => niceMax(Math.max(...props.items.map((item) => Number(item.count) || 0), 0)))

/**
 * 生成坐标点
 * @returns {Array<{x: number, y: number, label: string, count: number}>} 坐标点数组
 */
const points = computed(() => {
  const list = props.items
  if (!list.length) return []
  const plotWidth = width.value - pad.left - pad.right
  const step = list.length > 1 ? plotWidth / (list.length - 1) : 0
  return list.map((item, index) => {
    const count = Number(item.count) || 0
    const ratio = scaleMax.value ? count / scaleMax.value : 0
    return {
      x: pad.left + step * index,
      y: pad.top + plotHeight.value * (1 - ratio),
      label: (item.date || '').slice(5),
      count
    }
  })
})

/**
 * 平滑折线路径
 * 说明：控制点被限制在相邻两点之间，避免出现「冲下去再弹回来」的假象
 * @param {Array<{x: number, y: number}>} list - 坐标点
 * @returns {string} SVG 路径
 */
function smoothPath(list) {
  if (!list.length) return ''
  if (list.length === 1) return `M ${list[0].x} ${list[0].y}`
  let d = `M ${list[0].x} ${list[0].y}`
  for (let i = 0; i < list.length - 1; i++) {
    const p0 = list[i - 1] || list[i]
    const p1 = list[i]
    const p2 = list[i + 1]
    const p3 = list[i + 2] || p2
    const c1x = p1.x + (p2.x - p0.x) / 6
    const c2x = p2.x - (p3.x - p1.x) / 6
    // 控制点的纵坐标夹在两点之间，曲线就不会越过真实数据
    const c1y = Math.min(Math.max(p1.y + (p2.y - p0.y) / 6, Math.min(p1.y, p2.y)), Math.max(p1.y, p2.y))
    const c2y = Math.min(Math.max(p2.y - (p3.y - p1.y) / 6, Math.min(p1.y, p2.y)), Math.max(p1.y, p2.y))
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`
  }
  return d
}

/**
 * 折线本身
 * @returns {string} SVG 路径
 */
const linePath = computed(() => smoothPath(points.value))

/**
 * 面积（折线闭合到底部）
 * @returns {string} SVG 路径
 */
const areaPath = computed(() => {
  const list = points.value
  if (!list.length) return ''
  const bottom = pad.top + plotHeight.value
  return `${linePath.value} L ${list[list.length - 1].x} ${bottom} L ${list[0].x} ${bottom} Z`
})

/**
 * 横向网格线
 * @returns {Array<{value: number, y: number}>} 网格线数组
 */
const gridLines = computed(() => {
  const max = scaleMax.value
  return [0, max / 2, max].map((value) => ({
    value: Math.round(value),
    y: pad.top + plotHeight.value * (1 - (max ? value / max : 0))
  }))
})

// 最后一个点，也就是「今天」
const lastPoint = computed(() => points.value[points.value.length - 1] || null)

// 最后一天的数值
const lastValue = computed(() => (lastPoint.value ? lastPoint.value.count : 0))

/**
 * 判断某个日期标签要不要显示（点太多时隔几个显示一个）
 * @param {number} index - 点的下标
 * @returns {boolean} 要显示返回 true
 */
function showLabel(index) {
  const total = points.value.length
  if (total <= 10) return true
  return index === total - 1 || index % Math.ceil(total / 8) === 0
}

onMounted(() => {
  measure()
  if (typeof ResizeObserver !== 'undefined' && wrapRef.value) {
    observer = new ResizeObserver(measure)
    observer.observe(wrapRef.value)
  }
})

onBeforeUnmount(() => {
  if (observer) observer.disconnect()
})
</script>
