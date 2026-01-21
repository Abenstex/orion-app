<template>
  <v-row>
    <v-select
      v-model="props.currentStatus"
      pad
      class="w-25 ga-3 ma-3 pa-3"
      :items="getBasicDataStatusStore().status"
      :item-props="itemProps"
      density="compact"
      :label="lang.tr('General.Status')"
    />
    <v-btn :text="lang.tr('General.Save')" @click="changeStatus" />
  </v-row>
  <comment-dialog v-if="showCommentDialog" 
    :message="lang.trP('General.Comment.', [props.baseInfo.name])" 
    :title="lang.tr('General.AddComment')"
    @save="saveComment"
    @cancel="showCommentDialog = false"
    />
</template>
<script setup lang="ts">
import {
  BaseInformation,
  FilterConnector,
  FilterDataType,
    FilterFunction,
  Comment,
  ObjectType,
} from "@/generated/orion_common";
import type { Status } from "@/generated/status";
import { getStatusStore } from "@/stores/StatusStore";
import { getBasicDataStatusStore } from "@/stores/BasicDataStatusStore";
import { getLanguageStore } from "@/stores/LanguageStore";
import { getConfigParameterStore } from "@/stores/ConfigParameterStore";

const lang = getLanguageStore();
var originalStatus: Status | undefined = undefined;
const showCommentDialog = ref<boolean>(false);
const commentToSave = ref<Comment | undefined>(undefined);
const paramStore = getConfigParameterStore();

const props = defineProps<{
  objectType: ObjectType;
  currentStatus: Status;
  baseInfo: BaseInformation;
}>();

function itemProps(item: Status) {
  return {
    title: item.baseInformation?.name,
    subtitle: item.baseInformation?.description,
  };
}

function saveComment(comment: Comment) {
  commentToSave.value = comment;
  showCommentDialog.value = false;
}

async function changeStatus() {
    if (paramStore.getCachedParameter(`general.addComment.${ObjectType[props.baseInfo.objectType].toString()}`) !== undefined &&
    paramStore.getCachedParameter(`general.addComment.${ObjectType[props.baseInfo.objectType].toString()}`)?.value.toString() === "1") {
    showCommentDialog.value = true;
  }
    getStatusStore().loading = true;
    await getBasicDataStatusStore().changeStatus(props.baseInfo, originalStatus!, props.currentStatus, commentToSave.value);
    getStatusStore().loading = false;
}

onMounted(async () => {
  originalStatus = props.currentStatus;
  getStatusStore().loading = true;
  await getBasicDataStatusStore().getStatusWithFilter([
    {
      key: "allowed_for_type",
      value: props.objectType.toString(),
      function: FilterFunction.FF_EQUALS,
      connector: FilterConnector.FC_AND,
      dataType: FilterDataType.FDT_NUMERIC,
    },
  ]);
  getStatusStore().loading = false;
});
</script>
