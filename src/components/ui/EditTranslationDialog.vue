<!-- eslint-disable vue/no-mutating-props -->
<template>
  <v-dialog v-model="props.showEditDialog" max-width="500">
    <v-card
      v-if="props.translationToEdit != undefined"
      :title="`${lang.tr('General.Edit')} ${props.translationToEdit?.key}`"
    >
      <template #text>
        <v-row>
          <v-col cols="12">
            <v-text-field
              v-if="props.translationToEdit.id != undefined"
              v-model="props.translationToEdit.id.uuid"
              :label="lang.tr('General.Id')"
              readonly
            />
          </v-col>
          <v-col cols="12">
            <v-text-field v-model="props.translationToEdit.key" :label="lang.tr('Ui.Key')" />
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              v-model="props.translationToEdit.translation"
              :label="lang.tr('Ui.Translation')"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              v-model="props.translationToEdit.language"
              :label="lang.tr('Ui.Language')"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              v-model="props.translationToEdit.country"
              :label="lang.tr('Ui.Country')"
            />
          </v-col>

          <v-col cols="12">
            <v-text-field
              v-if="props.translationToEdit.lastChangedBy != undefined"
              :label="lang.tr('General.LastChangedBy')"
              readonly
              :v-model="props.translationToEdit.lastChangedBy"
            />
          </v-col>
          <v-col cols="12">
            <v-text-field
              v-if="props.translationToEdit.lastChangedDate != undefined"
              :label="lang.tr('General.LastChangedDate')"
              :model-value="toReadableDateTime(translationToEdit!.lastChangedDate)"
              readonly
            />
          </v-col>
        </v-row>
      </template>

      <v-divider />

      <v-card-actions class="bg-surface-light">
        <v-btn :text="lang.tr('General.Cancel')" variant="plain" @click="$emit('cancel')" />

        <v-spacer />

        <v-btn :text="lang.tr('General.Save')" @click="$emit('save')" />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script setup lang="ts">
  import type { Translation } from '@/generated/ui'
  import { getLanguageStore } from '@/stores/LanguageStore'
  import { toReadableDateTime } from '@/utils/Utils'

  const lang = getLanguageStore()

  defineEmits(['cancel', 'save'])

  const props = defineProps<{ showEditDialog: boolean, translationToEdit: Translation | undefined }>()
</script>
