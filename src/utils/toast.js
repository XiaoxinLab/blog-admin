import { reactive } from 'vue'

// 全局提示列表，ToastHost 组件会把它渲染到页面上
export const toastList = reactive([])

// 自增的提示编号，用来定位并删除指定提示
let seed = 0

/**
 * 弹出一条全局提示
 * @param {string} message - 提示文案
 * @param {string} type - 提示类型，可选 info / success / error
 * @param {number} duration - 自动消失的毫秒数
 * @returns {number} 本条提示的编号
 */
export function pushToast(message, type = 'info', duration = 3200) {
  const id = ++seed
  toastList.push({ id, message, type })
  window.setTimeout(() => {
    const index = toastList.findIndex((item) => item.id === id)
    if (index > -1) toastList.splice(index, 1)
  }, duration)
  return id
}

/**
 * 弹出一条成功提示
 * @param {string} message - 提示文案
 * @returns {number} 本条提示的编号
 */
export function toastSuccess(message) {
  return pushToast(message, 'success')
}

/**
 * 弹出一条错误提示
 * @param {string} message - 提示文案
 * @returns {number} 本条提示的编号
 */
export function toastError(message) {
  return pushToast(message, 'error', 4500)
}

/**
 * 弹出一条普通提示
 * @param {string} message - 提示文案
 * @returns {number} 本条提示的编号
 */
export function toastInfo(message) {
  return pushToast(message, 'info')
}
