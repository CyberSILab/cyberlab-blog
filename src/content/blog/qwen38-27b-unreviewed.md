---
title: "8GB 显卡就能跑！Qwen3.8 27B 无审查版 AI 模型本地部署教程"
pubDate: 2026-09-22
tags: ["AI 大模型", "本地部署"]
cover:
  lines: ["Qwen3.8 27B", "无审查版"]
  sub: "8GB 显卡就能跑"
  cls: c5
hot: 2
---

## 模型简介

Qwen3.8 27B 无审查版去掉了安全过滤，回答更放开，中文写作和角色扮演社区里用得最多。

## 硬件与下载

- IQ4 量化约 7.6GB，8GB 显存刚好放下
- 上下文建议 16K 起步，显存富余再扩

## 部署步骤

    ollama pull qwen3.8-27b-unreviewed-iq4
    ollama run qwen3.8-27b-unreviewed-iq4

## 实测效果

- 8GB 显卡（3070）约 12 token/秒
- 长文写作连贯性好，无审查版不会反复"礼貌拒绝"
- 工具调用能力一般，做 Agent 不如 LFM 系列

## 小结

8GB 显存的中文大模型首选。做工具调用请换专门强化 Agent 能力的模型。
