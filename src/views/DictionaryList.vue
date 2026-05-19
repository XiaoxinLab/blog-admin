<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div class="relative w-full sm:max-w-md">
        <input
          v-model="searchQuery"
          @input="handleSearch"
          type="text"
          placeholder="搜索字典值..."
          class="search-input w-full"
        />
        <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
      </div>
      <div class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        <button
          v-permission="'admin'"
          @click="showModal = true"
          class="btn-create w-full sm:w-auto justify-center"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          新增字典
        </button>
        <button
          v-permission="'admin'"
          @click="handleInit"
          class="btn-secondary w-full sm:w-auto justify-center"
        >
          初始化分类
        </button>
      </div>
    </div>

    <div v-if="!loading && dictionaries.length > 0" class="filter-section">
      <div class="filter-label">类型筛选</div>
      <div class="filter-tags">
        <button
          @click="selectType('')"
          :class="['filter-tag', { 'active': !selectedType }]"
        >
          全部
          <span v-if="!selectedType" class="tag-count">{{ dictionaries.length }}</span>
        </button>
        <button
          v-for="type in allTypes"
          :key="type"
          @click="selectType(type)"
          :class="['filter-tag', { 'active': selectedType === type }]"
        >
          {{ type }}
          <span class="tag-count">{{ getDictCountByType(type) }}</span>
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <span class="text-dim ml-3">加载中...</span>
    </div>

    <div v-else-if="groupedDictionaries.length === 0" class="empty-container">
      <svg class="mx-auto w-16 h-16 empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
      </svg>
      <p class="mt-4 text-dim text-lg">暂无字典数据</p>
      <p class="mt-2 text-sm text-dim opacity-60">点击"初始化分类"快速创建默认数据</p>
    </div>

    <div v-else class="tree-container space-y-4">
      <div
        v-for="(group, index) in groupedDictionaries"
        :key="group.type"
        class="tree-group"
      >
        <div
          class="tree-group-header"
          @click="toggleGroup(group.type)"
        >
          <div class="flex items-center gap-3">
            <button class="toggle-btn" :class="{ 'expanded': expandedGroups.includes(group.type) }">
              <svg class="w-5 h-5 transition-transform duration-300" :class="{ 'rotate-90': expandedGroups.includes(group.type) }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
            <div class="type-badge">
              <span class="type-icon">📁</span>
              <span class="type-name">{{ group.type }}</span>
            </div>
            <span class="count-badge">{{ group.items.length }} 条</span>
          </div>
          <div class="flex items-center gap-2">
            <button
              v-permission="'admin'"
              @click.stop="addToGroup(group.type)"
              class="action-btn action-add"
              title="添加到此分组"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
            </button>
          </div>
        </div>

        <transition name="slide">
          <div v-show="expandedGroups.includes(group.type)" class="tree-group-content">
            <div class="table-wrapper overflow-x-auto">
              <table class="w-full min-w-[700px]">
                <thead>
                  <tr>
                    <th style="width: 60px">ID</th>
                    <th>值</th>
                    <th style="width: 120px">键</th>
                    <th style="width: 80px">排序</th>
                    <th style="width: 100px">状态</th>
                    <th style="width: 120px" class="text-right">操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="dict in group.items" :key="dict.id" class="table-row">
                    <td class="px-4 py-3 text-xs font-mono text-id">{{ dict.id }}</td>
                    <td class="px-4 py-3 min-w-[180px]">
                      <div>
                        <p class="item-title">{{ dict.dict_value }}</p>
                        <p v-if="dict.remark" class="item-desc hidden md:block">{{ dict.remark }}</p>
                      </div>
                    </td>
                    <td class="px-4 py-3 text-sm font-mono text-key">{{ dict.dict_key }}</td>
                    <td class="px-4 py-3 text-sm font-mono text-dim">{{ dict.sort_order }}</td>
                    <td class="px-4 py-3 whitespace-nowrap">
                      <span :class="['tag', dict.status === 1 ? 'tag-success' : 'tag-warning']">
                        {{ dict.status === 1 ? '已启用' : '已禁用' }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-right whitespace-nowrap">
                      <div class="flex items-center justify-end gap-1">
                        <button
                          v-permission="'admin'"
                          @click="editDictionary(dict)"
                          class="action-btn action-edit"
                          title="编辑"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                          </svg>
                        </button>
                        <button
                          v-permission="'admin'"
                          @click="deleteDictionary(dict)"
                          class="action-btn action-delete"
                          title="删除"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </transition>
      </div>
    </div>

    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content mx-4 max-w-lg">
        <h3 class="modal-title">{{ isEditing ? '编辑字典' : '新增字典' }}</h3>
        <form @submit.prevent="handleSubmit" class="space-y-4 mt-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="form-group">
              <label class="form-label">字典类型 <span class="required">*</span></label>
              <input
                v-model="formData.dict_type"
                type="text"
                placeholder="如：article_category"
                class="form-input"
                required
              />
            </div>
            <div class="form-group">
              <label class="form-label">字典键 <span class="required">*</span></label>
              <input
                v-model="formData.dict_key"
                type="text"
                placeholder="如：frontend"
                class="form-input"
                required
              />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">字典值 <span class="required">*</span></label>
            <input
              v-model="formData.dict_value"
              type="text"
              placeholder="如：前端开发"
              class="form-input"
              required
            />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="form-group">
              <label class="form-label">排序</label>
              <input
                v-model.number="formData.sort_order"
                type="number"
                placeholder="0"
                class="form-input"
                min="0"
              />
            </div>
            <div class="form-group">
              <label class="form-label">状态</label>
              <select v-model="formData.status" class="form-select">
                <option :value="1">启用</option>
                <option :value="0">禁用</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">备注</label>
            <input
              v-model="formData.remark"
              type="text"
              placeholder="可选备注信息"
              class="form-input"
            />
          </div>
          <div class="flex flex-col sm:flex-row justify-end gap-3 pt-4">
            <button type="button" @click="closeModal" class="btn-cancel w-full sm:w-auto">取消</button>
            <button type="submit" :disabled="submitting" :class="['btn-primary', 'w-full sm:w-auto', { 'btn-disabled': submitting }]">
              {{ submitting ? '提交中...' : (isEditing ? '更新' : '创建') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
      <div class="modal-content mx-4 max-w-md">
        <h3 class="modal-title">确认删除</h3>
        <p class="modal-body">
          确定要删除字典「{{ dictToDelete?.dict_value }}」吗？此操作不可恢复。
        </p>
        <div class="flex flex-col sm:flex-row justify-end gap-3">
          <button @click="showDeleteModal = false" class="btn-cancel w-full sm:w-auto">取消</button>
          <button @click="confirmDelete" class="btn-delete w-full sm:w-auto">确认删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { dictionaryApi } from '../api/index'

const loading = ref(false)
const dictionaries = ref([])
const searchQuery = ref('')
const selectedType = ref('')
const showModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)
const submitting = ref(false)
const currentEditId = ref(null)
const dictToDelete = ref(null)
const expandedGroups = ref([])

const formData = ref({
  dict_type: '',
  dict_key: '',
  dict_value: '',
  sort_order: 0,
  status: 1,
  remark: ''
})

const allTypes = computed(() => {
  return [...new Set(dictionaries.value.map(d => d.dict_type))].sort((a, b) => a.localeCompare(b))
})

const groupedDictionaries = computed(() => {
  const groups = {}

  let filteredList = dictionaries.value

  if (selectedType.value) {
    filteredList = filteredList.filter(dict => dict.dict_type === selectedType.value)
  }

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filteredList = filteredList.filter(dict =>
      dict.dict_value.toLowerCase().includes(query) ||
      dict.dict_key.toLowerCase().includes(query) ||
      dict.dict_type.toLowerCase().includes(query) ||
      (dict.remark && dict.remark.toLowerCase().includes(query))
    )
  }
  
  filteredList.forEach(dict => {
    if (!groups[dict.dict_type]) {
      groups[dict.dict_type] = {
        type: dict.dict_type,
        items: []
      }
    }
    groups[dict.dict_type].items.push(dict)
  })
  
  return Object.values(groups).sort((a, b) => a.type.localeCompare(b.type))
})

const toggleGroup = (type) => {
  const index = expandedGroups.value.indexOf(type)
  if (index > -1) {
    expandedGroups.value.splice(index, 1)
  } else {
    expandedGroups.value.push(type)
  }
}

const selectType = (type) => {
  if (selectedType.value === type) {
    selectedType.value = ''
  } else {
    selectedType.value = type
  }
  
  if (!selectedType.value && dictionaries.value.length > 0) {
    const types = [...new Set(dictionaries.value.map(d => d.dict_type))]
    expandedGroups.value = types
  } else if (selectedType.value) {
    expandedGroups.value = [selectedType.value]
  }
}

const getDictCountByType = (type) => {
  return dictionaries.value.filter(dict => dict.dict_type === type).length
}

const addToGroup = (type) => {
  formData.value.dict_type = type
  isEditing.value = false
  currentEditId.value = null
  showModal.value = true
}

let searchTimeout = null

const fetchDictionaries = async () => {
  loading.value = true
  try {
    const res = await dictionaryApi.getDictionaryList({
      pageNum: 1,
      pageSize: 1000
    })
    
    if (res.code === 0 || res.result) {
      dictionaries.value = res.result?.list || []
      
      if (expandedGroups.value.length === 0 && dictionaries.value.length > 0) {
        const types = [...new Set(dictionaries.value.map(d => d.dict_type))]
        expandedGroups.value = types
      }
    }
  } catch (error) {
    console.error('获取字典列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    // 搜索由computed自动处理
  }, 300)
}

const resetForm = () => {
  formData.value = {
    dict_type: '',
    dict_key: '',
    dict_value: '',
    sort_order: 0,
    status: 1,
    remark: ''
  }
  isEditing.value = false
  currentEditId.value = null
  submitting.value = false
}

const closeModal = () => {
  showModal.value = false
  resetForm()
}

const editDictionary = (dict) => {
  isEditing.value = true
  currentEditId.value = dict.id
  formData.value = {
    dict_type: dict.dict_type,
    dict_key: dict.dict_key,
    dict_value: dict.dict_value,
    sort_order: dict.sort_order,
    status: dict.status,
    remark: dict.remark || ''
  }
  showModal.value = true
}

const deleteDictionary = (dict) => {
  dictToDelete.value = dict
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  if (!dictToDelete.value) return
  
  try {
    const res = await dictionaryApi.deleteDictionary(dictToDelete.value.id)
    if (res.code === 0 || res.result) {
      fetchDictionaries()
    }
  } catch (error) {
    console.error('删除字典失败:', error)
  } finally {
    showDeleteModal.value = false
    dictToDelete.value = null
  }
}

const handleSubmit = async () => {
  submitting.value = true
  
  try {
    let res
    if (isEditing.value) {
      res = await dictionaryApi.updateDictionary(currentEditId.value, formData.value)
    } else {
      res = await dictionaryApi.createDictionary(formData.value)
    }
    
    if (res.code === 0 || res.result) {
      closeModal()
      fetchDictionaries()
      
      if (!expandedGroups.value.includes(formData.value.dict_type)) {
        expandedGroups.value.push(formData.value.dict_type)
      }
    }
  } catch (error) {
    console.error(isEditing.value ? '更新字典失败:' : '创建字典失败:', error)
  } finally {
    submitting.value = false
  }
}

const handleInit = async () => {
  if (!confirm('确定要初始化默认的分类数据吗？这将添加常用的文章分类。')) return
  
  try {
    const res = await dictionaryApi.initDictionary()
    if (res.code === 0 || res.result) {
      alert('初始化成功！')
      fetchDictionaries()
    } else {
      alert(res.message || '初始化失败')
    }
  } catch (error) {
    console.error('初始化字典失败:', error)
    alert('初始化失败，请重试')
  }
}

onMounted(() => {
  fetchDictionaries()
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
  box-shadow: 0 4px 16px rgba(255, 235, 167, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3);
  border: none;
  position: relative;
  overflow: hidden;
  cursor: pointer;
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

.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 11px 20px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: transparent;
  color: #c4c3ca;
  font-size: 13px;
  border: 1px solid rgba(255, 235, 167, 0.2);
  cursor: pointer;
}

.btn-secondary:hover {
  background: rgba(255, 235, 167, 0.1);
  border-color: rgba(255, 235, 167, 0.3);
  color: #fff;
  transform: translateY(-1px);
}

.loading-container,
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background: linear-gradient(180deg, rgba(42, 43, 56, 0.98) 0%, rgba(31, 32, 41, 0.95) 100%);
  border-radius: 12px;
  border: 1px solid rgba(255, 235, 167, 0.08);
}

.spinner {
  border-radius: 50%;
  height: 32px;
  width: 32px;
  border: 3px solid rgba(255, 235, 167, 0.1);
  border-top-color: #ffeba7;
  animation: spin 0.8s linear infinite;
  filter: drop-shadow(0 0 8px rgba(255, 235, 167, 0.4));
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.text-dim {
  color: #c4c3ca;
  opacity: 0.7;
}

.text-key {
  color: #a78bfa;
  font-weight: 500;
}

.text-id {
  color: #6b7280;
  opacity: 0.8;
}

.empty-icon {
  color: #c4c3ca;
  opacity: 0.3;
  filter: drop-shadow(0 0 8px rgba(196, 195, 202, 0.2));
}

.filter-section {
  background: linear-gradient(180deg, rgba(42, 43, 56, 0.98) 0%, rgba(31, 32, 41, 0.95) 100%);
  border-radius: 12px;
  border: 1px solid rgba(255, 235, 167, 0.08);
  padding: 20px 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.filter-label {
  font-size: 13px;
  font-weight: 600;
  color: #ffeba7;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-bottom: 14px;
  opacity: 0.9;
  filter: drop-shadow(0 2px 4px rgba(255, 235, 167, 0.3));
}

.filter-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.filter-tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 18px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  color: #c4c3ca;
  background: rgba(31, 32, 41, 0.6);
  border: 1px solid rgba(255, 235, 167, 0.1);
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.filter-tag::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%);
  transform: translate(-50%, -50%);
  transition: all 0.35s ease;
  border-radius: 50%;
}

.filter-tag:hover::before {
  width: 200%;
  height: 200%;
}

.filter-tag:hover {
  border-color: rgba(59, 130, 246, 0.3);
  color: #fff;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.filter-tag.active {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.25) 0%, rgba(139, 92, 246, 0.2) 100%);
  border-color: rgba(59, 130, 246, 0.45);
  color: #fff;
  font-weight: 600;
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
}

.filter-tag.active:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.tag-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  padding: 0 7px;
  font-size: 11px;
  font-weight: 700;
  color: #fff;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 11px;
  backdrop-filter: blur(10px);
  letter-spacing: 0.5px;
}

