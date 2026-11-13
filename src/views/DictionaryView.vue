<template>
  <div class="page">
    <div class="page-head">
      <div>
        <h1 class="page-title">字典管理</h1>
        <p class="page-sub">维护「键 → 显示值」的对照表，文章分类就是靠它来显示的</p>
      </div>
      <div class="row">
        <button class="btn" :disabled="initializing" @click="handleInitDefaults">
          <ListPlus :size="14" :stroke-width="1.6" />
          {{ initializing ? '初始化中' : '初始化默认分类' }}
        </button>
        <button class="btn btn-primary" @click="openCreate">
          <Plus :size="14" :stroke-width="1.6" />
          新增字典项
        </button>
      </div>
    </div>

    <div class="toolbar">
      <select v-model="selectedType" class="select-plain" @change="handleTypeChange">
        <option value="all">全部分组</option>
        <option v-for="type in types" :key="type" :value="type">{{ type }}</option>
      </select>

      <div class="row">
        <input
          v-model.trim="newType"
          class="input"
          style="width: 190px"
          placeholder="新分组名"
          @keyup.enter="handleCreateType"
        />
        <button class="btn" :disabled="!newType.trim()" @click="handleCreateType">
          建分组
        </button>
      </div>

      <div class="spacer"></div>

      <span class="toolbar-label">共 {{ list.length }} 条</span>
    </div>

    <div class="card">
      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th style="width: 70px">ID</th>
              <th style="width: 170px">类型</th>
              <th style="width: 170px">键</th>
              <th>显示值</th>
              <th style="width: 80px">排序</th>
              <th style="width: 100px">状态</th>
              <th style="width: 140px">备注</th>
              <th style="width: 160px">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in list" :key="item.id">
              <td class="mono muted">{{ item.id }}</td>
              <td class="mono muted">{{ item.dict_type }}</td>
              <td class="mono">{{ item.dict_key }}</td>
              <td class="nowrap">{{ item.dict_value }}</td>
              <td class="muted mono">{{ item.sort_order }}</td>
              <td>
                <span class="status">
                  <span class="status-dot" :class="item.status === 1 ? 'on' : 'off'"></span>
                  {{ item.status === 1 ? '启用' : '禁用' }}
                </span>
              </td>
              <td class="muted cell-note">{{ item.remark || '—' }}</td>
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

        <SkeletonBlock v-if="loading" variant="rows" :rows="4" :cols="5" />
        <EmptyState
          v-else-if="!list.length"
          :icon="ListTree"
          :title="currentType === 'all' ? '还没有字典项' : '这个分组里还没有字典项'"
          text="字典项是「键 → 显示值」的对照表，文章分类就是靠它来显示的"
        >
          <template #action>
            <button class="btn btn-primary" @click="openCreate">新增字典项</button>
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

    <!-- 新增 / 编辑弹窗 -->
    <transition name="fade">
      <div v-if="dialogVisible" class="modal-mask" @click.self="closeDialog">
        <div class="modal" style="max-width: 460px">
          <div class="modal-title">{{ editingId ? '修改字典项' : '新增字典项' }}</div>
          <div class="field">
            <label class="label">类型 <span class="req">*</span></label>
            <input v-model.trim="form.dict_type" class="input" placeholder="例如 article_category" />
          </div>
          <div class="field">
            <label class="label">键 <span class="req">*</span></label>
            <input v-model.trim="form.dict_key" class="input" placeholder="英文唯一标识，例如 frontend" />
          </div>
          <div class="field">
            <label class="label">显示值 <span class="req">*</span></label>
            <input v-model.trim="form.dict_value" class="input" placeholder="页面上显示的文字，例如 前端开发" />
          </div>
          <div class="field-row">
            <div class="field">
              <label class="label">排序</label>
              <input v-model.number="form.sort_order" class="input" type="number" />
            </div>
            <div class="field">
              <label class="label">状态</label>
              <select v-model.number="form.status" class="select">
                <option :value="1">启用</option>
                <option :value="0">禁用</option>
              </select>
            </div>
          </div>
          <div class="field">
            <label class="label">备注</label>
            <input v-model.trim="form.remark" class="input" placeholder="可不填" />
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
import { onMounted, reactive, ref } from 'vue'
import { ListPlus, ListTree, Pencil, Plus, Trash2 } from 'lucide-vue-next'
import http from '@/utils/api'
import { toastError, toastSuccess } from '@/utils/toast'
import { confirmDialog } from '@/utils/confirm'
import PaginationBar from '@/components/PaginationBar.vue'
import EmptyState from '@/components/EmptyState.vue'
import SkeletonBlock from '@/components/SkeletonBlock.vue'

