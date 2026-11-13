<template>
  <canvas ref="canvasRef" class="particle-field" aria-hidden="true"></canvas>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

const canvasRef = ref(null)

// 粒子的三种颜色，取自博客的强调色
const COLORS = ['#00d4ff', '#a855f7', '#00ff88']

let raf = 0
let ctx = null
let particles = []
let width = 0
let height = 0
let dpr = 1
let running = true

/**
 * 生成一颗粒子
 * @param {number} index - 粒子序号
 * @returns {object} 粒子对象
 */
function createParticle(index) {
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.22,
    vy: (Math.random() - 0.5) * 0.22,
    r: Math.random() * 1.5 + 0.8,
    color: COLORS[index % COLORS.length]
  }
}

/**
 * 按窗口大小重铺粒子
 * @returns {void}
 */
function resize() {
  const canvas = canvasRef.value
  if (!canvas) return
  dpr = Math.min(window.devicePixelRatio || 1, 2)
  width = window.innerWidth
  height = window.innerHeight
  canvas.width = width * dpr
  canvas.height = height * dpr
  canvas.style.width = width + 'px'
  canvas.style.height = height + 'px'
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  // 粒子数量跟着屏幕面积走，屏幕上限 90 个
  const count = Math.min(90, Math.round((width * height) / 26000))
  particles = Array.from({ length: count }, (_, i) => createParticle(i))
}

/**
 * 画一帧
 * @returns {void}
 */
function draw() {
  if (!ctx) return
  ctx.clearRect(0, 0, width, height)

  // 先画连线：离得近的两个点之间连一根淡线
  const linkDistance = 132
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const a = particles[i]
      const b = particles[j]
      const dx = a.x - b.x
      const dy = a.y - b.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist > linkDistance) continue
      const alpha = (1 - dist / linkDistance) * 0.14
      ctx.strokeStyle = a.color
      ctx.globalAlpha = alpha
      ctx.lineWidth = 0.6
      ctx.beginPath()
      ctx.moveTo(a.x, a.y)
      ctx.lineTo(b.x, b.y)
      ctx.stroke()
    }
  }

  // 再画点
  for (const p of particles) {
    ctx.globalAlpha = 0.5
    ctx.fillStyle = p.color
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1

  // 移动
  for (const p of particles) {
    p.x += p.vx
    p.y += p.vy
    if (p.x < -10) p.x = width + 10
    if (p.x > width + 10) p.x = -10
    if (p.y < -10) p.y = height + 10
    if (p.y > height + 10) p.y = -10
  }

  if (running) raf = requestAnimationFrame(draw)
}

onMounted(() => {
  ctx = canvasRef.value.getContext('2d')
  resize()
  draw()
  window.addEventListener('resize', resize)

  // 用户在系统里开了「减弱动态效果」就停下来，不画动画
  const query = window.matchMedia('(prefers-reduced-motion: reduce)')
  if (query.matches) {
    running = false
    draw()
  }
})

onBeforeUnmount(() => {
  running = false
  cancelAnimationFrame(raf)
  window.removeEventListener('resize', resize)
})
</script>

<style scoped>
.particle-field {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}
</style>
