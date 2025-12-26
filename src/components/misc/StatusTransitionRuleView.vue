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
      <query-builder-dialog :object-type="ObjectType.OT_STATUS_TRANSITION_RULE" @filter-ready="searchWithFilter" />
    </v-row>

    <v-data-table
      :headers="headers"
      :items="ruleStore.rules"
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
            {{ lang.tr("General.StatusTransitionRule") }}
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
            @click="addRule"
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

      <template v-slot:item.fromStatus="{ item }">
        <span>{{ item.fromStatus!.baseInformation!.name }}</span>
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
  <edit-status-transition-rule-dialog
    :rule-to-edit="ruleToEdit"
    :readonly="readOnly"
    :show-edit-dialog="showEditDialog"
    @cancel="showEditDialog = false"
    @save="save"
  />
  <confirm-dialog :message="lang.trP('General.Confirm.ReallyDelete', [ruleToDelete?.baseInformation?.name])" 
    :title="lang.tr('General.Delete')" 
    :visible="showConfirmDialog" 
    @cancel="showConfirmDialog = false" 
    @ok="remove"/>    
</template>
<script setup lang="ts">
import { ObjectType, type RequestFilter } from "@/generated/orion_common";
import type { StatusTransitionRule } from "@/generated/status";
import { getLanguageStore } from "@/stores/LanguageStore";
import { getStatusStore } from "@/stores/StatusStore";
import { getStatusTransitionRuleStore } from "@/stores/StatusTransitionRuleStore";
import type { VDataTable } from "vuetify/components/VDataTable";

type ReadonlyHeaders = VDataTable["$props"]["headers"];

const lang = getLanguageStore();
const searchString = ref<string>("");
const ruleStore = getStatusTransitionRuleStore();
const showEditDialog = ref<boolean>(false);
const showQueryBuilderDialog = ref<boolean>(false);
const readOnly = ref<boolean>(false);
const ruleToEdit = ref<StatusTransitionRule | undefined>(undefined);
const showConfirmDialog = ref<boolean>(false);
const ruleToDelete = ref<StatusTransitionRule | undefined>(undefined);

const headers: ReadonlyHeaders = [
  {
    title: lang.tr("General.Name"),
    key: "baseInformation.name",
    align: "start",
  },
  { title: lang.tr("General.Description"), key: "baseInformation.description" },
  { title: lang.tr("StatusRule.FromStatus"), key: "fromStatus" },
  {
    title: lang.tr("Ui.Actions"),
    key: "actions",
    align: "end",
    sortable: false,
  },
];

function addRule() {
  edit(ruleStore.newStatusTransitionRule());
}

function edit(rule: StatusTransitionRule) {
  ruleToEdit.value = rule;
  showEditDialog.value = true;
  readOnly.value = false;
}

function viewDetails(rule: StatusTransitionRule) {
  ruleToEdit.value = rule;
  showEditDialog.value = true;
  readOnly.value = true;
}

function showDeleteDialog(status: StatusTransitionRule) {
  ruleToDelete.value = status;
  showConfirmDialog.value = true;
}

async function save() {
  getStatusStore().loading = true;
  await ruleStore.saveRule(ruleToEdit.value!);
  getStatusStore().loading = false;
  ruleToEdit.value = undefined;
  showEditDialog.value = false;
}

async function remove() {
  if (ruleToDelete == undefined) {
    return;
  }
  getStatusStore().loading = true;
  await ruleStore.deleteRule(ruleToDelete.value!);
  getStatusStore().loading = false;
  showConfirmDialog.value = false;
  ruleToDelete.value = undefined;
}

async function loadAll() {
  getStatusStore().loading = true;
  await ruleStore.getRules();
  getStatusStore().loading = false;
}

async function searchWithFilter(filters: RequestFilter[]) {
  getStatusStore().loading = true;
  await ruleStore.getRules(filters);
  getStatusStore().loading = false;
}

onMounted(async () => {
  loadAll();
});
</script>
