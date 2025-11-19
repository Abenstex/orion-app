<template>
  <v-dialog v-model="props.visible" max-width="500">
    <v-card :text="props.message" :title="props.title">
      <v-card-actions class="bg-surface-light">
        <v-btn
          :text="lang.tr('General.Cancel')"
          variant="plain"
          @click="$emit('cancel')"
        />

        <v-spacer />

        <v-btn :text="lang.tr('General.Ok')" @click="$emit('ok')" />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script setup lang="ts">
import type { TranslLocale } from "@/generated/ui";
import { getLanguageStore } from "@/stores/LanguageStore";

defineEmits(["cancel", "ok"]);
const props = defineProps<{
  message: string;
  title: string;
  visible: boolean;
}>();

const lang = getLanguageStore();
const newLocale = ref<TranslLocale>({ language: "", country: "" });
</script>
