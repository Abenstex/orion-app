<!-- eslint-disable vue/no-mutating-props -->
<template>
  <v-dialog v-model="props.visible" max-width="500">
    <v-card
      v-if="props.originalLocale != undefined"
      :title="`${lang.tr('General.Edit')} ${props.originalLocale}`"
    >
      <template #text>
        <v-col cols="12">
          <v-text-field
            v-model="props.originalLocale"
            :label="lang.tr('Ui.OriginalLocale')"
            readonly
          />
        </v-col>
        <v-col cols="12">
          <v-text-field v-model="newLocale.language" :label="lang.tr('Ui.Language')" />
        </v-col>

        <v-col cols="12" md="6">
          <v-text-field
            v-model="newLocale.country"
            :label="lang.tr('Ui.Country')"
          />
        </v-col>
      </template>

      <v-divider />

      <v-card-actions class="bg-surface-light">
        <v-btn :text="lang.tr('General.Cancel')" variant="plain" @click="$emit('cancel')" />

        <v-spacer />

        <v-btn :text="lang.tr('General.Save')" @click="$emit('save', newLocale)" />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script setup lang="ts">
  import type { TranslLocale } from '@/generated/ui'
  import { getLanguageStore } from '@/stores/LanguageStore'

  defineEmits(['cancel', 'save'])
  const props = defineProps<{ originalLocale: string | undefined, visible: boolean }>()

  const lang = getLanguageStore()
  const newLocale = ref<TranslLocale>({ language: '', country: '' })
</script>
