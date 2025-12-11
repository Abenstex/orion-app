<template>
  <v-dialog v-model="props.showEditDialog" max-width="500">
    <v-card
      v-if="props.filterDescriptorToEdit != undefined"
      :title="`${lang.tr('General.Edit')} ${props.filterDescriptorToEdit?.key}`"
    >
    <v-form v-model="canSave">
      <v-text-field
        v-if="props.filterDescriptorToEdit.id !== undefined && props.filterDescriptorToEdit.id.uuid.length > 0"
        v-model="props.filterDescriptorToEdit.id.uuid"
        :label="lang.tr('General.Id')"
        readonly
      />
      <v-text-field
        v-model="props.filterDescriptorToEdit.key"
        :clearable="!readonly"
        :label="lang.tr('FilterDescriptor.Key')"
        :readonly="readonly"
        class="ma-2"
        :rules="[required]"
      />
      <v-select
      v-model="props.filterDescriptorToEdit.objectType"
        :items="objectTypeItems"
        item-title="label"
        item-value="value"
        density="compact"
        class="ma-2"
        :label="lang.tr('General.ObjectType')"
      />
      <v-select
      v-model="props.filterDescriptorToEdit.dataType"
        :items="dataTypeItems"
        item-title="label"
        item-value="value"
        density="compact"
        class="ma-2"
        :label="lang.tr('General.DataType')"
      />
      <v-checkbox
      class="ma-2"
        v-model="props.filterDescriptorToEdit.active"
        :disabled="readonly"
        :label="lang.tr('General.Active')"
      />
      <v-row
        v-if="props.filterDescriptorToEdit.createdDate !== undefined"
        class="ga-3 ma-2"
      >
        <v-text-field
          v-model="props.filterDescriptorToEdit.createdBy"
          :label="lang.tr('General.CreatedBy')"
          readonly
        />
        <v-text-field
          :model-value="toReadableDateTime(props.filterDescriptorToEdit!.createdDate)"
          :label="lang.tr('General.CreatedDate')"
          readonly
        />
      </v-row>
      <v-row
        v-if="props.filterDescriptorToEdit.lastUpdatedDate !== undefined"
        class="ga-3 ma-2"
      >
        <v-text-field
          v-model="props.filterDescriptorToEdit.lastUpdatedBy"
          :label="lang.tr('General.LastUpdatedBy')"
          readonly
        />
        <v-text-field
          :model-value="toReadableDateTime(props.filterDescriptorToEdit!.lastUpdatedDate)"
          :label="lang.tr('General.LastUpdatedDate')"
          readonly
        />
      </v-row>
      <v-divider />

      <v-card-actions class="bg-surface-light ga-3 ma-2">
        <v-btn
          :text="lang.tr('General.Cancel')"
          variant="plain"
          @click="$emit('cancel')"
        />

        <v-spacer />

        <v-btn
          :disabled="!canSave"
          :text="lang.tr('General.Save')"
          @click="$emit('save')"
        />
      </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>
<script setup lang="ts">
import { type RequestFilterDescriptor } from "@/generated/orion_common";
import {
  EnumItemHelper,
  fromFilterDataType,
  fromObjectType,
} from "@/models/EnumItemHelper";
import { getLanguageStore } from "@/stores/LanguageStore";
import { toReadableDateTime } from "@/utils/Utils";

const canSave = ref<boolean>(false);

const lang = getLanguageStore();

const objectTypeItems = ref<EnumItemHelper[]>(fromObjectType());
const dataTypeItems = ref<EnumItemHelper[]>(fromFilterDataType());

const emit = defineEmits(["cancel", "save"]);

const props = defineProps<{
  showEditDialog: boolean;
  readonly: boolean;
  filterDescriptorToEdit: RequestFilterDescriptor | undefined;
}>();

function required(v: string) {
  return !!v || lang.tr("General.InputRequired");
}
</script>
