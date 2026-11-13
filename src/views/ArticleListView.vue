<template>
  <div class="page">
    <div class="page-head">
      <div>
        <h1 class="page-title">文章管理</h1>
        <p class="page-sub">共 {{ total }} 篇文章，可以在这里编辑、下架或者新建</p>
      </div>
      <router-link to="/articles/new" class="btn btn-primary">
        <Pencil :size="14" :stroke-width="1.6" />
        写文章
      </router-link>
    </div>

    <!-- 工具条：搜索 + 分类 + 排序 -->
    <div class="toolbar">
      <div class="search-wrap">
        <Search :size="15" :stroke-width="1.6" />
        <input
          v-model.trim="filters.key"
          class="search-field"
          type="search"
          placeholder="搜索标题或正文"
          @keyup.enter="handleSearch"
        />
      </div>

      <select v-model="selectedCategory" class="select-plain" @change="handleCategoryChange">
        <option value="">全部分类</option>
        <option v-for="item in categories" :key="item.value" :value="item.value">
          {{ item.label }}
        </option>
      </select>

      <button class="btn" :disabled="!hasFilter" @click="resetSearch">
        <RotateCcw :size="14" :stroke-width="1.6" />
        重置
      </button>

      <div class="spacer"></div>

      <span class="toolbar-label">共 {{ list.length }} 条</span>
    </div>

    <!-- 列表 -->
    <div class="card">
      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th style="width: 70px">ID</th>
              <th>标题</th>
              <th style="width: 130px">分类</th>
              <th style="width: 110px">作者</th>
              <th style="width: 130px">发布时间</th>
              <th style="width: 100px">状态</th>
              <th style="width: 150px">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in list" :key="item.id">
              <td class="mono muted">{{ item.id }}</td>
              <td>
                <div class="table-title">{{ item.article_title }}</div>
                <div v-if="excerpt(item)" class="cell-sub">{{ excerpt(item) }}</div>
              </td>
              <td>
                <span class="tag tag-accent">{{ item.article_classification || '未分类' }}</span>
              </td>
              <td class="muted">{{ item.article_author || '佚名' }}</td>
              <td class="muted mono" style="font-size: 12.5px">{{ formatDate(item.createdAt) }}</td>
              <td>
                <span class="tag tag-success"><span class="tag-dot"></span>已发布</span>
              </td>
              <td class="actions">
                <router-link :to="`/articles/${item.id}/edit`" class="btn btn-sm">
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

        <SkeletonBlock v-if="loading" variant="rows" :rows="5" :cols="4" />

        <EmptyState
          v-else-if="!list.length"
          :icon="hasFilter ? SearchX : FileText"
          :title="hasFilter ? '没有匹配的文章' : '还没有发布过文章'"
          :text="
            hasFilter
              ? '换个关键字，或者重置筛选条件再看看'
              : '写第一篇吧，写完保存就会出现在前台博客上'
          "
        >
          <template #action>
            <button v-if="hasFilter" class="btn" @click="resetSearch">重置筛选条件</button>
            <router-link v-else to="/articles/new" class="btn btn-primary">写第一篇</router-link>
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

    <!-- 恢复已下架的文章 -->
    <div class="card page-section">
      <div class="card-head">
        <div class="card-title">恢复已下架的文章</div>
      </div>
      <div class="card-body">
        <p class="hint" style="margin-top: 0; margin-bottom: var(--space-3)">
          下架的文章会从列表里消失，所以这里用文章 ID 手动恢复
        </p>
        <div class="row row-wrap">
          <input
            v-model.trim="restoreId"
            class="input"
            style="width: 160px"
            type="number"
            placeholder="文章 ID"
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
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Archive, FileText, Pencil, RotateCcw, Search, SearchX } from 'lucide-vue-next'
import { formatDate } from '@/utils/format'
import http from '@/utils/api'
import { toastError, toastSuccess } from '@/utils/toast'
import { confirmDialog } from '@/utils/confirm'
import PaginationBar from '@/components/PaginationBar.vue'
import EmptyState from '@/components/EmptyState.vue'
import SkeletonBlock from '@/components/SkeletonBlock.vue'

