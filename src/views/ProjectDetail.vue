<template>
  <div class="detail-page">
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <span class="loading-text">加载项目中...</span>
    </div>

    <div v-else-if="error" class="error-container">
      <svg class="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
      </svg>
      <p class="error-text">{{ error }}</p>
      <button @click="router.back()" class="back-btn">返回列表</button>
    </div>

    <template v-else>
      <button @click="router.back()" class="back-nav">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16l-4-4m0 0l4-4m-4 4h18"></path>
        </svg>
        <span>返回项目列表</span>
      </button>

      <article class="project-container">
        <header class="project-hero">
          <div class="hero-glow"></div>
          <div class="hero-content">
            <div class="project-meta-top">
              <span class="meta-tag meta-type">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                </svg>
                {{ project.project_type || '未分类' }}
              </span>
              <span class="meta-divider">·</span>
              <span class="meta-year">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                {{ project.project_year || '-' }} 年
              </span>
              <span class="meta-divider">·</span>
              <span class="meta-date">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                {{ formatDate(project.createdAt || project.created_at) }}
              </span>
            </div>

            <h1 class="project-title">{{ project.project_name }}</h1>

            <div class="project-status-row">
              <div class="status-badge" :class="isDeleted(project) ? 'status-deleted' : 'status-active'">
                <span class="status-dot"></span>
                {{ getStatusText(project) }}
              </div>
            </div>
          </div>
        </header>

        <div class="project-divider">
          <div class="divider-line"></div>
          <div class="divider-diamond"></div>
          <div class="divider-line"></div>
        </div>

        <div class="project-body">
          <div v-if="project.project_image" class="image-section">
            <h2 class="section-title">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              项目截图
            </h2>
            <div class="image-wrapper-main">
              <img
                :src="getImageUrl(project.project_image)"
                :alt="project.project_name"
                class="project-image-main"
                @error="handleImageError"
                @load="handleImageLoad"
              />
            </div>
          </div>

          <div class="info-section">
            <h2 class="section-title">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              项目描述
            </h2>
            <div class="markdown-content" v-html="renderedContent"></div>
          </div>

          <div class="info-grid" v-if="project.project_link">
            <div class="info-card">
              <div class="card-icon">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
                </svg>
              </div>
              <div class="card-content">
                <p class="card-label">项目链接</p>
                <a :href="project.project_link" target="_blank" rel="noopener noreferrer" class="card-value link-value">
                  {{ project.project_link }}
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        <footer class="project-footer">
          <div class="footer-divider"></div>
          <div class="footer-content">
            <p class="footer-text">— END —</p>
            <p class="footer-sub">感谢查看 · 项目详情</p>
          </div>
        </footer>
      </article>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { projectApi } from '../api'
import { setDynamicTitle, clearDynamicTitle } from '../utils/pageTitle'
import MarkdownIt from 'markdown-it'

const route = useRoute()
const router = useRouter()

const project = ref({})
const loading = ref(true)
const error = ref('')
const imageLoaded = ref(false)
const imageError = ref(false)

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true
})

const renderedContent = ref('')

const getBaseUrl = () => {
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:1011'
}

const getImageUrl = (imagePath) => {
  if (!imagePath) return ''

  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }

  const baseUrl = getBaseUrl()
  const cleanPath = imagePath.replace(/^\/+/, '')

  return `${baseUrl}/${cleanPath}`
}

const formatDate = (date) => {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const isDeleted = (project) => {
  return !!(project.deletedAt || project.deleted_at)
}

const getStatusText = (project) => {
  return isDeleted(project) ? '已删除' : '正常'
}

const handleImageLoad = () => {
  imageLoaded.value = true
  imageError.value = false
}

const handleImageError = (e) => {
  console.error('图片加载失败:', e.target.src)
  imageError.value = true
  imageLoaded.value = false
  e.target.style.display = 'none'
}

const fetchProject = async () => {
  try {
    loading.value = true
    error.value = ''
    const id = route.params.id
    const res = await projectApi.getProjectById(id)
    const data = res.result || res
    project.value = data
    renderedContent.value = md.render(data.project_desc || '')
    setDynamicTitle(data.project_name || '项目详情')
  } catch (err) {
    console.error('获取项目详情失败:', err)
    error.value = '项目加载失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchProject()
})

onUnmounted(() => {
  clearDynamicTitle()
})
</script>

<style scoped>
.detail-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 16px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  gap: 16px;
}

.spinner {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid rgba(255, 235, 167, 0.15);
  border-top-color: #ffeba7;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  color: #c4c3ca;
  font-size: 14px;
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  gap: 16px;
}

.error-icon {
  width: 48px;
  height: 48px;
  color: #ff4d4f;
}

.error-text {
  color: #c4c3ca;
  font-size: 15px;
}

.back-btn {
  padding: 10px 24px;
  border-radius: 8px;
  background: rgba(255, 235, 167, 0.1);
  border: 1px solid rgba(255, 235, 167, 0.2);
  color: #ffeba7;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: rgba(255, 235, 167, 0.2);
  border-color: rgba(255, 235, 167, 0.4);
}

.back-nav {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 0;
  color: #c4c3ca;
  font-size: 14px;
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.3s ease;
  margin-bottom: 24px;
}

