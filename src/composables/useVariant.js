import { ref } from 'vue'

// 本地存储用的 key
const THEME_KEY = 'blog_admin_theme'

/**
 * 主题：dark 或 light
 */
const theme = ref(localStorage.getItem(THEME_KEY) || 'dark')

/**
 * 把主题写到 html 标签上，CSS 靠这个属性切换
 * @returns {void}
 */
function applyToDocument() {
  const root = document.documentElement
  root.setAttribute('data-theme', theme.value)
  // 让浏览器自带的滚动条和输入框也跟着切主题
  root.style.colorScheme = theme.value
}

/**
 * 切换白天 / 黑夜
 * @param {string} next - light 或 dark
 * @returns {void}
 */
export function setTheme(next) {
  theme.value = next
  localStorage.setItem(THEME_KEY, next)
  applyToDocument()
}

/**
 * 拿到主题相关的状态和方法
 * @returns {object} 主题状态与操作方法
 */
export function useVariant() {
  return {
    theme,
    setTheme,
    applyToDocument
  }
}
