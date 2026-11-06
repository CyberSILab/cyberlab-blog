---
title: '6GB 显卡就能跑！开源单图转 3D 模型 Idol 本地部署教程｜ComfyUI 一键生成、最高百万高斯泼溅'
pubDate: 2026-11-06
tags: ['3D 生成', 'ComfyUI', '本地部署']
cover:
  lines: ['Idol 3D', '单图转 3D']
  image: 'https://raw.githubusercontent.com/huihanglai/pic/pic/6GB显卡也能跑：Idol单图转3D.png'
  sub: '6GB 显存 · 本地运行'
  cls: c6
---

大家好，这里是赛博实验室。今天给大家分享开源单图转 3D 模型 **Idol** 的 Windows 本地部署教程。这次使用 **ComfyUI** 一键跑通，最低 6GB 显存就能运行，把单张图片生成 360° 的 3D 高斯泼溅（3DGS），最高支持 100 万高斯点。模型采用 Apache 2.0 协议，不需要 API Token，全程本地运行。我们开始教程。

## 模型简介

- **来源**：Speridlabs 联合开源社区推出
- **参数量**：约 600M
- **任务**：单张图片 → 3D 高斯泼溅（3DGS）
- **架构**：3D DiT + DINOv3 ViT-H + FLUX.2 VAE
- **显存**：最低 6GB 可跑，16GB 可拉满百万高斯点
- **输出**：`.ply` / `.spz`，可进网页、Blender、UE5
- **协议**：Apache 2.0，可商用

## 测试环境

| 项目 | 配置 |
| --- | --- |
| 操作系统 | Windows 11 64-bit 家庭版 |
| 显卡 | NVIDIA RTX 2000 Ada Laptop GPU（8GB） |
| 处理器 | 13th Gen Intel Core i7-13700H |
| 内存 | 32GB DDR5 5600MHz |
| 存储 | NVMe SSD，预留 30GB 以上 |

## 一、下载 ComfyUI

新手优先用官方桌面版，不想安装就用便携包：

