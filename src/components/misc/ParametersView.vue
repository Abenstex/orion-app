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
      <v-btn prepend-icon="mdi-database-search-outline" :text="lang.tr('General.SearchInDb')" variant="tonal" @click="showQueryBuilderDialog = true" />
    </v-row>

    <v-data-table :headers="headers" :items="parameterStore.parameters" :search="searchString">
      <template #top>
        <v-toolbar flat>
          <v-toolbar-title>
            <v-icon
              color="medium-emphasis"
              icon="mdi-book-multiple"
              size="x-small"
              start
            />
            {{ lang.tr("Config.Parameters") }}
          </v-toolbar-title>

          <v-btn
            class="me-2"
            prepend-icon="mdi-plus"
            rounded="lg"
            :text="lang.tr('General.Add')"
            @click="addParameter"
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
  <edit-parameter-dialog
    :parameter-to-edit="parameterToEdit"
    :readonly="readOnly"
    :show-edit-dialog="showEditDialog"
    @cancel="showEditDialog = false"
    @save="save"
  />
</template>
<script setup lang="ts">
import type { VDataTable } from "vuetify/components";
import { ref } from "vue";
import { getConfigParameterStore } from "@/stores/ConfigParameterStore";
import ConfirmDialog from "../dialogs/ConfirmDialog.vue";
import { getLanguageStore } from "@/stores/LanguageStore";
import type { ConfigParameter } from "@/generated/misc";
import EditParameterDialog from "./EditParameterDialog.vue";
import { getStatusStore } from "@/stores/StatusStore";

type ReadonlyHeaders = VDataTable["$props"]["headers"];

const lang = getLanguageStore();
const searchString = ref<string>("");
const parameterStore = getConfigParameterStore();
const showEditDialog = ref<boolean>(false);
const showDuplicateDialog = ref<boolean>(false);
const showQueryBuilderDialog = ref<boolean>(false);
const readOnly = ref<boolean>(false);
const parameterToEdit = ref<ConfigParameter | undefined>(undefined);
const showConfirmDialog = ref<boolean>(false);
const parameterToDelete = ref<ConfigParameter | undefined>(undefined);

const headers: ReadonlyHeaders = [
  {
    title: lang.tr("General.Name"),
    key: "baseInformation.name",
    align: "start",
  },
  { title: lang.tr("General.Description"), key: "baseInformation.description" },
  { title: lang.tr("Config.Section"), key: "section" },
  { title: lang.tr("Config.Group"), key: "group" },
  { title: lang.tr("Config.ParameterType"), key: "parameterType" },
  { title: lang.tr("Config.Value"), key: "value" },
  {
    title: lang.tr("Ui.Actions"),
    key: "actions",
    align: "end",
    sortable: false,
  },
];

function addParameter() {
  edit(parameterStore.newParameter());
}

function edit(param: ConfigParameter) {
  parameterToEdit.value = param;
  showEditDialog.value = true;
  readOnly.value = false;
}

function viewDetails(param: ConfigParameter) {
  parameterToEdit.value = param;
  showEditDialog.value = true;
  readOnly.value = true;
}

function showDeleteDialog(param: ConfigParameter) {
  parameterToDelete.value = param;
}

async function save() {
  getStatusStore().loading = true;
  await parameterStore.saveParameter(parameterToEdit.value!);
  getStatusStore().loading = false;
  parameterToEdit.value = undefined;
  showEditDialog.value = false;
}
</script>
