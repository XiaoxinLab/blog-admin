<template>
  <div class="max-w-5xl mx-auto space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-white">
        {{ isEdit ? '编辑项目' : '新建项目' }}
      </h1>
      <router-link to="/projects" class="btn-back">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
        </svg>
        返回列表
      </router-link>
    </div>

    <form @submit.prevent="handleSubmit" class="form-container">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-6">
          <div class="form-group">
            <label class="form-label required">项目名称</label>
            <input
              v-model="form.project_name"
              type="text"
              placeholder="请输入项目名称"
              class="form-input"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label required">项目描述</label>
            <textarea
              v-model="form.project_desc"
              rows="6"
              placeholder="请输入项目描述"
              class="form-textarea"
              required
            ></textarea>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="form-group">
              <label class="form-label required">项目类型</label>
              <select v-model="form.project_type" class="form-select" required>
                <option value="">请选择类型</option>
                <option value="Chrome Extension">Chrome Extension</option>
                <option value="Web 应用">Web 应用</option>
                <option value="数据可视化">数据可视化</option>
                <option value="博客管理系统">博客管理系统</option>
                <option value="移动应用">移动应用</option>
                <option value="其他">其他</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label required">项目年份</label>
              <input
                v-model="form.project_year"
                type="text"
                placeholder="例如：2025"
                class="form-input"
                required
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="form-group">
              <label class="form-label">演示地址</label>
              <input
                v-model="form.project_demo"
                type="url"
                placeholder="https://example.com"
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label class="form-label">GitHub 地址</label>
              <input
                v-model="form.project_github"
                type="url"
                placeholder="https://github.com/xxx/xxx"
                class="form-input"
              />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">技术栈（用逗号分隔）</label>
            <input
              v-model="techsInput"
              type="text"
              placeholder="Vue 3, TypeScript, Tailwind CSS"
              class="form-input"
            />
            <p class="form-hint">多个技术用英文逗号分隔</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="form-group">
              <label class="form-label">显示设置</label>
              <div class="space-y-2">
                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    v-model="form.show_demo"
                    class="form-checkbox"
                  />
                  <span>显示演示按钮</span>
                </label>
                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    v-model="form.show_github"
                    class="form-checkbox"
                  />
                  <span>显示 GitHub 按钮</span>
                </label>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">游客账号（可选）</label>
              <div class="space-y-2">
                <input
                  v-model="guestUsername"
                  type="text"
                  placeholder="用户名"
                  class="form-input"
                />
                <input
                  v-model="guestPassword"
                  type="text"
                  placeholder="密码"
                  class="form-input"
                />
                <input
                  v-model="guestDisplayName"
                  type="text"
                  placeholder="显示名称（如：游客）"
                  class="form-input"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="space-y-6">
          <div class="form-group">
            <label class="form-label">项目封面图</label>
            <div class="image-upload-area" @click="triggerUpload" @dragover.prevent @drop.prevent="handleDrop">
              <img v-if="form.project_image && !uploading" :src="getImageUrl(form.project_image)" alt="预览" class="preview-image" />
              <template v-else>
                <svg v-if="!uploading" class="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <div v-else class="spinner"></div>
                <p v-if="!uploading" class="upload-text">点击或拖拽上传图片</p>
              </template>
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                @change="handleFileChange"
                class="hidden"
              />
            </div>
            <p v-if="form.project_image" class="form-hint mt-2">
              当前图片: {{ form.project_image }}
            </p>
          </div>

          <div class="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <h3 class="text-sm font-semibold text-white mb-3">操作</h3>
            <div class="space-y-2">
              <button type="submit" :disabled="submitting" class="btn-submit w-full" :class="{ 'opacity-50 cursor-not-allowed': submitting }">
                <span v-if="submitting" class="spinner-small"></span>
                {{ submitting ? '保存中...' : (isEdit ? '更新项目' : '发布项目') }}
              </button>
              <router-link to="/projects" class="btn-cancel w-full block text-center">
                取消
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { projectApi } from '../api'

const router = useRouter()
const route = useRoute()

const fileInput = ref(null)
const uploading = ref(false)
const submitting = ref(false)

const form = ref({
  project_name: '',
  project_desc: '',
  project_type: '',
  project_year: '',
  project_techs: [],
  project_image: '',
  project_demo: '',
  project_github: '',
  show_demo: true,
  show_github: true,
  guest_account: null
})

const techsInput = ref('')
const guestUsername = ref('')
const guestPassword = ref('')
const guestDisplayName = ref('')

const isEdit = computed(() => !!route.params.id)

const getImageUrl = (filename) => {
  if (!filename) return ''
  if (filename.startsWith('http')) return filename
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:1011'
  return `${baseUrl}/${filename}`
}

const triggerUpload = () => {
  fileInput.value?.click()
}

const handleFileChange = async (event) => {
  const file = event.target.files?.[0]
  if (file) {
    await uploadImage(file)
  }
}

const handleDrop = async (event) => {
  const file = event.dataTransfer.files?.[0]
  if (file && file.type.startsWith('image/')) {
    await uploadImage(file)
  }
}

