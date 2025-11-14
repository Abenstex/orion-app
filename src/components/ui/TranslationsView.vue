<template>
    <v-sheet rounded class="pa-5">
        <v-row>
            <v-switch v-model="showOnlyUntranslated" color="primary" :label="lang.transl('Ui.ShowOnlyUntranslated')"
                hide-details @change="onShowOnlyUntranslatedChange"></v-switch>
            <v-select :label="lang.transl('Ui.Languages')" :items="lang.allLocales" :item-props="itemProps"
                v-model="selectedLocale" @change="onSelectedLocaleChanged" class="w-25 ga-3 ma-3 pa-3" max-width="150px"
                pad>
            </v-select>
        </v-row>
        <v-data-table :headers="headers" :items="translationsToShow">
            <template v-slot:top>
                <v-toolbar flat>
                    <v-toolbar-title>
                        <v-icon color="medium-emphasis" icon="mdi-book-multiple" size="x-small" start></v-icon>
                        {{ lang.translParam('Ui.TranslationsForLocale', { language: selectedLocale }) }}
                    </v-toolbar-title>

                    <v-btn class="me-2" prepend-icon="mdi-plus" rounded="lg" :text="lang.transl('General.Add')"
                        @click="addTranslation"></v-btn>
                    <v-btn class="me-2" prepend-icon="mdi-plus" rounded="lg" :text="lang.transl('General.Add')"
                        @click="addLocale"></v-btn>
                </v-toolbar>
            </template>

            <template v-slot:item.title="{ value }">
                <v-chip :text="value" class="thin opacity-25" prepend-icon="mdi-book" label>
                    <template v-slot:prepend>
                        <v-icon color="medium-emphasis"></v-icon>
                    </template>
                </v-chip>
            </template>

            <template v-slot:item.actions="{ item }">
                <div class="d-flex ga-2 justify-end">
                    <v-icon color="medium-emphasis" icon="mdi-pencil" size="small" @click="edit(item.key)"></v-icon>

                    <v-icon color="medium-emphasis" icon="mdi-delete" size="small" @click="remove(item.key)"></v-icon>
                </div>
            </template>
        </v-data-table>
    </v-sheet>

    <v-dialog v-model="showEditDialog" max-width="500">
        <v-card v-if="translationToEdit != undefined"
            :title="`${lang.transl('General.Edit')} ${translationToEdit?.key}`">
            <template v-slot:text>
                <v-row>
                    <v-col cols="12">
                        <v-text-field v-if="translationToEdit.iD != undefined" readonly
                            v-model="translationToEdit.iD.uuid" :label="lang.transl('General.Id')"></v-text-field>
                    </v-col>
                    <v-col cols="12">
                        <v-text-field v-model="translationToEdit.key" :label="lang.transl('Ui.Key')"></v-text-field>
                    </v-col>

                    <v-col cols="12" md="6">
                        <v-text-field v-model="translationToEdit.translation"
                            :label="lang.transl('Ui.Translation')"></v-text-field>
                    </v-col>

                    <v-col cols="12" md="6">
                        <v-text-field v-model="translationToEdit.language"
                            :label="lang.transl('Ui.Language')"></v-text-field>
                    </v-col>

                    <v-col cols="12" md="6">
                        <v-text-field v-model="translationToEdit.country"
                            :label="lang.transl('Ui.Country')"></v-text-field>
                    </v-col>

                    <v-col cols="12">
                        <v-text-field readonly v-if="translationToEdit.lastChangedBy != undefined"
                            :v-model="translationToEdit.lastChangedBy"
                            :label="lang.transl('General.LastChangedBy')"></v-text-field>
                    </v-col>
                    <v-col cols="12">
                        <v-text-field readonly v-if="translationToEdit.lastChangedDate != undefined"
                            :model-value="toReadableDateTime(translationToEdit.lastChangedDate)"
                            :label="lang.transl('General.LastChangedDate')"></v-text-field>
                    </v-col>
                </v-row>
            </template>

            <v-divider></v-divider>

            <v-card-actions class="bg-surface-light">
                <v-btn text="Cancel" variant="plain" @click="showEditDialog = false"></v-btn>

                <v-spacer></v-spacer>

                <v-btn text="Save" @click="save"></v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
<script setup lang="ts">
import { Translation, TranslLocale } from '@/generated/ui';
import { useAppStore } from '@/stores/app';
import { getLanguageStore } from '@/stores/LanguageStore';
import { ref } from 'vue'
import type { VDataTable } from 'vuetify/components'
import { toReadableDateTime } from '@/utils/Utils';
import { getStatusStore } from '@/stores/StatusStore';

type ReadonlyHeaders = VDataTable['$props']['headers']

const lang = getLanguageStore();
const showEditDialog = ref<boolean>(false);
const showOnlyUntranslated = ref<boolean>(true);
let selectedLocale = ref<TranslLocale>(useAppStore().selectedLocale);
let translationToEdit = ref<Translation | undefined>(undefined);

const headers: ReadonlyHeaders = [
    { title: lang.transl('Ui.Key'), key: 'key', align: 'start' },
    { title: lang.transl('Ui.Translation'), key: 'translation' },
    { title: lang.transl('Ui.Actions'), key: 'actions', align: 'end', sortable: false },
]

let translationsToShow = ref<Translation[]>(lang.untranslatedTranslations?.values()!);

const onShowOnlyUntranslatedChange = () => {
    if (showOnlyUntranslated.value) {
        translationsToShow.value = lang.untranslatedTranslations?.values()!;
    } else {
        translationsToShow.value = lang.loadedTranslations;
    }
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
    }
}

onMounted(async () => {
    getStatusStore().loading = true;
    await lang.getAllLocales();
    getStatusStore().loading = false;
})

function addLocale() {

}

function addTranslation() {

}

async function save() {
    getStatusStore().loading = true;
    await lang.saveTranslation(translationToEdit.value!);
    getStatusStore().loading = false;
    showEditDialog.value = false;
}

function edit(key: string) {
    for (const trans of translationsToShow.value) {
        if (trans.key == key) {
            translationToEdit.value = trans;
            console.log('Translation key to edit - ', translationToEdit.value.key);
            console.log('Translation to edit - ', JSON.stringify(translationToEdit.value));
            showEditDialog.value = true;
            break;
        }
    }
}

function remove(key: string) {

}

</script>