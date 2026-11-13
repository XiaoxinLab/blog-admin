<template>
  <div class="page">
    <div class="page-head">
      <div>
        <h1 class="page-title">项目管理</h1>
        <p class="page-sub">共 {{ total }} 个项目，前台的作品页会显示这里的内容</p>
      </div>
      <router-link to="/projects/new" class="btn btn-primary">
        <Plus :size="14" :stroke-width="1.6" />
        建项目
      </router-link>
    </div>

    <div class="toolbar">
      <div class="search-wrap">
        <Search :size="15" :stroke-width="1.6" />
        <input
          v-model.trim="search"
          class="search-field"
          type="search"
          placeholder="搜索项目名或描述"
          @keyup.enter="handleSearch"
        />
      </div>

      <select v-model="selectedType" class="select-plain" @change="handleTypeChange">
        <option value="">全部类型</option>
        <option value="Web">Web</option>
        <option value="App">App</option>
        <option value="小程序">小程序</option>
      </select>

      <button class="btn" :disabled="!hasFilter" @click="handleReset">
        <RotateCcw :size="14" :stroke-width="1.6" />
        重置
      </button>

      <div class="spacer"></div>

      <span class="toolbar-label">共 {{ list.length }} 条</span>
    </div>

    <div class="card">
      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th style="width: 70px">ID</th>
              <th>项目名称</th>
              <th style="width: 110px">类型</th>
              <th style="width: 90px">年份</th>
              <th style="width: 200px">技术栈</th>
              <th style="width: 130px">状态</th>
              <th style="width: 150px">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in list" :key="item.id">
              <td class="mono muted">{{ item.id }}</td>
              <td>
                <div class="table-title">{{ item.project_name }}</div>
                <div v-if="item.project_desc" class="cell-sub">{{ item.project_desc }}</div>
              </td>
              <td>
                <span class="tag tag-accent">{{ item.project_type || '未分类' }}</span>
              </td>
              <td class="muted mono" style="font-size: 12.5px">{{ item.project_year || '—' }}</td>
              <td>
                <span v-for="tech in techList(item.project_techs)" :key="tech" class="tag tag-muted" style="margin-right: 4px">
                  {{ tech }}
                </span>
              </td>
              <td>
                <span class="tag tag-success"><span class="tag-dot"></span>已发布</span>
              </td>
              <td class="actions">
                <router-link :to="`/projects/${item.id}/edit`" class="btn btn-sm">
                  <Pencil :size="12" :stroke-width="1.6" />
                  编辑
                </router-link>
                <button class="btn btn-sm btn-danger" @click="handleRemove(item)">
                  <Archive :size="12" :stroke-width="1.6" />
                  下架
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <SkeletonBlock v-if="loading" variant="rows" :rows="4" :cols="4" />

        <EmptyState
          v-else-if="!list.length"
          :icon="hasFilter ? SearchX : Layers"
          :title="hasFilter ? '没有匹配的项目' : '还没有项目'"
          :text="hasFilter ? '换个关键字，或者重置筛选条件再看看' : '建一个项目，前台的作品页会显示它'"
        >
          <template #action>
            <button v-if="hasFilter" class="btn" @click="handleReset">重置筛选条件</button>
            <router-link v-else to="/projects/new" class="btn btn-primary">建第一个项目</router-link>
          </template>
        </EmptyState>
      </div>

      <div v-if="total > 0" class="card-body" style="padding-top: var(--space-4); padding-bottom: var(--space-4)">
        <PaginationBar
          :page-num="pageNum"
          :page-size="pageSize"
          :total="total"
          @change="handlePageChange"
        />
      </div>
    </div>

    <div class="card page-section">
      <div class="card-head">
        <div class="card-title">恢复已下架的项目</div>
      </div>
      <div class="card-body">
        <p class="hint" style="margin-top: 0; margin-bottom: var(--space-3)">
          下架的项目会从列表消失，这里用项目 ID 手动恢复
        </p>
        <div class="row row-wrap">
          <input
            v-model.trim="restoreId"
            class="input"
            style="width: 160px"
            type="number"
            placeholder="项目 ID"
            @keyup.enter="handleRestore"
          />
          <button class="btn" :disabled="!restoreId || restoring" @click="handleRestore">
            <RotateCcw :size="14" :stroke-width="1.6" />
            {{ restoring ? '恢复中' : '恢复上架' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { Archive, Layers, Pencil, Plus, RotateCcw, Search, SearchX } from 'lucide-vue-next'
import http from '@/utils/api'
import { toastError, toastSuccess } from '@/utils/toast'
import { confirmDialog } from '@/utils/confirm'
import PaginationBar from '@/components/PaginationBar.vue'
import EmptyState from '@/components/EmptyState.vue'
import SkeletonBlock from '@/components/SkeletonBlock.vue'

// 列表数据
const list = ref([])

// 总条数
const total = ref(0)

// 当前页码
const pageNum = ref(1)

// 每页条数
const pageSize = ref(10)

// 是否正在加载
const loading = ref(false)

// 搜索词
const search = ref('')

// 下拉框当前选中的类型，空串表示全部
const selectedType = ref('')

// 恢复项目用的 ID 输入框
const restoreId = ref('')

// 是否正在执行恢复
const restoring = ref(false)

// 当前是不是带着筛选条件
const hasFilter = computed(() => Boolean(search.value))

/**
 * 把后端返回的技术栈字段拆成数组
 * @param {string|Array} value - 技术栈原始值
 * @returns {string[]} 技术栈列表
 */
function techList(value) {
  if (!value) return []
  if (Array.isArray(value)) return value.filter(Boolean)
  return String(value)
    .split(/[,，;；\s]+/)
    .map((item) => item.trim())
    .filter(Boolean)
}

/**
 * 拉取项目列表
 * @returns {Promise<void>} 数据加载结束后结束
 */
async function loadList() {
  loading.value = true
  try {
    const params = { pageNum: pageNum.value, pageSize: pageSize.value }
    if (search.value) params.key = search.value

    const res = await http.get('/project/', { params })
    list.value = Array.isArray(res?.result?.list) ? res.result.list : []
    total.value = Number(res?.result?.total ?? 0)

  } catch (error) {
    toastError(error.message || '项目列表加载失败')
  } finally {
    loading.value = false
  }
}

/**
 * 按关键字搜索
 * @returns {void}
 */
function handleSearch() {
  pageNum.value = 1
  loadList()
}

/**
 * 换类型：下拉框改动时触发
 * @returns {void}
 */
function handleTypeChange() {
  search.value = selectedType.value
  handleSearch()
}

/**
 * 清空筛选条件
 * @returns {void}
 */
function handleReset() {
  search.value = ''
  selectedType.value = ''
  handleSearch()
}

/**
 * 切换页码
 * @param {number} page - 目标页码
 * @returns {void}
 */
function handlePageChange(page) {
  pageNum.value = page
  loadList()
}

/**
 * 下架一个项目
 * @param {object} item - 项目数据
 * @returns {Promise<void>} 操作结束后结束
 */
async function handleRemove(item) {
  const confirmed = await confirmDialog(`确定要下架《${item.project_name}》吗？下架后前台就看不到它了。`)
  if (!confirmed) return
  try {
    await http.post(`/project/${item.id}/off`)
    toastSuccess('项目已下架')
    loadList()
  } catch (error) {
    toastError(error.message || '下架失败')
  }
}

/**
 * 按 ID 恢复已下架的项目
 * @returns {Promise<void>} 操作结束后结束
 */
async function handleRestore() {
  const id = Number(restoreId.value)
  if (!id) {
    toastError('请先填写项目 ID')
    return
  }
  restoring.value = true
  try {
    await http.post(`/project/${id}/on`)
    toastSuccess(`项目 ${id} 已恢复上架`)
    restoreId.value = ''
    loadList()
  } catch (error) {
    toastError(error.message || '恢复失败，请确认这个 ID 确实存在')
  } finally {
    restoring.value = false
  }
}

onMounted(loadList)
</script>

<style scoped>
/* 这个页面用到的样式都在全局 main.css 里，这里不用额外定义 */
</style>
