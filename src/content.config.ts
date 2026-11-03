import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// 封面两种写法：
//   1) 用视频封面：cover.video: '<YouTube 链接或 11 位 ID>'（或 cover.image 直接给图片地址）
//   2) 用文字渐变封面：cover.lines + cover.cls（可加 cover.sub）
const coverCls = z.enum(['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8']);

const coverSchema = z.object({
	lines: z.array(z.string()).min(1).max(2).optional(),
	sub: z.string().optional(),
	cls: coverCls.optional(),
	image: z.string().optional(),
	video: z.string().optional(),
});

const blog = defineCollection({
	loader: glob({ base: './src/content/blog', pattern: '**/*.md' }),
	schema: z.object({
		title: z.string(),
		pubDate: z.coerce.date(),
		tags: z.array(z.string()).min(1),
		cover: coverSchema,
		hot: z.number().int().positive().optional(),
	}),
});

// AI 工具条目：ai-tools 列表卡片与 /tools/<slug>/ 详情页共用一份数据
const tools = defineCollection({
	loader: glob({ base: './src/content/tools', pattern: '**/*.md' }),
	schema: z.object({
		name: z.string(),
		tagline: z.string(),
		sub: z.string(),
		desc: z.string(),
		tags: z.array(z.string()).min(1),
		url: z.string().url(),
		cls: coverCls,
		order: z.number().int().positive(),
	}),
});

export const collections = { blog, tools };
