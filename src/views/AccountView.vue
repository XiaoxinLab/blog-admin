<template>
  <div class="page">
    <div class="page-head">
      <div>
        <h1 class="page-title">账号设置</h1>
        <p class="page-sub">查看当前登录账号信息，修改密码</p>
      </div>
    </div>

    <div class="account-grid">
      <!-- 左边：账号信息 -->
      <div class="card">
        <div class="card-head">
          <div class="card-title">当前登录账号</div>
        </div>
        <div class="card-body">
          <div class="info-row">
            <div class="info-label">用户名</div>
            <div class="info-value">{{ user?.user_name || '—' }}</div>
          </div>
          <div class="info-row">
            <div class="info-label">用户 ID</div>
            <div class="info-value mono">{{ user?.id ?? '—' }}</div>
          </div>
          <div class="info-row">
            <div class="info-label">手机号</div>
            <div class="info-value mono">{{ user?.user_phone || '—' }}</div>
          </div>
          <div class="info-row">
            <div class="info-label">身份</div>
            <div class="info-value">
              <span class="tag" :class="roleTag">{{ roleText }}</span>
            </div>
          </div>
          <div class="info-row">
            <div class="info-label">管理员权限</div>
            <div class="info-value">
              <span class="status">
                <span class="status-dot" :class="isAdmin() ? 'on' : 'off'"></span>
                {{ isAdmin() ? '有' : '没有' }}
              </span>
            </div>
          </div>
          <div class="info-row">
            <div class="info-label">游客账号</div>
            <div class="info-value">
              <span class="status">
                <span class="status-dot" :class="isGuest() ? 'warn' : 'off'"></span>
                {{ isGuest() ? '是' : '不是' }}
              </span>
            </div>
          </div>

          <div class="token-block">
            <div class="info-label" style="margin-bottom: var(--space-2)">登录令牌</div>
            <div class="token-text mono">{{ token || '没有令牌' }}</div>
            <div class="hint" style="margin-top: var(--space-2)">
              令牌有效期 1 天，过期后需要重新登录
            </div>
          </div>

          <button class="btn btn-block logout-btn" @click="handleLogout">
            <LogOut :size="15" :stroke-width="1.5" />
            退出登录
          </button>
        </div>
      </div>

      <!-- 右边：改密码 -->
      <div class="card">
        <div class="card-head">
          <div class="card-title">修改密码</div>
        </div>
        <div class="card-body">
          <div class="field">
            <label class="label" for="newpass">新密码 <span class="req">*</span></label>
            <input
              id="newpass"
              v-model="password"
              class="input"
              type="password"
              placeholder="输入新密码"
              autocomplete="new-password"
            />
          </div>

          <div class="field">
            <label class="label" for="confirmpass">再输入一遍 <span class="req">*</span></label>
            <input
              id="confirmpass"
              v-model="confirmPassword"
              class="input"
              type="password"
              placeholder="确认新密码"
              autocomplete="new-password"
            />
            <div v-if="errorText" class="save-error" style="margin-top: var(--space-3)">{{ errorText }}</div>
          </div>

          <button class="btn btn-primary btn-block" :class="{ 'is-loading': saving }" :disabled="saving" @click="handleChangePassword">
            <span v-if="saving" class="spinner"></span>
            <KeyRound v-else :size="14" :stroke-width="1.5" />
            {{ saving ? '提交中' : '修改密码' }}
          </button>

          <div class="note-box">
            <div class="note-title">改完之后</div>
            <ul>
              <li>改的是你这个账号自己的密码</li>
              <li>令牌不会因此失效，不用重新登录</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { KeyRound, LogOut } from 'lucide-vue-next'
import http from '@/utils/api'
import { getToken, getUser, isAdmin, isGuest, clearAuth } from '@/utils/auth'
import { toastError, toastSuccess } from '@/utils/toast'

// 当前登录用户
const router = useRouter()

// 当前登录用户
const user = ref(getUser())

// 当前令牌
const token = getToken()

// 新密码输入框
const password = ref('')

// 确认密码输入框
const confirmPassword = ref('')

// 是否正在提交
const saving = ref(false)

// 错误提示
const errorText = ref('')

/**
 * 当前身份的中文说明
 * @returns {string} 身份文字
 */
const roleText = computed(() => {
  if (!user.value) return '未登录'
  if (isAdmin()) return '管理员'
  if (isGuest()) return '游客'
  return '普通用户'
})

/**
 * 身份对应的标签样式
 * @returns {string} 标签的 class 名
 */
const roleTag = computed(() => {
  if (isAdmin()) return 'tag-success'
  if (isGuest()) return 'tag-warning'
  return 'tag-muted'
})

/**
 * 退出登录：清掉本地登录态并回到登录页
 * @returns {void}
 */
function handleLogout() {
  clearAuth()
  toastSuccess('已退出登录')
  router.replace('/login')
}

/**
 * 提交修改密码
 * @returns {Promise<void>} 提交流程结束后结束
 */
async function handleChangePassword() {
  errorText.value = ''

  if (!password.value) {
    errorText.value = '新密码不能为空'
    return
  }
  if (password.value.length < 6) {
    errorText.value = '新密码至少 6 位'
    return
  }
  if (password.value !== confirmPassword.value) {
    errorText.value = '两次输入的密码不一样'
    return
  }

  saving.value = true
  try {
    await http.patch('/user/', { user_password: password.value })
    toastSuccess('密码修改成功')
    password.value = ''
    confirmPassword.value = ''
  } catch (error) {
    errorText.value = error.message || '修改失败'
    toastError(error.message || '修改失败')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.account-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-5);
  align-items: start;
}

.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-3) 0;
  border-bottom: 1px solid var(--line);
}

.info-label {
  font-size: 13px;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.info-value {
  font-size: 13px;
  text-align: right;
  word-break: break-all;
}

.status {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-size: 13px;
  color: var(--text-secondary);
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-dot.on {
  background: var(--positive);
}

.status-dot.off {
  background: var(--text-muted);
}

.status-dot.warn {
  background: var(--caution);
}

.logout-btn {
  margin-top: var(--space-5);
}

.token-block {
  margin-top: var(--space-4);
  padding-top: var(--space-4);
  border-top: 1px solid var(--line);
}

.token-text {
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-control);
  background: var(--bg-raised);
  border: 1px solid var(--line);
  font-size: 11px;
  line-height: 18px;
  color: var(--text-secondary);
  word-break: break-all;
  max-height: 96px;
  overflow-y: auto;
}

.save-error {
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-control);
  background: var(--negative-soft);
  color: var(--negative);
  font-size: 13px;
}

.note-box {
  margin-top: var(--space-5);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-control);
  background: var(--bg-raised);
  border: 1px solid var(--line);
}

.note-title {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: var(--space-1);
}

.note-box ul {
  margin: 0;
  padding-left: 18px;
  font-size: 12px;
  line-height: 20px;
  color: var(--text-muted);
}

@media (max-width: 900px) {
  .account-grid {
    grid-template-columns: 1fr;
  }
}
</style>
