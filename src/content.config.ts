import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const coverSchema = z.object({
	lines: z.array(z.string()).min(1).max(2),
	sub: z.string(),
	cls: z.enum(['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8']),
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

export const collections = { blog };
