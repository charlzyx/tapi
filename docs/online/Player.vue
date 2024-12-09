<template>
  <div>
    <div class="editor">
      <textarea class="input" v-model="input" contenteditable></textarea>
    </div>
    <div>{{ url }}</div>
    <div @click="build">BUILD</div>
    <iframe class="output" ref="iframe" frameborder="0"></iframe>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import { WebContainer } from "@webcontainer/api";
import { files } from "./files";
import { installDependencies, startDevServer } from "./vhost";

const input = ref("");
const iframe = ref(null);
const url = ref("");

let vhost = null;
const build = () => {
  fetch(url.value + "/rerun").then((resp) => resp.json());
};
onMounted(async () => {
  if (vhost) return;
  try {
    vhost = await WebContainer.boot();
    await vhost.mount(files);
    const exitCode = await installDependencies(vhost);
    if (exitCode !== 0) {
      throw new Error("Installation failed");
    }
    console.log("files", files);
    input.value = files["input.ts"].file.contents;
    startDevServer(vhost, iframe.value, (srv) => {
      url.value = srv.url + ":" + srv.port;
    });
  } catch (error) {
    console.error("Error during setup:", error);
  }
});
onUnmounted(() => {
  if (vhost) {
    vhost.teardown();
    vhost = null;
  }
});
</script>

<style>
.editor {
  border: 1px solid pink;
}
.output {
  border: 1px solid greenyellow;
}
</style>
