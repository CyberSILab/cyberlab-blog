# 素材转 Astro 迁移 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 `素材/` 里的赛博实验室静态原型（5 页面 + blog.css + posts.js）完整迁移为纯静态 Astro 站点，行为与原型一致。

**Architecture:** 文章一律进 content collections（唯一数据源）；主页网格/筛选/分页/搜索为客户端脚本（数据由构建期从 collection 内嵌为 JSON）；文章页、标签页、工具页、关于页、侧栏面板全部构建期渲染。不加 SSR adapter，不加新依赖。

**Tech Stack:** Astro 7（本地 node_modules 调用，勿全局装）、@astrojs/rss、@astrojs/sitemap、原生客户端 JS。

**Spec:** `docs/superpowers/specs/2026-11-03-material-to-astro-design.md`（执行者两个文档都要读）

## Global Constraints

- Node ≥ 22.23.4（`package.json` engines，原样保留）
- 纯静态输出：不加任何 SSR adapter；不新增任何依赖
- `PAGE_SIZE = 15`（每页 5 行 × 3 列，与素材一致）
- 相关推荐最多 4 篇（按共享标签）
- 页面标题模式「赛博实验室 · X」；`<html lang="zh-Hans">`
- 帖子正文与所有文案从 `素材/` 原样复制，不改写
- 系统字体（PingFang SC / Microsoft YaHei），无自托管字体
- 命令一律用 `npm run dev` / `npm run build` / `npx astro …`（astro 未全局安装）

## Review Focus

（spec 隐含、但单靠"页面能打开"测不到的输入类别——每条在对应 Task 里钉一个验证）

- 标签名含空格与中文（如「AI 大模型」）：链接必须 `encodeURIComponent`，客户端读 `?tag=` 解码后仍能命中 → Task 3 验证
- `pubDate` 经 schema 强制为 Date 对象：内嵌 META 与页面显示的日期必须是纯字符串 `YYYY-MM-DD` → Task 2/3 验证
- 正文里的四空格缩进代码块与 `**加粗**`：Astro Markdown 渲染进 `.prose` 后 `pre`/`strong` 样式必须生效 → Task 4 验证
- 筛选结果为空：`emptyTip`「当前筛选条件下暂无内容」必须出现 → Task 3 验证
- RSS 的 `pubDate` 必须是 ISO、`description` 非空（取 `cover.sub`） → Task 6 验证

---

### Task 1: 内容层迁移（schema + 16 篇文章 + 清理旧模板内容）

**Files:**
- Modify: `src/content.config.ts`（整文件替换，代码见下）
- Create: `src/content/blog/<id>.md` × 16（id 见素材清单）
- Delete: `src/content/blog/first-post.md` `second-post.md` `third-post.md` `markdown-style-guide.md` `using-mdx.mdx`
- Delete: `src/assets/blog-placeholder-*.jpg`（6 张）、`src/assets/fonts/`（2 个 woff）
- Delete: `src/pages/blog/index.astro` `src/pages/blog/[...slug].astro` `src/layouts/BlogPost.astro` `src/pages/about.astro` `src/components/FormattedDate.astro`（旧 schema/旧设计依赖，先删，Task 4/6 重建新路由）
- Modify: `astro.config.mjs`（去掉 `mdx()` 与整个 `fonts` 段）
- Modify: `package.json`（移除 `sharp`、`@astrojs/mdx` 两个依赖）

**Interfaces:**
- Produces: collection `blog`，entry 形状：`entry.id` = 素材 id；`entry.data = { title, pubDate: Date, tags: string[], cover: { lines: string[], sub: string, cls: 'c1'…'c8' }, hot?: number }`
- Consumes: 无（起点）

- [ ] **Step 1: 替换 `src/content.config.ts`**

```ts
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
```

- [ ] **Step 2: 生成 16 个 md 文件**

