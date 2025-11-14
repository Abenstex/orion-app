import { defineStore } from 'pinia'
import { ref } from 'vue'

export const getStatusStore = defineStore('statusStore', () => {
    let statusMessage = ref<string | undefined>('')
    let errorMessage = ref<string | undefined>('')
    let loading = ref<boolean>(false)
    let hasError = ref<boolean>(false)

    function clearErrorMessage() {
        errorMessage.value = '';
        hasError.value = false;
    }

    function setError(msg: string) {
        hasError.value = true;
        errorMessage.value = msg;
    }

    function getErrorMessage(): string {
        return errorMessage.value!;
    }

    return { statusMessage, clearErrorMessage, loading, hasError, setError, getErrorMessage }
})