.filter-tag.active .tag-count {
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.tree-container {
  position: relative;
}

.tree-group {
  background: linear-gradient(180deg, rgba(42, 43, 56, 0.98) 0%, rgba(31, 32, 41, 0.95) 100%);
  border-radius: 12px;
  border: 1px solid rgba(255, 235, 167, 0.08);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  transition: all 0.3s ease;
}

.tree-group:hover {
  border-color: rgba(255, 235, 167, 0.15);
  box-shadow: 0 6px 28px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 235, 167, 0.05);
}

.tree-group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 24px;
  cursor: pointer;
  user-select: none;
  background: rgba(255, 235, 167, 0.02);
  border-bottom: 1px solid rgba(255, 235, 167, 0.04);
  transition: all 0.25s ease;
}

.tree-group-header:hover {
  background: rgba(255, 235, 167, 0.05);
}

.toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: rgba(255, 235, 167, 0.05);
  border: 1px solid rgba(255, 235, 167, 0.1);
  color: #ffeba7;
  transition: all 0.25s ease;
  cursor: pointer;
}

.toggle-btn:hover {
  background: rgba(255, 235, 167, 0.15);
  transform: scale(1.05);
}

.toggle-btn.expanded {
  background: rgba(255, 235, 167, 0.1);
  border-color: rgba(255, 235, 167, 0.2);
}

