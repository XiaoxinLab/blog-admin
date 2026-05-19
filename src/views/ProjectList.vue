<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div class="relative w-full sm:max-w-md">
        <input
          v-model="searchQuery"
          @input="handleSearch"
          type="text"
          placeholder="搜索项目名称..."
          class="search-input w-full"
        />
        <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
      </div>
      <router-link v-permission="'admin'" to="/projects/new" class="btn-create w-full sm:w-auto justify-center">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
        </svg>
        新建项目
      </router-link>
    </div>

    <div class="table-wrapper overflow-x-auto">
      <table class="w-full min-w-[800px]">
        <thead>
          <tr>
            <th>ID</th>
            <th>项目名称</th>
            <th>类型</th>
            <th>年份</th>
            <th>创建时间</th>
            <th>状态</th>
            <th :class="{ 'text-right': showActions }">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td :colspan="totalCols" class="text-center py-12">
              <div class="inline-flex items-center gap-3">
                <div class="spinner"></div>
                <span class="text-dim">加载中...</span>
              </div>
            </td>
          </tr>
          <template v-else-if="projects.length > 0">
            <tr v-for="project in projects" :key="project.id" class="table-row">
              <td class="px-4 sm:px-6 py-4 text-sm font-mono text-dim whitespace-nowrap">{{ project.id }}</td>
              <td class="px-4 sm:px-6 py-4 min-w-[200px]">
                <div>
                  <p class="article-title">{{ project.project_name }}</p>
                  <p class="article-excerpt hidden lg:block">{{ project.project_desc?.substring(0, 80) }}...</p>
                </div>
              </td>
              <td class="px-4 sm:px-6 py-4 whitespace-nowrap">
                <span class="tag tag-purple">{{ project.project_type }}</span>
              </td>
              <td class="px-4 sm:px-6 py-4 text-sm font-mono text-dim whitespace-nowrap">{{ project.project_year }}</td>
              <td class="px-4 sm:px-6 py-4 text-sm font-mono text-dim whitespace-nowrap">{{ formatDate(project.createdAt || project.created_at) }}</td>
              <td class="px-4 sm:px-6 py-4 whitespace-nowrap">
                <span :class="['tag', isDeleted(project) ? 'tag-warning' : 'tag-success']">
                  {{ getStatusText(project) }}
                </span>
              </td>
              <td class="px-4 sm:px-6 py-4 text-right whitespace-nowrap" v-if="showActions">
                <div class="flex items-center justify-end gap-2">
                  <button @click="viewProject(project.id)" class="action-btn action-view" title="查看详情">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                  </button>
                  <button
                    v-permission="'admin'"
                    @click="editProject(project.id)"
                    class="action-btn action-edit"
                    title="编辑"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                  </button>
                  <button
                    v-permission="'admin'"
                    @click="toggleProjectStatus(project)"
                    :class="['action-btn', isDeleted(project) ? 'action-restore' : 'action-delete']"
                    :title="isDeleted(project) ? '恢复项目' : '删除项目'"
                  >
                    <svg v-if="isDeleted(project)" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </template>
          <tr v-else>
            <td :colspan="totalCols" class="text-center py-12">
              <svg class="mx-auto w-12 h-12 empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
              </svg>
              <p class="mt-4 text-dim">暂无项目数据</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="pagination.total > 0" class="pagination-bar flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-6">
      <div class="text-sm text-dim order-2 sm:order-1">
        共 {{ pagination.total }} 条记录，第 {{ pagination.pageNum }} / {{ totalPages }} 页
      </div>
      <div class="flex items-center gap-2 order-1 sm:order-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
        <button @click="changePage(pagination.pageNum - 1)" :disabled="pagination.pageNum <= 1" class="page-btn flex-shrink-0">
          上一页
        </button>
        <button
          v-for="page in displayPages"
          :key="page"
          @click="changePage(page)"
          :class="['page-btn', { 'page-active': page === pagination.pageNum }]"
          class="flex-shrink-0"
        >
          {{ page }}
        </button>
        <button @click="changePage(pagination.pageNum + 1)" :disabled="pagination.pageNum >= totalPages" class="page-btn flex-shrink-0">
          下一页
        </button>
      </div>
    </div>

    <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
      <div class="modal-content mx-4">
        <h3 class="modal-title">{{ isDeleted(projectToDelete) ? '确认恢复' : '确认删除' }}</h3>
        <p class="modal-body">
          {{ isDeleted(projectToDelete) ? `确定要恢复项目「${projectToDelete?.project_name}」吗？` : `确定要删除项目「${projectToDelete?.project_name}」吗？此操作将隐藏该项目。` }}
        </p>
        <div class="flex flex-col sm:flex-row justify-end gap-3">
          <button @click="showDeleteModal = false" class="btn-cancel w-full sm:w-auto">取消</button>
          <button
            @click="confirmToggleStatus"
            :class="[isDeleted(projectToDelete) ? 'btn-restore' : 'btn-delete', 'w-full sm:w-auto']"
          >
            {{ isDeleted(projectToDelete) ? '确认恢复' : '确认删除' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { projectApi } from '../api'
import auth from '../utils/auth'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const projects = ref([])
const searchQuery = ref('')
const showDeleteModal = ref(false)
const projectToDelete = ref(null)
const pagination = ref({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

const isAdmin = computed(() => auth.isAdmin())
const isLoggedIn = computed(() => !!auth.getUser())

const showActions = computed(() => isLoggedIn.value)

const totalCols = computed(() => showActions.value ? 7 : 6)

const totalPages = computed(() => Math.ceil(pagination.value.total / pagination.value.pageSize))

const displayPages = computed(() => {
  const current = pagination.value.pageNum
  const total = totalPages.value
  const pages = []

  if (total <= 5) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    if (current <= 3) {
      for (let i = 1; i <= 5; i++) pages.push(i)
    } else if (current >= total - 2) {
      for (let i = total - 4; i <= total; i++) pages.push(i)
    } else {
      for (let i = current - 2; i <= current + 2; i++) pages.push(i)
    }
  }

  return pages
})

const fetchProjects = async () => {
  loading.value = true
  try {
    let res
    if (searchQuery.value.trim()) {
      res = await projectApi.getProjectList({
        pageNum: pagination.value.pageNum,
        pageSize: pagination.value.pageSize,
        search: searchQuery.value.trim()
      })
    } else {
      res = await projectApi.getProjectList({
        pageNum: pagination.value.pageNum,
        pageSize: pagination.value.pageSize
      })
    }

    if (res.code === 0) {
      projects.value = res.result.list || []
      pagination.value.total = res.result.total || 0
    }
  } catch (error) {
    console.error('获取项目列表失败:', error)
  } finally {
    loading.value = false
  }
}

let searchTimer = null

const handleSearch = () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    pagination.value.pageNum = 1
    fetchProjects()
  }, 500)
}

