<template>
  <div class="uploader">
    <!-- 已经传过文件：显示缩略图和操作按钮 -->
    <div v-if="modelValue" class="preview">
      <img :src="previewUrl" :alt="modelValue" class="preview-img" @error="onImageError" />
      <div class="preview-info">
        <div class="preview-name mono" :title="modelValue">{{ modelValue }}</div>
        <div class="row">
          <button class="btn btn-sm" :disabled="uploading" @click="pickFile">
            <RotateCw :size="14" :stroke-width="1.5" />
            重新上传
          </button>
          <button class="btn btn-sm btn-danger" :disabled="uploading" @click="remove">
            <Trash2 :size="14" :stroke-width="1.5" />
            移除
          </button>
        </div>
      </div>
    </div>

    <!-- 还没传过文件：显示上传入口 -->
    <button v-else class="dropzone" type="button" :disabled="uploading" @click="pickFile">
      <span v-if="uploading" class="spinner"></span>
      <ImageUp v-else :size="20" :stroke-width="1.5" />
      <span class="dropzone-text">{{ uploading ? '正在上传' : '选择图片上传' }}</span>
      <span class="dropzone-hint">{{ hint }}</span>
    </button>

    <!-- 隐藏的文件选择框 -->
    <input ref="fileInput" type="file" class="hidden-input" :accept="accept" @change="onFileChange" />

    <div v-if="errorText" class="upload-error">{{ errorText }}</div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { ImageUp, RotateCw, Trash2 } from 'lucide-vue-next'
import http from '@/utils/api'
import { toastSuccess } from '@/utils/toast'

const props = defineProps({
  // 当前已上传的文件名（后端存的就是文件名，不是完整网址）
  modelValue: { type: String, default: '' },
  // 上传接口地址，例如 /article/upload
  uploadUrl: { type: String, required: true },
  // 从响应里取文件名的字段名，文章是 article_img，项目是 project_image
  responseField: { type: String, default: 'article_img' },
  // 允许的文件类型
  accept: { type: String, default: 'image/jpeg,image/png' },
  // 下方提示文字
  hint: { type: String, default: 'JPG 或 PNG' }
})

const emit = defineEmits(['update:modelValue', 'uploaded'])

// 文件选择框
const fileInput = ref(null)

// 是否正在上传
const uploading = ref(false)

// 上传失败的提示
const errorText = ref('')

// 接口根地址，用于拼预览图地址
const apiBase = import.meta.env.VITE_API_BASE_URL || 'https://qisui.asia/request'

/**
 * 图片预览地址
 * @returns {string} 完整可访问的图片网址
 */
const previewUrl = computed(() => {
  if (!props.modelValue) return ''
  if (props.modelValue.startsWith('http')) return props.modelValue
  return `${apiBase}/${props.modelValue}`
})

/**
 * 打开系统文件选择框
 * @returns {void}
 */
function pickFile() {
  errorText.value = ''
  fileInput.value?.click()
}

/**
 * 选定文件后的处理：先本地校验类型，再调上传接口
 * @param {Event} event - 文件选择框的 change 事件
 * @returns {Promise<void>} 上传结束后结束
 */
async function onFileChange(event) {
  const file = event.target.files?.[0]
  // 清空选择框的值，保证同一个文件可以再次选择
  event.target.value = ''
  if (!file) return

  const allowed = props.accept.split(',').map((item) => item.trim())
  if (allowed.length && !allowed.includes(file.type)) {
    errorText.value = `文件类型不支持，只允许 ${allowed.join(' / ')}`
    return
  }

  uploading.value = true
  errorText.value = ''
  try {
    const formData = new FormData()
    // 字段名必须是 file，这是后端写死的要求
    formData.append('file', file)

    const res = await http.post(props.uploadUrl, formData)
    const filename = res?.result?.[props.responseField] || ''
    if (!filename) {
      errorText.value = '上传成功但没有返回文件名'
      return
    }
    emit('update:modelValue', filename)
    emit('uploaded', filename)
    toastSuccess('图片上传成功')
  } catch (error) {
    errorText.value = error.message || '上传失败'
  } finally {
    uploading.value = false
  }
}

/**
 * 移除当前已选图片
 * @returns {void}
 */
function remove() {
  emit('update:modelValue', '')
}

/**
 * 图片加载失败时的提示（比如文件在服务器上已被删掉）
 * @returns {void}
 */
function onImageError() {
  errorText.value = '图片打不开，可能已经被服务器删除'
}
</script>

<style scoped>
.uploader {
  width: 100%;
}

.hidden-input {
  display: none;
}

.dropzone {
  width: 100%;
  min-height: 112px;
  border: 1px dashed var(--line-strong);
  border-radius: var(--radius-control);
  background: var(--bg-raised);
  color: var(--text-secondary);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-1);
  cursor: pointer;
  transition: border-color var(--dur-fast) var(--ease), color var(--dur-fast) var(--ease);
}

.dropzone:hover:not(:disabled) {
  border-color: var(--accent);
  color: var(--accent);
}

.dropzone:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.dropzone-text {
  font-size: 13px;
  margin-top: var(--space-1);
}

.dropzone-hint {
  font-size: 12px;
  color: var(--text-muted);
}

.preview {
  display: flex;
  gap: var(--space-4);
  align-items: flex-start;
  padding: var(--space-3);
  border: 1px solid var(--line);
  border-radius: var(--radius-control);
  background: var(--bg-raised);
}

.preview-img {
  width: 112px;
  height: 72px;
  object-fit: cover;
  border-radius: var(--radius-tag);
  background: var(--bg-card);
  flex-shrink: 0;
}

.preview-info {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.preview-name {
  font-size: 12px;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 320px;
}

.upload-error {
  margin-top: var(--space-2);
  font-size: 12px;
  color: var(--negative);
}
</style>
