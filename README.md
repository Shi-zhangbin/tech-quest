# TECH-QUEST · 游戏化技术训练场

用游戏机台的方式深入技术细节：技能树解锁、六段式技术卡片、机制动画、真实计算的沙盒关卡、精选视频资源（YouTube / B站实测验证 + 抖音/小红书搜索直达）。

## 模块

| 模块 | 入口 | 内容 |
|---|---|---|
| LLM 推理 | `llm-quest/inference/llm-quest-inference.html` | 26 节点：Tokenization → KV Cache → PagedAttention → 投机解码；沙盒：70B 上线 / 高并发服务 / 长上下文 RAG |
| LLM 训练 | `llm-quest/training/llm-quest-training.html` | 27 节点：反向传播 → 混合精度 → ZeRO/3D 并行 → RLHF/DPO；沙盒：显存预算 / 并行规划 / Loss 诊断 |
| Kubernetes | `k8s-quest/k8s-quest.html` | 22 节点：容器基础 → 控制平面 → 调度/QoS → 故障排查；沙盒：服务上线 / 容量调度 / 排障推演 |
| AI 工程全栈 | `ai-eng-quest/ai-eng-quest.html` | 基于 [rohitg00/ai-engineering-from-scratch](https://github.com/rohitg00/ai-engineering-from-scratch)（20 phases · 523 课）的课程地图：数学基础 → Transformer → Agent 集群；沙盒：Autodiff / 微型训练 / 注意力温度 |

## 使用

无需构建、无需后端。直接打开 `index.html` 进入总机，选择模块进入对应控制台。

- 技能树按依赖解锁：读懂卡片、答对测验（CAL OK）点亮节点
- 沙盒关卡全部真实计算（KV 显存、TPOT、pipeline bubble、Pod bin-packing…），算式追踪逐行可见
- 进度缓存在浏览器 localStorage，机头 RST 按钮可清零重来

## 技术

纯 HTML/CSS/JS 单文件 + 每模块一个知识库 JS，file:// 双击即用。仪器控制台设计语言，Canvas 机制动画。
