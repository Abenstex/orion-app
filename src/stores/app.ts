// Utilities
import { defineStore } from 'pinia'
import { generateRandomString } from '../utils/Utils'
import { getStatusStore } from './StatusStore';
import { buildRequestHeader, getDefaultRestHeader } from '@/utils/CommUtils';
import axios from 'axios';
import type ConnectionInformation from '@/models/ConnectionInformation';
import { getHeartbeatStore } from './HeartbeatStore';
import type { GetAllTranslLocaleReply, GetAllTranslLocaleRequest, TranslLocale } from '@/generated/ui';

export const useAppStore = defineStore('app', () => {
    const clientId = ref<string>(generateRandomString(12));
    const selectedLocale = ref<TranslLocale>({ language: import.meta.env.VITE_DEFAULT_LANGUAGE, country: import.meta.env.VITE_DEFAULT_LANGUAGE.toUpperCase() });
    const availableLocales = ref<TranslLocale[]>([{ language: import.meta.env.VITE_DEFAULT_LANGUAGE, country: import.meta.env.VITE_DEFAULT_LANGUAGE.toUpperCase() }]);
    const appName: string = 'orion.ui';

    async function loadAllLocales() {
        try {
            let connInfo: ConnectionInformation | undefined = getHeartbeatStore().getBestSuitedConnection(appName);
            if (connInfo == undefined) {
                getStatusStore().setError('No connection found for app ' + appName);
                return;
            }

            let request: GetAllTranslLocaleRequest = {
                header: buildRequestHeader(),
            }
            const { data, status } = await axios.post<GetAllTranslLocaleReply>(connInfo.toAddress() + '/api/v1/ui/translation/locale/get', request, {
                headers: getDefaultRestHeader('GetAllLocales'),
            });
            if (!data.header!.successful) {
                getStatusStore().setError(data.header!.errorMessage);
            } else {
                availableLocales.value = data.locales;
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                let reply: GetAllTranslLocaleReply = error.response!.data;
                getStatusStore().setError(reply.header?.errorCode + ' // ' + reply.header?.errorMessage);
                return;
            } else {
                getStatusStore().setError(JSON.stringify(error));
                return;
            }
        }
    }

    return { clientId, selectedLocale, availableLocales, loadAllLocales }
})
