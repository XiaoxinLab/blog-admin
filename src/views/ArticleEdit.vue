<template>
  <div class="article-edit-container">
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <span class="loading-text">加载中...</span>
    </div>

    <div v-else class="edit-card">
      <div class="edit-header">
        <div class="header-left">
          <router-link to="/articles" class="back-link" title="返回列表">
            <svg class="back-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
          </router-link>
          <h2 class="page-title">{{ isEdit ? '编辑文章' : '新建文章' }}</h2>
        </div>

        <div class="header-actions">
          <button
            v-permission="'admin'"
            @click="saveArticle"
            :disabled="saving"
            :class="['btn-secondary', { 'btn-disabled': saving }]"
          >
            {{ saving ? '保存中...' : '保存草稿' }}
          </button>
          <button
            v-permission="'admin'"
            @click="publishArticle"
            :disabled="saving"
            :class="['btn-primary', { 'btn-disabled': saving }]"
          >
            {{ saving ? '发布中...' : '发布文章' }}
          </button>
        </div>
      </div>

      <div class="edit-body">
        <div class="form-group">
          <label class="form-label">文章标题 <span class="required">*</span></label>
          <input
            v-model="article.article_title"
            type="text"
            placeholder="输入文章标题..."
            class="form-input input-title"
          />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">作者 <span class="required">*</span></label>
            <input
              v-model="article.article_author"
              type="text"
              placeholder="输入作者名称..."
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label class="form-label">分类 <span class="required">*</span></label>
            <select v-model="article.article_classification" class="form-select">
              <option value="">选择分类</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.dict_key">{{ cat.dict_value }}</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">封面图片</label>
            <input
              v-model="article.article_img"
              type="text"
              placeholder="图片 URL 或文件名..."
              class="form-input"
            />
          </div>
        </div>

        <div class="editor-group">
          <div class="editor-header">
            <label class="form-label">文章内容 (Markdown) <span class="required">*</span></label>
            <div class="editor-toolbar">
              <div class="content-mode-toggle">
                <button
                  @click="contentMode = 'write'"
                  :class="['mode-switch-btn', { 'mode-switch-active': contentMode === 'write' }]"
                >
                  手写编辑
                </button>
                <button
                  @click="contentMode = 'upload'"
                  :class="['mode-switch-btn', { 'mode-switch-active': contentMode === 'upload' }]"
                >
                  上传文件
                </button>
              </div>
              <div v-if="contentMode === 'write'" class="view-mode-toggle">
                <button
                  @click="viewMode = 'edit'"
                  :class="['mode-btn', { 'mode-active': viewMode === 'edit' }]"
                >
                  编辑
                </button>
                <button
                  @click="viewMode = 'split'"
                  :class="['mode-btn', { 'mode-active': viewMode === 'split' }]"
                >
                  分屏
                </button>
                <button
                  @click="viewMode = 'preview'"
                  :class="['mode-btn', { 'mode-active': viewMode === 'preview' }]"
                >
                  预览
                </button>
              </div>
            </div>
          </div>

          <div v-if="contentMode === 'upload'" class="upload-area">
            <input
              ref="fileInput"
              type="file"
              accept=".md,.markdown"
              @change="handleFileUpload"
              class="file-input-hidden"
            />
            <div class="upload-dropzone" @click="triggerFileUpload" :class="{ 'has-file': uploadedFileName }">
              <svg class="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
              </svg>
              <p v-if="!uploadedFileName" class="upload-hint">点击选择 Markdown 文件（.md）</p>
              <p v-else class="upload-filename">
                <svg class="file-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <span>{{ uploadedFileName }}</span>
                <button @click.stop="clearUploadedFile" class="btn-clear-file" title="移除文件">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </p>
              <span v-if="isUploading" class="upload-loading">上传中...</span>
            </div>
            <div v-if="uploadPreviewContent" class="upload-preview">
              <div class="upload-preview-header">文件预览</div>
              <div v-html="renderedContent" class="markdown-content upload-preview-body"></div>
            </div>
          </div>

          <div v-if="contentMode === 'write'" class="editor-wrapper">
            <div v-if="viewMode === 'edit' || viewMode === 'split'" :class="['editor-pane', { 'pane-split': viewMode === 'split' }]">
              <textarea
                v-model="article.article_content"
                placeholder="在此编写 Markdown 内容...

