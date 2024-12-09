<template>
  <h1 class="play-title">演练场</h1>
  <div class="box">
    <h1 style="flex: 1">输入代码 <i>请随意改动，炸了就 Reload</i></h1>
    <h1 style="flex: 1.2">查看输出 <i>记得点我</i></h1>
  </div>
  <div class="box">
    <div class="editor">
      <MonacoEditor height="80vh" :value="input" language="typescript" />
    </div>
    <div class="output">
      <iframe
        src="loading.html"
        class="outframe"
        ref="iframe"
        frameborder="0"
      ></iframe>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import { WebContainer } from "@webcontainer/api";
import { files } from "./files";
import { installDependencies, startDevServer } from "./vhost";
import MonacoEditor from "./Monaco.vue";

const input = ref(files["input.ts"].file.contents);
const editor = ref(null);
const iframe = ref(null);

let vhost = null;

onMounted(async () => {
  if (vhost) return;
  try {
    vhost = await WebContainer.boot();
    await vhost.mount(files);
    const exitCode = await installDependencies(vhost);
    if (exitCode !== 0) {
      throw new Error("Installation failed");
    }
    startDevServer(vhost, iframe.value);
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
.play-title {
  padding: 10px 80px;
  letter-spacing: -0.02em;
  line-height: 40px;
  font-size: 32px;
}
.box {
  padding: 20px 80px;
  display: flex;
  gap: 8px;
  width: 100%;
}
.box h1 {
  font-size: 20px;
}
.box i {
  font-size: 14px;
  color: var(--vp-button-brand-bg);
}
.editor {
  flex: 1;
  height: 80vh;
  border: 2px solid var(--vp-button-brand-bg);
  border-radius: 8px;
  overflow: hidden;
}
.output {
  padding: 8px;
  flex: 1.2;
  height: 80vh;
  border-radius: 8px;
  border: 2px solid var(--vp-button-brand-bg);
}
.outframe {
  width: 100%;
  height: 100%;
}
</style>
