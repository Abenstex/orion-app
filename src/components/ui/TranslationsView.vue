<template>
  <v-sheet class="pa-5" rounded>
    <v-row>
      <v-switch
        v-model="showOnlyUntranslated"
        color="primary"
        hide-details
        :label="lang.tr('Ui.ShowOnlyUntranslated')"
        @change="onShowOnlyUntranslatedChange"
      />
      <v-select
        v-model="selectedLocale"
        class="w-25 ga-3 ma-3 pa-3"
        :item-props="itemProps"
        :items="lang.allLocales"
        :label="lang.tr('Ui.Languages')"
        max-width="150px"
        pad
        @change="onSelectedLocaleChanged"
      />
    </v-row>
    <v-data-table :headers="headers" :items="translationsToShow">
      <template #top>
        <v-toolbar flat>
          <v-toolbar-title>
            <v-icon
              color="medium-emphasis"
              icon="mdi-book-multiple"
              size="x-small"
              start
            />
            {{ lang.trP("Ui.TranslationsForLocale", [selectedLocale]) }}
          </v-toolbar-title>

          <v-btn
            class="me-2"
            prepend-icon="mdi-plus"
            rounded="lg"
            :text="lang.tr('General.Add')"
            @click="addTranslation"
          />
          <v-btn
            class="me-2"
            prepend-icon="mdi-plus"
            rounded="lg"
            :text="lang.tr('General.AddLocale')"
            @click="addLocale"
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
            color="medium-emphasis"
            icon="mdi-pencil"
            size="small"
            @click="edit(item.key)"
          />

          <v-icon v-if="item.id != undefined"
            color="medium-emphasis"
            icon="mdi-delete"
            size="small"
            @click="showDeleteDialog(item.id!.uuid)"
          />
        </div>
      </template>
    </v-data-table>
  </v-sheet>

  <edit-translation-dialog
    :show-edit-dialog="showEditDialog"
    :translation-to-edit="translationToEdit"
    @cancel="showEditDialog = false"
    @save="save"
  />
  <duplicate-locale-dialog
    :original-locale="selectedLocale.language"
    :visible="showDuplicateDialog"
    @cancel="showDuplicateDialog = false"
    @save="duplicateLocale"
  />
  <confirm-dialog :message="lang.trP('General.Confirm.ReallyDelete', [translationToDelete?.key])" 
    :title="lang.tr('General.Delete')" 
    :visible="showConfirmDialog" 
    @cancel="showConfirmDialog = false" 
    @ok="remove"/>

</template>
<script setup lang="ts">
import type { VDataTable } from "vuetify/components";
import type { Translation, TranslLocale } from "@/generated/ui";
import { ref } from "vue";
import { useAppStore } from "@/stores/app";
import { getLanguageStore } from "@/stores/LanguageStore";
import { getStatusStore } from "@/stores/StatusStore";
import ConfirmDialog from "../dialogs/ConfirmDialog.vue";

type ReadonlyHeaders = VDataTable["$props"]["headers"];

const lang = getLanguageStore();
const showEditDialog = ref<boolean>(false);
const showDuplicateDialog = ref<boolean>(false);
const showOnlyUntranslated = ref<boolean>(true);
const selectedLocale = ref<TranslLocale>(useAppStore().selectedLocale);
const translationToEdit = ref<Translation | undefined>(undefined);
const showConfirmDialog = ref<boolean>(false);
const translationToDelete = ref<Translation | undefined>(undefined);

const headers: ReadonlyHeaders = [
  { title: lang.tr("Ui.Key"), key: "key", align: "start" },
  { title: lang.tr("Ui.Translation"), key: "translation" },
  {
    title: lang.tr("Ui.Actions"),
    key: "actions",
    align: "end",
    sortable: false,
  },
];

const translationsToShow = ref<Translation[] | undefined>(
  lang.untranslatedTranslations?.values()
);

function onShowOnlyUntranslatedChange() {
  let transls: Translation[] | undefined = [];
  transls = showOnlyUntranslated.value
    ? lang.untranslatedTranslations?.values()
    : lang.loadedTranslations;
  translationsToShow!.value = transls!;
  //console.log('Translations to show: ', translationsToShow.value[0]?.id, ' // ',JSON.stringify(translationsToShow.value[0]!));
}

async function onSelectedLocaleChanged() {
  getStatusStore().loading = true;
  await lang.getTranslationsForLocale(selectedLocale.value);
  getStatusStore().loading = false;
}

function itemProps(item: TranslLocale) {
  return {
    title: item.language,
    subtitle: item.country,
  };
}

async function duplicateLocale(locale: TranslLocale) {
  getStatusStore().loading = true;
  await lang.duplicateLocale(locale, selectedLocale.value.language);
  getStatusStore().loading = false;
  showDuplicateDialog.value = false;
}

onMounted(async () => {
  getStatusStore().loading = true;
  await lang.getAllLocales();
  getStatusStore().loading = false;
});

function addLocale() {
  showDuplicateDialog.value = true;
}

function addTranslation() {
  translationToEdit.value = {
    key: "",
    language: selectedLocale.value.language,
    country: selectedLocale.value.country,
    translation: "",
  };
  showEditDialog.value = true;
}

async function showDeleteDialog (id: string) {
  for (const trans of translationsToShow.value!) {
    //console.log('Translation: ', trans);
    if (trans.id != undefined && trans.id!.uuid === id) {
      translationToDelete.value = trans;
      showConfirmDialog.value = true;
      break;
    }
  }
}

async function save() {
  getStatusStore().loading = true;
  await lang.saveTranslation(translationToEdit.value!);
  onShowOnlyUntranslatedChange();
  getStatusStore().loading = false;
  showEditDialog.value = false;
}

function edit(key: string) {
  for (const trans of translationsToShow.value!) {
    if (trans.key == key) {
      translationToEdit.value = trans;
      showEditDialog.value = true;
      break;
    }
  }
}

async function remove() {
  if (translationToDelete == undefined) {
    return;
  }
  getStatusStore().loading = true;
  await lang.deleteTranslation(translationToDelete.value!.id!.uuid);
  onShowOnlyUntranslatedChange();
  getStatusStore().loading = false;
  showEditDialog.value = false;
}
</script>
