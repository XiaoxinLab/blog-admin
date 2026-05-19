<template>
  <div class="space-y-6">
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <span class="loading-text">加载中...</span>
    </div>

    <template v-else>
      <div class="stats-grid">
        <div v-for="stat in stats" :key="stat.title" class="stat-card">
          <div class="flex items-center justify-between">
            <div>
              <p class="stat-label">{{ stat.title }}</p>
              <p class="stat-value" :style="{ color: stat.color }">{{ stat.value }}</p>
              <p class="stat-change" :style="{ color: stat.changeColor }">{{ stat.change }}</p>
            </div>
            <div class="stat-icon-wrapper" :style="{ backgroundColor: stat.iconBg, borderColor: stat.iconBorder }">
              <svg class="w-6 h-6" :style="{ color: stat.iconColor }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="stat.icon"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="panel">
          <h3 class="panel-title">
            <span class="title-accent"></span>
            最近文章
          </h3>
          <div v-if="recentArticles.length === 0" class="empty-text">暂无文章</div>
          <div v-else class="space-y-4">
            <div v-for="article in recentArticles" :key="article.id" class="article-item">
              <div class="flex-1 min-w-0">
                <h4 class="article-item-title">{{ article.article_title || article.title }}</h4>
                <p class="article-item-date">{{ formatDate(article.createdAt || article.created_at) }}</p>
              </div>
              <span :class="['status-tag', article.deletedAt ? 'status-offline' : 'status-published']">
                {{ article.deletedAt ? '已下架' : '已发布' }}
              </span>
            </div>
          </div>
        </div>

        <div class="panel visit-panel">
          <h3 class="panel-title">
            <span class="title-accent"></span>
            访问统计
          </h3>
          <div class="visit-grid">
            <div class="visit-chart-area">
              <svg class="donut-chart" viewBox="0 0 160 160">
                <defs>
                  <filter id="glow1">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                </defs>
                <circle cx="80" cy="80" r="60" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="16" />
                <circle cx="80" cy="80" r="60" fill="none" stroke="#ffeba7" stroke-width="16"
                  stroke-dasharray="150.8 226.2" stroke-dashoffset="94.2" stroke-linecap="round"
                  transform="rotate(-90 80 80)" filter="url(#glow1)" class="donut-segment donut-segment-1" />
                <circle cx="80" cy="80" r="60" fill="none" stroke="#28c76f" stroke-width="16"
                  stroke-dasharray="150.8 226.2" stroke-dashoffset="-56.6" stroke-linecap="round"
                  transform="rotate(-90 80 80)" class="donut-segment donut-segment-2" />
                <circle cx="80" cy="80" r="60" fill="none" stroke="#7367f0" stroke-width="16"
                  stroke-dasharray="56.5 320.5" stroke-dashoffset="-207.4" stroke-linecap="round"
                  transform="rotate(-90 80 80)" class="donut-segment donut-segment-3" />
                <circle cx="80" cy="80" r="60" fill="none" stroke="#e91e63" stroke-width="16"
                  stroke-dasharray="37.7 339.3" stroke-dashoffset="-263.9" stroke-linecap="round"
                  transform="rotate(-90 80 80)" class="donut-segment donut-segment-4" />
                <text x="80" y="74" text-anchor="middle" fill="#fff" font-size="22" font-weight="700">{{ visitData?.totalVisits?.toLocaleString() || '0' }}</text>
                <text x="80" y="94" text-anchor="middle" fill="#8b8b9e" font-size="11">总访问</text>
              </svg>
            </div>
            <div class="visit-legend">
              <div v-for="(item, index) in visitStats" :key="index" class="legend-item">
                <div class="legend-left">
                  <span class="legend-dot" :style="{ background: item.color }"></span>
                  <span class="legend-label">{{ item.label }}</span>
                </div>
                <div class="legend-right">
                  <span class="legend-value">{{ item.value }}</span>
                  <span class="legend-pct">{{ item.percentage }}%</span>
                </div>
              </div>
            </div>
          </div>
          <div class="visit-trend">
            <div class="trend-header">
              <span class="trend-label">近 7 日访问趋势</span>
              <span class="trend-badge up">↑ 12%</span>
            </div>
            <div class="mini-bars">
              <div v-for="(bar, i) in trendBars" :key="i" class="bar-col">
                <div class="bar-fill" :style="{ height: bar.height + '%' }">
                  <div class="bar-shimmer"></div>
                </div>
                <span class="bar-label">{{ bar.day }}</span>
              </div>
            </div>
          </div>

          <div class="visit-extra">
            <div class="extra-section">
              <h4 class="extra-title">热门页面</h4>
              <div class="page-list">
                <div v-for="(page, i) in topPages" :key="i" class="page-item">
                  <span class="page-rank" :class="'rank-' + (i + 1)">{{ i + 1 }}</span>
                  <span class="page-name">{{ page.name }}</span>
                  <span class="page-views">{{ page.views }} 次</span>
                </div>
              </div>
            </div>
            <div class="extra-section">
              <h4 class="extra-title">设备分布</h4>
              <div class="device-list">
                <div v-for="(device, i) in deviceStats" :key="i" class="device-item">
                  <div class="device-icon" :style="{ background: device.bg, color: device.color }">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="device.icon"></path>
                    </svg>
                  </div>
                  <div class="device-info">
                    <span class="device-name">{{ device.name }}</span>
                    <div class="device-bar-wrap">
                      <div class="device-bar" :style="{ width: device.pct + '%', background: device.color }"></div>
                    </div>
                  </div>
                  <span class="device-pct">{{ device.pct }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="panel">
        <h3 class="panel-title">
          <span class="title-accent"></span>
          快速操作
        </h3>
        <div class="quick-actions">
          <router-link to="/articles/new" class="quick-action quick-action-gold">
            <div class="quick-action-icon quick-action-icon-gold">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
            </div>
            <div>
              <p class="quick-action-title">新建文章</p>
              <p class="quick-action-desc">创建新的博客内容</p>
            </div>
          </router-link>

          <router-link to="/articles" class="quick-action quick-action-green">
            <div class="quick-action-icon quick-action-icon-green">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <div>
              <p class="quick-action-title">管理文章</p>
              <p class="quick-action-desc">查看和编辑所有文章</p>
            </div>
          </router-link>

          <button class="quick-action quick-action-purple">
            <div class="quick-action-icon quick-action-icon-purple">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <div>
              <p class="quick-action-title">数据报告</p>
              <p class="quick-action-desc">查看详细统计分析</p>
            </div>
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { dashboardApi, articleApi } from '../api'

const loading = ref(true)
const stats = ref([])
const recentArticles = ref([])

// 访问统计数据
const visitData = ref(null)
const visitStats = computed(() => {
  if (!visitData.value) return []
  const total = visitData.value.totalVisits || 1
  // 模拟不同来源的数据（实际项目中可以从后端获取）
  return [
    { label: '直接访问', value: Math.round(total * 0.35).toString(), percentage: 35, color: '#ffeba7' },
    { label: '搜索引擎', value: Math.round(total * 0.40).toString(), percentage: 40, color: '#28c76f' },
    { label: '社交媒体', value: Math.round(total * 0.15).toString(), percentage: 15, color: '#7367f0' },
    { label: '外部链接', value: Math.round(total * 0.10).toString(), percentage: 10, color: '#e91e63' }
  ]
})

const trendBars = computed(() => {
  if (!visitData.value || !visitData.value.dailyStats) {
    return [
      { day: '周一', height: 45 },
      { day: '周二', height: 68 },
      { day: '周三', height: 55 },
      { day: '周四', height: 80 },
      { day: '周五', height: 72 },
      { day: '周六', height: 40 },
      { day: '周日', height: 35 }
    ]
  }

  const daily = visitData.value.dailyStats
  const maxCount = Math.max(...daily.map(d => d.count), 1)

  return daily.slice(-7).map(d => ({
    day: d.dayName,
    height: Math.round((d.count / maxCount) * 100),
    count: d.count
  }))
})

const topPages = computed(() => {
  if (!visitData.value || !visitData.value.topPages) {
    return [
      { name: '首页', views: 486 },
      { name: '博客列表', views: 352 },
      { name: '文章详情', views: 298 },
      { name: '关于我', views: 215 }
    ]
  }

  return visitData.value.topPages.slice(0, 4).map(p => ({
    // 优先显示中文标题，如果没有则显示路径
    name: p.title || (p.path.length > 20 ? p.path.substring(0, 20) + '...' : p.path),
    views: p.visits,
    path: p.path // 保留原始路径用于 tooltip 或其他用途
  }))
})

const deviceStats = [
  { name: '桌面端', pct: 62, color: '#ffeba7', bg: 'rgba(255, 235, 167, 0.1)', icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
  { name: '移动端', pct: 28, color: '#7367f0', bg: 'rgba(115, 103, 240, 0.1)', icon: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z' },
  { name: '平板', pct: 10, color: '#28c76f', bg: 'rgba(40, 199, 111, 0.1)', icon: 'M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z' }
]

const formatDate = (date) => {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleDateString('zh-CN')
}

const fetchDashboardData = async () => {
  try {
    loading.value = true

    const [articlesRes, visitRes] = await Promise.all([
      articleApi.getArticleList({ pageNum: 1, pageSize: 100 }),
      dashboardApi.getVisitStats(7)
    ])

    const articlesData = articlesRes.result
    const totalArticles = articlesData.total || 0
    visitData.value = visitRes

    const totalVisits = visitRes?.totalVisits || 0
    const todayVisits = visitRes?.todayVisits || 0

    stats.value = [
      {
        title: '总文章数',
        value: totalArticles.toString(),
        change: `共 ${totalArticles} 篇`,
        color: '#ffeba7',
        changeColor: '#c4c3ca',
        iconBg: 'rgba(255, 235, 167, 0.1)',
        iconBorder: 'rgba(255, 235, 167, 0.2)',
        iconColor: '#ffeba7',
        icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
      },
      {
        title: '已发布',
        value: totalArticles.toString(),
        change: '全部已发布',
        color: '#28c76f',
        changeColor: '#c4c3ca',
        iconBg: 'rgba(40, 199, 111, 0.1)',
        iconBorder: 'rgba(40, 199, 111, 0.2)',
        iconColor: '#28c76f',
        icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
      },
      {
        title: '今日访问',
        value: todayVisits.toString(),
        change: '实时统计',
        color: '#7367f0',
        changeColor: '#28c76f',
        iconBg: 'rgba(115, 103, 240, 0.1)',
        iconBorder: 'rgba(115, 103, 240, 0.2)',
        iconColor: '#7367f0',
        icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
      },
      {
        title: '总访问量',
        value: totalVisits.toLocaleString(),
        change: '累计统计',
        color: '#9c27b0',
        changeColor: '#c4c3ca',
        iconBg: 'rgba(156, 39, 176, 0.1)',
        iconBorder: 'rgba(156, 39, 176, 0.2)',
        iconColor: '#9c27b0',
        icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
      }
    ]

    const articles = articlesData.list || []
    recentArticles.value = articles.slice(0, 5)
  } catch (error) {
    console.error('获取仪表板数据失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDashboardData()
})
</script>

<style scoped>
.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 0;
}

.spinner {
  border-radius: 50%;
  height: 32px;
  width: 32px;
  border-bottom: 2px solid #ffeba7;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  margin-left: 12px;
  color: #c4c3ca;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 24px;
}

@media (min-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.stat-card {
  border-radius: 12px;
  padding: 24px;
  border: 1px solid rgba(255, 235, 167, 0.1);
  transition: all 0.3s ease;
  background-color: #2a2b38;
}

.stat-card:hover {
  border-color: rgba(255, 235, 167, 0.3);
  box-shadow: 0 8px 24px 0 rgba(21, 21, 21, 0.2);
}

.stat-label {
  font-size: 13px;
  font-weight: 500;
  color: #c4c3ca;
}

.stat-value {
  font-size: 30px;
  font-weight: 700;
  margin-top: 8px;
}

.stat-change {
  font-size: 11px;
  margin-top: 8px;
}

.stat-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid;
}

.panel {
  border-radius: 12px;
  padding: 24px;
  border: 1px solid rgba(255, 235, 167, 0.1);
  background-color: #2a2b38;
}

.panel-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #fff;
}

.title-accent {
  width: 4px;
  height: 20px;
  border-radius: 9999px;
  background-color: #ffeba7;
}

.empty-text {
  text-align: center;
  padding: 32px 0;
  color: #c4c3ca;
}

.article-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid transparent;
  transition: all 0.2s ease;
  cursor: pointer;
  background-color: rgba(31, 32, 41, 0.5);
}

.article-item:hover {
  background-color: rgba(42, 43, 56, 0.7);
  border-color: rgba(255, 235, 167, 0.15);
}

.article-item-title {
  font-weight: 500;
  color: #fff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 0.2s ease;
}

.article-item:hover .article-item-title {
  color: #ffeba7;
}

.article-item-date {
  font-size: 13px;
  margin-top: 4px;
  color: #c4c3ca;
  opacity: 0.6;
}

.status-tag {
  padding: 4px 12px;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 500;
  border: 1px solid;
  flex-shrink: 0;
}

.status-published {
  background-color: rgba(40, 199, 111, 0.2);
  color: #28c76f;
  border-color: rgba(40, 199, 111, 0.3);
}

.status-offline {
  background-color: rgba(255, 193, 7, 0.2);
  color: #ffc107;
  border-color: rgba(255, 193, 7, 0.3);
}

.visit-panel {
  overflow: hidden;
}

.visit-grid {
  display: flex;
  gap: 32px;
  align-items: center;
  margin-bottom: 28px;
}

.visit-chart-area {
  flex-shrink: 0;
}

.donut-chart {
  width: 160px;
  height: 160px;
}

.donut-segment {
  transition: stroke-dasharray 1s cubic-bezier(0.4, 0, 0.2, 1), stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1);
  animation: donutGrow 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.donut-segment-1 { animation-delay: 0s; }
.donut-segment-2 { animation-delay: 0.15s; }
.donut-segment-3 { animation-delay: 0.3s; }
.donut-segment-4 { animation-delay: 0.45s; }

@keyframes donutGrow {
  from {
    stroke-dasharray: 0 377;
  }
}

.visit-legend {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-radius: 8px;
  background: rgba(31, 32, 41, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.04);
  transition: all 0.3s ease;
}

.legend-item:hover {
  background: rgba(31, 32, 41, 0.8);
  border-color: rgba(255, 235, 167, 0.1);
  transform: translateX(4px);
}

.legend-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 0 8px currentColor;
}

