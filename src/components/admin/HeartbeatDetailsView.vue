<template>
  <v-col v-model="props.visible">
    <v-expansion-panels v-if="heartbeatStore.selectedHeartbeat != undefined">
      <v-expansion-panel>
        <v-expansion-panel-title>{{
          lang.tr("Heartbeat.General")
        }}</v-expansion-panel-title>
        <v-expansion-panel-text>
          <v-card class="mt-8 mx-auto overflow-visible">
              <v-col class="ga-3">
                <v-row class="ga-3">
                  <v-text-field
                    v-model="heartbeatStore.selectedHeartbeat.appName"
                    :label="lang.tr('Heartbeat.AppName')"
                    readonly
                  />
                  <v-text-field
                    v-model="heartbeatStore.selectedHeartbeat.appVersion"
                    :label="lang.tr('Heartbeat.AppVersion')"
                    readonly
                  />
                  <v-text-field
                    v-model="heartbeatStore.selectedHeartbeat.numCpu"
                    :label="lang.tr('Heartbeat.NumCpu')"
                    readonly
                  />
                </v-row>
                <v-row class="ga-3">
                  <v-text-field
                    v-model="heartbeatStore.selectedHeartbeat.goOs"
                    :label="lang.tr('Heartbeat.OS')"
                    readonly
                  />
                  <v-text-field
                    v-model="heartbeatStore.selectedHeartbeat.goArch"
                    :label="lang.tr('Heartbeat.GoArch')"
                    readonly
                  />
                  <v-text-field
                    v-model="heartbeatStore.selectedHeartbeat.goVersion"
                    :label="lang.tr('Heartbeat.GoVersion')"
                    readonly
                  />
                </v-row>
              </v-col>
          </v-card>
        </v-expansion-panel-text>
      </v-expansion-panel>

      <v-expansion-panel>
        <v-expansion-panel-title>{{
          lang.tr("Heartbeat.AllocBytes")
        }}</v-expansion-panel-title>
        <v-expansion-panel-text>
          <v-card class="mt-8 mx-auto overflow-visible">
            <v-sheet
              class="v-sheet--offset mx-auto"
              color="cyan"
              elevation="12"
              max-width="calc(100% - 32px)"
              rounded="lg"
            >
              <LineChart
                :chart-data="allocBytesData"
                :options="allocBytesOptions"
              />
            </v-sheet>
          </v-card>
        </v-expansion-panel-text>
      </v-expansion-panel>

      <v-expansion-panel>
        <v-expansion-panel-title>{{
          lang.tr("Heartbeat.TotalAllocBytes")
        }}</v-expansion-panel-title>
        <v-expansion-panel-text>
          <v-card class="mt-8 mx-auto overflow-visible">
            <v-sheet
              class="v-sheet--offset mx-auto"
              color="cyan"
              elevation="12"
              max-width="calc(100% - 32px)"
              rounded="lg"
            >
              <LineChart
                :chart-data="totalAllocBytesData"
                :options="totalAllocBytesOptions"
              />
            </v-sheet>
          </v-card>
        </v-expansion-panel-text>
      </v-expansion-panel>

      <v-expansion-panel>
        <v-expansion-panel-title>{{
          lang.tr("Heartbeat.SysBytes")
        }}</v-expansion-panel-title>
        <v-expansion-panel-text>
          <v-card class="mt-8 mx-auto overflow-visible">
            <v-sheet
              class="v-sheet--offset mx-auto"
              color="cyan"
              elevation="12"
              max-width="calc(100% - 32px)"
              rounded="lg"
            >
              <LineChart
                :chart-data="sysBytesData"
                :options="sysBytesOptions"
              />
            </v-sheet>
          </v-card>
        </v-expansion-panel-text>
      </v-expansion-panel>

      <v-expansion-panel>
        <v-expansion-panel-title>{{
          lang.tr("Heartbeat.Lookups")
        }}</v-expansion-panel-title>
        <v-expansion-panel-text>
          <v-card class="mt-8 mx-auto overflow-visible">
            <v-sheet
              class="v-sheet--offset mx-auto"
              color="cyan"
              elevation="12"
              max-width="calc(100% - 32px)"
              rounded="lg"
            >
              <LineChart :chart-data="lookupData" :options="lookupOptions" />
            </v-sheet>
          </v-card>
        </v-expansion-panel-text>
      </v-expansion-panel>

      <v-expansion-panel>
        <v-expansion-panel-title>{{
          lang.tr("Heartbeat.NumGoRoutines")
        }}</v-expansion-panel-title>
        <v-expansion-panel-text>
          <v-card class="mt-8 mx-auto overflow-visible">
            <v-sheet
              class="v-sheet--offset mx-auto"
              color="cyan"
              elevation="12"
              max-width="calc(100% - 32px)"
              rounded="lg"
            >
              <LineChart
                :chart-data="numGoRoutinesData"
                :options="numGoRoutinesOptions"
              />
            </v-sheet>
          </v-card>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
    <v-card v-else :text="lang.tr('General.NoData')"></v-card>
  </v-col>
