/* eslint-disable unicorn/no-console-spaces */
import type { ReplyHeader, SaveReply } from '@/generated/orion_common'
import type {
  AddTranslationRequest,
  DeleteTranslationRequest,
  DuplicateLocaleRequest,
  GetAllTranslLocaleReply,
  GetAllTranslLocaleRequest,
  GetTranslationReply,
  GetTranslationRequest,
  Translation,
  TranslLocale } from '@/generated/ui'
import type ConnectionInformation from '@/models/ConnectionInformation'
import axios from 'axios'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  FilterConnector,
  FilterDataType,
  FilterFunction,
} from '@/generated/orion_common'
import { buildRequestHeader, getDefaultRestHeader } from '@/utils/CommUtils'
import DecentSet from '@/utils/DecentSet'
import fallBack from '../assets/fallback_i18n.json'
import { useAppStore } from './app'
import { getHeartbeatStore } from './HeartbeatStore'
import { getStatusStore } from './StatusStore'
import { getUserStore } from './UserStore'

export const getLanguageStore = defineStore('languageStore', () => {
  const loadedTranslations = ref<Translation[]>([])
  const translationsPerLocale = ref<Map<string, Map<string, string>>>(
    new Map(),
  )
  // untranslatedTranslations loadedTranslations
  const untranslatedTranslations = ref<DecentSet<Translation>>()
  untranslatedTranslations.value = new DecentSet<Translation>(
    translation => translation.key + translation.language,
  )
  const allLocales = ref<TranslLocale[]>([])
  const fallBackTranslations = ref<Map<string, Map<string, string>>>(new Map())

  function trP (key: string, parameters: any[]): string {
    let translated = true
    if (
      !translationsPerLocale.value.has(useAppStore().selectedLocale.language)
    ) {
      translated = false
    }
    const tmpMap = translationsPerLocale.value.get(
      useAppStore().selectedLocale.language,
    )
    if (!tmpMap?.has(key)) {
      translated = false
    }
    if (!translated) {
      untranslatedTranslations.value?.add({
        key,
        language: useAppStore().selectedLocale.language,
        country: useAppStore().selectedLocale.country,
        translation: '',
      })

      return key
    }

    return format(tmpMap!.get(key)!, parameters)
  }

  function format (str: string, ...values: any[]): string {
    return str.replace(/{(\d+)}/g, function (match, index) {
      return values[index] === undefined ? match : values[index]
    })
  }

  function getTranslationByKey(key: string): Translation | undefined {
    for (const transl of loadedTranslations.value) {
      if (transl.key === key) {
        return transl
      }
    }

    return undefined
  }

  async function deleteTranslation(translationid: string) {
    try {
      const connInfo: ConnectionInformation | undefined =
        getHeartbeatStore().getBestSuitedConnection("orion.ui");
      if (connInfo == undefined) {
        getStatusStore().setError(
          "No connection found for app orion.ui to delete a translation"
        );
        return;
      }
      const request: DeleteTranslationRequest = {
        header: buildRequestHeader(),
        translationId: translationid,
      };
      const { data } = await axios.post<ReplyHeader>(
        connInfo.toAddress() + "/api/v1/ui/translation/delete",
        request,
        {
          headers: getDefaultRestHeader("DeleteTranslation"),
        }
      );
      if (data.successful) {
        let idx: number = 0
        for (const transl of loadedTranslations.value) {
          if (transl.id!.uuid === translationid) {
            loadedTranslations.value.splice(idx, 1);
            const key: string = transl.key
            translationsPerLocale.value.get(useAppStore().selectedLocale.language)?.delete(key)
            break
          }
          idx++
        }
      } else {
        getStatusStore().setError(data!.errorMessage);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const reply: ReplyHeader = error.response!.data;
        getStatusStore().setError(
          reply?.errorCode + " // " + reply?.errorMessage
        );
        return;
      } else {
        getStatusStore().setError(JSON.stringify(error));
        return;
      }
    }
  }

  async function duplicateLocale (newLocale: TranslLocale, sourceLanguage: string) {
    try {
      const connInfo: ConnectionInformation | undefined
        = getHeartbeatStore().getBestSuitedConnection('orion.ui')
      if (connInfo == undefined) {
        getStatusStore().setError(
          'No connection found for app orion.ui to duplicate a locale',
        )
        return
      }
      const request: DuplicateLocaleRequest = {
        header: buildRequestHeader(),
        originalLanguage: sourceLanguage,
        locale: newLocale!,
      }
      const { data } = await axios.post<ReplyHeader>(
        connInfo.toAddress() + '/api/v1/ui/translation/locale/duplicate',
        request,
        {
          headers: getDefaultRestHeader('DuplicateLocale'),
        },
      )
      if (data.successful) {
        allLocales.value.push(newLocale)
      } else {
        getStatusStore().setError(data!.errorMessage)
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const reply: ReplyHeader = error.response!.data
        getStatusStore().setError(
          reply?.errorCode + ' // ' + reply?.errorMessage,
        )
        return
      } else {
        getStatusStore().setError(JSON.stringify(error))
        return
      }
    }
  }

  function tr (key: string): string {
    let translated = true
    if (
      !translationsPerLocale.value.has(useAppStore().selectedLocale.language)
    ) {
      translated = false
    }
    const tmpMap = translationsPerLocale.value.get(
      useAppStore().selectedLocale.language,
    )
    if (!tmpMap?.has(key)) {
      translated = false
    }
    if (!translated && getUserStore() != undefined) {
      // && getUserStore() != undefined && getUserStore().isLoggedIn) {
      // console.log('Key - ', key, ' TmpMap - ', tmpMap)
      untranslatedTranslations.value?.add({
        key,
        language: useAppStore().selectedLocale.language,
        country: useAppStore().selectedLocale.country,
        translation: '',
      })

      return getFallbackTranslation(key)
    }

    return tmpMap!.get(key)!
  }

  function getFallbackTranslation (key: string): string {
    if (fallBackTranslations.value.size === 0) {
      const translJson = JSON.stringify(fallBack)
      const transls = JSON.parse(translJson)
      const hurz = transls[useAppStore().selectedLocale.language]
      const tmpTranslations: Map<string, string> = new Map()
      for (const transl of hurz) {
        tmpTranslations.set(transl.key, transl.translation)
      }
      fallBackTranslations.value.set(useAppStore().selectedLocale.language, tmpTranslations)
    }

    const ret: string | undefined = fallBackTranslations.value.get(
      useAppStore().selectedLocale.language,
    )?.get(key)
    if (ret == undefined) {
      return key
    }

    return ret
  }

  async function saveTranslation (translation: Translation) {
    try {
      const connInfo: ConnectionInformation | undefined
        = getHeartbeatStore().getBestSuitedConnection('orion.ui')
      if (connInfo == undefined) {
        getStatusStore().setError(
          'No connection found for app orion.ui to load translations',
        )
        return
      }
      const request: AddTranslationRequest = {
        header: buildRequestHeader(),
        translation,
      }
      const { data } = await axios.post<SaveReply>(
        connInfo.toAddress() + '/api/v1/ui/translation/add',
        request,
        {
          headers: getDefaultRestHeader('AddTranslation'),
        },
      )
      if (data.header!.successful) {
        untranslatedTranslations.value?.remove(translation)
        translationsPerLocale.value
          .get(translation.language)!
          .set(translation.key, translation.translation)
        /*console.log(
          'TranslationsPerLocale after save - ',
          translationsPerLocale.value,
        )*/
        loadedTranslations.value.push(translation)
      } else {
        getStatusStore().setError(data.header!.errorMessage)
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const reply: SaveReply = error.response!.data
        getStatusStore().setError(
          reply.header?.errorCode + ' // ' + reply.header?.errorMessage,
        )
        return
      } else {
        getStatusStore().setError(JSON.stringify(error))
        return
      }
    }
  }

  async function getAllLocales () {
    try {
      const connInfo: ConnectionInformation | undefined
        = getHeartbeatStore().getBestSuitedConnection('orion.ui')
      if (connInfo == undefined) {
        getStatusStore().setError(
          'No connection found for app orion.ui to load translations',
        )
        return
      }
      // console.log('IP: ', connInfo.toAddress());

      const request: GetAllTranslLocaleRequest = {
        header: buildRequestHeader(),
      }
      const { data } = await axios.post<GetAllTranslLocaleReply>(
        connInfo.toAddress() + '/api/v1/ui/translation/locale/get',
        request,
        {
          headers: getDefaultRestHeader('GetAllTranslLocale'),
        },
      )
      if (data.header!.successful) {
        allLocales.value = data.locales
      } else {
        getStatusStore().setError(data.header!.errorMessage)
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const reply: GetAllTranslLocaleReply = error.response!.data
        getStatusStore().setError(
          reply.header?.errorCode + ' // ' + reply.header?.errorMessage,
        )
        return
      } else {
        getStatusStore().setError(JSON.stringify(error))
        return
      }
    }
  }

  async function getTranslationsForLocale (locale: TranslLocale) {
    try {
      const connInfo: ConnectionInformation | undefined
        = getHeartbeatStore().getBestSuitedConnection('orion.ui')
      if (connInfo == undefined) {
        getStatusStore().setError(
          'No connection found for app orion.ui to load translations',
        )
        return
      }
      loadedTranslations.value = [];
      const request: GetTranslationRequest = {
        header: buildRequestHeader(),
        filters: [
          {
            key: 'language',
            value: locale.language,
            connector: FilterConnector.FC_AND,
            function: FilterFunction.FF_EQUALS,
            dataType: FilterDataType.FDT_STRING,
          },
        ],
      }
      const { data } = await axios.post<GetTranslationReply>(
        connInfo.toAddress() + '/api/v1/ui/translation/get',
        request,
        {
          headers: getDefaultRestHeader('GetTranslation'),
        },
      )
      if (data.header!.successful) {
        loadedTranslations.value = data.translation
        // translationsPerLocale.value.set(locale.language, data.translation)
        //console.log('Loaded translations - ', data.translation)
        const translMap: Map<string, string> = new Map()
        for (const transl of data.translation) {
          translMap.set(transl.key, transl.translation)
        }
        translationsPerLocale.value.set(locale.language, translMap)
        untranslatedTranslations!.value!.clear()
      } else {
        getStatusStore().setError(data.header!.errorMessage)
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const reply: GetTranslationReply = error.response!.data
        getStatusStore().setError(
          reply.header?.errorCode + ' // ' + reply.header?.errorMessage,
        )
        return
      } else {
        getStatusStore().setError(JSON.stringify(error))
        return
      }
    }
  }

  return {
    untranslatedTranslations,
    tr,
    loadedTranslations,
    trP,
    getAllLocales,
    allLocales,
    getTranslationsForLocale,
    saveTranslation,
    duplicateLocale,
    getTranslationByKey,
    deleteTranslation
  }
})
