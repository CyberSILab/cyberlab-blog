---
title: "4GB 显卡就能装！Bonsai2 9B 超轻量多模态 AI 大模型本地部署教程"
pubDate: 2026-08-16
tags: ["多模态", "本地部署"]
cover:
  lines: ["Bonsai2 9B", "仅1.5GB"]
  sub: "多模态 · MTP加速"
  cls: c6
hot: 8
---

## 模型简介

Bonsai2 9B 走的是"小体积大参数"路线：Q4 量化只有约 1.5GB，还带 MTP（多 token 预测）加速，4GB 显存也能跑得流畅。

## 硬件与下载

- Q4_K_M 量化约 1.5GB，4GB 显存可跑
- CPU 推理也可用，内存 8GB 起步

## 部署步骤

    ollama pull bonsai2-9b-q4
    ollama run bonsai2-9b-q4 --image demo.jpg

MTP 加速在 llama.cpp 下自动生效，速度提升约 40%。

## 实测效果

- 4GB 显卡约 20 token/秒，小模型里速度突出
- 图片描述准确但简短，不擅长细节展开
- 长上下文建议 32K 以内

## 小结

4GB 显存多模态首选。要更深的语言能力请上 8GB 显存级别的模型。
