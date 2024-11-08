import { defineConfig } from "astro/config";
import { remarkModifiedTime } from "./remark-modified-time.mjs";
import mdx from "@astrojs/mdx";

import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://j2deme.github.io",
  integrations: [mdx(), sitemap()],
  markdown: {
    remarkPlugins: [remarkModifiedTime],
  },
  trailingSlash: "always",
});
