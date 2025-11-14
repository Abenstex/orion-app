import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { User, LoginReply, LoginRequest } from '../generated/user';
import { getHeartbeatStore } from './HeartbeatStore'
import ConnectionInformation from '../models/ConnectionInformation';
import { getStatusStore } from './StatusStore'
import { buildRequestHeader, getDefaultRestHeader, getDefaultRpcOptions } from '@/utils/CommUtils';
import axios from 'axios';
import CryptoJS from 'crypto-js';
import router from '@/router';
import { loadTranslations } from '@/plugins/vue-i18n';
import { useAppStore } from './app';

// https://github.com/timostamm/protobuf-ts/blob/main/MANUAL.md

export const getUserStore = defineStore('userStore', () => {
    const user = ref<User | undefined>(undefined);
    const token = ref<string>('');
    const heartbeatStore = getHeartbeatStore();
    const isAdmin = computed(() => user.value != undefined && user.value.isAdmin)
    const isLoggedIn = computed(() => user.value != undefined && token.value.length > 0)
    const appName: string = 'orion.user';

    function encrypteData(data: string) {
        if (data) {
            const key = CryptoJS.PBKDF2('21pfeKl4t5ch4D4m1sch4', 'salt', { keySize: 256 / 32, iterations: 100 });
            const iv = CryptoJS.enc.Utf8.parse('234khwrn39q'); // Convert string to WordArray
            const encrypted = CryptoJS.AES.encrypt(data, key, { iv: iv, mode: CryptoJS.mode.CBC });
            return encrypted.ciphertext.toString(CryptoJS.enc.Hex);
        }
    }

    async function login(userName: string, password: string) {
        try {
            let pass: string = encrypteData(password)!;
            //console.log('Pass: ', pass);
            let connInfo: ConnectionInformation | undefined = heartbeatStore.getBestSuitedConnection(appName);
            if (connInfo == undefined) {
                getStatusStore().setError('No connection found for app ' + appName);
                return;
            }
            //console.log('IP: ', connInfo.toAddress());

            let request: LoginRequest = {
                header: buildRequestHeader(),
                userName: userName,
                password: pass
            }
            const { data, status } = await axios.post<LoginReply>(connInfo.toAddress() + '/api/v1/user/login', request, {
                headers: getDefaultRestHeader('Login'),
            });//client.loginUser(request, getDefaultRpcOptions('Login', connInfo.toAddress()));
            if (!data.header!.successful) {
                getStatusStore().setError(data.header!.errorMessage);
            } else {
                user.value = data.user!;
                token.value = data.token;
                await loadTranslations(import.meta.env.VITE_DEFAULT_LANGUAGE);
                await useAppStore().loadAllLocales();
                router.push('/');
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                let reply: LoginReply = error.response!.data;
                // ToDo - translate
                getStatusStore().setError(reply.header?.errorCode + ' // ' + reply.header?.errorMessage);
                return;
            } else {
                getStatusStore().setError(JSON.stringify(error));
                return;
            }
        }
    }

    return { user, token, isAdmin, login, isLoggedIn }
})