const editProject = (id) => {
  router.push(`/projects/edit/${id}`)
}

const viewProject = (id) => {
  router.push(`/projects/detail/${id}`)
}

const toggleProjectStatus = (project) => {
  projectToDelete.value = project
  showDeleteModal.value = true
}

const confirmToggleStatus = async () => {
  try {
    if (!projectToDelete.value) return

    let res
    if (isDeleted(projectToDelete.value)) {
      res = await projectApi.restoreProject(projectToDelete.value.id)
    } else {
      res = await projectApi.deleteProject(projectToDelete.value.id)
    }

    showDeleteModal.value = false
    projectToDelete.value = null
    await fetchProjects()
  } catch (error) {
    console.error('操作失败:', error)
  }
}

const changePage = (page) => {
  if (page < 1 || page > totalPages.value) return
  pagination.value.pageNum = page
  fetchProjects()
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

const isDeleted = (project) => {
  return !!(project.deletedAt || project.deleted_at)
}

const getStatusText = (project) => {
  return isDeleted(project) ? '已删除' : '正常'
}

onMounted(() => {
  fetchProjects()
})
</script>

<style scoped>
.search-input {
  width: 100%;
  padding: 12px 16px 12px 44px;
  border-radius: 8px;
  outline: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: rgba(31, 32, 41, 0.6);
  border: 1px solid rgba(255, 235, 167, 0.1);
  color: #c4c3ca;
  font-size: 14px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.search-input:focus {
  border-color: rgba(255, 235, 167, 0.3);
  box-shadow: 0 4px 20px rgba(255, 235, 167, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.08);
  background: rgba(31, 32, 41, 0.8);
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: #ffeba7;
  filter: drop-shadow(0 0 4px rgba(255, 235, 167, 0.3));
}

.btn-create {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 11px 20px;
  border-radius: 8px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: linear-gradient(135deg, #ffeba7 0%, #ffd666 100%);
  color: #102770;
  font-size: 13px;
  text-decoration: none;
  box-shadow: 0 4px 16px rgba(255, 235, 167, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3);
  border: none;
  position: relative;
  overflow: hidden;
}

.btn-create::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s ease;
}

.btn-create:hover::before {
  left: 100%;
}

.btn-create:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(255, 235, 167, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.btn-create:active {
  transform: translateY(0);
}

.table-wrapper {
  border-radius: 12px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  background: linear-gradient(180deg, rgba(42, 43, 56, 0.98) 0%, rgba(31, 32, 41, 0.95) 100%);
  border: 1px solid rgba(255, 235, 167, 0.08);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.03);
  position: relative;
}

.table-wrapper::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(255, 235, 167, 0.15) 50%, transparent 100%);
}

