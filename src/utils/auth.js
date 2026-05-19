const getUser = () => {
  const userStr = localStorage.getItem('user')
  
  if (!userStr) {
    return null
  }

  try {
    return JSON.parse(userStr)
  } catch (e) {
    return null
  }
}

const isAdmin = () => {
  const user = getUser()
  return user && (user.is_admin === true || user.is_admin === 1)
}

const isGuest = () => {
  const user = getUser()
  return user && (user.is_guest === true || user.is_guest === 1)
}

const getUserName = () => {
  const user = getUser()
  return user ? user.user_name : ''
}

const clearUser = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

export default {
  getUser,
  isAdmin,
  isGuest,
  getUserName,
  clearUser
}