配方：对 `素材/posts.js` 里 `POSTS` 的每一项（共 16 项，id 依次为 `deepseek-v41-flash-unreviewed`、`clover-35b-a3b`、`lfm3-vl-2b`、`lfm3-17b`、`wevisone-vl-4b`、`wevisone-vl-2b`、`deepseek-v41-flash-strata`、`flux3-image-klein`、`flint-40b`、`qwen38-27b-unreviewed`、`moss-image-8-steps`、`moss-image-comfyui`、`nemotron-35-bolt`、`bonsai2-9b`、`minicpm-v-47`、`lfm25-24b-a2b`），创建 `src/content/blog/<id>.md`：frontmatter 由该条的 `title/date/tags/cover/hot` 字段生成（`hot: null` 的条目不写 hot 字段），frontmatter 之后正文 = 该条 `body` 反引号内容原样复制（去掉首尾各一个换行）。

第一篇的完整成品（其余 15 篇同配方，正文去 `素材/posts.js` 取）：

```markdown
---
title: 12GB 显卡就能跑！DeepSeek-V4.1-Flash-1017 无审查版 AI 大模型本地部署教程
pubDate: 2026-10-31
tags: ['AI 大模型', '本地部署']
cover:
  lines: ['DeepSeek V4.1-Flash', '无审查版']
  sub: 12GB 显卡就能跑
  cls: c1
hot: 1
---

## 模型简介

DeepSeek-V4.1-Flash-1017 无审查版是一个 350 亿参数级别的对话大模型，去掉了内容审查层，回答更直接、更完整，适合本地做问答助手、写作辅助和角色扮演。

## 硬件与下载

- 量化版本：Q4_K_M 约 11.2GB，刚好塞进 12GB 显存
- 内存建议：系统内存 16GB 以上
- 上下文：默认 32K，可开至 128K（显存会相应吃紧）

## 部署步骤

使用 Ollama 一键拉取：

    ollama pull deepseek-v41-flash:1017-unreviewed-q4
    ollama run deepseek-v41-flash:1017-unreviewed-q4

用 LM Studio 的话，直接搜索模型名加载 Q4_K_M 量化即可。

## 实测效果

- 12GB 显卡（4060 Ti）下约 18 token/秒，日常问答完全够用
- 无审查版对长文本的保留率高，写长文时不会被中途截断
- 中文理解明显好于同尺寸海外模型

## 小结

12GB 显卡就能跑通，性价比极高。想要更稳的回答质量，可以换 Q5_K_M 量化并把上下文降到 32K。
```

- [ ] **Step 3: 执行删除与配置清理**

按 Files 清单删除（用 `git rm` 或 shell 删除）；`astro.config.mjs` 去掉 `import mdx from '@astrojs/mdx';`、`integrations: [mdx(), sitemap()]` 改为 `integrations: [sitemap()]`、删除整个 `fonts: [...]` 段；`package.json` 的 dependencies 移除 `@astrojs/mdx` 与 `sharp`，然后跑 `npm install` 更新 lockfile。

- [ ] **Step 4: 验证**

Run: `npm run build`
Expected: 构建成功；dev/build 日志显示 content 同步出 16 条；`dist/` 中不再出现 `blog/markdown-style-guide` 等旧路由。

- [ ] **Step 5: Commit**

```bash
git add -A src/content astro.config.mjs package.json package-lock.json
git commit -m "feat: 文章迁入 content collections，清理模板示例与无用依赖"
```

---

### Task 2: 全局样式 + 共享组件 + 共享工具函数

**Files:**
- Modify: `src/styles/global.css`（整文件 ← `素材/blog.css` 原样复制，行 1–148；末尾追加 Step 3 的搜索样式）
- Create: `src/lib/site.ts`
- Create: `src/components/ClockIcon.astro` `CoverCard.astro` `AboutPanel.astro` `HotPanel.astro` `TagCloud.astro` `MonthPanel.astro`
- Modify: `src/components/Header.astro`（重写）、`src/components/Footer.astro`（重写）、`src/components/BaseHead.astro`（重写）
- Modify: `src/consts.ts`

