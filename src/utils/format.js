/**
 * 把后端返回的时间字符串格式化成「2026-11-12」这种形式
 * @param {string|number|Date} value - 时间值
 * @returns {string} 格式化后的日期，解析失败返回空字符串
 */
export function formatDate(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/**
 * 把后端返回的时间字符串格式化成「2026-11-12 15:04:05」这种形式
 * @param {string|number|Date} value - 时间值
 * @returns {string} 格式化后的日期时间，解析失败返回空字符串
 */
export function formatDateTime(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${formatDate(value)} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

/**
 * 把文件名截断到指定长度，超长部分用省略号代替
 * @param {string} text - 原始文本
 * @param {number} max - 允许的最大长度
 * @returns {string} 截断后的文本
 */
export function truncate(text, max = 30) {
  const str = String(text ?? '')
  return str.length > max ? str.slice(0, max) + '…' : str
}

/**
 * 把字节数转成便于阅读的大小文字
 * @param {number} bytes - 字节数
 * @returns {string} 例如 1.2 MB
 */
export function formatFileSize(bytes) {
  const size = Number(bytes) || 0
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / 1024 / 1024).toFixed(1)} MB`
}