// 后端内置的默认文章分类，和服务端 initDefaultData 里写死的一致
// 说明：服务端的 /dictionary/init 接口目前是坏的（返回「字典初始化失败」），
// 所以这里保留一份同样的数据，改用能正常工作的 create 接口逐条写入。
const DEFAULT_CATEGORIES = [
  { dict_key: 'frontend', dict_value: '前端开发', sort_order: 1 },
  { dict_key: 'backend', dict_value: '后端开发', sort_order: 2 },
  { dict_key: 'devops', dict_value: 'DevOps', sort_order: 3 },
  { dict_key: 'architecture', dict_value: '架构设计', sort_order: 4 },
  { dict_key: 'rust', dict_value: 'Rust', sort_order: 5 },
  { dict_key: 'design', dict_value: '设计', sort_order: 6 },
  { dict_key: 'other', dict_value: '其他', sort_order: 7 }
]

// 当前选中的分组，all 表示全部
const currentType = ref('all')

// 下拉框当前选中的分组
const selectedType = ref('all')

// 所有字典类型
const types = ref([])

// 字典项列表
const list = ref([])

// 总条数
const total = ref(0)

// 当前页码
const pageNum = ref(1)

// 每页条数
const pageSize = ref(10)

// 是否正在加载
const loading = ref(false)

// 是否正在执行「初始化默认分类」
const initializing = ref(false)

// 新建分组时填的名字
const newType = ref('')

// 弹窗是否显示
const dialogVisible = ref(false)

// 正在编辑的字典项 ID，为空表示是新增
const editingId = ref(null)

// 是否正在保存
const saving = ref(false)

// 弹窗里的表单数据
const form = reactive({
  dict_type: '',
  dict_key: '',
  dict_value: '',
  sort_order: 0,
  status: 1,
  remark: ''
})

/**
 * 拉取字典项列表
 * @returns {Promise<void>} 数据加载结束后结束
 */
async function loadList() {
  loading.value = true
  try {
    const params = {
      pageNum: pageNum.value,
      pageSize: pageSize.value
    }
    if (currentType.value !== 'all') {
      params.type = currentType.value
    }
    const res = await http.get('/dictionary/', { params })
    list.value = Array.isArray(res?.result?.list) ? res.result.list : []
    total.value = Number(res?.result?.total ?? 0)
  } catch (error) {
    toastError(error.message || '字典列表加载失败')
  } finally {
    loading.value = false
  }
}

/**
 * 拉取字典类型列表
 * @returns {Promise<void>} 数据加载结束后结束
 */
async function loadTypes() {
  try {
    const res = await http.get('/dictionary/types')
    types.value = Array.isArray(res?.result) ? res.result : []
  } catch (error) {
    types.value = []
  }
}

/**
 * 切换选中的分组
 * @param {string} type - 分组名，all 表示全部
 * @returns {void}
 */
function handleTypeChange() {
  currentType.value = selectedType.value
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
  form.dict_type = currentType.value === 'all' ? '' : currentType.value
  form.dict_key = ''
  form.dict_value = ''
  form.sort_order = 0
  form.status = 1
  form.remark = ''
  dialogVisible.value = true
}

/**
 * 打开「编辑」弹窗，并把原有数据填进去
 * @param {object} item - 要修改的字典项
 * @returns {void}
 */
