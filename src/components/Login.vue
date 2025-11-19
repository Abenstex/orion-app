<template>
  <v-form v-model="form" class="pa-5" @submit.prevent="onSubmit">
    <v-text-field
      v-model="userName"
      clearable
      :label="languageStore.tr('name')"
      :readonly="statusStore.loading"
      :rules="[required]"
    />

    <v-text-field
      v-model="password"
      clearable
      :label="languageStore.tr('password')"
      :placeholder="languageStore.tr('General.EnterPasswordPlaceholder')"
      :readonly="statusStore.loading"
      :rules="[required]"
      type="password"
    />

    <br>

    <div v-if="heartbeatStore.canLogin">
      <v-btn
        color="success"
        :disabled="!form"
        :loading="statusStore.loading"
        size="large"
        type="submit"
        variant="elevated"
      >
        {{ languageStore.tr('login') }}
      </v-btn>
    </div>
    <div v-else>
      <div class="d-flex justify-center justify-space-around w-25 ga-3 ma-3 pa-3">
        <v-progress-circular color="primary" indeterminate />
      </div>
      <div>
        <v-card>{{ languageStore.tr('waitingForLogin') }}</v-card>
      </div>

    </div>
  </v-form>
</template>
<script setup lang="ts">
  import { ref } from 'vue'
  import { getHeartbeatStore } from '@/stores/HeartbeatStore'
  import { getLanguageStore } from '@/stores/LanguageStore'
  import { getStatusStore } from '@/stores/StatusStore'
  import { getUserStore } from '@/stores/UserStore'

  const statusStore = getStatusStore()
  const heartbeatStore = getHeartbeatStore()
  const languageStore = getLanguageStore()
  const userName = ref<string>('')
  const password = ref<string>('')
  const form = ref(false)

  async function onSubmit () {
    if (!form.value) return
    statusStore.loading = true
    // setTimeout(() => (loading.value = false), 2000)
    await getUserStore().login(userName.value, password.value)
    statusStore.loading = false
  }

  function required (v: string) {
    return !!v || 'Field is required'
  }

</script>