**Interfaces:**
- Produces（后续所有页面任务按这些签名调用）:
  - `Header.astro` props: `active: 'home' | 'ai-tools' | 'tags' | 'about'`
  - `Footer.astro` props: 无
  - `BaseHead.astro` props: `title: string, description: string`（内部 import `../styles/global.css` 与 RSS 链接）
  - `CoverCard.astro` props: `cover: {lines, sub, cls}`, `variant?: 'card' | 'post'`（post 加 `post-cover` 类）
  - `ClockIcon.astro` props: 无
  - `AboutPanel.astro` props: 无；`HotPanel.astro` props: `posts: BlogEntry[]`（渲染 `p.id`/`p.data.title`/`p.data.hot`——Ledger: Task 2 Ruling，与 `hotPosts` 的真实返回一致）；`TagCloud.astro` props: `tags: {name: string, count: number}[]`；`MonthPanel.astro` props: `months: {value: string, label: string}[]`
  - `src/lib/site.ts`：`fmtDate(d: Date): string`、`allTags(entries): {name, count}[]`、`monthList(entries): {value, label}[]`、`hotPosts(entries): entry[]`、`relatedOf(entry, entries): entry[]`（≤4）、`prevNextOf(entry, entries): {prev: entry | undefined, next: entry | undefined}`

- [ ] **Step 1: global.css 换成 blog.css**

把 `素材/blog.css` 全文原样写入 `src/styles/global.css`（148 行，含全部 @media 断点），并追加两处：`.cover .k` 规则里加 `white-space: pre-line`（CoverCard 用 `join('\n')` 换行，Ledger: Task 2 Ruling）；Step 4 的搜索样式。

- [ ] **Step 2: 写 `src/lib/site.ts`**

```ts
import type { CollectionEntry } from 'astro:content';

export type BlogEntry = CollectionEntry<'blog'>;

// props 经 JSON 序列化后日期会变成字符串，两种都要吃（Ledger: Task 2 Ruling）
export const fmtDate = (d: Date | string): string =>
	typeof d === 'string' ? d.slice(0, 10) : d.toISOString().slice(0, 10);

export const allTags = (entries: BlogEntry[]) => {
	const map = new Map<string, number>();
	for (const p of entries) for (const t of p.data.tags) map.set(t, (map.get(t) ?? 0) + 1);
	return [...map.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
};

export const monthList = (entries: BlogEntry[]) => {
	const set = new Set(entries.map((p) => fmtDate(p.data.pubDate).slice(0, 7)));
	return [...set].sort().reverse().map((v) => ({ value: v, label: v.slice(0, 4) + ' 年 ' + Number(v.slice(5, 7)) + ' 月' }));
};

export const hotPosts = (entries: BlogEntry[]) =>
	entries.filter((p) => p.data.hot).sort((a, b) => (a.data.hot ?? 0) - (b.data.hot ?? 0));

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
```

- [ ] **Step 3: 共享组件**

`ClockIcon.astro`：`<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>`（素材 posts.js:716）。

`CoverCard.astro`：

```astro
---
const { cover, variant = 'card' } = Astro.props;
---
<div class:list={['cover', cover.cls, 'post-cover': variant === 'post']}>
	<span class="k">{cover.lines.join('\n')}</span>
	<span class="s">{cover.sub}</span>
</div>
```

（渲染要求：`.k` 内两行之间是换行——用 `cover.lines.join('\n')` 加 CSS `white-space: pre-line` 加到 `.cover .k` 规则里，替代素材里 `join('<br>')` 的做法。）

`AboutPanel.astro`：内容 = 素材 posts.js:732–742 `aboutPanelHtml()` 的标记原样（avatar「赛」、bio、三个 social 图标、coffee 按钮），写成 .astro 标记，无 props。

`HotPanel.astro`：结构 = 素材 posts.js:745–750（p-head「热门视频」+「更多」链到 `/ai-tools/`；rank 列表 `<span class="n">{hot}</span>` + 标题，链到 `/blog/{id}/`）。

`TagCloud.astro`：结构 = 素材 posts.js:753–758（p-head「所有标签」+「更多」链到 `/tags/`；cloud 标签链到 `/?tag=` + `encodeURIComponent(name)`）。

`MonthPanel.astro`：结构 = 素材 posts.js:761–764（select `id="monthSelect"`，option 来自 props.months）。

`Header.astro`：标记 = 素材 博客主页.html:11–22 原样，仅改：logo/首页 href 改 `/`、`/ai-tools/`、`/tags/`、`/about/`；`active` prop 决定哪个 nav 加 `class="active"`；search 药盒内加真实输入框：

