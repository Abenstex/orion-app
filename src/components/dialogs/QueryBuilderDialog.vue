<template>
  <v-sheet class="pa-5" rounded>
    <div v-for="(filter, index) in filters" :key="index">
      <v-card
        :title="filter.key"
        :text="`${lang.trE(filter.dataType, dataTypeItems)}: ${lang.trE(
          filter.function,
          filterFunctionItems
        )} = ${filter.value}`"
        :subtitle="`${lang.trE(filter.connector, filterConnectorItems)}`"
      >
        <template v-slot:actions>
          <v-btn icon="mdi-pencil" @click="editItem(filter)"></v-btn>
          <v-btn icon="mdi-delete-outline" @click="deleteItem"></v-btn>
        </template>
      </v-card>
      <v-row v-if="editMode == true && editedItem !== undefined" class="ma-2">
        <v-select
          v-model="editedItem.function"
          :items="filterFunctionItems"
          item-title="label"
          item-value="value"
          density="compact"
          class="ma-2"
          :label="lang.tr('Filter.Function')"
        />
        <v-text-field
          v-model="editedItem.value"
          :clearable="!readonly"
          :label="lang.tr('General.Value')"
        />
        <v-select
          v-model="editedItem.dataType"
          :items="dataTypeItems"
          item-title="label"
          item-value="value"
          density="compact"
          class="ma-2"
          :label="lang.tr('Filter.DataType')"
        />
        <v-select
          v-model="editedItem.connector"
          :items="filterConnectorItems"
          item-title="label"
          item-value="value"
          density="compact"
          class="ma-2"
          :label="lang.tr('Filter.Connector')"
        />
        <v-btn icon="mdi-content-save-outline" @click="close"></v-btn>
      </v-row>
    </div>
    <v-dialog v-model="showSelectionDialog">
      <v-select
        v-model="selectedDescriptor"
        :items="filterDescriptors"
        :item-props="selectionDialogProps"
        :label="lang.tr('General.FilterDescriptors')"
        required
      ></v-select>
      <v-btn
        class="me-2 ma-2"
        prepend-icon="mdi-plus"
        rounded="lg"
        :text="lang.tr('General.Close')"
        @click="closeFilterSelection"
      />
    </v-dialog>
    <v-btn
      class="me-2 ma-2"
      prepend-icon="mdi-plus"
      rounded="lg"
      @click="addFilter"
    />
    <v-btn
      class="me-2 ma-2"
      prepend-icon="mdi-database-search"
      rounded="lg"
      @click="triggerSearch"
    />
  </v-sheet>
</template>
<script setup lang="ts">
import {
  FilterConnector,
  FilterDataType,
  FilterFunction,
  RequestFilter,
  type ObjectType,
  type RequestFilterDescriptor,
} from "@/generated/orion_common";
import { getFilterDescriptorStore } from "@/stores/FilterDescriptorStore";
import { getStatusStore } from "@/stores/StatusStore";
import { getLanguageStore } from "@/stores/LanguageStore";
import type { VDataTable } from "vuetify/components";
import {
  fromFilterConnector,
  fromFilterDataType,
  fromFilterFunction,
  type EnumItemHelper,
} from "@/models/EnumItemHelper";

const filterStore = getFilterDescriptorStore();
const lang = getLanguageStore();
const filters = ref<RequestFilter[]>([]);
let filterDescriptors: RequestFilterDescriptor[] | undefined = undefined;
let editMode = ref<boolean>(false);
let editedItem: RequestFilter | undefined;
let editedIndex: number = -1;
const selectedDescriptor = ref<RequestFilterDescriptor | undefined>(undefined);
const showSelectionDialog = ref<boolean>(false);

const emit = defineEmits(['filterReady']);

const dataTypeItems = ref<EnumItemHelper[]>(fromFilterDataType());
const filterConnectorItems = ref<EnumItemHelper[]>(fromFilterConnector());
const filterFunctionItems = ref<EnumItemHelper[]>(fromFilterFunction());

const props = defineProps<{
  objectType: ObjectType;
}>();

onMounted(async () => {
  getStatusStore().loading = true;
  filterDescriptors = await filterStore.getFilterDescriptorsForObjectType(
    props.objectType
  );
  getStatusStore().loading = false;
});

function editItem(item: RequestFilter) {
  editedIndex = filters.value.indexOf(item);
  editedItem = Object.assign({}, item);
  editMode.value = true;
}

function deleteItem(item: RequestFilter) {
  const index = filters.value.indexOf(item);
  confirm(lang.tr("General.ConfirmDelete")) && filters.value.splice(index, 1);
}

function close() {
  editMode.value = false;
  filters.value[editedIndex] = Object.assign({}, editedItem);
  editedItem = undefined;
}

function save() {
  if (editedIndex > -1 && editItem !== undefined) {
    filters.value[editedIndex] = editedItem!;
  }
  close();
}

function closeFilterSelection() {
  showSelectionDialog.value = false;
  if (selectedDescriptor.value === undefined) {
    return;
  }
  filters.value.push({
    key: selectedDescriptor.value.key,
    value: "n/a",
    connector: FilterConnector.FC_AND,
    dataType: selectedDescriptor.value.dataType,
    function: FilterFunction.FF_EQUALS,
  });
  editItem(filters.value[filters.value.length - 1]!);
}

function addFilter() {
  showSelectionDialog.value = true;
}

function selectionDialogProps(item: RequestFilterDescriptor) {
  return {
    title: item.key,
    subtitle: item.key,
  };
}

function triggerSearch() {
    if (filters.value !== undefined && filters.value.length > 0) {
        emit('filterReady', filters.value);
    }
    
}
</script>
