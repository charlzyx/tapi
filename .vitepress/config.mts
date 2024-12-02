import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "tApi",
  srcDir: "./docs",
  description: "typed application programming interface",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [{ text: "Home", link: "/" }],
    socialLinks: [{ icon: "github", link: "https://github.com/charlzyx/tapi" }],
  },
});