```astro
<label class="search"><svg viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6"/><path d="m15 15 4 4"/></svg><input class="search-input" id="searchInput" type="search" placeholder="搜索关键词..." aria-label="搜索关键词" /></label>
```

并在非首页时加一段小脚本：回车跳 `/?q=` + `encodeURIComponent(值)`。

`Footer.astro`：素材 博客主页.html:42–45 原样（两个 span）。

`BaseHead.astro`：

```astro
---
import '../styles/global.css';
const SITE = '赛博实验室';
const { title, description } = Astro.props;
---
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>{title}</title>
<meta name="description" content={description} />
<link rel="canonical" href={new URL(Astro.url.pathname, Astro.site)} />
<link rel="alternate" type="application/rss+xml" title={SITE} href="/rss.xml" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
```

- [ ] **Step 4: consts 与搜索样式**

`src/consts.ts`：

```ts
export const SITE_TITLE = '赛博实验室';
export const SITE_DESCRIPTION = '分享 AI 实战、系统开发与高效工具的实用教程：本地部署 + 实测。';
```

`global.css` 追加：

```css
.search-input { flex: 1; min-width: 0; border: 0; background: transparent; color: var(--ink); font: inherit; font-size: 13px; outline: none }
.search:focus-within { border-color: var(--accent) }
```

- [ ] **Step 5: 验证**

Run: `npm run build` → 成功。Run: `npm run dev`（后台），浏览器面板开 `http://localhost:4321/`：Expected: 顶栏已是「赛博实验室」logo + 四项中文导航 + 搜索药盒，页脚两行文案，配色为 blog.css（此时主页正文仍是模板英文，属预期中间状态）。对照 `素材/博客主页.html` 的 header 截图检查 logo/导航/搜索外观一致。停掉 dev。

- [ ] **Step 6: Commit**

```bash
git add src/styles src/components src/lib src/consts.ts
git commit -m "feat: 全局样式与共享组件按素材设计落地"
```

---

### Task 3: 主页（网格 + 筛选 + 分页 + 搜索，客户端）

**Files:**
- Modify: `src/pages/index.astro`（重写）

**Interfaces:**
- Consumes: Task 2 的 `Header(active="home")`、`Footer`、`BaseHead`、`AboutPanel`、`HotPanel`、`TagCloud`、`MonthPanel`、`src/lib/site.ts` 的 `fmtDate/allTags/monthList/hotPosts`；Task 1 的 collection 数据
- Produces: 内嵌脚本里的全局 `META` 数组：`{ id: string, title: string, date: string(YYYY-MM-DD), tags: string[], cover: {lines, sub, cls}, hot: number|null }[]`（日期必须是字符串——Review Focus 第 2 条）

- [ ] **Step 1: 重写 `src/pages/index.astro`**

frontmatter：

```astro
---
import BaseHead from '../components/BaseHead.astro';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
import AboutPanel from '../components/AboutPanel.astro';
import HotPanel from '../components/HotPanel.astro';
import TagCloud from '../components/TagCloud.astro';
import MonthPanel from '../components/MonthPanel.astro';
import { SITE_TITLE, SITE_DESCRIPTION } from '../consts';
import { getCollection } from 'astro:content';
import { fmtDate, allTags, monthList, hotPosts } from '../lib/site';
const entries = (await getCollection('blog')).sort((a, b) => (b.data.pubDate as unknown as number) - (a.data.pubDate as unknown as number));
const META = JSON.stringify(entries.map(e => ({
	id: e.id, title: e.data.title, date: fmtDate(e.data.pubDate),
	tags: e.data.tags, cover: e.data.cover, hot: e.data.hot ?? null,
})));
---
```

body 结构 = 素材 博客主页.html:24–40 原样（filterbar/grid/emptyTip/pager + aside 四面板，面板用组件调用：`<HotPanel posts={hotPosts(entries)} />`、`<TagCloud tags={allTags(entries)} />`、`<MonthPanel months={monthList(entries)} />`）；`<main>` 前放 `<script>const META = {META};</script>`；`<html lang="zh-Hans">`，title「赛博实验室 · 网站首页」。

