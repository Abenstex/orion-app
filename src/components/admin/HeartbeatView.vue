<template>
  <v-sheet class="pa-5" rounded>
    <v-data-table
      :headers="headers"
      :items="heartbeatStore.currentHeartbeats!.values()"
    >
      <template #top>
        <v-toolbar flat>
          <v-toolbar-title>
            <v-icon
              color="medium-emphasis"
              icon="mdi-book-multiple"
              size="x-small"
              start
            />
            {{ lang.tr("General.Heartbeats") }}
          </v-toolbar-title>
        </v-toolbar>
      </template>

      <template #item.title="{ value }">
        <v-chip
          class="thin opacity-25"
          label
          prepend-icon="mdi-book"
          :text="value"
        >
          <template #prepend>
            <v-icon color="medium-emphasis" />
          </template>
        </v-chip>
      </template>

      <template v-slot:item.startedTime="{ item }">
        <span>{{ new Date(item.startedTime).toLocaleString() }}</span>
      </template>
      <template v-slot:item.currentTime="{ item }">
        <span>{{ new Date(item.currentTime).toLocaleString() }}</span>
      </template>

      <template #item.actions="{ item }">
        <div class="d-flex ga-2 justify-end">
          <v-icon
            color="medium-emphasis"
            icon="mdi-details"
            size="small"
            @click="viewDetails(item.appName, item.hostAddress, item.port)"
          />
        </div>
      </template>
    </v-data-table>
  </v-sheet>
</template>
<script setup lang="ts">
import type { VDataTable } from "vuetify/components";
import { ref } from "vue";
import { getStatusStore } from "@/stores/StatusStore";
import { Heartbeat } from "@/generated/orion_common";
import { getLanguageStore } from "@/stores/LanguageStore";
import { getHeartbeatStore } from "@/stores/HeartbeatStore";

type ReadonlyHeaders = VDataTable["$props"]["headers"];

const selectedHeartbeat = ref<Heartbeat | undefined>(undefined);
const lang = getLanguageStore();
const heartbeatStore = getHeartbeatStore();

const headers: ReadonlyHeaders = [
  { title: lang.tr("Heartbeat.AppName"), key: "appName", align: "start" },
  { title: lang.tr("Heartbeat.AppVersion"), key: "appVersion" },
  { title: lang.tr("Heartbeat.HostAddress"), key: "hostAddress" },
  { title: lang.tr("Heartbeat.Port"), key: "port" },
    { title: lang.tr("Heartbeat.StartedTime"), key: "startedTime" },
  { title: lang.tr("Heartbeat.LastHeartbeat"), key: "currentTime" },
  {
    title: lang.tr("Ui.Actions"),
    key: "actions",
    align: "end",
    sortable: false,
  },
];

function viewDetails(appName: string, hostAddress: string, port: number) {}
</script>
