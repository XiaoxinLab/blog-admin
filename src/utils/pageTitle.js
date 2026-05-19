import { ref } from 'vue'

export const dynamicTitle = ref('')

export function setDynamicTitle(title) {
  dynamicTitle.value = title
}

export function clearDynamicTitle() {
  dynamicTitle.value = ''
}