- [ ] **Step 2: 客户端脚本（移植素材主页逻辑 + 搜索）**

放在 index.astro 底部，逻辑与素材 博客主页.html:47–119 一致，`POSTS` 换成 `META`，`buildCard` 的 href 改 `/blog/{id}/`，新增 q 状态：

```js
const PAGE_SIZE = 15;
let page = 1, month = '', tag = '', q = '';
const params = new URLSearchParams(location.search);
if (params.get('tag')) tag = params.get('tag');
if (params.get('q')) { q = params.get('q'); document.getElementById('searchInput').value = q; }
function filtered() {
	return META.filter(p =>
		(!month || p.date.slice(0, 7) === month) &&
		(!tag || p.tags.includes(tag)) &&
		(!q || p.title.includes(q) || p.tags.some(t => t.includes(q))));
}
```

`renderFilterbar`/`render`/`pager` 点击/`monthSelect` change 与素材逐段相同；filterbar 里加 `关键词 <b>q</b>` 段与清除；新增：

```js
document.getElementById('searchInput').addEventListener('input', e => { q = e.target.value.trim(); page = 1; render(); });
```

`buildCard` 与素材 posts.js:719–727 相同（href 改 `/blog/` + encodeURIComponent(id)）。

- [ ] **Step 3: 验证（对照素材逐项过）**

`npm run dev`（后台），浏览器面板：
1. 首页网格 15 张卡、分页出现「2」、点页码/上下页正常；
2. 点侧栏标签「AI 大模型」（URL 应为 `/?tag=AI%20%E5%A4%A7%E6%9C%BA%E6%A8%A1` 之类编码形态）→ 只剩相关卡、filterbar 显示「筛选中：标签 AI 大模型」、清除可回全量（Review Focus 第 1 条）；
3. 月份下拉选 2026 年 10 月 → 只剩该月；
4. 搜索框输入「ollama」→ 过滤出生效；输入「zzzz」→ 出现「当前筛选条件下暂无内容」（Review Focus 第 4 条）；
5. 与 `素材/博客主页.html` 并排截图，布局一致。停 dev。

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: 主页按素材原型迁移（网格/筛选/分页/搜索）"
```

---

### Task 4: 文章页（全服务端）

**Files:**
- Create: `src/pages/blog/[slug].astro`

**Interfaces:**
- Consumes: Task 1 collection（`entry.data.*`、`<Content />`）、Task 2 的 `Header/CoverCard/ClockIcon/AboutPanel/TagCloud` 与 `prevNextOf/relatedOf/fmtDate`
- Produces: 路由 `/blog/<id>/`（16 条静态路径）

- [ ] **Step 1: 写 `src/pages/blog/[slug].astro`**

```astro
---
import BaseHead from '../../components/BaseHead.astro';
import Header from '../../components/Header.astro';
import Footer from '../../components/Footer.astro';
import CoverCard from '../../components/CoverCard.astro';
import ClockIcon from '../../components/ClockIcon.astro';
import AboutPanel from '../../components/AboutPanel.astro';
import TagCloud from '../../components/TagCloud.astro';
import { SITE_TITLE } from '../../consts';
import { getCollection } from 'astro:content';
import { allTags, prevNextOf, relatedOf, fmtDate } from '../../lib/site';

