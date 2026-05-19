<template>
  <div class="detail-page">
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <span class="loading-text">加载文章中...</span>
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
        <span>返回文章列表</span>
      </button>

      <article class="article-container">
        <header class="article-hero">
          <div class="hero-glow"></div>
          <div class="hero-content">
            <div class="article-meta-top">
              <span class="meta-tag meta-classification">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                </svg>
                {{ categoryMap[article.article_classification] || article.article_classification || '未分类' }}
              </span>
              <span class="meta-divider">·</span>
              <span class="meta-date">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                {{ formatDate(article.createdAt || article.created_at) }}
              </span>
            </div>

            <h1 class="article-title">{{ article.article_title }}</h1>

            <div class="article-author-row">
              <div class="author-avatar">
                {{ (article.article_author || 'A').charAt(0).toUpperCase() }}
              </div>
              <div class="author-info">
                <span class="author-name">{{ article.article_author || '匿名' }}</span>
                <span class="author-label">作者</span>
              </div>
              <div class="article-stats">
                <span class="stat-item">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                  {{ article.view_count || 0 }} 阅读
                </span>
              </div>
            </div>
          </div>
        </header>

        <div class="article-divider">
          <div class="divider-line"></div>
          <div class="divider-diamond"></div>
          <div class="divider-line"></div>
        </div>

        <div class="article-body">
          <div class="markdown-content" v-html="renderedContent"></div>
        </div>

        <footer class="article-footer">
          <div class="footer-divider"></div>
          <div class="footer-content">
            <p class="footer-text">— END —</p>
            <p class="footer-sub">感谢阅读 · 欢迎分享</p>
          </div>
        </footer>
      </article>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { articleApi, dictionaryApi } from '../api'
import { setDynamicTitle, clearDynamicTitle } from '../utils/pageTitle'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-dark.css'

const route = useRoute()
const router = useRouter()

const article = ref({})
const loading = ref(true)
const error = ref('')
const categories = ref([])

const categoryMap = computed(() => {
  const map = {}
  categories.value.forEach(cat => {
    map[cat.dict_key] = cat.dict_value
  })
  return map
})

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return '<pre class="hljs"><code>' +
          hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
          '</code></pre>'
      } catch (__) {}
    }
    return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>'
  }
})

const renderedContent = ref('')

