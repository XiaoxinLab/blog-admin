<template>
  <div class="page">
    <div class="page-head">
      <div>
        <h1 class="page-title">{{ isEdit ? '修改文章' : '写文章' }}</h1>
        <p class="page-sub">{{ isEdit ? `正在改 ID 为 ${articleId} 的文章` : '正文用 Markdown 书写' }}</p>
      </div>
      <div class="row">
        <router-link to="/articles" class="btn btn-ghost">返回列表</router-link>
        <button class="btn btn-primary" :class="{ 'is-loading': saving }" :disabled="saving" @click="handleSave">
          <span v-if="saving" class="spinner"></span>
          <Save v-else :size="14" :stroke-width="1.5" />
          {{ saving ? '保存中' : '保存' }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="card">
      <div class="card-body">
        <SkeletonBlock variant="rows" :rows="5" :cols="2" />
      </div>
    </div>

    <div v-else class="edit-grid">
      <!-- 左边：正文 -->
      <div class="card">
        <div class="card-head">
          <div class="card-title">正文</div>
        </div>
        <div class="card-body">
          <div class="field">
            <label class="label" for="title">标题 <span class="req">*</span></label>
            <input id="title" v-model.trim="form.article_title" class="input" placeholder="给文章起个名字" />
          </div>

          <div class="field">
            <label class="label" for="content">正文 <span class="req">*</span></label>
            <MarkdownEditor v-model="form.article_content" />
            <div class="hint">正文和 Markdown 文件至少填一个</div>
          </div>

          <div class="field" style="margin-bottom: 0">
            <label class="label" for="mdfile">Markdown 文件</label>
            <div class="row">
              <input
                id="mdfile"
                v-model.trim="form.article_file_url"
                class="input"
                placeholder="可留空，也可以上传 .md 文件"
              />
              <button class="btn" :disabled="mdUploading" @click="pickMdFile">
                <Upload :size="14" :stroke-width="1.5" />
                {{ mdUploading ? '上传中' : '上传' }}
              </button>
            </div>
            <input ref="mdInput" type="file" class="hidden-input" accept=".md,.markdown,.txt" @change="onMdFileChange" />
          </div>
        </div>
      </div>

      <!-- 右边：属性 -->
      <div class="card">
        <div class="card-head">
          <div class="card-title">属性</div>
        </div>
        <div class="card-body">
          <div class="field">
            <label class="label" for="author">作者 <span class="req">*</span></label>
            <input id="author" v-model.trim="form.article_author" class="input" placeholder="谁写的" />
          </div>

          <div class="field">
            <label class="label" for="classification">分类 <span class="req">*</span></label>
            <select
              v-if="!useCustomCategory"
              id="classification"
              v-model="form.article_classification"
              class="select"
            >
              <option value="">请选择分类</option>
              <option v-for="item in categoryOptions" :key="item.value" :value="item.value">
                {{ item.label }}
              </option>
              <option value="__custom__">自定义分类</option>
            </select>
            <input
              v-else
              id="classification"
              v-model.trim="customCategory"
              class="input"
              placeholder="自己写一个分类名"
            />
            <label class="switch" style="margin-top: var(--space-2)">
              <input v-model="useCustomCategory" type="checkbox" />
              <span class="switch-track"></span>
              <span style="font-size: 13px">用自定义分类</span>
            </label>
            <div class="hint">选项来自字典管理</div>
          </div>

          <div class="field">
            <label class="label">封面图 <span class="req">*</span></label>
            <ImageUploader v-model="form.article_img" upload-url="/article/upload" response-field="article_img" />
          </div>

          <div v-if="errorText" class="save-error">{{ errorText }}</div>

          <button class="btn btn-primary btn-block" :class="{ 'is-loading': saving }" :disabled="saving" @click="handleSave">
            <span v-if="saving" class="spinner"></span>
            {{ saving ? '保存中' : isEdit ? '保存修改' : '发布文章' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Save, Upload } from 'lucide-vue-next'
import http from '@/utils/api'
import { toastError, toastSuccess } from '@/utils/toast'
import MarkdownEditor from '@/components/MarkdownEditor.vue'
import ImageUploader from '@/components/ImageUploader.vue'
import SkeletonBlock from '@/components/SkeletonBlock.vue'

const route = useRoute()
const router = useRouter()

// 当前编辑的文章 ID，新建时是空的
const articleId = computed(() => route.params.id || '')

// 是不是修改已有文章
const isEdit = computed(() => Boolean(articleId.value))

// 表单数据
const form = reactive({
  article_title: '',
  article_author: '',
  article_classification: '',
  article_content: '',
  article_img: '',
  article_file_url: ''
})

// 是否正在加载
const loading = ref(false)

// 是否正在保存
const saving = ref(false)

// 保存失败时的提示
const errorText = ref('')

// 分类候选项，元素形如 { dict_key, dict_value }
const categories = ref([])

// 是否使用自定义分类
const useCustomCategory = ref(false)

// 自定义分类填的内容
const customCategory = ref('')

// .md 文件选择框
const mdInput = ref(null)

// 是否正在上传 md 文件
const mdUploading = ref(false)

/**
 * 下拉框里的选项
 * @returns {Array<{value: string, label: string}>} 选项数组
 */
const categoryOptions = computed(() =>
  categories.value.map((item) => ({
    value: item.dict_key,
    label: item.dict_value
  }))
)

/**
 * 最终要保存的分类值
 * 说明：选自定义时用输入框的内容，否则用下拉框选中的键
 * @returns {string} 分类值
 */
const finalClassification = computed(() =>
  useCustomCategory.value ? customCategory.value.trim() : form.article_classification
)

/**
 * 拉取分类候选项
 * @returns {Promise<void>} 数据加载结束后结束
 */
async function loadCategories() {
  try {
    const res = await http.get('/dictionary/findByType/article_category')
    const list = Array.isArray(res?.result) ? res.result : []
    categories.value = list
      .map((item) => ({ dict_key: item.dict_key, dict_value: item.dict_value }))
      .filter((item) => item.dict_key)
  } catch (error) {
    categories.value = []
  }
}

/**
 * 拉取文章详情（修改模式）
 * @returns {Promise<void>} 数据加载结束后结束
 */
async function loadArticle() {
  if (!isEdit.value) return
  loading.value = true
  try {
    const res = await http.get(`/article/findOne/${articleId.value}`)
    const data = res?.result || {}
    form.article_title = data.article_title || ''
    form.article_author = data.article_author || ''
    form.article_classification = data.article_classification || ''
    form.article_content = data.article_content || ''
    form.article_img = data.article_img || ''
    form.article_file_url = data.article_file_url || ''
    // 如果这个分类不在字典里，说明是手写的，切换到自定义模式
    const known = categories.value.some((item) => item.dict_key === form.article_classification)
    useCustomCategory.value = Boolean(form.article_classification) && !known
    if (useCustomCategory.value) {
      customCategory.value = form.article_classification
    }
  } catch (error) {
    toastError(error.message || '文章详情加载失败')
  } finally {
    loading.value = false
  }
}

/**
 * 校验表单，填错时把提示写进 errorText
 * @returns {boolean} 校验通过返回 true
 */
function validate() {
  if (!form.article_title) {
    errorText.value = '标题不能为空'
    return false
  }
  if (!form.article_author) {
    errorText.value = '作者不能为空'
    return false
  }
  if (!finalClassification.value) {
    errorText.value = '分类不能为空'
    return false
  }
  if (!form.article_content && !form.article_file_url) {
    errorText.value = '正文和 Markdown 文件至少要填一个'
    return false
  }
  if (!form.article_img) {
    errorText.value = '必须上传一张封面图'
    return false
  }
  errorText.value = ''
  return true
}

/**
 * 保存文章：新建走 POST，修改走 PUT
 * @returns {Promise<void>} 保存流程结束后结束
 */
async function handleSave() {
  if (!validate()) return

  saving.value = true
  try {
    const payload = {
      article_title: form.article_title,
      article_author: form.article_author,
      article_classification: finalClassification.value,
      article_content: form.article_content,
      article_img: form.article_img
    }

    // 说明：服务端不接受 article_file_url 为 null 或空字符串，
    // 只能整个不传这个字段，所以这里按需添加
    if (form.article_file_url) {
      payload.article_file_url = form.article_file_url
    }

    if (isEdit.value) {
      await http.put(`/article/${articleId.value}`, payload)
      toastSuccess('文章修改成功')
    } else {
      await http.post('/article/', payload)
      toastSuccess('文章发布成功')
    }
    router.push('/articles')
  } catch (error) {
    errorText.value = error.message || '保存失败'
    toastError(error.message || '保存失败')
  } finally {
    saving.value = false
  }
}

/**
 * 打开 .md 文件选择框
 * @returns {void}
 */
function pickMdFile() {
  mdInput.value?.click()
}

/**
 * 选定 .md 文件后上传
 * @param {Event} event - 文件选择框的 change 事件
 * @returns {Promise<void>} 上传结束后结束
 */
async function onMdFileChange(event) {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file) return

  mdUploading.value = true
  try {
    const formData = new FormData()
    formData.append('file', file)
    const res = await http.post('/article/uploadMd', formData)
    const filename = res?.result?.article_file_url || ''
    if (filename) {
      form.article_file_url = filename
      toastSuccess('Markdown 文件上传成功')
    } else {
      toastError('上传成功但没有返回文件名')
    }
  } catch (error) {
    toastError(error.message || 'Markdown 文件上传失败')
  } finally {
    mdUploading.value = false
  }
}

onMounted(() => {
  loadCategories()
  loadArticle()
})
</script>

<style scoped>
.edit-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(300px, 1fr);
  gap: var(--space-5);
  align-items: start;
}

.hidden-input {
  display: none;
}

.save-error {
  margin-bottom: var(--space-3);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-control);
  background: var(--negative-soft);
  color: var(--negative);
  font-size: 13px;
}

@media (max-width: 1100px) {
  .edit-grid {
    grid-template-columns: 1fr;
  }
}
</style>
