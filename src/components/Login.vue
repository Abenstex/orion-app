<template>
    <v-form v-model="form" @submit.prevent="onSubmit" class="pa-5">
        <v-text-field v-model="userName" :readonly="statusStore.loading" :rules="[required]"
            :label="languageStore.transl('name')" clearable></v-text-field>

        <v-text-field v-model="password" :readonly="statusStore.loading" :rules="[required]"
            :label="languageStore.transl('password')"
            :placeholder="languageStore.transl('General.EnterPasswordPlaceholder')" clearable
            type="password"></v-text-field>

        <br>

        <div v-if="heartbeatStore.canLogin">
            <v-btn :disabled="!form" :loading="statusStore.loading" color="success" size="large" type="submit"
                variant="elevated">
                {{ languageStore.transl('login') }}
            </v-btn>
        </div>
        <div v-else>
            <div class="d-flex justify-center justify-space-around w-25 ga-3 ma-3 pa-3">
                <v-progress-circular color="primary" indeterminate></v-progress-circular>
            </div>
            <div>
                <v-card>{{ languageStore.transl('waitingForLogin') }}</v-card>
            </div>


        </div>
    </v-form>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { getStatusStore } from '@/stores/StatusStore';
import { getUserStore } from '@/stores/UserStore';
import { getHeartbeatStore } from '@/stores/HeartbeatStore';
import { getLanguageStore } from '@/stores/LanguageStore';

const statusStore = getStatusStore();
const heartbeatStore = getHeartbeatStore();
const languageStore = getLanguageStore();
const userName = ref<string>('')
const password = ref<string>('')
const form = ref(false)

async function onSubmit() {
    if (!form.value) return
    statusStore.loading = true;
    //setTimeout(() => (loading.value = false), 2000)
    await getUserStore().login(userName.value, password.value);
    statusStore.loading = false;
}

function required(v: string) {
    return !!v || 'Field is required'
}

</script>