export async function getStaticPaths() {
	const entries = await getCollection('blog');
	return entries.map((entry) => ({
		params: { slug: entry.id },
		props: { entry, prevNext: prevNextOf(entry, entries), related: relatedOf(entry, entries), tags: allTags(entries) },
	}));
}
const { entry, prevNext, related, tags } = Astro.props;
const { prev, next } = prevNext;
---
<!doctype html>
<html lang="zh-Hans">
	<head><BaseHead title={`${SITE_TITLE} · ${entry.data.title}`} description={entry.data.cover.sub} /></head>
	<body>
		<Header active="home" />
		<main>
			<div class="layout">
				<section>
					<CoverCard cover={entry.data.cover} variant="post" />
					<div class="post-panel">
						<h1 class="post-title">{entry.data.title}</h1>
						<div class="post-meta">
							<ClockIcon />{fmtDate(entry.data.pubDate)}
							&nbsp;
							{entry.data.tags.map(t => <a class="tag" href={`/?tag=${encodeURIComponent(t)}`}>{t}</a>)}
						</div>
						<div class="prose"><Content /></div>
						<div class="prevnext">
							{prev ? <a href={`/blog/${prev.id}/`}>← 上一篇<span class="t">{prev.data.title}</span></a> : <a class="dis" style="pointer-events:none">← 已是最新</a>}
			{next ? <a href={`/blog/${next.id}/`}>下一篇 →<span class="t">{next.data.title}</span></a> : <a class="dis" style="pointer-events:none">已是最早 →</a>}
						</div>
					</div>
				</section>
				<aside class="aside">
					<AboutPanel />
					<div class="panel"><div class="p-head"><h2>相关推荐</h2></div><div class="rank">
						{related.map(p => <a href={`/blog/${p.id}/`}><span class="n">荐</span><span class="t">{p.data.title}</span></a>)}
					</div></div>
					<TagCloud tags={tags} />
				</aside>
			</div>
		</main>
		<Footer />
	</body>
</html>
```

- [ ] **Step 2: 验证**

`npm run dev`，浏览器开 `/blog/deepseek-v41-flash-unreviewed/`：
1. 封面卡渐变 + 两行大字 + 子标签（对照素材 post.html 顶部）；
2. 正文 `## 部署步骤` 下的四空格代码块渲染成带边框的 `<pre>`，`**加粗**` 变 `<strong>`（Review Focus 第 3 条）；日期显示 `2026-10-31`（字符串，Review Focus 第 2 条）；
3. 上一篇/下一篇按日期正确（该篇为最新 → 显示「← 已是最新」）；相关推荐 ≤4 且都有共同标签；
4. 再开 `/blog/clover-35b-a3b/` 确认 prevnext 双向都有。停 dev。

- [ ] **Step 3: Commit**

```bash
git add src/pages/blog/[slug].astro
git commit -m "feat: 文章页服务端渲染（正文/上下篇/相关推荐）"
```

---

### Task 5: 标签页 + AI 工具页

**Files:**
- Create: `src/pages/tags.astro`
- Create: `src/data/tools.ts`
- Create: `src/pages/ai-tools.astro`

**Interfaces:**
- Consumes: Task 2 组件与 `allTags`；Task 1 collection
- Produces: `src/data/tools.ts` 导出 `TOOLS: Tool[]`，`Tool = { id: string, name: string, tagline: string, sub: string, cls: 'c1'…'c8', desc: string, tags: string[], url: string }`

- [ ] **Step 1: `src/data/tools.ts`**

配方：`素材/posts.js` 里 `TOOLS` 的 9 项（`ollama`、`llama-cpp`、`lm-studio`、`comfyui`、`cloudflare-workers-ai`、`openai-api`、`deepseek-api`、`gemini-api`、`hugging-face`，见 posts.js:568–659）原样搬成 TS 模块，加类型：

```ts
export interface Tool { id: string; name: string; tagline: string; sub: string; cls: 'c1' | 'c2' | 'c3' | 'c4' | 'c5' | 'c6' | 'c7' | 'c8'; desc: string; tags: string[]; url: string }
export const TOOLS: Tool[] = [ /* 9 项，字段值与素材逐字一致 */ ];
```

- [ ] **Step 2: `src/pages/tags.astro`**

结构 = 素材 tags.html:24–38（panel + tagstat + tagboard；aside 放 AboutPanel + HotPanel）。tagstat 文案「共 N 个标签 · M 篇内容 · 点击标签按该主题筛选」由 `allTags(entries).length` 与 `entries.length` 算出；tagboard 每项 `<a href="/?tag=…">名<span class="cnt">count</span></a>`（编码同 Task 3）。`Header active="tags"`。

- [ ] **Step 3: `src/pages/ai-tools.astro`**

