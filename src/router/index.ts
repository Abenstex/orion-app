/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

// Composables
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { setupLayouts } from 'virtual:generated-layouts'
//import { routes } from 'vue-router/auto-routes'
import { getUserStore } from '../stores/UserStore'

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "Home",
    component: () => import("../components/Home.vue"),
    meta: {
      title: "Home",
    },
    /*beforeEnter(to, from, next) {
            if (!store.isLoggedIn) {
                next({ path: 'home' });
            } else {
                next();
            }
        },*/
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("../components/Login.vue"),
    meta: {
      title: "Login",
    },
  },
  {
    path: "/ui/transl",
    name: "Translation",
    component: () => import("../components/ui/TranslationsView.vue"),
    meta: {
      title: "Ui.Translation",
    },
  },
  {
    path: "/admin/heartbeats",
    name: "Heartbeats",
    component: () => import("../components/admin/HeartbeatView.vue"),
    meta: {
      title: "General.Heartbeat",
    },
  },
  {
    path: "/admin/config",
    name: "Configuration",
    component: () => import("../components/misc/ParametersView.vue"),
    meta: {
      title: "General.Config",
    },
  },
  {
    path: "/admin/filters",
    name: "Filter",
    component: () =>
      import("../components/misc/RequestFilterDescriptorsView.vue"),
    meta: {
      title: "General.Filter",
    },
  },
  {
    path: "/spec/editor",
    name: "Spec-Editor",
    component: () => import("../components/spec/SpecEditor.vue"),
    meta: {
      title: "General.SpecEditor",
    },
  },
  {
    path: "/basicdata/status",
    name: "Statis",
    component: () => import("../components/misc/StatusView.vue"),
    meta: {
      title: "General.Status",
    },
  },
  {
    path: "/basicdata/status_rule",
    name: "Status Transition Rules",
    component: () => import("../components/misc/StatusTransitionRuleView.vue"),
    meta: {
      title: "General.StatusTransitionRule",
    },
  },
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: setupLayouts(routes),
})

// Workaround for https://github.com/vitejs/vite/issues/11804
router.onError((err, to) => {
    if (err?.message?.includes?.('Failed to fetch dynamically imported module')) {
        if (localStorage.getItem('vuetify:dynamic-reload')) {
            console.error('Dynamic import error, reloading page did not fix it', err)
        } else {
            console.log('Reloading page to fix dynamic import error')
            localStorage.setItem('vuetify:dynamic-reload', 'true')
            location.assign(to.fullPath)
        }
    } else {
        console.error(err)
    }
})

router.isReady().then(() => {
    localStorage.removeItem('vuetify:dynamic-reload')
})

router.beforeEach(async (to, _from) => {
    let store = getUserStore()
  //console.log(to.name);
  if (!store.checkTokenExpiry) {
    return { name: "Login" };
  }

    if (!store.isLoggedIn &&
        (to.name !== 'Login' && to.name !== 'Home')
    ) {
        return { name: 'Login' }
    }
})

export default router
