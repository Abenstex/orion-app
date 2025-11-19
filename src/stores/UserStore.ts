/* eslint-disable unicorn/no-console-spaces */
import type { LoginReply, LoginRequest, User } from '../generated/user'
import type ConnectionInformation from '../models/ConnectionInformation'
import axios from 'axios'
import CryptoJS from 'crypto-js'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import router from '@/router'
import { buildRequestHeader, getDefaultRestHeader, getDefaultRpcOptions } from '@/utils/CommUtils'
import { useAppStore } from './app'
import { getHeartbeatStore } from './HeartbeatStore'
import { getLanguageStore } from './LanguageStore'
import { getStatusStore } from './StatusStore'

// https://github.com/timostamm/protobuf-ts/blob/main/MANUAL.md

export const getUserStore = defineStore('userStore', () => {
  const user = ref<User | undefined>(undefined)
  const token = ref<string>('')
  const heartbeatStore = getHeartbeatStore()
  const isAdmin = computed(() => user.value != undefined && user.value.isAdmin)
  const isLoggedIn = computed(() => user.value != undefined && token.value.length > 0)
  const appName = 'orion.user'

  function encrypteData (data: string) {
    if (data) {
      const key = CryptoJS.PBKDF2('21pfeKl4t5ch4D4m1sch4', 'salt', { keySize: 256 / 32, iterations: 100 })
      const iv = CryptoJS.enc.Utf8.parse('234khwrn39q') // Convert string to WordArray
      const encrypted = CryptoJS.AES.encrypt(data, key, { iv, mode: CryptoJS.mode.CBC })
      return encrypted.ciphertext.toString(CryptoJS.enc.Hex)
    }
  }

  async function login (userName: string, password: string) {
    try {
      const pass: string = encrypteData(password)!
      //console.log('Pass: ', pass)
      const connInfo: ConnectionInformation | undefined = heartbeatStore.getBestSuitedConnection(appName)
      if (connInfo == undefined) {
        getStatusStore().setError('No connection found for app ' + appName)
        return
      }
      // console.log('IP: ', connInfo.toAddress());

      const request: LoginRequest = {
        header: buildRequestHeader(),
        userName,
        password: pass,
      }
      const { data } = await axios.post<LoginReply>(connInfo.toAddress() + '/api/v1/user/login', request, {
        headers: getDefaultRestHeader('Login'),
      })// client.loginUser(request, getDefaultRpcOptions('Login', connInfo.toAddress()));
      if (data.header!.successful) {
        token.value = data.token
        await getLanguageStore().getTranslationsForLocale({ language: import.meta.env.VITE_DEFAULT_LANGUAGE, country: '' })
        await useAppStore().loadAllLocales()
        user.value = data.user!
        router.push('/')
      } else {
        getStatusStore().setError(data.header!.errorMessage)
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const reply: LoginReply = error.response!.data
        // ToDo - translate
        getStatusStore().setError(reply.header?.errorCode + ' // ' + reply.header?.errorMessage)
        return
      } else {
        getStatusStore().setError(JSON.stringify(error))
        return
      }
    }
  }

  return { user, token, isAdmin, login, isLoggedIn }
})