table {
  border-collapse: separate;
  border-spacing: 0;
  width: 100%;
}

thead {
  background: rgba(255, 235, 167, 0.03);
  border-bottom: 1px solid rgba(255, 235, 167, 0.08);
}

thead th {
  padding: 18px 24px;
  text-align: left;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: #ffeba7;
  white-space: nowrap;
  opacity: 0.9;
}

tbody tr {
  border-bottom: 1px solid rgba(255, 235, 167, 0.04);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

tbody tr:last-child {
  border-bottom: none;
}

tbody tr:hover {
  background: linear-gradient(90deg, rgba(255, 235, 167, 0.06) 0%, transparent 100%);
}

.article-title {
  font-weight: 600;
  color: #fff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: all 0.25s ease;
  position: relative;
}

tbody tr:hover .article-title {
  color: #ffeba7;
  text-shadow: 0 0 12px rgba(255, 235, 167, 0.3);
}

.article-excerpt {
  font-size: 12px;
  margin-top: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 400px;
  color: #c4c3ca;
  opacity: 0.5;
  line-height: 1.4;
}

.text-dim {
  color: #c4c3ca;
  opacity: 0.7;
}

.tag {
  display: inline-flex;
  align-items: center;
  padding: 5px 14px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  border: 1px solid;
  white-space: nowrap;
  letter-spacing: 0.3px;
  backdrop-filter: blur(10px);
}

.tag-purple {
  background: linear-gradient(135deg, rgba(115, 103, 240, 0.2) 0%, rgba(115, 103, 240, 0.1) 100%);
  color: #a99eff;
  border-color: rgba(115, 103, 240, 0.3);
  box-shadow: 0 2px 8px rgba(115, 103, 240, 0.15);
}

.tag-success {
  background: linear-gradient(135deg, rgba(40, 199, 111, 0.2) 0%, rgba(40, 199, 111, 0.1) 100%);
  color: #5fe0a1;
  border-color: rgba(40, 199, 111, 0.3);
  box-shadow: 0 2px 8px rgba(40, 199, 111, 0.15);
}

.tag-warning {
  background: linear-gradient(135deg, rgba(255, 193, 7, 0.2) 0%, rgba(255, 193, 7, 0.1) 100%);
  color: #ffc94d;
  border-color: rgba(255, 193, 7, 0.3);
  box-shadow: 0 2px 8px rgba(255, 193, 7, 0.15);
}

.action-btn {
  padding: 8px;
  border-radius: 6px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid transparent;
  background: transparent;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  transform: translateY(-2px) scale(1.05);
}

.action-edit {
  color: #ffeba7;
}

.action-edit:hover {
  background: rgba(255, 235, 167, 0.15);
  border-color: rgba(255, 235, 167, 0.3);
  box-shadow: 0 4px 12px rgba(255, 235, 167, 0.2);
}

.action-view {
  color: #1890ff;
}

.action-view:hover {
  background: rgba(24, 144, 255, 0.15);
  border-color: rgba(24, 144, 255, 0.3);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.2);
}

