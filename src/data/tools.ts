export interface Tool {
	id: string;
	name: string;
	tagline: string;
	sub: string;
	cls: 'c1' | 'c2' | 'c3' | 'c4' | 'c5' | 'c6' | 'c7' | 'c8';
	desc: string;
	tags: string[];
	url: string;
}

export const TOOLS: Tool[] = [
	{"id":"ollama","name":"Ollama","tagline":"本地模型一键跑","sub":"CLI · 跨平台","cls":"c1","desc":"最流行的本地大模型运行工具，一条命令拉取并运行模型，支持图片输入与工具调用，社区模型库最全。","tags":["本地部署","工具"],"url":"https://ollama.com"},
	{"id":"llama-cpp","name":"llama.cpp","tagline":"C++ 推理引擎","sub":"GGUF · CPU/GPU","cls":"c5","desc":"把大模型跑在消费级显卡甚至 CPU 上的开源推理引擎，量化与组卡参数最全，速度调校空间最大。","tags":["本地部署","开源"],"url":"https://github.com/ggml-org/llama.cpp"},
	{"id":"lm-studio","name":"LM Studio","tagline":"图形化本地大模型","sub":"GUI · 模型商店","cls":"c2","desc":"带图形界面的本地模型应用：内置模型商店、聊天界面和本地 API 服务，新手入门最友好。","tags":["本地部署","工具"],"url":"https://lmstudio.ai"},
	{"id":"comfyui","name":"ComfyUI","tagline":"节点式出图工作流","sub":"文生图 · 图片编辑","cls":"c8","desc":"节点式图像生成工作流工具，FLUX、MOSS-Image 等图片模型的标准运行环境，工作流可导入导出复用。","tags":["文生图","工作流"],"url":"https://comfy.org"},
	{"id":"cloudflare-workers-ai","name":"Cloudflare Workers AI","tagline":"云端 GPU 跑模型","sub":"Serverless · 全球节点","cls":"c3","desc":"在 Cloudflare 全球边缘节点上跑开源模型的无服务器方案，按调用计费，适合把本地模型的能力搬到线上。","tags":["Cloudflare","云端"],"url":"https://developers.cloudflare.com/workers-ai/"},
	{"id":"openai-api","name":"OpenAI API","tagline":"GPT 系列 API","sub":"API · 工具调用","cls":"c6","desc":"GPT 系列的官方 API，工具调用、结构化输出、多模态能力齐全，博客里多个教程会拿它做对照测试。","tags":["OpenAI","API"],"url":"https://platform.openai.com"},
	{"id":"deepseek-api","name":"DeepSeek API","tagline":"高性价比 API","sub":"API · 中文强项","cls":"c7","desc":"DeepSeek 官方 API，价格低、中文质量高，常用来和本地部署的 DeepSeek 系列模型做效果与成本对比。","tags":["DeepSeek","API"],"url":"https://api.deepseek.com"},
	{"id":"gemini-api","name":"Google Gemini API","tagline":"多模态 API","sub":"API · 超长上下文","cls":"c4","desc":"Google 的多模态 API，支持长文档与视频输入，免费额度够用，适合做长文分析和视频理解类应用。","tags":["Google","API"],"url":"https://ai.google.dev"},
	{"id":"hugging-face","name":"Hugging Face","tagline":"模型托管与下载","sub":"模型库 · 数据集","cls":"c1","desc":"全球最大的开源模型托管平台，博客里所有本地部署模型的原始权重和量化版本大多从这里下载。","tags":["模型","开源"],"url":"https://huggingface.co"}
];
