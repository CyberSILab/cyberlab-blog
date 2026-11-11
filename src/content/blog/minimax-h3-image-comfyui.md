---
title: '16GB 显卡就能跑！MiniMax H3 Image 本地部署教程｜33B 单模型、6 步直出 1600 万像素、文生图改图一体'
pubDate: 2026-11-11
tags: ['AI 绘画', 'ComfyUI', '本地部署', 'MiniMax H3 image', '16MP']
cover:
  lines: ['MiniMax H3', '16MP · 6 步出图']
  image: 'https://raw.githubusercontent.com/huihanglai/pic/pic/MiniMax H3本地部署教程.png'
  sub: '16GB 显存 · 单卡本地运行'
  cls: c4

---

大家好，这里是赛博实验室。今天分享 MiniMax 开源的图像模型 **MiniMax-H3-Image**。它是 H3 家族里专门做图的那一支：33.1B 的 DiT，一次直出约 **1600 万像素**（4096×4096，最高 6272×2688），蒸馏到 **6 步采样**，CFG 固定为 1，连负面提示词都不需要。

更省事的是，**文生图和改图共用同一个权重**，不用再装第二个模型、也不用挂 LoRA。显存这边给了档位：主模型有 W4A8 的 12.5GB 版本，**16GB 显卡就能跑**；24GB 用 INT8，32GB 以上才拉得满 16MP。这期我们用 **ComfyUI 官方原生节点**跑通，从 0.45.0 起已经内置支持，不用装任何自定义节点，四个文件归位、拖入模板就能出图。

## 模型简介

- **来源**：MiniMax 开源，Comfy 官方重打包成 ComfyUI 单文件权重
- **参数量**：33.1B 稠密 DiT，50 层、隐藏维度 5376、56 个注意力头、FFN 14336，3D 多模态 RoPE
- **任务**：文生图 + 指令改图，一个 checkpoint 全包
- **文本编码器**：Qwen3-VL-32B（沿用 H3 原版，取第 50 层隐状态）
- **VAE**：16 倍空间下采样、24 个 latent 通道；DiT 再按 2×2 切 patch，等于**一个 token 管 32×32 像素**
- **输出**：约 16MP 原生直出，4MP～20MP 都在有效区间，不需要二次放大
- **采样**：6 步、guidance 固定 1，没有 CFG 双跑，也没有负面提示词
- **显存**：16GB 可用（W4A8 主模型 12.5GB），24GB 推荐 INT8，32GB 以上跑满 16MP
- **参考图**：最多 **16 张**，在提示词里按 `<Picture 1>`、`<Picture 2>` 顺序引用
- **协议**：MiniMax-H3-Image Community License，年收入超过 100 万美元或对外提供托管服务，需要单独向 MiniMax 申请书面授权

## 测试环境

| 项目     | 配置                                                   |
| -------- | ------------------------------------------------------ |
| 操作系统 | Windows 11 64-bit 家庭版                               |
| 显卡     | NVIDIA RTX 4090D（24GB）；16GB 卡按第八节的 W4A8 方案  |
| 处理器   | 13th Gen Intel Core i7-13700H                          |
| 内存     | 32GB DDR5 5600MHz（建议 64GB，32B 文本编码器会走内存） |
| 存储     | NVMe SSD，预留 60GB 以上                               |

## 完整资源

