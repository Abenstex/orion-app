<template>
  <div class="editorjs border-md ma-2" ref="htmlelement"></div>
  <v-row class="ma-2">
    <v-btn
      :text="lang.tr('General.Cancel')"
      variant="plain"
      @click="onCancelClicked"
    />

    <v-spacer />

    <v-btn :text="lang.tr('General.Save')" @click="onSaveClicked" />
  </v-row>
</template>
<script setup lang="ts">
import EditorJs from "@editorjs/editorjs";
//import ListTool from "@editorjs/list";
import EditorjsList from "@editorjs/list";
import TextVariantTune from "@editorjs/text-variant-tune";
import Alert from "editorjs-alert";
import TextStyleTool from "@skchawala/editorjs-text-style";
import Header from "@editorjs/header";
import { getLanguageStore } from "@/stores/LanguageStore";

let editor: EditorJs;
const lang = getLanguageStore();

const htmlelement = ref(undefined);
const props = defineProps({
  initialText: String,
  placeholder: String,
  readOnly: Boolean,
});

const outputdata = {
  time: 1765289365981,
  blocks: [
    {
      type: "paragraph",
      data: { text: "Normaler text Hurra" },
    },
  ],
  version: "2.31.0",
};

function onSaveClicked() {
  editor
    .save()
    .then((text) => {
      console.log(`Text to save ${JSON.stringify(text)}`);
    })
    .catch((error) => {
      console.log("Saving failed: ", error);
    });
}

function onCancelClicked() {
  console.log(`Cancel clicked`);
}

onMounted(() => {
  editor = new EditorJs({
    holder: htmlelement.value,
    placeholder: props.placeholder,
    tools: {
      header: Header,
      list: {
        class: EditorjsList,
        inlineToolbar: true,
      },
      textVariant: TextVariantTune,
      specification: {
        class: Alert,
        inlineToolbar: true,
        shortcut: "CMD+SHIFT+A",
        config: {
          alertTypes: [
            "primary",
            "secondary",
            "info",
            "success",
            "warning",
            "danger",
            "light",
            "dark",
          ],
          defaultType: "primary",
          messagePlaceholder: "Enter something",
        },
      },
      textStyle: {
        class: TextStyleTool,
        config: {
          fontSizeEnabled: true,
          fontFamilyEnabled: true,
          fontSizes: [
            { label: "12px", value: "12px" },
            { label: "14px", value: "14px" },
            { label: "16px", value: "16px" },
            { label: "18px", value: "18px" },
            { label: "20px", value: "20px" },
          ],
          fontFamilies: [
            { label: "Arial", value: "Arial" },
            { label: "Georgia", value: "Georgia" },
            { label: "Courier New", value: "Courier New" },
            { label: "Verdana", value: "Verdana" },
          ],
          defaultFontSize: "12px",
          defaultFontFamily: "Verdana",
        },
      },
    },
    i18n: {
      messages: {
        toolNames: {
          "Alert": lang.tr("General.Specification"),
        },
        ui: {
          "toolbar": {
            "toolbox": {
              "Add": lang.tr("General.Add"),
            }
          },
        },
        tools: {
          specification: {
            Primary: lang.tr("Editor.Requirement"),
            Secondary: lang.tr("Editor.TestCase"),
            Info: lang.tr("Editor.Info"),
            Success: lang.tr("General.Success"),
            Warning: lang.tr("General.Warning"),
            Danger: lang.tr("Editor.Danger"),
            Light: lang.tr("Editor.Hell"),
            Dark: lang.tr("Editor.Dark"),
          },
        },
      },
    },
    readOnly: props.readOnly,
    data: outputdata,
    tunes: ["textVariant"],
  });
});

onUnmounted(() => {
  editor.destroy();
});
</script>
