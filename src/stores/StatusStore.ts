import { defineStore } from 'pinia'
import { ref } from 'vue'

export const getStatusStore = defineStore('statusStore', () => {
  const statusMessage = ref<string | undefined>('')
  const errorMessage = ref<string | undefined>('')
  const loading = ref<boolean>(false)
  const hasError = ref<boolean>(false)

  function clearErrorMessage () {
    errorMessage.value = ''
    hasError.value = false
  }

  function setError (msg: string) {
    hasError.value = true
    errorMessage.value = msg
  }

  function getErrorMessage (): string {
    return errorMessage.value!
  }

  return { statusMessage, clearErrorMessage, loading, hasError, setError, getErrorMessage }
})
