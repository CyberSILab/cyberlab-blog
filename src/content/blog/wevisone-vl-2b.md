---
title: "仅 4.88GB 大小！腾讯 WeVisOne-VL-2B 模型本地部署 + 实测：超强 AI 智能识图"
pubDate: 2026-10-26
tags: ["AI 识图", "本地部署"]
cover:
  lines: ["WeVisOne-VL 2B", "AI极速识图"]
  sub: "仅 4.88GB 大小"
  cls: c6
---

## 模型简介

WeVisOne-VL-2B 是同系列的小杯版本，模型文件仅 4.88GB（含视觉编码器），4GB 显存也能跑，识图能力相对 4B 只有小幅下降。

## 硬件与下载

- 模型文件 4.88GB，Q4 量化约 1.6GB
- 4GB 显存即可运行，轻薄本友好

## 部署步骤

    ollama pull wevisone-vl-2b
    ollama run wevisone-vl-2b --image photo.jpg

## 实测效果

- 常见物体识别约 0.91，比 4B 低 2-4 个点
- 响应更快，约 0.7 秒一张
- 复杂图表读数会出错，简单图表没问题

## 小结

小显存识图首选。要冲准确率就上 4B，要速度和体积就选它。