# 标题一

## 标题二

**粗体** *斜体*

- 列表项 1
- 列表项 2

```javascript
console.log('Hello World')
```"
                class="editor-textarea"
              ></textarea>
            </div>

            <div v-if="viewMode === 'preview' || viewMode === 'split'" :class="['preview-pane', { 'pane-split': viewMode === 'split' }]">
              <div v-html="renderedContent" class="markdown-content"></div>
            </div>
          </div>
        </div>

        <div class="editor-footer">
          <div class="footer-info">
            <svg class="footer-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>自动保存于 {{ lastSaved }}</span>
          </div>
          <div class="footer-info">
            字数：{{ wordCount }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { articleApi, dictionaryApi } from '../api'
import MarkdownIt from 'markdown-it'

const route = useRoute()
const router = useRouter()

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true
})

const isEdit = computed(() => route.name === 'ArticleEdit')
const viewMode = ref('split')
const contentMode = ref('write')
const loading = ref(false)
const saving = ref(false)
const isUploading = ref(false)
const lastSaved = ref('刚刚')
const categories = ref([])
const fileInput = ref(null)
const uploadedFileName = ref('')
const uploadPreviewContent = ref('')

const triggerFileUpload = () => {
  fileInput.value?.click()
}

const handleFileUpload = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  uploadedFileName.value = file.name
  isUploading.value = true

  const reader = new FileReader()
  reader.onload = async (e) => {
    const content = e.target.result
    uploadPreviewContent.value = content

    const titleMatch = content.match(/^#\s+(.+)/m)
    if (titleMatch && !article.value.article_title.trim()) {
      article.value.article_title = titleMatch[1].trim()
    }
  }
  reader.readAsText(file, 'UTF-8')

  try {
    const res = await articleApi.uploadMd(file)
    if (res.code === 0 && res.result?.article_file_url) {
      article.value.article_file_url = res.result.article_file_url
    }
  } catch (error) {
    console.error('文件上传失败:', error)
    alert('文件上传失败，请重试')
    uploadedFileName.value = ''
    uploadPreviewContent.value = ''
  } finally {
    isUploading.value = false
  }

  event.target.value = ''
}

const clearUploadedFile = () => {
  uploadedFileName.value = ''
  uploadPreviewContent.value = ''
  article.value.article_file_url = ''
}

const article = ref({
  id: null,
  article_title: '',
  article_author: '',
  article_classification: '',
  article_content: '',
  article_img: '',
  article_file_url: ''
})

const renderedContent = computed(() => {
  const source = contentMode.value === 'upload' ? uploadPreviewContent.value : article.value.article_content
  if (!source) return '<p class="text-placeholder">在左侧编辑器中编写 Markdown 内容，这里将实时预览...</p>'
  return md.render(source)
})

const wordCount = computed(() => {
  const source = contentMode.value === 'upload' ? uploadPreviewContent.value : article.value.article_content
  if (!source) return 0
  return source.replace(/\s/g, '').length
})

let autoSaveTimer = null

watch(() => article.value.article_content, () => {
  if (autoSaveTimer) clearTimeout(autoSaveTimer)
  autoSaveTimer = setTimeout(() => {
    lastSaved.value = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }, 2000)
})

const fetchArticle = async (id) => {
  try {
    loading.value = true
    const res = await articleApi.getArticleById(id)
    const data = res.result

    article.value = {
      id: data.id,
      article_title: data.article_title || '',
      article_author: data.article_author || '',
      article_classification: data.article_classification || '',
      article_content: data.article_content || '',
      article_img: data.article_img || '',
      article_file_url: data.article_file_url || ''
    }

    if (data.article_file_url) {
      contentMode.value = 'upload'
      uploadedFileName.value = data.article_file_url.split('/').pop() || data.article_file_url
      uploadPreviewContent.value = data.article_content || ''
    }
  } catch (error) {
    console.error('获取文章详情失败:', error)
    alert('获取文章失败，请重试')
    router.push('/articles')
  } finally {
    loading.value = false
  }
}

