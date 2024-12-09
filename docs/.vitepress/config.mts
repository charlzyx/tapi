import { defineConfig } from "vitepress";
import { defineConfig as defineViteConfig } from "vite";

// https://github.com/vuejs/vitepress/issues/2195
function crossOriginIsolationPlugin() {
  return {
    name: "cross-origin-isolation-plugin",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
        res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
        next();
      });
    },
  };
}
// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "tApi",
  // srcDir: "./docs",
  description: "Define APIs with the power of TypeScript",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [{ text: "RFC", link: "/rfc.html" }],
    socialLinks: [{ icon: "github", link: "https://github.com/charlzyx/tapi" }],
  },
  vite: {
    build: {
      rollupOptions: {
        output: {
          // 确保 monaco-editor 的资源被正确打包
          manualChunks: {
            monaco: ["monaco-editor"],
          },
        },
      },
    },
    optimizeDeps: {
      include: ["monaco-editor"],
    },
    plugins: [crossOriginIsolationPlugin()],
  },
});
