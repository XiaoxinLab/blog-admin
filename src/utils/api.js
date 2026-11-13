import axios from 'axios'
import { getToken, clearAuth } from './auth'

/**
 * 统一的接口错误对象
 * 说明：后端在业务出错时依然返回 HTTP 200，靠响应体里的 code 区分，
 * 所以这里把后端的错误码一起带出来，方便页面按需处理。
 */
export class ApiError extends Error {
  /**
   * 创建一个接口错误
   * @param {string} message - 错误提示文案，直接来自后端返回的 message
   * @param {string} code - 后端业务错误码；网络异常时为 HTTP 状态码或 NETWORK_ERROR
   */
  constructor(message, code) {
    super(message)
    this.name = 'ApiError'
    this.code = code
  }
}

// token 失效的两个错误码：token 过期 / token 无效
const AUTH_ERROR_CODES = ['10101', '10102']

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://qisui.asia/request',
  timeout: 30000
})

// 请求拦截：自动带上 JWT 令牌
http.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截：统一处理后端错误码
http.interceptors.response.use(
  (response) => {
    const body = response.data
    // 只有当响应体是带 code 字段的对象时才做业务判断
    if (body && typeof body === 'object' && 'code' in body && Number(body.code) !== 0) {
      const code = String(body.code)
      if (AUTH_ERROR_CODES.includes(code)) {
        // 令牌过期或无效，清掉本地登录态并送回登录页
        clearAuth()
        if (!window.location.hash.startsWith('#/login')) {
          window.location.hash = '#/login'
        }
      }
      throw new ApiError(body.message || '请求失败', code)
    }
    return body
  },
  (error) => {
    const status = error.response?.status
    if (status === 401) {
      clearAuth()
      if (!window.location.hash.startsWith('#/login')) {
        window.location.hash = '#/login'
      }
    }
    const message = error.response?.data?.message || error.message || '网络异常，请稍后重试'
    throw new ApiError(message, status ? String(status) : 'NETWORK_ERROR')
  }
)

export default http
