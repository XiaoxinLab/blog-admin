<template>
  <div class="md-editor">
    <!-- 工具条 -->
    <div class="md-toolbar">
      <button class="md-btn" type="button" title="粗体" @click="wrap('**', '**', '加粗文字')">
        <Bold :size="15" :stroke-width="1.5" />
      </button>
      <button class="md-btn" type="button" title="斜体" @click="wrap('*', '*', '斜体文字')">
        <Italic :size="15" :stroke-width="1.5" />
      </button>
      <button class="md-btn" type="button" title="标题" @click="prefix('## ')">
        <Heading :size="15" :stroke-width="1.5" />
      </button>
      <span class="md-divider"></span>
      <button class="md-btn" type="button" title="引用" @click="prefix('> ')">
        <Quote :size="15" :stroke-width="1.5" />
      </button>
      <button class="md-btn" type="button" title="无序列表" @click="prefix('- ')">
        <List :size="15" :stroke-width="1.5" />
      </button>
      <button class="md-btn" type="button" title="有序列表" @click="prefix('1. ')">
        <ListOrdered :size="15" :stroke-width="1.5" />
      </button>
      <button class="md-btn" type="button" title="代码块" @click="wrap('```\n', '\n```', 'code')">
        <Code :size="15" :stroke-width="1.5" />
      </button>
      <button class="md-btn" type="button" title="行内代码" @click="wrap('`', '`', 'code')">
        <FileCode :size="15" :stroke-width="1.5" />
      </button>
      <button class="md-btn" type="button" title="链接" @click="wrap('[', '](https://)', '链接文字')">
        <Link :size="15" :stroke-width="1.5" />
      </button>
      <button class="md-btn" type="button" title="分割线" @click="insertLine('---')">
        <Minus :size="15" :stroke-width="1.5" />
      </button>

      <div class="spacer"></div>

      <button class="md-btn md-toggle" type="button" @click="mode = mode === 'edit' ? 'preview' : 'edit'">
        <Eye v-if="mode === 'edit'" :size="14" :stroke-width="1.5" />
        <Pencil v-else :size="14" :stroke-width="1.5" />
        {{ mode === 'edit' ? '预览' : '编辑' }}
      </button>
    </div>

    <!-- 编辑区 -->
    <textarea
      v-show="mode === 'edit'"
      ref="textareaRef"
      class="md-textarea"
      :placeholder="placeholder"
      :value="modelValue"
      @input="onInput"
    ></textarea>

    <!-- 预览区 -->
    <div v-show="mode === 'preview'" class="md-preview markdown-body" v-html="rendered"></div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import {
  Bold,
  Code,
  Eye,
  FileCode,
  Heading,
  Italic,
  Link,
  List,
  ListOrdered,
  Minus,
  Pencil,
  Quote
} from 'lucide-vue-next'
import MarkdownIt from 'markdown-it'

const props = defineProps({
  // Markdown 原文
  modelValue: { type: String, default: '' },
  // 输入框里的提示文字
  placeholder: { type: String, default: '在这里写正文，支持 Markdown 语法' }
})

const emit = defineEmits(['update:modelValue'])

// 文本框引用
const textareaRef = ref(null)

// 当前是编辑模式还是预览模式
const mode = ref('edit')

// markdown-it 实例，用来把 Markdown 变成 HTML
const md = new MarkdownIt({ html: false, linkify: true, breaks: true })

/**
 * 渲染后的 HTML
 * @returns {string} 预览用的 HTML 字符串
 */
const rendered = computed(() => md.render(props.modelValue || ''))

/**
 * 输入框内容变化时通知父组件
 * @param {Event} event - 输入事件
 * @returns {void}
 */
function onInput(event) {
  emit('update:modelValue', event.target.value)
}

/**
 * 在光标位置插入带前后缀的内容
 * @param {string} before - 光标前插入的文字
 * @param {string} after - 光标后插入的文字
 * @param {string} placeholderText - 没有选中文字时的占位提示
 * @returns {void}
 */
function wrap(before, after, placeholderText) {
  const textarea = textareaRef.value
  if (!textarea) return
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selected = props.modelValue.slice(start, end) || placeholderText
  const next = props.modelValue.slice(0, start) + before + selected + after + props.modelValue.slice(end)
  emit('update:modelValue', next)
  requestAnimationFrame(() => {
    textarea.focus()
    const cursor = start + before.length + selected.length
    textarea.setSelectionRange(cursor, cursor)
  })
}

/**
 * 在光标所在行前面插入前缀
 * @param {string} prefixText - 要插入的行首文字
 * @returns {void}
 */
function prefix(prefixText) {
  const textarea = textareaRef.value
  if (!textarea) return
  const start = textarea.selectionStart
  const lineStart = props.modelValue.lastIndexOf('\n', start - 1) + 1
  const next = props.modelValue.slice(0, lineStart) + prefixText + props.modelValue.slice(lineStart)
  emit('update:modelValue', next)
  requestAnimationFrame(() => {
    textarea.focus()
    textarea.setSelectionRange(start + prefixText.length, start + prefixText.length)
  })
}

/**
 * 在光标位置插入一整块内容
 * @param {string} text - 要插入的文字
 * @returns {void}
 */
function insertLine(text) {
  const textarea = textareaRef.value
  if (!textarea) return
  const start = textarea.selectionStart
  const next = props.modelValue.slice(0, start) + text + '\n' + props.modelValue.slice(start)
  emit('update:modelValue', next)
  requestAnimationFrame(() => textarea.focus())
}
</script>

<style scoped>
.md-editor {
  border: 1px solid var(--line);
  border-radius: var(--radius-control);
  background: var(--bg-raised);
  overflow: hidden;
}

.md-toolbar {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: var(--space-1) var(--space-2);
  border-bottom: 1px solid var(--line);
  background: var(--bg-card);
  flex-wrap: wrap;
}

.md-btn {
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  border-radius: var(--radius-tag);
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: background-color var(--dur-fast) var(--ease), color var(--dur-fast) var(--ease);
}

.md-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
  border-color: var(--line);
}

.md-divider {
  width: 1px;
  height: 16px;
  background: var(--line);
  margin: 0 var(--space-1);
}

.md-toggle {
  width: auto;
  padding: 0 var(--space-2);
  gap: var(--space-1);
  font-size: 12px;
}

.md-textarea {
  width: 100%;
  min-height: 420px;
  padding: var(--space-4);
  border: none;
  background: transparent;
  color: var(--text-primary);
  font-family: var(--font-mono);
  font-size: 13px;
  line-height: 1.8;
  outline: none;
  resize: vertical;
}

.md-textarea::placeholder {
  color: var(--text-muted);
}

.md-preview {
  min-height: 420px;
  padding: var(--space-4) var(--space-5);
  overflow-x: auto;
  background: var(--bg-card);
}
</style>
