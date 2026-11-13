<template>
  <div class="login-page">
    <div class="login-box">
      <div class="login-brand">
        <span class="brand-logo">B</span>
        <span>Blog 后台</span>
      </div>

      <h1 class="login-title">登录</h1>
      <p class="login-sub">用管理员账号继续，管理文章、项目和分类</p>

      <form class="login-form" @submit.prevent="handleLogin">
        <div class="field">
          <label class="label" for="username">用户名</label>
          <input
            id="username"
            v-model.trim="form.user_name"
            class="input"
            type="text"
            placeholder="请输入用户名"
            autocomplete="username"
            spellcheck="false"
            required
          />
        </div>

        <div class="field">
          <label class="label" for="password">密码</label>
          <input
            id="password"
            v-model="form.user_password"
            class="input"
            type="password"
            placeholder="请输入密码"
            autocomplete="current-password"
            required
          />
        </div>

        <!-- 出错时把话说明白，并告诉用户下一步 -->
        <div v-if="errorText" class="login-error" role="alert">
          {{ errorText }}
          <div class="login-error-hint">
            忘记密码的话，找服务器上装了 blog-server 的那台机器拿管理员密码
          </div>
        </div>

        <button class="btn btn-primary btn-block login-btn" type="submit" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          {{ loading ? '正在登录' : '登录' }}
        </button>
      </form>

      <p class="login-foot">默认账号写在项目的 API 文档里，登录后建议改成自己的密码</p>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import http from '@/utils/api'
import { setToken, setUser } from '@/utils/auth'

const route = useRoute()
const router = useRouter()

// 表单数据
const form = reactive({
  user_name: '',
  user_password: ''
})

// 是否正在提交
const loading = ref(false)

// 登录失败时的错误提示
const errorText = ref('')

/**
 * 提交登录表单
 * @returns {Promise<void>} 登录流程结束后结束
 */
async function handleLogin() {
  errorText.value = ''

  if (!form.user_name || !form.user_password) {
    errorText.value = '用户名和密码都要填'
    return
  }

  loading.value = true
  try {
    const res = await http.post('/user/login', {
      user_name: form.user_name,
      user_password: form.user_password
    })
    const token = res?.result?.token
    const user = res?.result?.res
    if (!token) {
      errorText.value = '登录失败，服务端没有返回令牌'
      return
    }
    setToken(token)
    setUser(user || {})
    // 登录前想去哪就回哪，没指定就回仪表盘
    const redirect = route.query.redirect || '/'
    router.replace(String(redirect))
  } catch (error) {
    errorText.value = error.message || '登录失败，请重试'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* 登录页：整屏居中一张卡片 */
.login-page {
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-6);
  background-color: var(--bg-page);
}

.login-box {
  width: 100%;
  max-width: 380px;
  padding: var(--space-8);
  background: var(--bg-card);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-float);
}

.login-brand {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-size: 14px;
  font-weight: 600;
  margin-bottom: var(--space-8);
}

.login-title {
  font-size: 22px;
  font-weight: 600;
  letter-spacing: -0.015em;
}

.login-sub {
  color: var(--text-secondary);
  font-size: 13px;
  margin-top: var(--space-2);
  margin-bottom: var(--space-6);
}

.login-btn {
  height: 38px;
}

.login-error {
  margin-bottom: var(--space-4);
  padding: var(--space-3);
  border-radius: var(--radius-control);
  background: var(--negative-soft);
  color: var(--negative);
  font-size: 13px;
}

.login-error-hint {
  margin-top: var(--space-2);
  color: var(--text-secondary);
  font-size: 11.5px;
  line-height: 1.6;
}

.login-foot {
  margin-top: var(--space-6);
  padding-top: var(--space-4);
  border-top: 1px solid var(--line);
  font-size: 11.5px;
  line-height: 1.6;
  color: var(--text-muted);
}
</style>