- **桌面版（首选）**：[https://www.comfy.org/download](https://www.comfy.org/download)
  本地文件名 `ComfyUI-Desktop-Setup.exe`，约 356MB。
- **便携版（免安装）**：[GitHub Releases](https://github.com/Comfy-Org/ComfyUI/releases)
  国内镜像：[hf-mirror.com/Comfy-Org/ComfyUI/releases](https://hf-mirror.com/Comfy-Org/ComfyUI/releases)

## 二、下载 Idol 模型

Idol 流程需要 4 个核心权重 + 1 个自动抠图模型：

- Hugging Face 官方仓库：[Comfy-Org/Idol](https://huggingface.co/Comfy-Org/Idol/tree/main)
- 国内镜像：[hf-mirror.com/Comfy-Org/Idol](https://hf-mirror.com/Comfy-Org/Idol/tree/main)

| 文件 | 大小 | 放置目录 |
| --- | --- | --- |
| `idol_fp16.safetensors` | 1.20GB | `ComfyUI/models/diffusion_models/` |
| `dino_v3_vit_h_bf16.safetensors` | 1.74GB | `ComfyUI/models/clip_vision/` |
| `flux2-vae.safetensors` | 335MB | `ComfyUI/models/vae/` |
| `idol_decoder_fp16.safetensors` | 350MB | `ComfyUI/models/vae/` |
| `BiRefNet-general-epoch_244.safetensors` | 1.05GB | `ComfyUI/models/birefnet/` |

各文件作用：

- **`idol_fp16`**：核心 3D 扩散主模型，预测高斯空间几何分布，必下。
- **`dino_v3_vit_h_bf16`**：Meta DINOv3 视觉模型，提取轮廓与像素级语义，必下。
- **`flux2-vae`**：FLUX.2 潜空间条件 VAE，负责图像潜特征，必下。
- **`idol_decoder_fp16`**：八叉树高斯解码器，把特征解码成三维点阵与球谐颜色，必下。
- **`BiRefNet-general-epoch_244`**：发丝级自动抠图，免手动抠白底，强烈推荐。

> `birefnet/` 目录默认没有，自己新建一个即可。

## 三、安装 ComfyUI 与插件

### 1. 安装 ComfyUI 桌面版

1. 双击 `ComfyUI-Desktop-Setup.exe`。
2. 选择安装路径。**路径全程不要出现中文字符**，推荐 `D:\AI\ComfyUI-Desktop`。
3. 点下一步完成安装。首次启动会自动配置隔离的 Python 与显卡环境。

### 2. 安装必备插件

进入插件目录：

- 桌面版：`D:\AI\ComfyUI-Desktop\resources\ComfyUI\custom_nodes`
- 便携版：`ComfyUI\custom_nodes`

在空白处按住 **Shift + 鼠标右键**，打开 PowerShell，依次执行：

```powershell
git clone https://github.com/ltdrdata/ComfyUI-Manager.git
git clone https://github.com/PedroMarinhoDev/ComfyUI-Idol.git
```

### 3. 放置模型文件

按第二节的表格把 5 个权重归位，最终结构如下：

```text
ComfyUI/
├── models/
│   ├── diffusion_models/
│   │   └── idol_fp16.safetensors
│   ├── clip_vision/
│   │   └── dino_v3_vit_h_bf16.safetensors
│   ├── vae/
│   │   ├── flux2-vae.safetensors
│   │   └── idol_decoder_fp16.safetensors
│   └── birefnet/
│       └── BiRefNet-general-epoch_244.safetensors
```

## 四、载入工作流与参数设置

### 1. 载入工作流

- 工作流 JSON：[3d_idol_image_to_gaussian_splat.json](https://github.com/Comfy-Org/workflow_templates/blob/main/templates/3d_idol_image_to_gaussian_splat.json)
- 使用方法：把下载好的 `.json` 直接拖进 ComfyUI 空白界面，整套节点会自动展开，无需手动连线。

### 2. 核心参数

| 节点 | 参数 | 推荐值 | 作用 |
| --- | --- | --- | --- |
| Load Image | image | 单张图片 | 立绘、渲染图、实拍照均可 |
| Idol Preprocess Image | mode | `synthetic` / `real` | AI 图、插画、CG 选 `synthetic`；手机实拍选 `real` |
| Idol Preprocess Image | padding | `0.1` | 四周留白，避免边缘高斯点被切平 |
| KSampler | steps | `50` | 30 步快速预览，50 步收敛更稳 |
| KSampler | cfg | `4.0` | 建议 3.5~4.5，过高容易在背面产生噪点尖刺 |
| KSampler | sampler_name | `euler` | 也可用 DPM++ 2M |
| KSampler | scheduler | `simple` | 也可用 SGM Uniform |
| Idol Decoder | target_points | `262,144` | 6GB 起选 26 万点；16GB 可拉到 1,048,576 |
| Idol Prune Splat | prune_threshold | 默认开启 | 自动剔除漂浮杂质与噪点 |
| Save 3DGS | format | `.ply` / `.spz` | 输出到 `ComfyUI/output` |

## 五、实测效果

**低多边形浮空城堡场景**

![Idol 3D 单图转 3D 实测：左侧为输入的低多边形浮空城堡，右侧为生成结果绕 360° 旋转展示](https://huggingface.co/speridlabs/idol/resolve/main/assets/gallery/castle.webp)

*左侧为输入的单张图片，右侧为 Idol 生成的 3D 结果，动图展示 360° 旋转效果。*

- **测试图**：低多边形风格的浮空城堡，包含多座石制塔楼、红色旗帜、城门、树木、草地和底部岩层。
- **效果**：左侧是输入图，右侧是生成结果。随着视角绕到侧后方和背面，塔楼的层级、旗帜朝向、树木位置和浮空岛底部岩层依然对得上，没有出现背面塌陷或糊成一团。

## 六、下游拓展

1. **网页 360° 展示（电商 / 线上展厅）**
   导出选 `.spz`，体积比 `.ply` 小约 80%，通常只有 2~4MB。拖进 [SuperSplat](https://playcanvas.com/supersplat/editor)，手机和浏览器都能直接打开。
2. **Blender / UE5**
   在工作流末端接 `Mesh Extractor`（TSDF 网格提取），生成带 UV 的 `.glb` / `.obj`，再拖进 Blender 绑骨骼、刷权重做动画。

## 资源下载

- **夸克网盘打包**：[https://pan.quark.cn/s/2db6803b0a0e](https://pan.quark.cn/s/2db6803b0a0e)
- **官方地址**
  - ComfyUI：[https://www.comfy.org/download](https://www.comfy.org/download)
  - Idol 3D 模型：[https://huggingface.co/Comfy-Org/Idol](https://huggingface.co/Comfy-Org/Idol)
  - 工作流模板：[https://github.com/Comfy-Org/workflow_templates](https://github.com/Comfy-Org/workflow_templates)

## 小结

Idol 3D 把单图转 3D 的门槛压到了 6GB 显存：装好 ComfyUI、归位 5 个权重、拖入工作流，三步就能出模。6GB 先用 26 万高斯点预览，确认效果后再把 `target_points` 拉满。

有问题欢迎在评论区留言。如果这期教程帮到了你，记得点赞、收藏、转发。
