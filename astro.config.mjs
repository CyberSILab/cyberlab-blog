// @ts-check

import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

// 去掉 Shiki 的内联样式，让 .prose pre（浅色底 + 边框，与素材一致）生效
const stripShikiInlineStyles = {
	name: 'strip-shiki-inline-styles',
	pre(node) {
		delete node.properties.style;
		return node;
	},
};

// https://astro.build/config
export default defineConfig({
	site: 'https://example.com',
	markdown: {
		shikiConfig: {
			transformers: [stripShikiInlineStyles],
		},
	},
	integrations: [sitemap()],
});
