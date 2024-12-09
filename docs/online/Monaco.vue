<template>
  <div class="me" :style="{ height }" ref="editorContainer"></div>
</template>

<script>
import * as monaco from "monaco-editor";
import { onMounted, ref } from "vue";

export default {
  name: "MonacoEditor",
  props: {
    value: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      default: "javascript",
    },
    height: {
      type: String,
      default: "80vh",
    },
  },
  emits: ["update:value"],
  setup(props, { emit }) {
    const editorContainer = ref(null);
    let editor;

    onMounted(() => {
      editor = monaco.editor.create(editorContainer.value, {
        value: props.value,
        language: props.language,
        theme: "vs",
      });

      editor.onDidChangeModelContent(() => {
        emit("update:value", editor.getValue());
      });
    });

    return { editorContainer };
  },
};
</script>

<style>
.me {
  padding: 12px 8px;
  width: 100%;
  height: 600px;
}
</style>
