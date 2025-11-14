import type ConnectionInformation from '@/models/ConnectionInformation';
import { createI18n, type I18n, type I18nOptions, type VueI18nInstance } from 'vue-i18n'
import { getHeartbeatStore } from '../stores/HeartbeatStore'
import { getStatusStore } from '@/stores/StatusStore';
import { getLanguageStore } from '@/stores/LanguageStore';
import axios from 'axios';
import { buildRequestHeader, getDefaultRestHeader } from '@/utils/CommUtils';
import { Translation, type GetTranslationReply, type GetTranslationRequest } from '@/generated/ui';
import { FilterConnector, FilterDataType, FilterFunction, ObjectType } from '@/generated/orion_common';

// https://stackoverflow.com/questions/55722512/internationalization-in-vue-js-using-vue-i18n-getting-json-object-from-api-serve?rq=3
// https://stackoverflow.com/questions/68802337/vue-js-i18n-load-external-jsons-from-server-and-make-it-globally-accessible-i

const i18n = createI18n({
    locale: 'de',
    fallbackLocale: 'de',
    messages: {
        de: {
            'login': 'Einloggen',
            'name': 'Name',
            'password': 'Passwort',
            'waitingForLogin': 'Verbindung mit User-Server wird noch hergestellt...'
        },
        en: {}
    }
})

export const SUPPORT_LOCALES = ['en', 'de']

export function setupI18n(options = { locale: 'en' }) {
    const i18n = createI18n(options)
    setI18nLanguage(i18n, options.locale)
    return i18n
}

export function setI18nLanguage(i18n: I18n, locale: string) {
    i18n.global.locale = locale
}

export async function loadTranslations(lang: string) {
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
                    value: lang,
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
            getLanguageStore().loadedTranslations = data.translation;
            if (data.translation != null && data.translation.length > 0) {
                var translMap: Map<string, string> = new Map();
                const translations: Translation[] = data.translation;
                for (const zenalln of translations) {
                    translMap.set(zenalln.key, zenalln.translation);
                }
                i18n.global.setLocaleMessage(lang, translMap);
            }
        }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            let reply: GetTranslationReply = error.response!.data;
            // ToDo - translate
            getStatusStore().setError(reply.header?.errorCode + ' // ' + reply.header?.errorMessage);
            return;
        } else {
            getStatusStore().setError(JSON.stringify(error));
            return;
        }
    }
}

export default i18n