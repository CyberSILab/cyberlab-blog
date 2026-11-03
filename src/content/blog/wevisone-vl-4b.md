---
title: "最强 AI 识图模型！腾讯 WeVisOne-VL-4B 本地部署 + 实测"
pubDate: 2026-10-27
tags: ["AI 识图", "本地部署"]
cover:
  lines: ["WeVisOne-VL 4B", "1秒智能识图"]
  sub: "person 0.96 · dog 0.95 · cat 0.93"
  cls: c5
hot: 9
---

## 模型简介

WeVisOne-VL-4B 是腾讯开源的视觉理解模型，主打"一秒识图"：对常见物体、场景、图表的识别准确率在同级模型里名列前茅。

## 硬件与下载

- Q4_K_M 量化约 2.6GB，6GB 显存可跑
- 12GB 显存可以开高分辨率输入，识别更细

## 部署步骤

    ollama pull wevisone-vl-4b
    ollama run wevisone-vl-4b --image photo.jpg

## 实测效果

- 常见物体识别：person 0.96 / dog 0.95 / cat 0.93
- 图表读数（柱状图、表格）约 90% 正确
- 单图响应约 1.2 秒，符合"1秒识图"的宣传

## 小结

4B 级别识图能力最强的一档。显存只有 4GB 的话，请看同系列的 2B 版本。
