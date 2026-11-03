---
title: "英伟达下场了！Nemotron 3.5 Bolt 74B-A9B 24GB AI模型本地部署教程"
pubDate: 2026-08-18
tags: ["AI 大模型", "多模态"]
cover:
  lines: ["NVIDIA Nemotron", "3.5 Bolt 74B-A9B"]
  sub: "24GB · 262K上下文"
  cls: c7
---

## 模型简介

Nemotron 3.5 Bolt 是英伟达的 MoE 模型：总参数 740 亿、激活约 90 亿，同时带视觉编码器，是本地部署里"又大又能看图"的代表。

## 硬件与下载

- Q4_K_M 量化约 38GB，需要 24GB 显卡 + 32GB 内存做部分卸载
- 双 12GB 卡组卡也能跑

## 部署步骤

    ollama pull nemotron-35-bolt-q4
    ollama run nemotron-35-bolt-q4 --image demo.jpg

llama.cpp 组卡加参数：--n-gpu-layers 40 -d 12,12。

## 实测效果

- 24GB + 内存卸载约 9 token/秒，偏慢但能对话
- 视觉能力接近 7B 级视觉模型，超出预期
- 262K 上下文对长文档很稳

## 小结

适合有 3090/双卡的工作站。普通 12GB 单卡请回到 DeepSeek-V4.1-Flash 系列。