const validateForm = () => {
  if (!article.value.article_title.trim()) {
    alert('请输入文章标题')
    return false
  }
  if (!article.value.article_author.trim()) {
    alert('请输入作者名称')
    return false
  }
  if (!article.value.article_classification) {
    alert('请选择文章分类')
    return false
  }
  if (contentMode.value === 'upload' && !article.value.article_file_url) {
    alert('请先上传 Markdown 文件')
    return false
  }
  if (contentMode.value === 'write' && !article.value.article_content.trim()) {
    alert('请输入文章内容')
    return false
  }
  return true
}

const saveArticle = async () => {
  if (!validateForm()) return

  try {
    saving.value = true

    const payload = {
      article_title: article.value.article_title,
      article_author: article.value.article_author,
      article_classification: article.value.article_classification,
      article_img: article.value.article_img || 'default.png'
    }

    if (contentMode.value === 'upload') {
      payload.article_file_url = article.value.article_file_url
    } else {
      payload.article_content = article.value.article_content
    }

    if (isEdit.value) {
      await articleApi.updateArticle(article.value.id, payload)
      alert('文章更新成功！')
    } else {
      await articleApi.createArticle(payload)
      alert('文章创建成功！')
    }

    router.push('/articles')
  } catch (error) {
    console.error('保存失败:', error)
    alert(isEdit.value ? '更新文章失败，请重试' : '创建文章失败，请重试')
  } finally {
    saving.value = false
  }
}

const publishArticle = async () => {
  await saveArticle()
}

const fetchCategories = async () => {
  try {
    const data = await dictionaryApi.getByType('article_category')
    categories.value = data
  } catch (error) {
    console.error('获取分类失败:', error)
  }
}

onMounted(async () => {
  await fetchCategories()
  if (isEdit.value && route.params.id) {
    await fetchArticle(route.params.id)
  }
})
</script>

<style scoped>
.article-edit-container {
  max-width: 1200px;
  margin: 0 auto;
}

.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  gap: 12px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 3px solid rgba(255, 235, 167, 0.1);
  border-top-color: #ffeba7;
  animation: spin 0.8s linear infinite;
  filter: drop-shadow(0 0 8px rgba(255, 235, 167, 0.4));
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  color: #c4c3ca;
  font-size: 14px;
}

.edit-card {
  background: linear-gradient(180deg, rgba(42, 43, 56, 0.98) 0%, rgba(31, 32, 41, 0.95) 100%);
  border-radius: 16px;
  border: 1px solid rgba(255, 235, 167, 0.08);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.03);
  overflow: hidden;
  animation: fadeInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.edit-header {
  padding: 24px 28px;
  border-bottom: 1px solid rgba(255, 235, 167, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255, 235, 167, 0.02);
  position: relative;
}

.edit-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 28px;
  right: 28px;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(255, 235, 167, 0.2) 50%, transparent 100%);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-link {
  padding: 8px;
  border-radius: 8px;
  transition: all 0.25s ease;
  color: #c4c3ca;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 235, 167, 0.05);
  border: 1px solid rgba(255, 235, 167, 0.1);
}

.back-link:hover {
  color: #ffeba7;
  background: rgba(255, 235, 167, 0.15);
  border-color: rgba(255, 235, 167, 0.25);
  transform: translateX(-2px);
}

