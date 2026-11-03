---
title: "4GB 显卡就能装！MiniCPM-V 4.7 视觉模型本地部署 + 实测"
pubDate: 2026-08-14
tags: ["AI 识图", "多模态", "本地部署"]
cover:
  lines: ["MiniCPM-V 4.7", "视觉小钢炮"]
  sub: "4GB 显存 · 多图识别"
  cls: c4
hot: 7
---

## 模型简介

MiniCPM-V 4.7 是面壁智能 MiniCPM-V 系列的最新版，主打端侧部署：4GB 显存就能跑，支持一次输入多张图片做对比分析。

## 硬件与下载

- GGUF 量化约 1.8GB，4GB 显存可跑
- 轻薄本 CPU 也能演示，速度约 6-10 token/秒

## 部署步骤

    ollama pull minicpm-v-4.7
    ollama run minicpm-v-4.7 --image a.jpg --image b.jpg

多图对比时直接提问"这两张图有什么不同"，模型会逐条列出差异。

## 实测效果

- 常见物体识别约 0.92，OCR 读数很稳
- 多图对比一次最多 6 张，再多会漏
- 4GB 显卡单图响应约 1 秒

## 小结

小显存做识图和 OCR 的稳妥选择。识图准确率极限还是看 WeVisOne-VL 4B。
