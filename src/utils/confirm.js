import { reactive } from 'vue'

// 全局确认框状态，ConfirmDialog 组件会监听它
export const confirmState = reactive({
  visible: false,
  message: '',
  confirmText: '确定',
  cancelText: '取消',
  // 存放本次确认框的回调
  resolver: null
})

/**
 * 弹出一个确认框，等用户在页面上点「确定」或「取消」
 * @param {string} message - 确认提示文案
 * @param {object} [options] - 可选配置
 * @param {string} [options.confirmText] - 确定按钮文字
 * @param {string} [options.cancelText] - 取消按钮文字
 * @returns {Promise<boolean>} 用户点确定返回 true，取消返回 false
 */
export function confirmDialog(message, options = {}) {
  return new Promise((resolve) => {
    confirmState.message = message
    confirmState.confirmText = options.confirmText || '确定'
    confirmState.cancelText = options.cancelText || '取消'
    confirmState.resolver = resolve
    confirmState.visible = true
  })
}

/**
 * 关闭确认框并把结果交回给调用方
 * @param {boolean} value - 用户的选择
 * @returns {void}
 */
export function resolveConfirm(value) {
  if (confirmState.resolver) {
    confirmState.resolver(value)
  }
  confirmState.resolver = null
  confirmState.visible = false
}
