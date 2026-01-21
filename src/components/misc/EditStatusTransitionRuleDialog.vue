<template>
  <v-dialog v-model="props.showEditDialog" min-width="500">
    <v-card
      v-if="props.ruleToEdit != undefined"
      :title="`${lang.tr('General.Edit')} ${
        props.ruleToEdit?.baseInformation?.name
      }`"
    >
      <BaseInformationWidget
        :value="props.ruleToEdit.baseInformation"
        :readonly="readonly"
        @input-changed="handleBaseInformationUpdates"
      />
      <v-select
        v-model="selectedObjectType"
        :items="objectTypeItems"
        :readonly="ruleToEdit?.baseInformation?.id !== undefined"
        item-title="label"
        item-value="value"
        density="compact"
        class="ma-2"
        :label="lang.tr('General.ObjectType')"
      />
      <v-list
        v-model="fromStatus"
        lines="three"
        select-strategy="leaf" min-height="200"
      >
        <v-list-subheader>{{ lang.tr('StatusRule.FromStatus') }}</v-list-subheader>
        <v-list-item
          v-for="item in fromStatus"
          :key="item.info?.id?.uuid"
          :subtitle="item.info?.description"
          :title="item.info?.name"
          :value="item.info"
        >
          <template v-slot:prepend="{ isSelected, select }">
            <v-list-item-action start>
              <v-checkbox
                v-model="item.selected"
                @change="onFromStatusSelected(item)"
                :disabled="!item.isSelectable"
              ></v-checkbox>
            </v-list-item-action>
          </template>
        </v-list-item>
      </v-list>
      <v-list
        v-model="toStatus"
        lines="three"
        select-strategy="leaf" min-height="200"
      >
        <v-list-subheader>{{ lang.tr('StatusRule.ToStatus') }}</v-list-subheader>
        <v-list-item
          v-for="item in toStatus"
          :key="item.info?.id?.uuid"
          :subtitle="item.info?.description"
          :title="item.info?.name"
          :value="item.info"
        >
          <template v-slot:prepend="{ isSelected, select }">
            <v-list-item-action start>
              <v-checkbox
                v-model="item.selected"
                :disabled="!item.isSelectable"
                @change="onToStatusSelected(item)"
              ></v-checkbox>
            </v-list-item-action>
          </template>
        </v-list-item>
      </v-list>
      <v-divider />

      <v-card-actions class="bg-surface-light ga-3 ma-2">
        <v-btn
          :text="lang.tr('General.Cancel')"
          variant="plain"
          @click="$emit('cancel')"
          class="ga-3 ma-2"
        />

        <v-spacer />

        <v-btn
          :disabled="!canSave"
          :text="lang.tr('General.Save')"
          @click="$emit('save')"
          class="ga-3 ma-2"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script setup lang="ts">
import { getLanguageStore } from "@/stores/LanguageStore";
import { getBasicDataStatusStore } from "@/stores/BasicDataStatusStore";
import BaseInformationWidget from "../BaseInformationWidget.vue";
import { Status, type StatusTransitionRule } from "@/generated/status";
import { getStatusStore } from "@/stores/StatusStore";
import { EnumItemHelper, fromObjectType } from "@/models/EnumItemHelper";
import {
  FilterConnector,
  FilterDataType,
  FilterFunction,
  type ObjectType,
} from "@/generated/orion_common";
import type { SelectableBaseInformation } from "@/models/SelectableBaseInformation";

const canSave = ref<boolean>(false);

const lang = getLanguageStore();
const basicStatusStore = getBasicDataStatusStore();
const emit = defineEmits(["cancel", "save"]);
const fromStatus = ref<SelectableBaseInformation[]>([]);
const toStatus = ref<SelectableBaseInformation[]>([]);
const objectTypeItems = ref<EnumItemHelper[]>(fromObjectType());
const selectedObjectType = ref<ObjectType>();

const props = defineProps<{
  showEditDialog: boolean;
  readonly: boolean;
  ruleToEdit: StatusTransitionRule | undefined;
}>();

onUpdated(async () => {
  getStatusStore().loading = true;
  if (
    props.ruleToEdit?.baseInformation !== undefined &&
    props.ruleToEdit.fromStatus !== undefined
  ) {
    selectedObjectType.value = props.ruleToEdit.fromStatus!.allowedForType;
    await basicStatusStore.getStatusWithFilter([
      {
        key: "allowed_for_type",
        value: selectedObjectType.value.toString(),
        function: FilterFunction.FF_EQUALS,
        connector: FilterConnector.FC_AND,
        dataType: FilterDataType.FDT_NUMERIC,
      },
    ]);
    fromStatus.value = basicStatusStore.toSelectableBaseInformation();
    toStatus.value = basicStatusStore.toSelectableBaseInformation();
  }
  if (props.ruleToEdit?.baseInformation === undefined && props.ruleToEdit?.baseInformation!.name.length == 0
    && props.ruleToEdit?.fromStatus === undefined
    && props.ruleToEdit.possibleNextStatus.length == 0) {
    canSave.value = false;
  } else {
    canSave.value = true;
  }
  getStatusStore().loading = false;
});

function onFromStatusSelected(status: SelectableBaseInformation) {
  console.log(`Selection changed: ${JSON.stringify(status)}`);
  for (const from of fromStatus.value) {
    if (from.info?.id?.uuid === status.info?.id?.uuid) {
      continue;
    }
    if (from.selected) {
      from.selected = false;
    }
  }
  for (const to of toStatus.value) {
    if (to.info?.id?.uuid === status.info?.id?.uuid && status.selected) {
      to.isSelectable = false;
    } else {
      to.isSelectable = true;
    }
  }
  props.ruleToEdit!.fromStatus = status.infoObject as Status;
}

function onToStatusSelected(status: SelectableBaseInformation) {
  const selectedStatus = status.infoObject as Status;
  if (status.selected) {
    props.ruleToEdit!.possibleNextStatus.push(selectedStatus);
  } else {
    props.ruleToEdit!.possibleNextStatus = props.ruleToEdit!.possibleNextStatus.filter(stat => stat.baseInformation!.id!.uuid !== status.info?.id!.uuid);
  }
}

function handleBaseInformationUpdates(newText: string, textFieldId: string) {
  //console.log(`Updated text ${newText} in field with id: ${textFieldId}`);
  if (textFieldId === "name-field" && newText.length > 0) {
    canSave.value = true;
  }
}
</script>

