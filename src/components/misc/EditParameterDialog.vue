<template>
  <v-dialog v-model="props.showEditDialog" max-width="500">
    <v-card
      v-if="props.parameterToEdit != undefined"
      :title="`${lang.tr('General.Edit')} ${
        props.parameterToEdit?.baseInformation?.name
      }`"
    >
      <BaseInformationWidget
        :value="props.parameterToEdit.baseInformation"
        :readonly="readonly" @input-changed="handleBaseInformationUpdates"
      />
      <v-text-field
        v-model="props.parameterToEdit.section"
        :clearable="!readonly"
        :label="lang.tr('Parameter.Section')"
        :readonly="readonly" class="ma-2"
      />
      <v-text-field
        v-model="props.parameterToEdit.group"
        :clearable="!readonly"
        :label="lang.tr('Parameter.Group')"
        :readonly="readonly" class="ma-2"
      />
      <v-text-field
        v-model="props.parameterToEdit.value"
        :clearable="!readonly"
        :label="lang.tr('General.Value')"
        :readonly="readonly"
        :rules="[required]" class="ma-2"
      />
    <v-divider />

      <v-card-actions class="bg-surface-light ga-3 ma-2">
        <v-btn :text="lang.tr('General.Cancel')" variant="plain" @click="$emit('cancel')" />

        <v-spacer />

        <v-btn :disabled="!canSave" :text="lang.tr('General.Save')" @click="$emit('save')" />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script setup lang="ts">
import type { ConfigParameter } from "@/generated/misc";
import type { BaseInformation } from "@/generated/orion_common";
import { getLanguageStore } from "@/stores/LanguageStore";
import { toReadableDateTime } from "@/utils/Utils";
import BaseInformationWidget from "../BaseInformationWidget.vue";

const canSave = ref<boolean>(false);

const lang = getLanguageStore();

const emit = defineEmits(["cancel", "save"]);

const props = defineProps<{
  showEditDialog: boolean;
  readonly: boolean;
  parameterToEdit: ConfigParameter | undefined;
}>();

function required(v: string) {
  return !!v || lang.tr("General.InputRequired");
}

function handleBaseInformationUpdates(newText: string, textFieldId: string) {
  //console.log(`Updated text ${newText} in field with id: ${textFieldId}`);
  if (textFieldId === 'name-field' && newText.length > 0) {
    canSave.value = true;
  }
}

</script>
