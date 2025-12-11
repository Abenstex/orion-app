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
    </v-row>

    <v-data-table :headers="headers" :items="filterStore.filterDescriptors" :search="searchString">
      <template #top>
        <v-toolbar flat>
          <v-toolbar-title>
            <v-icon
              color="medium-emphasis"
              icon="mdi-book-multiple"
              size="x-small"
              start
            />
            {{ lang.tr("Config.FilterDescriptors") }}
          </v-toolbar-title>

          <v-btn
            class="me-2"
            prepend-icon="mdi-plus"
            rounded="lg"
            :text="lang.tr('General.Add')"
            @click="addFilterDescriptor"
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

      <template v-slot:item.createdDate="{ item }">
        <span>{{ new Date(Number(item.createdDate)).toLocaleString() }}</span>
      </template>

      <template #item.actions="{ item }">
        <div class="d-flex ga-2 justify-end">
          <v-icon
            v-if="item.id != undefined"
            color="medium-emphasis"
            icon="mdi-pencil"
            size="small"
            @click="edit(item)"
          />
          <v-icon
            v-if="item.id != undefined"
            color="medium-emphasis"
            icon="mdi-magnify-scan"
            size="small"
            @click="viewDetails(item)"
          />
          <v-icon
            v-if="item.id != undefined"
            color="medium-emphasis"
            icon="mdi-delete"
            size="small"
            @click="showDeleteDialog(item)"
          />
        </div>
      </template>
    </v-data-table>
  </v-sheet>
  <edit-request-filter-descriptor-dialog
    :filter-descriptor-to-edit="filterDescriptorToEdit"
    :readonly="readOnly"
    :show-edit-dialog="showEditDialog"
    @cancel="showEditDialog = false"
    @save="save"
  />
</template>
<script setup lang="ts">
import type { VDataTable } from "vuetify/components";
import { ref } from "vue";
import ConfirmDialog from "../dialogs/ConfirmDialog.vue";
import { getLanguageStore } from "@/stores/LanguageStore";
import { getStatusStore } from "@/stores/StatusStore";
import { getFilterDescriptorStore } from "@/stores/FilterDescriptorStore";
import type { RequestFilterDescriptor } from "@/generated/orion_common";

type ReadonlyHeaders = VDataTable["$props"]["headers"];

const lang = getLanguageStore();
const searchString = ref<string>("");
const filterStore = getFilterDescriptorStore();
const showEditDialog = ref<boolean>(false);
const readOnly = ref<boolean>(false);
const filterDescriptorToEdit = ref<RequestFilterDescriptor | undefined>(undefined);
const showConfirmDialog = ref<boolean>(false);
const filterDescriptorToDelete = ref<RequestFilterDescriptor | undefined>(undefined);

const headers: ReadonlyHeaders = [
  {
    title: lang.tr("General.ObjectType"),
    key: "objectType",
    align: "start",
  },
  { title: lang.tr("General.Key"), key: "key" },
  { title: lang.tr("General.DataType"), key: "dataType" },
  { title: lang.tr("General.CreatedDate"), key: "createdDate" },
  { title: lang.tr("General.CreatedBy"), key: "createdBy" },
  {
    title: lang.tr("Ui.Actions"),
    key: "actions",
    align: "end",
    sortable: false,
  },
];

onMounted(() => {
    getStatusStore().loading = true;
    filterStore.getAllFilterDescriptors();
    getStatusStore().loading = false;
})

function addFilterDescriptor() {
    edit(filterStore.newFilterDescriptor());
}

function edit(filterDescriptor: RequestFilterDescriptor) {
  filterDescriptorToEdit.value = filterDescriptor;
  showEditDialog.value = true;
  readOnly.value = false;
}

function viewDetails(filterDescriptor: RequestFilterDescriptor) {
  filterDescriptorToEdit.value = filterDescriptor;
  showEditDialog.value = true;
  readOnly.value = true;
}

function showDeleteDialog(filterDescriptor: RequestFilterDescriptor) {
  filterDescriptorToDelete.value = filterDescriptor;
}

async function save() {
  getStatusStore().loading = true;
  await filterStore.saveFilterDescriptor(filterDescriptorToEdit.value!);
  getStatusStore().loading = false;
  filterDescriptorToEdit.value = undefined;
  showEditDialog.value = false;
}

</script>