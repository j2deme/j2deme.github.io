import {
  transformerMetaHighlight,
  transformerNotationDiff,
  transformerNotationFocus,
} from "@shikijs/transformers";

import { SITE } from "./src/consts.ts";
import { defineConfig } from "astro/config";
import icon from "astro-icon";
import mdx from "@astrojs/mdx";
import preact from "@astrojs/preact";
import rehypePrettyCode from "rehype-pretty-code";
import { remarkModifiedTime } from "./remark-modified-time.mjs";
import sitemap from "@astrojs/sitemap";
import { transformerCopyButton } from "@rehype-pretty/transformers";

const rpcOptions = {
  // https://rehype-pretty-code.netlify.app
  theme: {
    light: "catppuccin-frappe",
    dark: "catppuccin-latte",
  },
  keepBackground: false,
  transformers: [
    transformerNotationFocus(),
    transformerNotationDiff(),
    transformerMetaHighlight(),
    transformerCopyButton({
      feedbackDuration: 2000,
      copyIcon:
        "data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22silver%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20%3E%20%3Cpath%20d%3D%22M7%207m0%202.667a2.667%202.667%200%200%201%202.667%20-2.667h8.666a2.667%202.667%200%200%201%202.667%202.667v8.666a2.667%202.667%200%200%201%20-2.667%202.667h-8.666a2.667%202.667%200%200%201%20-2.667%20-2.667z%22%20%2F%3E%20%3Cpath%20d%3D%22M4.012%2016.737a2.005%202.005%200%200%201%20-1.012%20-1.737v-10c0%20-1.1%20.9%20-2%202%20-2h10c.75%200%201.158%20.385%201.5%201%22%20%2F%3E%20%3C%2Fsvg%3E%20",
      successIcon:
        "data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22limeGreen%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20%3E%20%3Cpath%20stroke%3D%22none%22%20d%3D%22M0%200h24v24H0z%22%20%2F%3E%20%3Cpath%20d%3D%22M7%209.667a2.667%202.667%200%200%201%202.667%20-2.667h8.666a2.667%202.667%200%200%201%202.667%202.667v8.666a2.667%202.667%200%200%201%20-2.667%202.667h-8.666a2.667%202.667%200%200%201%20-2.667%20-2.667z%22%20%2F%3E%20%3Cpath%20d%3D%22M4.012%2016.737a2%202%200%200%201%20-1.012%20-1.737v-10c0%20-1.1%20.9%20-2%202%20-2h10c.75%200%201.158%20.385%201.5%201%22%20%2F%3E%20%3Cpath%20d%3D%22M11%2014l2%202l4%20-4%22%20%2F%3E%20%3C%2Fsvg%3E%20",
    }),
  ],
};

// https://astro.build/config
export default defineConfig({
  site: SITE.SITEURL,
  integrations: [mdx(), sitemap(), preact({ compat: true }), icon()],
  markdown: {
    syntaxHighlight: false,
    remarkPlugins: [remarkModifiedTime],
    rehypePlugins: [[rehypePrettyCode, rpcOptions]],
  },
  trailingSlash: "always",
});
