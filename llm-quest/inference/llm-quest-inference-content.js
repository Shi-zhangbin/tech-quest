// LLM Quest 知识库 · 26 节点（8 前置基础 + 18 推理）· 2026-10-04
window.LLM_QUEST_CONTENT = {
  nodes: [
    {
      id: "tokenizer-embedding",
      name: "Tokenization 与 Embedding",
      en: "TOKEN EMBED",
      branch: "prereq",
      deps: [],
      grid: { col: 1, row: 0 },
      summary: "文本 → token id → 查表向量，LLM 的输入入口",
      sections: {
        principle: "Tokenizer 用 BPE（字节对编码）把文本切成 subword token 序列，每个 token 映射为一个整数 id；embedding 层本质是一张 vocab_size × d_model 的查表矩阵，按 id 取出对应向量。\ntoken 既不等于字也不等于词：英文约 0.75 个词/token，中文常见 1 个汉字对应 1-2 个 token。\n查表结果只含语义、不含位置信息——「我爱北京」和「北京爱我」的 embedding 集合相同，顺序要交给位置编码。",
        formula: [
          "token id → Embedding[id] ∈ R^d_model（纯查表）",
          "embedding 参数 = vocab_size × d_model",
          "Llama-2 vocab = 32000；Llama-3 vocab = 128256"
        ],
        example: [
          "Llama-2-7B：32000 × 4096 = 1.31 亿参数（仅 embedding 矩阵）",
          "英文约 0.75 词/token：100 词 ≈ 133 tokens",
          "中文 1 字 1-2 token：100 个汉字 ≈ 100-200 tokens",
          "词表从 32000 扩到 128256（Llama-3），同维下 embedding 参数 ×4"
        ],
        tradeoffs: [
          "词表越大切得越粗、序列越短，但 embedding 矩阵与输出 softmax 成本同步变大",
          "BPE 用 subword 折中：不像按字切那样序列过长，也不像按词切那样词表爆炸",
          "中文在英文主导的词表上编码效率低，同样语义要消耗更多 token"
        ],
        pitfalls: [
          "把 token 当字或词——计费与上下文长度都按 token 算，不按字算",
          "以为 embedding 向量自带位置——查表与顺序无关，位置全靠位置编码注入"
        ]
      },
      diagram: {
        type: "flow",
        title: "从文本到向量",
        items: [
          ["原始文本", "BPE 切成 subword token"],
          ["token ids", "整数序列，长度决定上下文占用"],
          ["查表", "32000 × 4096 矩阵按 id 取向量"],
          ["输出", "seq_len × 4096 向量矩阵（无位置信息）"]
        ]
      },
      quiz: {
        q: "Llama-2-7B 的 embedding 层有多少参数？",
        options: [
          "32000 个",
          "32000 × 4096 ≈ 1.31 亿",
          "4096 × 4096 ≈ 1678 万",
          "7B 的一半"
        ],
        answer: 1,
        explain: "embedding 是 vocab_size × d_model 的查表矩阵：32000×4096≈1.31 亿。注意查表不含位置信息，这是后面位置编码要补的课。"
      },
      resources: {
        youtube: [
          { title: "Let's build the GPT Tokenizer", channel: "Andrej Karpathy", url: "https://www.youtube.com/watch?v=zduSFxRajkE", why: "Karpathy 从零手撸 BPE 分词器，讲透词表构建与 token id 的来龙去脉，tokenizer 主题最权威的一课" },
          { title: "LLM Tokenizers Explained: BPE Encoding, WordPiece and SentencePiece", channel: "DataMListic", url: "https://www.youtube.com/watch?v=hL4ZnAWSyuU", why: "对比 BPE / WordPiece / SentencePiece 三大主流分词算法，适合建立全景认知" }
        ],
        bilibili: [
          { title: "【分词：BPE算法】白板手推吃透LLM基石原理！", up: "AI扫地曾", url: "https://www.bilibili.com/video/BV1v9dSYLE6U", why: "白板手推 BPE 合并过程，12 分钟讲清分词底层原理" },
          { title: "揭秘分词底层技术\"BPE\"-大部分大模型都在用的分词算法！", up: "算法魔法师", url: "https://www.bilibili.com/video/BV1N9zyBYE6F", why: "通俗讲解 BPE 为什么成为主流大模型的分词方案，节奏轻快适合入门" }
        ],
        keywords: ["BPE分词原理", "tokenizer 词表 嵌入", "大模型分词器"]
      }
    },
    {
      id: "position-rope",
      name: "位置编码 RoPE",
      en: "ROPE",
      branch: "prereq",
      deps: ["tokenizer-embedding"],
      grid: { col: 2, row: 0 },
      summary: "给向量注入顺序：从正弦编码到 RoPE 旋转",
      sections: {
        principle: "原始 Transformer（Vaswani 2017）用正弦绝对位置编码，把位置向量直接加到 embedding 上。\nRoPE（苏剑林 2021，RoFormer）改为对 Q/K 按位置做旋转变换：位置 m 的 Q 与位置 n 的 K 点积只依赖相对距离 m-n，天然携带相对位置信息。\nbase θ 控制旋转频率：Llama-2 用 10000，Llama-3 提到 500000 以支撑更长上下文。",
        formula: [
          "RoPE：q_m = R_m q，k_n = R_n k（R 为旋转矩阵）",
          "q_m^T k_n 只含 (m-n) 的函数 → 相对位置",
          "base θ：Llama-2 = 10000，Llama-3 = 500000"
        ],
        example: [
          "Llama-2 训练窗口 4096，直接外推到 8K 会崩",
          "原因：超出训练见过的旋转角度，注意力分数分布失真",
          "补救：NTK-aware / YaRN 插值扩窗，不改架构只调频率",
          "Llama-3 把 θ 提到 500000，原生覆盖更长训练窗口"
        ],
        tradeoffs: [
          "RoPE 只改 Q/K 的旋转，不加结构、几乎零额外参数",
          "相对位置天然适合变长输入，但外推能力仍受训练窗口约束",
          "插值扩窗（NTK/YaRN）能救回长文本，代价是高频位置的分辨率被拉伸"
        ],
        pitfalls: [
          "以为 RoPE 学了位置——它是固定旋转规则，没有可学习参数",
          "训练 4096 直接推理 8K——未见过的旋转角度会让注意力崩掉，必须插值"
        ]
      },
      diagram: {
        anim: "ropeSpin",
        type: "compare",
        title: "两种位置编码",
        items: [
          ["正弦绝对编码（2017）", "位置向量加在 embedding 上"],
          ["RoPE（2021）", "按位置旋转 Q/K，点积自带相对位置"],
          ["base θ", "Llama-2: 10000 → Llama-3: 500000"],
          ["外推", "训练窗外直接崩，需 NTK/YaRN 插值"]
        ]
      },
      quiz: {
        q: "RoPE 为什么天然携带相对位置信息？",
        options: [
          "它给每个位置学了独立参数",
          "位置 m 的 Q 与位置 n 的 K 点积化简后只依赖 m-n",
          "它把位置编码加到了 embedding 上",
          "它用了 500000 的 base θ"
        ],
        answer: 1,
        explain: "RoPE 对 Q/K 做位置相关的旋转，q_m^T k_n 化简后只含相对距离 m-n；正弦编码加在 embedding 上则是绝对位置。外推训练未见长度会崩，需 NTK-aware / YaRN 插值。"
      },
      resources: {
        youtube: [
          { title: "Rotary Positional Embeddings: Combining Absolute and Relative", channel: "Efficient NLP", url: "https://www.youtube.com/watch?v=o29P0Kpobz0", why: "RoPE 专题讲解，从绝对位置到相对位置的数学动机，是该主题最常被引用的入门视频" },
          { title: "Rotary Positional Encodings | Explained Visually", channel: "Vizuara", url: "https://www.youtube.com/watch?v=a17DlNxkv2k", why: "可视化拆解 RoPE 旋转几何直觉，动画质量高" }
        ],
        bilibili: [
          { title: "为什么不用1,2,3？深度解密Transformer位置编码，带公式推导！", up: "算法魔法师", url: "https://www.bilibili.com/video/BV1aLCsBhE7i", why: "从正弦位置编码的设计动机讲起，带公式推导，2.2 万播放" },
          { title: "【硬核】手撕RoPE旋转位置编码推导，嘎嘎简单，通俗易懂！", up: "算法魔法师", url: "https://www.bilibili.com/video/BV1FjrCBdESo", why: "RoPE 旋转矩阵完整推导，5.1 万播放，承接上一个视频的正弦编码基础" }
        ],
        keywords: ["RoPE旋转位置编码", "正弦位置编码原理", "大模型长度外推"]
      }
    },
    {
      id: "self-attention",
      name: "自注意力机制",
      en: "SELF ATTENTION",
      branch: "prereq",
      deps: ["position-rope"],
      grid: { col: 3, row: 0 },
      summary: "QK 点积定权重、softmax 归一、加权和 V",
      sections: {
        principle: "每个位置用 Query 与所有位置的 Key 做点积得到相关性分数，softmax 归一化后对 Value 加权求和，完成一次全局信息交换。\n分数要除以 √d_k：维度大时点积方差随之变大，不缩放会把 softmax 压进饱和区、梯度消失。\ndecoder 加 causal mask（下三角），保证位置 t 只能看 1..t；注意力矩阵的计算与显存物化都是 O(N²)（N 为序列长度）——这正是 FlashAttention 要解决的问题。",
        formula: [
          "Attention(Q,K,V) = softmax(QK^T / √d_k) V",
          "causal mask：scores[i][j] = -inf（当 j > i）",
          "复杂度：计算与显存物化均 O(N²)，N = 序列长度"
        ],
        example: [
          "d_k = 128（Llama-2-7B 单头）：√d_k ≈ 11.3",
          "N = 4096 时注意力矩阵 4096 × 4096 ≈ 1678 万元素",
          "FP16 物化一份 ≈ 1678万 × 2 B ≈ 33.6 MB/头/层",
          "naive 实现反向需存 32 头 × 32 层 ≈ 34 GB——O(N²) 的代价"
        ],
        tradeoffs: [
          "softmax 给出可微的归一化权重，但也强制每步全量读 K/V",
          "causal mask 保证生成不看未来，代价是被 mask 部分的计算纯属浪费",
          "O(N²) 使长上下文成本平方级膨胀，线性注意力等替代方案普遍有质量损失"
        ],
        pitfalls: [
          "忘除 √d_k——d_k 大时 softmax 饱和、梯度消失，训练直接不收敛",
          "以为 O(N²) 只是计算问题——naive 实现的显存物化同样 O(N²)，先撑爆的常是显存"
        ]
      },
      diagram: {
        anim: "attnGrid",
        type: "flow",
        title: "注意力三步",
        items: [
          ["1. 打分", "scores = QK^T / √d_k"],
          ["2. 掩码+归一", "causal mask → softmax（下三角）"],
          ["3. 加权和", "权重 × V 求和"],
          ["代价", "O(N²)：N=4096 时 1678 万元素/头/层"],
          ["出路", "O(N²) 正是 FlashAttention 要解决的"]
        ]
      },
      quiz: {
        q: "注意力分数为什么要除以 √d_k？",
        options: [
          "为了让结果落在 [0,1]",
          "防止大维度下点积方差过大把 softmax 压饱和、梯度消失",
          "为了凑出 O(N²) 复杂度",
          "CUDA kernel 的硬性要求"
        ],
        answer: 1,
        explain: "d_k 维向量点积的方差随 d_k 增长，不缩放时 softmax 输入过大进入饱和区，梯度趋近于零。除以 √d_k 把方差归一。顺带记住：这个 N×N 矩阵的 O(N²) 物化正是 FlashAttention 要消灭的。"
      },
      resources: {
        youtube: [
          { title: "Attention in transformers, step-by-step | Deep Learning Chapter 6", channel: "3Blue1Brown", url: "https://www.youtube.com/watch?v=eMlx5fFNoYc", why: "3B1B 注意力机制专题，Q/K/V 与缩放点积的可视化讲解，全网公认最佳入门" }
        ],
        bilibili: [
          { title: "【官方双语】直观解释注意力机制，Transformer的核心 | 【深度学习第6章】", up: "3Blue1Brown", url: "https://www.bilibili.com/video/BV1TZ421j7Ke", why: "3B1B 官方中文账号双语版，92 万播放，与 YouTube 原版同源" },
          { title: "通俗易懂理解自注意力机制（Self-Attention）", up: "AI老兵文哲", url: "https://www.bilibili.com/video/BV1sw4m1k7Gt", why: "6 分钟中文短视频讲清 QKV 直觉，6.4 万播放，适合快速建立概念" }
        ],
        keywords: ["自注意力机制", "QKV注意力 动画讲解", "Transformer注意力原理"]
      }
    },
    {
      id: "multi-head",
      name: "多头注意力 MHA",
      en: "MULTI HEAD",
      branch: "prereq",
      deps: ["self-attention"],
      grid: { col: 4, row: 0 },
      summary: "h 个头并行看不同子空间，拼接后过 W_o",
      sections: {
        principle: "多头注意力把 d_model 切成 h 份，每个头在自己的低维子空间里独立做注意力，捕捉不同类型的依赖（相邻搭配、长距离指代等）。\n各头输出拼接后过输出投影 W_o 回到 d_model 维：d_model = h × head_dim，Llama-2-7B 即 32 头 × 128 维 = 4096。\n每层 Q/K/V/O 四个投影矩阵合计 4d² 参数；MHA 里每个 query head 独占 K/V 头——这个 KV 头数正是后面 GQA/MQA 要砍的对象。",
        formula: [
          "d_model = h × head_dim",
          "每层 attention 参数 = 4 × d_model²（W_Q/W_K/W_V/W_O）",
          "MHA：n_kv_heads = n_heads（KV cache 正比于它）"
        ],
        example: [
          "Llama-2-7B：32 头 × 128 维 = 4096",
          "每层 attention 参数 = 4 × 4096² ≈ 6710 万",
          "每个头独立学习：有的盯相邻 token，有的盯长距离依赖",
          "GQA 把 32 个 KV 头砍到 8，KV cache ÷4——基准形态就是 MHA"
        ],
        tradeoffs: [
          "多头并行几乎不增计算量（总维度不变），表达力却显著提升",
          "头太多则每头维度太小学不到东西，头太少则子空间单一",
          "MHA 的 K/V 头与 Q 头一样多，KV cache 大——为 GQA/MQA 留了优化空间"
        ],
        pitfalls: [
          "以为多头是堆算力——切分后每头算的是 128 维小矩阵，总 FLOPs 基本不变",
          "把 head_dim 当独立超参——d_model = h × head_dim，三者必须整除对齐"
        ]
      },
      diagram: {
        type: "tree",
        title: "Llama-2-7B 单层注意力",
        items: [
          ["输入 4096 维", "× W_Q / W_K / W_V"],
          ["切成 32 头", "每头 128 维并行注意力"],
          ["拼接", "32 × 128 = 4096 维"],
          ["过 W_o", "回 4096 维 → 残差流"],
          ["参数", "4 × 4096² ≈ 6710 万/层"]
        ]
      },
      quiz: {
        q: "Llama-2-7B 每层注意力约 6710 万参数，这个数怎么来的？",
        options: [
          "32 头 × 128 维",
          "Q/K/V/O 四个投影矩阵：4 × 4096² ≈ 6710 万",
          "4096 × 11008",
          "vocab_size × d_model"
        ],
        answer: 1,
        explain: "四个投影矩阵各 d_model²：4×4096²≈6710 万。32 头 × 128 维只是切分方式，不改参数量。记住 MHA 里 KV 头数也是 32——这正是 GQA 要砍的。"
      },
      resources: {
        youtube: [
          { title: "Multi-Head Attention Explained Visually | Why One Head Isn't Enough", channel: "Softmaxedd", url: "https://www.youtube.com/watch?v=BgUjQOa9wIc", why: "专注回答“为什么一个头不够”，可视化多头并行的维度切分，d_model=h×head_dim 讲得很直观" }
        ],
        bilibili: [
          { title: "【Transformer】15分钟认识注意力·多头注意力 | 数学原理详解", up: "SKki_ovo", url: "https://www.bilibili.com/video/BV17x8jzvEm6", why: "从单头到多头的数学原理详解，8 万播放，公式与图示并重" },
          { title: "【可视化】Transformer中多头注意力的计算过程", up: "Aye10032", url: "https://www.bilibili.com/video/BV1SF4m1K7gk", why: "纯可视化展示多头注意力的张量计算流程，3.4 万播放，适合对照代码理解 shape" }
        ],
        keywords: ["多头注意力机制", "MHA 为什么多头", "attention head 维度切分"]
      }
    },
    {
      id: "transformer-block",
      name: "Transformer Block",
      en: "BLOCK",
      branch: "prereq",
      deps: ["multi-head"],
      grid: { col: 5, row: 0 },
      summary: "Pre-LN + 残差 + attention + FFN，叠起来就是模型",
      sections: {
        principle: "一个 Transformer block = 两个子层（注意力 + FFN），各自带残差连接与 LayerNorm；整个模型就是同一 block 堆叠几十层。\n现代主流用 Pre-LN：先对输入做 LayerNorm 再进子层，残差流保持干净，深层堆叠训练更稳（原始论文是 Post-LN）。\nFFN 两种形态：GPT-2 式两层全连接、中间扩张到 4×d_model；Llama 式 SwiGLU 用三个矩阵、中间维 11008（d=4096）。每层参数 ≈ attention 4d² + FFN。",
        formula: [
          "Pre-LN：x = x + Attn(LN(x))；x = x + FFN(LN(x))",
          "GPT-2 FFN：d → 4d → d，参数 ≈ 8d²",
          "Llama SwiGLU FFN：3 矩阵 × d × 11008"
        ],
        example: [
          "Llama-2-7B（d=4096）单层：attention 4×4096² ≈ 6710 万",
          "FFN：3 × 4096 × 11008 ≈ 1.35 亿",
          "单层合计 ≈ 2.02 亿，FFN 占了 2/3",
          "× 32 层 ≈ 64.7 亿——模型主体就是 32 个相同 block 的堆叠"
        ],
        tradeoffs: [
          "Pre-LN 训练稳、可堆深，代价是最终输出前需额外一个 LN",
          "SwiGLU 质量更好但三矩阵参数量大；GPT-2 式结构更简单",
          "block 完全重复堆叠，参数量 ≈ 单层 × 层数，成本估算极简"
        ],
        pitfalls: [
          "以为 attention 是大头——Llama 里 FFN 占每层参数的 2/3，比 attention 多一倍",
          "Pre-LN / Post-LN 混用——现代 LLM 几乎全 Pre-LN，深堆叠下 Post-LN 易发散"
        ]
      },
      diagram: {
        type: "flow",
        title: "一个 Block 的数据流",
        items: [
          ["输入 x", "残差流主干"],
          ["LN → Attention", "+ 残差加回"],
          ["LN → FFN", "SwiGLU 3×4096×11008，+ 残差加回"],
          ["输出", "送入下一个 block"],
          ["× 32 层", "Llama-2-7B 主体 ≈ 64.7 亿参数"]
        ]
      },
      quiz: {
        q: "现代 LLM 为什么普遍用 Pre-LN 而不是原始论文的 Post-LN？",
        options: [
          "Pre-LN 参数更少",
          "Pre-LN 让残差流保持干净，深层堆叠训练更稳定",
          "Pre-LN 推理更快",
          "因为 Llama 这么用所以跟风"
        ],
        answer: 1,
        explain: "Pre-LN 先归一化再进子层，残差流不被反复变换，梯度通路干净，几十层堆叠也能稳定训练；Post-LN 在深层下容易发散。另外记住：FFN 占每层参数约 2/3。"
      },
      resources: {
        youtube: [
          { title: "Transformers, the tech behind LLMs | Deep Learning Chapter 5", channel: "3Blue1Brown", url: "https://www.youtube.com/watch?v=wjZofJX0v4M", why: "3B1B GPT 总览章，把嵌入、注意力、MLP、残差堆叠成完整 block 的过程讲得最清楚" },
          { title: "How might LLMs store facts | Deep Learning Chapter 7", channel: "3Blue1Brown", url: "https://www.youtube.com/watch?v=9-Jl0dxWQs8", why: "3B1B 第7章专讲 FFN/MLP 层，补全 block 里注意力之外的另一半" }
        ],
        bilibili: [
          { title: "Transformer论文逐段精读【论文精读】", up: "跟李沐学AI", url: "https://www.bilibili.com/video/BV1pu411o7BE", why: "李沐逐段精读 Attention Is All You Need 原论文，182 万播放，block 结构的权威解读" },
          { title: "Transformer（五）：残差连接、层归一化与FFN", up: "李秋橙太阳", url: "https://www.bilibili.com/video/BV1qmM36EE8C", why: "专题讲解残差连接、LayerNorm 与 FFN 三件套，正好对应 block 结构本体" }
        ],
        keywords: ["Transformer残差连接", "LayerNorm 前馈网络", "Transformer整体结构"]
      }
    },
    {
      id: "logits-softmax",
      name: "Logits 与 Softmax",
      en: "LOGITS",
      branch: "prereq",
      deps: ["transformer-block"],
      grid: { col: 6, row: 0 },
      summary: "隐状态 × lm_head 得 logits，softmax 后才进入采样",
      sections: {
        principle: "最后一个 block 的隐状态（d_model 维）乘上 lm_head 矩阵，得到 vocab_size 维 logits——每个候选 token 的原始打分，可正可负、量级任意。\nsoftmax 把 logits 归一化成和为 1 的概率分布，之后的贪心、温度采样、top-k/top-p 都在这个分布上操作。\nlm_head 与 embedding 形状相同（vocab × d_model）：GPT-2 把两者权重绑定（tie）省参数，Llama 不绑定、独立训练。",
        formula: [
          "logits = h_final × W_lm_head^T ∈ R^vocab",
          "p(token_i) = exp(logit_i / T) / Σ_j exp(logit_j / T)",
          "weight tying：W_lm_head = Embedding^T（GPT-2 绑定，Llama 不绑）"
        ],
        example: [
          "Llama-2-7B：h（4096 维）× lm_head（32000×4096）→ 32000 维 logits",
          "不绑定意味着 lm_head 又是 1.31 亿参数（与 embedding 同形）",
          "softmax 前的 logits 不能直接当概率；归一化后才是分布",
          "温度 T<1 分布变尖（更确定），T>1 变平（更随机）"
        ],
        tradeoffs: [
          "权重绑定省 1.31 亿参数且收敛更快，独立 lm_head 表达力更强",
          "vocab 越大 softmax 归一化越贵，decode 每步都要全词表算一遍",
          "logits 保留完整分布信息，蒸馏与 logprob 分析都依赖它"
        ],
        pitfalls: [
          "把 logits 当概率——未归一化的打分除了比大小没有任何概率含义",
          "以为 temperature 改了模型——它只缩放 logits，权重一动不动"
        ]
      },
      diagram: {
        type: "flow",
        title: "从隐状态到下一个 token",
        items: [
          ["隐状态 4096 维", "最后一个 block 输出"],
          ["× lm_head", "32000×4096 → 32000 维 logits"],
          ["softmax", "归一化为概率分布（温度 T 可调）"],
          ["采样", "贪心 / top-k / top-p 在分布上操作"],
          ["绑定与否", "GPT-2 与 embedding 共享，Llama 独立"]
        ]
      },
      quiz: {
        q: "关于 logits 与 softmax，下列哪项正确？",
        options: [
          "logits 就是概率，越大越可能被采样",
          "logits 是未归一化打分，经 softmax 才成概率分布，之后才进入采样",
          "Llama 的 lm_head 与 embedding 权重绑定",
          "softmax 只在训练时用，推理不用"
        ],
        answer: 1,
        explain: "logits 可正可负、量级任意，softmax 归一化后才得到概率分布，贪心/采样都在分布上做。GPT-2 绑定 lm_head 与 embedding，Llama 不绑定——又是独立的 1.31 亿参数。"
      },
      resources: {
        youtube: [
          { title: "How LLMs Generate Text | Softmax, Temperature, Sampling, Top-k & Top-p", channel: "Dr. Omid Gervei", url: "https://www.youtube.com/watch?v=QuoZTW0_7yY", why: "从 logits 到 softmax 再到温度采样、top-k/top-p 的完整生成链路，正好覆盖输出头主题" }
        ],
        bilibili: [
          { title: "大模型其实在掷骰子（上）｜Logits、Softmax 与温度", up: "老白黍", url: "https://www.bilibili.com/video/BV1XThS6zEoH", why: "专题讲解 logits 如何经 softmax 变成下一个 token 的概率分布，主题完全对口" },
          { title: "Temperature & Top-p：掌控大模型的创造力开关", up: "马克的技术工作坊", url: "https://www.bilibili.com/video/BV1taSFBNEG4", why: "5.1 万播放，从概率分布角度讲温度与 top-p 采样，是 softmax 输出的自然延伸" }
        ],
        keywords: ["logits softmax 大模型", "下一个token概率", "温度采样 top-p原理"]
      }
    },
    {
      id: "forward-flops",
      name: "前向计算与 FLOPs",
      en: "FLOPS",
      branch: "prereq",
      deps: ["logits-softmax"],
      grid: { col: 7, row: 0 },
      summary: "前向每 token ≈ 2N FLOPs，算术强度只有 1 FLOP/B",
      sections: {
        principle: "矩阵乘 [m×k]·[k×n] 的计算量是 2mkn FLOPs（每个输出元素一次乘加）。Transformer 前向被矩阵乘主导：每处理 1 个 token 约需 2N FLOPs（N = 参数量），随序列增长的注意力项相对次要。\n训练每 token ≈ 6N：前向 2N + 反向 4N。\n推理时同一步还要读 FP16 权重 2N 字节——一算一比，decode 算术强度只有约 1 FLOP/B，这就是 memory-bound 的定量根源。",
        formula: [
          "[m×k]·[k×n] = 2mkn FLOPs",
          "前向/token ≈ 2N；训练/token ≈ 6N（前向 2N + 反向 4N）",
          "算术强度 = FLOPs ÷ 访存字节 ≈ 2N ÷ 2N = 1 FLOP/B"
        ],
        example: [
          "7B 模型前向每 token ≈ 2 × 7e9 = 14 GFLOPs",
          "同一步要读 FP16 权重 7e9 × 2 B = 14 GB",
          "算术强度 = 14 GFLOPs ÷ 14 GB = 1 FLOP/B",
          "A100 roofline 拐点 ≈ 153 FLOP/B——差两个数量级，带宽被钉死"
        ],
        tradeoffs: [
          "2N 规则极简好用，但忽略了随序列长平方增长的注意力项，超长序列要另算",
          "batch 大时多个 token 共享一次权重读取，算术强度随 batch 提升",
          "训练 6N 是下限估算，不含重计算、通信与优化器开销"
        ],
        pitfalls: [
          "用 FLOPs 猜推理速度——memory-bound 下决定速度的是带宽不是算力",
          "把参数量 N 和序列长度 N 混用——2N 规则里的 N 是参数量"
        ]
      },
      diagram: {
        type: "bars",
        title: "7B 前向每 token 的账",
        items: [
          ["计算", "≈ 14 GFLOPs（2 × 7e9）"],
          ["访存", "≈ 14 GB（FP16 权重）"],
          ["算术强度", "1 FLOP/B"],
          ["A100 拐点", "153 FLOP/B"],
          ["结论", "差 2 个数量级 → memory-bound"]
        ]
      },
      quiz: {
        q: "7B FP16 模型 batch=1 decode：每 token 计算 14 GFLOPs、读权重 14 GB，算术强度约 1 FLOP/B，远低于 A100 拐点 153 FLOP/B。这说明？",
        options: [
          "算力没用满，应换更强的 GPU",
          "瓶颈在 HBM 带宽而非算力，堆算力无济于事",
          "应该用 INT8 做计算",
          "softmax 拖慢了整体速度"
        ],
        answer: 1,
        explain: "算术强度 1 FLOP/B 意味着每读 1 字节只做 1 次浮点运算，远落在 roofline 的 memory-bound 区。提速的正解是减少字节读取（量化、加大 batch），不是加 FLOPS。"
      },
      resources: {
        youtube: [
          { title: "FLOPS Demystified: AI and the math behind DeepSeek training costs", channel: "Spreadsheets are all you need", url: "https://www.youtube.com/watch?v=T3JiBtHHTMU", why: "以 DeepSeek 训练成本为案例拆解 FLOPs 计算方法，把 2N 规则落到实际数字" }
        ],
        bilibili: [
          { title: "llm科普课 大模型计算量参数量和显存之间的关系", up: "llm氪ke普课", url: "https://www.bilibili.com/video/BV1CVvQBMEak", why: "直接讲计算量≈2×参数量×token数这一核心公式与显存的关系，主题高度对口" },
          { title: "如何衡量深度学习算法的计算量-常用计算量衡量指标解析（FLOPs、参数量、FPS）", up: "Bubbliiiing", url: "https://www.bilibili.com/video/BV1oR4y1X7xZ", why: "2.9 万播放，FLOPs 与参数量指标的通用入门，矩阵乘法主导的思想讲得清楚" }
        ],
        keywords: ["大模型FLOPs计算", "训练算力估算", "每token计算量 2N"]
      }
    },
    {
      id: "param-counting",
      name: "参数量估算",
      en: "PARAMS",
      branch: "prereq",
      deps: ["forward-flops"],
      grid: { col: 8, row: 0 },
      summary: "从结构数出 67 亿参数，再推出显存需求",
      sections: {
        principle: "参数量可以纯从结构算出来：embedding = vocab × d；每层 = attention 4d² + FFN；总数 = embedding + 层数 × 每层。\n推理显存 = 权重（FP16 2 B/参数）+ KV cache + 激活；训练还要加梯度（2 B/参数）与 Adam 优化器状态（每参数 8 B：一阶矩 + 二阶矩，FP32）。\n「数参数」是估算一切成本——显存、算力、时间——的第一步。",
        formula: [
          "每层 ≈ 4d²（attn）+ FFN（SwiGLU：3 × d × d_ff）",
          "推理显存 ≈ 2 B × N（权重）+ KV cache + 激活",
          "训练显存 ≈ 权重 2 B + 梯度 2 B + Adam 8 B = 12 B/参数（未含激活）"
        ],
        example: [
          "Llama-2-7B（d=4096，32 层）：attention 4×4096² ≈ 6710 万/层",
          "FFN 3×4096×11008 ≈ 1.35 亿/层 → 单层 ≈ 2.02 亿",
          "32 层 ≈ 64.7 亿 + embedding 1.31 亿 ≈ 67 亿 ✓（对上 7B）",
          "推理：权重 14 GB + KV cache；训练：67亿 × 12 B ≈ 80 GB 起步"
        ],
        tradeoffs: [
          "结构估算精度高，但 MoE、权重绑定等变体要单独处理",
          "FP16 是推理基线，量化后把公式里的 2 B 换成对应字节数即可",
          "训练 12 B/参数不含激活值，大 batch 长序列下激活可能再占一半"
        ],
        pitfalls: [
          "把 7B 当成正好 70 亿——Llama-2-7B 实算约 67 亿，型号名是约数",
          "只算权重显存——训练时 Adam 状态是权重的 4 倍，常是第一个 OOM 元凶"
        ]
      },
      diagram: {
        type: "bars",
        title: "Llama-2-7B 参数解剖",
        items: [
          ["embedding", "32000×4096 ≈ 1.31 亿"],
          ["attention ×32", "6710 万/层 ≈ 21.5 亿"],
          ["FFN ×32", "1.35 亿/层 ≈ 43.2 亿"],
          ["合计", "≈ 67 亿 ✓"],
          ["训练显存", "12 B/参数 ≈ 80 GB 起步"]
        ]
      },
      quiz: {
        q: "用 Adam 训练 Llama-2-7B（FP16 权重 + 梯度，Adam 每参数 8B），不算激活至少需要多少显存？",
        options: [
          "14 GB",
          "约 28 GB",
          "约 80 GB（67亿 × 12 B/参数）",
          "140 GB"
        ],
        answer: 2,
        explain: "权重 2B + 梯度 2B + Adam 一阶/二阶矩 8B = 12 B/参数，67亿 × 12 ≈ 80 GB——还没算激活和 KV cache。这就是 7B 全参训练一张 80G 卡都很紧的原因。"
      },
      resources: {
        youtube: [
          { title: "Let us hand-calculate how GPT-3 has a total of 175B parameters | Transformers for Vision", channel: "Vizuara", url: "https://www.youtube.com/watch?v=VEmrEo0ZDw8", why: "逐层手算 GPT-3 的 1750 亿参数：attention 4d²、FFN、嵌入矩阵一项项加出来，与本知识点完全对口" },
          { title: "The efficiency misnomer | Size does not matter | What does the number of parameters mean in a model?", channel: "AI Coffee Break with Letitia", url: "https://www.youtube.com/watch?v=l3bTCP6x-FM", why: "从“参数量到底意味着什么”切入，纠正常见误解，适合建立参数规模的直觉" }
        ],
        bilibili: [
          { title: "如何知道一个大模型在推理和训练时需要多少显存？", up: "AI开发者-就爱瞎鼓捣", url: "https://www.bilibili.com/video/BV1SZ42187du", why: "9.2 万播放，从参数量推训练/推理显存构成，7B/70B 量级换算讲得实用" },
          { title: "【大模型分享】AI大模型的参数到底是啥？10分钟讲清楚！", up: "巴卜大模型", url: "https://www.bilibili.com/video/BV1FNqWBZE5g", why: "1.6 万播放，10 分钟讲清参数量的含义与规模量级，适合入门打底" }
        ],
        keywords: ["大模型参数量怎么算", "7B模型显存需求", "GPT3 175B参数拆解"]
      }
    },
    {
      id: "autoregressive",
      name: "自回归解码",
      en: "AUTOREGRESSIVE",
      branch: "base",
      deps: ["logits-softmax", "param-counting"],
      grid: { col: 1, row: 1 },
      summary: "逐 token 串行生成，是 LLM 推理慢的根源约束",
      sections: {
        principle: "自回归生成指每个新 token 都依赖此前已生成的全部 token，第 t 步必须等第 t-1 步完成才能开始，无法跨时间步并行。\n这意味着 decode 阶段每生成一个 token 都要把全部权重从 HBM 读一遍，生成长度直接决定串行步数。\n训练时可以并行（teacher forcing），推理时不行——这是 LLM 推理一切优化的出发点。",
        formula: [
          "p(x) = Π_t p(x_t | x_1..x_{t-1})",
          "decode 第 t 步：读全部权重 W → 算 1 个 token",
          "生成 N 个 token = N 次串行前向，无法并行"
        ],
        example: [
          "70B FP16 权重 = 70e9 × 2 B = 140 GB",
          "A100 HBM 带宽 2039 GB/s，batch=1 时每步至少读 140 GB",
          "理论上限 ≈ 2039 / 140 ≈ 14.6 tok/s",
          "生成 100 个 token 需 100 次串行读权重，下限 ≈ 100 × 140 / 2039 ≈ 6.9 s"
        ],
        tradeoffs: [
          "自回归保证生成质量与概率一致性，但牺牲了并行度",
          "加大 batch 可摊薄权重读取，却受显存与延迟约束",
          "贪心解码省一次 softmax 采样开销，但输出多样性差"
        ],
        pitfalls: [
          "以为加算力就能加速 decode——batch=1 时瓶颈是带宽不是 FLOPS",
          "把训练的并行能力套到推理上，忽略推理的串行依赖本质"
        ]
      },
      diagram: {
        anim: "decodeLoop",
        type: "loop",
        title: "自回归生成循环（每生成 1 个 token 转一圈）",
        items: [
          ["读权重", "每步重读 140GB 权重"],
          ["算 logits", "前向算出下一 token 分布"],
          ["采样", "按分布抽出 1 个 token"],
          ["拼接回输入", "新 token 并入上下文，回到第一步"]
        ]
      },
      quiz: {
        q: "70B FP16 模型在单卡 A100 上 batch=1 推理，理论上限约 14.6 tok/s。主要瓶颈是？",
        options: ["BF16 算力不足", "HBM 显存带宽", "显存容量不够", "PCIe 通信延迟"],
        answer: 1,
        explain: "每生成 1 个 token 都要从 HBM 读 140GB 权重，2039÷140≈14.6 tok/s。算术强度仅约 1 FLOP/B，远低于 A100 拐点 153 FLOP/B，典型 memory-bound。"
      },
      resources: {
        youtube: [
          { title: "Stanford CS236: Deep Generative Models I 2023 I Lecture 3 - Autoregressive Models", channel: "Stanford Online", url: "https://www.youtube.com/watch?v=tRArbBf-AbI", why: "斯坦福官方课程讲自回归模型原理，权威系统（偏生成模型通用，非专讲推理慢）" },
          { title: "Why LLM inference is slow: The autoregressive bottleneck explained", channel: "Red Hat Developers", url: "https://www.youtube.com/watch?v=9aJyeHIGbaQ", why: "直接讲自回归逐个 token 生成为什么是推理瓶颈，官方技术频道" }
        ],
        bilibili: [
          { title: "三分钟动画讲解算法——自回归 | 以因果注意力为例 介绍算法原理 + 优劣势 + 伪代码", up: "祖安ADAS", url: "https://www.bilibili.com/video/BV1BayfBrEKD", why: "动画讲解自回归生成机制及其串行劣势，贴合主题" }
        ],
        keywords: ["自回归解码", "大模型为什么生成慢", "逐token生成原理"]
      }
    },
    {
      id: "prefill-decode",
      name: "Prefill/Decode 两阶段",
      en: "PREFILL / DECODE",
      branch: "base",
      deps: ["autoregressive"],
      grid: { col: 2, row: 1 },
      summary: "一次推理分两段：并行吃 prompt，串行吐 token",
      sections: {
        principle: "Prefill 阶段一次性并行处理整个 prompt，算出所有位置的 KV 并产出第一个 token；Decode 阶段进入自回归循环，每次只算 1 个新 token。\n两阶段硬件画像完全不同：prefill 算术强度高、是 compute-bound；decode 算术强度低、是 memory-bound。\n因此 TTFT 由 prefill 决定，TPOT 由 decode 决定，优化手段也必须分开设计。",
        formula: [
          "算术强度 = FLOPs ÷ 访存字节数",
          "prefill：对 prompt 并行，强度可达数百 FLOP/B",
          "decode batch=1：≈ 1 FLOP/B",
          "A100 roofline 拐点 ≈ 312e12 / 2039e9 ≈ 153 FLOP/B",
          "TTFT ≈ 2×N×P ÷ (算力 × MFU)"
        ],
        example: [
          "70B、prompt P=2000 tokens、A100 BF16 312 TFLOPS、MFU 50%",
          "TTFT ≈ 2 × 70e9 × 2000 / (312e12 × 0.5)",
          "     = 2.8e14 / 1.56e14 ≈ 1.79 s",
          "而 decode 2000 个 token 按 14.6 tok/s 需 ≈ 137 s，两阶段耗时天差地别"
        ],
        tradeoffs: [
          "prefill 吃算力、decode 吃带宽，混部会互相拖累",
          "MFU 越高 TTFT 越短，但 batch 与显存限制了实际利用率",
          "长 prompt 场景 TTFT 尖峰明显，需 chunked prefill 等手段削峰"
        ],
        pitfalls: [
          "用同一套指标评价两个阶段，把 TTFT 问题当 decode 问题优化",
          "以为 prompt 短就无所谓——高并发下 prefill 照样挤占 decode 资源"
        ]
      },
      diagram: {
        type: "compare",
        title: "两阶段硬件画像（A100）",
        items: [
          ["Prefill", "compute-bound，强度可达数百 FLOP/B"],
          ["Decode", "memory-bound，batch=1 约 1 FLOP/B"],
          ["拐点", "153 FLOP/B = 312 TFLOPS ÷ 2039 GB/s"],
          ["主导指标", "TTFT ← prefill；TPOT ← decode"]
        ]
      },
      quiz: {
        q: "同样处理 2000 个 token，prefill 与 decode 对 GPU 的利用本质区别是？",
        options: [
          "prefill 用 FP16、decode 用 INT8",
          "prefill 并行计算、算术强度高；decode 串行读权重、受带宽限制",
          "prefill 不读权重、decode 读权重",
          "两者没有区别，只是叫法不同"
        ],
        answer: 1,
        explain: "prefill 对 2000 个位置并行做矩阵乘，算术强度远超 153 FLOP/B 拐点；decode 每步只算 1 个 token 却要读全部权重，强度约 1 FLOP/B，落在 memory-bound 区。"
      },
      resources: {
        youtube: [
          { title: "LLM Inference Explained: Prefill, Decode, KV Cache & AI Optimization", channel: "MicroLearningAll", url: "https://www.youtube.com/watch?v=6QgLJLmNJGg", why: "明确讲 prefill 计算密集、decode 显存带宽受限及配套优化" },
          { title: "LLM Inference Split: Prefill vs Decode Explained", channel: "Sift Labs", url: "https://www.youtube.com/watch?v=SqsM6nBeyqI", why: "专题拆解为何现代推理框架要分离 prefill 与 decode" }
        ],
        bilibili: [
          { title: "【大模型推理】大模型推理 Prefill 和 Decoder 阶段详解", up: "ZOMI酱", url: "https://www.bilibili.com/video/BV1nHqgYFEcq", why: "AI Infra 知名 UP，5.4 万播放，专讲两阶段划分" },
          { title: "模型部署教程之什么是Roofline model", up: "自动驾驶之心", url: "https://www.bilibili.com/video/BV1f34y1G741", why: "补充 roofline 算术强度视角，对应 compute-bound vs memory-bound" }
        ],
        keywords: ["prefill和decode区别", "大模型推理两阶段", "roofline模型 算力带宽"]
      }
    },
    {
      id: "kv-cache",
      name: "KV Cache 原理",
      en: "KV CACHE",
      branch: "kv",
      deps: ["prefill-decode"],
      grid: { col: 2, row: 2 },
      summary: "缓存历史 K/V 避免重复计算，用显存换时间",
      sections: {
        principle: "Decode 每步只需新 token 的 Query 去和历史所有 Key/Value 做注意力，历史 token 的 K/V 每步都一样，缓存起来就不必重算。\n只缓存 K、V 不缓存 Q：历史位置的 Q 不会再被用到，缓存是纯浪费。\n代价是显存随「层数 × 序列长度 × 并发数」线性膨胀，长上下文服务中 KV cache 往往比权重更占显存。",
        formula: [
          "KV cache/序列 = 2 × n_layers × n_kv_heads × head_dim × dtype_bytes × ctx_len",
          "（系数 2 = Key 和 Value 各一份）"
        ],
        example: [
          "Llama-70B：80 层、GQA 8 kv_heads、head_dim 128、FP16、ctx 4K",
          "= 2 × 80 × 8 × 128 × 2 × 4096 ≈ 2.7 GB/序列",
          "若 MHA 64 heads：≈ 21.5 GB/序列（8 倍差距）",
          "batch=8 时 KV 共 ≈ 21.6 GB，逼近一张卡的权重体量"
        ],
        tradeoffs: [
          "KV cache 把 O(N²) 重算降为 O(N) 读缓存，是 decode 提速的根基",
          "显存占用随并发线性涨，直接限制最大 batch 与上下文长度",
          "prefill 阶段顺手填充 KV cache，几乎无额外成本"
        ],
        pitfalls: [
          "以为缓存 QKV 三个——Q 不缓存，历史 Q 不再参与计算",
          "只盯权重显存，忽略长上下文下 KV cache 才是显存大头"
        ]
      },
      diagram: {
        anim: "kvGrow",
        type: "loop",
        title: "Decode 每步的 KV cache 循环",
        items: [
          ["算新 K/V", "只为新 token 算 K、V"],
          ["追加进 cache", "写入显存，历史不重算"],
          ["注意力读全量 cache", "新 Q × 全部历史 K/V"],
          ["产出新 token", "序列 +1，回到第一步"]
        ]
      },
      quiz: {
        q: "KV Cache 为什么只缓存 K 和 V，不缓存 Q？",
        options: [
          "Q 的显存占用太小不值得缓存",
          "历史 token 的 Q 不再参与后续注意力计算，缓存无意义",
          "Q 每次随机生成无法缓存",
          "因为 K、V 是偶数个方便对齐"
        ],
        answer: 1,
        explain: "decode 第 t 步只有新 token 的 Q 去查询历史 K/V，历史位置的 Q 从此不再被使用——缓存它们纯属浪费显存。"
      },
      resources: {
        youtube: [
          { title: "KV Cache in LLMs, Clearly Explained!", channel: "Programio", url: "https://www.youtube.com/watch?v=q1tGCBiL5vc", why: "专注 KV Cache 原理的清晰讲解" },
          { title: "LLM Inference Optimization Explained: KV Cache, Flash Attention, vLLM & SGLang", channel: "MicroLearningAll", url: "https://www.youtube.com/watch?v=zkMCHA5uzIo", why: "把 KV Cache 放进整体推理优化版图，含 vLLM/SGLang 上下文" }
        ],
        bilibili: [
          { title: "【8】KV Cache 原理讲解", up: "LLM张老师", url: "https://www.bilibili.com/video/BV17CPkeEEzk", why: "9.8 万播放的 KV Cache 专题原理课" },
          { title: "到底什么是KV Cache，为啥不是QKV Cache，一个动画彻底搞懂！", up: "轩辕的编程宇宙", url: "https://www.bilibili.com/video/BV1fcaN6fENi", why: "动画形式讲清为什么只缓存 K/V，适合入门" }
        ],
        keywords: ["KV Cache原理", "KV Cache 显存计算", "大模型推理缓存"]
      }
    },
    {
      id: "mha-gqa",
      name: "MHA/MQA/GQA",
      en: "MHA · MQA · GQA",
      branch: "kv",
      deps: ["kv-cache"],
      grid: { col: 3, row: 2 },
      summary: "减少 KV 头数，把 KV cache 成比例砍小",
      sections: {
        principle: "MHA 每个 query head 配独立 K/V 头；MQA 所有 query head 共享 1 个 K/V 头；GQA 折中，把 query head 分组，每组共享 1 个 K/V 头。\nKV cache 大小正比于 n_kv_heads，与 query head 数无关——头数砍几倍，KV cache 就小几倍。\nGQA 用很小的质量损失换来数倍的显存与带宽节省，已成主流大模型标配。",
        formula: [
          "MHA：n_kv_heads = n_heads",
          "GQA：n_kv_heads = n_heads ÷ g（g 为组大小）",
          "MQA：n_kv_heads = 1（GQA 的极端）",
          "KV cache ∝ n_kv_heads"
        ],
        example: [
          "Llama-70B：MHA 时 64 heads，GQA 后 8 kv_heads",
          "KV cache（FP16 4K）：21.5 GB → 2.7 GB，恰好降为 1/8",
          "decode 每步少读约 18.8 GB，带宽压力同步下降",
          "MQA 若只有 1 个 kv_head，则再降 8 倍至 ≈ 0.34 GB"
        ],
        tradeoffs: [
          "kv_heads 越少越省显存和带宽，但表达力下降、质量有损失",
          "GQA-8 是质量与成本的主流平衡点，MQA 适合极端成本敏感场景",
          "MHA→GQA 可通过微调恢复大部分精度损失，并非免费午餐"
        ],
        pitfalls: [
          "以为减少 kv_heads 也减少了计算量——Q 侧计算不变，省的是 KV 存储与读取",
          "把 GQA 当量化：它是结构改动，需要训练/微调配合，不能事后直接套"
        ]
      },
      diagram: {
        type: "tree",
        title: "注意力变体头数对比（Llama-70B）",
        items: [
          ["MHA", "64 q_heads → 64 kv_heads → 21.5 GB"],
          ["GQA", "64 q_heads → 8 kv_heads → 2.7 GB"],
          ["MQA", "64 q_heads → 1 kv_head → ≈0.34 GB"],
          ["规律", "KV cache = 21.5 ÷ kv_heads 比例缩放"]
        ]
      },
      quiz: {
        q: "Llama-70B 用 GQA（8 kv_heads）替代 MHA（64 heads）后，4K 上下文 KV cache 从约 21.5GB 降到 2.7GB，关键原因是？",
        options: [
          "head_dim 从 128 减到 16",
          "层数从 80 减到 10",
          "KV cache 正比于 n_kv_heads，头数缩 8 倍缓存缩 8 倍",
          "GQA 对 KV 自动做了 INT8 量化"
        ],
        answer: 2,
        explain: "KV cache 公式中起决定作用的是 n_kv_heads：64→8 缩为 1/8，21.5÷8≈2.7GB。层数、head_dim 都没变，GQA 本身也不含量化。"
      },
      resources: {
        youtube: [
          { title: "Multi Query(MQA) and Grouped Query(GQA) Attention Visually Explained", channel: "Explaining AI", url: "https://www.youtube.com/watch?v=_pWigIleZNs", why: "可视化对比 MQA/GQA 的 kv_heads 变化" },
          { title: "Understand Grouped Query Attention (GQA) | The final frontier before latent attention", channel: "Vizuara", url: "https://www.youtube.com/watch?v=kx3rETIxo4Q", why: "35 分钟深讲 GQA，并自然衔接到 MLA，适合串联下一知识点" }
        ],
        bilibili: [
          { title: "【9】MHA、MQA、GQA各种注意力变种机制讲解", up: "LLM张老师", url: "https://www.bilibili.com/video/BV17CPkeEE5d", why: "系统讲解三种注意力变体演进，与 KV Cache 课程同系列" },
          { title: "Attention变种GQA、MLA、MQA都有什么区别？终于清晰啦", up: "ZOMI酱", url: "https://www.bilibili.com/video/BV1GzMUz8Eav", why: "AI Infra 知名 UP 梳理 GQA/MLA/MQA 区别" }
        ],
        keywords: ["MHA MQA GQA区别", "GQA 注意力机制", "kv_heads 注意力变体"]
      }
    },
    {
      id: "mla",
      name: "MLA 潜注意力",
      en: "MLA",
      branch: "kv",
      deps: ["mha-gqa"],
      grid: { col: 4, row: 2 },
      summary: "把 K/V 压进低秩潜向量，DeepSeek 的显存杀器",
      sections: {
        principle: "MLA（Multi-head Latent Attention）不减少头数，而是把每层的 K/V 联合压缩成一个低秩潜向量缓存起来，用时再重构出各头的 K/V。\n缓存维度从「kv_heads × head_dim」降到固定的 kv_lora_rank + rope 维，与头数脱钩。\nDeepSeek-V2/V3 借此在保持 MHA 级表达力的同时，把 KV cache 压到比 GQA 还小。",
        formula: [
          "缓存内容 = 潜向量 c_t（kv_lora_rank 维）+ RoPE 部分（rope 维）",
          "DeepSeek-V2/V3：kv_lora_rank = 512，rope = 64 → 每 token 每层缓存 576 维",
          "KV cache = 2 × n_layers × 576 × dtype_bytes × ctx_len"
        ],
        example: [
          "DeepSeek-V3：61 层、每 token 每层缓存 512+64=576 维、FP16、ctx 4K",
          "= 2 × 61 × 576 × 2 × 4096 ≈ 1.15 GB/序列",
          "对照 Llama-70B GQA 的 2.7 GB、MHA 的 21.5 GB",
          "DeepSeek-V2：236B 总参、21B 激活；V3：671B 总参、37B 激活，均用 MLA"
        ],
        tradeoffs: [
          "压缩比远超 GQA 且保持多头表达力，但重构 K/V 引入额外计算",
          "潜向量与 RoPE 要分开处理，实现复杂度高于标准注意力",
          "低秩压缩是有损的，依赖训练让信息浓缩进 512 维"
        ],
        pitfalls: [
          "以为 MLA 是「更激进的 GQA」——它不减头数，走的是低秩压缩路线",
          "忽略 RoPE 的 64 维必须单独缓存，不能和潜向量一起压"
        ]
      },
      diagram: {
        type: "bars",
        title: "KV cache/序列对比（FP16，4K 上下文）",
        items: [
          ["MHA（Llama-70B）", "≈ 21.5 GB"],
          ["GQA-8（Llama-70B）", "≈ 2.7 GB"],
          ["MLA（DeepSeek-V3）", "≈ 1.15 GB"],
          ["MLA 缓存维度", "512 潜向量 + 64 RoPE = 576"]
        ]
      },
      quiz: {
        q: "MLA 与 GQA 压缩 KV cache 的思路本质区别是？",
        options: [
          "MLA 把 kv_heads 减到 1",
          "MLA 不减头数，把 K/V 联合压成低秩潜向量，用时再重构",
          "MLA 对 KV 做了 INT4 量化",
          "MLA 直接不存 KV cache"
        ],
        answer: 1,
        explain: "GQA 沿「减少 kv_heads」轴压缩，MLA 换了一条轴：保持多头结构，把每层 K/V 压进 512+64 维潜向量。所以 DeepSeek-V3 能以 576 维/层实现比 GQA 更小的缓存。"
      },
      resources: {
        youtube: [
          { title: "Multi-Head Latent Attention From Scratch | One of the major DeepSeek innovation", channel: "Vizuara", url: "https://www.youtube.com/watch?v=NlDQUj1olXM", why: "从零实现 MLA，DeepSeek 核心创新专题" },
          { title: "Multi-Head Latent Attention and Multi-token Prediction in Deepseek v3", channel: "Xiaoliu.x", url: "https://www.youtube.com/watch?v=jL49fLOJYNg", why: "结合 DeepSeek-V3 讲 MLA 与 MTP 的论文级解读" }
        ],
        bilibili: [
          { title: "DeepSeek-v2 MLA 原理讲解", up: "RethinkFun", url: "https://www.bilibili.com/video/BV1BYXRYWEMj", why: "3.9 万播放的 MLA 原理专题，DeepSeek-V2 官方机制拆解" },
          { title: "【MLA】【KV Cache】10分钟了解DeepSeek-V2的创新点：MLA", up: "东川路第一可爱猫猫虫", url: "https://www.bilibili.com/video/BV1yspRzPEw8", why: "从 KV Cache 压缩视角 10 分钟讲清 MLA 动机" }
        ],
        keywords: ["MLA 多头潜在注意力", "DeepSeek MLA 原理", "DeepSeek KV压缩"]
      }
    },
    {
      id: "kv-quant",
      name: "KV Cache 量化",
      en: "KV QUANT",
      branch: "kv",
      deps: ["mla"],
      grid: { col: 5, row: 2 },
      summary: "结构压缩到头后，再对缓存本体做低比特",
      sections: {
        principle: "KV cache 量化把缓存的 K/V 从 FP16 压到 INT8/INT4，显存与带宽占用成比例下降，可压 2-4×。\n难点在 Key 分布：Key 在通道维度有显著离群值，按 token 量化会被个别通道带崩；Value 分布则相对温和。\nKIVI（2024）据此采用非对称策略：Key 按通道量化、Value 按 token 量化，用精度敏感的粒度对齐数据分布。",
        formula: [
          "FP16 → INT8：KV cache ÷ 2；FP16 → INT4：÷ 4",
          "KIVI：Key per-channel 量化，Value per-token 量化",
          "量化误差 ∝ 组内数值范围 → group 越小越准、开销越大"
        ],
        example: [
          "Llama-70B GQA 4K：KV cache 2.7 GB/序列",
          "INT8 后 ≈ 1.35 GB，INT4 后 ≈ 0.68 GB",
          "batch=8 时从 21.6 GB 压到 ≈ 5.4 GB，省下的显存可多开 batch",
          "KIVI 实测 KV cache 可压 2-4× 而精度损失可控"
        ],
        tradeoffs: [
          "INT8 几乎无损，INT4 开始要权衡任务精度",
          "量化/反量化引入每步额外计算，带宽换来的收益要打折扣",
          "小 group 更准但 scale/zero 元数据本身也占显存"
        ],
        pitfalls: [
          "Key 和 Value 用同一粒度量化——Key 的通道离群值会毁掉按 token 的方案",
          "只看显存节省，不测长上下文下误差累积对生成质量的影响"
        ]
      },
      diagram: {
        anim: "quantBits",
        type: "compare",
        title: "KIVI 非对称量化策略",
        items: [
          ["Key", "按通道量化（通道维有离群值）"],
          ["Value", "按 token 量化（分布温和）"],
          ["压缩率", "KV cache 可压 2-4×"],
          ["对照", "INT8 ÷2 / INT4 ÷4（相对 FP16）"]
        ]
      },
      quiz: {
        q: "KIVI 为什么对 Key 按通道、Value 按 token 采用不同量化粒度？",
        options: [
          "工程上 Key 和 Value 存在不同显存区域",
          "Key 在通道维有显著离群值，按 token 量化会被带崩；Value 分布温和可按 token",
          "Key 更重要所以用更高精度",
          "随机选择，两者其实可以互换"
        ],
        answer: 1,
        explain: "量化的误差由组内数值范围决定。Key 的离群值集中在固定通道上，按通道分组让每个通道独立定 scale，误差最小；Value 没有这种结构，按 token 即可。"
      },
      resources: {
        youtube: [
          { title: "How To Use KV Cache Quantization for Longer Generation by LLMs", channel: "Fahd Mirza", url: "https://www.youtube.com/watch?v=m6QmAUG-zSw", why: "实操向演示 KV Cache 量化支撑更长生成" },
          { title: "TurboQuant Explained: 3-Bit KV Cache Quantization", channel: "TalesOfTensors", url: "https://www.youtube.com/watch?v=V6rq4K2arHY", why: "讲解 3-bit KV Cache 量化论文 TurboQuant，覆盖 INT4 以下思路" }
        ],
        bilibili: [
          { title: "KV Cache各种量化的智商与速度", up: "linuxdo", url: "https://www.bilibili.com/video/BV1pqeQ6BE3L", why: "实测不同 KV Cache 量化档位对精度与速度的影响" },
          { title: "14.KV Cache量化：INT4精度换4倍批量提升", up: "wangbin大大", url: "https://www.bilibili.com/video/BV1ndMh6yEPQ", why: "直接对应 INT4 KV 缓存量化主题（播放量较小）" }
        ],
        keywords: ["KV Cache量化", "KV缓存 INT8 INT4", "大模型推理量化"]
      }
    },
    {
      id: "weight-quant",
      name: "权重量化基础",
      en: "WEIGHT QUANT",
      branch: "quant",
      deps: ["kv-cache"],
      grid: { col: 2, row: 3 },
      summary: "把权重从 FP16 压到 INT4，显存与带宽一起省",
      sections: {
        principle: "权重量化用低位整数近似 FP16 权重：INT8 省一半、INT4 省四分之三的权重显存。\nW4A16 指权重 4bit、激活保持 16bit——推理时反量化权重再计算，省的是存储与读取，不是计算精度。\ndecode 是 memory-bound，权重读得少直接等于跑得快，所以权重量化同时降显存和提速度。",
        formula: [
          "权重显存 = 参数量 × 每参数字节数",
          "FP16 = 2 B，INT8 = 1 B，INT4 = 0.5 B",
          "W4A16 = 权重 4bit + 激活 16bit"
        ],
        example: [
          "70B 权重：FP16 = 140 GB，INT8 = 70 GB，INT4 = 35 GB",
          "140 GB 需 2×A100 80G；35 GB 单卡即可装下",
          "batch=1 decode 理论上限：INT4 后 2039 ÷ 35 ≈ 58 tok/s（FP16 时仅 14.6）",
          "llama.cpp GGUF 常见档位如 Q4_K_M，即 4bit 级量化"
        ],
        tradeoffs: [
          "bit 越低越省，但精度损失越大，INT4 是实用下限",
          "W4A16 省显存提速，但反量化有计算开销，prefill 阶段收益有限",
          "量化只解决权重，KV cache 随上下文增长的部分一点没省"
        ],
        pitfalls: [
          "以为量化只省显存——其实 memory-bound 的 decode 速度也成比例提升",
          "以为权重压到 35GB 就万事大吉——长上下文下 KV cache 才是显存大头"
        ]
      },
      diagram: {
        anim: "quantBits",
        type: "bars",
        title: "70B 权重显存占用",
        items: [
          ["FP16", "140 GB（2×A100）"],
          ["INT8", "70 GB（1×A100 勉强）"],
          ["INT4", "35 GB（单卡宽裕）"],
          ["decode 上限", "14.6 → 58 tok/s（FP16→INT4）"]
        ]
      },
      quiz: {
        q: "70B 模型做了 W4A16 量化后权重只占 35GB，但长上下文高并发服务仍然 OOM，最可能的原因是？",
        options: [
          "INT4 计算需要额外临时显存",
          "量化只省权重显存，KV cache 随上下文长度和并发线性增长，才是大头",
          "A100 的 80GB 是虚标",
          "W4A16 激活也要占 35GB"
        ],
        answer: 1,
        explain: "权重量化只动权重那一块。KV cache = 2×层数×kv_heads×head_dim×字节×ctx，随并发和长上下文膨胀，GQA 8 序列 4K 就要 21.6GB——量化权重解决不了这部分。"
      },
      resources: {
        youtube: [
          { title: "Quantizing LLMs - How & Why (8-Bit, 4-Bit, GGUF & More)", channel: "Adam Lucek", url: "https://www.youtube.com/watch?v=3EDI4akymhA", why: "系统讲 8bit/4bit 权重量化与 GGUF 格式，实操向，约 3 万播放" },
          { title: "Optimize Your AI - Quantization Explained", channel: "Matt Williams", url: "https://www.youtube.com/watch?v=K75j8MkwgJ0", why: "54 万播放的量化入门科普，讲清 FP16 到 Q4 的精度/显存权衡" }
        ],
        bilibili: [
          { title: "跟着 Unsloth 学量化：GGUF 到底是什么？", up: "五里墩茶社", url: "https://www.bilibili.com/video/BV1jcGF6dEwU", why: "从 Unsloth 视角讲透 GGUF 量化格式，1.4 万播放" },
          { title: "大模型操作 | 开源模型的量化，GGUF格式转换，Ollama识别", up: "紫灵门主er", url: "https://www.bilibili.com/video/BV1aJ4m1373q", why: "GGUF 量化转换与 Ollama 加载的完整实操演示" }
        ],
        keywords: ["大模型量化入门", "GGUF量化教程", "INT4量化显存"]
      }
    },
    {
      id: "gptq-awq",
      name: "GPTQ vs AWQ",
      en: "GPTQ vs AWQ",
      branch: "quant",
      deps: ["weight-quant"],
      grid: { col: 3, row: 3 },
      summary: "两大主流校准量化：一个看 Hessian，一个看激活",
      sections: {
        principle: "GPTQ（2022）逐层量化，用二阶 Hessian 近似估计每个权重量化带来的输出误差，并调整剩余权重补偿。\nAWQ（2023）发现约 1% 的权重通道对应激活值显著偏大，对精度影响远超其余，于是用逐通道缩放保护这些显著权重再量化。\n两者都是离线校准、推理零开销的路线，常用 group size 128 平衡精度与体积。",
        formula: [
          "GPTQ：min ||WX - Q(W)X||²，用 Hessian 近似逐列补偿",
          "AWQ：对显著通道乘缩放 s，量化 w·s，推理时 X/s",
          "group size = 128：每 128 个权重共享一组 scale/zero"
        ],
        example: [
          "70B INT4：权重 140 GB → 35 GB，两种算法体积相同",
          "INT4 AWQ 常见困惑度损失 < 1%（相对 FP16）",
          "差异在精度来源：AWQ 靠保护 1% 显著通道，GPTQ 靠 Hessian 误差补偿",
          "GGUF（llama.cpp 生态如 Q4_K_M）则面向 CPU/混合部署场景"
        ],
        tradeoffs: [
          "AWQ 通常更稳、校准快；GPTQ 在某些模型上精度略优但更慢",
          "group size 越小越准，元数据开销越大，128 是常用折中",
          "两者都是 PTQ（训练后量化），极端低比特仍需 QAT 或混合精度"
        ],
        pitfalls: [
          "以为量化算法影响显存大小——同比特下体积一样，差异只在精度",
          "忽略校准数据的代表性：校准集偏离业务分布，精度评估会失真"
        ]
      },
      diagram: {
        type: "compare",
        title: "GPTQ vs AWQ 校准依据",
        items: [
          ["GPTQ（2022）", "二阶 Hessian 近似，逐层误差补偿"],
          ["AWQ（2023）", "激活感知，保护约 1% 显著权重通道"],
          ["共同点", "INT4、group size 128、推理零校准开销"],
          ["精度参考", "INT4 AWQ 困惑度损失 < 1%"]
        ]
      },
      quiz: {
        q: "AWQ 与 GPTQ 在「怎么量化更准」上的关键差异是？",
        options: [
          "AWQ 用 8bit、GPTQ 用 4bit",
          "AWQ 依据激活分布保护约 1% 显著通道；GPTQ 用 Hessian 近似做逐层误差补偿",
          "AWQ 是在线量化、GPTQ 是离线量化",
          "GPTQ 不需要校准数据"
        ],
        answer: 1,
        explain: "两者都是离线 PTQ、都用校准数据、体积相同。区别在于误差控制思路：AWQ 发现激活大的通道权重更敏感，缩放保护之；GPTQ 用二阶信息量化一个补偿其余。"
      },
      resources: {
        youtube: [
          { title: "Which Quantization Method is Right for You? (GPTQ vs. GGUF vs. AWQ)", channel: "Maarten Grootendorst", url: "https://www.youtube.com/watch?v=mNE_d-C82lI", why: "知名可视化博主对比 GPTQ/GGUF/AWQ 三大算法，4 万播放" },
          { title: "LLM Quantization Explained: GPTQ, AWQ, QLoRA, GGUF and More", channel: "Tales Of Tensors", url: "https://www.youtube.com/watch?v=WmvZwR4rKJg", why: "30 分钟深入讲解 GPTQ/AWQ 校准原理与差异" }
        ],
        bilibili: [
          { title: "【13】GPTQ、AWQ、GGUF等模型量化概念讲解", up: "LLM张老师", url: "https://www.bilibili.com/video/BV1euPkerEun", why: "2.7 万播放的量化算法概念课，覆盖 GPTQ/AWQ/GGUF" },
          { title: "模型量化选择AWQ还是GPTQ，哪个效果更好", up: "AI大模型面试实战", url: "https://www.bilibili.com/video/BV16AG767Ec2", why: "直接对比 AWQ 与 GPTQ 的效果差异与选型建议" }
        ],
        keywords: ["GPTQ和AWQ区别", "AWQ量化原理", "大模型量化算法对比"]
      }
    },
    {
      id: "quant-eval",
      name: "量化精度评估",
      en: "QUANT EVAL",
      branch: "quant",
      deps: ["gptq-awq"],
      grid: { col: 4, row: 3 },
      summary: "分数相同不等于输出相同，评估要多管齐下",
      sections: {
        principle: "量化评估的核心是回答「损失了多少」：困惑度（PPL）看整体分布偏移，KL 散度看逐 token 输出差异，下游 benchmark（如 MMLU）看任务能力。\nBenchmark 分数相同不代表逐题答案相同——聚合指标会掩盖局部行为变化。\n实证研究显示量化对长链推理（reasoning）模型的伤害大于普通问答，低比特尤其要实测。",
        formula: [
          "PPL = exp(-1/N × Σ log p(x_i))，越低越好",
          "KL(P_fp16 || Q_quant)：量化前后输出分布的散度",
          "INT4 AWQ 参考线：困惑度损失 < 1%（相对）"
        ],
        example: [
          "FP16 → INT4：PPL 相对涨幅 < 1% 可视为合格线（AWQ 级）",
          "实测案例：Q4 与 Q8 benchmark 总分相同，但逐题输出不同",
          "评估组合：PPL（整体）+ KL 散度（分布）+ 业务集实测（任务）",
          "imatrix 等方法用真实数据分布校准，降低评估与实际的偏差"
        ],
        tradeoffs: [
          "PPL 便宜快速但粗糙，下游实测权威但贵",
          "公开 benchmark 有数据污染风险，业务私有集更可信",
          "小模型对量化更敏感，大模型相对耐压，评估标准不能一刀切"
        ],
        pitfalls: [
          "只看 benchmark 总分——分数相同不代表答案相同，行为漂移要逐题看",
          "拿通用语料 PPL 评估垂直业务模型，分布不匹配导致误判"
        ]
      },
      diagram: {
        type: "flow",
        title: "量化评估三层验证",
        items: [
          ["第一层 PPL", "整体分布偏移，<1% 为合格线"],
          ["第二层 KL 散度", "逐 token 输出分布差异"],
          ["第三层 benchmark", "MMLU 等任务分数"],
          ["兜底", "业务私有集实测，防污染"],
          ["陷阱", "总分相同 ≠ 逐题答案相同"]
        ]
      },
      quiz: {
        q: "某 INT4 量化模型 MMLU 得分与 FP16 几乎相同，能否判定量化无损？",
        options: [
          "能，benchmark 就是金标准",
          "不能，聚合分数会掩盖逐题输出差异，还需 PPL/KL 散度与业务集实测交叉验证",
          "能，只要分数不降用户就无感知",
          "不能，因为 MMLU 本身不准"
        ],
        answer: 1,
        explain: "实测案例显示 Q4/Q8 可以总分相同但逐题答案不同。聚合指标是对大量样本的平均，局部行为变化被抹平；对 reasoning 等敏感场景必须看分布级指标和真实业务输出。"
      },
      resources: {
        youtube: [
          { title: "Q4 vs Q8 Quantization: Same Score, Different Answers (We Tested It)", channel: "The Local Ceiling", url: "https://www.youtube.com/watch?v=QPRh4Y6sdkc", why: "实测 Q4/Q8 量化在 benchmark 分数相同但输出不同的精度陷阱" },
          { title: "Quantization Hurts Reasoning? An Empirical Study on Quantized Reasoning Models (Apr 2025)", channel: "AI Paper Slop", url: "https://www.youtube.com/watch?v=SqUvOTTvcs4", why: "解读量化对推理模型 benchmark 掉点的实证研究论文" }
        ],
        bilibili: [
          { title: "跟着Unsloth学量化 04：量化模型质量如何评估？PPL、KL 散度与 imatrix", up: "五里墩茶社", url: "https://www.bilibili.com/video/BV1gbaR69EQN", why: "专讲量化质量评估方法：困惑度、KL 散度与 imatrix 校准" },
          { title: "大语言模型量化损失测试 fp16/int8/int4成绩对比", up: "游戏热AI", url: "https://www.bilibili.com/video/BV1RG411f7GY", why: "实测 fp16/int8/int4 三档量化的成绩掉点对比，1.4 万播放" }
        ],
        keywords: ["量化后精度掉多少", "大模型量化评测", "困惑度PPL是什么"]
      }
    },
    {
      id: "continuous-batching",
      name: "Continuous Batching",
      en: "CONTINUOUS BATCHING",
      branch: "serve",
      deps: ["kv-cache"],
      grid: { col: 3, row: 4 },
      summary: "迭代级调度，请求随到随插、完成即走",
      sections: {
        principle: "传统 static batching 把一批请求锁死一起跑，必须等最长序列生成完才释放整批，短序列对应的算力全程空转。\nContinuous batching（Orca，OSDI 2022）把调度粒度降到每次迭代：每个 decode step 后检查，完成的请求退出、新请求插入。\n配合 KV cache 按需分配，GPU 几乎不空转，吞吐相比静态批可提升一个数量级。",
        formula: [
          "static batching：批次时长 = max(各序列生成长度)",
          "continuous batching：每次迭代重新组批",
          "GPU 空转率 ≈ 1 - 有效序列数 ÷ 批大小（静态批的浪费来源）"
        ],
        example: [
          "静态批 8 条请求：7 条 50 token、1 条 500 token",
          "批时长被 500 那条拉满，7 条完成后 GPU 有 7/8 的槽位空转",
          "continuous batching：7 条一走即插入新请求，槽位始终填满",
          "decode 每步读权重一次（如 70B FP16 140 GB），batch 越满摊得越薄"
        ],
        tradeoffs: [
          "调度频率越高利用率越高，但每次重组批有调度开销",
          "batch 越大吞吐越高，但单请求 TPOT 变差，延迟敏感场景要限批",
          "需要 KV cache 分页管理配合，否则显存碎片吃掉收益"
        ],
        pitfalls: [
          "以为提升来自算法——本质是消除「等最慢序列」的 GPU 空转",
          "无视延迟盲目堆 batch，吞吐上去了但 P99 延迟崩了"
        ]
      },
      diagram: {
        anim: "batchFlow",
        type: "loop",
        title: "Continuous Batching 迭代循环",
        items: [
          ["检查完成请求", "每个 decode step 后检查"],
          ["踢出已完成", "释放槽位与 KV"],
          ["插入新请求", "随到随插，槽位填满"],
          ["全体前进一步", "重组批次继续 decode"]
        ]
      },
      quiz: {
        q: "Continuous batching 相比 static batching 提升吞吐的根本原因是？",
        options: [
          "用了更快的注意力算法",
          "调度粒度降到每次迭代，消除「等最长序列」造成的 GPU 空转",
          "把模型量化到了 INT4",
          "减少了权重读取次数"
        ],
        answer: 1,
        explain: "静态批的浪费在「批次被最长序列绑架」：短序列完成后槽位空转。迭代级调度让每个 decode step 后都能退出/插入请求，权重每步照读，但读的每一遍都服务更多序列。"
      },
      resources: {
        youtube: [
          { title: "OSDI '22 - Orca: A Distributed Serving System for Transformer-Based Generative Models", channel: "USENIX", url: "https://www.youtube.com/watch?v=Ob9PPLxETYU", why: "Orca 论文作者在 OSDI 的官方报告，continuous batching 的原始出处" },
          { title: "LLM Optimization Lecture 5: Continuous Batching and Piggyback Decoding", channel: "Faradawn Yang", url: "https://www.youtube.com/watch?v=tnGCPQwd7_Q", why: "26 分钟讲义式讲解 continuous batching 调度原理" }
        ],
        bilibili: [
          { title: "vLLM推理框架｜持续批处理 continuous batch 介绍", up: "AI老马啊", url: "https://www.bilibili.com/video/BV1gEVdzRETm", why: "结合 vLLM 讲 continuous batching 调度机制" },
          { title: "7.1: 连续批处理 continus-batching详解", up: "王玉蝉", url: "https://www.bilibili.com/video/BV1LuLm6iEhG", why: "38 分钟连续批处理详解课程，含与静态批处理对比" }
        ],
        keywords: ["continuous batching原理", "vLLM调度机制", "大模型推理吞吐量"]
      }
    },
    {
      id: "paged-attention",
      name: "PagedAttention",
      en: "PAGED ATTENTION",
      branch: "serve",
      deps: ["continuous-batching"],
      grid: { col: 4, row: 4 },
      summary: "KV cache 分页管理，vLLM 的核心武器",
      sections: {
        principle: "传统实现为每条序列预分配连续的最大长度 KV 显存，内部碎片（长度不确定多预留）加外部碎片（大小不一难复用）导致 60-80% 显存浪费。\nPagedAttention（vLLM，SOSP 2023）类比 OS 虚拟内存：把 KV cache 切成固定大小的 block（默认 16 tokens），逻辑连续、物理离散，用页表映射。\n按需分配 block，浪费压缩到 < 4%，省下的显存直接变成更大的 batch。",
        formula: [
          "block 大小 = 16 tokens（vLLM 默认）",
          "内部碎片 ≤ 1 个 block ≈ 平均 8 tokens/序列",
          "浪费率：传统 60-80% → PagedAttention < 4%"
        ],
        example: [
          "Llama-70B GQA 4K：每序列 KV 满配 2.7 GB",
          "传统按最大长度预留：平均长度 2K 的序列也占 4K 的位",
          "分页后按 16-token block 按需分配，2K 序列只占约一半",
          "浪费从 60-80% 降到 < 4%，等效 batch 容量数倍提升"
        ],
        tradeoffs: [
          "block 越大分配越省事但碎片越多，16 tokens 是经验折中",
          "非连续存储需要页表查询，kernel 实现复杂度上升",
          "显存利用率提升的收益要在高并发下才充分体现"
        ],
        pitfalls: [
          "以为 PagedAttention 改了注意力算法——计算本身没变，改的是显存管理",
          "把 block 理解成序列上限——block 是分配单位，序列可跨任意多 block"
        ]
      },
      diagram: {
        anim: "pagedMem",
        type: "bars",
        title: "KV cache 显存浪费率",
        items: [
          ["传统连续预分配", "浪费 60-80%"],
          ["PagedAttention", "浪费 < 4%"],
          ["分配单位", "block = 16 tokens"],
          ["类比", "OS 虚拟内存分页 + 页表"]
        ]
      },
      quiz: {
        q: "PagedAttention 能把 KV cache 显存浪费从 60-80% 压到 4% 以下，关键机制是？",
        options: [
          "对 KV 做了 INT4 量化",
          "把 KV cache 切成固定 16-token block 分页存储，按需分配而非按最大长度预留",
          "减少了 kv_heads 数量",
          "把 KV cache 放到了 CPU 内存"
        ],
        answer: 1,
        explain: "浪费的根源是「为不确定的长度按上限预留连续显存」。分页后逻辑地址连续、物理 block 按需分配，碎片只剩最后一个不满的 block（平均 8 tokens）。注意力计算本身一行没改。"
      },
      resources: {
        youtube: [
          { title: "Fast LLM Serving with vLLM and PagedAttention", channel: "Anyscale", url: "https://www.youtube.com/watch?v=5ZlavKF_98U", why: "Anyscale 官方出品的 vLLM+PagedAttention 技术分享，7.9 万播放" },
          { title: "vLLM: Easy, Fast, and Cheap LLM Serving for Everyone - Woosuk Kwon & Xiaoxuan Liu, UC Berkeley", channel: "PyTorch", url: "https://www.youtube.com/watch?v=9ih0EmcXRHE", why: "vLLM 作者在 PyTorch 官方频道讲 PagedAttention 显存分页设计" }
        ],
        bilibili: [
          { title: "怎么加快大模型推理？10分钟学懂VLLM内部原理，KV Cache，PageAttention", up: "RethinkFun", url: "https://www.bilibili.com/video/BV1kx4y1x7bu", why: "14 万播放的 vLLM 原理课，KV Cache 与 PagedAttention 讲得最透" },
          { title: "什么是PagedAttention？为什么它能提高GPU显存的使用效率？", up: "向量隐修会", url: "https://www.bilibili.com/video/BV1vKzuBmEWk", why: "专注 PagedAttention 本身，含 OS 虚拟内存类比" }
        ],
        keywords: ["PagedAttention原理", "vLLM显存管理", "KV Cache分页"]
      }
    },
    {
      id: "prefix-caching",
      name: "Prefix Caching",
      en: "PREFIX CACHING",
      branch: "serve",
      deps: ["paged-attention"],
      grid: { col: 5, row: 4 },
      summary: "共享前缀的 KV 只算一次，跨请求复用",
      sections: {
        principle: "系统 prompt、few-shot 示例、多轮对话历史在大量请求间完全重复，重复 prefill 纯属浪费。\nPrefix caching 把这些公共前缀的 KV cache 保留下来，命中时直接跳过 prefill，只算增量部分。\nSGLang RadixAttention（2024）用基数树（radix tree）组织缓存，LRU 淘汰，自动找到最长可复用前缀；vLLM 也有 automatic prefix caching。",
        formula: [
          "命中时 prefill 量 = 总 prompt - 已缓存前缀长度",
          "RadixAttention：基数树存储 + LRU 淘汰 + 最长前缀匹配",
          "省下的 TTFT ≈ 命中前缀的完整 prefill 时间"
        ],
        example: [
          "共享 system prompt 2000 tokens，70B、A100、MFU 50%",
          "未命中：prefill 2000 tokens ≈ 1.79 s",
          "命中：这 1.79 s 直接归零，只算增量部分",
          "多轮对话第 3 轮复用前两轮 KV，轮次越深省得越多"
        ],
        tradeoffs: [
          "缓存占显存，命中率低的场景是净负担",
          "前缀必须逐 token 完全一致才能命中，prompt 模板要稳定",
          "LRU 淘汰策略要在缓存容量与命中率间权衡"
        ],
        pitfalls: [
          "以为命中是模糊匹配——前缀必须严格一致，差一个 token 就截断",
          "把 prefix caching 当 KV cache 的替代品——它建立在分页 KV 管理之上"
        ]
      },
      diagram: {
        type: "tree",
        title: "RadixAttention 前缀复用",
        items: [
          ["共享 system prompt", "2000 tokens KV 只算一次"],
          ["分支 A 请求", "复用前缀 + 算增量"],
          ["分支 B 请求", "复用前缀 + 算增量"],
          ["命中收益", "省 ≈1.79 s prefill（70B/2000t/A100）"],
          ["淘汰", "LRU，容量有限"]
        ]
      },
      quiz: {
        q: "多轮对话和共享 system prompt 场景下，prefix caching 主要省掉的是哪部分开销？",
        options: [
          "decode 阶段的权重读取",
          "重复前缀的 prefill 计算及其对应的 TTFT",
          "采样阶段的 softmax 计算",
          "网络传输开销"
        ],
        answer: 1,
        explain: "公共前缀的 KV 已缓存，命中时这部分 prefill 整个跳过。对 2000-token 系统 prompt 就是约 1.79 s 的 TTFT 直接归零；decode 权重读取是每步必读的，省不掉。"
      },
      resources: {
        youtube: [
          { title: "What is Prompt Caching? Optimize LLM Latency with AI Transformers", channel: "IBM Technology", url: "https://www.youtube.com/watch?v=u57EnkQaUTY", why: "IBM 官方科普 prompt/prefix caching 降延迟省成本，11.7 万播放" },
          { title: "KV Cache and RadixAttention: How LLM Servers Avoid Redundant Computation", channel: "Clyep", url: "https://www.youtube.com/watch?v=Yh19E1wfONE", why: "专讲 SGLang RadixAttention 如何复用前缀 KV Cache，1.3 万播放" }
        ],
        bilibili: [
          { title: "SGLang高效推理｜KV 缓存复用 Radix Attention 原理介绍", up: "AI老马啊", url: "https://www.bilibili.com/video/BV18Tb2zKEA1", why: "讲 SGLang RadixAttention 前缀复用原理" },
          { title: "Prefix Cache前缀复用", up: "码出名企路", url: "https://www.bilibili.com/video/BV1dEuZ6mETR", why: "Prefix Cache 前缀复用机制的专题讲解" }
        ],
        keywords: ["前缀缓存prefix caching", "RadixAttention原理", "系统prompt复用加速"]
      }
    },
    {
      id: "chunked-prefill",
      name: "Chunked Prefill",
      en: "CHUNKED PREFILL",
      branch: "serve",
      deps: ["paged-attention"],
      grid: { col: 6, row: 4 },
      summary: "长 prompt 切块混入 decode，削平延迟尖峰",
      sections: {
        principle: "长 prompt 的 prefill 一次性占满 GPU 数秒，期间 decode 全部停摆，TPOT 出现尖峰；这就是 prefill 与 decode 的调度冲突。\nChunked prefill（Sarathi-Serve，OSDI 2024）把长 prompt 切成块，每个调度步用「若干 prefill 块 + 一批 decode 请求」拼成混合 batch。\nstall-free：decode 不再被长 prefill 卡住，TTFT 与吞吐都得到平滑。",
        formula: [
          "每步 batch = prefill 块 × k + decode 请求 × m",
          "chunk 大小固定 → 每步计算量恒定，延迟可预期",
          "块太小 → prefill 算术强度下降，效率变差"
        ],
        example: [
          "4096-token prompt 切成 512-token 块 → 8 个调度步完成 prefill",
          "每个调度步 decode 请求照常插入，TPOT 不出现秒级尖峰",
          "对照整段 prefill：70B 2000 tokens 单次 ≈ 1.79 s，期间 decode 全停",
          "Sarathi-Serve 以此在吞吐-延迟曲线上整体外推"
        ],
        tradeoffs: [
          "块大小是核心旋钮：大了削峰弱，小了 prefill 效率降",
          "TTFT 会略微拉长（切块排队），换来全系统延迟平滑",
          "与 PD 分离（DistServe 路线）是两种互补的解决思路"
        ],
        pitfalls: [
          "以为块越小越平滑越好——太小会让 prefill 掉出 compute-bound 区，吞吐反降",
          "把它当成单纯的分片执行，忽略了与 continuous batching 调度器的耦合"
        ]
      },
      diagram: {
        type: "flow",
        title: "Chunked Prefill 混合调度",
        items: [
          ["4096t prompt", "切成 8 × 512t 块"],
          ["Step 1", "prefill 块1 + decode 批次"],
          ["Step 2", "prefill 块2 + decode 批次"],
          ["…", "decode 全程不停摆"],
          ["效果", "TTFT/TPOT 尖峰被削平（Sarathi-Serve, OSDI'24）"]
        ]
      },
      quiz: {
        q: "Chunked prefill 为什么能同时改善 TTFT 尖峰和 decode 卡顿？",
        options: [
          "它减少了 prefill 的总计算量",
          "长 prompt 切块后与 decode 混合调度，每步计算量恒定，decode 不再被长 prefill 整体阻塞",
          "它把 prefill 放到了另一张卡上",
          "它跳过了 KV cache 的写入"
        ],
        answer: 1,
        explain: "总计算量没变，变的是排布：整段 prefill 会让 GPU 被独占数秒（70B/2000t 约 1.79s），期间 decode 全停；切块混入后每步都有 decode 位置，延迟曲线被拉平。但块太小会让 prefill 效率下降，存在最优块大小。"
      },
      resources: {
        youtube: [
          { title: "OSDI '24 - Taming Throughput-Latency Tradeoff in LLM Inference with Sarathi-Serve", channel: "USENIX", url: "https://www.youtube.com/watch?v=S8rq3pYboZY", why: "Sarathi-Serve 论文作者在 OSDI'24 的官方演讲，chunked prefill 的源头工作，讲吞吐与 TTFT 权衡" }
        ],
        bilibili: [
          { title: "AI INFRA 学习 05 - Chunked-Prefills 分块预填充", up: "Se7en的架构笔记", url: "https://www.bilibili.com/video/BV1f2uczGEqt", why: "67 分钟系统讲解 chunked prefill 原理与 vLLM 实现，AI infra 系列口碑好" },
          { title: "[LLM服务] Chunked Prefills 与 Prefill-Decoding 分离的内在逻辑", up: "我是小小升", url: "https://www.bilibili.com/video/BV1hy94YKEun", why: "把 chunked prefill 与 PD 分离的动机串起来讲，适合建立全局认知" }
        ],
        keywords: ["chunked prefill 分块预填充", "长prompt推理优化", "vLLM 调度原理"]
      }
    },
    {
      id: "speculative-decoding",
      name: "投机解码",
      en: "SPECULATIVE DECODING",
      branch: "serve",
      deps: ["prefill-decode"],
      grid: { col: 5, row: 3 },
      summary: "小模型猜、大模型验，一次前向出多个 token",
      sections: {
        principle: "Draft-verify：用小 draft 模型自回归猜 γ 个 token，大模型一次并行前向验证全部 γ 个，接受最长吻合前缀，拒绝处从大模型分布修正采样。\n关键在于无损：修正采样保证输出分布与大模型完全一致，不是近似。\nLeviathan et al. 与 Chen et al.（2023）独立提出；后续 Medusa（2024）用多头预测、EAGLE（2024）在特征级自回归 draft，进一步抬高接受率。",
        formula: [
          "接受率 α、步长 γ 时，每步期望接受 token 数：",
          "E = (1 - α^(γ+1)) / (1 - α)",
          "加速比 ≈ E ÷ (1 + draft 成本占比)"
        ],
        example: [
          "α = 0.7、γ = 4：E = (1 - 0.7^5) / (1 - 0.7)",
          "= (1 - 0.168) / 0.3 ≈ 2.77 token/步",
          "大模型每步读一次权重（70B FP16 = 140 GB），出 2.77 个而非 1 个",
          "扣除 draft 开销后净加速常见 2-3×，且输出分布不变"
        ],
        tradeoffs: [
          "接受率 α 决定一切：draft 越接近大模型分布收益越大",
          "γ 太大浪费验证算力、太小摊不薄开销，需要按场景调",
          "大 batch 下 GPU 本已打满，投机解码收益下降，适合中小 batch"
        ],
        pitfalls: [
          "以为输出质量会略降——数学上严格无损，分布与大模型一致",
          "以为任何时候都快——batch 很大时验证开销盖过收益，可能变慢"
        ]
      },
      diagram: {
        anim: "draftVerify",
        type: "loop",
        title: "Draft-Verify 循环",
        items: [
          ["Draft 猜 γ 个", "小模型自回归连猜 γ=4"],
          ["大模型一次 verify", "并行验证全部 γ 个"],
          ["接受前缀 +1", "接受最长吻合前缀并修正采样"],
          ["回环", "从接受的末尾继续下一轮"]
        ]
      },
      quiz: {
        q: "投机解码宣称「无损加速」，「无损」的准确含义是？",
        options: [
          "draft 模型永远不会猜错",
          "输出 token 序列的概率分布与目标大模型完全一致，draft 只负责猜、verify 保证正确性",
          "不占用额外显存",
          "不消耗额外算力"
        ],
        answer: 1,
        explain: "draft 一定会猜错，但拒绝处的修正采样在数学上保证最终分布与大模型自回归一致。所以加速不影响质量——代价是 draft 与验证的额外算力。"
      },
      resources: {
        youtube: [
          { title: "Speculative Decoding: When Two LLMs are Faster than One", channel: "Efficient NLP", url: "https://www.youtube.com/watch?v=S-8yr_RibJ4", why: "清晰讲透 draft-verify 机制、接受率与加速比的关系，高效 NLP 专题频道" },
          { title: "Faster LLMs: Accelerate Inference with Speculative Decoding", channel: "IBM Technology", url: "https://www.youtube.com/watch?v=VkWlLSTdHs8", why: "IBM 官方科普，短时讲清投机解码无损加速的核心思想，适合入门" }
        ],
        bilibili: [
          { title: "大模型凭空提速 2-3 倍，还零精度损失？投机解码讲透", up: "算法魔法师", url: "https://www.bilibili.com/video/BV1oxMy6kE2e", why: "从 draft-verify 到无损性证明讲得通俗完整，覆盖接受率与加速比" },
          { title: "[LLM 原理] 高效推理 Speculative Decoding 投机探测采样", up: "五道口纳什", url: "https://www.bilibili.com/video/BV1Vt3QzLEQ1", why: "LLM 原理系列之一，从推理瓶颈引出投机采样，推导简洁" }
        ],
        keywords: ["投机解码原理", "大模型无损加速", "草稿模型 投机采样"]
      }
    },
    {
      id: "sampling",
      name: "采样参数",
      en: "SAMPLING",
      branch: "base",
      deps: ["autoregressive"],
      grid: { col: 3, row: 1 },
      summary: "温度、top-k、top-p 与惩罚项如何塑造输出分布",
      sections: {
        principle: "模型每步输出 logits，经 softmax 变成概率分布后采样；温度 T 缩放 logits 控制分布尖锐度，T<1 更确定、T>1 更发散、T→0 近似贪心。\nTop-k 只保留概率最高的 k 个候选重归一；top-p（nucleus，Holtzman 2019）保留累积概率达 p 的最小集合，候选数随分布形状自适应。\n重复惩罚对已出现 token 的 logit 除惩罚系数（CTRL，Keskar 2019）；OpenAI 的 frequency/presence penalty 则是按出现次数/是否出现做减法。",
        formula: [
          "p_i = softmax(z_i / T) = exp(z_i/T) ÷ Σ exp(z_j/T)",
          "top-k：保留前 k 个，其余置 -∞ 后重归一",
          "top-p：保留最小集合使 Σp ≥ p",
          "重复惩罚：z_i ← z_i ÷ θ（z_i>0 时，θ 为惩罚系数）"
        ],
        example: [
          "logits = [2.0, 1.0, 0.5]",
          "T=1：exp = [7.39, 2.72, 1.65]，Σ=11.76 → p ≈ [0.629, 0.231, 0.140]",
          "T=0.5：z/T = [4, 2, 1]，exp = [54.6, 7.39, 2.72] → p ≈ [0.844, 0.114, 0.042]（更尖锐）",
          "T=2：z/T = [1, 0.5, 0.25]，exp = [2.72, 1.65, 1.28] → p ≈ [0.481, 0.292, 0.227]（更平坦）",
          "top-p=0.9：T=1 时 0.629+0.231=0.86 < 0.9，三候选全保留"
        ],
        tradeoffs: [
          "温度越低输出越稳定但越发单调，越高越有创意但易跑题",
          "top-p 自适应候选数，通常优于固定 top-k；两者可叠加",
          "惩罚项抑制重复，但过强会误伤必要的术语复现"
        ],
        pitfalls: [
          "以为 T=0 就是数学上的贪心——工程实现通常仍需显式切换 argmax",
          "采样参数只影响生成多样性，对推理速度几乎无影响，别指望它省资源"
        ]
      },
      diagram: {
        anim: "tempMorph",
        type: "bars",
        title: "温度对分布的影响（logits [2.0, 1.0, 0.5]）",
        items: [
          ["T=0.5", "[0.844, 0.114, 0.042] 尖锐"],
          ["T=1", "[0.629, 0.231, 0.140] 原分布"],
          ["T=2", "[0.481, 0.292, 0.227] 平坦"],
          ["T→0", "近似贪心 argmax"]
        ]
      },
      quiz: {
        q: "温度 T 趋近于 0 时，softmax 采样的行为趋近于？",
        options: [
          "均匀随机采样",
          "贪心取概率最大的 token（argmax）",
          "输出分布不变",
          "所有 token 概率相等"
        ],
        answer: 1,
        explain: "z_i/T 随 T→0 被无限放大，最大 logit 的 exp 值碾压其余，概率质量集中到 argmax 上。上例 T=0.5 时首位概率已从 0.629 升到 0.844，趋势清晰可见。"
      },
      resources: {
        youtube: [
          { title: "Greedy? Min-p? Beam Search? How LLMs Actually Pick Words – Decoding Strategies Explained", channel: "AI Coffee Break with Letitia", url: "https://www.youtube.com/watch?v=o-_SZ_itxeA", why: "系统讲 greedy/beam/temperature/top-p/min-p 的数学效果，动画直观" },
          { title: "LLM Prompt Engineering with Random Sampling: Temperature, Top-k, Top-p", channel: "DataMListic", url: "https://www.youtube.com/watch?v=-BBulGM6xF0", why: "用分布图演示 temperature/top-k/top-p 如何改变采样结果，实用向" }
        ],
        bilibili: [
          { title: "Temperature & Top-p：掌控大模型的创造力开关", up: "马克的技术工作坊", url: "https://www.bilibili.com/video/BV1taSFBNEG4", why: "5 万+播放，用实例演示温度与 top-p 对输出分布的影响" },
          { title: "10分钟搞明白如何设置大模型推理参数，top_k，top_p, temperature, num_beams", up: "RethinkFun", url: "https://www.bilibili.com/video/BV1nK421Y72d", why: "一次讲清采样参数与 beam search 的配合设置，含代码演示" }
        ],
        keywords: ["temperature参数讲解", "top-k top-p 采样区别", "大模型重复惩罚设置"]
      }
    },
    {
      id: "flash-attention",
      name: "FlashAttention",
      en: "FLASH ATTENTION",
      branch: "arch",
      deps: ["prefill-decode"],
      grid: { col: 5, row: 1 },
      summary: "IO 感知的精确注意力，省 HBM 读写不省 FLOPs",
      sections: {
        principle: "标准注意力的瓶颈不在算力而在访存：要把 N×N 注意力矩阵物化到 HBM，读写量 O(N²)。\nFlashAttention（Tri Dao，2022）用 tiling 把 Q/K/V 分块搬入 SRAM，配合 online softmax 在块上增量维护归一化状态，全程不写回中间矩阵。\nHBM 读写从 O(N²) 降到 O(N)，GPT-2 训练加速 2-4×；它是精确注意力，输出与标准实现一致。FA2（2023）改进并行划分与 warp 分工，FA3 面向 Hopper。",
        formula: [
          "标准注意力 HBM 读写：O(N²)（物化 N×N 矩阵）",
          "FlashAttention HBM 读写：O(N)（只读写 Q/K/V/O）",
          "online softmax：m_new = max(m_old, max(x_block))，增量 rescale 累加器",
          "FLOPs 不变，变的是访存量 → memory-bound 部分提速"
        ],
        example: [
          "N=4096：N×N 注意力矩阵 = 16.7M 元素",
          "FP16 物化需 33.5 MB/头/层，80 层多头反复写回 HBM",
          "FlashAttention 不物化该矩阵，显存占用从 O(N²) 降为 O(N)",
          "GPT-2 训练端到端加速 2-4×（Tri Dao 2022 报告）"
        ],
        tradeoffs: [
          "省显存省访存但不省 FLOPs，compute-bound 场景收益有限",
          "kernel 实现高度硬件相关，需针对每代 GPU 重写（FA2/FA3）",
          "分块大小受 SRAM 容量约束，长序列收益更明显"
        ],
        pitfalls: [
          "以为它是近似注意力——数学输出与标准注意力一致，是精确算法",
          "以为它减少计算量——FLOPs 一个没少，省的是 HBM 读写和显存"
        ]
      },
      diagram: {
        type: "compare",
        title: "标准注意力 vs FlashAttention",
        items: [
          ["标准实现", "物化 N×N 矩阵，HBM 读写 O(N²)"],
          ["FlashAttention", "tiling + online softmax，HBM 读写 O(N)"],
          ["精度", "精确注意力，输出一致"],
          ["加速证据", "GPT-2 训练 2-4×（2022）"],
          ["演进", "FA2 并行分工（2023）→ FA3 面向 Hopper"]
        ]
      },
      quiz: {
        q: "FlashAttention 加速注意力的本质是什么？",
        options: [
          "用低秩近似替代完整注意力矩阵",
          "tiling + online softmax 避免物化 N×N 矩阵，把 HBM 读写从 O(N²) 降到 O(N)，是精确注意力",
          "把 FP16 计算降为 INT8",
          "减少了注意力的总 FLOPs"
        ],
        answer: 1,
        explain: "它的创新在 IO 感知而非数学近似：分块在 SRAM 内完成计算并增量维护 softmax 归一化，中间矩阵不落 HBM。FLOPs 不变、输出不变，省的是访存——这正好打在大模型 memory-bound 的痛点上。"
      },
      resources: {
        youtube: [
          { title: "FlashAttention - Tri Dao | Stanford MLSys #67", channel: "Stanford MLSys Seminars", url: "https://www.youtube.com/watch?v=gMOAud7hZg4", why: "作者 Tri Dao 本人在斯坦福 MLSys 研讨会的官方演讲，讲 IO-aware 与 tiling 设计动机" },
          { title: "Flash Attention derived and coded from first principles with Triton (Python)", channel: "Umar Jamil", url: "https://www.youtube.com/watch?v=zy8ChVd_oTM", why: "10 万+播放，从 online softmax 推导到 Triton 实现逐步手写，最深入的免费教程" }
        ],
        bilibili: [
          { title: "Flash Attention 为什么那么快？原理讲解", up: "RethinkFun", url: "https://www.bilibili.com/video/BV1UT421k7rA", why: "11 万+播放，IO 感知与分块计算讲得清楚，中文讲解中最受欢迎" },
          { title: "什么是FlashAttention？为什么它能大大减少显存的需要并加快速度？", up: "向量隐修会", url: "https://www.bilibili.com/video/BV1irPTzGEhG", why: "33 分钟深入讲解 tiling、online softmax 与显存节省原理" }
        ],
        keywords: ["FlashAttention原理", "注意力机制显存优化", "online softmax 分块计算"]
      }
    },
    {
      id: "moe-inference",
      name: "MoE 推理",
      en: "MOE INFERENCE",
      branch: "arch",
      deps: ["mla"],
      grid: { col: 6, row: 2 },
      summary: "成本看激活参数，显存看总参数",
      sections: {
        principle: "MoE 把 FFN 换成多个专家，router 对每个 token 做 top-k gating，只激活少数专家。\n推理成本由激活参数决定（每 token 实际过的计算量），但显存必须装下全部专家——这是 MoE 推理的核心矛盾。\n部署上常用专家并行（EP）把专家切到不同卡；router 负载不均或 capacity factor 过小时会丢弃 token，影响质量。",
        formula: [
          "每 token 计算量 ∝ 激活参数（top-k 专家之和）",
          "显存占用 ∝ 总参数（全部专家都要驻留）",
          "router：score = softmax(x·W_g)，取 top-k 加权组合"
        ],
        example: [
          "Mixtral 8x7B：总参 46.7B，8 专家 top-2，每 token 激活约 12.9B",
          "计算成本 ≈ 12.9B 稠密模型，显存要装 46.7B（FP16 ≈ 93 GB）",
          "DeepSeek-V3：671B 总参、37B 激活（配合 MLA）",
          "激活占比 12.9/46.7 ≈ 28%，这就是「变大不变慢」的来源"
        ],
        tradeoffs: [
          "用显存换计算：同样算力预算下模型容量更大，但多卡显存压力大",
          "EP 切分引入跨卡通信，专家粒度越细通信越频繁",
          "负载不均时热门专家成瓶颈，capacity factor 设小了会丢 token"
        ],
        pitfalls: [
          "拿总参数对标稠密模型速度——推理成本看的是激活参数",
          "忽略显存要装全量专家，以为 MoE 能「用小显存跑大模型」"
        ]
      },
      diagram: {
        type: "bars",
        title: "总参数 vs 激活参数（每 token）",
        items: [
          ["Mixtral 8x7B", "总 46.7B / 激活 12.9B（top-2/8）"],
          ["DeepSeek-V2", "总 236B / 激活 21B"],
          ["DeepSeek-V3", "总 671B / 激活 37B"],
          ["成本规律", "算力看激活，显存看总量"]
        ]
      },
      quiz: {
        q: "Mixtral 8x7B（总参 46.7B）的单 token 推理计算成本最接近多大的稠密模型？",
        options: [
          "46.7B，与总参数一致",
          "约 12.9B，因为 router top-2 只激活 2/8 专家",
          "7B，因为单个专家只有 7B",
          "5.8B，46.7B 除以 8"
        ],
        answer: 1,
        explain: "每 token 只过 top-2 专家的 FFN，激活参数约 12.9B，计算成本以此为准。但注意显存要装全部 46.7B——「算力看激活、显存看总量」是 MoE 推理的基本盘。"
      },
      resources: {
        youtube: [
          { title: "A Visual Guide to Mixture of Experts (MoE) in LLMs", channel: "Maarten Grootendorst", url: "https://www.youtube.com/watch?v=sOPDGQjFcuM", why: "7 万+播放，可视化讲清专家路由与负载均衡，含 Mixtral 案例" },
          { title: "Mixture of Experts: How LLMs get bigger without getting slower", channel: "Julia Turc", url: "https://www.youtube.com/watch?v=7yR5ScbK1qk", why: "直接回答激活参数 vs 总参数问题，紧扣 MoE 推理成本主题" }
        ],
        bilibili: [
          { title: "什么是混合专家模型（MoE)？", up: "AI老兵文哲", url: "https://www.bilibili.com/video/BV1vw4m1k78r", why: "5 万+播放，5 分钟讲清专家路由与稀疏激活的核心思想" },
          { title: "MoE架构：20分钟带你解析MoE混合专家模型！MoE架构深度拆解", up: "大模型研学社", url: "https://www.bilibili.com/video/BV1wPUDBYErR", why: "20 分钟系统拆解 MoE 架构与路由机制，覆盖 DeepSeek-MoE 背景" }
        ],
        keywords: ["MoE混合专家模型", "DeepSeek 专家路由", "激活参数 总参数 区别"]
      }
    },
    {
      id: "serving-sla",
      name: "服务指标与 SLA",
      en: "SERVING SLA",
      branch: "arch",
      deps: ["continuous-batching", "chunked-prefill"],
      grid: { col: 6, row: 1 },
      summary: "TTFT/TPOT/吞吐之外，Goodput 才是 SLA 的尺子",
      sections: {
        principle: "核心延迟指标：TTFT（首 token 延迟，prefill 主导）与 TPOT（逐 token 输出延迟，decode 主导），吞吐 tok/s 衡量系统产能。\nSLA 看的是尾延迟（P99）约束下的有效产能——Goodput 定义为满足 SLO 的请求吞吐，平均延迟达标不代表 SLA 达标。\nDistServe（2024）按两阶段画像差异把 prefill 与 decode 分离部署、各自扩缩容，在给定 SLO 下最大化 goodput。",
        formula: [
          "TTFT ≈ 2×N×P ÷ (算力 × MFU)（prefill 主导）",
          "TPOT ≈ 每 token 字节数 ÷ 带宽（decode 主导）",
          "Goodput = 满足 SLO 的请求吞吐（区别于总吞吐）"
        ],
        example: [
          "70B、P=2000、A100 MFU 50%：TTFT ≈ 2×70e9×2000/(312e12×0.5) ≈ 1.79 s",
          "batch=8、GQA 4K：每步读 140 + 8×2.7 ≈ 161.6 GB",
          "TPOT ≈ 161.6 ÷ 2039 ≈ 79 ms",
          "若 SLO 要求 TPOT < 100ms，则该配置达标；batch 再加大就会违约"
        ],
        tradeoffs: [
          "吞吐与延迟天然矛盾：大 batch 提吞吐、坏 TPOT",
          "PD 分离按需扩容更灵活，但多一层 KV 传输与调度复杂度",
          "SLO 定太严 goodput 骤降，要与业务体验匹配着定"
        ],
        pitfalls: [
          "用平均延迟做 SLA——长尾请求被平均掩盖，P99 才是用户体感",
          "只报总吞吐不报 goodput，超时请求也算进产能是自欺欺人"
        ]
      },
      diagram: {
        type: "flow",
        title: "从硬件到 SLA 的指标链",
        items: [
          ["Prefill", "决定 TTFT ≈ 1.79 s（70B/2000t/A100）"],
          ["Decode", "决定 TPOT ≈ 79 ms（batch=8/GQA 4K）"],
          ["吞吐 tok/s", "系统总产能"],
          ["SLO 约束", "如 P99 TPOT < 100ms"],
          ["Goodput", "满足 SLO 的有效吞吐（DistServe 优化目标）"]
        ]
      },
      quiz: {
        q: "某服务平均 TTFT 达标，但 SLA 仍频繁违约，最可能的解释是？",
        options: [
          "监控工具统计口径错了",
          "SLA 看尾延迟与 goodput，平均值会掩盖长尾请求的超时",
          "模型权重被量化导致",
          "用户网络太慢"
        ],
        answer: 1,
        explain: "平均值对长尾不敏感：90% 请求很快、10% 超时，平均照样好看。SLA 应锚定 P99 延迟与 goodput——DistServe 做 PD 分离扩缩容，优化的正是 SLO 约束下的 goodput 而非平均值。"
      },
      resources: {
        youtube: [
          { title: "DistServe: disaggregating prefill and decoding for goodput-optimized LLM inference", channel: "PyTorch", url: "https://www.youtube.com/watch?v=Bh-jlh5vlF0", why: "PyTorch 官方频道的 DistServe 论文报告，讲 SLO 约束下的 goodput 优化与容量规划" },
          { title: "LLM Latency Metrics Explained: TTFT, TPOT, ITL, E2EL (And Why They Lie)", channel: "The Agentic Enterprise", url: "https://www.youtube.com/watch?v=lEVGHBcop7c", why: "逐一拆解 TTFT/TPOT/ITL/E2EL 定义与常见误用，直接对应指标主题" }
        ],
        bilibili: [
          { title: "【大模型原理】首字延迟(TTFT) 如何极致降低？", up: "AI大模型教学", url: "https://www.bilibili.com/video/BV1wudFBkEw3", why: "围绕 TTFT 这一核心 SLA 指标讲优化手段，贴合首 token 延迟主题" },
          { title: "如何降低TTFT时间 提高用户体验实践？", up: "小工蚁创始人", url: "https://www.bilibili.com/video/BV1WPbBzKEQN", why: "从工程实践角度谈 TTFT 优化与用户体验（SLA）的关系" }
        ],
        keywords: ["TTFT TPOT 推理指标", "大模型推理吞吐 延迟", "推理服务 SLA 容量规划"]
      }
    }
  ]
};
