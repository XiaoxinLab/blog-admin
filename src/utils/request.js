import axios from 'axios'
import auth from './auth'

const TOKEN_EXPIRED_CODE = '10101'
const INVALID_TOKEN_CODE = '10102'
const AUTH_ERROR_CODES = [TOKEN_EXPIRED_CODE, INVALID_TOKEN_CODE]

let isRedirectingToLogin = false

const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

service.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

service.interceptors.response.use(
  response => {
    const res = response.data
    if (res.code !== undefined && res.code !== 0) {
      const isTokenError = AUTH_ERROR_CODES.includes(res.code)
      const isAdmin = auth.isAdmin()

      if (isTokenError && isAdmin) {
        if (!isRedirectingToLogin) {
          isRedirectingToLogin = true
          auth.clearUser()
          alert('登录已过期，请重新登录')
          window.location.href = '/admin/login'
        }
        return Promise.reject(new Error(res.message || '请求失败'))
      }

      if (isTokenError && !isAdmin) {
        return Promise.reject(new Error(res.message || '请求失败'))
      }

      console.warn('API警告:', res.message)
      if (!response.config.url.includes('/dictionary/')) {
        alert(res.message || '请求失败')
      }
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    return res
  },
  error => {
    console.error('响应错误:', error)
    if (error.response) {
      const resBody = error.response.data || {}
      const isTokenError = resBody.code && AUTH_ERROR_CODES.includes(resBody.code)
      const isAdmin = auth.isAdmin()

      if (isTokenError) {
        if (isAdmin && !isRedirectingToLogin) {
          isRedirectingToLogin = true
          auth.clearUser()
          alert('登录已过期，请重新登录')
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }

      switch (error.response.status) {
        case 401:
          if (isAdmin && !isRedirectingToLogin) {
            isRedirectingToLogin = true
            auth.clearUser()
            alert('登录已过期，请重新登录')
            window.location.href = '/login'
          }
          break
        case 403:
          alert('拒绝访问，权限不足')
          break
        case 404:
          alert('请求的资源不存在')
          break
        case 500:
          alert('服务器内部错误')
          break
        default:
          alert(error.response.data?.message || '网络错误')
      }
    } else {
      alert('网络连接失败，请检查网络')
    }
    return Promise.reject(error)
  }
)

export default service