.type-badge {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 6px 16px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.08) 100%);
  border: 1px solid rgba(59, 130, 246, 0.25);
  border-radius: 20px;
  backdrop-filter: blur(10px);
}

.type-icon {
  font-size: 18px;
}

.type-name {
  font-weight: 600;
  font-size: 15px;
  color: #60a5fa;
  letter-spacing: 0.3px;
  text-transform: uppercase;
}

.count-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 600;
  color: #c4c3ca;
  background: rgba(255, 235, 167, 0.08);
  border: 1px solid rgba(255, 235, 167, 0.15);
  border-radius: 12px;
}

.tree-group-content {
  overflow: hidden;
}

.table-wrapper {
  border-radius: 0;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  background: transparent;
  border: none;
  box-shadow: none;
  position: relative;
}

.table-wrapper::before {
  content: none;
}

table {
  border-collapse: separate;
  border-spacing: 0;
  width: 100%;
}

thead {
  background: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid rgba(255, 235, 167, 0.06);
}

thead th {
  padding: 14px 20px;
  text-align: left;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  color: #ffeba7;
  white-space: nowrap;
  opacity: 0.75;
}

tbody tr {
  border-bottom: 1px solid rgba(255, 235, 167, 0.03);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

tbody tr:last-child {
  border-bottom: none;
}

tbody tr:hover {
  background: linear-gradient(90deg, rgba(255, 235, 167, 0.04) 0%, transparent 100%);
}

.item-title {
  font-weight: 600;
  color: #fff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: all 0.25s ease;
  font-size: 14px;
}

tbody tr:hover .item-title {
  color: #ffeba7;
  text-shadow: 0 0 12px rgba(255, 235, 167, 0.3);
}

.item-desc {
  font-size: 12px;
  margin-top: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 350px;
  color: #c4c3ca;
  opacity: 0.45;
  line-height: 1.4;
}

.tag {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 11px;
  font-weight: 600;
  border: 1px solid;
  white-space: nowrap;
  letter-spacing: 0.3px;
  backdrop-filter: blur(10px);
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
  padding: 7px;
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

.action-delete {
  color: #ff4d4f;
}

.action-delete:hover {
  background: rgba(255, 77, 79, 0.15);
  border-color: rgba(255, 77, 79, 0.3);
  box-shadow: 0 4px 12px rgba(255, 77, 79, 0.2);
}

.action-add {
  color: #28c76f;
}

.action-add:hover {
  background: rgba(40, 199, 111, 0.15);
  border-color: rgba(40, 199, 111, 0.3);
  box-shadow: 0 4px 12px rgba(40, 199, 111, 0.2);
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-10px);
}

.slide-enter-to,
.slide-leave-from {
  opacity: 1;
  max-height: 2000px;
  transform: translateY(0);
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

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 13px;
  font-weight: 600;
  color: #ffeba7;
  letter-spacing: 0.3px;
}

.required {
  color: #ff4d4f;
}

.form-input,
.form-select {
  padding: 10px 14px;
  border-radius: 8px;
  outline: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: rgba(31, 32, 41, 0.6);
  border: 1px solid rgba(255, 235, 167, 0.1);
  color: #c4c3ca;
  font-size: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.form-input:focus,
.form-select:focus {
  border-color: rgba(255, 235, 167, 0.3);
  box-shadow: 0 4px 16px rgba(255, 235, 167, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.08);
  background: rgba(31, 32, 41, 0.8);
  color: #fff;
}

.form-select {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23ffeba7' viewBox='0 0 24 24'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 20px;
  padding-right: 36px;
}

.form-select option {
  background: #1f2029;
  color: #c4c3ca;
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

.btn-primary,
.btn-delete {
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

.btn-primary {
  background: linear-gradient(135deg, #ffeba7 0%, #ffd666 100%);
  color: #102770;
  box-shadow: 0 4px 16px rgba(255, 235, 167, 0.3);
}

.btn-primary:hover:not(.btn-disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(255, 235, 167, 0.4);
}

.btn-disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
</style>