---
title: "Clover 35B-A3B Preview 本地部署教程 + 实测 | 350亿参数、128K上下文"
pubDate: 2026-10-30
tags: ["AI 大模型", "本地部署"]
cover:
  lines: ["Clover 35B-A3B", "本地部署"]
  sub: "350亿参数 · 128K上下文"
  cls: c2
---

## 模型简介

Clover 35B-A3B 是典型的 MoE 架构：总参数 350 亿，每次推理只激活约 30 亿，所以小显存也能跑出接近 7B 稠密模型的速度。Preview 版仍在快速迭代，建议关注版本更新。

## 硬件与下载

- Q4_K_M 量化约 19GB，16GB 显存可部分层卸载到内存
- 24GB 显存可以全量常驻，速度最稳
- 原生支持 128K 上下文，长文档分析优势明显

## 部署步骤

    ollama pull clover-35b-a3b-preview-q4
    ollama run clover-35b-a3b-preview-q4

llama.cpp 用户建议加参数：--context-size 32768 --flash-attn，先稳定跑起来再逐步扩上下文。

## 实测效果

- 24GB 显卡（3090）约 25 token/秒
- 16GB 显卡开启部分卸载后约 12 token/秒，可用但偏慢
- 长上下文检索准确率在同级模型里属于第一梯队

## 小结

显存 24GB 以上首选；16GB 也能跑，但要接受速度下降。Preview 版记得定期更新权重。
