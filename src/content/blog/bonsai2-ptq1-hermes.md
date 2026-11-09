---
title: '27B 塞进 8GB 显存！Bonsai 2 Abliterated v2 本地部署 + Hermes 接入教程｜1.75bit 三值量化、100 次提问 0 拒答'
pubDate: 2026-11-08
tags: ['本地部署', '量化', 'Hermes', 'qwen3.8 27b', '1bit', 'llamacpp', 'abliterated']

cover:
  lines: ['Bonsai 2', '27B · 5.95GB']
  image: 'https://raw.githubusercontent.com/huihanglai/pic/pic/Bonsai 2 去审查版图解.png'
  cls: c2
  sub: '8GB 显存 · 本地运行'
---

大家好，这里是赛博实验室。今天分享一个有qwen3.8 27b的量化模型，Prism ML 的 **Bonsai 2 27B**，权重 **三值（ternary）**，最高支持原生262K上下文，每个权重只取 −1、0、+1 三种值，综合 **1.75 bit/weight**。它在 14 项推理基准上拿到了 FP16 原版 **98.2%** 的成绩。

这期我们用社区版的 **Abliterated v2（去审查第二版）**，配合 **PTQ1_0** 打包，全程本地跑通；最后再把 **Hermes Agent** 接上来，让这个 5.95GB 的小模型自己调工具。

## 模型简介

- **来源**：Prism ML 开源，基座是 Qwen3.8-27B；本文用的去审查版由 BoldingBuilds 在该 PTQ1_0 上二次编辑
- **参数量**：27.36B（24.35B 语言主干 / 64 层 + 2.54B 嵌入与 LM head + 0.46B 视觉塔）
- **架构**：混合注意力（约 75% 线性注意力 + 25% 全注意力）、SwiGLU、RoPE、RMSNorm
- **上下文**：262K token
- **权重格式**：三值 g128，每 128 个权重共享一个 FP16 scale
- **部署体积**：PTQ1_0 为 **5.95GB**，PQ2_0 为 7.21GB
- **视觉**：可选 `mmproj` 视觉塔，0.63GB，只在输入图片时加载
- **协议**：Apache 2.0

## 测试环境

| 项目 | 配置 |
| --- | --- |
| 操作系统 | Windows 11 64-bit 家庭版 |
| 显卡 | NVIDIA RTX 2000 Ada Laptop GPU（8GB） |
| 处理器 | 13th Gen Intel Core i7-13700H |
| 内存 | 32GB DDR5 5600MHz |
| 存储 | NVMe SSD，预留 15GB 以上 |

## 一、下载 Prism 版 llama.cpp

