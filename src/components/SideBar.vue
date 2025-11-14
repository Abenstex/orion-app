<template>
    <v-navigation-drawer permanent v-model="props.drawerOpen">
        <v-list v-if="!userStore.isLoggedIn">
            <v-list-item v-for="item in notLoggedInItems" :key="item.title" :to="item.route" active-class="bg-active"
                density="comfortable" size="small">
                <template v-slot:prepend>
                    <v-icon :icon="item.icon"></v-icon>
                </template>
                <v-list-item-title>{{ item.title }}</v-list-item-title>
            </v-list-item>
        </v-list>
        <v-list v-else-if="userStore.isLoggedIn">
            <v-list-item v-for="item in commonSingleLoggedInItems" :key="item.title" :to="item.route"
                active-class="bg-active" density="comfortable" size="small">
                <template v-slot:prepend>
                    <v-icon :icon="item.icon"></v-icon>
                </template>
                <v-list-item-title>{{ item.title }}</v-list-item-title>
            </v-list-item>
            <v-divider></v-divider>
            <v-list-group v-for="group in commonLoggedInGroups">
                <template v-slot:activator="{ props }">
                    <v-list-item v-bind="props" :title="group.title" :prepend-icon="group.icon" density="comfortable"
                        size="small"></v-list-item>
                </template>

                <v-list-item v-for="item in group.items" :key="item.title" :prepend-icon="item.icon" :title="item.title"
                    :to="item.route" density="comfortable" size="small"></v-list-item>
                <v-divider></v-divider>
            </v-list-group>
        </v-list>
        <v-divider></v-divider>
    </v-navigation-drawer>
</template>
<script setup lang="ts">
import NavItem from '../models/NavItem';
import NavGroup from '../models/NavGroup';
import { getUserStore } from '@/stores/UserStore';
import { ref } from 'vue';
import type { VListItem } from 'vuetify/components';
import { getLanguageStore } from '@/stores/LanguageStore';

const props = defineProps<{ drawerOpen: boolean }>()

const userStore = getUserStore();
const lang = getLanguageStore();

const notLoggedInItems = ref<Array<NavItem>>([
    new NavItem(
        lang.transl('General.Home'),
        'mdi-home-circle',
        '/',
    ), new NavItem(
        lang.transl('General.Login'),
        'mdi-login',
        'Login',
    )
])

const commonLoggedInGroups = ref<NavGroup[]>([
    new NavGroup(lang.transl('General.Ui'), 'mdi-monitor-screenshot', [
        new NavItem(
            lang.transl('Ui.Translation'),
            'mdi-translate-variant',
            '/ui/transl',
        )
    ])
])

const commonSingleLoggedInItems = ref<Array<NavItem>>([
    new NavItem(
        lang.transl('General.Home'),
        'mdi-home-circle',
        '/',
    )
])

</script>