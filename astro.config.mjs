import { defineConfig } from "astro/config";
import { remarkModifiedTime } from "./remark-modified-time.mjs";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import preact from "@astrojs/preact";

// https://astro.build/config
export default defineConfig({
  site: "https://j2deme.github.io",
  integrations: [mdx(), sitemap(), preact({ compat: true })],
  markdown: {
    remarkPlugins: [remarkModifiedTime],
  },
  trailingSlash: "always",
});
