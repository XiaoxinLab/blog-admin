<template>
  <div class="page">
    <div class="page-head">
      <div>
        <h1 class="page-title">{{ isEdit ? '修改项目' : '建项目' }}</h1>
        <p class="page-sub">{{ isEdit ? `正在改 ID 为 ${projectId} 的项目` : '填好下面的信息然后保存' }}</p>
      </div>
      <div class="row">
        <router-link to="/projects" class="btn btn-ghost">返回列表</router-link>
        <button class="btn btn-primary" :class="{ 'is-loading': saving }" :disabled="saving" @click="handleSave">
          <span v-if="saving" class="spinner"></span>
          <Save v-else :size="14" :stroke-width="1.5" />
          {{ saving ? '保存中' : '保存' }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="card">
      <div class="card-body">
        <SkeletonBlock variant="rows" :rows="5" :cols="2" />
      </div>
    </div>

    <div v-else class="edit-grid">
      <!-- 左边：基本信息 -->
      <div class="card">
        <div class="card-head">
          <div class="card-title">基本信息</div>
        </div>
        <div class="card-body">
          <div class="field">
            <label class="label" for="pname">项目名称 <span class="req">*</span></label>
            <input id="pname" v-model.trim="form.project_name" class="input" placeholder="例如：个人博客系统" />
          </div>

          <div class="field">
            <label class="label" for="pdesc">项目描述 <span class="req">*</span></label>
            <textarea id="pdesc" v-model.trim="form.project_desc" class="textarea" rows="4" placeholder="简单讲讲这个项目是干什么的"></textarea>
          </div>

          <div class="field-row">
            <div class="field">
              <label class="label" for="ptype">项目类型 <span class="req">*</span></label>
              <input id="ptype" v-model.trim="form.project_type" class="input" placeholder="Web / App / 小程序" />
            </div>
            <div class="field">
              <label class="label" for="pyear">年份 <span class="req">*</span></label>
              <input id="pyear" v-model.trim="form.project_year" class="input" placeholder="2026" />
            </div>
          </div>

          <div class="field">
            <label class="label">技术栈</label>
            <div class="tech-input">
              <span v-for="(tech, index) in form.project_techs" :key="`${tech}-${index}`" class="tech-chip">
                {{ tech }}
                <button class="chip-remove" type="button" @click="removeTech(index)">
                  <X :size="12" :stroke-width="1.5" />
                </button>
              </span>
              <input
                v-model="techInput"
                class="tech-field"
                placeholder="输入后按回车添加"
                @keydown.enter.prevent="addTech"
                @keydown.delete="removeTechByBackspace"
              />
            </div>
            <div class="hint">回车添加一项</div>
          </div>

          <div class="field" style="margin-bottom: 0">
            <label class="label">项目图片</label>
            <ImageUploader v-model="form.project_image" upload-url="/project/upload" response-field="project_image" />
          </div>
        </div>
      </div>

      <!-- 右边：链接和开关 -->
      <div class="card">
        <div class="card-head">
          <div class="card-title">链接与展示</div>
        </div>
        <div class="card-body">
          <div class="field">
            <label class="label" for="pdemo">演示地址</label>
            <input id="pdemo" v-model.trim="form.project_demo" class="input" placeholder="https://demo.example.com" />
            <label class="switch" style="margin-top: var(--space-2)">
              <input v-model="form.show_demo" type="checkbox" />
              <span class="switch-track"></span>
              <span style="font-size: 13px">前台显示演示按钮</span>
            </label>
          </div>

          <div class="field">
            <label class="label" for="pgh">GitHub 地址</label>
            <input id="pgh" v-model.trim="form.project_github" class="input" placeholder="https://github.com/xxx/yyy" />
            <label class="switch" style="margin-top: var(--space-2)">
              <input v-model="form.show_github" type="checkbox" />
              <span class="switch-track"></span>
              <span style="font-size: 13px">前台显示源码按钮</span>
            </label>
          </div>

          <div class="field">
            <label class="label">游客体验账号</label>
            <input
              v-model.trim="guestForm.username"
              class="input"
              style="margin-bottom: var(--space-2)"
              placeholder="用户名，可留空"
            />
            <input
              v-model="guestForm.password"
              class="input"
              type="password"
              placeholder="密码，可留空"
            />
            <div class="hint">两项都留空表示不提供体验账号</div>
          </div>

          <div v-if="errorText" class="save-error">{{ errorText }}</div>

          <button class="btn btn-primary btn-block" :class="{ 'is-loading': saving }" :disabled="saving" @click="handleSave">
            <span v-if="saving" class="spinner"></span>
            {{ saving ? '保存中' : isEdit ? '保存修改' : '创建项目' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Save, X } from 'lucide-vue-next'
import http from '@/utils/api'
import { toastError, toastSuccess } from '@/utils/toast'
import ImageUploader from '@/components/ImageUploader.vue'
import SkeletonBlock from '@/components/SkeletonBlock.vue'

const route = useRoute()
const router = useRouter()

// 当前编辑的项目 ID
const projectId = computed(() => route.params.id || '')

// 是不是修改已有项目
const isEdit = computed(() => Boolean(projectId.value))

// 表单数据
const form = reactive({
  project_name: '',
  project_desc: '',
  project_type: '',
  project_year: String(new Date().getFullYear()),
  project_techs: [],
  project_image: '',
  project_demo: '',
  project_github: '',
  show_demo: true,
  show_github: true
})

// 游客账号表单
const guestForm = reactive({
  username: '',
  password: ''
})

// 添加技术栈时用的输入框
const techInput = ref('')

// 是否正在加载
const loading = ref(false)

// 是否正在保存
const saving = ref(false)

// 保存失败提示
const errorText = ref('')

/**
 * 校验表单
 * @returns {boolean} 校验通过返回 true
 */
function validate() {
  if (!form.project_name) {
    errorText.value = '项目名称不能为空'
    return false
  }
  if (!form.project_desc) {
    errorText.value = '项目描述不能为空'
    return false
  }
  if (!form.project_type) {
    errorText.value = '项目类型不能为空'
    return false
  }
  if (!form.project_year) {
    errorText.value = '年份不能为空'
    return false
  }
  errorText.value = ''
  return true
}

/**
 * 把输入框里的文字加进技术栈列表
 * @returns {void}
 */
function addTech() {
  const value = techInput.value.trim()
  if (!value) return
  if (!form.project_techs.includes(value)) {
    form.project_techs.push(value)
  }
  techInput.value = ''
}

/**
 * 删除第几个技术栈
 * @param {number} index - 要删除的下标
 * @returns {void}
 */
function removeTech(index) {
  form.project_techs.splice(index, 1)
}

/**
 * 输入框为空时按退格，删掉最后一个技术栈
 * @returns {void}
 */
function removeTechByBackspace() {
  if (!techInput.value && form.project_techs.length) {
    form.project_techs.pop()
  }
}

/**
 * 拉取项目详情
 * @returns {Promise<void>} 数据加载结束后结束
 */
async function loadProject() {
  if (!isEdit.value) return
  loading.value = true
  try {
    const res = await http.get(`/project/findOne/${projectId.value}`)
    const data = res?.result || {}
    form.project_name = data.project_name || ''
    form.project_desc = data.project_desc || ''
    form.project_type = data.project_type || ''
    form.project_year = data.project_year || ''
    form.project_image = data.project_image || ''
    form.project_demo = data.project_demo || ''
    form.project_github = data.project_github || ''
    form.show_demo = data.show_demo === true || data.show_demo === 1
    form.show_github = data.show_github === true || data.show_github === 1

    // 技术栈可能是数组，也可能是 JSON 字符串
    if (Array.isArray(data.project_techs)) {
      form.project_techs = [...data.project_techs]
    } else if (typeof data.project_techs === 'string') {
      try {
        const parsed = JSON.parse(data.project_techs)
        form.project_techs = Array.isArray(parsed) ? parsed : []
      } catch (error) {
        form.project_techs = []
      }
    } else {
      form.project_techs = []
    }

    // 游客账号
    const guest = data.guest_account
    if (guest && typeof guest === 'object') {
      guestForm.username = guest.username || ''
      guestForm.password = guest.password || ''
    }
  } catch (error) {
    toastError(error.message || '项目详情加载失败')
  } finally {
    loading.value = false
  }
}

/**
 * 保存项目
 * @returns {Promise<void>} 保存流程结束后结束
 */
async function handleSave() {
  if (!validate()) return

  saving.value = true
  try {
    const payload = {
      project_name: form.project_name,
      project_desc: form.project_desc,
      project_type: form.project_type,
      project_year: form.project_year,
      project_techs: form.project_techs,
      project_image: form.project_image || null,
      project_demo: form.project_demo || null,
      project_github: form.project_github || null,
      show_demo: form.show_demo,
      show_github: form.show_github,
      guest_account:
        guestForm.username || guestForm.password
          ? { username: guestForm.username, password: guestForm.password }
          : null
    }

    if (isEdit.value) {
      await http.put(`/project/${projectId.value}`, payload)
      toastSuccess('项目修改成功')
    } else {
      await http.post('/project/', payload)
      toastSuccess('项目创建成功')
    }
    router.push('/projects')
  } catch (error) {
    errorText.value = error.message || '保存失败'
    toastError(error.message || '保存失败')
  } finally {
    saving.value = false
  }
}

onMounted(loadProject)
</script>

<style scoped>
.edit-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(300px, 1fr);
  gap: var(--space-5);
  align-items: start;
}

.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
}

.tech-input {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
  align-items: center;
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--line);
  border-radius: var(--radius-control);
  background: var(--bg-raised);
  min-height: 40px;
}

.tech-input:focus-within {
  border-color: var(--accent);
}

.tech-chip {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: 2px var(--space-1) 2px var(--space-2);
  border-radius: var(--radius-tag);
  background: var(--accent-soft);
  color: var(--accent);
  font-size: 12px;
}

.chip-remove {
  border: none;
  background: transparent;
  color: inherit;
  cursor: pointer;
  display: inline-flex;
  padding: 0;
  opacity: 0.7;
  border-radius: 2px;
}

.chip-remove:hover {
  opacity: 1;
}

.tech-field {
  flex: 1;
  min-width: 136px;
  border: none;
  outline: none;
  background: transparent;
  color: var(--text-primary);
  font-size: 13px;
}

.save-error {
  margin-bottom: var(--space-3);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-control);
  background: var(--negative-soft);
  color: var(--negative);
  font-size: 13px;
}

@media (max-width: 1100px) {
  .edit-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 560px) {
  .field-row {
    grid-template-columns: 1fr;
  }
}
</style>
