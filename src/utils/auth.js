// 本地登录态存储的 key 名
const TOKEN_KEY = 'blog_admin_token'
const USER_KEY = 'blog_admin_user'

/**
 * 读取本地保存的 JWT 令牌
 * @returns {string} 令牌字符串，未登录时返回空字符串
 */
export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || ''
}

/**
 * 保存 JWT 令牌到本地
 * @param {string} token - 登录接口返回的令牌
 * @returns {void}
 */
export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

/**
 * 读取本地保存的用户信息
 * @returns {object|null} 用户对象，未登录时返回 null
 */
export function getUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null')
  } catch (error) {
    return null
  }
}

/**
 * 保存用户信息到本地
 * @param {object} user - 登录接口返回的 res 字段
 * @returns {void}
 */
export function setUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

/**
 * 清除登录态（令牌 + 用户信息）
 * @returns {void}
 */
export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

/**
 * 判断当前是否已登录
 * @returns {boolean} 有令牌视为已登录
 */
export function isLoggedIn() {
  return Boolean(getToken())
}

/**
 * 判断当前用户是不是管理员
 * 说明：只是前端展示用的判断，真正的权限校验永远由服务端做
 * @returns {boolean} 是管理员返回 true
 */
export function isAdmin() {
  const user = getUser()
  if (!user) return false
  return user.is_admin === true || user.is_admin === 1
}

/**
 * 判断当前用户是不是游客账号
 * @returns {boolean} 是游客返回 true
 */
export function isGuest() {
  const user = getUser()
  if (!user) return false
  return user.is_guest === true || user.is_guest === 1
}

/**
 * 解码 JWT 令牌的载荷部分
 * 说明：这里只做解码展示，不做签名校验，权限仍以服务端为准
 * @param {string} token - JWT 令牌
 * @returns {object|null} 载荷对象，解不开时返回 null
 */
export function decodeToken(token) {
  try {
    const payload = token.split('.')[1]
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const text = decodeURIComponent(
      atob(base64)
        .split('')
        .map((char) => '%' + char.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
    )
    return JSON.parse(text)
  } catch (error) {
    return null
  }
}
