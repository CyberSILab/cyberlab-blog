# 素材转 Astro 迁移设计

日期：2026-11-03 · 状态：已与用户逐段确认 · 部署目标：纯静态（GitHub Pages）

## 背景与目标

- 现状：`src/` 仍是官方 Astro 博客模板（仓库只有一个初始化 commit）；`素材/` 是未跟踪的静态原型（5 个页面 + `blog.css` + `posts.js`：16 篇帖子 + 9 个 AI 工具）。
- 目标：整站变成「赛博实验室」设计，页面行为与原型一致；`素材/` 保留为参考材料，不接入运行时。
- 单一数据源：文章一律进 content collections；不允许出现第二份手写数据。

## 决策摘要

| 点 | 决定 |
|---|---|
| 渲染方式 | 纯静态，不加 SSR adapter。主页网格/筛选/分页/搜索为客户端脚本；其余页面构建期渲染 |
| 文章数据 | 16 篇 → `src/content/blog/<id>.md`（frontmatter + 正文原样搬） |
| 工具数据 | TOOLS → `src/data/tools.ts`（纯 TS 数据模块，非 content collection） |
| 搜索框 | 接成真的客户端关键词过滤（匹配标题或标签） |
| 清理 | 删模板示例文章、placeholder 图、Atkinson 字体与 fonts 配置、`sharp`、`@astrojs/mdx` |
| 保留 | `@astrojs/rss`（按新 schema 更新）、`@astrojs/sitemap`、favicon |

## 内容 schema（`src/content.config.ts`）

```ts
schema: z.object({
  title: z.string(),
  pubDate: z.coerce.date(),
  tags: z.array(z.string()).min(1),
  cover: z.object({
    lines: z.array(z.string()).min(1).max(2),
    sub: z.string(),
    cls: z.enum(['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8']),
  }),
  hot: z.number().int().positive().optional(),
})
```

- slug = 素材里的 `id`，文件名 `<id>.md`；正文 Markdown 原样复制，不改写。
- 不设 `description`/`heroImage` 字段；RSS 的 description 用 `cover.sub`。

## 路由

| 路由 | 来源 | 渲染 |
|---|---|---|
| `/` 主页 | 素材/博客主页.html | 侧栏四面板构建期渲染；网格/筛选条/分页/搜索客户端 |
| `/blog/[slug]/` 文章页 | 素材/post.html | 全服务端：封面卡、标题、日期/标签 meta、Markdown 正文、上一篇/下一篇、相关推荐（共同标签 ≤4，按日期倒序） |
| `/tags/` 标签墙 | 素材/tags.html | 服务端（计数由 collection 算） |
| `/ai-tools/` 工具网格 | 素材/ai-tools.html | 服务端，读 `src/data/tools.ts` |
| `/about/` 关于页 | 素材/about.html | 静态内容原样 |
| `/rss.xml` | 现有 `src/pages/rss.xml.js` | 保留路由，按新 schema 更新字段 |

- 标签筛选 URL：`/?tag=xxx`；月份筛选与分页为客户端状态（与原型一致）。
- 页面 `<html lang="zh-Hans">`；`SITE_TITLE = '赛博实验室'`，`SITE_DESCRIPTION` 用关于页的一句话简介。
- `astro.config.mjs` 的 `site` 保持占位 `https://example.com`，部署时再改真实域名。

## 主页客户端数据流

- `index.astro` 从 `getCollection('blog')` 取元数据（id/title/date/tags/cover/hot），构建期以 `<script>` 内嵌为 `META` 数组；客户端脚本移植素材主页逻辑：`PAGE_SIZE = 15`、月份下拉、`?tag=`、filterbar、pager、空态提示，行为逐项照抄原型。
- 搜索：header 的 `.search` 药盒内改为真实 `<input>`（外观保持原型风格，加少量 CSS）；关键词匹配标题或标签即过滤网格、`page` 归 1、filterbar 显示「关键词」；与月份/标签筛选可叠加。
- 侧栏「归档」月份下拉的 `<option>` 列表由 collection 生成（服务端）。

## 共享组件（`.astro`）

- `Header.astro`（active 高亮按当前路由）、`Footer.astro`、`BaseHead`（title 模式「赛博实验室 · X」+ RSS 链接）。
- 侧栏面板：`AboutPanel` / `HotPanel`（hot 值升序）/ `TagCloud` / `MonthPanel`；`CoverCard`（封面文字卡，主页卡片与文章页共用）；`ClockIcon`。
- 文章页 prevnext 与相关推荐全部服务端计算，无客户端 JS。

## 样式

- `src/styles/global.css` ← 素材 `blog.css` 原样（系统字体，无自托管字体），仅追加搜索 input 的少量样式。
- 删除 `astro.config.mjs` 的 fonts 配置段与 `src/assets/fonts/*.woff`。

## 删除清单

- `src/content/blog/` 模板示例 5 篇（first/second/third-post.md、markdown-style-guide.md、using-mdx.mdx）
- `src/assets/blog-placeholder-*.jpg`（6 张）
- `src/assets/fonts/`（2 个 woff）
- `src/components/FormattedDate.astro`（新设计不用）
- 依赖：`sharp`、`@astrojs/mdx`（`astro.config.mjs` 同步去掉 `mdx()`）

## 验证

1. `npm run build` 通过、`npm run dev` 可用。
2. 浏览器面板逐页对照素材原型：主页 / 文章页 / 标签页 / 工具页 / 关于页，布局与配色一致。
3. 行为核对：每页 15 条分页、`?tag=` 进入筛选、月份下拉、清除筛选、空态提示、搜索过滤。
4. RSS 与 sitemap 正常生成、字段合法。

## 不在范围

- 不新增文章、不做评论系统、不写部署 workflow（GitHub Pages 配置以后单独加）。
