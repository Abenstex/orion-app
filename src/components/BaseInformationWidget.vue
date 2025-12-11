<template>
  <v-col v-if="value != undefined">
    <v-text-field v-if="value.id !== undefined"
      v-model="value.id.uuid"
      :label="lang.tr('General.Id')"
      readonly
    />
    <v-text-field
      v-model="value.name"
      id="name-field"
      :clearable="!readonly"
      :label="lang.tr('General.Name')"
      :readonly="readonly"
      :rules="[required]"
      @input="updateValue"
    />
    <v-textarea
      :readonly="readonly"
      v-model="value.description"
      :clearable="!readonly"
      :label="lang.tr('General.Description')"
    />
    <v-row class="ga-3 ma-2">
      <v-text-field
        v-model="value.version"
        :clearable="!readonly"
        :label="lang.tr('General.Version')"
        :readonly="readonly"
        :rules="[required]"
        @input="updateValue"
      />
      <v-btn
        :disabled="readonly"
        size="large"
        type="submit"
        variant="elevated"
        icon="mdi-plus-box-outline"
        density="compact"
        @click="value!.version++"
      />
    </v-row>
    <v-checkbox
      v-model="value.active"
      :disabled="readonly"
      :label="lang.tr('General.Active')"
    />
    <v-row v-if="value.createdDate !== undefined" class="ga-3 ma-2">
      <v-text-field
        v-model="value.createdBy"
        :label="lang.tr('General.CreatedBy')"
        readonly
      />
      <v-text-field
        :model-value="toReadableDateTime(value!.createdDate)"
        :label="lang.tr('General.CreatedDate')"
        readonly
      />
    </v-row>
    <v-row v-if="value.lastUpdatedDate !== undefined" class="ga-3 ma-2">
      <v-text-field
        v-model="value.lastUpdatedBy"
        :label="lang.tr('General.LastUpdatedBy')"
        readonly
      />
      <v-text-field
        :model-value="toReadableDateTime(value!.lastUpdatedDate)"
        :label="lang.tr('General.LastUpdatedDate')"
        readonly
      />
    </v-row>
    <v-row v-if="value.deletedDate !== undefined" class="ga-3 ma-2">
      <v-text-field
        v-model="value.deletedBy"
        :label="lang.tr('General.DeletedBy')"
        readonly
      />
      <v-text-field
        :model-value="toReadableDateTime(value!.deletedDate)"
        :label="lang.tr('General.DeletedDate')"
        readonly 
      />
    </v-row>
  </v-col>
</template>
<script setup lang="ts">
import type { BaseInformation } from "@/generated/orion_common";
import { getLanguageStore } from "@/stores/LanguageStore";
import { toReadableDateTime } from "@/utils/Utils";

const lang = getLanguageStore();

const props = defineProps<{
  readonly: boolean;
  value: BaseInformation | undefined;
}>();

const emit = defineEmits(['inputChanged'])

function updateValue(e: any) {
    //console.log('Update value - ', e);
    emit("inputChanged", e.target.value, e.target.id);
}

function required(v: string) {
  return !!v || lang.tr("General.InputRequired");
}
</script>
