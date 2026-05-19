<template>
  <div class="visitor-list-page">
    <div class="stats-bar">
      <div class="stat-item">
        <span class="stat-label">总访问量</span>
        <span class="stat-value">{{ totalVisits.toLocaleString() }}</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-label">当前页</span>
        <span class="stat-value">{{ visitorList.length }} 条</span>
      </div>
    </div>

    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <span class="loading-text">加载中...</span>
    </div>

    <div v-else class="table-container">
      <table class="visitor-table">
        <thead>
          <tr>
            <th>时间</th>
            <th>IP 地址</th>
            <th>设备类型</th>
            <th>设备详情</th>
            <th>访问页面</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="visitor in visitorList" :key="visitor.id" class="visitor-row">
            <td class="time-cell">
              <div class="time-main">{{ formatTime(visitor.time) }}</div>
              <div class="time-date">{{ formatDate(visitor.time) }}</div>
            </td>
            <td class="ip-cell">
              <span class="ip-address">{{ visitor.ip || '-' }}</span>
            </td>
            <td class="device-type-cell">
              <span :class="['device-badge', getDeviceBadgeClass(visitor.device?.type)]">
                {{ visitor.device?.type || '未知' }}
              </span>
            </td>
            <td class="device-detail-cell">
              <span class="device-name">{{ visitor.device?.name || '-' }}</span>
            </td>
            <td class="page-cell">
              <div class="page-info">
                <span class="page-title-text" :title="visitor.pageTitle">{{ visitor.pageTitle || visitor.page }}</span>
                <span class="page-path" :title="visitor.page">{{ visitor.page }}</span>
              </div>
            </td>
          </tr>
          <tr v-if="visitorList.length === 0">
            <td colspan="5" class="empty-cell">暂无访问记录</td>
          </tr>
        </tbody>
      </table>

      <div v-if="totalPages > 1" class="pagination">
        <button
          class="page-btn"
          :disabled="pageNum === 1"
          @click="changePage(pageNum - 1)"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>

        <template v-for="page in displayPages" :key="page">
          <button
            v-if="page !== '...'"
            :class="['page-btn', 'page-number', { active: page === pageNum }]"
            @click="changePage(page)"
          >
            {{ page }}
          </button>
          <span v-else class="page-ellipsis">...</span>
        </template>

        <button
          class="page-btn"
          :disabled="pageNum === totalPages"
          @click="changePage(pageNum + 1)"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { visitApi } from '../api'

const loading = ref(true)
const visitorList = ref([])
const totalVisits = ref(0)
const pageNum = ref(1)
const pageSize = ref(20)

const totalPages = computed(() => {
  return Math.ceil(totalVisits.value / pageSize.value) || 1
})

const displayPages = computed(() => {
  const pages = []
  const total = totalPages.value
  const current = pageNum.value

  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i)
      pages.push('...')
      pages.push(total)
    } else if (current >= total - 3) {
      pages.push(1)
      pages.push('...')
      for (let i = total - 4; i <= total; i++) pages.push(i)
    } else {
      pages.push(1)
      pages.push('...')
      for (let i = current - 1; i <= current + 1; i++) pages.push(i)
      pages.push('...')
      pages.push(total)
    }
  }

  return pages
})

const fetchVisitorList = async () => {
  try {
    loading.value = true
    const res = await visitApi.getVisitorList({
      pageNum: pageNum.value,
      pageSize: pageSize.value
    })

    visitorList.value = res.list || []
    totalVisits.value = res.total || 0
  } catch (error) {
    console.error('获取访客列表失败:', error)
  } finally {
    loading.value = false
  }
}

const changePage = (page) => {
  if (page < 1 || page > totalPages.value) return
  pageNum.value = page
  fetchVisitorList()
}

