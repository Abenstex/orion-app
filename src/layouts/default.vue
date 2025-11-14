<template>
    <v-app-bar app color="primary" dark clipped-left elevate>
        <v-app-bar-nav-icon @click="drawerOpen = !drawerOpen"></v-app-bar-nav-icon>
        <v-toolbar-title>Orion</v-toolbar-title>
        <v-combobox v-model="appStore.selectedLocale" :items="appStore.availableLocales" density="comfortable"
            item-value="language" item-title="language" class="w-25 ga-3 ma-3 pa-3" max-width="150px" pad
            return-object></v-combobox>
    </v-app-bar>
    <SideBar :drawerOpen="drawerOpen" />
    <v-main>
        <div v-if="statusStore.loading" class="d-flex justify-center justify-space-around w-25 ga-3 ma-3 pa-3">
            <v-container>
                <v-row align-content="center" style="height: 150px;" no-gutters>
                    <v-col>
                        <v-progress-circular color="primary" indeterminate></v-progress-circular>
                        <v-card text="loading..." />
                    </v-col>
                </v-row>
            </v-container>
        </div>
        <v-dialog v-model="statusStore.hasError">
            <v-card title="Fehler">
                <v-card-text>
                    {{ statusStore.getErrorMessage() }}
                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>

                    <v-btn text="Close Dialog" @click="statusStore.clearErrorMessage()"></v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <router-view />
    </v-main>

    <AppFooter />
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import SideBar from '../components/SideBar.vue'
import { getStatusStore } from '@/stores/StatusStore'
import { useAppStore } from '@/stores/app'

const drawerOpen = ref(false)
//const { errorMessage } = storeToRefs(getStatusStore());
const statusStore = getStatusStore();
const appStore = useAppStore();
</script>
