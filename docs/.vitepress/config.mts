import { defineConfig } from "vitepress";

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
    plugins: [crossOriginIsolationPlugin()],
    // plugins: [
    //   {
    //     configureServer(server) {

    //     },
    //   },
    // server.middlewares.use((_req, res, next) => {
    //   res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    //   res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
    //   next();
    // });
    // ],
  },
});
