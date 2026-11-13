<template>
  <transition name="fade">
    <div v-if="confirmState.visible" class="modal-mask" @click.self="cancel">
      <div class="modal">
        <div class="modal-title">请确认</div>
        <div class="modal-text">{{ confirmState.message }}</div>
        <div class="modal-foot">
          <button class="btn" @click="cancel">{{ confirmState.cancelText }}</button>
          <button class="btn btn-primary" @click="ok">{{ confirmState.confirmText }}</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { confirmState, resolveConfirm } from '@/utils/confirm'

/**
 * 用户点了「确定」
 * @returns {void}
 */
function ok() {
  resolveConfirm(true)
}

/**
 * 用户点了「取消」或点了遮罩
 * @returns {void}
 */
function cancel() {
  resolveConfirm(false)
}
</script>