结构 = 素材 ai-tools.html:24–37（tagstat + grid；aside 放 AboutPanel + HotPanel + TagCloud）。卡片 = 素材 ai-tools.html:51–57 的 buildCard 逻辑：`<a class="card" href={t.url} target="_blank" rel="noopener">` 内 `<CoverCard cover={{lines: [t.name, t.tagline], sub: t.sub, cls: t.cls}} />`（Ledger: Task 5 Ruling）+ card-body（desc 进 card-title，tags 进 `.tags`）。`Header active="ai-tools"`。

- [ ] **Step 4: 验证**

`npm run dev`：`/tags/` 标签墙计数与真实数据一致（「AI 大模型」应显示 5、「本地部署」应显示 14）；点标签进 `/?tag=…` 生效。`/ai-tools/` 出 9 张卡、外链正确、封面 cls 渐变与素材一致。对照素材截图。停 dev。

- [ ] **Step 5: Commit**

```bash
git add src/pages/tags.astro src/pages/ai-tools.astro src/data/tools.ts
git commit -m "feat: 标签页与 AI 工具页"
```

---

### Task 6: 关于页 + RSS 更新

**Files:**
- Create: `src/pages/about.astro`
- Modify: `src/pages/rss.xml.js`（重写）

**Interfaces:**
- Consumes: Task 2 组件（含 MonthPanel）、Task 1 collection
- Produces: `/about/` 路由；`/rss.xml` 16 条合法 item

- [ ] **Step 1: `src/pages/about.astro`**

结构 = 素材 about.html:24–61 原样（about-hero + about-body 全部文案不改写；aside 放 HotPanel + TagCloud + MonthPanel）。`Header active="about"`。social 三个链接保持素材的 `#` 占位。

- [ ] **Step 2: 重写 `src/pages/rss.xml.js`**

```js
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE_TITLE, SITE_DESCRIPTION } from '../consts';

export async function GET(context) {
	const posts = await getCollection('blog');
	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		items: posts.map((p) => ({
			title: p.data.title,
			description: p.data.cover.sub,
			pubDate: p.data.pubDate,
			link: `/blog/${p.id}/`,
			categories: p.data.tags,
		})),
	});
}
```

- [ ] **Step 3: 验证**

`npm run build` 后检查 `dist/rss.xml`：16 个 item、`pubDate` 为 ISO 格式、每个 `description` 非空（Review Focus 第 5 条）；`dist/sitemap-0.xml` 列出 `/`、`/blog/*` 16 条、`/tags/`、`/ai-tools/`、`/about/`。dev 里开 `/about/` 对照素材 about.html 截图一致。停 dev。

- [ ] **Step 4: Commit**

```bash
git add src/pages/about.astro src/pages/rss.xml.js
git commit -m "feat: 关于页与 RSS 按新 schema 落地"
```

---

### Task 7: 全站终检

**Files:**
- 无新文件；只修终检发现的问题

- [ ] **Step 1: 全量构建**

Run: `npm run build` → Expected: 零错误零警告（除 npm 用户配置 warn）。

- [ ] **Step 2: 逐页对照 + 行为清单**

`npm run dev`，浏览器面板按 spec「验证」节逐项过：5 页对照素材截图；分页 15 条、`?tag=`、月份下拉、清除筛选、空态、搜索、文章页 prevnext/相关推荐、RSS/sitemap。发现偏差就地修复并补 commit。

- [ ] **Step 3: 收尾**

确认 `dist/` 无旧模板路由残留；`git status` 干净（`素材/` 保持未跟踪，属用户材料）。最后 commit（如有修复）。

---

## Self-Review 记录

- Spec 覆盖：schema/16 篇→Task1；样式/组件→Task2；主页+搜索→Task3；文章页→Task4；标签/工具→Task5；关于/RSS/sitemap→Task6；验证→Task7。无缺口。
- 占位符扫描：无 TBD；长文案均给出「素材 文件:行号」的逐字来源。
- 类型一致：`META` 字段与 `buildCard` 消费一致；`HotPanel/TagCloud/MonthPanel` 签名在 Task 2 定义、Task 3/4/5/6 按同签名调用；`fmtDate/allTags/monthList/hotPosts/relatedOf/prevNextOf` 定义于 Task 2，各任务引用名一致。
- Review Focus 五条均已钉到 Task 3/4/6 的验证步骤。
