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
			// 站点是浅色底，代码高亮也必须用浅色主题，否则 github-dark 的浅色字会看不清
			theme: 'github-light',
			transformers: [stripShikiInlineStyles],
		},
	},
	integrations: [sitemap()],
});