const router = useRouter()

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

// 搜索条件
const filters = reactive({
  key: '',
  article_classification: ''
})

// 下拉框当前选中的分类，空串表示全部
const selectedCategory = ref('')

// 分类选项
const categories = ref([])

// 恢复文章用的 ID 输入框
const restoreId = ref('')

// 是否正在执行恢复
const restoring = ref(false)

// 当前是不是带着筛选条件
const hasFilter = computed(() => Boolean(filters.key || filters.article_classification))

/**
 * 取正文前一小段当摘要
 * @param {object} item - 文章数据
 * @returns {string} 摘要文字
 */
function excerpt(item) {
  const raw = item.article_content || ''
  const text = raw
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[#>*_`~\-[\[\]()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return text.slice(0, 80)
}

/**
 * 拉取文章列表
 * @returns {Promise<void>} 数据加载结束后结束
 */
async function loadList() {
  loading.value = true
  try {
    const params = {
      pageNum: pageNum.value,
      pageSize: pageSize.value
    }
    if (filters.key) params.key = filters.key
    if (filters.article_classification) params.article_classification = filters.article_classification

    const res = await http.get('/article/', { params })
    list.value = Array.isArray(res?.result?.list) ? res.result.list : []
    total.value = Number(res?.result?.total ?? 0)
  } catch (error) {
    toastError(error.message || '文章列表加载失败')
  } finally {
    loading.value = false
  }
}

/**
 * 拉取文章分类选项
 * @returns {Promise<void>} 数据加载结束后结束
 */
async function loadCategories() {
  try {
    const res = await http.get('/dictionary/findByType/article_category')
    const items = Array.isArray(res?.result) ? res.result : []
    // 筛选用的是字典的「键」，页面上显示「显示值」
    categories.value = items
      .map((item) => ({ value: item.dict_key, label: item.dict_value }))
      .filter((item) => item.value)
  } catch (error) {
    categories.value = []
  }
}

/**
 * 换分类：下拉框改动时触发
 * @returns {void}
 */
function handleCategoryChange() {
  filters.article_classification = selectedCategory.value
  pageNum.value = 1
  loadList()
}

/**
 * 点搜索：回到第一页再查
 * @returns {void}
 */
function handleSearch() {
  pageNum.value = 1
  loadList()
}

/**
 * 清空搜索条件并重新加载
 * @returns {void}
 */
function resetSearch() {
  filters.key = ''
  filters.article_classification = ''
  selectedCategory.value = ''
  pageNum.value = 1
  loadList()
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
 * 跳到文章编辑页
 * @param {object} article - 文章数据
 * @returns {void}
 */
function goEdit(article) {
  router.push(`/articles/${article.id}/edit`)
}

/**
 * 把一篇文章下架
 * @param {object} article - 文章数据
 * @returns {Promise<void>} 操作结束后结束
 */
async function handleRemove(article) {
  const confirmed = await confirmDialog(`确定要下架《${article.article_title}》吗？下架后前台就看不到这篇了。`)
  if (!confirmed) return
  try {
    await http.post(`/article/${article.id}/off`)
    toastSuccess('文章已下架')
    loadList()
  } catch (error) {
    toastError(error.message || '下架失败')
  }
}

/**
 * 按 ID 恢复已下架的文章
 * @returns {Promise<void>} 操作结束后结束
 */
async function handleRestore() {
  const id = Number(restoreId.value)
  if (!id) {
    toastError('请先填写文章 ID')
    return
  }
  restoring.value = true
  try {
    await http.post(`/article/${id}/on`)
    toastSuccess(`文章 ${id} 已恢复上架`)
    restoreId.value = ''
    loadList()
  } catch (error) {
    toastError(error.message || '恢复失败，请确认这个 ID 确实存���')
  } finally {
    restoring.value = false
  }
}

onMounted(() => {
  loadCategories()
  loadList()
})
</script>

<style scoped>
/* 这个页面用到的样式都在全局 main.css 里，这里不用额外定义 */
</style>
