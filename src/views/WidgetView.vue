<template>
  <div class="page">
    <div class="page-head">
      <div>
        <h1 class="page-title">组件管理</h1>
        <p class="page-sub">博客「组件展示」页面的组件内容，代码在这里改，前台会跟着更新</p>
      </div>
      <div class="row">
        <button class="btn" :disabled="initializing" @click="handleInitFromTemplate">
          <Download :size="14" :stroke-width="1.6" />
          {{ initializing ? '导入中' : '从模板导入' }}
        </button>
        <button class="btn btn-primary" @click="openCreate">
          <Plus :size="14" :stroke-width="1.6" />
          新增组件
        </button>
      </div>
    </div>

    <div class="toolbar">
      <div class="search-wrap">
        <Search :size="15" :stroke-width="1.6" />
        <input
          v-model.trim="keyword"
          class="search-field"
          type="search"
          placeholder="搜索标题或标识"
          @keyup.enter="handleSearch"
        />
      </div>

      <select v-model="selectedCategory" class="select-plain" @change="handleCategoryChange">
        <option value="all">全部分类</option>
        <option value="basics">基础元素</option>
        <option value="interactive">交互反馈</option>
        <option value="data">数据展示</option>
        <option value="visual">视觉效果</option>
      </select>

      <button class="btn" :disabled="!hasFilter" @click="resetSearch">
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
              <th style="width: 60px">ID</th>
              <th style="width: 190px">标题</th>
              <th style="width: 150px">标识</th>
              <th style="width: 110px">分类</th>
              <th>说明</th>
              <th style="width: 80px">排序</th>
              <th style="width: 90px">状态</th>
              <th style="width: 150px">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in list" :key="item.id">
              <td class="mono muted">{{ item.id }}</td>
              <td class="table-title">{{ item.title }}</td>
              <td class="mono" style="font-size: 12.5px">{{ item.widget_key }}</td>
              <td>
                <span class="tag tag-accent">{{ categoryLabel(item.category) }}</span>
              </td>
              <td class="muted" style="font-size: 12.5px">{{ item.desc || '—' }}</td>
              <td class="muted mono">{{ item.sort_order }}</td>
              <td>
                <span class="status">
                  <span class="status-dot" :class="item.status === 1 ? 'on' : 'off'"></span>
                  {{ item.status === 1 ? '启用' : '禁用' }}
                </span>
              </td>
              <td class="actions">
                <button class="btn btn-sm" @click="openEdit(item)">
                  <Pencil :size="12" :stroke-width="1.6" />
                  编辑
                </button>
                <button class="btn btn-sm btn-danger" @click="handleDelete(item)">
                  <Trash2 :size="12" :stroke-width="1.6" />
                  删除
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <SkeletonBlock v-if="loading" variant="rows" :rows="5" :cols="4" />

        <EmptyState
          v-else-if="!list.length"
          :icon="hasFilter ? SearchX : Puzzle"
          :title="hasFilter ? '没有匹配的组件' : '还没有组件'"
          :text="
            hasFilter
              ? '换个关键字，或者重置筛选条件再看看'
              : '点右上角「从模板导入」，可以把博客现有的 22 个组件一次性导进来'
          "
        >
          <template #action>
            <button v-if="hasFilter" class="btn" @click="resetSearch">重置筛选条件</button>
            <button v-else class="btn btn-primary" @click="handleInitFromTemplate">从模板导入</button>
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

    <!-- 编辑弹窗 -->
    <transition name="fade">
      <div v-if="dialogVisible" class="modal-mask" @click.self="closeDialog">
        <div class="modal" style="max-width: 880px">
          <div class="modal-title">{{ editingId ? '修改组件' : '新增组件' }}</div>

          <div class="field-row">
            <div class="field">
              <label class="label">标题 <span class="req">*</span></label>
              <input v-model.trim="form.title" class="input" placeholder="例如 按钮组 Buttons" />
            </div>
            <div class="field">
              <label class="label">标识 <span class="req">*</span></label>
              <input
                v-model.trim="form.widget_key"
                class="input mono"
                style="font-size: 12.5px"
                placeholder="例如 buttons"
                :disabled="Boolean(editingId)"
              />
              <div class="hint">前台靠这个标识找到对应的渲染组件，改了会对不上</div>
            </div>
          </div>

          <div class="field-row">
            <div class="field">
              <label class="label">分类 <span class="req">*</span></label>
              <select v-model="form.category" class="select">
                <option value="basics">基础元素</option>
                <option value="interactive">交互反馈</option>
                <option value="data">数据展示</option>
                <option value="visual">视觉效果</option>
              </select>
            </div>
            <div class="field">
              <label class="label">排序</label>
              <input v-model.number="form.sort_order" class="input" type="number" />
            </div>
          </div>

          <div class="field">
            <label class="label">说明</label>
            <input v-model.trim="form.desc" class="input" placeholder="一句话描述这个组件" />
          </div>

          <div class="field">
            <label class="label">HTML 代码</label>
            <textarea v-model="form.code_html" class="textarea code-area" rows="6" placeholder="<div class=&quot;demo-buttons&quot;>…</div>"></textarea>
          </div>

          <div class="field">
            <label class="label">CSS 代码</label>
            <textarea v-model="form.code_css" class="textarea code-area" rows="8" placeholder=".demo-buttons { … }"></textarea>
          </div>

          <div class="field">
            <label class="label">JS 代码</label>
            <textarea v-model="form.code_js" class="textarea code-area" rows="8" placeholder="document.querySelectorAll(…)"></textarea>
          </div>

          <div class="field">
            <label class="switch">
              <input v-model="isEnabled" type="checkbox" />
              <span class="switch-track"></span>
              <span style="font-size: 13px">启用（启用后前台才显示）</span>
            </label>
          </div>

          <div class="modal-foot">
            <button class="btn" @click="closeDialog">取消</button>
            <button class="btn btn-primary" :disabled="saving" @click="handleSave">
              {{ saving ? '保存中' : '保存' }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { Download, Pencil, Plus, Puzzle, RotateCcw, Search, SearchX, Trash2 } from 'lucide-vue-next'
import http from '@/utils/api'
import { toastError, toastSuccess } from '@/utils/toast'
import { confirmDialog } from '@/utils/confirm'
import PaginationBar from '@/components/PaginationBar.vue'
import EmptyState from '@/components/EmptyState.vue'
import SkeletonBlock from '@/components/SkeletonBlock.vue'
import templates from '@/data/widgetTemplates.json'

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

// 搜索关键字
const keyword = ref('')

// 分类筛选
const selectedCategory = ref('all')

// 弹窗是否显示
const dialogVisible = ref(false)

// 正在编辑的组件 ID，为空表示新增
const editingId = ref(null)

// 是否正在保存
const saving = ref(false)

// 是否正在导入模板
const initializing = ref(false)

// 弹窗里的表单数据
const form = reactive({
  widget_key: '',
  title: '',
  desc: '',
  category: 'visual',
  code_html: '',
  code_css: '',
  code_js: '',
  sort_order: 0,
  status: 1
})

// 当前是不是带着筛选条件
const hasFilter = computed(() => Boolean(keyword.value || selectedCategory.value !== 'all'))

// 弹窗里的启用开关
const isEnabled = computed({
  get: () => form.status === 1,
  set: (value) => {
    form.status = value ? 1 : 0
  }
})

/**
 * 分类标识转成中文名
 * @param {string} value - 分类标识
 * @returns {string} 中文名
 */
function categoryLabel(value) {
  const map = {
    basics: '基础元素',
    interactive: '交互反馈',
    data: '数据展示',
    visual: '视觉效果'
  }
  return map[value] || value
}

/**
 * 拉取组件列表
 * @returns {Promise<void>} 数据加载结束后结束
 */
async function loadList() {
  loading.value = true
  try {
    const params = {
      pageNum: pageNum.value,
      pageSize: pageSize.value
    }
    if (selectedCategory.value !== 'all') params.category = selectedCategory.value

    const res = await http.get('/widget/', { params })
    list.value = Array.isArray(res?.result?.list) ? res.result.list : []
    total.value = Number(res?.result?.total ?? 0)
  } catch (error) {
    toastError(error.message || '组件列表加载失败')
  } finally {
    loading.value = false
  }
}

/**
 * 搜索：前端过滤当前页，关键词回车才生效
 * @returns {void}
 */
function handleSearch() {
  const kw = keyword.value.trim()
  if (!kw) {
    loadList()
    return
  }
  http
    .get('/widget/', { params: { pageNum: 1, pageSize: 100 } })
    .then((res) => {
      const all = Array.isArray(res?.result?.list) ? res.result.list : []
      list.value = all.filter(
        (item) =>
          (item.title || '').toLowerCase().includes(kw.toLowerCase()) ||
          (item.widget_key || '').toLowerCase().includes(kw.toLowerCase())
      )
      total.value = list.value.length
      pageNum.value = 1
    })
    .catch((error) => toastError(error.message || '搜索失败'))
}

/**
 * 换分类
 * @returns {void}
 */
function handleCategoryChange() {
  pageNum.value = 1
  loadList()
}

/**
 * 重置筛选条件
 * @returns {void}
 */
function resetSearch() {
  keyword.value = ''
  selectedCategory.value = 'all'
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
 * 打开「新增」弹窗
 * @returns {void}
 */
function openCreate() {
  editingId.value = null
  form.widget_key = ''
  form.title = ''
  form.desc = ''
  form.category = 'visual'
  form.code_html = ''
  form.code_css = ''
  form.code_js = ''
  form.sort_order = list.value.length + 1
  form.status = 1
  dialogVisible.value = true
}

/**
 * 打开「编辑」弹窗
 * @param {object} item - 要修改的组件
 * @returns {void}
 */
function openEdit(item) {
  editingId.value = item.id
  form.widget_key = item.widget_key || ''
  form.title = item.title || ''
  form.desc = item.desc || ''
  form.category = item.category || 'visual'
  form.code_html = item.code_html || ''
  form.code_css = item.code_css || ''
  form.code_js = item.code_js || ''
  form.sort_order = Number(item.sort_order ?? 0)
  form.status = Number(item.status ?? 1)
  dialogVisible.value = true
}

/**
 * 关闭弹窗
 * @returns {void}
 */
function closeDialog() {
  dialogVisible.value = false
}

/**
 * 保存组件
 * @returns {Promise<void>} 保存流程结束后结束
 */
async function handleSave() {
  if (!form.title || !form.widget_key) {
    toastError('标题和标识都要填')
    return
  }

  saving.value = true
  try {
    const payload = {
      widget_key: form.widget_key,
      title: form.title,
      desc: form.desc,
      category: form.category,
      code_html: form.code_html,
      code_css: form.code_css,
      code_js: form.code_js,
      sort_order: Number(form.sort_order) || 0,
      status: Number(form.status)
    }

    if (editingId.value) {
      await http.put(`/widget/update/${editingId.value}`, payload)
      toastSuccess('组件修改成功')
    } else {
      await http.post('/widget/create', payload)
      toastSuccess('组件新增成功')
    }
    closeDialog()
    loadList()
  } catch (error) {
    toastError(error.message || '保存失败')
  } finally {
    saving.value = false
  }
}

/**
 * 删除一个组件
 * @param {object} item - 要删除的组件
 * @returns {Promise<void>} 操作结束后结束
 */
async function handleDelete(item) {
  const confirmed = await confirmDialog(
    `确定要删除组件「${item.title}」吗？删除后前台就看不到它了。`
  )
  if (!confirmed) return
  try {
    await http.delete(`/widget/delete/${item.id}`)
    toastSuccess('组件已删除')
    loadList()
  } catch (error) {
    toastError(error.message || '删除失败')
  }
}

/**
 * 从内置模板导入组件
 * 说明：已存在的标识会跳过，所以可以重复点
 * @returns {Promise<void>} 导入结束后结束
 */
async function handleInitFromTemplate() {
  const confirmed = await confirmDialog(
    `要把模板里的 ${templates.length} 个组件导入进来吗？已经存在的会跳过。`
  )
  if (!confirmed) return

  initializing.value = true
  let created = 0
  let failed = 0
  try {
    for (const tpl of templates) {
      try {
        await http.post('/widget/create', {
          widget_key: tpl.widget_key,
          title: tpl.title,
          desc: tpl.desc,
          category: tpl.category,
          code_html: tpl.code_html,
          code_css: tpl.code_css,
          code_js: tpl.code_js,
          sort_order: tpl.sort_order,
          status: 1
        })
        created++
      } catch (error) {
        // 标识重复是正常的，跳过不报错
        if (String(error.message || '').includes('已存在')) continue
        failed++
      }
    }
    if (created) {
      toastSuccess(`导入完成，新增 ${created} 个组件`)
    } else {
      toastSuccess('组件都已经导入过了，没有新增')
    }
    if (failed) {
      toastError(`有 ${failed} 个组件导入失败`)
    }
    loadList()
  } finally {
    initializing.value = false
  }
}

onMounted(loadList)
</script>

<style scoped>
.code-area {
  font-family: var(--font-mono);
  font-size: 12px;
  line-height: 1.65;
  tab-size: 2;
}
</style>
