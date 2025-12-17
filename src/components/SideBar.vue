<!-- eslint-disable unicorn/no-console-spaces -->
<!-- eslint-disable vue/v-slot-style -->
<!-- eslint-disable vue/valid-v-for -->
<!-- eslint-disable vue/no-mutating-props -->
<template>
  <v-navigation-drawer v-model="props.drawerOpen" permanent class="px-3 py-3">
    <v-list v-if="!userStore.isLoggedIn" dense class="pt-0">
      <v-list-item
        v-for="item in notLoggedInItems"
        :key="item.title"
        active-class="bg-active"
        density="comfortable"
        size="small"
        class="smaller-font"
        :to="item.route"
      >
        <template #prepend>
          <v-icon :icon="item.icon" />
        </template>
        <v-list-item-title>{{ item.title }}</v-list-item-title>
      </v-list-item>
    </v-list>
    <v-list v-else-if="userStore.isLoggedIn" dense class="pt-0">
      <v-list-item
        v-for="item in commonSingleLoggedInItems"
        :key="item.title"
        active-class="bg-active"
        density="comfortable"
        size="small"
        class="smaller-font"
        :to="item.route"
      >
        <template #prepend>
          <v-icon :icon="item.icon" />
        </template>
        <v-list-item-title>{{ item.title }}</v-list-item-title>
      </v-list-item>
      <v-divider />
      <v-list-group
        v-if="appStore.appGroups != undefined"
        v-for="group in appStore.appGroups"
        :value="group.name"
      >
        <template v-slot:activator="{ props }">
          <v-list-item
            class="smaller-font"
            v-bind="props"
            density="comfortable"
            :prepend-icon="group.icon"
            size="small"
            :title="lang.tr(`Navigation.${group.name}`)"
          />
        </template>
        <v-list-item
          class="smaller-font"
          v-for="item in group.navigationItems"
          :key="item.name"
          density="comfortable"
          :prepend-icon="item.icon"
          size="small"
          :title="item.name"
          :to="item.route"
        />

        <v-divider />
      </v-list-group>
      <!--v-list-group v-for="group in commonLoggedInGroups" :value="group.title">
        <template v-slot:activator="{ props }">
          <v-list-item
            class="smaller-font"
            v-bind="props"
            density="comfortable"
            :prepend-icon="group.icon"
            size="small"
            :title="group.title"
          />
        </template>

        <v-list-item
          class="smaller-font"
          v-for="item in group.items"
          :key="item.title"
          density="comfortable"
          :prepend-icon="item.icon"
          size="small"
          :title="item.title"
          :to="item.route"
        />
        <v-divider />
      </v-list-group>
      <v-list-group
        :v-if="userStore.isLoggedIn"
        v-for="group in specGroups"
        :value="group.title"
      >
        <template v-slot:activator="{ props }">
          <v-list-item
            class="smaller-font"
            v-bind="props"
            density="comfortable"
            :prepend-icon="group.icon"
            size="small"
            :title="group.title"
          />
        </template>

        <v-list-item
          class="smaller-font"
          v-for="item in group.items"
          :key="item.title"
          density="comfortable"
          :prepend-icon="item.icon"
          size="small"
          :title="item.title"
          :to="item.route"
        />
        <v-divider />
      </v-list-group>
      <v-list-group
        :v-if="userStore.isAdmin"
        v-for="group in adminGroups"
        :value="group.title"
      >
        <template v-slot:activator="{ props }">
          <v-list-item
            class="smaller-font"
            v-bind="props"
            density="comfortable"
            :prepend-icon="group.icon"
            size="small"
            :title="group.title"
          />
        </template>

        <v-list-item
          class="smaller-font"
          v-for="item in group.items"
          :key="item.title"
          density="comfortable"
          :prepend-icon="item.icon"
          size="small"
          :title="item.title"
          :to="item.route"
        />
        <v-divider />
      </v-list-group-->
    </v-list>
    <v-divider />
  </v-navigation-drawer>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { getLanguageStore } from "@/stores/LanguageStore";