.legend-label {
  font-size: 13px;
  color: #c4c3ca;
}

.legend-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.legend-value {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  font-family: 'Fira Code', 'Consolas', monospace;
}

.legend-pct {
  font-size: 12px;
  color: #8b8b9e;
  background: rgba(255, 255, 255, 0.05);
  padding: 2px 8px;
  border-radius: 4px;
}

.visit-trend {
  border-top: 1px solid rgba(255, 235, 167, 0.08);
  padding-top: 20px;
}

.trend-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.trend-label {
  font-size: 13px;
  color: #8b8b9e;
}

.trend-badge {
  font-size: 12px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 6px;
}

.trend-badge.up {
  background: rgba(40, 199, 111, 0.15);
  color: #28c76f;
  border: 1px solid rgba(40, 199, 111, 0.2);
}

.mini-bars {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 8px;
  height: 100px;
  padding: 0 4px;
}

.bar-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  height: 100%;
  justify-content: flex-end;
}

.bar-fill {
  width: 100%;
  max-width: 32px;
  border-radius: 6px 6px 0 0;
  background: linear-gradient(180deg, #ffeba7 0%, rgba(255, 235, 167, 0.3) 100%);
  position: relative;
  overflow: hidden;
  transition: height 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 4px;
  animation: barRise 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.bar-col:nth-child(2) .bar-fill { animation-delay: 0.1s; }
.bar-col:nth-child(3) .bar-fill { animation-delay: 0.2s; }
.bar-col:nth-child(4) .bar-fill { animation-delay: 0.3s; }
.bar-col:nth-child(5) .bar-fill { animation-delay: 0.4s; }
.bar-col:nth-child(6) .bar-fill { animation-delay: 0.5s; }
.bar-col:nth-child(7) .bar-fill { animation-delay: 0.6s; }

@keyframes barRise {
  from { height: 0; }
}

.bar-shimmer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 30px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.2), transparent);
  border-radius: 6px 6px 0 0;
}

