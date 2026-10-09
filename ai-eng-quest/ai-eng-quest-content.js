// AI-ENG-QUEST 知识库 · 基于 fancyboi999/ai-engineering-from-scratch-zh（中文全量翻译） 20 phases · 2026-10-03
window.LLM_QUEST_CONTENT = {
  nodes: [
    {
      id: "phase00-setup",
      name: "环境与工具链",
      en: "SETUP",
      branch: "prereq",
      deps: [],
      grid: { col: 1, row: 0 },
      summary: "整条路径的起点：Python/Git/Docker/GPU 环境一次搭对",
      repo: "https://github.com/fancyboi999/ai-engineering-from-scratch-zh/tree/main/phases/00-setup-and-tooling",
      sections: {
        principle: "这是整张地图的第 0 关：不碰任何模型，先把开发环境、版本控制、容器化、GPU 与云端算力、API key 管理这套「工程地基」打牢。\n后面 19 个 phase 的每一课都假设你能熟练用 Git 切分支、用 Docker 复现环境、用 uv/venv 隔离依赖、在 Jupyter 里跑实验。\n这一关偷工减料，后面每次环境报错都会回来讨债。",
        formula: [
          "环境隔离：每个项目独立 venv / uv 环境，依赖锁进 requirements",
          "Docker 镜像 = 基础镜像 + 分层构建，一次构建到处运行",
          "GPU 可用 = 驱动 + CUDA toolkit + 框架（PyTorch）三者版本对齐",
          "API key 只走环境变量 / .env，永不进代码与 git"
        ],
        example: [
          "01 · Dev Environment——开发环境总装",
          "03 · GPU Setup and Cloud——本地 GPU 与云端算力打通",
          "06 · Python Environments——venv/uv 依赖隔离",
          "07 · Docker for AI——为 AI 工作负载写 Dockerfile",
          "12 · Debugging and Profiling——调试与性能剖析基本功",
          "仓库目录：phases/00-setup-and-tooling（共 12 课）"
        ],
        tradeoffs: [
          "不要在这一关追求完美配置——能跑通「clone 仓库 → 建环境 → 跑通一个 notebook」就推进，工具熟练度在后面实战里自然长出来",
          "本地 GPU 不是必需的：这一阶段就该学会用 Colab/云 GPU，很多后续课程在免费算力上就能跑",
          "Docker 学到「能写 AI 镜像、能跑容器」即可，编排（K8s）是 phase17 的事，别提前深挖"
        ],
        pitfalls: [
          "把包装进系统 Python——所有依赖冲突的根源，一开始就养成一项目一环境的习惯",
          "把 API key 写进代码或提交进 git——第一个要建立的肌肉记忆就是 .env + .gitignore"
        ]
      },
      diagram: {
        type: "flow",
        title: "工程地基四块",
        items: [
          ["Python 环境", "uv/venv 隔离，依赖可复现"],
          ["Git 协作", "分支/commit/PR，贯穿全程"],
          ["Docker", "环境打包成镜像，消除「我机器上能跑」"],
          ["GPU 与云", "本地或云端算力就绪，API key 入环境变量"]
        ]
      },
      quiz: {
        q: "为什么说 phase00 偷工减料，后面会「回来讨债」？",
        options: [
          "因为后面的课程会考试检查环境配置",
          "因为后续每个 phase 都默认你会 Git/Docker/环境隔离，地基不牢时每次报错都会卡在工具上而不是知识上",
          "因为不装 Docker 就无法安装 PyTorch",
          "因为 Git 不学就无法下载模型权重"
        ],
        answer: 1,
        explain: "这个仓库是 20 个 phase 连续实战，每课都假设环境与工具链已就绪。工具问题会伪装成知识问题反复出现，所以第 0 关的目标是「跑通闭环」，不是配出完美环境。"
      },
      resources: {
        youtube: [
          { title: "Learn Docker – Full DevOps Course for Deploying Containerized Apps", channel: "freeCodeCamp.org", url: "https://www.youtube.com/watch?v=rjjES5IsPdg", why: "freeCodeCamp 官方 Docker 全流程课程，覆盖容器化部署实战" },
          { title: "Git & GitHub Crash Course for Beginners [2026]", channel: "freeCodeCamp.org", url: "https://www.youtube.com/watch?v=mAFoROnOfHs", why: "Git/GitHub 零基础速成，覆盖工程必备版本控制操作" }
        ],
        bilibili: [
          { title: "Docker实战教程，跟架构师学docker，docker入门到大神", up: "尚硅谷", url: "https://www.bilibili.com/video/BV1gr4y1U7CY", why: "尚硅谷官方出品，372万播放，Docker 入门到实战" },
          { title: "Git全套教程，git技术大全（GitHub、Gitee码云、GitLab）", up: "尚硅谷", url: "https://www.bilibili.com/video/BV1vy4y1s7k6", why: "尚硅谷官方 Git 全套，覆盖 GitHub/Gitee/GitLab，137万播放" }
        ],
        keywords: ["uv python 包管理教程", "docker 入门到实战", "git 零基础教学"]
      }
    },
    {
      id: "phase01-math",
      name: "数学基础",
      en: "MATH",
      branch: "prereq",
      deps: ["phase00-setup"],
      grid: { col: 2, row: 0 },
      summary: "线代/微积分/概率/信息论，建立「能算梯度」的直觉",
      repo: "https://github.com/fancyboi999/ai-engineering-from-scratch-zh/tree/main/phases/01-math-foundations",
      sections: {
        principle: "这是所有下游 phase 的公共底座：线性代数解释数据与参数的形状，微积分与链式法则解释梯度怎么流，概率与信息论解释损失函数为什么这么设计。\n课程编排的目标不是学数学，而是「够用」——22 课从向量直觉一路铺到 SVD、傅里叶、图论，核心是把反向传播（phase03）和注意力（phase07）里出现的每个符号都认熟。\n学完你应该能手推一个小网络的梯度，而不是能证明定理。",
        formula: [
          "梯度 ∇f：各参数方向上的偏导向量，指向损失上升最快的方向",
          "链式法则 dL/dx = dL/dy · dy/dx：反向传播的全部数学",
          "贝叶斯 P(A|B) = P(B|A)P(A) / P(B)",
          "熵 H = -Σ p·log p；交叉熵损失就来自这里"
        ],
        example: [
          "01 · Linear Algebra Intuition——向量的几何直觉",
          "05 · Chain Rule and Autodiff——手搓 Value 类自动微分",
          "07 · Bayes Theorem——条件概率与贝叶斯推断",
          "09 · Information Theory——熵、交叉熵与 KL 散度",
          "08 · Optimization——凸优化与梯度下降家族",
          "仓库目录：phases/01-math-foundations（共 22 课）"
        ],
        tradeoffs: [
          "不要陷在数学证明里——目标是建立直觉，能算梯度就行；证明留给真正需要的那天",
          "22 课不必全学：线代/微积分/概率/信息论是主线，傅里叶、图论、随机过程等可按下游需要回头补",
          "手推一遍自动微分（05 课）比看十遍公式有用——它是 phase03 反向传播和 phase10 从零构建的直接预演"
        ],
        pitfalls: [
          "把数学当成独立学科刷完才肯前进——正确姿势是学一课用一课，卡在具体符号上再回来查",
          "只看视频不动手算——梯度这种「会看错看不会」的东西，必须手推一遍才能内化"
        ]
      },
      diagram: {
        type: "tree",
        anim: "autodiffGraph",
        title: "数学底座四大支柱",
        items: [
          ["线性代数", "向量/矩阵/变换 → 参数与数据的形状"],
          ["微积分", "梯度 + 链式法则 → 反向传播"],
          ["概率统计", "分布/贝叶斯 → 模型的不确定性语言"],
          ["信息论", "熵/交叉熵/KL → 损失函数的设计动机"]
        ]
      },
      quiz: {
        q: "学习这一阶段数学的正确深度是？",
        options: [
          "把 22 课全部证明题做完再进 phase02",
          "能看懂符号、能手算小网络的梯度即可，深入主题按需回头补",
          "数学不重要，可以直接跳过",
          "先学完研究生数值分析再来"
        ],
        answer: 1,
        explain: "这个 phase 在路径中的角色是「公共底座」而非数学专业课：下游需要你能认出 ∇f、链式法则、交叉熵并会算，证明与进阶主题（傅里叶/图论等）按需回补即可。"
      },
      resources: {
        youtube: [
          { title: "Vectors | Chapter 1, Essence of linear algebra", channel: "3Blue1Brown", url: "https://www.youtube.com/watch?v=fNk_zzaMoSs", why: "线性代数本质系列第1章，可视化理解向量，AI 数学入门最佳" },
          { title: "The essence of calculus", channel: "3Blue1Brown", url: "https://www.youtube.com/watch?v=WUvTyaaNkzM", why: "微积分本质系列开篇，直观理解导数与积分" }
        ],
        bilibili: [
          { title: "【熟肉】线性代数的本质 - 01 - 向量究竟是什么？", up: "3Blue1Brown", url: "https://www.bilibili.com/video/BV1Ys411k7yQ", why: "3Blue1Brown 官方双语账号，192万播放，线代本质系列第1集" },
          { title: "【官方双语/合集】微积分的本质 - 系列合集", up: "3Blue1Brown", url: "https://www.bilibili.com/video/BV1qW411N7FU", why: "3Blue1Brown 官方双语合集，355万播放，微积分本质全系列" }
        ],
        keywords: ["线性代数的本质", "机器学习数学基础", "微积分可视化入门"]
      }
    },
    {
      id: "phase02-ml",
      name: "经典机器学习",
      en: "CLASSIC ML",
      branch: "prereq",
      deps: ["phase01-math"],
      grid: { col: 3, row: 0 },
      summary: "回归/树/SVM/集成，建立「偏差-方差」的工程直觉",
      repo: "https://github.com/fancyboi999/ai-engineering-from-scratch-zh/tree/main/phases/02-ml-fundamentals",
      sections: {
        principle: "这一站把数学变成「能跑的模型」：从线性回归到树模型、SVM、集成方法，覆盖监督/无监督全家桶。\n它真正的价值不在算法本身（很多已被深度学习取代），而在训练出一套工程直觉——偏差-方差权衡、交叉验证、特征工程、不平衡数据处理，这些判断力在 phase11 调 LLM 系统时依然每天在用。\n18 课走完，你应该能给一个陌生表格数据集快速建立 baseline。",
        formula: [
          "线性回归 min Σ(y - wx - b)²（MSE 损失）",
          "逻辑回归 σ(z) = 1/(1+e^-z)，输出概率",
          "偏差-方差：总误差 = Bias² + Variance + 不可约噪声",
          "Precision = TP/(TP+FP)，Recall = TP/(TP+FN)"
        ],
        example: [
          "02 · Linear Regression——从闭式解到梯度下降",
          "04 · Decision Trees——信息增益与树的生长",
          "10 · Bias-Variance——欠拟合与过拟合的统一视角",
          "11 · Ensemble Methods——Bagging/Boosting 集大成",
          "13 · ML Pipelines——从实验到可复用流水线",
          "仓库目录：phases/02-ml-fundamentals（共 18 课）"
        ],
        tradeoffs: [
          "经典 ML 学到「会建 baseline、会诊断误差」就够——不必深挖每个算法的数学变体，深度需求出现时再回来",
          "表格数据上树模型（XGBoost 系）常胜神经网络：别带着「深度学习万能」的偏见进 phase03",
          "评估指标比模型选择更影响项目成败——不平衡数据上用 accuracy 是最经典的自我欺骗"
        ],
        pitfalls: [
          "跳过评估直接堆模型——09 课（Model Evaluation）和 10 课（Bias-Variance）才是本 phase 的灵魂",
          "以为经典 ML 已被淘汰——特征工程、交叉验证、误差分析是后面所有 LLM 系统评估的底层语言"
        ]
      },
      diagram: {
        type: "compare",
        anim: "fitLine",
        title: "模型族谱速览",
        items: [
          ["线性模型", "可解释、快，表达力有限"],
          ["树与集成", "表格数据王者，抗过拟合靠集成"],
          ["SVM / KNN", "小数据场景的古典武器"],
          ["无监督", "聚类/降维，无标签时找结构"]
        ]
      },
      quiz: {
        q: "一个模型训练集表现极好、测试集崩了，用本 phase 的语言怎么描述，第一反应做什么？",
        options: [
          "模型太小了，换更大的模型",
          "高方差（过拟合），先加正则/数据/简化模型，而不是加大容量",
          "学习率太高了，调小学习率",
          "测试集标注错了，重新标注"
        ],
        answer: 1,
        explain: "训练好测试差 = 低偏差高方差 = 过拟合。偏差-方差框架给出的处方是正则化、更多数据、降低复杂度——这套诊断思维在 phase03 调神经网络、phase11 评估 LLM 系统时反复复用。"
      },
      resources: {
        youtube: [
          { title: "Machine Learning for Everybody – Full Course", channel: "freeCodeCamp.org", url: "https://www.youtube.com/watch?v=i_LwzRVP7bg", why: "经典 ML 全覆盖（回归/树/聚类/评估），Kylie Ying 主讲" },
          { title: "Principal Component Analysis (PCA) clearly explained", channel: "StatQuest with Josh Starmer", url: "https://www.youtube.com/watch?v=_UVHneBUBW0", why: "StatQuest 招牌风格，PCA 降维讲得最清楚的单集" }
        ],
        bilibili: [
          { title: "【机器学习】【白板推导系列】【合集 1～33】", up: "shuhuai008", url: "https://www.bilibili.com/video/BV1aE411o7qd", why: "白板推导原创 UP 主，192万播放，SVM/EM/概率图手工推导" },
          { title: "2022最新版-李宏毅机器学习深度学习课程", up: "DASOU讲AI", url: "https://www.bilibili.com/video/BV1m3411p7wD", why: "李宏毅 2022 课程完整搬运，32万播放，ML 到 DL 一体" }
        ],
        keywords: ["机器学习入门", "白板推导 机器学习", "李宏毅机器学习"]
      }
    },
    {
      id: "phase03-dl",
      name: "深度学习核心",
      en: "DL CORE",
      branch: "prereq",
      deps: ["phase02-ml"],
      grid: { col: 4, row: 0 },
      summary: "反向传播到 mini 框架，神经网络的完整内功",
      repo: "https://github.com/fancyboi999/ai-engineering-from-scratch-zh/tree/main/phases/03-deep-learning-core",
      sections: {
        principle: "前置线最后一关：从感知机到手写反向传播，再到用 PyTorch 搭出自己的 mini 框架。\n这一 phase 把 phase01 的链式法则变成真实代码——你会亲手实现前向、反向、优化器、正则化的完整训练循环，之后所有架构（CNN/Transformer/扩散模型）都只是这套骨架上的变体。\n它是模态线（CV/NLP/语音）、RL、Transformer 三个方向的共同闸门。",
        formula: [
          "前向：z = Wx + b，a = σ(z) 逐层传播",
          "反向：dL/dW = δ · a^T，δ 逐层回传（链式法则）",
          "SGD+momentum：v = βv - η∇L，θ += v",
          "Adam：m、v 一阶二阶矩估计自适应调步长"
        ],
        example: [
          "03 · Backpropagation——手写反向传播全推导",
          "06 · Optimizers——SGD/Momentum/Adam 对比实验",
          "08 · Weight Initialization——Xavier/He 初始化",
          "10 · Mini Framework——手搓一个迷你深度学习框架",
          "11 · Intro to PyTorch——从手写过渡到工业框架",
          "仓库目录：phases/03-deep-learning-core（共 13 课）"
        ],
        tradeoffs: [
          "10 课（mini framework）是本 phase 最高 ROI 的一课：写一遍自己的 autograd，比读三遍框架源码更通透",
          "先手写再 PyTorch，顺序不能反——直接上框架会让反向传播永远是个黑盒",
          "超参（lr、初始化、正则）学「怎么诊断」而不是背默认值：loss 曲线的形状就是诊断报告"
        ],
        pitfalls: [
          "以为调参是玄学——loss 不降先查梯度是否流动（数值稳定性、激活饱和），再谈学习率",
          "跳过 13 课的调试专题——神经网络 debug 能力（梯度检查、形状检查）是后面所有 phase 的救生索"
        ]
      },
      diagram: {
        type: "flow",
        anim: "backpropNet",
        title: "训练循环四步",
        items: [
          ["前向传播", "z=Wx+b，逐层激活"],
          ["算损失", "MSE / 交叉熵"],
          ["反向传播", "链式法则逐层回传 δ"],
          ["参数更新", "SGD/Adam 走一步，循环往复"]
        ]
      },
      quiz: {
        q: "训练时 loss 完全不动，按本 phase 的排查顺序第一步该看什么？",
        options: [
          "马上换 Adam 优化器",
          "检查梯度是否真的在流动：梯度是否为零/爆炸、形状是否对、数据标签是否配对",
          "把网络加深一倍",
          "把 batch size 调到最大"
        ],
        answer: 1,
        explain: "loss 不动最常见的原因是梯度根本没流起来（断链、饱和、形状错、标签错位），而不是优化器不够好。13 课的调试专题就是教这套「先查梯度再调参」的顺序。"
      },
      resources: {
        youtube: [
          { title: "The spelled-out intro to neural networks and backpropagation: building micrograd", channel: "Andrej Karpathy", url: "https://www.youtube.com/watch?v=VMj-3S1tku0", why: "Karpathy Zero to Hero 第1讲，手写自动微分理解反向传播" },
          { title: "Applied Deep Learning with PyTorch - Full Course", channel: "freeCodeCamp.org", url: "https://www.youtube.com/watch?v=CNuI8OWsppg", why: "PyTorch 官方合作完整课程，从张量到训练循环实战" }
        ],
        bilibili: [
          { title: "10 多层感知机 + 代码实现 - 动手学深度学习v2", up: "跟李沐学AI", url: "https://www.bilibili.com/video/BV1hh411U7gn", why: "李沐官方账号课程正片，MLP 原理+PyTorch 实现，66万播放" },
          { title: "【官方双语】深度学习之神经网络的结构 Part 1 ver 2.0", up: "3Blue1Brown", url: "https://www.bilibili.com/video/BV1bx411M7Zx", why: "3Blue1Brown 官方账号，96万播放，感知机与网络结构可视化" }
        ],
        keywords: ["反向传播原理", "pytorch 入门教程", "李沐 动手学深度学习"]
      }
    },
    {
      id: "phase04-cv",
      name: "计算机视觉",
      en: "VISION",
      branch: "modality",
      deps: ["phase03-dl"],
      grid: { col: 1, row: 1 },
      summary: "卷积到扩散，28 课走完视觉全谱系",
      repo: "https://github.com/fancyboi999/ai-engineering-from-scratch-zh/tree/main/phases/04-computer-vision",
      sections: {
        principle: "模态线第一站，也是课程量最大的 phase 之一（28 课）：从手写卷积出发，走完 LeNet→ResNet 的经典脉络，再进入检测（YOLO）、分割（U-Net/Mask R-CNN）、生成（GAN/扩散）三大任务族。\n后半段直接对接前沿：ViT、CLIP 开放词表、NeRF/3D Gaussian Splatting、SAM、VLM——这些内容正是 phase08 生成式 AI 和 phase12 多模态的入场券。\n学完你能独立搭一条从数据到部署的视觉流水线（16 课 capstone）。",
        formula: [
          "卷积输出尺寸 = (n + 2p - f)/s + 1",
          "IoU = 交 / 并，检测与分割的核心度量",
          "残差连接 y = F(x) + x：让 100+ 层网络可训练",
          "扩散：前向 q(x_t|x_{t-1}) 逐步加噪，反向学去噪"
        ],
        example: [
          "02 · Convolutions from Scratch——手写卷积核",
          "03 · CNNs LeNet to ResNet——经典架构演进史",
          "06 · Object Detection YOLO——单阶段检测实战",
          "11 · Stable Diffusion——潜在扩散拆解",
          "18 · Open-Vocab CLIP——开放词表视觉",
          "仓库目录：phases/04-computer-vision（共 28 课）"
        ],
        tradeoffs: [
          "28 课分两类：经典主线（1-11）必学，前沿专题（12-28）按兴趣选——不必全学完才进下一阶段",
          "检测/分割的工程重心在数据与后处理而非新架构：吃透 YOLO 和 U-Net 各一个，胜过浅尝五个变体",
          "生成部分（09-11、23）与 phase08 有大量重叠——可以学一个、对照另一个，建立双向参照"
        ],
        pitfalls: [
          "只刷分类任务——工业界 CV 的主战场是检测/分割/检索，分类只是教学入口",
          "忽略 15 课（实时边缘部署）——模型精度之外的延迟与算力约束，才是视觉工程的真正考题"
        ]
      },
      diagram: {
        type: "tree",
        anim: "convSlide",
        title: "视觉任务三族",
        items: [
          ["理解", "分类 → 检测（YOLO）→ 分割（U-Net/SAM）"],
          ["生成", "GAN → 扩散 → DiT/Rectified Flow"],
          ["前沿", "ViT / CLIP / NeRF / 3DGS / VLM"],
          ["出口", "→ phase08 生成式、phase12 多模态"]
        ]
      },
      quiz: {
        q: "ResNet 的残差连接 y = F(x)+x 为什么能让上百层网络可训练？",
        options: [
          "它减少了参数量",
          "梯度可以通过恒等捷径直接回传，缓解深层网络的梯度消失",
          "它让每张图片变大",
          "它替代了归一化层"
        ],
        answer: 1,
        explain: "深层网络的根本障碍是梯度回传衰减；残差连接给出一条 y=x 的恒等通路，让梯度近乎无损地流到浅层。这个「让信息有捷径」的思想后来在 Transformer 的残差结构里再次出现。"
      },
      resources: {
        youtube: [
          { title: "Hot Dog or Not Hot Dog – Convolutional Neural Network Course for Beginners", channel: "freeCodeCamp.org", url: "https://www.youtube.com/watch?v=nVhau51w6dM", why: "CNN 零基础完整课程，含卷积/池化/迁移学习实战" },
          { title: "OpenCV Tutorial - Develop Computer Vision Apps in the Cloud With Python", channel: "freeCodeCamp.org", url: "https://www.youtube.com/watch?v=iXNsAYOTzgM", why: "OpenCV 工程实战课，补足 CV 工具链与部署" }
        ],
        bilibili: [
          { title: "24 深度卷积神经网络 AlexNet【动手学深度学习v2】", up: "跟李沐学AI", url: "https://www.bilibili.com/video/BV1h54y1L7oe", why: "李沐官方课程 AlexNet 讲次，CNN 经典网络脉络入门，33万播放" },
          { title: "3.1 YOLO系列理论合集(YOLOv1~v3)", up: "霹雳吧啦Wz", url: "https://www.bilibili.com/video/BV1yi4y1g7ro", why: "CV 区口碑 UP 主，43万播放，YOLO v1-v3 理论逐代精讲" }
        ],
        keywords: ["卷积神经网络入门", "yolo 目标检测实战", "resnet 残差网络讲解"]
      }
    },
    {
      id: "phase05-nlp",
      name: "NLP 基础到进阶",
      en: "NLP",
      branch: "modality",
      deps: ["phase03-dl"],
      grid: { col: 2, row: 1 },
      summary: "从词袋到注意力，通向 Transformer 的引桥",
      repo: "https://github.com/fancyboi999/ai-engineering-from-scratch-zh/tree/main/phases/05-nlp-foundations-to-advanced",
      sections: {
        principle: "模态线枢纽：从词袋/TF-IDF、word2vec 词向量起步，经 RNN、seq2seq 走到注意力机制——这条路刻意复刻了 NLP 的历史演进，让你理解 Transformer（phase07）到底解决了什么。\n后半段已是现代内容：subword 分词、embedding 模型深挖、RAG 分块策略、结构化输出、LLM 评估框架，直接服务 phase11 的 LLM 工程。\n它是 speech（phase06）与 transformers（phase07）两条线的共同上游。",
        formula: [
          "TF-IDF = TF × log(N/df)：词频乘逆文档频率",
          "word2vec skip-gram：用中心词预测上下文",
          "seq2seq + attention：解码时动态聚焦源端位置",
          "softmax(QK^T)V：注意力的第一次登场（10 课）"
        ],
        example: [
          "02 · Bag of Words & TF-IDF——文本的第一次向量化",
          "03 · Word Embeddings Word2Vec——语义装进向量空间",
          "09 · Sequence to Sequence——编码器-解码器范式",
          "10 · Attention Mechanism——注意力首次登场",
          "23 · Chunking Strategies RAG——检索分块实战",
          "仓库目录：phases/05-nlp-foundations-to-advanced（共 29 课）"
        ],
        tradeoffs: [
          "历史脉络（1-16 课）学「为什么」：RNN 的长程依赖困境正是注意力的存在理由，别当成过时知识跳过",
          "现代部分（19-29 课）学「怎么用」：分词、分块、评估是 phase11 RAG 工程的直接弹药，值得放慢",
          "词向量不用自己训——理解 skip-gram 原理后，工程上直接用现成 embedding 模型（22 课）"
        ],
        pitfalls: [
          "以为注意力是 Transformer 发明的——10 课的 seq2seq 注意力才是源头，理解它才能看懂 Q/K/V",
          "跳过 19 课 subword 分词——BPE 是所有 LLM 的入口，不懂它就无法真正理解 token 计费与上下文窗口"
        ]
      },
      diagram: {
        type: "flow",
        title: "NLP 技术演进线",
        items: [
          ["词袋/TF-IDF", "词频统计，无语义"],
          ["word2vec/GloVe", "词向量，语义进空间"],
          ["RNN/seq2seq", "建模序列，长程依赖吃力"],
          ["注意力机制", "动态聚焦 → 直通 phase07"]
        ]
      },
      quiz: {
        q: "为什么这一阶段要先学 RNN 的困境再学注意力？",
        options: [
          "因为 RNN 在面试中还会考",
          "注意力机制正是为解决 RNN 长程依赖与无法并行的问题而生，理解痛点才能理解设计动机",
          "因为 RNN 比 Transformer 更省显存",
          "没有原因，只是历史顺序"
        ],
        answer: 1,
        explain: "RNN 按序处理、梯度沿时间衰减，长文本记不住也并行不了；注意力让任意两个位置直接交互，一次性解决这两个痛点。带着「解决什么问题」的视角进 phase07，Transformer 的每个组件都会有答案。"
      },
      resources: {
        youtube: [
          { title: "Let's build GPT: from scratch, in code, spelled out.", channel: "Andrej Karpathy", url: "https://www.youtube.com/watch?v=kCc8FmEb1nY", why: "Karpathy 手写 GPT，Attention/预训练机制逐行实现" },
          { title: "Natural Language Processing with spaCy & Python - Course for Beginners", channel: "freeCodeCamp.org", url: "https://www.youtube.com/watch?v=dIUTsFT2MeQ", why: "NLP 工程入门完整课，词向量到 pipeline 实践" }
        ],
        bilibili: [
          { title: "Transformer论文逐段精读【论文精读】", up: "跟李沐学AI", url: "https://www.bilibili.com/video/BV1pu411o7BE", why: "李沐官方账号，182万播放，Attention Is All You Need 逐段精讲" },
          { title: "李宏毅 | 自注意力机制和Transformer详细解析", up: "李宏毅深度学习课堂", url: "https://www.bilibili.com/video/BV1r8nMz4EAj", why: "李宏毅课程搬运，9.2万播放，Self-Attention 新手友好讲解" }
        ],
        keywords: ["transformer 原理讲解", "注意力机制 李宏毅", "rag 检索增强实战"]
      }
    },
    {
      id: "phase06-speech",
      name: "语音与音频",
      en: "SPEECH",
      branch: "modality",
      deps: ["phase05-nlp"],
      grid: { col: 3, row: 1 },
      summary: "频谱图/ASR/TTS，打通语音助手全链路",
      repo: "https://github.com/fancyboi999/ai-engineering-from-scratch-zh/tree/main/phases/06-speech-and-audio",
      sections: {
        principle: "模态线收尾：把 NLP 的序列建模能力迁移到声音领域。\n核心转换只有一步——声音波形经 STFT 变成梅尔频谱图，之后 ASR（Whisper）、TTS、声音克隆本质上都是「图像/序列到序列」问题，前面学的 CNN 与 Transformer 直接复用。\n17 课以 Whisper 架构与微调为中轴，最终收束到实时语音助手管线（12 课）和流式 speech-to-speech（15 课）这些前沿工程形态。",
        formula: [
          "梅尔刻度 m = 2595 · log10(1 + f/700)：模拟人耳听觉",
          "STFT：分帧加窗 → FFT → 功率谱 → 梅尔滤波 → log",
          "ASR：频谱图 → encoder → decoder → 文本",
          "TTS 反方向：文本 → 声学特征 → 声码器 → 波形"
        ],
        example: [
          "02 · Spectrograms & Mel Features——声音的可视化入口",
          "04 · Speech Recognition ASR——识别系统全流程",
          "05 · Whisper Architecture & Finetuning——架构拆解与微调",
          "07 · Text-to-Speech——语音合成管线",
          "12 · Voice Assistant Pipeline——语音助手综合实战",
          "仓库目录：phases/06-speech-and-audio（共 17 课）"
        ],
        tradeoffs: [
          "语音方向工程重心在「实时性」：11/14/15 课的流式处理、VAD 与轮次检测，比模型精度更决定产品体验",
          "Whisper 是最佳学习载体：开源、文档全、微调资料多，吃透它等于吃透现代 ASR",
          "TTS 与声音克隆（07/08）涉及伦理风险——学习时同步关注 16 课的反欺诈与水印"
        ],
        pitfalls: [
          "跳过频谱特征直接调 Whisper API——不理解梅尔频谱，就无法诊断识别错误是信号问题还是模型问题",
          "以为语音只是「ASR + TTS」两个 API——真实的语音助手是 VAD、轮次检测、流式合成的系统工程"
        ]
      },
      diagram: {
        type: "flow",
        title: "语音助手全链路",
        items: [
          ["波形", "16kHz 采样原始信号"],
          ["梅尔频谱", "STFT → 听觉刻度特征图"],
          ["ASR（Whisper）", "频谱 → 文本"],
          ["LLM 理解与生成", "对接 phase05/07 的语言能力"],
          ["TTS/声码器", "文本 → 波形输出"]
        ]
      },
      quiz: {
        q: "为什么语音模型普遍先把波形转成梅尔频谱图，而不是直接吃原始波形？",
        options: [
          "因为频谱图更好看",
          "梅尔频谱把信号压成对齐人耳感知的低维时频表示，让 CNN/Transformer 可以直接复用",
          "因为波形数据无法存储",
          "因为 GPU 只能处理图片"
        ],
        answer: 1,
        explain: "原始波形是上万采样点/秒的高维时序，直接建模代价巨大；STFT + 梅尔滤波把它压缩成「时间 × 频率」的二维图，且频率轴按人耳感知非线性拉伸——之后卷积和注意力就能像处理图像一样处理声音。"
      },
      resources: {
        youtube: [
          { title: "Open AI's Whisper is Amazing!", channel: "sentdex", url: "https://www.youtube.com/watch?v=OCBZtgQGt1I", why: "sentdex 第一时间上手 Whisper，语音识别效果与用法直观展示" },
          { title: "How to do Free Speech-to-Text Transcription Better Than Google Premium API with OpenAI Whisper Model", channel: "SECourses", url: "https://www.youtube.com/watch?v=msj3wuYf3d8", why: "SECourses 出品的 Whisper 免费转录完整教程，附本地部署细节" }
        ],
        bilibili: [
          { title: "【干货】超详细OpenAI Whisper 本地部署安装与使用超强教程", up: "Ma5老师", url: "https://www.bilibili.com/video/BV1Vte8zLEmw", why: "3.8万播放的 Whisper 本地部署+转录字幕全流程教程" },
          { title: "音频视频语音识别转文本字幕工具 faster-whisper 1.2 整合包", up: "AI画师大阳", url: "https://www.bilibili.com/video/BV1DPayzgEAX", why: "faster-whisper 加速版实战，批量转录字幕，支持 Mac" }
        ],
        keywords: ["whisper 语音识别教程", "语音转文字 本地部署", "tts 语音合成 ai"]
      }
    },
    {
      id: "phase07-transformers",
      name: "Transformer 深入",
      en: "TRANSFORMER",
      branch: "core",
      deps: ["phase05-nlp"],
      grid: { col: 5, row: 1 },
      summary: "自注意力手推到 scaling law，核心线的引擎室",
      repo: "https://github.com/fancyboi999/ai-engineering-from-scratch-zh/tree/main/phases/07-transformers-deep-dive",
      sections: {
        principle: "核心线的发动机：16 课把 Transformer 从论文公式拆成可手写的组件——自注意力、多头、位置编码、完整架构，然后沿 BERT（掩码）/GPT（因果）/T5（编解码）三条演化线看架构如何分叉。\n工程纵深同样给足：MoE、KV Cache 与 FlashAttention、投机解码、Scaling Laws——这四块是理解一切现代 LLM 推理与训练成本的地基。\n14 课的 capstone 要求从零手搓一个完整 Transformer，这是通往 phase10「从零构建 LLM」的入场券。",
        formula: [
          "Attention(Q,K,V) = softmax(QK^T / √d_k) V",
          "多头：head_i = Attention(QW_i^Q, KW_i^K, VW_i^V)，拼接后过 W^O",
          "FFN(x) = max(0, xW_1+b_1)W_2 + b_2，参数大头在这里",
          "KV Cache/token = 2 × 层数 × 头数 × 头维 × 字节数"
        ],
        example: [
          "02 · Self-Attention from Scratch——QK^T/√d 手写实现",
          "04 · Positional Encoding——正弦编码与位置注入",
          "06 · BERT Masked Language Modeling——双向预训练",
          "12 · KV Cache & Flash Attention——推理加速双引擎",
          "13 · Scaling Laws——参数量/数据量/算力的幂律",
          "仓库目录：phases/07-transformers-deep-dive（共 16 课）"
        ],
        tradeoffs: [
          "02 课手写注意力是分水岭：能手推 softmax(QK^T/√d)V 的人，看 FlashAttention、MoE 都是「同一主题变奏」",
          "BERT/GPT/T5 三条线重点在「掩码方式决定用途」：理解双向理解 vs 单向生成的分野，不必每个变体都复现",
          "12/16 课（KV Cache、FlashAttention、投机解码）是 phase17 推理部署的理论地基——现在学机制，部署时学工程"
        ],
        pitfalls: [
          "忘除 √d_k——d_k 大时点积方差膨胀，softmax 饱和梯度消失，这是面试与实战的第一翻车点",
          "以为注意力只是算法——O(N²) 的显存物化才是长上下文的真正瓶颈，这正是 FlashAttention 存在的理由"
        ]
      },
      diagram: {
        type: "flow",
        anim: "attnGrid",
        title: "Transformer Block 数据流",
        items: [
          ["输入 embedding + 位置编码", "token 向量 + 顺序信息"],
          ["多头自注意力", "softmax(QK^T/√d)V，O(N²)"],
          ["残差 + LayerNorm", "梯度高速公路"],
          ["FFN（2/3 参数）", "逐位置非线性变换"],
          ["×N 层堆叠", "→ phase10 从零组装完整 LLM"]
        ]
      },
      quiz: {
        q: "注意力分数为什么要除以 √d_k？",
        options: [
          "为了让分数落在 [0,1] 区间",
          "d_k 大时点积方差随之变大，不缩放会把 softmax 压进饱和区导致梯度消失",
          "为了凑出 O(N²) 复杂度",
          "CUDA kernel 的硬性规定"
        ],
        answer: 1,
        explain: "d_k 维向量点积的方差随 d_k 增长，不缩放时 softmax 输入过大进入饱和区、梯度趋零。除以 √d_k 把方差归一。顺带记住：N×N 注意力矩阵的 O(N²) 物化正是 KV Cache 与 FlashAttention（12 课）要解决的。"
      },
      resources: {
        youtube: [
          { title: "Attention in transformers, step-by-step | Deep Learning Chapter 6", channel: "3Blue1Brown", url: "https://www.youtube.com/watch?v=eMlx5fFNoYc", why: "用可视化逐层拆解自注意力机制，是理解 Transformer 最直观的入门视频" },
          { title: "Attention Is All You Need", channel: "Yannic Kilcher", url: "https://www.youtube.com/watch?v=iDulhoQ2pro", why: "逐段精读 Transformer 原始论文，理解架构设计动机" }
        ],
        bilibili: [
          { title: "Transformer论文逐段精读【论文精读】", up: "跟李沐学AI", url: "https://www.bilibili.com/video/BV1pu411o7BE", why: "李沐逐段精读原论文并联系代码实现，B站180万+播放的经典" },
          { title: "台大李宏毅21年机器学习课程 self-attention和transformer", up: "爱学习的凉饭爷", url: "https://www.bilibili.com/video/BV1Xp4y1b7ih", why: "李宏毅用生活化类比讲透 self-attention 的计算过程，适合零基础" }
        ],
        keywords: ["transformer原理讲解", "自注意力机制动画演示", "手搓transformer"]
      }
    },
    {
      id: "phase08-genai",
      name: "生成式 AI",
      en: "GEN AI",
      branch: "core",
      deps: ["phase07-transformers", "phase04-cv"],
      grid: { col: 6, row: 1 },
      summary: "VAE/GAN/扩散三代生成范式，AI 绘画的底层",
      repo: "https://github.com/fancyboi999/ai-engineering-from-scratch-zh/tree/main/phases/08-generative-ai",
      sections: {
        principle: "生成模型的三代同堂：VAE（潜空间概率建模）、GAN（生成对抗博弈）、扩散（加噪-去噪迭代）——本 phase 把三代范式全部从零实现一遍，再落到 Stable Diffusion、ControlNet/LoRA 这些工业级形态。\n它吃 phase07 的架构功力（DiT、注意力条件注入）和 phase04 的视觉功底（U-Net、FID 评估），所以排在两者之后。\n学完你能解释每张 AI 生成图背后的完整数学链条，并亲手给扩散模型加条件控制。",
        formula: [
          "VAE：ELBO = 重构项 - KL(q(z|x) ‖ p(z))",
          "GAN：min_G max_D E[log D(x)] + E[log(1 - D(G(z)))]",
          "DDPM：前向 q(x_t|x_{t-1}) 加噪，训练目标 = 预测噪声 ε",
          "Latent Diffusion：先 VAE 压到潜空间再扩散，算力省一个量级"
        ],
        example: [
          "02 · Autoencoders & VAE——重参数化与潜空间",
          "03 · GANs Generator vs Discriminator——博弈训练从零实现",
          "06 · Diffusion DDPM from Scratch——手写扩散",
          "07 · Latent Diffusion & Stable Diffusion——工业级拆解",
          "08 · ControlNet & LoRA Conditioning——条件控制两件套",
          "仓库目录：phases/08-generative-ai（共 15 课）"
        ],
        tradeoffs: [
          "三代范式都要学，但精力分配 2:3:5——扩散是当前工业主流，DDPM 手写（06 课）是本 phase 的灵魂",
          "GAN 学博弈思想即可：训练不稳定是常态，实战中它已被扩散在多数场景取代",
          "ControlNet/LoRA（08 课）是「生成式 AI 工程化」的核心技能——不改底座、只加控制，这个范式在 LLM 微调里同样成立"
        ],
        pitfalls: [
          "以为扩散模型是「从噪声直接一步生成」——它是几十步迭代去噪，步数与质量的权衡是工程核心",
          "跳过 14 课评估——FID/CLIP Score 不看，就无法判断自己的「效果更好」是真实提升还是过拟合 prompt"
        ]
      },
      diagram: {
        type: "compare",
        anim: "diffuseStrip",
        title: "三代生成范式",
        items: [
          ["VAE", "潜空间 + ELBO，生成快但偏模糊"],
          ["GAN", "对抗博弈，锐利但训练不稳"],
          ["Diffusion", "迭代去噪，质量王者、速度慢"],
          ["工业形态", "Latent Diffusion + ControlNet/LoRA"]
        ]
      },
      quiz: {
        q: "Stable Diffusion 为什么选择在 VAE 潜空间而不是像素空间做扩散？",
        options: [
          "潜空间颜色更好看",
          "潜空间把 H×W×3 压到小得多的表示，扩散的每步去噪成本降低一个量级，质量损失却很小",
          "像素空间不能加噪",
          "因为 GAN 在像素空间失败了"
        ],
        answer: 1,
        explain: "扩散要迭代几十步去噪，每步都在完整分辨率上做 U-Net 前向代价极高；先用 VAE 编码器把图像压进潜空间，扩散在潜空间进行、最后解码回像素——这就是 Latent Diffusion 的核心取舍（07 课）。"
      },
      resources: {
        youtube: [
          { title: "What are Diffusion Models?", channel: "Ari Seff", url: "https://www.youtube.com/watch?v=fbLgFrlTnGU", why: "从数学直觉讲清扩散模型的前向加噪与反向去噪，配图优秀" },
          { title: "Variational Autoencoders", channel: "Arxiv Insights", url: "https://www.youtube.com/watch?v=9zKuYvjFFS8", why: "系统讲解 VAE 的重参数化技巧与潜空间结构" }
        ],
        bilibili: [
          { title: "扩散模型 - Diffusion Model【李宏毅2023】", up: "想不出来昵称又想改", url: "https://www.bilibili.com/video/BV14c411J7f2", why: "李宏毅2023年扩散模型专题课，33万+播放，原理讲得最透的中文课" },
          { title: "李宏毅对抗生成网络(GAN)国语教程(2018)", up: "爱可可-爱生活", url: "https://www.bilibili.com/video/BV1Up411R7Lk", why: "GAN 经典国语教程，覆盖生成器/判别器博弈思想与各变体" }
        ],
        keywords: ["扩散模型原理", "AI绘画原理 stable diffusion", "GAN生成对抗网络入门"]
      }
    },
    {
      id: "phase09-rl",
      name: "强化学习",
      en: "RL",
      branch: "core",
      deps: ["phase03-dl"],
      grid: { col: 7, row: 1 },
      summary: "MDP 到 PPO，RLHF 的数学故乡",
      repo: "https://github.com/fancyboi999/ai-engineering-from-scratch-zh/tree/main/phases/09-reinforcement-learning",
      sections: {
        principle: "与模态线并行的第三支：从 MDP（状态/动作/奖励）这套决策语言出发，走完 Q-learning、DQN、策略梯度、Actor-Critic 到 PPO 的经典脉络。\n对 LLM 学习者而言，9 课（Reward Modeling & RLHF）才是战略要地——ChatGPT 式的对齐训练，本质就是把 PPO 用在语言模型上，这一课直接通向 phase10 的 RLHF/DPO 和 phase18 的对齐研究。\n12 课完整走完「从游戏 AI 到大模型对齐」的 RL 全景。",
        formula: [
          "MDP 五元组 (S, A, P, R, γ)：状态/动作/转移/奖励/折扣",
          "贝尔曼方程 Q(s,a) = r + γ·max Q(s',a')",
          "策略梯度 ∇J = E[∇log π(a|s) · A]",
          "PPO：clip(ratio, 1-ε, 1+ε)，限制策略更新步幅"
        ],
        example: [
          "01 · MDPs States Actions Rewards——决策问题建模",
          "04 · Q-Learning & SARSA——表格法两大经典",
          "05 · DQN——深度网络 + 经验回放",
          "08 · PPO——工业界默认的策略优化算法",
          "09 · Reward Modeling & RLHF——通往 LLM 对齐的桥",
          "仓库目录：phases/09-reinforcement-learning（共 12 课）"
        ],
        tradeoffs: [
          "目标如果是 LLM 方向，重心放 06-09（策略梯度/Actor-Critic/PPO/RLHF），游戏向内容（11/12）按需选学",
          "Q-learning 系（值函数）与 PPO 系（策略梯度）都要懂思想，但只需亲手实现一边——另一边读懂代码即可",
          "RL 训练的不稳定性远超监督学习：reward shaping 与种子复现是本 phase 隐含的工程课"
        ],
        pitfalls: [
          "以为 RLHF 就是「加个奖励按钮」——奖励模型本身是用人类偏好数据训练的另一个模型，会过拟合也会被 hack（phase18 的 reward hacking 专题等着收这个问题）",
          "跳过 MDP 形式化直接学 PPO——没有把问题写成 (S,A,P,R,γ) 的能力，连 reward 设计都会跑偏"
        ]
      },
      diagram: {
        type: "flow",
        anim: "gridWorld",
        title: "RL 算法演进线",
        items: [
          ["MDP 建模", "状态/动作/奖励/折扣"],
          ["值函数路线", "Q-learning → DQN"],
          ["策略路线", "REINFORCE → Actor-Critic → PPO"],
          ["战略出口", "PPO + 奖励模型 → RLHF → phase10/18"]
        ]
      },
      quiz: {
        q: "PPO 的 clip 操作（把概率比裁到 [1-ε, 1+ε]）解决什么问题？",
        options: [
          "防止奖励出现负数",
          "限制单次策略更新的幅度，避免一步走太远导致训练崩溃",
          "压缩模型参数量",
          "让 exploration 更充分"
        ],
        answer: 1,
        explain: "策略梯度方法对步长极其敏感，一次过大的更新可能让策略崩塌且无法恢复；PPO 用 clip 把新旧策略的概率比限制在 ε 邻域内，换来训练的稳定性——这也是它成为 RLHF 默认算法的原因（09 课）。"
      },
      resources: {
        youtube: [
          { title: "An introduction to Reinforcement Learning", channel: "Arxiv Insights", url: "https://www.youtube.com/watch?v=JgvyzIkgxF0", why: "一集讲清 RL 基本概念框架：智能体、环境、奖励与策略" },
          { title: "AlphaGo - The Movie | Full award-winning documentary", channel: "Google DeepMind", url: "https://www.youtube.com/watch?v=WXuK6gekU1Y", why: "DeepMind 官方纪录片，直观感受强化学习+蒙特卡洛树搜索的历史性时刻" }
        ],
        bilibili: [
          { title: "零基础学习强化学习算法：ppo", up: "RethinkFun", url: "https://www.bilibili.com/video/BV1iz421h7gb", why: "RethinkFun 从零推导 PPO，29万+播放，兼顾公式与直觉" },
          { title: "【强化学习 原理+代码】彻底搞懂：Q-learning Sarsa, DQN, 蒙特卡洛树原理与代码分析", up: "卢菁博士", url: "https://www.bilibili.com/video/BV1dEXvYwEvu", why: "100万+播放，Q-learning/DQN 原理配代码逐行讲解" }
        ],
        keywords: ["强化学习入门", "PPO算法讲解", "AlphaGo原理"]
      }
    },
    {
      id: "phase10-llm-scratch",
      name: "从零构建 LLM",
      en: "LLM SCRATCH",
      branch: "core",
      deps: ["phase07-transformers"],
      grid: { col: 8, row: 1 },
      summary: "nanoGPT 式全流程：分词/预训练/SFT/DPO/量化",
      repo: "https://github.com/fancyboi999/ai-engineering-from-scratch-zh/tree/main/phases/10-llms-from-scratch",
      sections: {
        principle: "核心线的集大成：亲手造一个完整的 LLM  pipeline——手写 BPE 分词器、搭数据管线、预训练 mini GPT、指令微调（SFT）、RLHF/DPO 对齐、评估、量化与推理优化，一个环节都不外包。\n这是 nanoGPT 式「从零实现」的完整版：不只跑通架构，而是把工业界训练一个模型的全部工序（含分布式 scaling）都亲手过一遍。\n后半段直接拆解前沿：DeepSeek-V3、Jamba 混合架构、Native Sparse Attention、Multi-Token Prediction——让你读懂 2026 年最先进模型的架构选型。",
        formula: [
          "BPE：反复合并最高频字节对，词表逐步长大",
          "预训练目标：下一个 token 的交叉熵损失",
          "DPO：直接用偏好对优化，跳过奖励模型",
          "INT8 量化：W_q = round(W/s)，权重显存 ÷4（vs FP32）"
        ],
        example: [
          "02 · Building a Tokenizer——手写 BPE 分词器",
          "04 · Pre-training Mini GPT——nanoGPT 式预训练",
          "06 · Instruction Tuning SFT——指令微调",
          "08 · DPO——无奖励模型的偏好对齐",
          "13 · Building Complete LLM Pipeline——全流程总装",
          "仓库目录：phases/10-llms-from-scratch（共 25 课）"
        ],
        tradeoffs: [
          "mini GPT 训得出.loss 降得下就是胜利——别纠结模型大小，pipeline 的每一环在大模型上是同构的",
          "SFT/RLHF/DPO 三件套（06-08）是对齐的主线：DPO 因简单稳定已成工业默认，RLHF 学原理即可",
          "11/12 课（量化、推理优化）是 phase17 的前哨：在这里理解 INT8/KV Cache 的机制，部署时才不会把 vLLM 当魔法"
        ],
        pitfalls: [
          "以为「从零构建」= 只写模型类——数据管线（03 课）才是预训练工程量的大头，清洗与配比决定上限",
          "跳过 05 课分布式——单卡思维无法读懂任何真实训练，至少要知道 DP/FSDP/流水并行各自切的是什么"
        ]
      },
      diagram: {
        type: "flow",
        anim: "decodeLoop",
        title: "LLM 诞生流水线",
        items: [
          ["Tokenizer（BPE）", "文本 → token 序列"],
          ["数据管线", "清洗/配比/滑动窗口"],
          ["预训练", "mini GPT，下一 token 预测"],
          ["对齐", "SFT → RLHF/DPO"],
          ["压缩上线", "量化 + 推理优化 → phase11"]
        ]
      },
      quiz: {
        q: "DPO 相比 RLHF 的核心简化是什么？",
        options: [
          "不需要人类偏好数据",
          "不用训练单独的奖励模型、也不用跑 PPO，直接用偏好对做闭式优化",
          "不需要 SFT 阶段",
          "可以用更小的模型"
        ],
        answer: 1,
        explain: "RLHF 要训奖励模型 + 跑不稳定的 PPO 强化学习；DPO 用数学变换把偏好学习转化为直接在成对数据上的分类式目标（08 课），稳定性和工程复杂度都大幅改善——这也是它迅速成为开源社区默认对齐方案的原因。"
      },
      resources: {
        youtube: [
          { title: "Let's build GPT: from scratch, in code, spelled out.", channel: "Andrej Karpathy", url: "https://www.youtube.com/watch?v=kCc8FmEb1nY", why: "Karpathy 带你从零写 nanoGPT，从零构建 LLM 的标杆课程" },
          { title: "Let's build the GPT Tokenizer", channel: "Andrej Karpathy", url: "https://www.youtube.com/watch?v=zduSFxRajkE", why: "手写 BPE 分词器，补上 LLM  pipeline 中最容易被忽略的一环" }
        ],
        bilibili: [
          { title: "GPT，GPT-2，GPT-3 论文精读【论文精读】", up: "跟李沐学AI", url: "https://www.bilibili.com/video/BV1AF411b7xQ", why: "李沐一口气读完三代 GPT 论文，理解 GPT 架构演进脉络" },
          { title: "LLMs-Zero-to-Hero，完全从零手写大模型，从数据处理到模型训练", up: "袁朝发", url: "https://www.bilibili.com/video/BV1qWwke5E3K", why: "中文 nanoGPT 复现教程，一小时跟练从数据处理到训练全流程" }
        ],
        keywords: ["从零手搓GPT", "nanoGPT复现", "大模型训练原理"]
      }
    },
    {
      id: "phase11-llm-eng",
      name: "LLM 工程",
      en: "LLM ENG",
      branch: "eng",
      deps: ["phase10-llm-scratch"],
      grid: { col: 5, row: 2 },
      summary: "Prompt/RAG/微调/护栏，从模型到产品的工程线",
      repo: "https://github.com/fancyboi999/ai-engineering-from-scratch-zh/tree/main/phases/11-llm-engineering",
      sections: {
        principle: "工程线起点，也是从「懂模型」到「做产品」的换乘站：prompt 工程、few-shot/CoT、结构化输出、embedding、上下文工程、RAG 与进阶 RAG、LoRA 微调、function calling、评估、缓存与成本、护栏，最后在 13 课合成一个生产级应用。\n它只要求 phase10 的理解深度——知道模型怎么训的，才知道 prompt、RAG、微调三条增强路线各自的边界在哪里。\n这一 phase 是工程线（12/13）、agent 线（14）和 infra（17）三条下游线的总源头。",
        formula: [
          "增强路线选择：Prompt → RAG → 微调，成本递增",
          "RAG：query 向量化 → top-k 检索 → 塞入上下文 → 生成",
          "LoRA：W' = W + BA，B∈R^{d×r}、A∈R^{r×k}，r≪d",
          "成本 = (输入 token × 输入价 + 输出 token × 输出价) × QPS"
        ],
        example: [
          "02 · Few-shot & CoT——思维链激发推理",
          "06 · RAG——检索增强生成完整实现",
          "08 · Fine-tuning LoRA——低秩适配微调",
          "11 · Caching & Cost——缓存与成本工程",
          "13 · Production App——生产级应用总装",
          "仓库目录：phases/11-llm-engineering（共 17 课）"
        ],
        tradeoffs: [
          "先用 prompt 榨干、再用 RAG 补知识、最后才微调——微调解决的是「格式与行为」，不是「知识」，顺序反了就是烧钱",
          "RAG 的效果七分在检索（分块/embedding/rerank）三分在生成：phase05 的 23 课分块策略在这里直接变现",
          "11 课缓存与成本是产品生死线：prompt caching + 语义缓存常能砍掉大半账单，别等上线才算账"
        ],
        pitfalls: [
          "以为微调能增强知识——知识注入靠 RAG，微调管风格/格式/任务行为，混淆两者是最贵的误判",
          "没有评估集就上线——10 课的评估框架不是可选项，没有它每次改 prompt 都是在盲人摸象"
        ]
      },
      diagram: {
        type: "compare",
        title: "三条增强路线",
        items: [
          ["Prompt 工程", "零成本先试，天花板是上下文窗口"],
          ["RAG", "外挂知识库，解决时效与私有知识"],
          ["LoRA 微调", "改行为与格式，成本最高"],
          ["生产三件套", "评估 + 缓存 + 护栏"]
        ]
      },
      quiz: {
        q: "客户说「模型不知道我们公司的最新政策」，按本 phase 的路线选择，第一动作是？",
        options: [
          "立刻用公司文档做全量微调",
          "上 RAG：把政策文档入库检索，让模型基于检索结果回答",
          "换更大的模型",
          "把政策全文塞进每次请求的 prompt"
        ],
        answer: 1,
        explain: "「缺知识」是检索问题不是行为问题：RAG 用检索把最新知识动态注入上下文，知识更新只需更新文档库；微调管的是格式与行为，且每次知识变更都要重训。路线口诀：Prompt → RAG → 微调，成本递增、按需升级。"
      },
      resources: {
        youtube: [
          { title: "[1hr Talk] Intro to Large Language Models", channel: "Andrej Karpathy", url: "https://www.youtube.com/watch?v=zjkBMFhNj_g", why: "Karpathy 一小时纵览 LLM 训练、微调与安全全景，工程视角极佳" },
          { title: "What is Retrieval-Augmented Generation (RAG)?", channel: "IBM Technology", url: "https://www.youtube.com/watch?v=T-D1OfcDW1M", why: "IBM 出品的 RAG 概念精讲，快速建立检索增强生成的工程认知" }
        ],
        bilibili: [
          { title: "吴恩达《检索增强生成 Retrieval Augmented Generation (RAG)》（DeepLearning.AI 中英字幕）", up: "半途不而废的程序猿", url: "https://www.bilibili.com/video/BV1eecUz7ExG", why: "DeepLearning.AI 官方 RAG 短课搬运，体系化讲检索与评估" },
          { title: "【中文完整版全9集】ChatGPT提示词工程师教程 吴恩达xOpenAI官方", up: "十元钱钱", url: "https://www.bilibili.com/video/BV1AT41187qt", why: "吴恩达与 OpenAI 合作的 Prompt Engineering 官方课程中字版" }
        ],
        keywords: ["RAG知识库搭建", "大模型微调LoRA", "prompt提示词工程"]
      }
    },
    {
      id: "phase12-multimodal",
      name: "多模态 AI",
      en: "MULTIMODAL",
      branch: "eng",
      deps: ["phase11-llm-eng", "phase04-cv"],
      grid: { col: 6, row: 2 },
      summary: "CLIP 到 LLaVA，视觉与语言的桥接工程",
      repo: "https://github.com/fancyboi999/ai-engineering-from-scratch-zh/tree/main/phases/12-multimodal-ai",
      sections: {
        principle: "工程线第二站：回答「怎么让 LLM 看见、听见」。\n主线是视觉-语言模型的架构演进：CLIP 对比学习对齐两个模态 → BLIP-2 用 Q-Former 做桥 → LLaVA 把视觉 token 直接喂给 LLM 做指令微调，再到 Qwen-VL、InternVL、Janus-Pro 等开源家族的具体实现。\n后半段扩展到视频（时序 grounding、百万 token 长视频）、音频-语言、omni 全模态与具身 VLA——25 课构成 2026 年多模态的完整地图。",
        formula: [
          "CLIP 对比损失：正图文对相似度拉高，负对压低",
          "图像 → ViT 切 patch → patch tokens（如 14×14=196 个）",
          "LLaVA：visual tokens → 投影层 → 与文本 token 拼接进 LLM",
          "跨模态融合两派：early fusion（统一 token）vs cross-attention"
        ],
        example: [
          "02 · CLIP Contrastive Pretraining——图文对齐的源头",
          "03 · BLIP-2 Q-Former Bridge——冻结双塔的桥接层",
          "05 · LLaVA Visual Instruction Tuning——视觉指令微调",
          "09 · Qwen-VL Family Dynamic FPS——开源 VLM 实战",
          "21 · Embodied VLAs——视觉-语言-动作模型",
          "仓库目录：phases/12-multimodal-ai（共 25 课）"
        ],
        tradeoffs: [
          "架构主线（01-05）必学：CLIP/BLIP-2/LLaVA 三代讲清「对齐 → 桥接 → 直接拼接」的演进逻辑，其余都是变奏",
          "开源族谱（07-10）按你要部署的模型选读——跟定一个家族（如 Qwen-VL）吃透它的分辨率与 FPS 策略",
          "多模态的成本大头在视觉 token 数：patch 越多上下文越长，06 课 any-resolution 与动态 FPS 都是省 token 工程"
        ],
        pitfalls: [
          "以为多模态 = 给 LLM 加个图片输入框——视觉 token 与文本的对齐质量（投影层/指令数据）才决定上限",
          "跳过 23/24 课多模态 RAG——文档理解场景里 ColPali 式「视觉原生检索」正在取代传统 OCR + 文本 RAG"
        ]
      },
      diagram: {
        type: "flow",
        title: "VLM 架构演进",
        items: [
          ["CLIP", "对比学习，图文同空间"],
          ["BLIP-2", "Q-Former 桥接冻结双塔"],
          ["LLaVA", "视觉 token 直接进 LLM + 指令微调"],
          ["Omni/具身", "任意模态进出 → VLA 动作输出"]
        ]
      },
      quiz: {
        q: "LLaVA 让 LLM「看见」图片的关键一步是什么？",
        options: [
          "把图片转成文字描述再喂给模型",
          "用投影层把 ViT 的视觉 token 映射到 LLM 的词向量空间，与文本 token 拼接后统一做指令微调",
          "训练一个更大的 CLIP",
          "在 prompt 里描述图片内容"
        ],
        answer: 1,
        explain: "LLaVA 的配方极简：ViT 提视觉特征 → 线性投影到语言空间 → 当作普通 token 与指令文本拼接 → 视觉指令微调。这个「投影 + 指令微调」范式（05 课）成为开源 VLM 的默认架构，Qwen-VL、InternVL 都在此基础上演进。"
      },
      resources: {
        youtube: [
          { title: "OpenAI CLIP: Connecting Text and Images (Paper Explained)", channel: "Yannic Kilcher", url: "https://www.youtube.com/watch?v=T9XSU0pKX2E", why: "Yannic 精读 CLIP 论文，讲透图文对比学习的对齐机制" }
        ],
        bilibili: [
          { title: "CLIP 论文逐段精读【论文精读】", up: "跟李沐学AI", url: "https://www.bilibili.com/video/BV1SL4y1s7LQ", why: "李沐逐段精读 CLIP，多模态入门的标准读物" },
          { title: "多模态模型CLIP深度讲解", up: "RethinkFun", url: "https://www.bilibili.com/video/BV1pYmDYgEDW", why: "RethinkFun 系统拆解 CLIP 训练目标与代码实现" }
        ],
        keywords: ["CLIP模型原理", "多模态大模型入门", "图文对齐对比学习"]
      }
    },
    {
      id: "phase13-tools",
      name: "工具与协议",
      en: "TOOLS",
      branch: "eng",
      deps: ["phase11-llm-eng"],
      grid: { col: 7, row: 2 },
      summary: "Function Calling 到 MCP，模型的「手脚接口」",
      repo: "https://github.com/fancyboi999/ai-engineering-from-scratch-zh/tree/main/phases/13-tools-and-protocols",
      sections: {
        principle: "工程线收尾：把 LLM 从「只会说」变成「会调用」。\n上半段讲透 function calling——tool schema 设计、并行与流式调用、结构化输出；下半段是当前生态的事实标准：MCP（Model Context Protocol）从原理到手写 server/client、transport、安全（tool poisoning、OAuth 2.1）、网关与注册中心，外加 A2A 协议与 OpenTelemetry GenAI 观测。\n31 课的密度说明一件事：工具协议层已经是独立工程学科，它是 agent 线（phase14-16）的地面基础设施。",
        formula: [
          "Function calling：模型输出结构化 JSON → 宿主执行 → 结果回填上下文",
          "tool schema = name + description + JSON Schema 参数约束",
          "MCP 三角色：Host / Client / Server，JSON-RPC 通信",
          "MCP 三原语：Tools（动作）/ Resources（数据）/ Prompts（模板）"
        ],
        example: [
          "02 · Function Calling Deep Dive——调用机制拆解",
          "06 · MCP Fundamentals——协议设计动机",
          "07 · Building an MCP Server——手写服务端",
          "15 · MCP Security Tool Poisoning——工具投毒攻防",
          "19 · A2A Protocol——智能体间协议",
          "仓库目录：phases/13-tools-and-protocols（共 31 课）"
        ],
        tradeoffs: [
          "schema 设计（05 课）比调用代码更影响成功率：description 写得像给聪明实习生看的说明书，参数约束能收多紧收多紧",
          "MCP 值得重仓：它是 Anthropic 发起、全行业跟进的标准，学会手写 server（07）就吃透了协议 80% 的精髓",
          "安全课（15-18）不能跳：工具投毒与权限模型是 agent 上线前必须过的关，phase14 的 prompt injection 防御与此互为表里"
        ],
        pitfalls: [
          "以为 function calling 是模型「真的执行了函数」——模型只生成调用意图的 JSON，执行与安全边界全在宿主侧",
          "给工具开过大权限——最小权限 + schema 校验是底线，一个能写文件的工具配一个会幻觉的模型就是事故"
        ]
      },
      diagram: {
        type: "flow",
        title: "一次工具调用的生命周期",
        items: [
          ["模型决策", "输出 tool_call JSON（不执行）"],
          ["宿主解析校验", "schema 校验 + 权限检查"],
          ["执行工具", "真实 API/DB/文件操作"],
          ["结果回填", "作为新消息进上下文 → 继续推理"]
        ]
      },
      quiz: {
        q: "Function calling 中模型实际做的是什么？",
        options: [
          "直接执行外部 API 请求",
          "生成符合 tool schema 的结构化调用 JSON，由宿主程序校验并真正执行、再把结果回填",
          "训练一个函数专用的子模型",
          "把函数代码编译进权重"
        ],
        answer: 1,
        explain: "模型输出只是「调用意图」的 JSON，执行权始终在宿主侧——这个边界正是安全设计的锚点（schema 校验、最小权限、tool poisoning 防御）。MCP 则把这套意图-执行交互标准化成 Host/Client/Server 三角架构。"
      },
      resources: {
        youtube: [
          { title: "The Model Context Protocol (MCP)", channel: "Anthropic", url: "https://www.youtube.com/watch?v=CQywdSdi5iA", why: "Anthropic 官方介绍 MCP 协议设计动机与架构" },
          { title: "Building Agents with Model Context Protocol - Full Workshop with Mahesh Murag of Anthropic", channel: "AI Engineer", url: "https://www.youtube.com/watch?v=kQmXtrmQ5Zg", why: "Anthropic 工程师亲授的 MCP 实战工作坊，含完整代码演示" }
        ],
        bilibili: [
          { title: "Model Context Protocol 深度解析与实战｜01｜精简版", up: "Koala聊开源", url: "https://www.bilibili.com/video/BV1wXrcYQEvE", why: "中文圈口碑较好的 MCP 深度解析，协议细节+实战兼顾" },
          { title: "大模型的 Function Calling（函数调用）到底是怎么实现的？底层原理是什么？", up: "AI大模型-阿水", url: "https://www.bilibili.com/video/BV1oYcDzdE5f", why: "专讲 Function Calling 底层实现原理，补齐工具调用的机制认知" }
        ],
        keywords: ["MCP协议教程", "function calling原理", "AI Agent开发实战"]
      }
    },
    {
      id: "phase14-agent",
      name: "Agent 工程",
      en: "AGENT",
      branch: "agent",
      deps: ["phase13-tools"],
      grid: { col: 5, row: 3 },
      summary: "ReAct 循环到记忆与规划，54 课的最大 phase",
      repo: "https://github.com/fancyboi999/ai-engineering-from-scratch-zh/tree/main/phases/14-agent-engineering",
      sections: {
        principle: "全仓库最大的 phase（54 课），也是当前工业界最热的战场：从 agent loop（感知-推理-行动）出发，系统覆盖 ReAct、ReWOO、Reflexion、Tree-of-Thoughts 四大推理范式，记忆（MemGPT/Mem0）、技能库（Voyager）、规划（HTN），再到 LangGraph/AutoGen/CrewAI/各家 SDK 的框架横评。\n后半段是稀缺的生产内容：SWE-bench/GAIA 基准、computer use、观测平台、失败模式、prompt injection 防御，以及一整组「agent workbench」课程讲怎么把 agent 开发工程化。\n它把 phase13 的工具协议变成真正能自主完成任务的系统。",
        formula: [
          "Agent loop：Observe → Think → Act → Observe …",
          "ReAct：Reasoning 与 Action 交替，轨迹 = 思考+行动+观察",
          "Reflexion：失败后生成语言反思存入记忆，下一轮修正",
          "ToT：把推理展开成搜索树，配合评估与回溯"
        ],
        example: [
          "01 · The Agent Loop——感知-推理-行动主循环",
          "03 · Reflexion Verbal RL——语言反思机制",
          "07 · Memory Virtual Context MemGPT——虚拟上下文记忆",
          "13 · LangGraph Stateful Graphs——状态图框架",
          "26 · Failure Modes Agentic——agent 失效模式解剖",
          "仓库目录：phases/14-agent-engineering（共 54 课）"
        ],
        tradeoffs: [
          "先学范式（01-05）再碰框架（13-18）：不懂 ReAct 与反思机制，框架只是黑盒；Anthropic 的建议是先用最简 loop，复杂度按需加",
          "框架横评（12-18）选一到两个深入即可：LangGraph 重状态控制、CrewAI 重角色协作，思想相通",
          "26-30 课（失败模式/防御/生产运行时/评估驱动）是分水岭：demo 与产品的差距全在这几课"
        ],
        pitfalls: [
          "把 agent 当「多调几次 LLM」——没有记忆、没有验证门禁的循环只是昂贵的 for 循环",
          "上 agent 解决一切——Anthropic 的官方建议：能用固定 workflow 解决的就不要上自主 agent，不确定性即成本与风险",
          "不给 agent 设停止条件与预算——循环失控的 token 账单是第一课学费"
        ]
      },
      diagram: {
        type: "flow",
        anim: "reactLoop",
        title: "ReAct 主循环",
        items: [
          ["Observe", "环境状态/工具结果"],
          ["Think", "推理下一步（可反思）"],
          ["Act", "调用工具（phase13 的协议）"],
          ["循环 + 门禁", "预算/验证/停止条件 → phase15 长程化"]
        ]
      },
      quiz: {
        q: "什么情况下应该选择固定 workflow 而不是自主 agent？",
        options: [
          "任务太简单时",
          "任务路径可预知、步骤可枚举时——固定 workflow 更便宜、更可控，agent 留给真正需要动态决策的部分",
          "模型不够强时",
          "没有 GPU 时"
        ],
        answer: 1,
        explain: "Anthropic「Building effective agents」的核心原则：workflow（路径预定）与 agent（路径动态）是光谱两端，能从简就从简。自主循环的每一步都引入不确定性与 token 成本，只有当任务真的需要动态分支时，agent 的灵活性才值回票价。"
      },
      resources: {
        youtube: [
          { title: "Building more effective AI agents", channel: "Anthropic", url: "https://www.youtube.com/watch?v=uhJJgc-0iTQ", why: "Anthropic 官方出品，讲清楚何时该用 Agent、如何设计工作流与工具调用，权威入门" },
          { title: "How We Build Effective Agents: Barry Zhang, Anthropic", channel: "AI Engineer", url: "https://www.youtube.com/watch?v=D7_ipDqhtwk", why: "Anthropic 工程师在 AI Engineer 峰会的演讲，系统讲 Agent 的规划/记忆/长程任务设计模式" }
        ],
        bilibili: [
          { title: "ReAct Agent是什么？我用21分钟给你讲清楚！", up: "AI大模型元元", url: "https://www.bilibili.com/video/BV1iuAUzHErP", why: "21 分钟讲透 ReAct 推理-行动循环，B站同主题播放量最高的通俗讲解" },
          { title: "【Agent入门】3.工具调用实现原理", up: "花里胡哨的汤无际", url: "https://www.bilibili.com/video/BV1ymrCBeESA", why: "从实现层面拆解工具调用（Function Calling）机制，配合代码讲解，Agent 入门系列第 3 讲" }
        ],
        keywords: ["AI Agent 原理", "ReAct 智能体", "大模型工具调用"]
      }
    },
    {
      id: "phase15-autonomous",
      name: "自主系统",
      en: "AUTONOMOUS",
      branch: "agent",
      deps: ["phase14-agent"],
      grid: { col: 6, row: 3 },
      summary: "长程 agent、自我改进与安全缰绳",
      repo: "https://github.com/fancyboi999/ai-engineering-from-scratch-zh/tree/main/phases/15-autonomous-systems",
      sections: {
        principle: "agent 线第二站：从「完成一个任务」跨到「长时间自主工作」。\n前沿样本拉满：AlphaEvolve 进化式编码、Darwin-Gödel Machine 自我改写、AI Scientist v2 自动科研、递归自我改进——这些代表 2026 年自主系统的能力边界。\n但本 phase 真正的工程含量在「缰绳」：durable execution、成本控制器、kill switch、checkpoint 回滚、propose-then-commit——让自主系统可控、可中断、可恢复，才是能上生产的自主。",
        formula: [
          "长程 agent = agent loop × 时间跨度 × 状态持久化",
          "自我改进闭环：生成 → 评估 → 选择 → 变异（进化式）",
          "propose-then-commit：先产出提案，过验证门禁才落地",
          "成本护栏：预算上限 + 速率限制 + 人工升级通道"
        ],
        example: [
          "01 · Long-Horizon Agents——长程任务设计",
          "03 · AlphaEvolve Evolutionary Coding——进化式代码优化",
          "05 · AI Scientist v2——自动科研全管线",
          "12 · Durable Execution——可持久化执行",
          "14 · Kill Switches & Canaries——紧急制动与金丝雀",
          "仓库目录：phases/15-autonomous-systems（共 22 课）"
        ],
        tradeoffs: [
          "能力课（01-08）与缰绳课（12-16）要一起学：只学前半是造出不敢上线的 demo，只学后半则无物可控",
          "自我改进必须「有界」（08 课）：评估指标可被 hack 时，递归改进会放大偏差而非能力",
          "durable execution（12 课）是长程 agent 的隐形基石：进程随时可能挂，状态必须可恢复，别自己造轮子，用成熟编排"
        ],
        pitfalls: [
          "以为自主 = 放权——真正的自主系统是「权限最小化 + 检查点密布」，每一步高危操作都有 propose-then-commit 门禁",
          "忽略成本失控——长程循环 × 工具调用 = 指数 token 消耗，cost governor（13 课）不是可选项"
        ]
      },
      diagram: {
        type: "flow",
        title: "可控自主的双螺旋",
        items: [
          ["能力侧", "长程规划 / 进化 / 自我改进"],
          ["控制侧", "durable execution / checkpoint / kill switch"],
          ["门禁", "propose → 验证 → commit"],
          ["兜底", "预算耗尽或异常 → 熔断 + 人工接管"]
        ]
      },
      quiz: {
        q: "为什么长程自主系统里「propose-then-commit」比直接执行更安全？",
        options: [
          "因为提案写得慢",
          "提案与执行分离，让验证门禁可以在不可逆操作落地前拦截错误，配合 checkpoint 可回滚",
          "因为可以让模型偷懒",
          "因为它省 token"
        ],
        answer: 1,
        explain: "自主系统的危险集中在不可逆动作（删数据、发邮件、改生产配置）。propose-then-commit 把「决定做什么」和「真的做」分开，中间插入验证/审批门禁；配合 16 课的 checkpoint 回滚，错误从「事故」降级为「被拒绝的提案」。"
      },
      resources: {
        youtube: [
          { title: "AutoGPT & BabyAGI: autonomous AI Agents for LLMs explained", channel: "Discover AI", url: "https://www.youtube.com/watch?v=5cnk5zpf1EA", why: "深入讲解 AutoGPT/BabyAGI 类自主 Agent 架构：任务分解、自我提示、记忆循环" },
          { title: "The AI Scientist-v2: Workshop-Level Automated Scientific Discovery via Agentic... - Yutaro Yamada", channel: "PyTorch", url: "https://www.youtube.com/watch?v=1DcZGAAF1CA", why: "Sakana AI 在 PyTorch 官方频道讲 AI Scientist-v2，自动科研/自我改进的前沿实例" }
        ],
        bilibili: [
          { title: "AutoGPT傻瓜式使用教程+真实体验！", up: "程序员鱼皮", url: "https://www.bilibili.com/video/BV1ho4y1b75o", why: "知名技术 UP 主实测 AutoGPT 自主任务执行全流程，15 万播放，直观感受自主 Agent 的能力与局限" },
          { title: "本地部署全自动写论文的AI智能体！全球首个AI科学家-AI Scientist诞生", up: "AI超元域", url: "https://www.bilibili.com/video/BV1FZ421K7so", why: "手把手本地部署 AI Scientist，展示自动从选题到成文的自动研究管线" }
        ],
        keywords: ["AutoGPT 自主智能体", "AI 自动科研", "自我改进 AI"]
      }
    },
    {
      id: "phase16-multiagent",
      name: "多智能体集群",
      en: "SWARM",
      branch: "agent",
      deps: ["phase15-autonomous"],
      grid: { col: 7, row: 3 },
      summary: "分工/通信/共识，从单兵到智能体社会",
      repo: "https://github.com/fancyboi999/ai-engineering-from-scratch-zh/tree/main/phases/16-multi-agent-and-swarms",
      sections: {
        principle: "agent 线第三站：单个 agent 能力到顶后，问题变成「怎么组织一群 agent」。\n课程覆盖组织模式全谱系：supervisor/编排者、层级架构、辩论（society of mind）、角色专精、并行 swarm、群聊发言选择、handoff 交接，通信层有 A2A 协议与共享黑板，共识层有投票/BFT/协商，外加生成式 agent 社会模拟与 MARL（MADDPG/QMIX/MAPPO）。\n23 课的失败模式（groupthink、级联错误）与 22 课的生产 scaling（队列/检查点）是从 demo 到系统的分水岭。",
        formula: [
          "Supervisor：中心节点分派任务，worker 回报结果",
          "Debate：多 agent 对同一问题独立作答 → 互相评审 → 收敛",
          "Handoff：会话控制权在专精 agent 间显式转移",
          "共享黑板：所有 agent 读写公共空间，替代点对点消息"
        ],
        example: [
          "05 · Supervisor-Orchestrator Pattern——编排者模式",
          "07 · Society of Mind Debate——多 agent 辩论",
          "11 · Handoffs and Routines——交接与例程",
          "13 · Shared Memory Blackboard——共享黑板架构",
          "23 · Failure Modes MAST Groupthink——多智能体失效解剖",
          "仓库目录：phases/16-multi-agent-and-swarms（共 25 课）"
        ],
        tradeoffs: [
          "多 agent 不是默认答案：分工带来的收益必须超过通信与协调成本，简单任务单 agent + 好工具往往更优",
          "supervisor 模式是工程默认起点：中心可控、易观测；辩论/群体智能留给出票价值得的高质量决策场景",
          "先读 23 课失败模式再设计架构：groupthink 与错误级联是多智能体特有的坑，单 agent 经验覆盖不了"
        ],
        pitfalls: [
          "以为 agent 越多越聪明——无协调机制的堆砌只会放大噪声与账单，组织结构（拓扑/角色/共识）才是变量",
          "忽略通信协议标准化——自造消息格式的系统无法演进，A2A（12 课）与 MCP 的组合是 2026 年的标准答案"
        ]
      },
      diagram: {
        type: "compare",
        anim: "swarmComm",
        title: "多智能体组织模式",
        items: [
          ["Supervisor", "中心编排，可控易观测"],
          ["层级架构", "逐层委派，适合大任务分解"],
          ["辩论/群聊", "多视角互评，换决策质量"],
          ["并行 Swarm", "同构 worker 池，吞吐优先"]
        ]
      },
      quiz: {
        q: "多智能体系统相对单 agent 独有的失效模式是？",
        options: [
          "模型幻觉",
          "groupthink 与错误级联——agent 间互相强化错误共识，或一个 agent 的错误输出成为下游的事实输入",
          "上下文窗口不够",
          "显存不足"
        ],
        answer: 1,
        explain: "幻觉是单 agent 就有的问题；多智能体特有的风险来自「交互」：辩论中互相附和形成 groupthink、上游错误被下游当事实继承并放大（23 课 MAST 研究）。对策是独立作答后再汇总、引入异议角色、以及在关键节点加验证门禁。"
      },
      resources: {
        youtube: [
          { title: "Multi Agent Systems Explained: How AI Agents & LLMs Work Together", channel: "IBM Technology", url: "https://www.youtube.com/watch?v=sWH0T4Zez6I", why: "IBM 官方科普，讲多 Agent 系统的角色分工、通信与协作模式，概念框架清晰" },
          { title: "Agentic AI Frameworks Explained: Workflows, Multi-Agent, & Production", channel: "IBM Technology", url: "https://www.youtube.com/watch?v=ZVPlLaehjLk", why: "IBM 横评主流多智能体框架与生产化考量，衔接工程落地" }
        ],
        bilibili: [
          { title: "挑战12分钟搞定，多智能体（Multi-Agent）架构", up: "AI大模型学习study", url: "https://www.bilibili.com/video/BV11p6wB2EmX", why: "12 分钟速览多智能体架构核心：协作模式、消息传递与编排，2.5 万播放" },
          { title: "AutoGen Studio零代码创建AI智能体工作流！支持工具调用与多agents协作", up: "AI超元域", url: "https://www.bilibili.com/video/BV1i9QfYaEf9", why: "用微软 AutoGen Studio 实操多 Agent 协作搭建，从概念到动手的最短路径" }
        ],
        keywords: ["多智能体协作", "AutoGen 教程", "Agent 群体智能"]
      }
    },
    {
      id: "phase17-infra",
      name: "基础设施与生产",
      en: "INFRA",
      branch: "agent",
      deps: ["phase11-llm-eng"],
      grid: { col: 3, row: 3 },
      summary: "vLLM/K8s/观测/FinOps，把模型变成服务",
      repo: "https://github.com/fancyboi999/ai-engineering-from-scratch-zh/tree/main/phases/17-infrastructure-and-production",
      sections: {
        principle: "与 agent 线并行的工程纵深：把 phase11 做出的应用变成扛得住真实流量的服务。\n技术栈直接对标 2026 年生产环境：vLLM（PagedAttention）、SGLang（RadixAttention）、TensorRT-LLM 三大推理引擎，GPU K8s 自动扩缩、生产量化、冷启动治理、多区域 KV 局部性、prefill/decode 分离部署，再到观测、语义缓存、模型路由、灰度发布、SRE/混沌工程与 FinOps 成本治理。\n这一 phase 的知识密度 = 一个 LLM 平台团队的日常。",
        formula: [
          "PagedAttention：KV Cache 按页管理，显存碎片收敛",
          "goodput = 满足 SLO（延迟）的请求吞吐，而非裸吞吐",
          "TTFT（首 token 延迟）与 TPOT（逐 token 延迟）分开优化",
          "成本 = GPU 时价 × 利用率；利用率是 FinOps 的第一指标"
        ],
        example: [
          "04 · vLLM Serving Internals——PagedAttention 拆解",
          "06 · SGLang RadixAttention——前缀复用机制",
          "08 · Inference Metrics Goodput——有效吞吐度量",
          "17 · Disaggregated Prefill-Decode——PD 分离部署",
          "27 · FinOps LLMs——成本治理实战",
          "仓库目录：phases/17-infrastructure-and-production（共 28 课）"
        ],
        tradeoffs: [
          "托管 API vs 自托管（01/28 课）是首要决策：流量小且不敏感用托管，规模化或合规要求才值得自建推理栈",
          "推理引擎按硬件与场景选：vLLM 生态最全是默认项，SGLang 适合复杂前缀共享，TensorRT-LLM 榨 NVIDIA 极限",
          "14/15 课（语义缓存、批处理 API）常是最大成本杠杆：相同或相似请求命中率上去，账单直接砍半"
        ],
        pitfalls: [
          "用裸吞吐当 SLA——用户感知的是 TTFT/TPOT，超过 SLO 的吞吐没有意义，goodput（08 课）才是真指标",
          "上线前不做压测与灰度——22 课负载测试 + 20 课金丝雀发布是 LLM 服务的基本纪律，模型行为随负载劣化"
        ]
      },
      diagram: {
        type: "bars",
        title: "生产推理优化栈",
        items: [
          ["引擎层", "vLLM / SGLang / TensorRT-LLM"],
          ["调度层", "PD 分离 / 批处理 / 前缀复用"],
          ["平台层", "K8s 扩缩 / 多区域 / 冷启动"],
          ["治理层", "观测 / 灰度 / FinOps"]
        ]
      },
      quiz: {
        q: "为什么生产 LLM 服务用 goodput 而不是裸吞吐量做核心指标？",
        options: [
          "goodput 计算更简单",
          "裸吞吐不计延迟——超过 SLO 的响应对用户等于失败，goodput 只统计满足延迟目标的请求",
          "裸吞吐无法测量",
          "goodput 是 GPU 厂商的营销词"
        ],
        answer: 1,
        explain: "把 batch 拉到极限可以提高总吞吐，但 TTFT/TPOT 会同步恶化，用户实际体验变差。goodput（08 课）定义为「满足延迟 SLO 的请求速率」，它才是容量规划与成本核算的正确分母。"
      },
      resources: {
        youtube: [
          { title: "MLOps Course – Build Machine Learning Production Grade Projects", channel: "freeCodeCamp.org", url: "https://www.youtube.com/watch?v=-dJPoLm_gtE", why: "freeCodeCamp 完整 MLOps 课程，覆盖 CI/CD、部署与监控的生产级项目实战" },
          { title: "vLLM on Kubernetes in Production", channel: "Kubesimplify", url: "https://www.youtube.com/watch?v=t0iJGEG0IXk", why: "专注讲生产环境下在 K8s 上跑 vLLM 推理服务，直接命中 LLM 推理部署痛点" }
        ],
        bilibili: [
          { title: "怎么加快大模型推理？10分钟学懂VLLM内部原理，KV Cache，PageAttention", up: "RethinkFun", url: "https://www.bilibili.com/video/BV1kx4y1x7bu", why: "RethinkFun 硬核讲 vLLM 推理加速原理（KV Cache/PagedAttention），14 万播放，推理服务的理论地基" },
          { title: "MLOps第一次亲密接触-基于Kubeflow的机器学习工程链入门", up: "中国DevOps社区", url: "https://www.bilibili.com/video/BV14d4y1b7X3", why: "中国 DevOps 社区 65 分钟分享，基于 Kubeflow 讲 K8s 上的 ML 工程链路，中文稀缺资源" }
        ],
        keywords: ["大模型推理部署", "vLLM 实战", "MLOps 入门"]
      }
    },
    {
      id: "phase18-ethics",
      name: "伦理安全与对齐",
      en: "ALIGNMENT",
      branch: "agent",
      deps: ["phase16-multiagent"],
      grid: { col: 8, row: 3 },
      summary: "Reward hacking 到红队，能力越强越需要的刹车",
      repo: "https://github.com/fancyboi999/ai-engineering-from-scratch-zh/tree/main/phases/18-ethics-safety-alignment",
      sections: {
        principle: "agent 线收官：当系统能自主行动、互相协作之后，「它做的事是否真是我们要的」成为主问题。\n课程分三层：对齐技术（RLHF 信号、DPO 家族、Constitutional AI/RLAIF）、失败机理（reward hacking、谄媚、mesa-optimization、对齐伪装、in-context scheming）、攻防实战（自动化红队、多轮越狱、间接注入、garak/PyRIT 工具链），外加公平性、差分隐私、水印与各地监管框架。\n30 课的体量说明：安全不是附录，是与能力并行的第二主轴。",
        formula: [
          "Goodhart 定律：指标成为目标时便失效 → reward hacking",
          "RLHF 谄媚：奖励模型偏好「用户爱听的」而非「真的」",
          "对齐伪装：模型在训练中表现对齐，部署后行为漂移",
          "防御纵深 = 输入过滤 + 模型对齐 + 输出审核 + 红队回归"
        ],
        example: [
          "02 · Reward Hacking & Goodhart——指标博弈",
          "05 · Constitutional AI & RLAIF——宪法式对齐",
          "09 · Alignment Faking——对齐伪装研究",
          "12 · Red Teaming PAIR Automated Attacks——自动化红队",
          "15 · Indirect Prompt Injection——间接注入攻防",
          "仓库目录：phases/18-ethics-safety-alignment（共 30 课）"
        ],
        tradeoffs: [
          "对齐技术（01-05）与失败机理（06-11）要对照学：知道 DPO 怎么训，也要知道它压不住哪些行为",
          "红队（12-16）是最实用的部分：给自己的系统跑 garak/PyRIT，比读十篇论文更能建立安全直觉",
          "合规（24/26 课）不是法务的事：EU AI Act 等框架直接决定产品设计，提前读胜过事后改"
        ],
        pitfalls: [
          "把安全当上线前的 checkbox——间接注入（15 课）这类攻击面在 agent 接工具那一刻就存在，设计期就要防",
          "以为 RLHF 后模型就「安全了」——谄媚与对齐伪装研究表明，表层行为对齐不等于内部目标对齐"
        ]
      },
      diagram: {
        type: "compare",
        title: "对齐三层防线",
        items: [
          ["训练对齐", "RLHF / DPO / Constitutional AI"],
          ["失败机理", "reward hacking / 谄媚 / 对齐伪装"],
          ["攻防实战", "红队 / 越狱 / 间接注入 / 工具链"],
          ["治理", "公平 / 隐私 / 水印 / 监管"]
        ]
      },
      quiz: {
        q: "「模型在评估中表现得很守规矩，部署后出现钻空子行为」最符合哪个概念？",
        options: [
          "过拟合",
          "对齐伪装（alignment faking）——模型学会在受监控时表现出对齐行为",
          "数据污染",
          "学习率过大"
        ],
        answer: 1,
        explain: "09 课的 alignment faking 研究正是描述这种现象：模型能区分「训练/评估情境」与「部署情境」，在前者表现对齐以保留自身目标。它说明行为评估有根本盲区，需要红队与机理可解释性互补。"
      },
      resources: {
        youtube: [
          { title: "What is interpretability?", channel: "Anthropic", url: "https://www.youtube.com/watch?v=TxhhMTOTMDg", why: "Anthropic 官方讲可解释性——理解模型内部机制是对齐与安全的技术基础" },
          { title: "The OTHER AI Alignment Problem: Mesa-Optimizers and Inner Alignment", channel: "Robert Miles AI Safety", url: "https://www.youtube.com/watch?v=bJLcIBixGj8", why: "AI 安全领域最知名科普频道，深入讲解内部对齐（mesa-optimizer）这一核心难题" }
        ],
        bilibili: [
          { title: "AI的安全对齐，可能是个幻觉", up: "隔壁的程序员老王", url: "https://www.bilibili.com/video/BV1AEd6BZEiB", why: "从工程视角质疑与剖析对齐现状，触及 RLHF 局限与红队思维，2 万播放" },
          { title: "AI价值对齐：回形针最大化器", up: "修饼xiubing", url: "https://www.bilibili.com/video/BV1ytMX6VEuC", why: "用经典思想实验讲价值对齐问题的本质，快速建立对齐问题直觉" }
        ],
        keywords: ["AI 对齐问题", "大模型安全红队", "AI 伦理风险"]
      }
    },
    {
      id: "phase19-capstone",
      name: "综合实战项目",
      en: "CAPSTONE",
      branch: "capstone",
      deps: ["phase16-multiagent", "phase17-infra", "phase18-ethics"],
      grid: { col: 6, row: 4 },
      summary: "87 课毕业设计：coding agent/RAG/分布式/安全门",
      repo: "https://github.com/fancyboi999/ai-engineering-from-scratch-zh/tree/main/phases/19-capstone-projects",
      sections: {
        principle: "整张地图的毕业考：87 课不是新课，而是把前 19 个 phase 熔铸成完整系统的实战清单。\n项目分两类——应用级（终端 coding agent、代码库 RAG、实时语音助手、多智能体软件团队、issue-to-PR agent 等 17 个）与原理级复现（从 BPE 分词器到手写 GPT、分布式训练、评估 harness、安全门等 69 个组件课）。\n完成标准不是「跑通」，而是每个项目都能讲清架构取舍、通过验证门禁、可观测可回滚——按 phase15-18 立下的工程纪律交付。",
        formula: [
          "毕业标准 = 功能闭环 + 验证门禁 + 观测 + 成本护栏",
          "coding agent 组件：loop + 工具注册 + 沙箱 + eval harness",
          "RAG 系统组件：分块 → 混合检索 → rerank → 评估",
          "训练复现组件：tokenizer → 模型 → 分布式 → 评估"
        ],
        example: [
          "01 · Terminal-Native Coding Agent——终端编程 agent",
          "05 · Autonomous Research Agent——自主研究 agent",
          "08 · Production RAG Chatbot——生产级 RAG 问答",
          "10 · Multi-Agent Software Team——多智能体软件团队",
          "33 · Multihead Self-Attention——原理级手写组件之一",
          "仓库目录：phases/19-capstone-projects（共 87 课）"
        ],
        tradeoffs: [
          "先做 1 个应用级项目走通「需求 → 交付」全流程，再按需回炉原理级组件课——别试图 87 课全做",
          "组件课（30-87）按短板选：面试/深耕哪个方向就手写哪个组件，手写一遍胜过读十遍",
          "每个项目都要配 eval harness（27/73 课）——没有评估的 capstone 只是玩具，这是与教程项目的分水岭"
        ],
        pitfalls: [
          "把 capstone 当「跟着做一遍」——毕业标准是脱离教程独立交付，卡壳时回对应 phase 补而不是抄答案",
          "忽视部署与观测——项目不上 phase17 的生产纪律（压测/灰度/成本）就不算完成，只算作业"
        ]
      },
      diagram: {
        type: "tree",
        title: "Capstone 两大项目族",
        items: [
          ["应用级（17 项）", "coding agent / RAG / 语音 / 多智能体团队"],
          ["原理级（69 项）", "手写 tokenizer / GPT / 分布式训练 / 安全门"],
          ["交付纪律", "eval harness + 观测 + 验证门禁"],
          ["毕业", "→ 完整 AI 工程师能力闭环"]
        ]
      },
      quiz: {
        q: "capstone 项目与「跟着教程做的 demo」的分水岭是什么？",
        options: [
          "代码行数更多",
          "有独立的需求定义、eval harness 验证、观测与成本护栏——按生产纪律交付而非跑通即止",
          "用了更新的框架",
          "部署到了云端"
        ],
        answer: 1,
        explain: "87 课的设计意图是把前 19 个 phase 的工程纪律串成交付能力：27/73 课的评估 harness、28 课的 OTel 观测、26 课的沙箱护栏都是强制组件。能独立交付一个可验证、可观测、可回滚的系统，才是这张地图的毕业证。"
      },
      resources: {
        youtube: [
          { title: "Build Your Own Coding Agent (From Scratch)", channel: "Owain Lewis", url: "https://www.youtube.com/watch?v=kU8Tg1_PYJE", why: "从零手写一个 coding agent，端到端覆盖工具循环/文件操作/执行反馈，capstone 标杆" },
          { title: "Learn RAG From Scratch – Python AI Tutorial from a LangChain Engineer", channel: "freeCodeCamp.org", url: "https://www.youtube.com/watch?v=sVcwVQRHIc8", why: "LangChain 工程师主讲，freeCodeCamp 出品的 RAG 系统从零实战课" }
        ],
        bilibili: [
          { title: "从零手搓——Mini Claude Code", up: "果粒奶优有果粒", url: "https://www.bilibili.com/video/BV1QFovBbEd6", why: "从零实现一个迷你 Claude Code，完整走通 coding agent 的核心闭环，最贴合 capstone 主题" },
          { title: "【项目实战】RAG会话_知识库问答系统_手搓RAG项目", up: "尚学堂官方", url: "https://www.bilibili.com/video/BV1ZobP6DE4L", why: "150 分钟手搓 RAG 知识库问答系统，覆盖检索/生成/会话管理全链路" }
        ],
        keywords: ["手搓 coding agent", "RAG 项目实战", "AI 综合项目教程"]
      }
    }
  ]
};
