---
title: "8GB 显卡也能装！LFM2.5-24B-A2B 多模态模型本地部署教程"
pubDate: 2026-08-12
tags: ["多模态", "本地部署"]
cover:
  lines: ["LFM2.5-24B-A2B", "8GB 也能跑"]
  sub: "多模态 · 端侧运行"
  cls: c8
hot: 6
---

## 模型简介

LFM2.5-24B-A2B 是 LFM 系列的 MoE 多模态版本：总参数 240 亿、激活约 20 亿，带视觉编码器，端侧设备也能运行。

## 硬件与下载

- Q4_K_M 量化约 7.4GB，8GB 显存可跑
- 16GB 显存可以开更长上下文

## 部署步骤

    ollama pull lfm2.5-24b-a2b-q4
    ollama run lfm2.5-24b-a2b-q4 --image demo.jpg

## 实测效果

- 8GB 显卡约 14 token/秒
- 工具调用继承 LFM 系列强项，正确率约 90%
- 图片理解可用但弱于专门的识图模型

## 小结

"语言 + 工具 + 视觉"都要、显存又只有 8GB 时的均衡选择。视觉要求高请配 MiniCPM-V 或 WeVisOne。
