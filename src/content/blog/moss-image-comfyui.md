---
title: "MOSS-Image 无审查 AI 图片模型本地部署教程 | ComfyUI + JSON 布局控制"
pubDate: 2026-09-19
tags: ["文生图", "ComfyUI"]
cover:
  lines: ["MOSS-Image", "无审查模型"]
  sub: "ComfyUI + JSON 布局控制"
  cls: c2
hot: 3
---

## 模型简介

MOSS-Image 标准版支持用 JSON 描述画面布局：把物体位置、数量、层级写成结构化提示，出图构图可控，这是它最大的卖点。

## 硬件与下载

- 权重约 9.8GB，建议 12GB 显存
- 8GB 显存可出 768 分辨率

## 部署步骤

    1. 权重放入 ComfyUI 的 checkpoints
    2. 使用官方 layout-json 工作流
    3. 在 layout 节点里写 JSON：objects / position / count

例如：{"objects":[{"name":"cat","position":"left","count":1}]}，出图里猫会稳定出现在左侧。

## 实测效果

- 布局命中率约 85%，比纯文本提示高一个档次
- 12GB 显卡出 1024 图约 40 秒（20 步）
- 人物手部仍是弱点，构图复杂时会崩

## 小结

做海报、封面这类讲究构图的内容首选。快速出草稿请看 8-steps 版。
