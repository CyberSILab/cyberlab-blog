import fs from 'node:fs';
import path from 'node:path';

export type Cover = {
	lines?: string[];
	sub?: string;
	cls?: string;
	image?: string;
	video?: string;
};

/** 从 YouTube 链接或裸 ID 里取出 11 位视频 ID */
export const videoIdOf = (input?: string): string | null => {
	if (!input) return null;
	const v = input.trim();
	if (!v) return null;
	const m = v.match(/(?:v=|youtu\.be\/|\/shorts\/|\/embed\/|\/live\/)([A-Za-z0-9_-]{11})/);
	if (m) return m[1];
	return /^[A-Za-z0-9_-]{11}$/.test(v) ? v : null;
};

/**
 * 封面图地址解析：
 * 1. cover.image 直接指定（本地 /xxx.jpg 或任意 http 图片）优先
 * 2. cover.video 有对应视频 ID 时，若 public/covers/<id>.jpg 已落盘就用本地图（推荐，国内可访问）
 * 3. 否则回退到 YouTube 官方缩略图（maxresdefault，组件里带 mqdefault 兜底）
 */
export const coverImage = (cover?: Cover | null): string | null => {
	if (!cover) return null;
	if (cover.image) return cover.image.startsWith('http') || cover.image.startsWith('/') ? cover.image : `/${cover.image}`;
	const id = videoIdOf(cover.video);
	if (!id) return null;
	const pub = path.resolve(process.cwd(), 'public', 'covers', `${id}.jpg`);
	if (fs.existsSync(pub)) return `/covers/${id}.jpg`;
	return `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;
};

/** 远程 YouTube 缩略图在部分视频没有 maxresdefault，交给 mqdefault 兜底 */
export const ytFallbackAttr = (src: string | null): string | undefined =>
	src && src.startsWith('https://i.ytimg.com') ? "this.onerror=null;this.src=this.src.replace('maxresdefault','mqdefault')" : undefined;