const formatDate = (date) => {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const fetchArticle = async () => {
  try {
    loading.value = true
    error.value = ''
    const id = route.params.id
    const res = await articleApi.getArticleById(id)
    const data = res.result || res
    article.value = data
    renderedContent.value = md.render(data.article_content || '')
    setDynamicTitle(data.article_title || '文章详情')
  } catch (err) {
    console.error('获取文章详情失败:', err)
    error.value = '文章加载失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

const fetchCategories = async () => {
  try {
    const data = await dictionaryApi.getByType('article_category')
    categories.value = data || []
  } catch (error) {
    console.error('获取分类失败:', error)
  }
}

onMounted(() => {
  fetchCategories()
  fetchArticle()
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

.article-container {
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

.article-hero {
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

.article-meta-top {
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

.meta-classification {
  background: rgba(115, 103, 240, 0.15);
  color: #a78bfa;
  border: 1px solid rgba(115, 103, 240, 0.25);
}

.meta-divider {
  color: rgba(255, 255, 255, 0.2);
}

.meta-date {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  color: #8b8b9e;
}

.article-title {
  font-size: 32px;
  font-weight: 700;
  line-height: 1.4;
  color: #fff;
  margin-bottom: 24px;
  letter-spacing: 0.02em;
}

.article-author-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.author-avatar {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #ffeba7, #ffd666);
  color: #102770;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
  flex-shrink: 0;
}

.author-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.author-name {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
}

.author-label {
  font-size: 11px;
  color: #8b8b9e;
}

.article-stats {
  margin-left: auto;
}

.stat-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  color: #8b8b9e;
}

.article-divider {
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

.article-body {
  padding: 0 0 48px;
}

.markdown-content {
  color: #d1d1db;
  font-size: 16px;
  line-height: 1.85;
  letter-spacing: 0.01em;
}

.markdown-content :deep(h1) {
  font-size: 28px;
  font-weight: 700;
  color: #fff;
  margin: 40px 0 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 235, 167, 0.1);
}

.markdown-content :deep(h2) {
  font-size: 24px;
  font-weight: 700;
  color: #ffeba7;
  margin: 36px 0 16px;
  padding-left: 14px;
  border-left: 3px solid #ffeba7;
}

.markdown-content :deep(h3) {
  font-size: 20px;
  font-weight: 600;
  color: #e8e8f0;
  margin: 28px 0 12px;
}

.markdown-content :deep(h4) {
  font-size: 17px;
  font-weight: 600;
  color: #d1d1db;
  margin: 24px 0 10px;
}

.markdown-content :deep(p) {
  margin: 14px 0;
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

.markdown-content :deep(strong) {
  color: #fff;
  font-weight: 600;
}

.markdown-content :deep(em) {
  color: #c4c3ca;
}

.markdown-content :deep(blockquote) {
  margin: 20px 0;
  padding: 16px 20px;
  border-left: 3px solid #ffeba7;
  background: rgba(255, 235, 167, 0.04);
  border-radius: 0 8px 8px 0;
  color: #b0b0c0;
  font-style: italic;
}

.markdown-content :deep(blockquote p) {
  margin: 0;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  margin: 14px 0;
  padding-left: 24px;
}

.markdown-content :deep(li) {
  margin: 6px 0;
  color: #d1d1db;
}

.markdown-content :deep(li::marker) {
  color: #ffeba7;
}

.markdown-content :deep(code) {
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(255, 235, 167, 0.08);
  color: #ffeba7;
  font-family: 'Fira Code', 'Consolas', 'Monaco', monospace;
  font-size: 0.9em;
}

.markdown-content :deep(pre) {
  margin: 20px 0;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid rgba(255, 235, 167, 0.1);
  position: relative;
}

.markdown-content :deep(pre code) {
  display: block;
  padding: 20px 24px;
  overflow-x: auto;
  background: #1a1b26 !important;
  color: #c0caf5;
  font-family: 'Fira Code', 'Consolas', 'Monaco', monospace;
  font-size: 14px;
  line-height: 1.7;
  border-radius: 0;
}

.markdown-content :deep(pre code::-webkit-scrollbar) {
  height: 6px;
}

.markdown-content :deep(pre code::-webkit-scrollbar-track) {
  background: transparent;
}

.markdown-content :deep(pre code::-webkit-scrollbar-thumb) {
  background: rgba(255, 235, 167, 0.2);
  border-radius: 3px;
}

.markdown-content :deep(pre code::-webkit-scrollbar-thumb:hover) {
  background: rgba(255, 235, 167, 0.3);
}

.markdown-content :deep(hr) {
  margin: 32px 0;
  border: none;
  height: 1px;
  background: linear-gradient(to right, transparent, rgba(255, 235, 167, 0.2), transparent);
}

.markdown-content :deep(img) {
  max-width: 100%;
  border-radius: 10px;
  margin: 20px 0;
  border: 1px solid rgba(255, 235, 167, 0.08);
}

.markdown-content :deep(table) {
  width: 100%;
  margin: 20px 0;
  border-collapse: collapse;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(255, 235, 167, 0.1);
}

.markdown-content :deep(th) {
  padding: 12px 16px;
  background: rgba(255, 235, 167, 0.06);
  color: #ffeba7;
  font-weight: 600;
  font-size: 13px;
  text-align: left;
  border-bottom: 1px solid rgba(255, 235, 167, 0.15);
}

.markdown-content :deep(td) {
  padding: 10px 16px;
  border-bottom: 1px solid rgba(255, 235, 167, 0.05);
  font-size: 14px;
  color: #d1d1db;
}

.markdown-content :deep(tr:last-child td) {
  border-bottom: none;
}

.markdown-content :deep(tr:hover td) {
  background: rgba(255, 235, 167, 0.02);
}

.article-footer {
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
  .article-hero {
    padding: 32px 24px;
    border-radius: 12px;
  }

  .article-title {
    font-size: 24px;
  }

  .markdown-content {
    font-size: 15px;
  }

  .markdown-content :deep(h1) {
    font-size: 24px;
  }

  .markdown-content :deep(h2) {
    font-size: 20px;
  }

  .markdown-content :deep(h3) {
    font-size: 17px;
  }

  .markdown-content :deep(pre code) {
    padding: 16px;
    font-size: 13px;
  }
}
</style>