const formatTime = (time) => {
  if (!time) return '-'
  const d = new Date(time)
  return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

const formatDate = (time) => {
  if (!time) return '-'
  const d = new Date(time)
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

const getDeviceBadgeClass = (type) => {
  const classMap = {
    '桌面端': 'desktop',
    '移动端': 'mobile',
    '其他': 'other'
  }
  return classMap[type] || 'other'
}

onMounted(() => {
  fetchVisitorList()
})
</script>

<style scoped>
.visitor-list-page {
  animation: fadeInUp 0.5s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stats-bar {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 20px 24px;
  border-radius: 12px;
  background-color: #2a2b38;
  border: 1px solid rgba(255, 235, 167, 0.1);
  margin-bottom: 24px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 13px;
  color: #8b8b9e;
}

.stat-value {
  font-size: 22px;
  font-weight: 700;
  color: #ffeba7;
  font-family: 'Fira Code', 'Consolas', monospace;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: rgba(255, 235, 167, 0.15);
}

.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 64px 0;
}

.spinner {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border-bottom: 2px solid #ffeba7;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  margin-left: 12px;
  color: #c4c3ca;
  font-size: 14px;
}

.table-container {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 235, 167, 0.1);
  background-color: #2a2b38;
}

.visitor-table {
  width: 100%;
  border-collapse: collapse;
}

.visitor-table thead {
  background: linear-gradient(135deg, rgba(255, 235, 167, 0.08) 0%, rgba(255, 235, 167, 0.03) 100%);
}

.visitor-table th {
  padding: 16px 20px;
  text-align: left;
  font-size: 13px;
  font-weight: 600;
  color: #ffeba7;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid rgba(255, 235, 167, 0.15);
}

.visitor-table tbody tr {
  transition: all 0.25s ease;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.visitor-table tbody tr:hover {
  background-color: rgba(255, 235, 167, 0.04);
  transform: translateX(2px);
}

.visitor-table td {
  padding: 18px 20px;
  color: #fff;
  font-size: 14px;
}

.time-cell {
  min-width: 140px;
}

.time-main {
  font-weight: 600;
  color: #fff;
  font-family: 'Fira Code', 'Consolas', monospace;
  font-size: 14px;
}

.time-date {
  font-size: 12px;
  color: #8b8b9e;
  margin-top: 2px;
}

.ip-cell {
  min-width: 130px;
}

.ip-address {
  font-family: 'Fira Code', 'Consolas', monospace;
  font-size: 13px;
  color: #c4c3ca;
  background: rgba(115, 103, 240, 0.1);
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid rgba(115, 103, 240, 0.2);
}

.device-type-cell {
  min-width: 90px;
}

.device-badge {
  display: inline-flex;
  align-items: center;
  padding: 5px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid;
}

.device-badge.desktop {
  background: rgba(255, 235, 167, 0.15);
  color: #ffeba7;
  border-color: rgba(255, 235, 167, 0.3);
}

.device-badge.mobile {
  background: rgba(115, 103, 240, 0.15);
  color: #7367f0;
  border-color: rgba(115, 103, 240, 0.3);
}

.device-badge.other {
  background: rgba(139, 139, 158, 0.15);
  color: #8b8b9e;
  border-color: rgba(139, 139, 158, 0.3);
}

.device-detail-cell {
  max-width: 220px;
}

.device-name {
  font-size: 13px;
  color: #c4c3ca;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.page-cell {
  max-width: 250px;
}

.page-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.page-title-text {
  font-size: 13px;
  font-weight: 500;
  color: #fff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
}

.page-path {
  font-size: 11px;
  color: #8b8b9e;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
  font-family: 'Fira Code', 'Consolas', monospace;
}

.empty-cell {
  text-align: center;
  padding: 48px !important;
  color: #8b8b9e;
  font-size: 14px;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 24px;
  border-top: 1px solid rgba(255, 235, 167, 0.08);
}

.page-btn {
  min-width: 36px;
  height: 36px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid rgba(255, 235, 167, 0.15);
  background: transparent;
  color: #c4c3ca;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-btn:hover:not(:disabled) {
  background: rgba(255, 235, 167, 0.1);
  border-color: rgba(255, 235, 167, 0.3);
  color: #ffeba7;
  transform: translateY(-1px);
}

.page-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.page-btn.active {
  background: linear-gradient(135deg, #ffeba7 0%, #ffd666 100%);
  color: #102770;
  border-color: transparent;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(255, 235, 167, 0.3);
}

.page-ellipsis {
  color: #8b8b9e;
  padding: 0 4px;
}

@media (max-width: 1200px) {
  .visitor-table th,
  .visitor-table td {
    padding: 14px 16px;
  }

  .device-detail-cell,
  .page-cell {
    max-width: 180px;
  }
}

@media (max-width: 768px) {
  .page-title {
    font-size: 20px;
  }

  .page-subtitle {
    margin-left: 0;
  }

  .stats-bar {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
    padding: 16px;
  }

  .stat-divider {
    width: 100%;
    height: 1px;
  }

  .stat-value {
    font-size: 18px;
  }

  .table-container {
    border-radius: 8px;
    overflow-x: auto; /* 允许横向滚动 */
    -webkit-overflow-scrolling: touch; /* iOS 平滑滚动 */
  }

  .visitor-table {
    min-width: 700px; /* 设置最小宽度触发滚动 */
    font-size: 13px; /* 保持正常字体大小 */
  }

  .visitor-table th {
    padding: 14px 12px;
    font-size: 12px;
  }

  .visitor-table td {
    padding: 14px 12px; /* 保持正常间距 */
  }

  .pagination {
    padding: 16px;
    gap: 6px;
  }

  .page-btn {
    min-width: 32px;
    height: 32px;
    font-size: 12px;
    padding: 0 8px;
  }
}
</style>
