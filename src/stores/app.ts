/* eslint-disable unicorn/no-console-spaces */
import type { GetAllTranslLocaleReply, GetAllTranslLocaleRequest, GetAppGroupsReply, GetAppGroupsRequest, TranslLocale } from '@/generated/ui'
import type ConnectionInformation from '@/models/ConnectionInformation'
import axios from 'axios'
// Utilities
import { defineStore } from 'pinia'
import { buildRequestHeader, getDefaultRestHeader } from '@/utils/CommUtils'
import { generateRandomString } from '../utils/Utils'
import { getHeartbeatStore } from './HeartbeatStore'
import { getStatusStore } from './StatusStore'
import type { AppGroup } from '@/generated/orion_common'
import router from '@/router'

export const useAppStore = defineStore('app', () => {
  const clientId = ref<string>(generateRandomString(12))
  const selectedLocale = ref<TranslLocale>({ language: import.meta.env.VITE_DEFAULT_LANGUAGE, country: import.meta.env.VITE_DEFAULT_LANGUAGE.toUpperCase() })
  const availableLocales = ref<TranslLocale[]>([{ language: import.meta.env.VITE_DEFAULT_LANGUAGE, country: import.meta.env.VITE_DEFAULT_LANGUAGE.toUpperCase() }])
  const appName = 'orion.ui'
  const appGroups = ref<AppGroup[]>([]);

  async function loadAllAppGroups() {
    try {
      const connInfo: ConnectionInformation | undefined =
        getHeartbeatStore().getBestSuitedConnection(appName);
      if (connInfo == undefined) {
        getStatusStore().setError("No connection found for app " + appName);
        return;
      }

      const request: GetAppGroupsRequest = {
        header: buildRequestHeader(),
      };
      const { data } = await axios.post<GetAppGroupsReply>(
        connInfo.toAddress() + "/api/v1/ui/app_group/get",
        request,
        {
          headers: getDefaultRestHeader("GetAppGroups"),
        }
      );
      if (data.header!.successful) {
        appGroups.value = data.groups;
        //console.log(`Groups: ${JSON.stringify(appGroups.value)}`);
        /*for (const group of appGroups.value) {
          for (const item of group.navigationItems) {
            router.addRoute({
              path: item.route,
              name: item.name,
              component: () => import(item.component),
              meta: {
                title: item.name
              }
            });
          }
        }*/
      } else {
        getStatusStore().setError(data.header!.errorMessage);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const reply: GetAppGroupsReply = error.response!.data;
        getStatusStore().setError(
          reply.header?.errorCode + " // " + reply.header?.errorMessage
        );
        return;
      } else {
        getStatusStore().setError(JSON.stringify(error));
        return;
      }
    }
  }

  async function loadAllLocales () {
    try {
      const connInfo: ConnectionInformation | undefined = getHeartbeatStore().getBestSuitedConnection(appName)
      if (connInfo == undefined) {
        getStatusStore().setError('No connection found for app ' + appName)
        return
      }

      const request: GetAllTranslLocaleRequest = {
        header: buildRequestHeader(),
      }
      const { data } = await axios.post<GetAllTranslLocaleReply>(connInfo.toAddress() + '/api/v1/ui/translation/locale/get', request, {
        headers: getDefaultRestHeader('GetAllLocales'),
      })
      if (data.header!.successful) {
        availableLocales.value = data.locales
      } else {
        getStatusStore().setError(data.header!.errorMessage)
      }
    } catch (error) {
      console.log('Load all locales error - ', error)
      if (axios.isAxiosError(error)) {
        const reply: GetAllTranslLocaleReply = error.response!.data
        getStatusStore().setError(reply.header?.errorCode + ' // ' + reply.header?.errorMessage)
        return
      } else {
        getStatusStore().setError(JSON.stringify(error))
        return
      }
    }
  }

  return { clientId, selectedLocale, availableLocales, loadAllLocales, loadAllAppGroups, appGroups }
})