</template>
<script setup lang="ts">
import { getHeartbeatStore } from "@/stores/HeartbeatStore";
import { getLanguageStore } from "@/stores/LanguageStore";
import { getConfigParameterStore } from "@/stores/ConfigParameterStore";
import { LineChart } from "vue-chart-3";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

const heartbeatStore = getHeartbeatStore();
const lang = getLanguageStore();
const paramStore = getConfigParameterStore();
const allocBytesOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      title: {
        display: true,
        text: getLanguageStore().tr("General.MB"),
      },
    },
  },
  x: {
    title: {
      display: true,
      text: getLanguageStore().tr("General.Timestamp"),
    },
  },
};

const allocBytesData = computed(() => {
  return {
    labels: heartbeatStore.timeSeriesAllocBytes?.labels,
    datasets: [
      {
        label: getLanguageStore().tr("Heartbeat.AllocBytesInMbPerTime"),
        backgroundColor: paramStore.getCachedParameter("heartbeat.graph.allocBytes.color")!.value,
        data: heartbeatStore.timeSeriesAllocBytes?.values,
      },
    ],
  };
});

const totalAllocBytesOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      title: {
        display: true,
        text: getLanguageStore().tr("General.MB"),
      },
    },
  },
  x: {
    title: {
      display: true,
      text: getLanguageStore().tr("General.Timestamp"),
    },
  },
};

const totalAllocBytesData = computed(() => {
  return {
    labels: heartbeatStore.timeSeriesTotalAllocBytes?.labels,
    datasets: [
      {
        label: getLanguageStore().tr("Heartbeat.TotalAllocBytesInMbPerTime"),
        backgroundColor: paramStore.getCachedParameter('heartbeat.graph.totalAllocBytes.color')!.value,
        data: heartbeatStore.timeSeriesAllocBytes?.values,
      },
    ],
  };
});

const sysBytesOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      title: {
        display: true,
        text: getLanguageStore().tr("General.MB"),
      },
    },
  },
  x: {
    title: {
      display: true,
      text: getLanguageStore().tr("General.Timestamp"),
    },
  },
};

const sysBytesData = computed(() => {
  return {
    labels: heartbeatStore.timeSeriesSysBytes?.labels,
    datasets: [
      {
        label: getLanguageStore().tr("Heartbeat.SysBytesInMbPerTime"),
        backgroundColor: paramStore.getCachedParameter('heartbeat.graph.sysBytes.color')!.value,
        data: heartbeatStore.timeSeriesAllocBytes?.values,
      },
    ],
  };
});

const lookupOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      title: {
        display: true,
        text: getLanguageStore().tr("General.Number"),
      },
    },
  },
  x: {
    title: {
      display: true,
      text: getLanguageStore().tr("General.Timestamp"),
    },
  },
};

const lookupData = computed(() => {
  return {
    labels: heartbeatStore.timeSeriesLookups?.labels,
    datasets: [
      {
        label: getLanguageStore().tr("Heartbeat.Lookups"),
        backgroundColor: paramStore.getCachedParameter('heartbeat.graph.lookups.color')!.value,
        data: heartbeatStore.timeSeriesAllocBytes?.values,
      },
    ],
  };
});

const numGoRoutinesOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      title: {
        display: true,
        text: getLanguageStore().tr("General.Number"),
      },
    },
  },
  x: {
    title: {
      display: true,
      text: getLanguageStore().tr("General.Timestamp"),
    },
  },
};
const numGoRoutinesData = computed(() => {
  return {
    labels: heartbeatStore.timeSeriesGoRoutines?.labels,
    datasets: [
      {
        label: getLanguageStore().tr("Heartbeat.NumGoRoutines"),
        backgroundColor: paramStore.getCachedParameter('heartbeat.graph.numGoRoutines.color')!.value,
        data: heartbeatStore.timeSeriesGoRoutines?.values,
      },
    ],
  };
});

const props = defineProps<{ visible: boolean }>();
</script>
<style>
.v-sheet--offset {
  top: -24px;
  position: relative;
}
</style>
