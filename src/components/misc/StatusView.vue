<template>
  <v-sheet class="pa-5" rounded>
    <v-row class="ga-3 ma-2">
      <v-text-field
        v-model="searchString"
        :label="lang.tr('General.SearchInCache')"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        hide-details
        single-line
      ></v-text-field>
      <v-btn
        prepend-icon="mdi-database-search-outline"
        :text="lang.tr('General.SearchInDb')"
        variant="tonal"
        @click="showQueryBuilderDialog = showQueryBuilderDialog ? false : true"
      />
    </v-row>
    <v-row v-if="showQueryBuilderDialog">
      <query-builder-dialog :object-type="ObjectType.OT_STATUS" @filter-ready="searchWithFilter" />
    </v-row>

    <v-data-table
      :headers="headers"
      :items="basicDataStatusStore.status"
      :search="searchString"
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
            {{ lang.tr("General.Status") }}
          </v-toolbar-title>
          <v-btn
            class="me-2"
            prepend-icon="mdi-reload"
            rounded="lg"
            :text="lang.tr('General.LoadAll')"
            @click="loadAll"
          />
          <v-btn
            class="me-2"
            prepend-icon="mdi-plus"
            rounded="lg"
            :text="lang.tr('General.Add')"
            @click="addStatus"
          />
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

      <template v-slot:item.allowedForType="{ item }">
        <span>{{ lang.trE(item.allowedForType, objectTypeItems) }}</span>
      </template>

      <template v-slot:item.isUsable="{ item }">
        <v-checkbox
          v-model="item.isUsable"
          :disabled="true"
          :label="lang.tr('Status.IsUsable')"
        />
      </template>

      <template #item.actions="{ item }">
        <div class="d-flex ga-2 justify-end">
          <v-icon
            v-if="item.baseInformation?.id != undefined"
            color="medium-emphasis"
            icon="mdi-pencil"
            size="small"
            @click="edit(item)"
          />
          <v-icon
            v-if="item.baseInformation?.id != undefined"
            color="medium-emphasis"
            icon="mdi-magnify-scan"
            size="small"
            @click="viewDetails(item)"
          />
          <v-icon
            v-if="item.baseInformation?.id != undefined"
            color="medium-emphasis"
            icon="mdi-delete"
            size="small"
            @click="showDeleteDialog(item)"
          />
        </div>
      </template>
    </v-data-table>
  </v-sheet>
  <edit-status-dialog
    :status-to-edit="statusToEdit"
    :readonly="readOnly"
    :show-edit-dialog="showEditDialog"
    @cancel="showEditDialog = false"
    @save="save"
  />
  <confirm-dialog :message="lang.trP('General.Confirm.ReallyDelete', [statusToDelete?.baseInformation?.name])" 
    :title="lang.tr('General.Delete')" 
    :visible="showConfirmDialog" 
    @cancel="showConfirmDialog = false" 
    @ok="remove"/>
</template>
<script setup lang="ts">
import type { VDataTable } from "vuetify/components";
import { ref } from "vue";
import { getBasicDataStatusStore } from "@/stores/BasicDataStatusStore";
import ConfirmDialog from "../dialogs/ConfirmDialog.vue";
import { getLanguageStore } from "@/stores/LanguageStore";
import type { ConfigParameter } from "@/generated/misc";
import EditParameterDialog from "./EditParameterDialog.vue";
import { getStatusStore } from "@/stores/StatusStore";
import type { Status } from "@/generated/status";
import { fromObjectType, type EnumItemHelper } from "@/models/EnumItemHelper";
import { ObjectType, RequestFilter } from "@/generated/orion_common";

type ReadonlyHeaders = VDataTable["$props"]["headers"];

const lang = getLanguageStore();
const searchString = ref<string>("");
const basicDataStatusStore = getBasicDataStatusStore();
const showEditDialog = ref<boolean>(false);
const showDuplicateDialog = ref<boolean>(false);
const showQueryBuilderDialog = ref<boolean>(false);
const readOnly = ref<boolean>(false);
const statusToEdit = ref<Status | undefined>(undefined);
const showConfirmDialog = ref<boolean>(false);
const statusToDelete = ref<Status | undefined>(undefined);

const objectTypeItems = ref<EnumItemHelper[]>(fromObjectType());

const headers: ReadonlyHeaders = [
  {
    title: lang.tr("General.Name"),
    key: "baseInformation.name",
    align: "start",
  },
  { title: lang.tr("General.Description"), key: "baseInformation.description" },
  { title: lang.tr("Status.AllowedForType"), key: "allowedForType" },
  { title: lang.tr("Status.IsUsable"), key: "isUsable" },
  {
    title: lang.tr("Ui.Actions"),
    key: "actions",
    align: "end",
    sortable: false,
  },
];

function addStatus() {
  edit(basicDataStatusStore.newStatus());
}

function edit(status: Status) {
  statusToEdit.value = status;
  showEditDialog.value = true;
  readOnly.value = false;
}

function viewDetails(status: Status) {
  statusToEdit.value = status;
  showEditDialog.value = true;
  readOnly.value = true;
}

function showDeleteDialog(status: Status) {
  statusToDelete.value = status;
  showConfirmDialog.value = true;
}

async function save() {
  getStatusStore().loading = true;
  await basicDataStatusStore.saveStatus(statusToEdit.value!);
  getStatusStore().loading = false;
  statusToEdit.value = undefined;
  showEditDialog.value = false;
}

async function remove() {
  if (statusToDelete == undefined) {
    return;
  }
  getStatusStore().loading = true;
  await basicDataStatusStore.deleteStatus(statusToDelete.value!);
  getStatusStore().loading = false;
  showConfirmDialog.value = false;
  statusToDelete.value = undefined;
}

async function loadAll() {
  getStatusStore().loading = true;
  await basicDataStatusStore.getAllStatus();
  getStatusStore().loading = false;
}

async function searchWithFilter(filters: RequestFilter[]) {
  getStatusStore().loading = true;
  await basicDataStatusStore.getStatusWithFilter(filters);
  getStatusStore().loading = false;
}

onMounted(async () => {
  getStatusStore().loading = true;
  await basicDataStatusStore.getAllStatus();
  getStatusStore().loading = false;
});
</script>
