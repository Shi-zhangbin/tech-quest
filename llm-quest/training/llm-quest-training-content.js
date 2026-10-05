// LLM Quest 知识库 · 训练模块 27 节点（8 前置 + 19 主线） · 2026-10-03
window.LLM_QUEST_CONTENT = {
  nodes: [
    {
      id: "model-params",
      name: "模型与参数是什么",
      en: "MODEL PARAMS",
      branch: "prereq",
      deps: [],
      grid: { col: 1, row: 0 },
      summary: "模型 = 一组权重矩阵，前向就是层层 y=Wx+b",
      sections: {
        principle: "一个神经网络模型本质上是海量权重矩阵的集合：每层做一次线性变换 y = Wx + b（再加非线性激活），一层层叠起来完成从输入到输出的映射。\n「7B」指模型有约 70 亿个参数（权重 + 偏置的标量总数）；FP16 存储下每个参数占 2 字节。\n这些数字不是人工设定的，而是训练从数据里「学」出来的——训练模块要回答的第一个问题就是：参数是怎么被算出来的。",
        formula: [
          "单层前向：y = Wx + b（W 为权重矩阵）",
          "参数量 N = 所有矩阵元素之和；「7B」≈ 7 × 10^9",
          "FP16：每参数 2 字节 → 7B 权重 ≈ 14 GB"
        ],
        example: [
          "Llama-2-7B：70 亿参数，FP16 权重约 14 GB",
          "一个 4096×4096 的矩阵就含 1678 万个参数",
          "70B 模型 FP16 权重 ≈ 140 GB，单张 A100（80GB）放不下",
          "参数是训练产物：同架构随机初始化时一无所知，训完才「会」语言"
        ],
        tradeoffs: [
          "参数越多容量越大，但训练数据、算力与显存成本同步膨胀",
          "FP16 比 FP32 省一半显存带宽，精度略降，已是训练推理的默认基线",
          "参数量是估算一切成本的第一变量：显存按字节乘，算力按 2N 乘"
        ],
        pitfalls: [
          "把「7B」当精确值——型号名是约数，Llama-2-7B 实算约 67 亿",
          "以为参数里存的是规则——它是数据分布的统计压缩，训练前全是随机数"
        ]
      },
      diagram: {
        type: "flow",
        title: "模型 = 权重矩阵的堆叠",
        items: [
          ["输入向量 x", "token 经 embedding 查表而来"],
          ["y = Wx + b", "线性变换 + 非线性激活"],
          ["× 几十层", "层层变换，信息逐层抽象"],
          ["输出", "下一个 token 的打分"],
          ["规模", "7B ≈ 70 亿参数，FP16 ≈ 14 GB"]
        ]
      },
      quiz: {
        q: "「7B 模型、FP16 存储」意味着权重大约占多少显存？",
        options: [
          "7 GB",
          "约 14 GB（70 亿 × 2 字节）",
          "约 28 GB",
          "70 GB"
        ],
        answer: 1,
        explain: "B = 10 亿，FP16 每参数 2 字节：7 × 10^9 × 2 B = 14 GB。这只是权重本体——训练的完整显存账要到 T07 再算。"
      },
      resources: {
        youtube: [
          { title: "But what is a neural network? | Deep learning chapter 1", channel: "3Blue1Brown", url: "https://www.youtube.com/watch?v=aircAruvnKk", why: "用动画讲清神经元、权重矩阵与前向传播，零基础理解「参数如何编码知识」的最佳入口" },
          { title: "The spelled-out intro to neural networks and backpropagation: building micrograd", channel: "Andrej Karpathy", url: "https://www.youtube.com/watch?v=VMj-3S1tku0", why: "手把手从零写 100 行代码建神经网络，工程背景读者能看到参数在代码里到底是什么" }
        ],
        bilibili: [
          { title: "【官方双语】深度学习之神经网络的结构 Part 1 ver 2.0", up: "3Blue1Brown", url: "https://www.bilibili.com/video/BV1bx411M7Zx", why: "3B1B 官方中文频道，神经网络结构与权重矩阵的可视化入门" },
          { title: "02 深度学习介绍【动手学深度学习v2】", up: "跟李沐学AI", url: "https://www.bilibili.com/video/BV1J54y187f9", why: "李沐课程第一讲，从工程师视角讲模型、参数与深度学习全貌" }
        ],
        keywords: ["神经网络入门", "模型参数是什么", "权重和偏置"]
      }
    },
    {
      id: "train-vs-infer",
      name: "训练 vs 推理",
      en: "TRAIN≠INFER",
      branch: "prereq",
      deps: ["model-params"],
      grid: { col: 2, row: 0 },
      summary: "训练 = 前向 + 反向 + 更新；推理只有前向",
      sections: {
        principle: "推理只做前向传播：输入进来，权重不动，算出输出就完事。\n训练多两步：前向算出预测并与答案比对得 loss，反向传播算出每个参数对 loss 的梯度，再用梯度更新参数——三步循环百万次，参数才逐渐「学会」。\n代价差三倍：训练每 token ≈ 6N FLOPs，推理只要 2N；且反向必须保存前向的全部中间激活，显存开销远超推理。",
        formula: [
          "训练每 token ≈ 6N FLOPs = 前向 2N + 反向 4N",
          "推理每 token ≈ 2N FLOPs",
          "反向需要前向激活 → 训练显存 = 权重 + 梯度 + 优化器状态 + 激活"
        ],
        example: [
          "7B 模型：推理每 token ≈ 14 GFLOPs，训练每 token ≈ 42 GFLOPs",
          "推理时权重只读不写；训练时每步都要算梯度、改权重",
          "推理只需权重 14 GB；训练 7B 模型状态就要约 112 GB（T07 细算）",
          "同一模型训练一次的钱，够推理服务跑很久——成本结构完全不同"
        ],
        tradeoffs: [
          "训练追求吞吐（每美元处理最多 token），推理追求延迟与并发",
          "反向传播换来「可学习」，代价是 3 倍 FLOPs 与数倍显存",
          "训练是低频巨额投入，推理是高频持续支出，硬件选型逻辑相反"
        ],
        pitfalls: [
          "以为训练只是「推理跑很多遍」——多了反向与参数更新两个完整阶段",
          "用推理显存估训练显存——训练的优化器状态和激活才是大头"
        ]
      },
      diagram: {
        type: "compare",
        title: "训练 vs 推理",
        items: [
          ["推理", "前向一遍，权重只读，2N FLOPs/token"],
          ["训练-前向", "算预测与 loss，激活必须留档"],
          ["训练-反向", "沿链式法则回传梯度，4N FLOPs/token"],
          ["训练-更新", "优化器按梯度改参数"],
          ["合计", "6N FLOPs/token，显存 ×8 以上"]
        ]
      },
      quiz: {
        q: "训练每 token 的计算量约 6N FLOPs，而推理只有 2N。多出来的 4N 是什么？",
        options: [
          "数据加载与预处理",
          "反向传播：梯度计算约为前向的 2 倍",
          "保存 checkpoint 的磁盘 IO",
          "优化器的超参搜索"
        ],
        answer: 1,
        explain: "反向传播沿计算图回传梯度，FLOPs 约为前向的 2 倍（4N），且必须保存前向激活——这是训练又慢又吃显存的根源。梯度怎么算出来的，见 PT03/PT04。"
      },
      resources: {
        youtube: [
          { title: "AI Training vs Inference Explained", channel: "KodeKloud", url: "https://www.youtube.com/watch?v=gZYrSZHHZns", why: "系统对比训练与推理的计算模式、成本差异与工程取舍，云计算教育头部频道" },
          { title: "Backpropagation, intuitively | Deep Learning Chapter 3", channel: "3Blue1Brown", url: "https://www.youtube.com/watch?v=Ilg3gGewQ5U", why: "直观展示训练 = 前向算损失 + 反向调参，理解训练为何比推理多一遍反向传播、贵得多" }
        ],
        bilibili: [
          { title: "一次搞懂深度学习流程，模型训练、推理，代码逐行解析", up: "图灵猫-Arwin", url: "https://www.bilibili.com/video/BV1qDa86YEkD", why: "用代码逐行走完训练→推理全流程，适合工程读者对照实现" }
        ],
        keywords: ["训练和推理的区别", "大模型推理", "前向传播反向传播"]
      }
    },
    {
      id: "gradient-descent",
      name: "梯度下降直觉",
      en: "GRAD DESCENT",
      branch: "prereq",
      deps: ["train-vs-infer"],
      grid: { col: 3, row: 0 },
      summary: "沿负梯度方向走一步，lr 决定步长",
      sections: {
        principle: "loss 是所有参数的函数，构成一个高维「地形」；梯度指向 loss 上升最快的方向，所以参数沿负梯度方向走一步，loss 就下降一点。\n步长由学习率 lr 控制：太大则一步跨过谷底来回震荡甚至发散，太小则收敛慢到不可接受。\n实践中不用全量数据算梯度，而是每次取一个 mini-batch——噪声本身带来轻度正则效果，也顺带解决了显存放不下全量数据的问题。",
        formula: [
          "更新规则：θ ← θ - lr · ∇L(θ)",
          "∇L 指向 loss 上升最快方向，故取负号",
          "mini-batch：用一批样本的梯度近似全量梯度"
        ],
        example: [
          "lr 过大：loss 曲线震荡不下降，甚至 NaN 发散",
          "lr 过小：几千步后 loss 几乎不动，训练遥遥无期",
          "batch=1 梯度噪声最大；batch 越大方向越稳但显存越贵",
          "LLM 常用峰值 lr：7B ≈ 3e-4，70B ≈ 1.5e-4——模型越大步子越小（T04 详解）"
        ],
        tradeoffs: [
          "大 lr 收敛快但不稳，小 lr 稳但慢——调度策略就是在这两者间随时间权衡",
          "mini-batch 的噪声意外有益：帮模型跳出尖锐的局部极小",
          "batch 越大梯度估计越准，但单步显存与时间成本线性上升"
        ],
        pitfalls: [
          "把 lr 当固定常数——现代训练几乎全部配合 warmup 与衰减调度（见 T04）",
          "以为梯度指向「最优解」——它只指向局部最陡方向，高维地形里充满鞍点"
        ]
      },
      diagram: {
        type: "loop",
        anim: "gdCurve",
        title: "梯度下降的循环",
        items: [
          ["算梯度 ∇L", "当前点最陡上升方向"],
          ["沿负梯度走一步", "θ ← θ - lr·∇L"],
          ["重算 loss", "新位置的高度"],
          ["回环", "直到 loss 不再下降"]
        ]
      },
      quiz: {
        q: "梯度下降中 lr 设置过大最可能观察到什么现象？",
        options: [
          "loss 缓慢但稳定下降",
          "loss 震荡甚至发散成 NaN",
          "显存占用翻倍",
          "梯度变成零"
        ],
        answer: 1,
        explain: "lr 过大时一步跨过谷底，loss 来回震荡甚至发散；lr 过小则是收敛慢。工程上 lr 从不拍脑袋固定——T04 的 warmup + cosine 调度就是为此而生。"
      },
      resources: {
        youtube: [
          { title: "Gradient descent, how neural networks learn | Deep Learning Chapter 2", channel: "3Blue1Brown", url: "https://www.youtube.com/watch?v=IHZwWFHWa-w", why: "损失曲面上「下山」的经典可视化，梯度下降直觉的标准教材" },
          { title: "Gradient Descent, Step-by-Step", channel: "StatQuest with Josh Starmer", url: "https://www.youtube.com/watch?v=sDv4f4s2SB8", why: "一步步手算梯度下降，把学习率过大/过小的后果算给你看" }
        ],
        bilibili: [
          { title: "【官方双语】深度学习之梯度下降法 Part 2 ver 0.9 beta", up: "3Blue1Brown", url: "https://www.bilibili.com/video/BV1Ux411j7ri", why: "3B1B 官方中文版梯度下降，与 YouTube 第 2 章同源" },
          { title: "72 优化算法【动手学深度学习v2】", up: "跟李沐学AI", url: "https://www.bilibili.com/video/BV1bP4y1p7Gq", why: "李沐系统讲 SGD、mini-batch 与动量等优化算法，衔接工程实践" }
        ],
        keywords: ["梯度下降", "学习率", "损失函数"]
      }
    },
    {
      id: "chain-rule",
      name: "链式法则入门",
      en: "CHAIN RULE",
      branch: "prereq",
      deps: ["gradient-descent"],
      grid: { col: 4, row: 0 },
      summary: "dL/dx = dL/dy · dy/dx，反向一遍算出全部梯度",
      sections: {
        principle: "网络是函数的复合：x → … → y → L。链式法则说 dL/dx = dL/dy · dy/dx——局部导数沿链路连乘，就能得到 loss 对任意深参数的梯度。\n计算图把这个过程工程化：前向时每个节点记下自己的局部梯度，反向从 loss 出发走一遍图，沿途连乘，所有参数的梯度一次到手。\n代价是反向 FLOPs ≈ 2× 前向，且前向激活必须留到反向用完——「训练每 token 6N」里的 4N 就是这么来的。",
        formula: [
          "链式法则：dL/dx = dL/dy · dy/dx",
          "计算图：节点存局部梯度，反向连乘回传",
          "反向 FLOPs ≈ 2 × 前向 FLOPs"
        ],
        example: [
          "y = Wx：dL/dW = dL/dy · x^T，dL/dx = W^T · dL/dy",
          "32 层网络反向一遍：从 loss 出发连乘 32 段局部梯度",
          "前向 2N + 反向 4N = 6N FLOPs/token，梯度是买来的",
          "激活不留档，反向连乘时就没有 x 可用——显存省不掉的根本原因"
        ],
        tradeoffs: [
          "反向一遍拿到全部参数梯度，比对每个参数数值扰动高效 N 倍",
          "代价是激活存储：省显存就要重算，这就是 T08 梯度检查点的动机",
          "自动微分框架把链式法则封装成 .backward()，但显存账仍要自己算"
        ],
        pitfalls: [
          "以为梯度要逐参数数值近似——链式法则解析求解，一遍反向全到手",
          "忽略连乘的数值稳定性——几十层连乘是梯度消失/爆炸的数学根源"
        ]
      },
      diagram: {
        type: "flow",
        title: "计算图上的反向传播",
        items: [
          ["前向", "x → … → y → L，节点记局部梯度"],
          ["反向起点", "dL/dL = 1"],
          ["连乘回传", "dL/dx = dL/dy · dy/dx"],
          ["终点", "所有参数的梯度一次算完"],
          ["代价", "反向 FLOPs ≈ 2× 前向"]
        ]
      },
      quiz: {
        q: "反向传播为什么能一遍就算出所有参数的梯度？",
        options: [
          "对每个参数做数值扰动取差分",
          "链式法则沿计算图连乘，从 loss 回传时每个节点复用上游梯度",
          "梯度由随机采样估计",
          "GPU 并行所以快"
        ],
        answer: 1,
        explain: "计算图每个节点存局部梯度，反向一遍连乘即得全部参数梯度，代价约 2× 前向 FLOPs。这条法则落到工程上就是 T01 的反向传播与计算图。"
      },
      resources: {
        youtube: [
          { title: "The Chain Rule, Clearly Explained!!!", channel: "StatQuest with Josh Starmer", url: "https://www.youtube.com/watch?v=wl1myxrtQHQ", why: "链式法则本身的零基础讲解，先补数学再看反向传播" },
          { title: "Backpropagation calculus | Deep Learning Chapter 4", channel: "3Blue1Brown", url: "https://www.youtube.com/watch?v=tIeHLnjs5U8", why: "把链式法则用到神经网络上，反向传播数学推导的标准可视化" }
        ],
        bilibili: [
          { title: "【官方双语/合集】微积分的本质 04 - 直观理解链式法则和乘积法则", up: "3Blue1Brown", url: "https://www.bilibili.com/video/BV1qW411N7FU?p=4", why: "3B1B 官方中文版链式法则直觉，反向传播的数学地基" },
          { title: "07 自动求导【动手学深度学习v2】", up: "跟李沐学AI", url: "https://www.bilibili.com/video/BV1KA411N7Px", why: "李沐讲计算图与自动微分，链式法则在 PyTorch 里的工程形态" }
        ],
        keywords: ["链式法则", "反向传播", "计算图"]
      }
    },
    {
      id: "data-batch-epoch",
      name: "数据与 Batch/Epoch",
      en: "DATA TERMS",
      branch: "prereq",
      deps: ["chain-rule"],
      grid: { col: 5, row: 0 },
      summary: "epoch 是全量过一遍，step 是一次参数更新",
      sections: {
        principle: "数据先切成三份：train 用来学、val 用来选超参与监控、test 只在最后验收，三者绝不能串门。\n一个 epoch = 全量训练数据过完一遍；一次 step = 用一个 batch 算梯度并更新一次参数；一个 epoch 含 样本数 ÷ batch 个 step。\n多卡时全局批量 global batch = 单卡 batch × 卡数 × 梯度累积步数——论文里说的 batch size 一般指这个全局值。",
        formula: [
          "steps/epoch = 训练样本数 ÷ batch size",
          "global batch = per-GPU batch × GPU 数 × 梯度累积步数",
          "epoch = 全量数据过一遍；step = 一次参数更新"
        ],
        example: [
          "100 万样本、batch=1000：一个 epoch = 1000 个 step",
          "单卡 batch 8、64 卡、累积 4 步：global batch = 8×64×4 = 2048",
          "大模型预训练常只跑不到 1 个 epoch——数据太多，看不完",
          "val loss 每几百 step 评一次，是监控过拟合的哨兵（PT06）"
        ],
        tradeoffs: [
          "大 global batch 梯度稳、吞吐高，但泛化略差且需要更精细的 lr 配合",
          "梯度累积用小显存凑出大 batch，代价是单步时间变长",
          "LLM 时代数据近乎无限，多 epoch 反而可能过拟合，单遍训练成主流"
        ],
        pitfalls: [
          "把 step 当 epoch——训练曲线横轴是 step，跨数量级比较前先对齐单位",
          "比较实验时对不齐 global batch——卡数不同但 global batch 相同才可比"
        ]
      },
      diagram: {
        type: "tree",
        title: "数据 → step 的层级",
        items: [
          ["数据集", "train / val / test 三份互不串门"],
          ["epoch", "全量 train 过一遍"],
          ["step", "一个 batch 算梯度 + 更新一次"],
          ["global batch", "单卡 batch × 卡数 × 累积步数"],
          ["LLM 惯例", "预训练常不足 1 个 epoch"]
        ]
      },
      quiz: {
        q: "单卡 batch=8、64 张 GPU、梯度累积 4 步，一次参数更新实际用了多少样本？",
        options: [
          "8 个",
          "512 个",
          "2048 个（8 × 64 × 4）",
          "32 个"
        ],
        answer: 2,
        explain: "global batch = per-GPU batch × GPU 数 × 梯度累积步数 = 8×64×4 = 2048。论文与训练配置里的 batch size 通常指这个全局值，对不齐就没法复现。"
      },
      resources: {
        youtube: [
          { title: "Deep Learning Interview Series #7 - Epochs Vs Batch Vs Iterations In Deep Learning", channel: "Krish Naik", url: "https://www.youtube.com/watch?v=QHj4XPIbAmo", why: "机器学习教育头部博主专门辨析 epoch / batch / iteration 三个最易混的概念" }
        ],
        bilibili: [
          { title: "08 线性回归 + 基础优化算法【动手学深度学习v2】p02 基础优化算法", up: "跟李沐学AI", url: "https://www.bilibili.com/video/BV1PX4y1g7KC?p=2", why: "李沐讲小批量随机梯度下降，batch size 与数据划分的语义讲得很清楚" }
        ],
        keywords: ["batch和epoch区别", "训练集验证集", "mini-batch"]
      }
    },
    {
      id: "overfitting",
      name: "过拟合与泛化",
      en: "OVERFIT",
      branch: "prereq",
      deps: ["data-batch-epoch"],
      grid: { col: 6, row: 0 },
      summary: "train loss↓ 而 val loss↑，就是背题不是学会",
      sections: {
        principle: "过拟合指模型把训练数据的噪声也背了下来：train loss 一路下降，val loss 却掉头向上——分数好看，换个考场就露馅。\n经典应对三件套：weight decay 惩罚过大的权重、dropout 训练时随机丢弃部分激活逼模型冗余编码、以及最本质的——更多更干净的数据。\n大模型时代形势反转：万亿 token 只训不到一个 epoch，过拟合很少见，真正的瓶颈是欠拟合与数据质量（T15 展开）。",
        formula: [
          "过拟合判据：train loss ↓ 且 val loss ↑",
          "weight decay：loss += λ·Σθ²（惩罚大权重的直觉版）",
          "dropout：训练时以概率 p 随机置零部分激活"
        ],
        example: [
          "train loss 0.5、val loss 3.0：典型背题现场",
          "小数据 + 大模型 + 多 epoch = 过拟合三要素齐全",
          "预训练 1 epoch 不到 → 过拟合罕见；SFT 小数据多 epoch → 仍需警惕",
          "val loss 回升点常是早停（early stop）或选 checkpoint 的依据"
        ],
        tradeoffs: [
          "正则化抑制过拟合但压低模型容量利用率，力度要靠 val 调",
          "dropout 在小模型时代是标配，现代 LLM 预训练反而很少用",
          "加数据是最健康的正则，但高质量数据的获取成本远高于调参"
        ],
        pitfalls: [
          "只看 train loss 下结论——不看 val 等于闭卷考试自己给自己打分",
          "把 LLM 预训练的经验套到小数据微调——后者过拟合风险真实存在"
        ]
      },
      diagram: {
        type: "bars",
        anim: "overfitCurves",
        title: "过拟合的典型信号",
        items: [
          ["train loss", "持续下降 ↓"],
          ["val loss", "先降后升 ↑"],
          ["拐点", "早停 / 选 checkpoint 的位置"],
          ["药方", "weight decay / dropout / 更多数据"],
          ["LLM 现状", "数据海量，欠拟合与质量才是主战场"]
        ]
      },
      quiz: {
        q: "训练中观察到 train loss 持续下降但 val loss 开始回升，说明什么？",
        options: [
          "学习率太小",
          "模型开始过拟合，应加强正则或早停",
          "显卡过热降频",
          "正常现象，不用管"
        ],
        answer: 1,
        explain: "train↓ val↑ 是过拟合的教科书信号：模型在背训练集噪声。应对是 weight decay、dropout、更多数据或早停。注意大模型预训练因数据海量反而少见，主战场是 T15 的数据质量。"
      },
      resources: {
        youtube: [
          { title: "Machine Learning Fundamentals: Bias and Variance", channel: "StatQuest with Josh Starmer", url: "https://www.youtube.com/watch?v=EuBBz3bI-aA", why: "用打靶图讲透偏差/方差权衡，过拟合与泛化的最佳入门" },
          { title: "Regularization Part 1: Ridge (L2) Regression", channel: "StatQuest with Josh Starmer", url: "https://www.youtube.com/watch?v=Q81RR3yKn30", why: "正则化如何抑制过拟合，从岭回归这个最简例子讲清 L2 思想" }
        ],
        bilibili: [
          { title: "11 模型选择 + 过拟合和欠拟合【动手学深度学习v2】", up: "跟李沐学AI", url: "https://www.bilibili.com/video/BV1kX4y1g7jp", why: "李沐讲 train/val 划分、过拟合欠拟合的判断与应对，课程核心一讲" },
          { title: "13 丢弃法【动手学深度学习v2】", up: "跟李沐学AI", url: "https://www.bilibili.com/video/BV1Y5411c7aY", why: "dropout 的动机、原理与代码实现，正则化手段的代表" }
        ],
        keywords: ["过拟合", "泛化能力", "dropout"]
      }
    },
    {
      id: "gpu-basics",
      name: "GPU 与并行计算",
      en: "GPU BASICS",
      branch: "prereq",
      deps: ["overfitting"],
      grid: { col: 7, row: 0 },
      summary: "数千小核专为矩阵乘而生，带宽决定喂数速度",
      sections: {
        principle: "CPU 是少量强核，擅长复杂串行逻辑；GPU 是数千个小核，擅长对海量数据做同一个操作——而神经网络的计算主体恰好是矩阵乘这种稠密并行负载。\n评估 GPU 训练能力看三个数：显存容量（装不装得下）、显存带宽（喂数快不快）、算力（FLOPS，算得快不快）。\nA100：80GB、2039 GB/s、BF16 稠密 312 TFLOPS；H100：3350 GB/s、BF16 989 TFLOPS——带宽和算力都要记。",
        formula: [
          "A100：80 GB HBM，2039 GB/s，BF16 312 TFLOPS",
          "H100：3350 GB/s，BF16 989 TFLOPS",
          "矩阵乘 [m×k]·[k×n] = 2mkn FLOPs，天然并行"
        ],
        example: [
          "7B FP16 权重 14 GB，单卡 A100（80GB）装得下推理",
          "训练 7B 模型状态约 112 GB——一张 80G 卡装不下，必须分布式",
          "H100 带宽 3350 GB/s：读一遍 140 GB 的 70B 权重理论下限 ≈ 42 ms",
          "算力 989 TFLOPS ÷ 带宽 3350 GB/s ≈ 295 FLOP/B——低于这个强度就是带宽瓶颈"
        ],
        tradeoffs: [
          "GPU 吞吐碾压 CPU，但显存昂贵，80GB 卡的价格是整机的大头",
          "H100 比 A100 算力 ×3、带宽 ×1.6，训练大模型的主流选择",
          "算力再高，带宽喂不上数也只能空转——roofline 两头都要看"
        ],
        pitfalls: [
          "只看 TFLOPS 选卡——带宽与显存容量常常先成为瓶颈",
          "以为多卡性能线性叠加——卡间通信会吃掉一部分收益（见 T09-T13）"
        ]
      },
      diagram: {
        type: "compare",
        title: "训练卡两巨头",
        items: [
          ["CPU", "少量强核，擅串行逻辑"],
          ["GPU", "数千小核，矩阵乘稠密并行"],
          ["A100", "80 GB · 2039 GB/s · 312 TFLOPS BF16"],
          ["H100", "3350 GB/s · 989 TFLOPS BF16"],
          ["选卡三问", "显存够吗？带宽够吗？算力够吗？"]
        ]
      },
      quiz: {
        q: "为什么神经网络训练主要跑在 GPU 而不是 CPU 上？",
        options: [
          "GPU 主频更高",
          "矩阵乘是稠密并行负载，GPU 数千小核正好匹配",
          "GPU 显存一定比内存大",
          "CUDA 能自动求导"
        ],
        answer: 1,
        explain: "训练主体是矩阵乘：同一操作作用于海量数据，GPU 的数千小核架构天然匹配。记住 A100（80GB/2039GB/s/312T）与 H100（3350GB/s/989T）这两组数，后面每个节点的成本账都要用。"
      },
      resources: {
        youtube: [
          { title: "CUDA Explained - Why Deep Learning uses GPUs", channel: "deeplizard", url: "https://www.youtube.com/watch?v=6stDhEA0wFQ", why: "从并行计算架构讲为什么深度学习必须用 GPU、CUDA 扮演什么角色" },
          { title: "GPUs: Explained", channel: "IBM Technology", url: "https://www.youtube.com/watch?v=LfdK-v0SbGI", why: "IBM 出品，CPU vs GPU 架构差异与显存等硬件概念的通俗科普" }
        ],
        bilibili: [
          { title: "31 深度学习硬件：CPU 和 GPU【动手学深度学习v2】", up: "跟李沐学AI", url: "https://www.bilibili.com/video/BV1TU4y1j7Wd", why: "李沐讲训练硬件：CPU/GPU 差异、显存带宽与算力，直接面向深度学习场景" }
        ],
        keywords: ["为什么训练用GPU", "CUDA是什么", "显存"]
      }
    },
    {
      id: "llm-training-map",
      name: "大模型训练全景",
      en: "TRAINING MAP",
      branch: "prereq",
      deps: ["gpu-basics"],
      grid: { col: 8, row: 0 },
      summary: "预训练 → SFT → 偏好对齐，三阶段三种成本",
      sections: {
        principle: "现代 LLM 的训练分三个阶段：预训练用万亿 token 做下一 token 预测，无标注、成本最贵，产出 base model——一个「知识渊博但不会对话」的续写器。\nSFT 用十万级高质量指令标注微调，教模型听懂指令、按对话格式回应。\n偏好对齐（RLHF/DPO）用人类偏好数据进一步调优，让回答更有用、更安全——三阶段下来才是 chat model。\n前置线到此为止：接下来基础线 T01 从反向传播开始，把「参数怎么学出来」讲到工程级深度。",
        formula: [
          "预训练：万亿 token，无标注，下一 token 预测，成本 ≈ 全部预算的大头",
          "SFT：十万级高质量指令标注",
          "偏好对齐：RLHF / DPO，人类偏好数据"
        ],
        example: [
          "base model 输入「巴黎是」→ 续写「法国的首都」，但不会回答提问",
          "chat model 经过 SFT + 对齐，听懂「请介绍一下巴黎」",
          "预训练烧掉数万 GPU·时，SFT 只需几百——成本差两个数量级",
          "Llama 开源的是 base + chat 两版，差别就在后两个阶段"
        ],
        tradeoffs: [
          "预训练决定能力上限，SFT 与对齐决定可用性——砍哪个都瘸腿",
          "SFT 数据贵精不贵多：十万条精标好过百万条脏数据",
          "对齐提升体验但可能牺牲部分能力（对齐税），强度需要权衡"
        ],
        pitfalls: [
          "把 base model 当 chat model 用——没经 SFT 的模型只会续写不会对话",
          "以为三阶段可以合并——数据形态与目标完全不同，工程上必须分开跑"
        ]
      },
      diagram: {
        type: "flow",
        title: "三阶段流水线",
        items: [
          ["预训练", "万亿 token 无标注，最贵，产出 base model"],
          ["SFT", "十万级指令标注，学会听话"],
          ["偏好对齐", "RLHF / DPO，变得好用安全"],
          ["产出", "chat model"],
          ["下一章", "T01：反向传播如何驱动这一切"]
        ]
      },
      quiz: {
        q: "base model 与 chat model 的本质区别是什么？",
        options: [
          "chat model 参数量更大",
          "chat model 在 base 之上经过 SFT 与偏好对齐，会对话而非只会续写",
          "chat model 用了不同的架构",
          "只是名字不同"
        ],
        answer: 1,
        explain: "架构与参数规模相同，差别在训练后两阶段：SFT 教指令跟随，RLHF/DPO 对齐人类偏好。预训练是三阶段中成本最高的——接下来 T01-T06 讲清它的学习机制。"
      },
      resources: {
        youtube: [
          { title: "Deep Dive into LLMs like ChatGPT", channel: "Andrej Karpathy", url: "https://www.youtube.com/watch?v=7xTGNNLPyMI", why: "Karpathy 2025 年 3.5 小时讲座，完整走预训练→SFT→RLHF 全流程，大模型训练全景的第一选择" },
          { title: "State of GPT | BRK216HFS", channel: "Microsoft Developer (Andrej Karpathy)", url: "https://www.youtube.com/watch?v=bZQun8Y4L2A", why: "著名的 GPT Assistant 训练流水线图出处，40 分钟看清四个阶段各自目标" }
        ],
        bilibili: [
          { title: "GPT，GPT-2，GPT-3 论文精读【论文精读】", up: "跟李沐学AI", url: "https://www.bilibili.com/video/BV1AF411b7xQ", why: "李沐精读 GPT 三代论文，理解预训练范式的演进；B站缺少权威的『预训练→SFT→RLHF 全景』单视频，此条覆盖预训练部分" }
        ],
        keywords: ["预训练", "SFT微调", "RLHF"]
      }
    },
    {
      id: "backprop",
      name: "反向传播与计算图",
      en: "BACKPROP",
      branch: "found",
      deps: ["chain-rule"],
      grid: { col: 1, row: 1 },
      summary: "PT04 的工程落地：框架自动求导，激活留档待反向",
      sections: {
        principle: "反向传播是链式法则在计算图上的批量执行：框架（PyTorch/JAX）前向时自动建图、记录每个算子的局部梯度规则，调用 .backward() 即从 loss 出发逆向遍历，连乘回传。\n关键点一：反向一遍即得全部参数梯度，这就是「训练 6N」中 4N 的来源。\n关键点二：反向要用前向的中间结果（激活），所以激活必须从前向结束一直留到对应反向算子执行完——这是训练显存的第四大构成（T07），也是 T05 混合精度与 T08 梯度检查点存在的理由。",
        formula: [
          "反向 FLOPs ≈ 2 × 前向 FLOPs（每个乘加对应两次反向乘加）",
          "训练每 token ≈ 6N = 前向 2N + 反向 4N",
          "激活生命周期：前向产生 → 反向对应算子用完才能释放"
        ],
        example: [
          "7B 前向 14 GFLOPs/token，反向约 28 GFLOPs，合计 ≈ 42",
          "PyTorch：loss.backward() 一行触发整张图的逆向遍历",
          "32 层网络的激活要排队等反向，层越深等待越久",
          "ddp 下反向后还要 all-reduce 梯度——反向结束就是通信起点（T09）"
        ],
        tradeoffs: [
          "自动微分省去手推梯度，但框架替你存的激活可能超出你的预期",
          "反向 2× 前向是理论下限，kernel 效率与重算会再抬高实际开销",
          "计算图动态（PyTorch）灵活易调试，静态图（XLA）可全局优化更省"
        ],
        pitfalls: [
          "以为 backward 免费——它是前向两倍的计算，且倒逼激活存储",
          "在反向前手动释放中间张量——梯度会直接算错或报缺激活"
        ]
      },
      diagram: {
        type: "loop",
        anim: "backpropNet",
        title: "训练 step 的循环旅程",
        items: [
          ["前向算 loss", "建图 + 前向，激活留档"],
          ["反向传梯度", ".backward() 连乘回传"],
          ["更新参数", "优化器改 θ（T03）"],
          ["下一个 batch", "循环直到训练结束"]
        ]
      },
      quiz: {
        q: "反向传播的 FLOPs 约为前向的 2 倍，因此训练每 token 约 6N。这个「2 倍」主要来自？",
        options: [
          "梯度要算两遍取平均",
          "每个前向乘加在反向对应两次乘加（对输入与对权重各一）",
          "框架要跑两遍前向做校验",
          "Adam 更新本身的开销"
        ],
        answer: 1,
        explain: "对 y=Wx，反向要分别算 dL/dx 与 dL/dW，各约等于前向一次的开销，合计 ≈ 2×。所以训练 = 2N + 4N = 6N。反向还强制激活留档——这引出显存线 T07/T08。"
      },
      resources: {
        youtube: [
          { title: "The spelled-out intro to neural networks and backpropagation: building micrograd", channel: "Andrej Karpathy", url: "https://www.youtube.com/watch?v=VMj-3S1tku0", why: "从零手写 autograd，把链式法则和计算图讲透，backprop 最佳入门" },
          { title: "Backpropagation, intuitively | Deep Learning Chapter 3", channel: "3Blue1Brown", url: "https://www.youtube.com/watch?v=Ilg3gGewQ5U", why: "动画直觉讲解反向传播，配套第 4 章讲链式法则微积分推导" }
        ],
        bilibili: [
          { title: "【官方双语】深度学习之反向传播算法 上/下 Part 3", up: "3Blue1Brown", url: "https://www.bilibili.com/video/BV16x411V7Qg", why: "3Blue1Brown B 站官方账号双语版反向传播，权威且有中文字幕" },
          { title: "从零构建 makemore 第四部分：成为反向传播忍者（字幕版）", up: "紫之星生", url: "https://www.bilibili.com/video/BV1SNaQ6kE4i", why: "Karpathy Backprop Ninja 中文字幕版，手动逐层推导梯度，进阶必看" }
        ],
        keywords: ["反向传播原理", "计算图与链式法则", "手推反向传播"]
      }
    },
    {
      id: "loss-ppl",
      name: "损失函数与困惑度",
      en: "LOSS/PPL",
      branch: "found",
      deps: ["backprop"],
      grid: { col: 2, row: 1 },
      summary: "交叉熵惩罚错判，ppl = exp(loss) 更直观",
      sections: {
        principle: "语言模型训练用交叉熵：对每个位置，loss = -log p(正确 token)——模型给正确 token 的概率越高，loss 越低，p=1 时 loss=0。\n困惑度 perplexity = exp(loss)：把 loss 翻译回「模型平均在多少个候选间犹豫」，loss 2.0 → ppl ≈ 7.4，即平均约 7 选 1。\n训练全程盯着的就是这条 loss 曲线——它既是优化目标，也是 T19 诊断训练健康的第一指标。",
        formula: [
          "交叉熵：loss = -log p(正确 token)",
          "perplexity = exp(loss)",
          "loss 2.0 → ppl ≈ 7.4；loss 1.0 → ppl ≈ 2.7"
        ],
        example: [
          "p(正确)=0.5 → loss ≈ 0.69；p=0.1 → loss ≈ 2.30",
          "7B 预训练后期 loss 常降到 1.8-2.2 区间，ppl ≈ 6-9",
          "随机猜测的 loss = log(vocab)：vocab 32000 → loss ≈ 10.4",
          "val loss 比 train loss 高一点点正常，差距拉大即过拟合（PT06）"
        ],
        tradeoffs: [
          "交叉熵可微且与概率直接挂钩，是序列建模的默认选择",
          "ppl 直观但随词表大小变化，跨模型比较要先对齐词表与数据",
          "loss 是平均值，单点的剧烈抖动（spike）被曲线平滑掩盖，需看细粒度（T19）"
        ],
        pitfalls: [
          "把 ppl 当准确率——ppl 7.4 是「平均 7 选 1」，不是 1/7.4 的正确率",
          "跨词表比 ppl——vocab 不同，同一水平模型的 ppl 基线就不同"
        ]
      },
      diagram: {
        type: "bars",
        title: "loss 与 ppl 换算",
        items: [
          ["随机猜测", "loss ≈ 10.4（vocab 32000）"],
          ["loss 2.0", "ppl ≈ 7.4"],
          ["loss 1.0", "ppl ≈ 2.7"],
          ["完美预测", "loss = 0，ppl = 1"],
          ["LLM 实战", "预训练后期 loss ≈ 1.8-2.2"]
        ]
      },
      quiz: {
        q: "某模型 val loss = 2.0，它的困惑度约为多少，意味着什么？",
        options: [
          "ppl = 2，二选一",
          "ppl ≈ 7.4，平均约在 7 个候选间犹豫",
          "ppl = 4，四选一",
          "ppl = 0.5，一半正确率"
        ],
        answer: 1,
        explain: "ppl = exp(loss) = e^2 ≈ 7.4，直觉是「平均在 7.4 个等概率候选中挑一个」。loss 是训练全程的仪表盘，曲线异常怎么读见 T19。"
      },
      resources: {
        youtube: [
          { title: "What is perplexity?", channel: "Hugging Face", url: "https://www.youtube.com/watch?v=NURcDHhYe98", why: "HuggingFace 官方短视频讲清 perplexity 与交叉熵的关系" },
          { title: "Neural Networks Part 6: Cross Entropy", channel: "StatQuest with Josh Starmer", url: "https://www.youtube.com/watch?v=6ArSys5qHAU", why: "StatQuest 招牌式逐步拆解交叉熵损失，直觉清晰" }
        ],
        bilibili: [
          { title: "机器学习之数学之旅-逻辑回归(二)-交叉熵与困惑度", up: "1espresso", url: "https://www.bilibili.com/video/BV1w4411x7bK", why: "从信息论一路推到交叉熵与 perplexity，数学推导完整" },
          { title: "大模型-PPL困惑度计算", up: "AI科技小站", url: "https://www.bilibili.com/video/BV1R9F8zZEeC", why: "面向大模型场景的 PPL 计算演示，短小直接" }
        ],
        keywords: ["交叉熵损失函数", "困惑度perplexity", "大模型损失函数"]
      }
    },
    {
      id: "adamw",
      name: "优化器 AdamW",
      en: "ADAMW",
      branch: "found",
      deps: ["loss-ppl"],
      grid: { col: 3, row: 1 },
      summary: "动量 + 自适应步长，代价是每参数 8B 状态",
      sections: {
        principle: "AdamW 给每个参数维护两个滑动平均：一阶动量 m（梯度的指数平均，平滑方向）与二阶矩 v（梯度平方的指数平均，自适应缩放每个参数的步长）。\n更新 = m̂ / (√v̂ + ε) 再乘 lr；梯度常年大的参数步长自动缩小，稀疏梯度参数步长放大——这是它比裸 SGD 稳的原因。\n「W」是 decoupled weight decay：权重衰减直接作用于参数本身，而不是像 L2 那样加进梯度里被 v 缩放——后者会让衰减力度被自适应步长扭曲。\n代价：m 与 v 各 FP32 4B/参数，共 8B——7B 模型仅优化器状态就占 56 GB（T07 算账）。",
        formula: [
          "m = β₁·m + (1-β₁)·g；v = β₂·v + (1-β₂)·g²",
          "θ ← θ - lr · (m̂ / (√v̂ + ε) + λ·θ)（λ 为 decoupled 衰减）",
          "LLM 常用 β = (0.9, 0.95)；优化器状态 = 8 B/参数（FP32）"
        ],
        example: [
          "7B：Adam 状态 = 7e9 × 8 B = 56 GB，是 FP16 权重的 4 倍",
          "β₂ = 0.95（而非默认 0.999）：LLM 训练更快遗忘旧梯度尺度",
          "weight decay λ 常取 0.1，与 lr 解耦后互不干扰",
          "SGD 无状态（0 B/参数），但 LLM 几乎不用——稳定性换显存"
        ],
        tradeoffs: [
          "AdamW 收敛快、对 lr 鲁棒，代价是 8 B/参数的显存税",
          "decoupled decay 让 λ 与 lr 可独立调参，Adam+L2 做不到",
          "β₂ 调小响应快但更抖，0.95 是 LLM 场景的实战共识"
        ],
        pitfalls: [
          "把 AdamW 的 weight decay 当 L2——耦合进梯度的 L2 会被 √v 缩放，效果失真",
          "低估优化器显存——很多人只算权重，忘了 8 B/参数的 Adam 状态"
        ]
      },
      diagram: {
        type: "bars",
        title: "AdamW 的显存税（7B）",
        items: [
          ["一阶动量 m", "FP32 4 B/参数 ≈ 28 GB"],
          ["二阶矩 v", "FP32 4 B/参数 ≈ 28 GB"],
          ["合计", "8 B/参数 ≈ 56 GB"],
          ["对照", "FP16 权重本体才 14 GB"],
          ["LLM 超参", "β=(0.9, 0.95)，λ≈0.1"]
        ]
      },
      quiz: {
        q: "AdamW 与 Adam+L2 的关键区别是？",
        options: [
          "AdamW 没有动量项",
          "AdamW 把权重衰减从梯度中解耦，直接作用于参数，不被二阶矩缩放",
          "AdamW 用 FP16 存状态",
          "两者完全等价，只是名字不同"
        ],
        answer: 1,
        explain: "L2 加进梯度后会被 √v̂ 缩放，衰减力度失真；AdamW 解耦后直接 λ·θ 作用于参数。记住它的显存税：8 B/参数，7B 就是 56 GB——T05 混合精度还要再加一笔。"
      },
      resources: {
        youtube: [
          { title: "AdamW - L2 Regularization vs Weight Decay", channel: "DataMListic", url: "https://www.youtube.com/watch?v=oWZbcq_figk", why: "专讲 AdamW 与 Adam+L2 的区别，解耦权重衰减讲得很清楚" },
          { title: "Optimizers - EXPLAINED!", channel: "CodeEmporium", url: "https://www.youtube.com/watch?v=mdKjMPmcWjY", why: "从 SGD/动量一路讲到 Adam/AdamW，β 参数与动量直觉好" }
        ],
        bilibili: [
          { title: "十分钟搞明白Adam和AdamW，SGD，Momentum，RMSProp", up: "RethinkFun", url: "https://www.bilibili.com/video/BV1NZ421s75D", why: "动画形式串讲优化器演化路径，终点落在 AdamW 解耦衰减" },
          { title: "5分钟讲透AdamW，从Adam的坑到解耦本质", up: "算法魔法师", url: "https://www.bilibili.com/video/BV17ff8BhE9b", why: "聚焦 Adam 权重衰减的实现坑与 AdamW 解耦本质，短小精悍" }
        ],
        keywords: ["AdamW优化器", "Adam与AdamW区别", "权重衰减解耦"]
      }
    },
    {
      id: "lr-schedule",
      name: "学习率调度",
      en: "LR SCHEDULE",
      branch: "found",
      deps: ["adamw"],
      grid: { col: 4, row: 1 },
      summary: "warmup 起步 + cosine 衰减，峰值随模型变大而变小",
      sections: {
        principle: "lr 不能一成不变：训练初期参数离最优远、梯度噪声大，直接上大 lr 会炸——先用 warmup（常见 1-2k steps）从 0 线性升到峰值。\n之后 cosine 衰减沿余弦曲线平滑降到峰值的约 10%，末期小步精调。\n峰值 lr 的经验规律：模型越大越脆弱，峰值越小——7B ≈ 3e-4，70B ≈ 1.5e-4 量级。lr 曲线与 grad clip（T06）是训练稳定性的两大保险。",
        formula: [
          "warmup：lr 从 0 线性升到峰值（1-2k steps）",
          "cosine：lr(t) = lr_min + ½(lr_max - lr_min)(1 + cos(πt/T))",
          "末期 lr ≈ 峰值 × 10%"
        ],
        example: [
          "7B 典型：warmup 2000 步 → 峰值 3e-4 → cosine 降到 3e-5",
          "70B 峰值约 1.5e-4：模型翻倍，步长减半",
          "跳过 warmup 直接峰值 lr：前期 loss spike 频发甚至发散",
          "lr 恒定不衰减：后期在最优点附近来回震荡，loss 降不下去"
        ],
        tradeoffs: [
          "cosine 平滑但需预知总步数；训练中途改计划，曲线就要重算",
          "warmup 牺牲前期速度换稳定性，步数太少等于没 warm",
          "峰值 lr 每提高一点都在赌稳定性——大模型翻车一次代价以万卡时计"
        ],
        pitfalls: [
          "小模型经验直接搬大模型——峰值 lr 必须随规模下调",
          "warmup 步数拍脑袋——太短防不住初期 spike，太长浪费训练预算"
        ]
      },
      diagram: {
        type: "bars",
        title: "lr 的一生（cosine 调度）",
        items: [
          ["0-2k steps", "warmup：0 → 峰值线性爬升"],
          ["峰值", "7B ≈ 3e-4；70B ≈ 1.5e-4"],
          ["中期", "cosine 平滑下行"],
          ["末期", "降到峰值约 10%"],
          ["配套", "T06 grad clip 共同兜底稳定性"]
        ]
      },
      quiz: {
        q: "为什么 LLM 训练开头要 warmup 而不是直接用峰值 lr？",
        options: [
          "让 GPU 预热到额定频率",
          "初期参数远离最优、梯度噪声大，大 lr 容易直接发散",
          "省电费",
          "框架强制要求"
        ],
        answer: 1,
        explain: "训练初期梯度方向最乱，直接峰值 lr 一步就可能把参数打飞。warmup 1-2k 步线性爬升，之后 cosine 衰减到峰值约 10%。峰值量级记住：7B≈3e-4，70B≈1.5e-4。"
      },
      resources: {
        youtube: [
          { title: "Learning-rate schedules: warmup, decay, cosine", channel: "Nipun Batra", url: "https://www.youtube.com/watch?v=sdRB7dRrJxQ", why: "系统讲解 warmup、decay、cosine 调度并配代码实验" },
          { title: "Learning Rate Decay (C2W2L09)", channel: "DeepLearningAI", url: "https://www.youtube.com/watch?v=QzulmoOg2JE", why: "吴恩达深度学习课程官方片段，学习率衰减经典入门" }
        ],
        bilibili: [
          { title: "【CS336-1】5.3 学习率调度：Cosine Schedule", up: "这就是小C_", url: "https://www.bilibili.com/video/BV1ZAkuB8ERB", why: "斯坦福 CS336 大模型课程中关于 cosine 学习率调度的节选" },
          { title: "Ep22.1 余弦退火学习率", up: "阡陌交通_", url: "https://www.bilibili.com/video/BV1SPDDBJErK", why: "中文讲解余弦退火调度原理与使用" }
        ],
        keywords: ["学习率warmup", "cosine余弦退火", "学习率调度策略"]
      }
    },
    {
      id: "mixed-precision",
      name: "混合精度训练",
      en: "MIXED PREC",
      branch: "found",
      deps: ["adamw"],
      grid: { col: 5, row: 1 },
      summary: "BF16 算 + FP32 存，模型状态 ≈ 16 B/参数",
      sections: {
        principle: "混合精度让计算与存储分离：前向与梯度用 BF16（2 B/参数，快且省带宽），同时保留一份 FP32 master weights（4 B/参数）做高精度累积更新，优化器状态也是 FP32。\n为什么选 BF16 而非 FP16：BF16 指数位与 FP32 相同、动态范围一致，不会溢出，无需 loss scaling；FP16 动态范围小，必须配 loss scaling 防梯度下溢。\n总账：2（BF16 权重）+ 4（FP32 master）+ 2（BF16 梯度）+ 8（AdamW FP32 状态）= 16 B/参数——这就是 T07「模型状态 112 GB」的出处。",
        formula: [
          "模型状态 = 2 + 4 + 2 + 8 = 16 B/参数",
          "BF16：8 位指数（同 FP32）+ 7 位尾数 → 免 loss scaling",
          "FP16：5 位指数 → 需 loss scaling 防下溢"
        ],
        example: [
          "7B：16 B × 7e9 = 112 GB 模型状态（不含激活）",
          "权重更新在 FP32 master 上做，更新完再转回 BF16 前向用",
          "FP16 路线：loss 乘一个大系数再反向，防梯度变 0，但调参麻烦",
          "A100/H100 的 BF16 Tensor Core 算力 312/989 TFLOPS，与 FP16 相同"
        ],
        tradeoffs: [
          "BF16 省一半权重/梯度存储与带宽，尾数精度却只剩 7 位",
          "FP32 master + 优化器状态占 12 B/参数，是精度稳定的代价",
          "FP16 + loss scaling 也能用，但 scaling 系数调不好就溢出（T19 spike 成因之一）"
        ],
        pitfalls: [
          "全 BF16 训练不保留 FP32 master——小更新量被舍入吞掉，模型不收敛",
          "以为混合精度省显存——16 B/参数比纯 FP32（16 B）持平，省的是带宽与速度"
        ]
      },
      diagram: {
        type: "bars",
        anim: "precisionBits",
        title: "每参数 16 字节的去向",
        items: [
          ["BF16 权重", "2 B（前向/反向计算用）"],
          ["FP32 master", "4 B（高精度累积更新）"],
          ["BF16 梯度", "2 B"],
          ["AdamW 状态", "8 B（m + v，FP32）"],
          ["合计", "16 B/参数 → 7B = 112 GB"]
        ]
      },
      quiz: {
        q: "为什么 LLM 混合精度训练普遍选 BF16 而不是 FP16？",
        options: [
          "BF16 尾数更长更精确",
          "BF16 动态范围与 FP32 相同，不会溢出，无需 loss scaling",
          "BF16 占用只有 1 字节",
          "FP16 不支持矩阵乘"
        ],
        answer: 1,
        explain: "BF16 用 8 位指数换与 FP32 一致的动态范围，代价是尾数只有 7 位；FP16 动态范围小，梯度易下溢必须配 loss scaling。记住 16 B/参数的总账：2+4+2+8，T07 用它算 7B 的 112 GB。"
      },
      resources: {
        youtube: [
          { title: "Mixed Precision Training | Explanation and PyTorch Implementation", channel: "ExplainingAI", url: "https://www.youtube.com/watch?v=hHpC9Sywh4U", why: "原理加 PyTorch 实现，覆盖 loss scaling 完整流程" },
          { title: "Data Types Explained: FP32 vs FP16 vs BF16 in Deep Learning", channel: "Ready Tensor", url: "https://www.youtube.com/watch?v=oOYUS56pcwA", why: "FP32/FP16/BF16 数值格式对比，理解 BF16 为何成为主流" }
        ],
        bilibili: [
          { title: "基础篇：混合精度训练 FP16、BF16 有什么区别？", up: "安逸_i", url: "https://www.bilibili.com/video/BV1mMTM6sEQt", why: "中文讲混合精度训练与 FP16/BF16 差异，入门友好" },
          { title: "大模型的数值精度(BF16,F16,F32)和混合精度训练法", up: "卢菁博士", url: "https://www.bilibili.com/video/BV1Re411H78u", why: "北大卢菁博士授课，面向大模型训练的数值精度与 AMP 实践" }
        ],
        keywords: ["混合精度训练", "BF16和FP16区别", "loss scaling原理"]
      }
    },
    {
      id: "grad-clip",
      name: "梯度裁剪与稳定性",
      en: "GRAD CLIP",
      branch: "found",
      deps: ["lr-schedule"],
      grid: { col: 6, row: 1 },
      summary: "global norm 超阈值就整体缩放，τ=1.0 是标配",
      sections: {
        principle: "梯度裁剪不逐个参数动手，而是先算全体参数的 global norm（所有梯度拼成一个向量的 L2 范数），超过阈值 τ 就整体等比缩小——方向不变，步长压回安全区。\nLLM 训练 τ=1.0 几乎是行业标准；它是防 loss spike 炸掉训练的第一道保险：一个坏 batch 产生的异常大梯度，裁掉就当没发生过。\n工程上要全程监控 grad norm 曲线：偶尔触碰 τ 正常，持续攀升是发散前兆（T19 详解读图）。",
        formula: [
          "global norm = √(Σ_i g_i²)（全体参数梯度拼起来的 L2）",
          "若 norm > τ：g ← g × τ / norm",
          "LLM 标配 τ = 1.0"
        ],
        example: [
          "某 step global norm = 3.0，τ=1.0 → 全部梯度 × 1/3",
          "坏数据 batch 造成 norm 瞬时冲到几十——裁剪后 loss 无感",
          "grad norm 从 0.5 缓升到 2.0 持续几百步：lr 或数据有问题",
          "裁剪只改幅度不改方向：等比缩放保持各参数相对更新比例"
        ],
        tradeoffs: [
          "τ 太小会过度压制正常更新、拖慢收敛；太大则防不住 spike",
          "global norm 要聚合全部参数梯度，多卡下需一次额外 all-reduce",
          "裁剪治标的另一面：频繁触发说明 lr/数据/精度有根因要查（T19）"
        ],
        pitfalls: [
          "逐参数裁剪——破坏参数间相对比例，正规做法是 global norm 整体缩放",
          "只看 loss 不看 grad norm——norm 持续攀升往往先于 loss 发散出现"
        ]
      },
      diagram: {
        type: "flow",
        title: "梯度裁剪三步",
        items: [
          ["算 global norm", "全体梯度拼向量的 L2 范数"],
          ["比对 τ=1.0", "norm ≤ τ 则不动"],
          ["超阈值", "全体梯度 × τ/norm，方向不变"],
          ["监控", "grad norm 曲线持续攀升 = 发散前兆"],
          ["下集", "T19：spike 与发散的完整诊断手册"]
        ]
      },
      quiz: {
        q: "梯度裁剪的 global norm 做法与逐参数裁剪相比，优势在于？",
        options: [
          "计算量更小",
          "等比缩放保持梯度方向，不打乱参数间的相对更新比例",
          "不需要阈值",
          "能提升模型精度"
        ],
        answer: 1,
        explain: "逐参数裁剪会各砍各的、扭曲更新方向；global norm 超 τ 时全体梯度同乘 τ/norm，方向保留。LLM 标配 τ=1.0，grad norm 曲线是 T19 诊断发散前兆的关键信号。"
      },
      resources: {
        youtube: [
          { title: "Fixing Unstable Gradient Descent: Momentum and Gradient Clipping in Deep Learning", channel: "Data Santa", url: "https://www.youtube.com/watch?v=V60ylfHqTe8", why: "从训练不稳定现象切入讲梯度裁剪的动机与做法" },
          { title: "Managing Exploding Gradients with Gradient Clipping", channel: "Lightning AI", url: "https://www.youtube.com/watch?v=9rZ4dUMwB2g", why: "PyTorch Lightning 官方讲梯度爆炸与 grad norm 裁剪实践" }
        ],
        bilibili: [
          { title: "梯度裁剪", up: "AI编程杰克", url: "https://www.bilibili.com/video/BV1T2421u78w", why: "中文专讲梯度裁剪原理与代码实现" },
          { title: "【CS336-1】5.4 梯度裁剪 (Gradient Clipping)", up: "这就是小C_", url: "https://www.bilibili.com/video/BV1TFk7BvEqQ", why: "斯坦福 CS336 大模型课程梯度裁剪节选，工业界视角" }
        ],
        keywords: ["梯度裁剪gradient clipping", "梯度爆炸怎么办", "loss spike训练稳定性"]
      }
    },
    {
      id: "train-memory",
      name: "训练显存构成",
      en: "MEMORY MAP",
      branch: "mem",
      deps: ["mixed-precision"],
      grid: { col: 1, row: 2 },
      summary: "权重 + 梯度 + 优化器状态 + 激活，7B ≈ 112 GB 起步",
      sections: {
        principle: "训练显存四大件：权重、梯度、优化器状态（这三样合称模型状态，混合精度下 16 B/参数）、以及反向传播必须留档的激活。\n7B 模型：16 B × 7e9 = 112 GB 模型状态——还没算激活，就已超过单张 A100 的 80 GB，这就是 7B 全参训练必须多卡的根本原因。\n激活随 batch 与序列长度线性增长：无 checkpoint 时约 34 × d_model 字节/token/层（Megatron 论文近似），大 batch 长序列下能再占几十 GB——T08 梯度检查点专门砍它。",
        formula: [
          "模型状态 = 16 B/参数（2 权重 + 4 master + 2 梯度 + 8 Adam）",
          "激活 ≈ 34 × d_model 字节/token/层（无 checkpoint，Megatron 近似）",
          "总显存 = 模型状态 + 激活 × batch × seq × 层数"
        ],
        example: [
          "7B 模型状态 112 GB > A100 单卡 80 GB → 必须分布式",
          "Llama-2-7B（d=4096）：激活 ≈ 34×4096 ≈ 139 KB/token/层",
          "batch 4096 token × 32 层 ≈ 18 GB 激活（无 checkpoint）",
          "70B：模型状态 1.12 TB——ZeRO/并行存在的全部理由（T10-T13）"
        ],
        tradeoffs: [
          "模型状态是硬开销改不了（除非 ZeRO 切分），激活是软开销可用重算换",
          "batch/seq 越大激活越贵，但吞吐越高——显存是吞吐的预算约束",
          "16 B/参数基于 BF16+FP32 master；纯 FP32 路线也是 16 B 但带宽翻倍"
        ],
        pitfalls: [
          "只算权重 14 GB 就说 7B 能单卡训——模型状态是它的 8 倍",
          "忽略激活随 batch×seq 线性膨胀——OOM 常在加大 batch 后才出现"
        ]
      },
      diagram: {
        type: "bars",
        title: "7B 混合精度训练显存账",
        items: [
          ["BF16 权重", "14 GB"],
          ["FP32 master", "28 GB"],
          ["BF16 梯度", "14 GB"],
          ["AdamW 状态", "56 GB"],
          ["模型状态小计", "112 GB > 单卡 80 GB"],
          ["激活", "再 + 几十 GB（随 batch×seq）"]
        ]
      },
      quiz: {
        q: "混合精度训练 7B 模型，不含激活的模型状态约为多少？",
        options: [
          "14 GB（只有权重）",
          "56 GB",
          "112 GB（16 B/参数 × 7e9）",
          "224 GB"
        ],
        answer: 2,
        explain: "2+4+2+8 = 16 B/参数 × 7e9 = 112 GB，已超过单张 A100 80 GB——这还没算激活。装不下怎么办？并行线 T09-T13 就是一整套答案。"
      },
      resources: {
        youtube: [
          { title: "Why Full Fine-Tuning a 7B LLM Can Need ~158 GB | GPU VRAM Explained", channel: "Ankit Wahane", url: "https://www.youtube.com/watch?v=FXf_PxfqkEc", why: "逐项拆解参数/梯度/优化器状态/激活的显存账，直击本知识点" },
          { title: "Training LLMs at Scale #1: 7B Model Needs 112GB, Your GPU Only Has 80", channel: "Papers by Hand", url: "https://www.youtube.com/watch?v=TO23OYSFhtk", why: "用纸笔推导大模型训练显存构成的系列第一集" }
        ],
        bilibili: [
          { title: "五、大模型显存占用与算力计算", up: "Dr_余", url: "https://www.bilibili.com/video/BV1qG8b6QEBv", why: "中文系统课讲大模型训练显存占用与算力的定量计算" },
          { title: "大模型训练过程中激活值占用显存 模型显存分析", up: "Ray很好奇", url: "https://www.bilibili.com/video/BV1qhMtz5E21", why: "专注激活值显存分析，补齐显存构成中最容易被忽略的一块" }
        ],
        keywords: ["大模型训练显存计算", "显存占用参数梯度优化器", "训练7B模型要多少显存"]
      }
    },
    {
      id: "grad-checkpoint",
      name: "梯度检查点",
      en: "CHECKPOINT",
      branch: "mem",
      deps: ["train-memory"],
      grid: { col: 2, row: 2 },
      summary: "只存层边界激活，反向时重算，+30-40% 计算换显存",
      sections: {
        principle: "T07 里激活是显存的弹性大头。梯度检查点（activation checkpointing）的思路：反向需要激活，那就别全存——只保留每层边界的输入激活，反向要用到层内中间值时，从边界出发把前向重算一遍。\n激活占用从 ≈ 34 × d_model 字节/token/层 降到 ≈ 4 × d_model 字节/token/层（只剩层边界），压缩近 8 倍。\n代价是重算前向：总计算开销 +30-40%。显存与计算的互换，是系统优化的永恒主题。",
        formula: [
          "无 checkpoint：激活 ≈ 34 × d_model B/token/层",
          "有 checkpoint：≈ 4 × d_model B/token/层（只存层边界）",
          "代价：反向时重算前向，总计算 +30-40%"
        ],
        example: [
          "Llama-2-7B（d=4096）：激活从 139 KB → 16 KB/token/层",
          "batch 4096 token × 32 层：18 GB → 约 2 GB",
          "训练吞吐因此降约 1/4——用时间换回了大 batch 的资格",
          "PyTorch 一行：torch.utils.checkpoint.checkpoint(layer, x)"
        ],
        tradeoffs: [
          "显存紧时必开；显存宽裕时关掉白捡 30% 速度",
          "全量 checkpoint 最省，也可选择性只 checkpoint FFN 等大头子层",
          "重算与 FlashAttention 等 kernel 有交互，实际开销以实测为准"
        ],
        pitfalls: [
          "以为免费——+30-40% 计算是真金白银的 GPU·时",
          "开了 checkpoint 仍 OOM：模型状态（112 GB）它管不了，得靠 ZeRO（T10）"
        ]
      },
      diagram: {
        type: "compare",
        title: "重算换显存",
        items: [
          ["无 checkpoint", "全部激活留档：34×d_model B/token/层"],
          ["有 checkpoint", "只存层边界：≈4×d_model B/token/层"],
          ["反向时", "从边界重算前向，得到中间激活"],
          ["收益", "激活显存 ÷8 左右"],
          ["代价", "计算 +30-40%"]
        ]
      },
      quiz: {
        q: "梯度检查点省显存的本质机制是？",
        options: [
          "把激活量化到 INT8",
          "只存层边界激活，反向时从边界重算前向获得中间激活",
          "把激活转移到 CPU 内存",
          "减少网络层数"
        ],
        answer: 1,
        explain: "激活从 34×d_model 降到 4×d_model 字节/token/层，代价是反向重算前向、计算 +30-40%。它只解决激活，模型状态的大头要靠 T10 ZeRO 切分。"
      },
      resources: {
        youtube: [
          { title: "Lightning Talk: New Activation Checkpointing APIs in PyTorch", channel: "PyTorch", url: "https://www.youtube.com/watch?v=v3gsrJtGLiA", why: "PyTorch 官方讲 activation checkpointing API 的设计与用法" },
          { title: "Backpropagation Doesn't Need to Store Everything", channel: "DataMListic", url: "https://www.youtube.com/watch?v=WoSPMMhZId4", why: "讲清重算换显存的核心思想：反向传播不必保存全部激活" }
        ],
        bilibili: [
          { title: "【Pytorch训练技巧】激活值检查点 Activation Checkpoint", up: "小鱼儿at青岛", url: "https://www.bilibili.com/video/BV1s7VKzGEMH", why: "中文实操向讲解 PyTorch 激活值检查点的使用" }
        ],
        keywords: ["梯度检查点", "activation checkpointing", "重计算省显存"]
      }
    },
    {
      id: "pretrain-data",
      name: "预训练数据工程",
      en: "DATA ENG",
      branch: "align",
      deps: ["llm-training-map"],
      grid: { col: 4, row: 2 },
      summary: "Chinchilla：token ≈ 20× 参数；配比与清洗定上限",
      sections: {
        principle: "预训练效果的一半在数据。Chinchilla 缩放律给出计算最优配比：训练 token 数 ≈ 20 × 参数量——7B 模型约需 1400 亿 token，70B 约 1.4 万亿。\n数据工程三板斧：配比（英文/中文/代码/数学的比例直接影响能力分布）、去重（重复数据既浪费算力又助长记忆）、质量过滤（垃圾进垃圾出）。\nPT06 说过大模型时代过拟合罕见——正因为数据管够，瓶颈转移到了数据质量本身。",
        formula: [
          "Chinchilla：最优 token 数 D ≈ 20 × N（参数量）",
          "7B → ≈1400 亿 token；70B → ≈1.4 万亿 token",
          "训练算力 C = 6ND（T18 展开）"
        ],
        example: [
          "Llama-2-7B 训了 2T token：远超 Chinchilla 最优，为小模型换推理便宜",
          "代码数据占比上调，数学与推理能力明显受益",
          "去重后同样算力下 loss 更低：重复 token 的边际收益趋零",
          "网页原始爬取 44TB，过滤后可用的高质量文本可能只剩个位数 TB"
        ],
        tradeoffs: [
          "超过 Chinchilla 比例多训（如 7B 训 2T）训练贵但推理部署便宜",
          "高质量数据稀缺且贵，合成数据补充但有模型自噬风险",
          "配比调整零算力成本却影响巨大，是性价比最高的调优手段"
        ],
        pitfalls: [
          "只堆 token 数量不管质量——脏数据让 loss 降了能力没涨",
          "训练后才发现配比失衡——重训成本以万卡时计，配比要事前验证"
        ]
      },
      diagram: {
        type: "flow",
        title: "预训练数据流水线",
        items: [
          ["爬取", "网页/书籍/代码，原始几十 TB"],
          ["过滤", "质量分类器 + 规则清洗"],
          ["去重", "文档级 + 段落级"],
          ["配比", "英文/中文/代码按比例混合"],
          ["规模", "Chinchilla：token ≈ 20× 参数"]
        ]
      },
      quiz: {
        q: "按 Chinchilla 缩放律，70B 模型的计算最优训练 token 量约为？",
        options: [
          "700 亿 token",
          "1.4 万亿 token（20 × 70B）",
          "14 万亿 token",
          "70 万亿 token"
        ],
        answer: 1,
        explain: "D ≈ 20N：20 × 7e10 = 1.4e12 = 1.4 万亿 token。注意 Llama-2-7B 训 2T 是「超比例」策略——训练更贵，换来的是部署推理更便宜的小模型。数据备好，T16 讲 SFT 怎么微调。"
      },
      resources: {
        youtube: [
          { title: "Chinchilla Explained: Compute-Optimal Massive Language Models", channel: "Edan Meyer", url: "https://www.youtube.com/watch?v=PZXN7jm9IC0", why: "Chinchilla 缩放律图解讲解，数据量与参数量配比的核心结论讲得很透" },
          { title: "Pre-Training LLMs Stage : Crawl Filtering, Dataset Curation, The 44 Terabyte Internet Pipeline", channel: "How Tech Actually Works - Tech Ninja", url: "https://www.youtube.com/watch?v=JmKLZUBXV1Y", why: "讲预训练数据从爬取、过滤到清洗的 44TB 流水线，数据工程视角完整" }
        ],
        bilibili: [
          { title: "大模型预训练的数据如何准备？【从零开始训练大模型01】", up: "费曼学徒冬瓜", url: "https://www.bilibili.com/video/BV1mz8GzuEyA", why: "从零训练大模型系列第一课，数据配比、清洗、质量过滤全流程实操" },
          { title: "你真的懂Scaling Law吗？一口气搞懂AI的\"缩放定律\"！", up: "Lau博士的云组会", url: "https://www.bilibili.com/video/BV1aa3b6PE7h", why: "从 Kaplan 到 Chinchilla 的缩放定律脉络梳理，5 万播放的高质量中文讲解" }
        ],
        keywords: ["预训练数据配比", "数据清洗去重 质量过滤", "Chinchilla 缩放定律"]
      }
    },
    {
      id: "sft-lora",
      name: "SFT 与 LoRA",
      en: "SFT/LORA",
      branch: "align",
      deps: ["pretrain-data"],
      grid: { col: 5, row: 2 },
      summary: "指令微调全参数 vs LoRA 只训 <1% 低秩增量",
      sections: {
        principle: "SFT 用十万级高质量「指令-回答」样本对 base model 做全参数微调，教会它对话格式与指令跟随——数据贵精不贵多。\nLoRA 换条路：冻结 base 权重 W，把更新量 ΔW 分解为两个低秩矩阵的乘积 BA（秩 r 常取 8-64），只训练这两个小矩阵，可训练参数不到 1%。\nLoRA 的杀手锏：推理时把 BA 合并回原权重 W' = W + BA，模型结构与延迟与原版完全一致——零部署成本。",
        formula: [
          "LoRA：W' = W + BA，B ∈ R^{d×r}，A ∈ R^{r×k}，r 常 8-64",
          "可训练参数 ≈ r(d+k) ≪ d×k，通常 < 1%",
          "推理时合并：W + BA 一次算好，无额外延迟"
        ],
        example: [
          "7B 全参 SFT：模型状态 112 GB 起步；LoRA 只训几十 MB 参数",
          "r=16 加在 d=4096 方阵上：2×4096×16 ≈ 13 万参数 vs 原 1678 万",
          "LoRA 显存省的不只是权重——优化器状态与梯度同步缩到 <1%",
          "多租户服务：一份 base 权重 + 每客户一个小 LoRA，切换即换 BA"
        ],
        tradeoffs: [
          "LoRA 省显存省算力，但表达力受秩 r 限制，复杂能力学习可能不够",
          "全参 SFT 效果上限高，代价是显存账与 T07 完全一样",
          "r 越大越接近全参，但 r=64 以上收益递减，8-32 是甜区"
        ],
        pitfalls: [
          "以为 LoRA 推理更慢——合并后与原始架构逐字节相同",
          "只给 attention 加 LoRA 忽略 FFN——FFN 占参数 2/3，覆盖面看任务定"
        ]
      },
      diagram: {
        type: "compare",
        title: "全参 SFT vs LoRA",
        items: [
          ["全参 SFT", "更新全部 70 亿参数，显存 112 GB 起步"],
          ["LoRA", "冻结 W，只训 BA 低秩增量（<1% 参数）"],
          ["秩 r", "常 8-64，甜区 8-32"],
          ["推理", "W+BA 合并回原权重，零额外延迟"],
          ["场景", "多租户/快迭代选 LoRA，冲上限选全参"]
        ]
      },
      quiz: {
        q: "LoRA 为什么能做到推理零额外延迟？",
        options: [
          "它把模型量化到了 INT8",
          "ΔW=BA 可在推理前合并回原权重，结构与参数量不变",
          "它跳过了 FFN 层",
          "推理时自动关闭 LoRA 分支"
        ],
        answer: 1,
        explain: "W' = W + BA 一次合并，推理时就是普通矩阵乘，没有任何额外结构。训练侧它把可训练参数压到 <1%（r 常 8-64），显存与算力同步骤降。偏好对齐见 T17/T18。"
      },
      resources: {
        youtube: [
          { title: "What is Low-Rank Adaptation (LoRA) | explained by the inventor", channel: "Edward Hu", url: "https://www.youtube.com/watch?v=DhRoTONcyZE", why: "LoRA 一作 Edward Hu 亲自讲低秩适配的设计动机与原理，最权威的一手解读" },
          { title: "Fine-tuning LLMs with PEFT and LoRA", channel: "Sam Witteveen", url: "https://www.youtube.com/watch?v=Us5ZFp16PaU", why: "用 HuggingFace PEFT 库实操 LoRA 微调，代码级入门教程" }
        ],
        bilibili: [
          { title: "【LoRA微调】从原理到调参，7 个问题彻底理解LoRA，不懂线性代数也没问题", up: "费曼学徒冬瓜", url: "https://www.bilibili.com/video/BV1waZ2YDEcp", why: "以 7 个问题串起 LoRA 原理与调参，零基础友好，5 万播放" },
          { title: "【完整版】微调：从原理到实操，该说的我都说了……", up: "费曼学徒冬瓜", url: "https://www.bilibili.com/video/BV13QFxzCEXb", why: "SFT 与 PEFT 全体系长视频，原理到实操一次讲透，近 9 万播放" }
        ],
        keywords: ["LoRA微调教程", "SFT 指令微调", "参数高效微调 PEFT"]
      }
    },
    {
      id: "rlhf",
      name: "RLHF 与 PPO",
      en: "RLHF",
      branch: "align",
      deps: ["sft-lora"],
      grid: { col: 6, row: 2 },
      summary: "SFT → 奖励模型 → PPO，四个模型同时驻留显存",
      sections: {
        principle: "RLHF 三步走：先 SFT 得到会对话的模型；再收集人类对回答的排序偏好，训练一个奖励模型 RM 给回答打分；最后用 PPO 强化学习，让模型在 RM 的打分引导下调整策略。\nPPO 阶段显存里同时驻留四个模型：actor（在训的策略）、ref（冻结的参照）、reward（RM）、critic（价值估计）——7B 规模下轻松数百 GB。\nKL 惩罚项拉住 actor 不许偏离 ref 太远：没有它，模型会找到 RM 的漏洞「骗分」，输出变得古怪。",
        formula: [
          "三步：SFT → 训 RM（偏好排序）→ PPO 优化",
          "目标 = RM 打分 - β·KL(actor ‖ ref)",
          "PPO 同时驻留：actor / ref / reward / critic 四模型"
        ],
        example: [
          "7B RLHF：actor+ref+RM+critic 四个模型，模型状态数百 GB",
          "无 KL 约束：模型刷出 RM 高分但输出复读机式乱码",
          "RM 用「回答 A 优于 B」的成对偏好训练，不需绝对分数标注",
          "InstructGPT：1.3B RLHF 版比 175B 纯 SFT 版更受人类偏好"
        ],
        tradeoffs: [
          "RLHF 效果上限高但管线复杂：训 RM、采样、PPO 三段都要调",
          "PPO 四模型驻留，显存与工程复杂度远超 SFT",
          "RM 本身会过时：actor 变强后旧 RM 的打分分布失真，需迭代"
        ],
        pitfalls: [
          "去掉 KL 惩罚想跑得更快——reward hacking 会让输出质量崩塌",
          "低估工程成本——PPO 的采样-打分-更新闭环比监督训练慢一个量级"
        ]
      },
      diagram: {
        type: "flow",
        title: "RLHF 三段管线",
        items: [
          ["1. SFT", "指令微调出初始策略"],
          ["2. 训 RM", "人类排序偏好 → 打分模型"],
          ["3. PPO", "actor 采样回答，RM 打分，KL 拉住 ref"],
          ["显存", "actor/ref/reward/critic 四模型同驻"],
          ["简化版", "T17 DPO：免 RM 免采样"]
        ]
      },
      quiz: {
        q: "RLHF 的 PPO 阶段为什么要加一个对 ref 模型的 KL 惩罚？",
        options: [
          "加快收敛速度",
          "防止 actor 钻奖励模型空子骗分、偏离正常语言分布",
          "节省显存",
          "让输出更长"
        ],
        answer: 1,
        explain: "没有 KL 约束，PPO 会找到 RM 的打分漏洞（reward hacking），输出高分但乱码。代价是 PPO 要同时驻留 actor/ref/reward/critic 四个模型——这正是 T17 DPO/GRPO 要砍的成本。"
      },
      resources: {
        youtube: [
          { title: "Reinforcement Learning with Human Feedback (RLHF), Clearly Explained!!!", channel: "StatQuest with Josh Starmer", url: "https://www.youtube.com/watch?v=qPN_XZcJf_s", why: "StatQuest 招牌式图解 RLHF，奖励模型与偏好数据的关系一目了然" },
          { title: "Proximal Policy Optimization (PPO) for LLMs Explained Intuitively", channel: "Julia Turc", url: "https://www.youtube.com/watch?v=8jtAzxUwDj0", why: "针对 LLM 场景讲 PPO，KL 约束与多模型显存开销的直觉解释" }
        ],
        bilibili: [
          { title: "InstructGPT 论文精读【论文精读·48】", up: "跟李沐学AI", url: "https://www.bilibili.com/video/BV1hd4y187CR", why: "李沐精读 RLHF 开山之作 InstructGPT，29 万播放的经典论文课" },
          { title: "零基础学习强化学习算法：ppo", up: "RethinkFun", url: "https://www.bilibili.com/video/BV1iz421h7gb", why: "RethinkFun 的 PPO 从零推导，29 万播放，RLHF 的算法底座" }
        ],
        keywords: ["RLHF 原理讲解", "PPO 算法详解", "奖励模型 KL约束"]
      }
    },
    {
      id: "dpo-grpo",
      name: "DPO 与 GRPO",
      en: "DPO/GRPO",
      branch: "align",
      deps: ["rlhf"],
      grid: { col: 7, row: 2 },
      summary: "DPO 免 RM 闭式优化；GRPO 去 critic 用组内相对优势",
      sections: {
        principle: "DPO 发现：偏好优化的最优解可以写成闭式——不用训 RM、不用在线采样，直接拿「优选/劣选」回答对做监督式训练，让模型提高优选回答的相对概率。\n管线从「SFT→RM→PPO」三段缩成「SFT→DPO」两段，显存里只需 policy + ref 两个模型。\nGRPO（DeepSeek-R1 出圈）针对 PPO 的另一刀：去掉 critic 模型，同一问题采样一组回答，用组内相对优势（谁高于组均值）替代价值估计——数学/代码等可验证任务上效果惊人。",
        formula: [
          "DPO：直接最大化 log σ(β·log π(y_w|x)/π_ref(y_w|x) - β·log π(y_l|x)/π_ref(y_l|x))",
          "GRPO：优势 A_i = (r_i - mean(r_group)) / std(r_group)",
          "GRPO 无 critic，省一个模型的显存与训练量"
        ],
        example: [
          "DPO 训练只需成对偏好数据：「这个回答比那个好」",
          "GRPO 对一道数学题采样 64 个回答，按对错组内排名给优势",
          "DeepSeek-R1 用 GRPO + 规则奖励（答案对不对）训练推理能力",
          "DPO 两个模型 vs PPO 四个模型：显存直接减半以上"
        ],
        tradeoffs: [
          "DPO 简单稳定，但静态数据无法像在线 RL 那样持续探索新策略",
          "GRPO 需要可验证奖励（对错可判），开放式对话场景不如 RM 灵活",
          "DPO 对 β 与偏好数据质量敏感，调不好会过度压缩输出多样性"
        ],
        pitfalls: [
          "以为 DPO 全面取代 RLHF——开放域偏好上限仍常低于在线 RL",
          "GRPO 组内采样数太少——优势估计噪声大，常见 16-64 一组"
        ]
      },
      diagram: {
        type: "compare",
        title: "对齐三代方案",
        items: [
          ["PPO（RLHF）", "四模型驻留，在线采样，最强也最贵"],
          ["DPO", "免 RM 免采样，偏好对闭式优化，两模型"],
          ["GRPO", "去 critic，组内相对优势，DeepSeek-R1 同款"],
          ["适用", "DPO 快速对齐；GRPO 攻可验证任务"],
          ["共同祖先", "都保留 KL/ref 防跑偏"]
        ]
      },
      quiz: {
        q: "GRPO 相比 PPO 的核心简化是？",
        options: [
          "去掉了 ref 模型",
          "去掉 critic，用同一问题一组回答的组内相对优势替代价值估计",
          "不用 KL 惩罚",
          "把采样换成了贪心解码"
        ],
        answer: 1,
        explain: "GRPO 对同一 prompt 采一组回答，用 (r_i - 组均值)/组标准差 当优势，省掉 critic 模型的显存与训练成本——DeepSeek-R1 的核心算法。DPO 则是另一路：免 RM 免采样的闭式优化。"
      },
      resources: {
        youtube: [
          { title: "Direct Preference Optimization: Your Language Model is Secretly a Reward Model | DPO paper explained", channel: "AI Coffee Break with Letitia", url: "https://www.youtube.com/watch?v=XZLc09hkMwA", why: "DPO 论文逐节精读，免奖励模型的推导链条讲得清晰" },
          { title: "DeepSeek's GRPO (Group Relative Policy Optimization) | Reinforcement Learning for LLMs", channel: "Julia Turc", url: "https://www.youtube.com/watch?v=xT4jxQUl0X8", why: "专门针对 DeepSeek GRPO 的直觉讲解，组内相对优势与去 critic 设计讲到位" }
        ],
        bilibili: [
          { title: "DeepSeek-GRPO", up: "RethinkFun", url: "https://www.bilibili.com/video/BV1enQLYKEA5", why: "RethinkFun 的 GRPO 专题，4 万播放，从 PPO 到 GRPO 的演进讲得明白" },
          { title: "【DPO】直接偏好优化 详细原理推导+快速上手实战", up: "东川路第一可爱猫猫虫", url: "https://www.bilibili.com/video/BV1m8FnzpEXm", why: "DPO 公式逐步推导加代码实战，理论动手两头顾" }
        ],
        keywords: ["DPO 直接偏好优化", "GRPO 算法原理", "DeepSeek R1 强化学习"]
      }
    },
    {
      id: "data-parallel",
      name: "数据并行 DDP",
      en: "DDP",
      branch: "parallel",
      deps: ["train-memory"],
      grid: { col: 1, row: 3 },
      summary: "每卡全量模型各吃不同数据，反向后 all-reduce 梯度",
      sections: {
        principle: "T07 的账说 7B 模型状态 112 GB 单卡装不下，但先学最简单的并行：DDP 每张卡放完整模型副本，各自喂不同的数据分片，前向反向完全独立。\n唯一的同步点在反向后：各卡梯度做 all-reduce 求平均，保证所有副本看到同一份更新方向。ring all-reduce 的通信量 ≈ 2 × 参数量/step，与卡数无关——这是它能扩展到数百卡的关键。\n通信与计算 overlap：反向算到后面的层时，前面层的梯度已开始通信，理想情况下通信几乎被藏住。",
        formula: [
          "每卡：全量模型 + 1/N 数据分片",
          "ring all-reduce 通信量 ≈ 2 × 参数量/step（与卡数无关）",
          "global batch = 单卡 batch × 卡数 × 累积步数（PT05）"
        ],
        example: [
          "7B 梯度 BF16 = 14 GB：all-reduce 通信 ≈ 28 GB/step",
          "NVLink 600 GB/s 机内互联：28 GB 通信理论 ≈ 47 ms",
          "8 卡 DDP：吞吐接近 8 倍，前提是通信能被反向计算 overlap",
          "DDP 前提：单卡装得下全量模型 + 激活——7B 已不够，要 ZeRO（T10）"
        ],
        tradeoffs: [
          "DDP 实现最简单、扩展性好，但每卡必须装下完整模型",
          "overlap 藏通信依赖反向顺序与通信带宽，跨机网络差时裸奔",
          "卡数翻倍吞吐近似翻倍，但 global batch 同步翻倍，需配合调 lr"
        ],
        pitfalls: [
          "忘了梯度同步就更新——各副本越训越分歧",
          "用 DDP 硬撑装不下的模型——OOM 不会因并行而消失，得换 ZeRO/TP"
        ]
      },
      diagram: {
        type: "loop",
        anim: "ringAllreduce",
        title: "DDP 每步的同步循环",
        items: [
          ["各卡前向", "各吃 1/N 数据分片"],
          ["各卡反向", "独立算梯度，互不通信"],
          ["all-reduce 同步梯度", "求平均，≈2×参数量/step"],
          ["各自更新", "同一平均梯度改副本"],
          ["回环", "下一个 step 再来一遍"]
        ]
      },
      quiz: {
        q: "ring all-reduce 为什么能让 DDP 扩展到数百卡？",
        options: [
          "它把通信量降到与卡数无关（≈2×参数量/step）",
          "它不需要任何通信",
          "它把模型切到多卡上",
          "它用 CPU 代替 GPU 通信"
        ],
        answer: 0,
        explain: "ring all-reduce 每卡只与邻居通信，总通信量 ≈ 2×参数量，与卡数无关，再加通信与反向 overlap，扩展性极佳。但每卡仍要全量模型——装不下就得 ZeRO（T10）。"
      },
      resources: {
        youtube: [
          { title: "How DDP works || Distributed Data Parallel || Quick explained", channel: "Developers Hutt", url: "https://www.youtube.com/watch?v=bwNtfxEDjGA", why: "快速讲清 DDP 的梯度同步机制，入门节奏好" },
          { title: "PyTorch DDP Explained: How 8 GPUs Train One LLM", channel: "FireHacker", url: "https://www.youtube.com/watch?v=U-872mtJ8lE", why: "以 8 卡训练 LLM 为例讲 DDP 与 all-reduce 的实际工作方式" }
        ],
        bilibili: [
          { title: "PyTorch数据并行怎么实现？DP、DDP、FSDP数据并行原理？【分布式并行】系列第02篇", up: "ZOMI酱", url: "https://www.bilibili.com/video/BV1JK411S7gL", why: "AI 系统方向最对口的 UP 主，系统讲 DP/DDP/FSDP 原理" },
          { title: "Ring All Reduce算法跟物理网络啥关系？【分布式集群】系列第02篇", up: "ZOMI酱", url: "https://www.bilibili.com/video/BV1fg41187rc", why: "把 all-reduce 算法与集群网络拓扑联系起来，理解梯度同步的底层" }
        ],
        keywords: ["数据并行DDP", "all-reduce梯度同步", "多卡训练原理"]
      }
    },
    {
      id: "zero",
      name: "ZeRO 显存切分",
      en: "ZERO",
      branch: "parallel",
      deps: ["data-parallel"],
      grid: { col: 2, row: 3 },
      summary: "优化器状态/梯度/参数逐级切分，每卡只存 1/N",
      sections: {
        principle: "DDP 的浪费很明显：每卡都存一份完整的模型状态。ZeRO（DeepSpeed）把「数据并行但状态冗余」改成「状态也切片」：\nZeRO-1 切优化器状态（8 B/参数的大头先切）；ZeRO-2 加切梯度；ZeRO-3 连参数也切，每卡只存 1/N，用到时临时从其他卡收集。\n省显存换通信：7B 模型状态 112 GB，ZeRO-3 下 64 卡每卡只存约 1.75 GB——代价是前向反向都要额外通信收集参数。",
        formula: [
          "ZeRO-1：优化器状态 ÷ N；ZeRO-2：+ 梯度 ÷ N；ZeRO-3：+ 参数 ÷ N",
          "7B 模型状态 112 GB → ZeRO-3 每卡 ≈ 112/N GB",
          "本质：显存 ÷ N，通信量 ×（约 1.5-3 倍于 DDP）"
        ],
        example: [
          "ZeRO-1 已切掉最大的 8 B/参数：7B 从 112 GB 降到 56+14=约 30 GB/卡",
          "ZeRO-3 + 64 卡：每卡模型状态 ≈ 1.75 GB，70B（1.12 TB）也能训",
          "PyTorch FSDP 是 ZeRO-3 的原生平替",
          "通信带宽差的集群上 ZeRO-3 吞吐可能反不如 ZeRO-1"
        ],
        tradeoffs: [
          "级别越高显存越省，通信越频繁——带宽是 ZeRO-3 的生死线",
          "ZeRO-1 通信几乎与 DDP 相同却省了最大头，性价比常最高",
          "参数切片后 checkpoint 存取、推理导出都要先聚合，工程更繁琐"
        ],
        pitfalls: [
          "以为 ZeRO 减少总显存——它只是摊到各卡，总量没少还多了通信缓冲",
          "在慢网络上开 ZeRO-3——收集参数的通信会把吞吐拖垮"
        ]
      },
      diagram: {
        type: "bars",
        anim: "zeroShard",
        title: "ZeRO 三级切分（7B，模型状态 112 GB）",
        items: [
          ["DDP", "每卡 112 GB（全量冗余）"],
          ["ZeRO-1", "切优化器状态：≈ 30 GB/卡量级"],
          ["ZeRO-2", "再切梯度：进一步降低"],
          ["ZeRO-3", "参数也切：112/N GB/卡"],
          ["代价", "省显存换通信，带宽是命门"]
        ]
      },
      quiz: {
        q: "ZeRO 三个阶段的切分对象依次是？",
        options: [
          "参数 → 梯度 → 优化器状态",
          "优化器状态 → 梯度 → 参数",
          "激活 → 梯度 → 参数",
          "梯度 → 参数 → 激活"
        ],
        answer: 1,
        explain: "ZeRO-1 先切最大的优化器状态（8 B/参数），ZeRO-2 加切梯度，ZeRO-3 连参数也切、每卡只存 1/N。它管的是模型状态；层内激活太大怎么办？张量并行 T11 接棒。"
      },
      resources: {
        youtube: [
          { title: "Turing-NLG, DeepSpeed and the ZeRO optimizer", channel: "Yannic Kilcher", url: "https://www.youtube.com/watch?v=tC01FRB0M7w", why: "ZeRO 论文经典解读，讲透三阶段显存切分的设计动机" },
          { title: "Ultimate Guide To Scaling ML Models - Megatron-LM | ZeRO | DeepSpeed", channel: "Aleksa Gordić - The AI Epiphany", url: "https://www.youtube.com/watch?v=hc0u4avAkuM", why: "把 ZeRO 放进大模型并行训练的完整图谱中对比讲解" }
        ],
        bilibili: [
          { title: "[154]. ZeRO：DeepSpeed 大模型显存优化，论文精读", up: "海安雨", url: "https://www.bilibili.com/video/BV1B38h6cEQP", why: "中文 ZeRO 论文精读，逐段讲解显存切分原理" },
          { title: "DeepSpeed 的 3 个 Stage 是什么？ZeRO 逐级切分省显存讲透", up: "古希腊掌管代码的神", url: "https://www.bilibili.com/video/BV1BuKx69EDn", why: "聚焦 ZeRO-1/2/3 逐级切分的差异，面试与理解都适用" }
        ],
        keywords: ["ZeRO显存优化", "DeepSpeed原理", "ZeRO三个阶段区别"]
      }
    },
    {
      id: "tensor-parallel",
      name: "张量并行 TP",
      en: "TENSOR PAR",
      branch: "parallel",
      deps: ["data-parallel"],
      grid: { col: 3, row: 3 },
      summary: "矩阵按列/行切到多卡，每层 2 次 all-reduce",
      sections: {
        principle: "ZeRO 切的是状态，张量并行（Megatron）切的是计算本身：把每层的权重矩阵按列或按行拆到多卡，每卡只算矩阵的一片，结果再合并。\n对 y = xA：A 按列切，各卡算 xA_i 得到输出的一部分；下一层按行切回来，中间夹一次 all-reduce。MLP 与 attention 各配一套切法，每层合计 2 次 all-reduce。\n每层都通信意味着 TP 通信量极大——它通常只敢放在单机 8 卡的 NVLink 高速互联内，出机箱就是灾难。",
        formula: [
          "列切：Y = x[A₁|A₂]，各卡算 xA_i，拼起来即 Y",
          "行切：各卡算 x_i B_i，all-reduce 求和得最终结果",
          "每层 2 次 all-reduce（attention 块 + FFN 块各一次）"
        ],
        example: [
          "d=4096 的 FFN 矩阵 TP=8：每卡只存 4096×11008÷8 的一片",
          "7B TP=8：每卡权重从 14 GB 降到 1.75 GB，激活同比例切",
          "每层 2 次 all-reduce × 32 层 = 64 次通信/前向——必须 NVLink",
          "NVLink 机内 600 GB/s vs 跨机 IB 约 50 GB/s：差一个数量级"
        ],
        tradeoffs: [
          "TP 同时切权重与激活，单层太大时是唯一解，但通信频率最高",
          "TP 度数越高单卡越省，收益递减且通信占比飙升，8 是实用上限",
          "与 ZeRO 互补：TP 切计算与激活，ZeRO 切优化器状态（T13 组合）"
        ],
        pitfalls: [
          "把 TP 跨机部署——每层 2 次 all-reduce 在慢网络上会拖死吞吐",
          "以为 TP 减少总计算量——FLOPs 不变，只是摊到多卡并行执行"
        ]
      },
      diagram: {
        type: "tree",
        title: "TP 怎么切一个矩阵",
        items: [
          ["列切", "A 按列分 8 片，各卡算 xA_i"],
          ["并行", "8 卡同时算各自的输出片"],
          ["行切", "下一层按行分，各卡算部分和"],
          ["all-reduce", "求和合并，每层共 2 次"],
          ["约束", "通信密集 → 限单机 NVLink 内"]
        ]
      },
      quiz: {
        q: "张量并行为什么通常只部署在单机 8 卡 NVLink 内？",
        options: [
          "NVLink 显存更大",
          "每层 2 次 all-reduce 通信极频繁，跨机带宽撑不住",
          "TP 最多只支持 8 卡",
          "机箱外没有电源"
        ],
        answer: 1,
        explain: "TP 每层 2 次 all-reduce、一个前向几十次通信，只有 NVLink（≈600 GB/s）扛得住；跨机 IB 差一个数量级。跨机怎么办？T12 流水并行按层切，通信只在 stage 边界。"
      },
      resources: {
        youtube: [
          { title: "Efficient Large-Scale Language Model Training on GPU Clusters Using Megatron-LM", channel: "Jared Casper | @Scale", url: "https://www.youtube.com/watch?v=gHaNUcS1_O4", why: "Megatron-LM 作者本人讲的官方 talk，张量并行按列/行切分与 all-reduce 讲得一手到位" },
          { title: "Ultimate Guide To Scaling ML Models - Megatron-LM | ZeRO | DeepSpeed | Mixed Precision", channel: "Aleksa Gordić - The AI Epiphany", url: "https://www.youtube.com/watch?v=hc0u4avAkuM", why: "前 DeepMind 工程师的系统讲解，TP 数学原理与工程实现兼顾" }
        ],
        bilibili: [
          { title: "什么是张量并行？张量并行的数学原理是什么？【分布式并行】系列第03篇", up: "ZOMI酱", url: "https://www.bilibili.com/video/BV1vt4y1K7wT", why: "ZOMI 分布式并行系列，TP 矩阵切分数学原理讲得最清楚的中文讲解" },
          { title: "20大模型全栈-分布式训练03-模型并行-张量并行、朴素流水线并行原理", up: "大模型解码室", url: "https://www.bilibili.com/video/BV1zkWseXEaq", why: "从全栈视角讲模型并行，TP 原理配图解，适合入门" }
        ],
        keywords: ["张量并行原理", "Megatron 矩阵切分", "大模型分布式训练入门"]
      }
    },
    {
      id: "pipeline-parallel",
      name: "流水并行 PP",
      en: "PIPELINE",
      branch: "parallel",
      deps: ["tensor-parallel"],
      grid: { col: 4, row: 3 },
      summary: "按层切到不同卡，micro-batch 流水填气泡",
      sections: {
        principle: "流水并行把模型按层切成 p 段（stage），每段放一组卡：卡 1-8 拿第 1-8 层，卡 9-16 拿第 9-16 层……通信只发生在 stage 边界传激活，频次远低于 TP，敢跨机。\n问题在气泡：朴素排期下，任一时刻只有一个 stage 在干活，其余干等。解法是 micro-batch：把一个 batch 切成 m 个 micro-batch 流水推进，气泡占比 ≈ (p-1)/(m+p-1)，m 越大气泡越小。\n1F1B 调度（一次前向配一次反向交替）进一步压低峰值显存，是工业标配。",
        formula: [
          "气泡占比 ≈ (p-1)/(m+p-1)，p=stage 数，m=micro-batch 数",
          "通信：只在 stage 边界传激活，每个 micro-batch p-1 次",
          "1F1B：稳态时前向反向交替，峰值激活显存显著下降"
        ],
        example: [
          "p=8、m=8：气泡 ≈ 7/15 ≈ 47%；m=64：≈ 7/71 ≈ 10%",
          "32 层模型 PP=4：每 stage 8 层，权重显存 ÷4",
          "micro-batch 越多气泡越小，但激活缓存越多——1F1B 为此而生",
          "PP 天然跨机：stage 边界一次只传一份激活，通信量与层数无关"
        ],
        tradeoffs: [
          "PP 通信少敢跨机，代价是气泡浪费与调度复杂度",
          "m 越大气泡越小，但 micro-batch 太小吃不满单卡算力",
          "层数不能被 stage 均分时负载不均，慢 stage 拖住整条流水线"
        ],
        pitfalls: [
          "batch 不切 micro-batch 就跑 PP——p 个 stage 只有 1 个在干活",
          "忽略气泡公式里 m 的影响——吞吐调不上去先查 micro-batch 数"
        ]
      },
      diagram: {
        type: "flow",
        anim: "pipelineFlow",
        title: "micro-batch 流水线（p=4, m=4）",
        items: [
          ["切层", "32 层 ÷ 4 stage，各 8 层"],
          ["切批", "batch ÷ m 个 micro-batch 流水推进"],
          ["气泡", "(p-1)/(m+p-1)：4/4 → ≈43%"],
          ["加大 m", "m=16 → 气泡降到 ≈16%"],
          ["1F1B", "交替前向反向，压峰值显存"]
        ]
      },
      quiz: {
        q: "p=8 个 stage 的流水线，micro-batch 数 m 从 8 提到 64，气泡占比从约 47% 降到约 10%。气泡的来源是？",
        options: [
          "GPU 过热降频",
          "流水线启动与排空阶段，部分 stage 无活可干",
          "all-reduce 通信太慢",
          "数据加载太慢"
        ],
        answer: 1,
        explain: "气泡 = 灌满与排空流水线的空转时间，占比 (p-1)/(m+p-1)，m 越大占比越小。1F1B 调度再压峰值显存。TP 管机内、PP 管跨机——T13 把它们组合起来。"
      },
      resources: {
        youtube: [
          { title: "Let's Build Pipeline Parallelism from Scratch – Tutorial", channel: "freeCodeCamp.org", url: "https://www.youtube.com/watch?v=D5F8kp_azzw", why: "从零手写流水并行的教程，micro-batch 切分和调度逻辑边写边讲" },
          { title: "E14 | Zero Bubble (Almost) Pipeline Parallelism (ICLR'24) 【中文】", channel: "MLSys Singapore", url: "https://www.youtube.com/watch?v=j3E2IH-uc80", why: "ICLR'24 Zero Bubble 论文作者中文报告，pipeline bubble 与 1F1B 进阶必读" }
        ],
        bilibili: [
          { title: "模型并行的流水线并行来啦！了解下GPipe和PipeDream？【分布式并行】系列第05篇", up: "ZOMI酱", url: "https://www.bilibili.com/video/BV1WD4y1t7Ba", why: "GPipe 与 PipeDream 两条 PP 技术路线对比，bubble 问题讲得直观" },
          { title: "Megatron-LM 流水并行PP代码解析 #大模型 #分布式并行 #分布式训练", up: "ZOMI酱", url: "https://www.bilibili.com/video/BV1hs421g7vN", why: "直接读 Megatron-LM 的 PP 源码，看 1F1B 调度在工程里怎么落地" }
        ],
        keywords: ["流水线并行 1F1B", "pipeline bubble 气泡", "GPipe PipeDream"]
      }
    },
    {
      id: "parallel-3d",
      name: "3D 并行组合",
      en: "3D PARALLEL",
      branch: "parallel",
      deps: ["zero", "pipeline-parallel"],
      grid: { col: 5, row: 3 },
      summary: "TP 走机内、PP 跨机、DP 最外层，总卡数 = TP×PP×DP",
      sections: {
        principle: "三种并行各管一段，组合规则由通信拓扑决定：TP 通信最密集，放最内层单机 8 卡 NVLink 内（TP=8）；PP 通信次之，跨机连接各 stage；DP（含 ZeRO）通信最少，放最外层跨越多条流水线。\n总卡数 = TP × PP × DP：512 卡可以是 TP8 × PP8 × DP8。\n这套组合是 Megatron/DeepSpeed 训练千亿模型的标准姿势——每一种并行正好解决它那一层的瓶颈。",
        formula: [
          "总卡数 = TP × PP × DP",
          "内→外：TP（NVLink 机内）→ PP（跨机）→ DP/ZeRO（最外层）",
          "通信密度排序：TP ≫ PP > DP，与网络层级一一对应"
        ],
        example: [
          "512 卡 = TP8 × PP8 × DP8：8 机一条流水线，8 条流水线数据并行",
          "70B 模型状态 1.12 TB：TP8 先 ÷8，ZeRO 再切优化器状态",
          "TP 若放到跨机层：每层 2 次 all-reduce 走 IB，吞吐直接腰斩",
          "DP 最外层：梯度 all-reduce 一步一次，跨机也能 overlap"
        ],
        tradeoffs: [
          "组合自由度大但调参空间爆炸：TP/PP/DP 度数要靠实测网格搜索",
          "PP 切层 + TP 切片后单层均分困难，非整除配置浪费算力",
          "3D 并行 + ZeRO + 混合精度 + checkpoint 叠加，任何一环配错都 OOM"
        ],
        pitfalls: [
          "把通信最密的 TP 放到最慢的网络层——组合顺序是由带宽决定的，不可乱排",
          "忘记总卡数约束——TP×PP×DP 必须等于集群卡数且各维整除模型结构"
        ]
      },
      diagram: {
        type: "tree",
        title: "512 卡的 3D 解剖",
        items: [
          ["最内层 TP=8", "单机 NVLink，矩阵切片，通信最密"],
          ["中间 PP=8", "跨机流水线，stage 边界传激活"],
          ["最外 DP=8", "流水线间 all-reduce 梯度，+ZeRO 切状态"],
          ["合计", "8×8×8 = 512 卡"],
          ["铁律", "通信密度与网络带宽一一对应"]
        ]
      },
      quiz: {
        q: "3D 并行把 TP 放最内层（单机 NVLink）、DP 放最外层的依据是？",
        options: [
          "按字母顺序排列",
          "通信密度 TP≫PP>DP，与 NVLink>IB>跨集群的带宽层级一一对应",
          "TP 只能单机是软件限制",
          "随机安排效果相同"
        ],
        answer: 1,
        explain: "每层 2 次 all-reduce 的 TP 必须吃 NVLink 带宽；stage 边界才通信的 PP 可以跨机；一步一次 all-reduce 的 DP 放最外层。总卡数 = TP×PP×DP。这套组合的成本账，T18 来算。"
      },
      resources: {
        youtube: [
          { title: "Efficient Large-Scale Language Model Training on GPU Clusters", channel: "Databricks", url: "https://www.youtube.com/watch?v=MO_CESBOXgo", why: "Megatron-LM 论文（TP+PP+DP 三维组合）在 Databricks 的完整报告，含集群拓扑与效率分析" },
          { title: "How LLMs use multiple GPUs", channel: "Simon Oz", url: "https://www.youtube.com/watch?v=4i76hmmnJEo", why: "动画演示 DP/TP/PP 如何在多 GPU 集群上组合，直观建立 3D 并行全局观" }
        ],
        bilibili: [
          { title: "分布式训练框架Megatron-LM代码概览 #大模型 #分布式并行 #训练", up: "ZOMI酱", url: "https://www.bilibili.com/video/BV12J4m1K78y", why: "从 Megatron-LM 代码结构看 TP/PP/DP 三种并行如何组合与切换" },
          { title: "【LLM101】3.3 LLM预训练之分布式训练：数据并行、模型并行、混合精度训练、分布式通信", up: "一万篇论文笔记", url: "https://www.bilibili.com/video/BV1gfwreaEhH", why: "LLM101 课程的一节，把数据/模型并行与通信开销放在预训练全景里讲" }
        ],
        keywords: ["3D并行 混合并行", "千卡集群大模型训练", "TP PP DP 怎么组合"]
      }
    },
    {
      id: "training-cost",
      name: "训练成本与 MFU",
      en: "COST/MFU",
      branch: "ops",
      deps: ["parallel-3d"],
      grid: { col: 1, row: 4 },
      summary: "C = 6ND；GPU·时 = 6ND ÷（峰值算力 × MFU）",
      sections: {
        principle: "训练总算力需求 C = 6ND（N=参数量，D=token 数）——6N 来自前向 2N + 反向 4N，乘上全部 token 就是总账。\n折算 GPU·时：GPU·时 = 6ND ÷（峰值算力 × MFU）。MFU（模型算力利用率）是实际吞吐与峰值的比值——通信、气泡、重算、数据加载都在吃它，大模型训练常见 30-50%。\n例：70B × 2T tokens，H100（989 TFLOPS）MFU 40%：6×70e9×2e12 ÷ (989e12×0.4) ≈ 2.12e9 s ≈ 59 万 GPU·时——这就是一次训练的账单量级。",
        formula: [
          "C = 6ND（N 参数，D token）",
          "GPU·时 = 6ND ÷ (峰值算力 × MFU)",
          "MFU 大模型训练常见 30-50%"
        ],
        example: [
          "70B × 2T：6×70e9×2e12 = 8.4e23 FLOPs",
          "÷(989e12 × 0.4) = 8.4e23 ÷ 3.956e14 ≈ 2.12e9 s",
          "≈ 59 万 GPU·时：2048 张 H100 连续跑约 12 天",
          "MFU 从 40% 提到 50%：直接省 12 万 GPU·时，优化值这个价"
        ],
        tradeoffs: [
          "MFU 每提升 1 个点都是真金白银，但逼近 50% 后边际成本陡增",
          "重算、通信、气泡都是 MFU 的税——T08/T12 的每一项技术都在还债",
          "6ND 是理论下限，实验失败与重启的沉没成本不在公式里"
        ],
        pitfalls: [
          "用峰值算力直接除——不算 MFU 会乐观 2-3 倍",
          "以为 MFU 低是 GPU 差——通信拓扑与并行配置才是主因"
        ]
      },
      diagram: {
        type: "bars",
        title: "70B × 2T tokens 的账单",
        items: [
          ["总计算", "6ND = 8.4e23 FLOPs"],
          ["H100 有效算力", "989 TFLOPS × MFU 40% ≈ 3.96e14/s"],
          ["时间", "≈ 2.12e9 s ≈ 59 万 GPU·时"],
          ["直觉", "2048 卡 ≈ 12 天"],
          ["MFU 战场", "30%→50%，账单差 40%"]
        ]
      },
      quiz: {
        q: "70B 模型训 2T tokens，H100（989 TFLOPS）MFU 40%，约需多少 GPU·时？",
        options: [
          "5.9 万 GPU·时",
          "59 万 GPU·时",
          "590 万 GPU·时",
          "5900 GPU·时"
        ],
        answer: 1,
        explain: "6×70e9×2e12 = 8.4e23 FLOPs，÷(989e12×0.4) ≈ 2.12e9 s ÷ 3600 ≈ 59 万 GPU·时。MFU 是被通信/气泡/重算吃掉的效率——曲线健康与否见 T19。"
      },
      resources: {
        youtube: [
          { title: "FLOPS Demystified: AI and the math behind DeepSeek training costs", channel: "Spreadsheets are all you need", url: "https://www.youtube.com/watch?v=T3JiBtHHTMU", why: "用电子表格一步步算 DeepSeek 训练成本的 FLOPs 数学，6ND 思路实操化" },
          { title: "Making GPUs Actually Fast: A Deep Dive into Training Performance", channel: "Jane Street", url: "https://www.youtube.com/watch?v=pHqcHzxx6I8", why: "Jane Street 讲训练性能工程，MFU 与实际算力利用率的差距来源分析深入" }
        ],
        bilibili: [
          { title: "【训练效率】MFU 和 GPU 利用率的区别在哪里？兼谈 MFU 与 HFU", up: "古希腊掌管代码的神", url: "https://www.bilibili.com/video/BV1Vh826YExp", why: "专门辨析 MFU/HFU/GPU 利用率三个易混概念，直接对口本知识点" },
          { title: "训练GPT大模型需要花多少钱？【2】", up: "LLM张老师", url: "https://www.bilibili.com/video/BV1x2421N71Q", why: "用具体数字拆解 GPT 级训练的 GPU·时与电费账单，万级播放" }
        ],
        keywords: ["大模型训练成本估算", "MFU 算力利用率", "训练大模型要花多少钱"]
      }
    },
    {
      id: "loss-diagnosis",
      name: "Loss 曲线诊断",
      en: "LOSS DIAG",
      branch: "ops",
      deps: ["grad-clip", "training-cost"],
      grid: { col: 2, row: 4 },
      summary: "spike、不降、grad norm 攀升：三类病三种药",
      sections: {
        principle: "59 万 GPU·时的训练跑几个月，loss 曲线是唯一的生命体征。三类典型病症：\nspike（loss 瞬间跳升）：常见成因是 lr 过高、坏数据 batch、FP16 精度溢出；处置是 grad clip 兜底、跳过坏 batch、严重时回滚 checkpoint 并降 lr 续训。\nloss 不降：先查 lr 是否过低或过高，再查数据（乱序没？配比错没？），最后查初始化。\ngrad norm 持续攀升：发散前兆，比 loss 炸掉更早出现——T06 的监控价值就在这里。",
        formula: [
          "spike 处置三板斧：clip → 跳过坏 batch → 回滚 checkpoint + 降 lr",
          "loss 不降排查序：lr → 数据 → 初始化",
          "grad norm 持续攀升 = 发散前兆"
        ],
        example: [
          "loss 从 2.1 跳到 8.5 又慢慢爬回：典型 spike，多半是坏 batch",
          "spike 后不处理：参数已被污染，后续曲线带着「疤痕」收敛变差",
          "warmup 没配够 + 峰值 lr 偏高：前 1k 步密集 spike 的标准剧情",
          "grad norm 从 0.5 稳步升到 2.0：提前降 lr 可救，等 loss NaN 就晚了"
        ],
        tradeoffs: [
          "回滚 checkpoint 丢进度，不滚可能带着污染参数越训越差",
          "跳过坏 batch 治标，根治要去数据管线里把它揪出来",
          "checkpoint 存得越密回滚损失越小，但存储与 IO 开销同步上升"
        ],
        pitfalls: [
          "只盯 loss 不盯 grad norm——norm 攀升是更早的预警信号",
          "spike 后假装无事继续训——被污染的参数会让最终能力打折扣"
        ]
      },
      diagram: {
        type: "flow",
        title: "spike 应急流程",
        items: [
          ["发现", "loss 跳升 / grad norm 异常"],
          ["兜底", "grad clip τ=1.0 已在防线"],
          ["止血", "跳过坏 batch，继续观察"],
          ["重症", "回滚 checkpoint + 降 lr 续训"],
          ["根治", "回数据管线揪出坏 batch 来源"]
        ]
      },
      quiz: {
        q: "训练中 grad norm 持续几百步缓慢攀升但 loss 还没异常，最稳妥的判断是？",
        options: [
          "正常现象不用管",
          "发散前兆，应提前降 lr 排查，比等 loss NaN 再救代价小得多",
          "说明模型学得很好",
          "显存快满了"
        ],
        answer: 1,
        explain: "grad norm 持续攀升通常先于 loss 发散出现，是最有价值的预警信号。配合 T06 的裁剪监控、T18 的成本意识：一次发散烧掉的可能是几万 GPU·时。至此训练模块 27 节点通关。"
      },
      resources: {
        youtube: [
          { title: "Big Techday 26: How not to blow up: Training a 400B MoE to 17T tokens without loss spikes - Atkins", channel: "TNG Technology Consulting GmbH", url: "https://www.youtube.com/watch?v=MHPU9PZtXiU", why: "400B MoE 训 17T token 不炸的实战经验，loss spike 的成因与工程对策" }
        ],
        bilibili: [
          { title: "【微调08-终】一口气说完调参技巧，解读loss曲线", up: "费曼学徒冬瓜", url: "https://www.bilibili.com/video/BV1z9FpzyENu", why: "系统讲 loss 曲线各种形态对应的诊断结论，5 万播放" },
          { title: "训练模型不达预期？原来是因为没搞懂loss值！", up: "未来胶囊prompt", url: "https://www.bilibili.com/video/BV13mY9ejEUk", why: "从 loss 数值与曲线判断训练是否健康，入门向诊断指南" }
        ],
        keywords: ["loss曲线怎么看", "训练loss发散怎么办", "loss spike 排查"]
      }
    }
  ]
};
