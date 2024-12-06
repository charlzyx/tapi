import { defineConfig } from "vitepress";

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
});
