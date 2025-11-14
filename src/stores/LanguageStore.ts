import { defineStore } from 'pinia'
import { ref } from 'vue'
import i18n from '../plugins/vue-i18n'
import { AddTranslationRequest, GetAllTranslLocaleReply, GetAllTranslLocaleRequest, GetTranslationReply, GetTranslationRequest, Translation, TranslLocale } from '@/generated/ui'
import { useAppStore } from './app'
import type { NamedValue } from 'vue-i18n'
import type ConnectionInformation from '@/models/ConnectionInformation'
import { FilterConnector, FilterFunction, FilterDataType, SaveReply } from '@/generated/orion_common'
import { buildRequestHeader, getDefaultRestHeader } from '@/utils/CommUtils'
import axios from 'axios'
import { getHeartbeatStore } from './HeartbeatStore'
import { getStatusStore } from './StatusStore'
import DecentSet from '@/utils/DecentSet'

export const getLanguageStore = defineStore('languageStore', () => {
    const { t } = i18n.global;

    let loadedTranslations = ref<Translation[]>([]);
    // untranslatedTranslations loadedTranslations
    let untranslatedTranslations = ref<DecentSet<Translation>>();
    untranslatedTranslations.value = new DecentSet<Translation>(translation => translation.key + translation.language);
    let allLocales = ref<TranslLocale[]>([]);

    function translParam(key: string, parameters: NamedValue): string {
        const result = t(key, parameters, key);
        if (result == key) {
            untranslatedTranslations.value?.add(
                {
                    key: key,
                    language: useAppStore().selectedLocale.language,
                    country: useAppStore().selectedLocale.country,
                    translation: ''
                }
            );
        }

        return result;
    }

    function transl(key: string): string {
        const result = t(key, key);
        if (result == key) {
            untranslatedTranslations.value?.add(
                {
                    key: key,
                    language: useAppStore().selectedLocale.language,
                    country: useAppStore().selectedLocale.country,
                    translation: ''
                }
            );
        }

        return result;
    }

    async function saveTranslation(translation: Translation) {
        try {
            let connInfo: ConnectionInformation | undefined = getHeartbeatStore().getBestSuitedConnection("orion.ui");
            if (connInfo == undefined) {
                getStatusStore().setError('No connection found for app orion.ui to load translations');
                return;
            }
            //console.log('IP: ', connInfo.toAddress());

            let request: AddTranslationRequest = {
                header: buildRequestHeader(),
                translation: translation,
            }
            const { data, status } = await axios.post<SaveReply>(connInfo.toAddress() + '/api/v1/ui/translation/add', request, {
                headers: getDefaultRestHeader('AddTranslation'),
            });
            if (!data.header!.successful) {
                getStatusStore().setError(data.header!.errorMessage);
            } else {
                untranslatedTranslations.value?.remove(translation);
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                let reply: SaveReply = error.response!.data;
                getStatusStore().setError(reply.header?.errorCode + ' // ' + reply.header?.errorMessage);
                return;
            } else {
                getStatusStore().setError(JSON.stringify(error));
                return;
            }
        }
    }

    async function getAllLocales() {
        try {
            let connInfo: ConnectionInformation | undefined = getHeartbeatStore().getBestSuitedConnection("orion.ui");
            if (connInfo == undefined) {
                getStatusStore().setError('No connection found for app orion.ui to load translations');
                return;
            }
            //console.log('IP: ', connInfo.toAddress());

            let request: GetAllTranslLocaleRequest = {
                header: buildRequestHeader(),
            }
            const { data, status } = await axios.post<GetAllTranslLocaleReply>(connInfo.toAddress() + '/api/v1/ui/translation/locale/get', request, {
                headers: getDefaultRestHeader('GetAllTranslLocale'),
            });
            if (!data.header!.successful) {
                getStatusStore().setError(data.header!.errorMessage);
            } else {
                allLocales.value = data.locales;
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

    async function getTranslationsForLocale(locale: TranslLocale) {
        try {
            let connInfo: ConnectionInformation | undefined = getHeartbeatStore().getBestSuitedConnection("orion.ui");
            if (connInfo == undefined) {
                getStatusStore().setError('No connection found for app orion.ui to load translations');
                return;
            }
            //console.log('IP: ', connInfo.toAddress());

            let request: GetTranslationRequest = {
                header: buildRequestHeader(),
                filters: [
                    {
                        key: 'language',
                        value: locale.language,
                        connector: FilterConnector.FC_AND,
                        function: FilterFunction.FF_EQUALS,
                        dataType: FilterDataType.FDT_STRING
                    }
                ]
            }
            const { data, status } = await axios.post<GetTranslationReply>(connInfo.toAddress() + '/api/v1/ui/translation/get', request, {
                headers: getDefaultRestHeader('GetTranslation'),
            });
            if (!data.header!.successful) {
                getStatusStore().setError(data.header!.errorMessage);
            } else {
                loadedTranslations.value = data.translation;
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                let reply: GetTranslationReply = error.response!.data;
                getStatusStore().setError(reply.header?.errorCode + ' // ' + reply.header?.errorMessage);
                return;
            } else {
                getStatusStore().setError(JSON.stringify(error));
                return;
            }
        }
    }


    return { untranslatedTranslations, transl, loadedTranslations, translParam, getAllLocales, allLocales, getTranslationsForLocale, saveTranslation }
})