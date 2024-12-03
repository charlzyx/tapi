import { defineConfigWithTheme } from "vitepress";
import type { ThemeConfig } from "vitepress-carbon";
import baseConfig from "vitepress-carbon/config";

// https://vitepress.dev/reference/site-config
export default defineConfigWithTheme<ThemeConfig>({
  extends: baseConfig,
  title: "tApi",
  // srcDir: "./docs",
  description: "typed application programming interface",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [{ text: "Home", link: "/" }],
    socialLinks: [{ icon: "github", link: "https://github.com/charlzyx/tapi" }],
  },
});
