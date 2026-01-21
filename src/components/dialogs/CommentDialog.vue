<template>
  <v-dialog>
    <v-card class="mx-auto" prepend-icon="mdi-comment-edit-outlin" width="400">
      <template v-slot:title>
        <span class="font-weight-black">{{ props.title }}</span>
      </template>
      <v-card-text class="bg-surface-light pt-4">
        {{ props.message }}
      </v-card-text>
    </v-card>
    <v-textarea
      v-model="commentToSave.comment"
      :hint="lang.tr('General.EnterComment')"
      max-rows="7"
      auto-grow
      persistent-hint
      clear-icon="mdi-close-circle"
      clearable
    ></v-textarea>
    <v-divider />
    <v-row class="ma-2 ga-3">
        <v-btn :text="lang.tr('General.Cancel')" variant="plain" @click="$emit('cancel')" />
        <v-spacer />
        <v-btn :disabled="commentToSave.comment.length > 0" :text="lang.tr('General.Save')" @click="$emit('save', commentToSave)" />
    </v-row>
  </v-dialog>
</template>
<script setup lang="ts">
import { Comment } from "@/generated/orion_common";
import { getLanguageStore } from "@/stores/LanguageStore";
import { getUserStore } from "@/stores/UserStore";
const lang = getLanguageStore();
const props = defineProps<{
  message: string;
  title: string;
}>();
const emit = defineEmits(["cancel", "save"]);
const commentToSave = ref<Comment>({
    comment: '',
    createdBy: getUserStore().user!.baseInformation!.name,
    createdDate: BigInt(new Date().getMilliseconds())
});
</script>