import { getUserStore } from "@/stores/UserStore";
import { useAppStore } from "@/stores/app";
import NavGroup from "../models/NavGroup";
import NavItem from "../models/NavItem";

const props = defineProps<{ drawerOpen: boolean }>();
const userStore = getUserStore();
const lang = getLanguageStore();
const route = useRoute();
const appStore = useAppStore();

watch(route, (to, from) => {
  // eslint-disable-next-line unicorn/no-console-spaces
  if (to.name == lang.tr("General.Home") || to.path == "/") {
    buildNavItems();
  }
});

function buildNavItems(): void {
  if (userStore.isLoggedIn) {
    commonLoggedInGroups.value = [];
    commonLoggedInGroups.value = [
      new NavGroup(lang.tr("General.Ui"), "mdi-monitor-screenshot", [
        new NavItem(
          lang.tr("Ui.Translation"),
          "mdi-translate-variant",
          "/ui/transl"
        ),
      ]),
    ];
    commonSingleLoggedInItems.value = [];
    commonSingleLoggedInItems.value = [
      new NavItem(lang.tr("General.Home"), "mdi-home-circle", "/"),
    ];
    adminGroups.value = [];
    adminGroups.value = [
      new NavGroup(lang.tr("General.Admin"), "mdi-shield-crown-outline", [
        new NavItem(
          lang.tr("General.Heartbeat"),
          "mdi-stethoscope",
          "/admin/heartbeats"
        ),
        new NavItem(lang.tr("General.Config"), "mdi-cogs", "/admin/config"),
        new NavItem(
          lang.tr("General.Filters"),
          "mdi-filter-cog-outline",
          "/admin/filters"
        ),
      ]),
    ];
    specGroups.value = [];
    specGroups.value = [
      new NavGroup(lang.tr("General.Project"), "mdi-calendar-arrow-right", [
        new NavItem(
          lang.tr("General.SpecEditor"),
          "mdi-book-edit-outline",
          "/spec/editor"
        ),
      ]),
    ];
  }
}

const notLoggedInItems = ref<Array<NavItem>>([
  new NavItem(lang.tr("General.Home"), "mdi-home-circle", "/"),
  new NavItem(lang.tr("General.Login"), "mdi-login", "Login"),
]);

const commonLoggedInGroups = ref<NavGroup[]>([
  new NavGroup(lang.tr("General.Ui"), "mdi-monitor-screenshot", [
    new NavItem(
      lang.tr("Ui.Translation"),
      "mdi-translate-variant",
      "/ui/transl"
    ),
  ]),
]);

const specGroups = ref<NavGroup[]>([
  new NavGroup(lang.tr("General.Project"), "mdi-calendar-arrow-right", [
    new NavItem(
      lang.tr("General.SpecEditor"),
      "mdi-book-edit-outline",
      "/spec/editor"
    ),
  ]),
]);

const adminGroups = ref<NavGroup[]>([
  new NavGroup(lang.tr("General.Admin"), "mdi-shield-crown-outline", [
    new NavItem(
      lang.tr("General.Heartbeat"),
      "mdi-stethoscope",
      "/admin/heartbeats"
    ),
    new NavItem(lang.tr("General.Config"), "mdi-cogs", "/admin/config"),
    new NavItem(
      lang.tr("General.Filters"),
      "mdi-filter-cog-outline",
      "/admin/filters"
    ),
  ]),
]);

const commonSingleLoggedInItems = ref<Array<NavItem>>([
  new NavItem(lang.tr("General.Home"), "mdi-home-circle", "/"),
]);
</script>
<style scoped lang="scss">
.smaller-font :deep(.v-list-item-title) {
  font-size: 12px;
}
.smaller-font.v-list-item {
  min-height: unset; /* or a length that suits you */
}
</style>
