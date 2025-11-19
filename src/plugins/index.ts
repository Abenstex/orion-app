/**
 * plugins/index.ts
 *
 * Automatically included in `./src/main.ts`
 */

// Types
import type { App } from 'vue'
import { getHeartbeatStore } from '@/stores/HeartbeatStore'
import router from '../router'

import pinia from '../stores'
// Plugins
import vuetify from './vuetify'

export async function registerPlugins (app: App) {
  app
    .use(vuetify)
    .use(router)
    .use(pinia)
  await getHeartbeatStore().init()
}