.back-icon {
  width: 20px;
  height: 20px;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  color: #ffeba7;
  text-shadow: 0 0 12px rgba(255, 235, 167, 0.3);
  letter-spacing: 0.5px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-secondary,
.btn-primary {
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 13px;
  letter-spacing: 0.5px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  border: none;
  position: relative;
  overflow: hidden;
}

.btn-secondary {
  background: transparent;
  color: #c4c3ca;
  border: 1px solid rgba(255, 235, 167, 0.2);
}

.btn-secondary:hover:not(.btn-disabled) {
  background: rgba(255, 235, 167, 0.1);
  color: #fff;
  border-color: rgba(255, 235, 167, 0.35);
  transform: translateY(-1px);
}

.btn-primary {
  background: linear-gradient(135deg, #ffeba7 0%, #ffd666 100%);
  color: #102770;
  box-shadow: 0 4px 16px rgba(255, 235, 167, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.btn-primary:hover:not(.btn-disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(255, 235, 167, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.btn-primary::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s ease;
}

.btn-primary:hover:not(.btn-disabled)::before {
  left: 100%;
}

.btn-disabled {
  opacity: 0.45;
  cursor: not-allowed;
  transform: none !important;
}

.edit-body {
  padding: 28px;
}

.form-group {
  margin-bottom: 24px;
}

.form-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #c4c3ca;
  margin-bottom: 8px;
  letter-spacing: 0.3px;
}

.required {
  color: #ff4d4f;
  margin-left: 2px;
}

.form-input,
.form-select {
  width: 100%;
  padding: 13px 16px;
  border-radius: 10px;
  outline: none;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  background: rgba(31, 32, 41, 0.7);
  border: 1px solid rgba(255, 235, 167, 0.1);
  color: #fff;
  font-size: 14px;
  box-sizing: border-box;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.03);
}

.form-input::placeholder {
  color: #6b6b76;
  opacity: 0.7;
}

.form-input:focus,
.form-select:focus {
  border-color: rgba(255, 235, 167, 0.35);
  box-shadow: 0 4px 20px rgba(255, 235, 167, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.06);
  background: rgba(31, 32, 41, 0.9);
}

.input-title {
  font-size: 18px;
  font-weight: 600;
  padding: 16px 18px;
}

.form-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23c4c3ca'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 18px;
  padding-right: 40px;
  cursor: pointer;
}

.form-select option {
  background: #2a2b38;
  color: #fff;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.editor-group {
  margin-top: 8px;
}

.editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 12px;
}

.editor-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
}

.file-input-hidden {
  display: none;
}

.content-mode-toggle {
  display: flex;
  gap: 4px;
  padding: 4px;
  background: rgba(31, 32, 41, 0.6);
  border-radius: 10px;
  border: 1px solid rgba(255, 235, 167, 0.08);
}

.mode-switch-btn {
  padding: 8px 18px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.25s ease;
  color: #c4c3ca;
  background: transparent;
  border: none;
  cursor: pointer;
  white-space: nowrap;
}

.mode-switch-active {
  background: rgba(255, 235, 167, 0.15);
  color: #ffeba7;
  box-shadow: 0 2px 8px rgba(255, 235, 167, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.mode-switch-btn:hover:not(.mode-switch-active) {
  background: rgba(255, 235, 167, 0.06);
  color: #fff;
}

.upload-area {
  border: 1px solid rgba(255, 235, 167, 0.08);
  border-radius: 12px;
  overflow: hidden;
}

.upload-dropzone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  border: 2px dashed rgba(255, 235, 167, 0.15);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.25s ease;
  background: rgba(31, 32, 41, 0.3);
  margin: 20px;
}

.upload-dropzone:hover {
  border-color: rgba(255, 235, 167, 0.35);
  background: rgba(31, 32, 41, 0.5);
}

.upload-dropzone.has-file {
  border-style: solid;
  border-color: rgba(255, 235, 167, 0.25);
  background: rgba(255, 235, 167, 0.04);
  padding: 24px;
}

.upload-icon {
  width: 48px;
  height: 48px;
  color: #6b6b76;
  margin-bottom: 12px;
  transition: color 0.25s ease;
}

.upload-dropzone:hover .upload-icon {
  color: #ffeba7;
}

.upload-hint {
  color: #6b6b76;
  font-size: 14px;
  margin: 0;
}

.upload-filename {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  color: #c4c3ca;
  font-size: 14px;
}

.file-icon {
  width: 20px;
  height: 20px;
  color: #ffeba7;
  flex-shrink: 0;
}

.btn-clear-file {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: none;
  background: rgba(255, 77, 79, 0.15);
  color: #ff4d4f;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.btn-clear-file svg {
  width: 14px;
  height: 14px;
}

.btn-clear-file:hover {
  background: rgba(255, 77, 79, 0.3);
}

.upload-loading {
  color: #ffeba7;
  font-size: 13px;
  margin-top: 8px;
}

.upload-preview {
  border-top: 1px solid rgba(255, 235, 167, 0.08);
}

.upload-preview-header {
  padding: 12px 20px;
  font-size: 12px;
  font-weight: 600;
  color: #6b6b76;
  text-transform: uppercase;
  letter-spacing: 1px;
  background: rgba(255, 235, 167, 0.03);
}

.upload-preview-body {
  max-height: 400px;
  overflow-y: auto;
  padding: 20px;
}

.view-mode-toggle {
  display: flex;
  gap: 4px;
  padding: 4px;
  background: rgba(31, 32, 41, 0.6);
  border-radius: 10px;
  border: 1px solid rgba(255, 235, 167, 0.08);
}

.mode-btn {
  padding: 8px 18px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.25s ease;
  color: #c4c3ca;
  background: transparent;
  border: none;
  cursor: pointer;
}

.mode-active {
  background: rgba(255, 235, 167, 0.15);
  color: #ffeba7;
  box-shadow: 0 2px 8px rgba(255, 235, 167, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.mode-btn:hover:not(.mode-active) {
  background: rgba(255, 235, 167, 0.06);
  color: #fff;
}

.editor-wrapper {
  border: 1px solid rgba(255, 235, 167, 0.08);
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  min-height: 520px;
  background: rgba(31, 32, 41, 0.4);
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.2);
}

.editor-pane {
  width: 100%;
  display: inline-block;
  vertical-align: top;
}

.pane-split {
  width: 50%;
  border-right: 1px solid rgba(255, 235, 167, 0.08);
}

.editor-textarea {
  width: 100%;
  height: 520px;
  padding: 20px;
  resize: none;
  outline: none;
  font-family: 'Fira Code', 'Consolas', 'Monaco', monospace;
  font-size: 14px;
  line-height: 1.7;
  color: #e4e4e7;
  background: transparent;
  border: none;
  box-sizing: border-box;
}

.editor-textarea::placeholder {
  color: #6b6b76;
  opacity: 0.6;
}

.editor-textarea:focus {
  background: rgba(255, 235, 167, 0.02);
}

.preview-pane {
  width: 100%;
  display: inline-block;
  vertical-align: top;
  overflow-y: auto;
  background: rgba(26, 27, 34, 0.6);
  padding: 24px;
}

.markdown-content {
  color: #e4e4e7;
  line-height: 1.8;
  font-size: 15px;
}

.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3) {
  color: #ffeba7;
  margin-top: 24px;
  margin-bottom: 12px;
  font-weight: 700;
}

.markdown-content :deep(p) {
  margin-bottom: 12px;
}

.markdown-content :deep(code) {
  background: rgba(255, 235, 167, 0.1);
  color: #ffd666;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Fira Code', monospace;
  font-size: 13px;
}

.markdown-content :deep(pre) {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 235, 167, 0.1);
  border-radius: 8px;
  padding: 16px;
  overflow-x: auto;
  margin: 16px 0;
}

