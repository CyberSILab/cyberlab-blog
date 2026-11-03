import type { CollectionEntry } from 'astro:content';

export type BlogEntry = CollectionEntry<'blog'>;

// props 经 JSON 序列化后日期会变成字符串，两种都要吃（Ledger: Task 2 Ruling）
export const fmtDate = (d: Date | string): string =>
	typeof d === 'string' ? d.slice(0, 10) : d.toISOString().slice(0, 10);

export const allTags = (entries: BlogEntry[]) => {
	// 与素材口径一致：按日期降序遍历，并列计数保持原型插入顺序（终审 Important-1）
	const ordered = [...entries].sort((a, b) => (fmtDate(b.data.pubDate) > fmtDate(a.data.pubDate) ? 1 : -1));
	const map = new Map<string, number>();
	for (const p of ordered) for (const t of p.data.tags) map.set(t, (map.get(t) ?? 0) + 1);
	return [...map.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
};

export const monthList = (entries: BlogEntry[]) => {
	const set = new Set(entries.map((p) => fmtDate(p.data.pubDate).slice(0, 7)));
	return [...set].sort().reverse().map((v) => ({ value: v, label: v.slice(0, 4) + ' 年 ' + Number(v.slice(5, 7)) + ' 月' }));
};

export const relatedOf = (entry: BlogEntry, entries: BlogEntry[]) =>
	entries
		.filter((p) => p.id !== entry.id && p.data.tags.some((t) => entry.data.tags.includes(t)))
		.sort((a, b) => (b.data.pubDate as unknown as number) - (a.data.pubDate as unknown as number))
		.slice(0, 4);

export const prevNextOf = (entry: BlogEntry, entries: BlogEntry[]) => {
	const sorted = [...entries].sort((a, b) => (a.data.pubDate as unknown as number) - (b.data.pubDate as unknown as number));
	const i = sorted.findIndex((p) => p.id === entry.id);
	return { prev: sorted[i - 1], next: sorted[i + 1] };
};
