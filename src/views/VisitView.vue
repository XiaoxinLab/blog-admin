<template>
  <div class="page">
    <div class="page-head">
      <div>
        <h1 class="page-title">访问统计</h1>
        <p class="page-sub">前台博客的访问记录</p>
      </div>
      <div class="row">
        <select v-model.number="days" class="select" style="width: 132px" @change="loadStats">
          <option :value="7">近 7 天</option>
          <option :value="14">近 14 天</option>
          <option :value="30">近 30 天</option>
        </select>
        <button class="btn" :disabled="loading" @click="loadAll">
          <RefreshCw :size="14" :stroke-width="1.5" />
          刷新
        </button>
      </div>
    </div>

    <template v-if="loading">
      <div class="metric-band">
        <div v-for="n in 4" :key="n" class="metric">
          <div class="skeleton skeleton-line" style="width: 56px"></div>
          <div class="skeleton" style="height: 24px; width: 64px"></div>
        </div>
      </div>
      <div class="card" style="margin-top: var(--space-5)">
        <div class="card-body">
          <SkeletonBlock variant="panel" />
        </div>
      </div>
    </template>

    <template v-else>
      <MetricBand :items="metrics" />

      <div class="visit-grid">
        <!-- 每日趋势 -->
        <div class="card glow-card">
          <div class="card-head">
            <div class="card-title">每日访问量</div>
            <div class="muted" style="font-size: 12px">单位：次</div>
          </div>
          <div class="card-body">
            <EmptyState
              v-if="!dailyStats.length"
              :icon="ChartNoAxesCombined"
              title="还没有访问记录"
              text="前台博客有人打开页面之后，这里会开始记录每天的访问量"
            />
            <TrendChart v-else :items="dailyStats" :height="288" />
          </div>
        </div>

        <!-- 热门页面排行 -->
        <div class="card">
          <div class="card-head">
            <div class="card-title">热门页面排行</div>
          </div>
          <div class="card-body">
            <EmptyState
              v-if="!topPages.length"
              :icon="ListOrdered"
              title="还没有访问记录"
              text="等有访客之后，这里会按访问次数排出最热的页面"
            />
            <ul v-else class="rank-list">
              <li v-for="(page, index) in topPages" :key="index" class="rank-item">
                <span class="rank-index mono">{{ String(index + 1).padStart(2, '0') }}</span>
                <span class="rank-body">
                  <span class="rank-path mono">{{ page.path }}</span>
                  <span class="rank-title">{{ page.title }}</span>
                </span>
                <span class="rank-count mono">{{ page.visits }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- 访客明细 -->
      <div class="card page-section">
        <div class="card-head">
          <div class="card-title">访客明细</div>
        </div>
        <div class="table-wrap">
          <table v-if="visitors.length" class="table">
            <thead>
              <tr>
                <th style="width: 150px">时间</th>
                <th style="width: 130px">IP</th>
                <th style="width: 150px">设备</th>
                <th>页面</th>
                <th style="width: 180px">来源</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in visitors" :key="item.id">
                <td class="muted" style="font-size: 12px">{{ formatDateTime(item.time) }}</td>
                <td class="mono muted">{{ item.ip || '—' }}</td>
                <td>
                  <span class="tag tag-muted">{{ item.device?.type || '未知' }}</span>
                  <div class="muted" style="font-size: 11px; margin-top: 3px">{{ item.device?.name || '' }}</div>
                </td>
                <td>
                  <div class="path-cell mono" :title="item.page">{{ item.page }}</div>
                  <div class="muted" style="font-size: 12px">{{ item.pageTitle || '' }}</div>
                </td>
                <td class="muted cell-truncate" :title="item.referrer">{{ item.referrer || '直接访问' }}</td>
              </tr>
            </tbody>
          </table>

          <EmptyState
            v-else
            :icon="Users"
            title="还没有访客记录"
            text="每一次打开都会记下一条，包括时间、IP 和看的页面"
          />
        </div>

        <PaginationBar
          v-if="visitorTotal > 0"
          :page-num="visitorPage"
          :page-size="visitorPageSize"
          :total="visitorTotal"
          @change="handleVisitorPageChange"
        />
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { ChartNoAxesCombined, ListOrdered, RefreshCw, Users } from 'lucide-vue-next'
import http from '@/utils/api'
import { toastError } from '@/utils/toast'
import { formatDateTime } from '@/utils/format'
import MetricBand from '@/components/MetricBand.vue'
import EmptyState from '@/components/EmptyState.vue'
import SkeletonBlock from '@/components/SkeletonBlock.vue'
import TrendChart from '@/components/TrendChart.vue'
import PaginationBar from '@/components/PaginationBar.vue'

// 统计时间范围，单位：天
const days = ref(7)

// 是否正在加载
const loading = ref(false)

// 总访问量
const totalVisits = ref(0)

// 今日访问量
const todayVisits = ref(0)

// 每天的访问量
const dailyStats = ref([])

// 热门页面
const topPages = ref([])

// 访客明细列表
const visitors = ref([])

// 访客总数
const visitorTotal = ref(0)

// 访客列表当前页码
const visitorPage = ref(1)

// 访客列表每页条数
const visitorPageSize = ref(20)

// 数字带上的四组数字
const metrics = computed(() => [
  { label: '总访问量', value: totalVisits.value },
  { label: '今日访问', value: todayVisits.value },
  { label: '日均访问', value: averageVisits.value, hint: `按最近 ${days.value} 天算` },
  { label: '热门页面', value: topPages.value.length }
])

// 热门页面里访问次数的最大值，用来算细条的长度
const maxVisits = computed(() => Math.max(...topPages.value.map((item) => Number(item.visits) || 0), 1))

/**
 * 日均访问量
 * @returns {number} 平均值，四舍五入
 */
const averageVisits = computed(() => {
  if (!dailyStats.value.length) return 0
  const sum = dailyStats.value.reduce((acc, item) => acc + Number(item.count || 0), 0)
  return Math.round(sum / dailyStats.value.length)
})

/**
 * 拉取统计数字
 * @returns {Promise<void>} 数据加载结束后结束
 */
async function loadStats() {
  try {
    const res = await http.get('/visit/stats', { params: { days: days.value } })
    const data = res?.result || {}
    totalVisits.value = data.totalVisits ?? 0
    todayVisits.value = data.todayVisits ?? 0
    dailyStats.value = Array.isArray(data.dailyStats) ? data.dailyStats : []
    topPages.value = Array.isArray(data.topPages) ? data.topPages : []
  } catch (error) {
    toastError(error.message || '统计数据加载失败')
  }
}

/**
 * 拉取访客明细
 * @returns {Promise<void>} 数据加载结束后结束
 */
async function loadVisitors() {
  try {
    const res = await http.get('/visit/visitors', {
      params: { pageNum: visitorPage.value, pageSize: visitorPageSize.value }
    })
    visitors.value = Array.isArray(res?.result?.list) ? res.result.list : []
    visitorTotal.value = Number(res?.result?.total ?? 0)
  } catch (error) {
    toastError(error.message || '访客列表加载失败')
  }
}

/**
 * 把统计和访客列表一起刷新
 * @returns {Promise<void>} 数据加载结束后结束
 */
async function loadAll() {
  loading.value = true
  try {
    await Promise.all([loadStats(), loadVisitors()])
  } finally {
    loading.value = false
  }
}

/**
 * 切换访客列表页码
 * @param {number} page - 目标页码
 * @returns {void}
 */
function handleVisitorPageChange(page) {
  visitorPage.value = page
  loadVisitors()
}

onMounted(loadAll)
</script>

<style scoped>
.visit-grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: var(--space-5);
  align-items: start;
}

.rank-list {
  list-style: none;
  display: flex;
  flex-direction: column;
}

.rank-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) 0;
  border-bottom: 1px solid var(--line);
}

.rank-item:last-child {
  border-bottom: none;
}

.rank-index {
  font-size: 11px;
  color: var(--accent);
  opacity: 0.7;
  flex-shrink: 0;
}

.rank-body {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
  flex: 1;
}

.rank-path {
  font-size: var(--size-meta);
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rank-title {
  font-size: 11.5px;
  color: var(--text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rank-count {
  font-size: var(--font-ui);
  color: var(--accent);
  flex-shrink: 0;
}

.path-cell {
  font-size: 12px;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cell-truncate {
  font-size: 12px;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 1100px) {
  .visit-grid {
    grid-template-columns: 1fr;
  }
}
</style>