![](https://private-user-images.githubusercontent.com/1991296/629069102-88726b48-1713-48aa-a525-95a02e78afc4.png?jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3OTQxMjQwMDMsIm5iZiI6MTc5NDEyMzcwMywicGF0aCI6Ii8xOTkxMjk2LzYyOTA2OTEwMi04ODcyNmI0OC0xNzEzLTQ4YWEtYTUyNS05NWEwMmU3OGFmYzQucG5nP1gtQW16LUFsZ29yaXRobT1BV1M0LUhNQUMtU0hBMjU2JlgtQW16LUNyZWRlbnRpYWw9QUtJQVZDT0RZTFNBNTNQUUs0WkElMkYyMDI2MTEwOCUyRnVzLWVhc3QtMSUyRnMzJTJGYXdzNF9yZXF1ZXN0JlgtQW16LURhdGU9MjAyNjExMDhUMDc0MTQzWiZYLUFtei1FeHBpcmVzPTMwMCZYLUFtei1TaWduYXR1cmU9NzVkMmY0MWNmZGY2OThjMTU4NTBiMjA4MTgyYjdiMzRlMTkzMDhhZGVlNDJkYTU4ZTdkMzg1OWIwOWE0ZjgwZSZYLUFtei1TaWduZWRIZWFkZXJzPWhvc3QmcmVzcG9uc2UtY29udGVudC10eXBlPWltYWdlJTJGcG5nIn0.xXsrhcTxvpYLF6dtrrwcoFeETDzOPcMDeDgHPKJDCxI)

- 仓库：[PrismML-Eng/llama.cpp](https://github.com/PrismML-Eng/llama.cpp)

- 预编译包：[Releases](https://github.com/PrismML-Eng/llama.cpp/releases/latest)

Release 按照显卡选：

**Windows**

| 文件 | 大小 | 适用 |
| --- | ---: | --- |
| `llama-prism-*-bin-win-cuda-12.4-x64.zip` | 约 339MB | NVIDIA，12.x / 13.x 驱动，**推荐** |
| `llama-prism-*-bin-win-cuda-13.3-x64.zip` | 约 190MB | NVIDIA，已装 CUDA 13.3 运行库 |
| `llama-prism-*-bin-win-hip-radeon-x64.zip` | 约 344MB | AMD Radeon（HIP） |
| `llama-prism-*-bin-win-sycl-x64.zip` | 约 102MB | Intel 独显 / 核显（SYCL） |
| `llama-prism-*-bin-win-vulkan-x64.zip` | 约 27MB | 通用 Vulkan，AMD / Intel / NVIDIA 都能试 |
| `llama-prism-*-bin-win-cpu-x64.zip` | 约 20MB | 纯 CPU，没有独显时用 |
| `llama-prism-*-bin-win-cpu-arm64.zip` | 约 13MB | Windows on ARM |

**Linux**

| 文件 | 大小 | 适用 |
| --- | ---: | --- |
| `llama-prism-*-bin-linux-cuda-12.8-x64.tar.gz` | 约 218MB | NVIDIA（另有 cuda-12.4 / 13.3 版本） |
| `llama-prism-*-bin-ubuntu-rocm-7.2-x64.tar.gz` | 约 171MB | AMD ROCm 7.2 |
| `llama-prism-*-bin-ubuntu-sycl-fp16-x64.tar.gz` | 约 50MB | Intel GPU（fp32 版约 49MB） |
| `llama-prism-*-bin-ubuntu-vulkan-x64.tar.gz` | 约 32MB | 通用 Vulkan |
| `llama-prism-*-bin-ubuntu-x64.tar.gz` | 约 19MB | 纯 CPU |

**macOS**

| 文件 | 大小 | 适用 |
| --- | ---: | --- |
| `llama-prism-*-bin-macos-arm64.tar.gz` | 约 13MB | Apple Silicon（Metal） |
| `llama-prism-*-bin-macos-x64.tar.gz` | 约 12MB | Intel Mac |

## 二、下载 PTQ1 模型

- Hugging Face 官方仓库：[BoldingBuilds/Ternary-Bonsai-2-27B-Abliterated-v2-PTQ1_0-GGUF](https://huggingface.co/BoldingBuilds/Ternary-Bonsai-2-27B-Abliterated-v2-PTQ1_0-GGUF/tree/main)
- 国内镜像：[hf-mirror.com/BoldingBuilds/Ternary-Bonsai-2-27B-Abliterated-v2-PTQ1_0-GGUF](https://hf-mirror.com/BoldingBuilds/Ternary-Bonsai-2-27B-Abliterated-v2-PTQ1_0-GGUF/tree/main)

| 文件 | 大小 | 说明 |
| --- | ---: | --- |
| `Ternary-Bonsai-2-27B-Abliterated-v2-PTQ1_0.gguf` | 5.95GB | 主模型，必下 |
| `Ternary-Bonsai-2-27B-mmproj-Q8_0.gguf` | 629MB | 视觉塔，要传图再下 |

主模型的 SHA256 是 `0ac61a3c54f2599aefa40144196ce5e0b7acf3a87b3ae74d65540b91e0c4cf12`，下完可以对一下。

PTQ1_0 只有 [Prism 的 llama.cpp 分支](https://github.com/PrismML-Eng/llama.cpp) 认，mainline llama.cpp、Ollama、LM Studio 里没带 PTQ1_0 支持的构建会直接加载失败。

## 三、启动 llama-server

```powershell
.\llama-server.exe `
  -m ..\models\Ternary-Bonsai-2-27B-Abliterated-v2-PTQ1_0.gguf `
  -ngl 99 -fa on -c 32768 `
  -ctk q8_0 -ctv q4_0 `
  --jinja --reasoning on --reasoning-effort medium `
  --temp 1.0 --top-p 0.95 --top-k 20 `
  --host 127.0.0.1 --port 8080 `
  --alias qwen3.8-27 `
  --mmproj ..\models\Ternary-Bonsai-2-27B-mmproj-Q8_0.gguf
```

最后一行是视觉塔，不传图片可以删掉，同时把上一行末尾的反引号去掉。8GB 卡加载 mmproj 会再占约 0.6GB 显存。

各参数的作用：

| 参数 | 作用 | 8GB 显存建议 |
| --- | --- | --- |
| `-m` | 模型文件路径 | 必填 |
| `-ngl 99` | 所有层放 GPU；`0` 是纯 CPU | 保持 99 |
| `-fa on` | Flash Attention，明显降低 KV 缓存占用 | 必开 |
| `-c 32768` | 上下文长度，最大 262144 | 8GB 卡开 32K |
| `-ctk q8_0` | K 缓存量化成 8bit | K8，省显存 |
| `-ctv q4_0` | V 缓存量化成 4bit | V4，省得更狠 |
| `--jinja` | 用模型自带的 chat template，Hermes 的工具调用依赖它 | 这个构建默认已开启，写上更保险 |
| `--reasoning on` | 开启思考模式 | 保持 |
| `--reasoning-effort medium` | 思考预算；默认 `xhigh` 更长更慢，`low` 不支持 | 用 `medium` |
| `--temp 1.0 --top-p 0.95 --top-k 20` | 官方推荐的思考模式采样参数 | 照抄 |
| `--alias qwen3.8-27` | API 里返回的模型名，Hermes 配置要填它 | 保持 |
| `--mmproj` | 视觉塔，传图片才需要 | 不用图就删 |

启动后用浏览器打开 `http://127.0.0.1:8080`，就能直接对话。

## 四、安装 Hermes

![](https://github.com/NousResearch/hermes-agent/blob/main/assets/banner.png?raw=true)

### 桌面版

- 下载 [Hermes-Setup.exe](https://hermes-assets.nousresearch.com/Hermes-Setup.exe)
- 打开cmd设置环境变量：

```
set "ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/" && Hermes-Setup.exe
```

## 五、把 Hermes 接到本地模型

先确认 llama-server 正在跑，并且拿到准确的模型名：

```powershell
curl.exe http://127.0.0.1:8080/v1/models
```

返回里的 `id` 就是模型名。我们在启动参数里用 `--alias qwen3.8-27` 把它固定住了；不加 alias 的话，这个 id 会变成模型文件的路径（带反斜杠），填进 Hermes 容易出错。本例是：

```text
qwen3.8-27
```

然后写进 Hermes 配置（桌面版和命令行版共用这一份配置）：

```powershell
hermes config set model.provider custom
hermes config set model.base_url http://127.0.0.1:8080/v1
hermes config set model.default qwen3.8-27
```

不想记命令的话，跑 `hermes model`，选 **Custom endpoint**，按提示填 `http://127.0.0.1:8080/v1` 和 `qwen3.8-27` 就行。

也可以直接改 `%LOCALAPPDATA%\hermes\config.yaml`：

```yaml
model:
  provider: custom
  base_url: http://127.0.0.1:8080/v1
  default: qwen3.8-27
```

## 资源下载

- **夸克网盘打包**：https://pan.quark.cn/s/a8e3ae0bd28b?pwd=FFvB
- **官方地址**
  - Bonsai 2 27B GGUF：[prism-ml/Ternary-Bonsai-2-27B-gguf](https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf)
  - 去审查版 v2：[BoldingBuilds/Ternary-Bonsai-2-27B-Abliterated-v2-PTQ1_0-GGUF](https://huggingface.co/BoldingBuilds/Ternary-Bonsai-2-27B-Abliterated-v2-PTQ1_0-GGUF)
  - Prism llama.cpp：[PrismML-Eng/llama.cpp](https://github.com/PrismML-Eng/llama.cpp)
  - Bonsai Demo 与白皮书：[PrismML-Eng/Bonsai-demo](https://github.com/PrismML-Eng/Bonsai-demo)
  - Hermes Agent：[hermes-agent.nousresearch.com](https://hermes-agent.nousresearch.com/)


