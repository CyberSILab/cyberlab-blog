---
title: "FLUX 3 Image Klein 图片AI模型本地部署教程 | 文生图、图片编辑、多图融合"
pubDate: 2026-10-24
tags: ["文生图", "本地部署"]
cover:
  lines: ["FLUX 3 Image Klein", "8GB 显卡就能跑"]
  sub: "文生图 · 图片编辑 · 多图融合"
  cls: c8
---

## 模型简介

FLUX 3 Image Klein 是 FLUX 系列的小尺寸版本，一个模型同时支持文生图、图片编辑和多图融合，8GB 显存就能跑通。

## 硬件与下载

- 模型权重约 7.2GB，8GB 显存可跑 1024x1024
- 显存 6GB 时建议出 768 分辨率

## 部署步骤

在 ComfyUI 中加载官方工作流：

    1. 下载 flux3-klein 权重放入 checkpoints
    2. 加载自带的 txt2img / img2img / merge 三套工作流
    3. 多图融合把两张输入图接到 reference 节点

## 实测效果

- 出图约 25 秒/张（8GB 显卡，20 步）
- 图片编辑能保住原图构图，改风格效果最好
- 多图融合人物一致性尚可，复杂场景会糊

## 小结

一张卡兼顾生图和改图，性价比很高。追求大尺寸高细节请上 FLUX 标准版。