.bar-label {
  font-size: 11px;
  color: #6b6b7e;
  white-space: nowrap;
}

@media (max-width: 640px) {
  .visit-grid {
    flex-direction: column;
    align-items: center;
  }

  .visit-legend {
    width: 100%;
  }

  .mini-bars {
    gap: 4px;
  }

  .bar-fill {
    max-width: 24px;
  }
}

.visit-extra {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  border-top: 1px solid rgba(255, 235, 167, 0.08);
  padding-top: 20px;
  margin-top: 4px;
}

.extra-section {
  min-width: 0;
}

.extra-title {
  font-size: 12px;
  font-weight: 600;
  color: #8b8b9e;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 12px;
}

.page-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.page-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 6px;
  background: rgba(31, 32, 41, 0.4);
  transition: all 0.25s ease;
}

.page-item:hover {
  background: rgba(31, 32, 41, 0.7);
}

.page-rank {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.06);
  color: #8b8b9e;
}

.page-rank.rank-1 {
  background: linear-gradient(135deg, #ffeba7, #ffd666);
  color: #102770;
}

.page-rank.rank-2 {
  background: rgba(255, 235, 167, 0.2);
  color: #ffeba7;
}

.page-rank.rank-3 {
  background: rgba(255, 235, 167, 0.12);
  color: #c4a95a;
}

.page-name {
  flex: 1;
  font-size: 12px;
  color: #c4c3ca;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.page-views {
  font-size: 11px;
  color: #6b6b7e;
  font-family: 'Fira Code', 'Consolas', monospace;
  flex-shrink: 0;
}

.device-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.device-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.device-icon {
  width: 30px;
  height: 30px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.device-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.device-name {
  font-size: 12px;
  color: #c4c3ca;
}

.device-bar-wrap {
  height: 4px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.05);
  overflow: hidden;
}

.device-bar {
  height: 100%;
  border-radius: 2px;
  transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
}

.device-pct {
  font-size: 12px;
  font-weight: 600;
  color: #fff;
  font-family: 'Fira Code', 'Consolas', monospace;
  flex-shrink: 0;
}

@media (max-width: 640px) {
  .visit-extra {
    grid-template-columns: 1fr;
  }
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 16px;
}

@media (min-width: 768px) {
  .quick-actions {
    grid-template-columns: repeat(3, 1fr);
  }
}

.quick-action {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border-radius: 8px;
  border: 2px dashed;
  transition: all 0.3s ease;
  text-decoration: none;
  background: transparent;
  cursor: pointer;
}

.quick-action-gold {
  border-color: rgba(255, 235, 167, 0.2);
}

.quick-action-gold:hover {
  border-color: rgba(255, 235, 167, 0.5);
  background-color: rgba(255, 235, 167, 0.05);
}

.quick-action-green {
  border-color: rgba(40, 199, 111, 0.2);
}

.quick-action-green:hover {
  border-color: rgba(40, 199, 111, 0.5);
  background-color: rgba(40, 199, 111, 0.05);
}

.quick-action-purple {
  border-color: rgba(156, 39, 176, 0.2);
}

.quick-action-purple:hover {
  border-color: rgba(156, 39, 176, 0.5);
  background-color: rgba(156, 39, 176, 0.05);
}

.quick-action-icon {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid;
  flex-shrink: 0;
}

.quick-action-icon-gold {
  background-color: rgba(255, 235, 167, 0.1);
  border-color: rgba(255, 235, 167, 0.2);
  color: #ffeba7;
}

.quick-action-icon-green {
  background-color: rgba(40, 199, 111, 0.1);
  border-color: rgba(40, 199, 111, 0.2);
  color: #28c76f;
}

.quick-action-icon-purple {
  background-color: rgba(156, 39, 176, 0.1);
  border-color: rgba(156, 39, 176, 0.2);
  color: #9c27b0;
}

.quick-action-title {
  font-weight: 500;
  color: #fff;
}

.quick-action-desc {
  font-size: 13px;
  color: #c4c3ca;
  opacity: 0.6;
}
</style>
