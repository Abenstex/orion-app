/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Composables
import { createApp } from 'vue'
// Plugins
import { registerPlugins } from '@/plugins'

// Components
import App from './App.vue'

import { getLanguageStore } from './stores/LanguageStore'
// Styles
import 'unfonts.css'

const app = createApp(App)

registerPlugins(app)
/* app.config.globalProperties.$transl = function (key: string): string {
    const result = this.$t(key);
    if (result == key) {
        getLanguageStore().untranslatedKeys.push(key);
    }

    return result;
}; */
app.mount('#app')
