<template>
  <article class="entry" :class="{ fresh: isFresh }">
    <div class="entry-meta">
      <time class="entry-date mono">{{ formatDate(article.createdAt) }}</time>
      <span class="entry-dot">·</span>
      <span class="entry-category">{{ article.article_classification || '未分类' }}</span>
      <span class="entry-dot">·</span>
      <span class="entry-author">{{ article.article_author || '佚名' }}</span>
    </div>

    <h2 class="entry-title">{{ article.article_title }}</h2>

    <p v-if="excerpt" class="entry-excerpt">{{ excerpt }}</p>

    <div class="entry-foot">
      <div class="row">
        <button class="btn btn-sm" @click="$emit('edit', article)">
          <Pencil :size="13" :stroke-width="1.5" />
          编辑
        </button>
        <button class="btn btn-sm btn-danger" @click="$emit('remove', article)">
          <Archive :size="13" :stroke-width="1.5" />
          下架
        </button>
      </div>
      <span class="entry-id mono">#{{ article.id }}</span>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import { Archive, Pencil } from 'lucide-vue-next'
import { formatDate } from '@/utils/format'

const props = defineProps({
  // 文章数据
  article: { type: Object, required: true }
})

defineEmits(['edit', 'remove'])

/**
 * 这篇是不是今天刚发的
 * @returns {boolean} 今天发的返回 true
 */
const isFresh = computed(() => {
  const created = new Date(props.article.createdAt)
  if (Number.isNaN(created.getTime())) return false
  const today = new Date()
  return (
    created.getFullYear() === today.getFullYear() &&
    created.getMonth() === today.getMonth() &&
    created.getDate() === today.getDate()
  )
})

/**
 * 把正文里的 Markdown 标记去掉，截出一段当摘要
 * @returns {string} 摘要文字
 */
const excerpt = computed(() => {
  const raw = props.article.article_content || ''
  return raw
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[#>*_`~\-[\]()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 160)
})
</script>

<style scoped>
/* 一篇文章 = 一条记录。左边那条竖线是这套界面的记号：
   橙色 = 今天刚发出去的，深灰 = 更早的。 */
.entry {
  position: relative;
  padding: var(--space-4) var(--space-5) var(--space-4) var(--space-6);
  background: var(--bg-card);
  border: 1px solid var(--line);
  border-radius: var(--radius-card);
  transition: border-color var(--dur-base) var(--ease), background-color var(--dur-base) var(--ease);
}

.entry::before {
  content: '';
  position: absolute;
  left: 0;
  top: var(--space-4);
  bottom: var(--space-4);
  width: 2px;
  border-radius: 0 2px 2px 0;
  background: var(--line-strong);
  opacity: 0.45;
}

.entry.fresh::before {
  background: var(--accent);
  opacity: 1;
}

.entry:hover {
  border-color: var(--line-strong);
}

.entry-meta {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: var(--space-2);
  flex-wrap: wrap;
}

.entry-date {
  color: var(--text-secondary);
}

.entry-dot {
  color: var(--text-muted);
  opacity: 0.5;
}

.entry-category {
  color: var(--accent);
}

.entry-title {
  font-size: 17px;
  line-height: 1.4;
  font-weight: 600;
  letter-spacing: -0.01em;
  margin-bottom: var(--space-2);
  overflow-wrap: anywhere;
}

.entry-excerpt {
  font-size: 13px;
  line-height: 1.7;
  color: var(--text-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
}

.entry-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  margin-top: var(--space-3);
  padding-top: var(--space-3);
  border-top: 1px solid var(--line);
}

.entry-id {
  font-size: 11.5px;
  color: var(--text-muted);
}
</style>
