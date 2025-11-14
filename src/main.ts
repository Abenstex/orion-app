/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Plugins
import { registerPlugins } from '@/plugins'
import i18n from './plugins/vue-i18n'

const { t } = i18n.global
// Components
import App from './App.vue'

// Composables
import { createApp } from 'vue'

// Styles
import 'unfonts.css'
import { getLanguageStore } from './stores/LanguageStore'

const app = createApp(App)

registerPlugins(app)
/*app.config.globalProperties.$transl = function (key: string): string {
    const result = this.$t(key);
    if (result == key) {
        getLanguageStore().untranslatedKeys.push(key);
    }

    return result;
};*/
app.mount('#app')
