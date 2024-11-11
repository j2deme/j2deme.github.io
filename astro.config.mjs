import { defineConfig } from "astro/config";
import { remarkModifiedTime } from "./remark-modified-time.mjs";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import preact from "@astrojs/preact";

import { transformerCopyButton } from "@rehype-pretty/transformers";
import {
  transformerMetaHighlight,
  transformerNotationDiff,
} from "@shikijs/transformers";
import rehypePrettyCode from "rehype-pretty-code";

import icon from "astro-icon";

// https://astro.build/config
export default defineConfig({
  site: "https://j2deme.github.io",
  integrations: [mdx(), sitemap(), preact({ compat: true }), icon()],
  markdown: {
    syntaxHighlight: false,
    remarkPlugins: [remarkModifiedTime],
    rehypePlugins: [
      [
        rehypePrettyCode,
        {
          theme: {
            light: "catppuccin-frappe",
            dark: "catppuccin-latte",
          },
          transformers: [
            transformerNotationDiff(),
            transformerMetaHighlight(),
            transformerCopyButton({
              visibility: "hover",
              feedbackDuration: 1000,
            }),
          ],
        },
      ],
    ],
  },
  trailingSlash: "always",
});