.action-delete {
  color: #ff4d4f;
}

.action-delete:hover {
  background: rgba(255, 77, 79, 0.15);
  border-color: rgba(255, 77, 79, 0.3);
  box-shadow: 0 4px 12px rgba(255, 77, 79, 0.2);
}

.action-restore {
  color: #28c76f;
}

.action-restore:hover {
  background: rgba(40, 199, 111, 0.15);
  border-color: rgba(40, 199, 111, 0.3);
  box-shadow: 0 4px 12px rgba(40, 199, 111, 0.2);
}

.empty-icon {
  color: #c4c3ca;
  opacity: 0.3;
  filter: drop-shadow(0 0 8px rgba(196, 195, 202, 0.2));
}

.spinner {
  border-radius: 50%;
  height: 24px;
  width: 24px;
  border: 2px solid rgba(255, 235, 167, 0.1);
  border-top-color: #ffeba7;
  animation: spin 0.8s linear infinite;
  filter: drop-shadow(0 0 8px rgba(255, 235, 167, 0.4));
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 10px;
  padding: 16px 20px;
  background: linear-gradient(180deg, rgba(42, 43, 56, 0.98) 0%, rgba(31, 32, 41, 0.95) 100%);
  border: 1px solid rgba(255, 235, 167, 0.08);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.page-btn {
  padding: 8px 14px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(255, 235, 167, 0.15);
  background: transparent;
  color: #c4c3ca;
  cursor: pointer;
  min-width: 38px;
}

.page-btn:hover:not(:disabled) {
  background: rgba(255, 235, 167, 0.1);
  border-color: rgba(255, 235, 167, 0.3);
  color: #ffeba7;
  transform: translateY(-1px);
}

.page-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.page-active {
  background: linear-gradient(135deg, #ffeba7 0%, #ffd666 100%) !important;
  color: #102770 !important;
  font-weight: 700;
  box-shadow: 0 4px 16px rgba(255, 235, 167, 0.3) !important;
  border-color: #ffeba7 !important;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  padding: 16px;
  animation: fadeIn 0.25s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  border-radius: 12px;
  padding: 28px;
  max-width: 448px;
  width: 100%;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 235, 167, 0.1);
  border: 1px solid rgba(255, 235, 167, 0.15);
  background: linear-gradient(180deg, rgba(42, 43, 56, 0.99) 0%, rgba(31, 32, 41, 0.98) 100%);
  animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 10px;
  color: #fff;
  letter-spacing: 0.3px;
}

.modal-body {
  margin-bottom: 28px;
  color: #c4c3ca;
  line-height: 1.6;
  font-size: 14px;
}

.btn-cancel {
  padding: 10px 20px;
  border-radius: 8px;
  transition: all 0.25s ease;
  border: 1px solid rgba(255, 235, 167, 0.2);
  background: transparent;
  color: #c4c3ca;
  cursor: pointer;
  font-weight: 500;
}

.btn-cancel:hover {
  background: rgba(255, 235, 167, 0.1);
  border-color: rgba(255, 235, 167, 0.3);
  color: #fff;
  transform: translateY(-1px);
}

.btn-delete,
.btn-restore {
  padding: 10px 20px;
  border-radius: 8px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: 13px;
  border: none;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.btn-delete {
  background: linear-gradient(135deg, #ff4d4f 0%, #dc3545 100%);
  color: #fff;
  box-shadow: 0 4px 16px rgba(255, 77, 79, 0.3);
}

.btn-delete:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(255, 77, 79, 0.4);
}

.btn-restore {
  background: linear-gradient(135deg, #28c76f 0%, #20c997 100%);
  color: #fff;
  box-shadow: 0 4px 16px rgba(40, 199, 111, 0.3);
}

.btn-restore:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(40, 199, 111, 0.4);
}
</style>