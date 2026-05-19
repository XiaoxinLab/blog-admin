import auth from '../utils/auth'

const permission = {
  mounted(el, binding) {
    const { value } = binding

    if (!auth.getUser()) {
      el.parentNode && el.parentNode.removeChild(el)
      return
    }

    const isAdmin = auth.isAdmin()

    if (value === 'admin' && !isAdmin) {
      if (binding.modifiers.disabled) {
        el.setAttribute('disabled', 'true')
        el.style.pointerEvents = 'none'
        el.style.opacity = '0.4'
        el.style.cursor = 'not-allowed'
        el._originalTitle = el.title
        el.title = '仅管理员可操作'

        if (el.tagName === 'A') {
          el.style.textDecoration = 'none'
          el.onclick = (e) => {
            e.preventDefault()
            e.stopPropagation()
            return false
          }
        }
      } else {
        el.parentNode && el.parentNode.removeChild(el)
      }
    }

    if (value === 'guest' && isAdmin) {
      el.parentNode && el.parentNode.removeChild(el)
    }
  },

  updated(el, binding) {
    permission.mounted(el, binding)
  }
}

export default permission