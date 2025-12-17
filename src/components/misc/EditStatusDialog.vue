<template>
  <v-dialog v-model="props.showEditDialog" max-width="500">
    <v-card
      v-if="props.statusToEdit != undefined"
      :title="`${lang.tr('General.Edit')} ${
        props.statusToEdit?.baseInformation?.name
      }`"
    >
      <BaseInformationWidget
        :value="props.statusToEdit.baseInformation"
        :readonly="readonly"
        @input-changed="handleBaseInformationUpdates"
      />
      <v-select
        v-model="props.statusToEdit.allowedForType"
        :items="objectTypeItems"
        item-title="label"
        item-value="value"
        density="compact"
        class="ma-2"
        :disabled="readonly"
        :label="lang.tr('General.ObjectType')"
      />
      <v-checkbox
        v-model="props.statusToEdit.isUsable"
        :disabled="readonly"
        :label="lang.tr('Status.IsUsable')"
      />
      <v-divider />

      <v-card-actions class="bg-surface-light ga-3 ma-2">
        <v-btn
          :text="lang.tr('General.Cancel')"
          variant="plain"
          @click="$emit('cancel')" class="ga-3 ma-2"
        />

        <v-spacer />

        <v-btn
          :disabled="!canSave"
          :text="lang.tr('General.Save')"
          @click="$emit('save')" class="ga-3 ma-2"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script setup lang="ts">
import { getLanguageStore } from "@/stores/LanguageStore";
import BaseInformationWidget from "../BaseInformationWidget.vue";
import type { Status } from "@/generated/status";
import { fromObjectType, type EnumItemHelper } from "@/models/EnumItemHelper";

const canSave = ref<boolean>(false);

const lang = getLanguageStore();
const objectTypeItems = ref<EnumItemHelper[]>(fromObjectType());
const emit = defineEmits(["cancel", "save"]);

const props = defineProps<{
  showEditDialog: boolean;
  readonly: boolean;
  statusToEdit: Status | undefined;
}>();

function handleBaseInformationUpdates(newText: string, textFieldId: string) {
  //console.log(`Updated text ${newText} in field with id: ${textFieldId}`);
  if (textFieldId === "name-field" && newText.length > 0) {
    canSave.value = true;
  }
}
</script>
