<template>
  <a-modal
    v-model:open="visible"
    title="请输入密码"
    :closable="false"
    :maskClosable="false"
    ok-text="确定"
    cancel-text="取消"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <a-input-password
      v-model:value="password"
      placeholder="请输入操作密码"
      @pressEnter="handleOk"
      ref="passwordInput"
    />
    <div v-if="errorMessage" style="color: red; margin-top: 8px;">
      {{ errorMessage }}
    </div>
  </a-modal>
</template>

<script>
import { ref, watch, nextTick } from 'vue'

export default {
  name: 'PasswordModal',
  props: {
    open: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:open', 'success', 'cancel'],
  setup(props, { emit }) {
    const visible = ref(props.open)
    const password = ref('')
    const errorMessage = ref('')
    const passwordInput = ref(null)
    const CORRECT_PASSWORD = 'Aa123456'
    
    watch(() => props.open, (newVal) => {
      visible.value = newVal
      if (newVal) {
        password.value = ''
        errorMessage.value = ''
        // 自动聚焦到输入框
        nextTick(() => {
          passwordInput.value?.focus()
        })
      }
    })
    
    watch(visible, (newVal) => {
      emit('update:open', newVal)
    })
    
    const handleOk = () => {
      if (!password.value) {
        errorMessage.value = '请输入密码'
        return
      }
      
      if (password.value === CORRECT_PASSWORD) {
        errorMessage.value = ''
        visible.value = false
        emit('success')
      } else {
        errorMessage.value = '密码错误，请重试'
        password.value = ''
      }
    }
    
    const handleCancel = () => {
      visible.value = false
      emit('cancel')
    }
    
    return {
      visible,
      password,
      errorMessage,
      passwordInput,
      handleOk,
      handleCancel
    }
  }
}
</script>