function openEdit(item) {
  editingId.value = item.id
  form.dict_type = item.dict_type || ''
  form.dict_key = item.dict_key || ''
  form.dict_value = item.dict_value || ''
  form.sort_order = Number(item.sort_order ?? 0)
  form.status = Number(item.status ?? 1)
  form.remark = item.remark || ''
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
 * 保存字典项
 * @returns {Promise<void>} 保存流程结束后结束
 */
async function handleSave() {
  if (!form.dict_type || !form.dict_key || !form.dict_value) {
    toastError('类型、键、显示值都要填')
    return
  }

  saving.value = true
  try {
    if (editingId.value) {
      await http.put(`/dictionary/update/${editingId.value}`, { ...form })
      toastSuccess('字典项修改成功')
    } else {
      await http.post('/dictionary/create', { ...form })
      toastSuccess('字典项创建成功')
    }
    closeDialog()
    loadTypes()
    loadList()
  } catch (error) {
    toastError(error.message || '保存失败')
  } finally {
    saving.value = false
  }
}

/**
 * 删除一个字典项
 * @param {object} item - 要删除的字典项
 * @returns {Promise<void>} 操作结束后结束
 */
async function handleDelete(item) {
  const confirmed = await confirmDialog(
    `确定要删除字典项「${item.dict_type} / ${item.dict_key}」吗？删除后就不生效了。`
  )
  if (!confirmed) return
  try {
    await http.delete(`/dictionary/delete/${item.id}`)
    toastSuccess('字典项已删除')
    loadTypes()
    loadList()
  } catch (error) {
    toastError(error.message || '删除失败')
  }
}

/**
 * 建一个新分组：建一个占位的字典项，分组就出现了
 * 说明：后端的「新建分组」本质上就是新增一条该类型的字典项
 * @returns {Promise<void>} 操作结束后结束
 */
async function handleCreateType() {
  const type = newType.value.trim()
  if (!type) return
  try {
    await http.post('/dictionary/create', {
      dict_type: type,
      dict_key: 'placeholder',
      dict_value: '占位项（可改成别的或删掉）',
      sort_order: 99,
      status: 1,
      remark: '用来创建分组的占位项'
    })
    toastSuccess(`分组「${type}」已创建`)
    newType.value = ''
    loadTypes()
    loadList()
  } catch (error) {
    toastError(error.message || '创建分组失败')
  }
}

/**
 * 初始化 7 个默认文章分类
 * 说明：先试服务端的 /dictionary/init；线上这个接口目前会返回「字典初始化失败」，
 * 这时就改用 create 接口，把缺的分类一条条补上，已经存在的会自动跳过。
 * @returns {Promise<void>} 操作结束后结束
 */
async function handleInitDefaults() {
  initializing.value = true
  try {
    let serverOk = false
    try {
      const res = await http.post('/dictionary/init')
      serverOk = Number(res?.code) === 0
    } catch (error) {
      serverOk = false
    }

    if (serverOk) {
      toastSuccess('默认分类初始化完成')
    } else {
      const listRes = await http.get('/dictionary/', {
        params: { type: 'article_category', pageNum: 1, pageSize: 100 }
      })
      const existing = new Set((listRes?.result?.list || []).map((item) => item.dict_key))
      let created = 0
      const failed = []
      for (const item of DEFAULT_CATEGORIES) {
        if (existing.has(item.dict_key)) continue
        try {
          await http.post('/dictionary/create', {
            dict_type: 'article_category',
            dict_value: item.dict_value,
            dict_key: item.dict_key,
            sort_order: item.sort_order,
            status: 1,
            remark: ''
          })
          created++
        } catch (error) {
          failed.push(item.dict_key)
        }
      }
      if (failed.length) {
        toastError(
          `新增了 ${created} 条，${failed.length} 条失败：` +
            `键 ${failed.join('、')} 建不了，通常是之前删过同名的项，` +
            '而删除只是软删除，数据库里的唯一索引还占着这个键'
        )
      } else {
        toastSuccess(`默认分类已补齐，这次新增了 ${created} 条`)
      }
    }

    loadTypes()
    loadList()
  } catch (error) {
    toastError(error.message || '初始化失败')
  } finally {
    initializing.value = false
  }
}

onMounted(() => {
  loadTypes()
  loadList()
})
</script>

<style scoped>
/* 这个页面用到的样式都在全局 main.css 里，这里不用额外定义 */
</style>