const uploadImage = async (file) => {
  uploading.value = true
  try {
    const res = await projectApi.uploadImage(file)
    if (res.code === 0) {
      form.value.project_image = res.result.project_image
    }
  } catch (error) {
    console.error('上传图片失败:', error)
    alert('图片上传失败，请重试')
  } finally {
    uploading.value = false
  }
}

const handleSubmit = async () => {
  if (!form.value.project_name || !form.value.project_desc || !form.value.project_type || !form.value.project_year) {
    alert('请填写必填项')
    return
  }

  form.value.project_techs = techsInput.value.split(',').map(t => t.trim()).filter(Boolean)

  if (guestUsername.value || guestPassword.value) {
    form.value.guest_account = {
      username: guestUsername.value,
      password: guestPassword.value,
      displayName: guestDisplayName.value || '游客'
    }
  } else {
    form.value.guest_account = null
  }

  submitting.value = true
  try {
    let res
    if (isEdit.value) {
      res = await projectApi.updateProject(route.params.id, form.value)
    } else {
      res = await projectApi.createProject(form.value)
    }

    if (res.code === 0) {
      router.push('/projects')
    } else {
      alert(res.message || '操作失败')
    }
  } catch (error) {
    console.error('操作失败:', error)
    alert('操作失败，请重试')
  } finally {
    submitting.value = false
  }
}

const fetchProject = async () => {
  try {
    const res = await projectApi.getProjectById(route.params.id)
    if (res.code === 0 && res.result) {
      const data = res.result
      form.value = {
        project_name: data.project_name || '',
        project_desc: data.project_desc || '',
        project_type: data.project_type || '',
        project_year: data.project_year || '',
        project_techs: data.project_techs || [],
        project_image: data.project_image || '',
        project_demo: data.project_demo || '',
        project_github: data.project_github || '',
        show_demo: data.show_demo !== false,
        show_github: data.show_github !== false,
        guest_account: data.guest_account || null
      }
      techsInput.value = Array.isArray(data.project_techs) ? data.project_techs.join(', ') : ''
      
      if (data.guest_account) {
        guestUsername.value = data.guest_account.username || ''
        guestPassword.value = data.guest_account.password || ''
        guestDisplayName.value = data.guest_account.displayName || ''
      }
    }
  } catch (error) {
    console.error('获取项目详情失败:', error)
  }
}

onMounted(() => {
  if (isEdit.value) {
    fetchProject()
  }
})
</script>

<style scoped>
.form-container {
  background-color: #2a2b38;
  border-radius: 0.75rem;
  padding: 1.5rem;
  border: 1px solid rgba(255, 235, 167, 0.08);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #c4c3ca;
}

.form-label.required::after {
  content: ' *';
  color: #f87171;
}

.form-input,
.form-textarea,
.form-select {
  padding: 0.625rem 0.875rem;
  background-color: #1f2029;
  border: 1px solid rgba(255, 235, 167, 0.1);
  border-radius: 0.5rem;
  color: #fff;
  font-size: 0.875rem;
  transition: all 0.25s ease;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: rgba(255, 235, 167, 0.3);
  box-shadow: 0 0 0 3px rgba(255, 235, 167, 0.05);
}

.form-textarea {
  resize: vertical;
  line-height: 1.5;
}

.form-select {
  cursor: pointer;
}

.form-hint {
  font-size: 0.75rem;
  color: #888;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #c4c3ca;
  cursor: pointer;
}

.form-checkbox {
  width: 1rem;
  height: 1rem;
  accent-color: #ffeba7;
  cursor: pointer;
}

.image-upload-area {
  aspect-ratio: 16 / 10;
  background-color: #1f2029;
  border: 2px dashed rgba(255, 235, 167, 0.15);
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.25s ease;
  position: relative;
  overflow: hidden;
}

.image-upload-area:hover {
  border-color: rgba(255, 235, 167, 0.3);
  background-color: rgba(255, 235, 167, 0.02);
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-icon {
  width: 3rem;
  height: 3rem;
  color: #c4c3ca;
  opacity: 0.4;
}

.upload-text {
  font-size: 0.875rem;
  color: #888;
  margin-top: 0.5rem;
}

.spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid rgba(255, 235, 167, 0.1);
  border-top-color: #ffeba7;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  background-color: transparent;
  border: 1px solid rgba(255, 235, 167, 0.2);
  color: #c4c3ca;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.25s ease;
}

.btn-back:hover {
  background-color: rgba(255, 235, 167, 0.08);
  color: #ffeba7;
  border-color: rgba(255, 235, 167, 0.3);
}

.btn-submit {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #ffeba7 0%, #ffd666 100%);
  color: #102770;
  font-weight: 600;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: all 0.25s ease;
  font-size: 0.875rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(255, 235, 167, 0.35);
}

.btn-cancel {
  padding: 0.75rem 1.5rem;
  background-color: transparent;
  border: 1px solid rgba(255, 235, 167, 0.1);
  color: #c4c3ca;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.25s ease;
}

.btn-cancel:hover {
  background-color: rgba(255, 77, 79, 0.08);
  border-color: rgba(255, 77, 79, 0.2);
  color: #f87171;
}

.spinner-small {
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(16, 39, 112, 0.2);
  border-top-color: #102770;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.hidden {
  display: none;
}
</style>