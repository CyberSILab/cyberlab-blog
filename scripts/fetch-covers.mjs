// 把每篇帖子 cover.video 指向的 YouTube 缩略图下载到 public/covers/<videoId>.jpg
// 用法：npm run covers        只下载缺失的
//       npm run covers -- -f  全部重新下载
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '..');
const blogDir = path.join(root, 'src', 'content', 'blog');
const outDir = path.join(root, 'public', 'covers');
const force = process.argv.includes('-f') || process.argv.includes('--force');

const ID_RE = /(?:v=|youtu\.be\/|\/shorts\/|\/embed\/|\/live\/)([A-Za-z0-9_-]{11})/;
const videoIdOf = (v) => {
	if (!v) return null;
	const m = v.match(ID_RE);
	if (m) return m[1];
	return /^[A-Za-z0-9_-]{11}$/.test(v.trim()) ? v.trim() : null;
};

const readVideoIds = () => {
	if (!fs.existsSync(blogDir)) return [];
	const files = fs.readdirSync(blogDir).filter((f) => f.endsWith('.md'));
	const ids = new Map();
	for (const f of files) {
		const text = fs.readFileSync(path.join(blogDir, f), 'utf8');
		const fm = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
		if (!fm) continue;
		const line = fm[1].split(/\r?\n/).find((l) => /^\s*video\s*:/.test(l));
		if (!line) continue;
		const raw = line.replace(/^\s*video\s*:/, '').trim().replace(/^['"]|['"]$/g, '');
		const id = videoIdOf(raw);
		if (id) ids.set(id, f);
		else console.warn(`! ${f}: 无法解析视频 ID（${raw}）`);
	}
	return [...ids.entries()];
};

const QUALITIES = ['maxresdefault', 'sddefault', 'hqdefault', 'mqdefault'];

// Node 22 的 fetch 不读 HTTP(S)_PROXY 环境变量，直连被墙时走不通；这里用 curl 兜底（会带上系统代理）
const PROXY = process.env.HTTPS_PROXY || process.env.https_proxy || process.env.HTTP_PROXY || process.env.http_proxy || '';

const saveIfImage = (dest, buf) => {
	if (!buf || buf.length < 1000) return false;
	fs.writeFileSync(dest, buf);
	return true;
};

const viaFetch = async (url, dest) => {
	try {
		const res = await fetch(url);
		if (!res.ok) return false;
		return saveIfImage(dest, Buffer.from(await res.arrayBuffer()));
	} catch {
		return false;
	}
};

const viaCurl = async (url, dest) => {
	const args = ['-fsSL', '--max-time', '25', '-o', dest, url];
	if (PROXY) args.unshift('-x', PROXY);
	const code = await new Promise((resolve) => {
		const p = spawn('curl', args, { stdio: 'ignore', windowsHide: true });
		p.on('error', () => resolve(-1));
		p.on('close', resolve);
	});
	if (code !== 0) {
		try {
			fs.unlinkSync(dest);
		} catch {
			/* 没生成就无所谓 */
		}
		return false;
	}
	return fs.existsSync(dest) && fs.statSync(dest).size > 1000;
};

// 有代理时先 curl（快且稳），没有代理时先 fetch
const get = (url, dest) => (PROXY ? viaCurl(url, dest).then((ok) => ok || viaFetch(url, dest)) : viaFetch(url, dest).then((ok) => ok || viaCurl(url, dest)));

const download = async (id) => {
	const dest = path.join(outDir, `${id}.jpg`);
	for (const q of QUALITIES) {
		const url = `https://i.ytimg.com/vi/${id}/${q}.jpg`;
		if (await get(url, dest)) return `${q} (${Math.round(fs.statSync(dest).size / 1024)} KB)`;
	}
	return null;
};

const main = async () => {
	const list = readVideoIds();
	if (!list.length) {
		console.log('没有找到带 cover.video 的帖子。');
		return;
	}
	fs.mkdirSync(outDir, { recursive: true });
	let ok = 0;
	let skip = 0;
	let fail = 0;
	for (const [id, file] of list) {
		const dest = path.join(outDir, `${id}.jpg`);
		if (!force && fs.existsSync(dest)) {
			console.log(`= ${id}.jpg 已存在（${file}），跳过`);
			skip++;
			continue;
		}
		const got = await download(id);
		if (got) {
			console.log(`+ ${id}.jpg  ${got}  ← ${file}`);
			ok++;
		} else {
			console.warn(`! ${id} 下载失败（${file}），将回退到 YouTube 在线缩略图`);
			fail++;
		}
	}
	console.log(`\n完成：新增 ${ok}，已存在 ${skip}，失败 ${fail}；输出目录 public/covers/`);
};

main();