- **夸克网盘打包**：[https://pan.quark.cn/s/08f405e947ec](https://pan.quark.cn/s/08f405e947ec)（提取码：`c7k5`）
- **官方地址**
  - ComfyUI 桌面版：[https://www.comfy.org/download](https://www.comfy.org/download)
  - 图像模型：[https://huggingface.co/Comfy-Org/MiniMax-H3-Image](https://huggingface.co/Comfy-Org/MiniMax-H3-Image)
  - 文本编码器：[https://huggingface.co/Comfy-Org/MiniMax-H3](https://huggingface.co/Comfy-Org/MiniMax-H3)
  - 提示词扩写：[https://huggingface.co/Comfy-Org/Qwen3.5](https://huggingface.co/Comfy-Org/Qwen3.5)
  - 原始模型卡：[https://huggingface.co/MiniMaxAI/MiniMax-H3-Image](https://huggingface.co/MiniMaxAI/MiniMax-H3-Image)
  - ComfyUI 官方教程：[https://docs.comfy.org/tutorials/image/minimax/minimax-h3-image](https://docs.comfy.org/tutorials/image/minimax/minimax-h3-image)
  - 工作流模板：[https://github.com/Comfy-Org/workflow_templates](https://github.com/Comfy-Org/workflow_templates)

## 一、安装 ComfyUI 桌面版（0.45.0 起）

这期不需要装插件，但对版本有硬要求：

- ComfyUI **0.45.0 及以上**（2026-11-10 发布）才原生支持这套模型
- 工作流模板包 **0.11.104 及以上**

桌面版是安装包，装完就是带窗口的应用，不用开命令行再切浏览器。安装包只按系统架构分，不按显卡分：

| 你的电脑                                                     | 安装包                                  | 大小  |
| ------------------------------------------------------------ | --------------------------------------- | ----- |
| Windows x64（绝大多数 Intel / AMD 处理器，N 卡 A 卡都装这个） | `Comfy Desktop Setup 1.1.9 - x64.exe`   | 173MB |
| Windows on ARM（骁龙 X 等 ARM 笔记本）                       | `Comfy Desktop Setup 1.1.9 - arm64.exe` | 168MB |

- 下载页（自动识别系统）：[https://www.comfy.org/download](https://www.comfy.org/download)
- x64 直链：[https://comfy.org/download/windows/nsis/x64](https://comfy.org/download/windows/nsis/x64)

## 二、下载模型

主仓库：

- Hugging Face：[Comfy-Org/MiniMax-H3-Image](https://huggingface.co/Comfy-Org/MiniMax-H3-Image/tree/main)
- 国内镜像：[hf-mirror.com/Comfy-Org/MiniMax-H3-Image](https://hf-mirror.com/Comfy-Org/MiniMax-H3-Image/tree/main)

推荐先用这套 **W4A8 组合**（16GB 卡也能跑，24GB 卡更宽裕）：

| 文件                                              | 大小    | 放置目录                           |
| ------------------------------------------------- | ------- | ---------------------------------- |
| `minimax_h3_image_pruned_w4a8.safetensors`        | 12.5GB  | `ComfyUI/models/diffusion_models/` |
| `qwen3vl_32b_minimax_h3_int8_convrot.safetensors` | 25.28GB | `ComfyUI/models/text_encoders/`    |
| `qwen3.5_9b_w4a8_gptq.safetensors`                | 7.34GB  | `ComfyUI/models/text_encoders/`    |
| `minimax_h3_image_vae_fp16.safetensors`           | 1.17GB  | `ComfyUI/models/vae/`              |

各文件作用：

- **`minimax_h3_image_pruned_w4a8`**：剪枝 + 4bit 的主模型，去掉 H3 的音频分支，12.5GB，16GB 卡的主力选择；24GB 卡可以再换回 int8。
- **`qwen3vl_32b_minimax_h3_int8_convrot`**：真正干活的主文本编码器，25.28GB，**必须下**。
- **`qwen3.5_9b_w4a8_gptq`**：只负责**提示词扩写**，把短句改写成模型爱看的长英文描述，7.34GB，可选但强烈建议。
- **`minimax_h3_image_vae_fp16`**：图像 VAE，1.17GB，编码参考图、解码出图都要用。

### 换档位怎么选

| 需求                   | 换成                                            | 大小   |
| ---------------------- | ----------------------------------------------- | ------ |
| 画质优先、显存宽裕     | `minimax_h3_image_pruned_bf16`                  | 40.2GB |
| 24GB 卡，默认          | `minimax_h3_image_pruned_int8_convrot`          | 21GB   |
| 12～16GB 卡            | `minimax_h3_image_pruned_w4a8`                  | 12.5GB |
| RTX 50 系（Blackwell） | `qwen3vl_32b_minimax_h3_nvfp4_awq` 当文本编码器 | 15.7GB |

## 三、模型归位

桌面版别把模型塞进安装目录，模型库是独立的，多个实例共用一份：

- 打开 Desktop → **☰ → Desktop Settings → Storage**，这里能看到当前模型库路径
- 默认在 `%LOCALAPPDATA%\Comfy-Desktop\ComfyUI-Shared\models`
- 也支持 **Add path** 挂外部目录，本期一键包就是把自己的 `models` 文件夹挂进去，不用再复制 34GB

最终结构：

```text
ComfyUI/
├── models/
│   ├── diffusion_models/
│   │   └── minimax_h3_image_pruned_w4a8.safetensors
│   ├── text_encoders/
│   │   ├── qwen3vl_32b_minimax_h3_int8_convrot.safetensors
│   │   └── qwen3.5_9b_w4a8_gptq.safetensors
│   └── vae/
│       └── minimax_h3_image_vae_fp16.safetensors
```

`text_encoders` 目录如果不存在，自己新建一个。放完刷新一下页面，`UNETLoader` 和 `CLIPLoader` 的下拉框里应该能直接看到它们。

## 四、文生图工作流

### 1. 载入模板

模板库 → 图像 → **MiniMax-H3-Image: Text to Image**，或者把 JSON 直接拖进空白界面：

- 工作流 JSON：[image_minimax_h3_image_t2i.json](https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_minimax_h3_image_t2i.json)

整条链路很短：`UNETLoader` 加载主模型 → `KSampler` 出 latent；`CLIPLoader`（type 选 `minimax`）接 `MiniMaxH3ImageConditioning` 当正向；负向用 `ConditioningZeroOut`；最后 `VAEDecode` + `SaveImage`。画布由 `ResolutionSelector` 控制。

### 2. 核心参数

| 节点               | 参数         | 推荐值    | 说明                                                        |
| ------------------ | ------------ | --------- | ----------------------------------------------------------- |
| UNETLoader         | weight_dtype | `default` | 加载 int8 权重，不要手动改 fp8                              |
| CLIPLoader         | type         | `minimax` | 选错类型会直接报错                                          |
| CLIPLoader         | device       | `default` | 16GB 卡改成 `cpu`，把 25GB 编码器留在内存，显存全让给主模型 |
| ResolutionSelector | aspect_ratio | 按需      | 1:1 / 4:3 / 16:9 / 9:16 / 21:9                              |
| ResolutionSelector | megapixels   | `4` 起步  | 模板默认 4MP，稳定后再往上加                                |
| ResolutionSelector | multiple     | `32`      | 宽高必须是 32 的倍数，别动                                  |
| KSampler           | steps        | `6`       | 蒸馏模型，6 步就是它的工作点，加步数只变慢                  |
| KSampler           | cfg          | `1.0`     | 固定值，调高只会把画面推崩                                  |
| KSampler           | sampler_name | `euler`   | 官方模板值，也可试 `er_sde`                                 |
| KSampler           | scheduler    | `simple`  | 也可试 `sgm_uniform`                                        |
| KSampler           | denoise      | `1.0`     | 文生图保持满降噪                                            |

### 3. 画布尺寸

16MP 是这模型的舒适区，常见画幅：

| 比例        | 尺寸（宽 × 高）           |
| ----------- | ------------------------- |
| 1:1         | 4096 × 4096               |
| 4:3 / 3:4   | 4736 × 3552 / 3552 × 4736 |
| 3:2 / 2:3   | 5024 × 3360 / 3360 × 5024 |
| 16:9 / 9:16 | 5472 × 3072 / 3072 × 5472 |
| 21:9        | 6272 × 2688               |

模板默认给 4MP 是有意为之：低显存先能跑起来。**但这模型在低分辨率下确实会发灰、细节糊**，显存够就往上顶，2MP 以下基本没法看。

### 4. 把提示词扩写打开

模板下方有一个 **Prompt Enhancer** 分组，里面是 `TextGenerateV2` 节点 + `qwen3.5_9b_w4a8_gptq`，作用是把一句短提示改写成模型爱读的整段英文描述，顺手把画幅也选了。**文生图模板默认是关的**（分组里那个开关默认 `false`），建议打开——这一步对成片质感的提升比加步数明显得多。

官方给的扩写器其实是 Qwen3.8-27B FP4（17.9GB），模板换成 9B 版本，是为了让它和 21GB 主模型挤在同一张卡上。

## 五、改图工作流

模板库 → 图像 → **MiniMax-H3-Image: Image Edit**：

- 工作流 JSON：[image_minimax_h3_image_edit.json](https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_minimax_h3_image_edit.json)

和文生图是同一套权重，区别只在多了一个 `Load Image` 和参考图输入：

- `<Picture 1>` 是**要被改的那张图**，后面的 `<Picture 2>`～`<Picture 16>` 是参考。
- 指令可以很短，比如「把 `<Picture 1>` 里的车换成 `<Picture 2>` 里的那辆，角度和光照跟着原图走」。
- 想加参考图：再拖一个 `Load Image`，同时接到 `Generate Text` 和 `MiniMax H3 Image Conditioning` 两个节点上。
- 模板会先把输入图放大到 4MP 再送进模型，比例不对会自动补到 32 的倍数，参考图不用自己裁。
- 改图爆显存，就启用模板里的 `Resize Image/Mask` 节点，把 megapixels 往下调。

## 六、实测效果

官方放出来的样张，基本能代表它的能力边界：

**照片级写实**

![MiniMax-H3-Image 写实样张：屋顶晾床单的黄昏、拿杯子的卷发男子侧脸、浅水里的火烈鸟](https://huggingface.co/MiniMaxAI/MiniMax-H3-Image/resolve/main/assets/showcase/photo.jpg)

*1600 万像素直出，皮肤、布料纤维、水面的细节量是这一类开源模型里少见的。*

**文字与逻辑**

![MiniMax-H3-Image 文字渲染样张：中英文逻辑推理题板，条件、印章和验算表都正确](https://huggingface.co/MiniMaxAI/MiniMax-H3-Image/resolve/main/assets/showcase/text.jpg)

*中英文混排的逻辑题，条件、真假印章、验算表格都能画对，不是把字糊成花纹。*

**多图参考改图**

![MiniMax-H3-Image 改图样张：一张空房间加九件家具，合成成一间完整的客厅](https://huggingface.co/MiniMaxAI/MiniMax-H3-Image/resolve/main/assets/showcase/edit_multi.jpg)

*十张参考图（空房间 + 九件家具）一次合成，家具的材质、透视、落地阴影都对得上。*

### 官方示例提示词

官方没给 showcase 那几张图的提示词，只放了图注；完整公开的只有 examples 里两组「短指令 → 扩写后提示词」的对照。直接贴在这里，方便对着改：

**文生图：农场餐桌**

短指令：

```text
A rustic, overhead shot of a farm-to-table feast, showcasing a variety of colorful, seasonal vegetables, artisanal cheeses, and freshly baked bread on a weathered wooden table.
```

扩写后（H3-Image-Context-IR 的输出，模型实际读的是这一段）：

> The image is an overhead, top-down photograph of a rustic farm-to-table feast spread across a weathered, dark brown wooden table with visible grain, knots, and a worn finish. In the center, a large woven basket holds a freshly baked rustic loaf of bread with a cracked golden-brown crust and scattered flour, alongside a halved loaf. To the left, a large dark ceramic plate presents an assortment of colorful seasonal vegetables, including bright orange carrots, deep red heirloom tomatoes, purple cabbage, and a mound of vibrant green leafy kale and arugula. On the right side, a wooden board displays artisanal cheeses: a wedge of sharp aged cheddar, a round of creamy brie with a rind, a soft blue cheese, and a few scattered almonds and walnuts. Below the bread in the lower center, a shallow bowl contains roasted root vegetables, including golden potatoes and beets, sprinkled with fresh rosemary sprigs. At the upper right, a glass jar of golden olive oil stands beside a smaller jar of honey with a wooden dipper. In the lower left, a rustic cloth napkin holds a silver knife and fork. At the upper left, a bunch of purple and red grapes rests near a small bowl of black olives. Scattered herbs, including fresh thyme and sprigs of oregano, decorate the table. The lighting is natural and warm, coming from the upper left and casting soft, long shadows to the lower right, enhancing the texture of the bread, the moisture of the vegetables, and the overall cozy, bountiful atmosphere of the meal.

**改图：播客主持人摘耳机击拳**

短指令：

```text
Take the over-ear headphones off the man on the left and fill in his hair where the band flattened it. Have both hosts lean toward each other and fist-bump directly above the "MONEY TALKS" desk sign, knuckles touching, elbows lifted off the desk, so the bump sits dead centre between the two microphones.
```

改图模板会把这段指令扩写成以 `<Subject 1>`～`<Subject N>` 编号的长描述，逐条说明哪些要保留、哪些要改，这也是为什么参考图必须按 `<Picture 1>`、`<Picture 2>` 的顺序给。

- 官方 examples 原文件：[MiniMaxAI/MiniMax-H3-Image/examples](https://huggingface.co/MiniMaxAI/MiniMax-H3-Image/tree/main/examples)
- 文生图模板里还预置了一条完整的「毛绒狐狸海报」提示词，打开 Prompt Enhancer 分组就能看到全文，也是一份很好的长描述范例。

## 七、显存怎么配

| 显存      | 推荐组合                                                | 画布                   | 说明                                       |
| --------- | ------------------------------------------------------- | ---------------------- | ------------------------------------------ |
| 12GB      | w4a8 主模型 + int8 编码器（`device` 设 `cpu`）          | 2MP                    | 能跑，但建议先关掉扩写                     |
| 16GB      | w4a8 主模型（12.5GB）+ int8 编码器（`device` 设 `cpu`） | 2～4MP                 | 编码器放内存，显存留给主模型，出图会慢一些 |
| 24GB      | int8 主模型 + int8 编码器 + 9B 扩写                     | 4MP 起步，稳定后往上加 | 编码器会卸载到内存，系统内存 32GB 起       |
| 32GB 以上 | int8 / bf16 主模型 + int8 编码器                        | 16MP                   | 最接近官方画质                             |
| RTX 50 系 | nvfp4 文本编码器（15.7GB）                              | 同上                   | 省下约 10GB 显存                           |

一句话：**显存决定你能开多大画布，内存决定它能不能顺利加载。** 16GB 卡走 W4A8 + 编码器上 CPU，2～4MP 先跑通；24GB 卡从 4MP 起步一档一档往上加，别一上来就 16MP。

## 小结

MiniMax-H3-Image 这期的流程比上次的 Idol 还短：**装 0.45.0 的桌面版、归位四个文件、拖入模板**，没有插件、没有额外 LoRA、没有二次放大。6 步直出 16MP，文生图和改图共用一个权重，这是它最舒服的用法。

先用 4MP 把流程跑通，确认扩写和采样器都对了，再把 `megapixels` 往上推。显存只有 16GB 也不用心急：主模型用 W4A8、文本编码器 `device` 设 `cpu`，2～4MP 一样能出图；24GB 卡从 4MP 起步，一档一档推到 16MP。等你看到 4096×4096 那张图的发丝和布料纹理，就知道这些显存花在哪了。

有问题欢迎在评论区留言。如果这期教程帮到了你，记得点赞、收藏、转发。