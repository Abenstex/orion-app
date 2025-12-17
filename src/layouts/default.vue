<template>
  <v-app-bar
    app
    clipped-left
    color="primary"
    dark
    elevate
  >
    <v-app-bar-nav-icon @click="drawerOpen = !drawerOpen" />
    <v-toolbar-title>Orion</v-toolbar-title>
    <v-combobox
      v-model="appStore.selectedLocale"
      class="w-25 ga-3 ma-3 pa-3"
      density="comfortable"
      item-title="language"
      item-value="language"
      :items="appStore.availableLocales"
      max-width="150px"
      pad
      return-object
    />
  </v-app-bar>
  <SideBar :drawer-open="drawerOpen" />
  <v-main>
    <!--div v-if="statusStore.loading" class="d-flex justify-center justify-space-around w-25 ga-3 ma-3 pa-3">
      <v-container>
        <v-row align-content="center" no-gutters style="height: 150px;">
          <v-col>
            <v-progress-circular color="primary" indeterminate />
            <v-card text="loading..." />
          </v-col>
        </v-row>
      </v-container>
    </div-->
    <v-dialog v-model="statusStore.loading" width="auto">
      <v-card max-width="400" :title="lang.tr('General.LoadingData')" prepend-icon="mdi-loading">
        <v-card-text>
          <v-progress-circular color="primary" indeterminate />
        </v-card-text>

        <!--v-card-actions>
          <v-spacer />

          <v-btn :text="lang.tr('General.Close')" @click="statusStore.clearErrorMessage()" />
        </v-card-actions-->
      </v-card>
    </v-dialog>
    <v-dialog v-model="statusStore.hasError">
      <v-card :title="lang.tr('General.Error')" prepend-icon="mdi-alert-circle-outline">
        <v-card-text>
          {{ statusStore.getErrorMessage() }}
        </v-card-text>

        <v-card-actions>
          <v-spacer />

          <v-btn :text="lang.tr('General.Close')" @click="statusStore.clearErrorMessage()" />
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="statusStore.hasWarning">
      <v-card :title="lang.tr('General.Warning')" prepend-icon="mdi-bell-alert">
        <v-card-text>
          {{ statusStore.warnMessage }}
        </v-card-text>

        <v-card-actions>
          <v-spacer />

          <v-btn :text="lang.tr('General.Close')" @click="statusStore.clearWarnMessage()" />
        </v-card-actions>
      </v-card>
    </v-dialog>
    <router-view />
  </v-main>

  <AppFooter />
</template>

<script lang="ts" setup>
  import { ref } from 'vue'
  import { useAppStore } from '@/stores/app'
import { getStatusStore } from '@/stores/StatusStore'
  import { getLanguageStore } from '@/stores/LanguageStore'
  import SideBar from '../components/SideBar.vue'

  const drawerOpen = ref(false)
  // const { errorMessage } = storeToRefs(getStatusStore());
  const statusStore = getStatusStore()
const appStore = useAppStore()
const lang = getLanguageStore();
</script>