.back-nav:hover {
  color: #ffeba7;
}

.project-container {
  animation: fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.project-hero {
  position: relative;
  padding: 48px 40px;
  border-radius: 16px;
  background: linear-gradient(135deg, #2a2b38 0%, #1f2029 100%);
  border: 1px solid rgba(255, 235, 167, 0.08);
  overflow: hidden;
}

.hero-glow {
  position: absolute;
  top: -50%;
  right: -20%;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(255, 235, 167, 0.06) 0%, transparent 70%);
  pointer-events: none;
}

.hero-content {
  position: relative;
  z-index: 1;
}

.project-meta-top {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.meta-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.meta-type {
  background: rgba(139, 92, 246, 0.15);
  color: #a78bfa;
  border: 1px solid rgba(139, 92, 246, 0.25);
}

.meta-divider {
  color: rgba(255, 255, 255, 0.2);
}

.meta-year,
.meta-date {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  color: #8b8b9e;
}

.project-title {
  font-size: 32px;
  font-weight: 700;
  line-height: 1.4;
  color: #fff;
  margin-bottom: 24px;
  letter-spacing: 0.02em;
}

.project-status-row {
  display: flex;
  align-items: center;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
}

.status-active {
  background: rgba(40, 199, 111, 0.15);
  color: #5fe0a1;
  border: 1px solid rgba(40, 199, 111, 0.25);
}

.status-deleted {
  background: rgba(255, 193, 7, 0.15);
  color: #ffc94d;
  border: 1px solid rgba(255, 193, 7, 0.25);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.project-divider {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 32px 0;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(to right, transparent, rgba(255, 235, 167, 0.15), transparent);
}

.divider-diamond {
  width: 8px;
  height: 8px;
  background: #ffeba7;
  transform: rotate(45deg);
  opacity: 0.4;
  flex-shrink: 0;
}

.project-body {
  padding: 0 0 48px;
}

.image-section {
  margin-bottom: 36px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #ffeba7;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 235, 167, 0.1);
}

.image-wrapper-main {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 235, 167, 0.1);
  background: linear-gradient(135deg, rgba(42, 43, 56, 0.98) 0%, rgba(31, 32, 41, 0.95) 100%);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.03);
  position: relative;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.project-image-main {
  width: 100%;
  max-height: 500px;
  object-fit: contain;
  display: block;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: rgba(31, 32, 41, 0.95);
}

.project-image-main:hover {
  transform: scale(1.02);
}

.info-section {
  margin-bottom: 32px;
}

.markdown-content {
  color: #d1d1db;
  font-size: 16px;
  line-height: 1.85;
  letter-spacing: 0.01em;
}

.markdown-content :deep(p) {
  margin: 14px 0;
}

.markdown-content :deep(strong) {
  color: #fff;
  font-weight: 600;
}

.markdown-content :deep(a) {
  color: #ffeba7;
  text-decoration: none;
  border-bottom: 1px dashed rgba(255, 235, 167, 0.4);
  transition: all 0.2s ease;
}

.markdown-content :deep(a:hover) {
  border-bottom-style: solid;
  color: #ffd666;
}

.markdown-content :deep(code) {
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(255, 235, 167, 0.08);
  color: #ffeba7;
  font-family: 'Fira Code', 'Consolas', 'Monaco', monospace;
  font-size: 0.9em;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-top: 32px;
}

.info-card {
  background: linear-gradient(135deg, rgba(42, 43, 56, 0.98) 0%, rgba(31, 32, 41, 0.95) 100%);
  border: 1px solid rgba(255, 235, 167, 0.08);
  border-radius: 12px;
  padding: 24px;
  display: flex;
  gap: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.info-card:hover {
  border-color: rgba(255, 235, 167, 0.15);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(255, 235, 167, 0.15), rgba(255, 214, 102, 0.1));
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffeba7;
  flex-shrink: 0;
}

.card-content {
  flex: 1;
  min-width: 0;
}

.card-label {
  font-size: 12px;
  color: #8b8b9e;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 8px;
  font-weight: 600;
}

.card-value {
  font-size: 14px;
  color: #d1d1db;
  word-break: break-all;
}

.link-value {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #60a5fa;
  text-decoration: none;
  transition: color 0.2s ease;
}

.link-value:hover {
  color: #93c5fd;
  text-decoration: underline;
}

.project-footer {
  padding: 40px 0 60px;
  text-align: center;
}

.footer-divider {
  width: 60px;
  height: 2px;
  background: linear-gradient(to right, transparent, rgba(255, 235, 167, 0.4), transparent);
  margin: 0 auto 24px;
}

.footer-text {
  font-size: 14px;
  color: #8b8b9e;
  letter-spacing: 0.15em;
  margin-bottom: 6px;
}

.footer-sub {
  font-size: 12px;
  color: #6b6b7e;
}

@media (max-width: 768px) {
  .project-hero {
    padding: 32px 24px;
    border-radius: 12px;
  }

  .project-title {
    font-size: 24px;
  }

  .markdown-content {
    font-size: 15px;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .info-card {
    padding: 20px;
  }

  .project-image-main {
    max-height: 350px;
  }
}
</style>