.markdown-content :deep(pre code) {
  background: transparent;
  padding: 0;
  color: #e4e4e7;
}

.markdown-content :deep(blockquote) {
  border-left: 3px solid #ffeba7;
  padding-left: 16px;
  margin: 16px 0;
  color: #a1a1aa;
  font-style: italic;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  padding-left: 24px;
  margin: 12px 0;
}

.markdown-content :deep(li) {
  margin-bottom: 6px;
}

.markdown-content :deep(strong) {
  color: #fff;
  font-weight: 600;
}

.text-placeholder {
  color: #6b6b76 !important;
  font-style: italic;
  text-align: center;
  padding: 60px 20px;
}

.editor-footer {
  display: flex;
  align-items: center;
  gap: 24px;
  padding-top: 20px;
  margin-top: 24px;
  border-top: 1px solid rgba(255, 235, 167, 0.08);
}

.footer-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #6b6b76;
}

.footer-icon {
  width: 16px;
  height: 16px;
  opacity: 0.6;
}

@media (max-width: 768px) {
  .edit-card {
    border-radius: 12px;
  }

  .edit-header {
    flex-direction: column;
    gap: 16px;
    padding: 20px;
  }

  .header-actions {
    width: 100%;
    justify-content: stretch;
  }

  .btn-secondary,
  .btn-primary {
    flex: 1;
    text-align: center;
  }

  .edit-body {
    padding: 20px 16px;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .editor-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .view-mode-toggle {
    width: 100%;
    justify-content: stretch;
  }

  .mode-btn {
    flex: 1;
    text-align: center;
  }

  .pane-split {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid rgba(255, 235, 167, 0.08);
  }

  .editor-wrapper {
    min-height: 400px;
  }

  .editor-textarea {
    height: 400px;
    padding: 16px;
    font-size: 13px;
  }

  .preview-pane {
    min-height: 400px;
    padding: 16px;
  }

  .page-title {
    font-size: 18px;
  }
}
</style>