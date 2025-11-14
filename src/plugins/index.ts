/**
 * plugins/index.ts
 *
 * Automatically included in `./src/main.ts`
 */

// Plugins
import vuetify from './vuetify'
import pinia from '../stores'
import router from '../router'
import i18n from './vue-i18n'
import { getHeartbeatStore } from '@/stores/HeartbeatStore'

// Types
import type { App } from 'vue'

export async function registerPlugins(app: App) {
    app
        .use(vuetify)
        .use(router)
        .use(pinia).use(i18n)
    await getHeartbeatStore().init()
}
