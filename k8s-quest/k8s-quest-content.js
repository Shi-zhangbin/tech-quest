// K8s Quest 知识库 · 22 节点（6 前置 + 16 主线） · 2026-10-03
window.LLM_QUEST_CONTENT = {
  nodes: [
    {
      id: "vm-to-container",
      name: "物理机→虚拟机→容器",
      en: "VM→CONTAINER",
      branch: "prereq",
      deps: [],
      grid: { col: 1, row: 0 },
      summary: "部署形态三代演进：月计物理机 → 分钟级 VM → 秒级容器",
      sections: {
        principle: "物理机时代部署一套应用以月计：采购物料、上架装系统、配环境，且一台机器通常只跑一个应用，资源大量闲置。\n虚拟机用 Hypervisor 把一台物理机虚拟成多台整机，每台带完整操作系统，资源利用率上去了，但镜像是 GB 级、启动以分钟计。\n容器共享宿主机内核，只打包应用与其依赖，镜像 MB 级、启动秒级——轻量化来自「不重复装操作系统」。",
        formula: [
          "物理机：部署周期 ≈ 月；一机一应用，利用率低",
          "虚拟机：Hypervisor 虚拟整机，镜像 GB 级，启动分钟级",
          "容器：共享宿主内核，镜像 MB 级，启动秒级"
        ],
        example: [
          "同一台 16C64G 物理机：物理机时代跑 1 个应用",
          "VM 时代切 4-8 台虚拟机，每台要背一份 OS 开销（几个 GB 内存）",
          "容器时代可跑几十上百个容器，OS 开销只付一份",
          "镜像从 GB 级缩到 MB 级，分发与回滚成本同步下降"
        ],
        tradeoffs: [
          "VM 隔离到硬件层、安全性更强；容器只隔离到内核层，共享内核意味着内核漏洞影响面更大",
          "容器镜像小、启动快，但内核版本被宿主机锁定，不能像在 VM 里那样自选内核",
          "物理机没有虚拟化开销、性能最满，但弹性与利用率最差"
        ],
        pitfalls: [
          "以为容器是「轻量虚拟机」——它是宿主机上的一组进程，靠 namespace 隔离，不是虚拟整机",
          "把有状态老应用不加改造塞进容器，出事才发现容器的设计前提是无状态、可抛弃"
        ]
      },
      diagram: {
        type: "flow",
        title: "部署形态三代演进",
        items: [
          ["物理机", "部署以月计，一机一应用"],
          ["虚拟机", "Hypervisor 虚拟整机，GB 镜像，分钟启动"],
          ["容器", "共享宿主内核，MB 镜像，秒级启动"],
          ["代价", "隔离级别逐代降低，密度与弹性逐代升高"]
        ]
      },
      quiz: {
        q: "容器比虚拟机启动快、镜像小的根本原因是？",
        options: [
          "容器用了更快的虚拟化技术",
          "容器共享宿主机内核，不用为每个实例装一份完整操作系统",
          "容器不做资源隔离所以开销小",
          "容器镜像经过特殊压缩"
        ],
        answer: 1,
        explain: "虚拟机每个实例都要虚拟一台完整机器并启动一套 OS；容器只是宿主机上被 namespace/cgroups 圈起来的进程，共享宿主内核，所以镜像只有 MB 级、启动秒级。"
      },
      resources: {
        youtube: [
          { title: "Containers vs VMs: What's the difference?", channel: "IBM Technology", url: "https://www.youtube.com/watch?v=cjXI-yxqGTI", why: "IBM 官方科普短片，一张图讲清 VM 与容器架构差异和为什么容器更轻" },
          { title: "Virtual Machine (VM) vs Docker", channel: "IBM Technology", url: "https://www.youtube.com/watch?v=a1M_thDTqmU", why: "从 hypervisor 与共享内核角度对比虚拟机和 Docker，适合建立底层直觉" }
        ],
        bilibili: [
          { title: "Docker实战教程，跟架构师学docker，docker入门到大神", up: "尚硅谷", url: "https://www.bilibili.com/video/BV1gr4y1U7CY", why: "95 集系统课，开篇即讲物理机→虚拟机→容器的演进与容器轻量化的原因" },
          { title: "【狂神说Java】Docker最新超详细版教程通俗易懂", up: "遇见狂神说", url: "https://www.bilibili.com/video/BV1og4y1q7M4", why: "40 集入门课，前两章用通俗语言对比 Docker 与虚拟机的隔离与资源开销" }
        ],
        keywords: ["虚拟机和容器的区别", "Docker为什么这么轻", "容器化技术入门"]
      }
    },
    {
      id: "docker-basics",
      name: "容器与 Docker 基础",
      en: "DOCKER",
      branch: "prereq",
      deps: ["vm-to-container"],
      grid: { col: 2, row: 0 },
      summary: "namespace 隔离 + cgroups 限制 + 分层镜像 = 容器三件套",
      sections: {
        principle: "容器的隔离靠 Linux namespace：pid/net/mnt 等 namespace 让进程「以为」自己独占系统；资源限制靠 cgroups：给进程组划定 CPU 与内存上限。\n镜像采用分层结构：多层只读层叠加，顶部加一层可写层，多个容器可共享相同只读层，省磁盘也省分发带宽。\ndocker run 实际是 create（按镜像造容器）+ start（启动进程）两步合一；OCI 标准统一了镜像与运行时格式，容器不再是 Docker 一家的技术。",
        formula: [
          "隔离 = namespace（pid / net / mnt / uts / ipc / user）",
          "限制 = cgroups（CPU 配额、内存上限）",
          "docker run = docker create + docker start",
          "镜像 = 只读层叠加 + 顶部可写层（copy-on-write）"
        ],
        example: [
          "docker run -d --name web nginx 一条命令完成 create+start 并后台运行",
          "两个容器跑同一 nginx 镜像：只读层共享，各占一层薄薄的可写层",
          "docker exec -it web /bin/sh：进入一个已有 net/mnt namespace 的进程组",
          "修改容器内文件只写顶部可写层，删容器即丢——这正是「容器可抛弃」的由来"
        ],
        tradeoffs: [
          "namespace 隔离轻量但不如 VM 彻底，同宿主容器共享内核攻击面",
          "分层镜像大幅省存储与分发，层数过多会拖慢构建与拉取，需要合并精简",
          "可写层随容器生灭，临时数据方便，持久数据必须外挂 volume"
        ],
        pitfalls: [
          "把数据写在容器可写层——容器一删数据全没，持久化要走卷",
          "以为 docker run 是一条「原子命令」——它是 create+start 的组合，排障时要分清卡在哪一步"
        ]
      },
      diagram: {
        type: "tree",
        title: "容器的技术底座",
        items: [
          ["namespace", "pid/net/mnt 隔离视图：进程以为独占系统"],
          ["cgroups", "CPU/内存资源上限"],
          ["分层镜像", "只读层共享 + 顶部可写层"],
          ["docker run", "create（造容器）+ start（起进程）"],
          ["OCI", "镜像与运行时的开放标准"]
        ]
      },
      quiz: {
        q: "两个容器启动自同一个 nginx 镜像，为什么几乎不占双倍磁盘？",
        options: [
          "容器运行时自动去重文件",
          "镜像只读层被共享，每个容器只新增一层可写层",
          "第二个容器是第一个的快照",
          "Docker 对第二个容器做了压缩"
        ],
        answer: 1,
        explain: "分层镜像：只读层叠加共享，每个运行中的容器只在顶部挂一层很薄的可写层。所以同镜像多容器磁盘开销远小于镜像大小 × 容器数。单机玩得转之后，下一个问题是：几十台机器上的几千个容器谁来管？"
      },
      resources: {
        youtube: [
          { title: "Docker Tutorial for Beginners [FULL COURSE in 3 Hours]", channel: "TechWorld with Nana", url: "https://www.youtube.com/watch?v=3c-iBn73dDE", why: "最经典的 Docker 入门全程课，镜像分层、docker run 全流程实操演示" },
          { title: "Containerization Explained", channel: "IBM Technology", url: "https://www.youtube.com/watch?v=0qotVMX-J5s", why: "10 分钟概念短片，讲清镜像、容器与共享内核隔离的原理，配合实操课食用" }
        ],
        bilibili: [
          { title: "【狂神说Java】Docker最新超详细版教程通俗易懂", up: "遇见狂神说", url: "https://www.bilibili.com/video/BV1og4y1q7M4", why: "镜像/容器/仓库三大概念与常用命令讲得最通俗的中文入门课之一" },
          { title: "Docker实战教程，跟架构师学docker，docker入门到大神", up: "尚硅谷", url: "https://www.bilibili.com/video/BV1gr4y1U7CY", why: "体系更完整，含镜像分层原理、Dockerfile 与常用命令的深入讲解" }
        ],
        keywords: ["Docker入门教程", "镜像和容器的区别", "docker run 命令详解"]
      }
    },
    {
      id: "why-orchestration",
      name: "为什么需要编排",
      en: "WHY ORCHESTRA",
      branch: "prereq",
      deps: ["docker-basics"],
      grid: { col: 3, row: 0 },
      summary: "单机 Docker 管不了多机：调度、自愈、发布、发现、伸缩都要人肉",
      sections: {
        principle: "一台机器上 docker run 很爽，但生产环境是几十上百台机器跑几千个容器：这个容器放哪台机器？机器挂了这个容器谁来拉起来？发新版怎么不停机？服务之间怎么找到对方？流量涨了怎么扩容？\n单机 Docker 对这些问题全部没有答案，每一件都要人肉脚本 + 人肉运维。\n编排系统（orchestrator）就是把这些「人肉决策」变成系统的自动职责——这是 Kubernetes 存在的理由。",
        formula: [
          "多机调度：容器该放哪台节点？",
          "故障自愈：节点/容器挂了谁重建？",
          "滚动发布：新版本如何不停机替换旧版本？",
          "服务发现 + 扩缩容：实例变化时流量如何自动跟随？"
        ],
        example: [
          "半夜节点宕机：单机 Docker 下要人工登上去重启容器，编排系统自动在其他节点重建",
          "发版：人肉逐台 docker stop/rm/run 必然有停机窗口，滚动发布用副本逐步替换",
          "流量翻倍：人肉加机器、改负载均衡配置 vs 一条命令扩副本",
          "实例 IP 漂移：人肉维护 nginx upstream vs 服务发现自动更新后端列表"
        ],
        tradeoffs: [
          "引入编排系统带来自动化，也带来集群自身的复杂度与运维成本",
          "小规模单机场景强上 K8s 是过度工程，Docker Compose 可能更合适",
          "编排把故障处理从「人找问题」变成「系统先自愈、人再看根因」，对监控体系提出更高要求"
        ],
        pitfalls: [
          "以为编排 = 把 docker run 批量执行一遍——核心价值是持续的状态管理，不是一次性分发",
          "团队没有容器化运维基础就强上 K8s，集群本身先变成最大的故障源"
        ]
      },
      diagram: {
        type: "bars",
        title: "单机 Docker 缺什么",
        items: [
          ["多机调度", "容器放哪台？人肉决策"],
          ["故障自愈", "机器挂了谁拉起？人肉重启"],
          ["滚动发布", "不停机换版？人肉逐台操作"],
          ["服务发现", "IP 变了谁知道？人肉改配置"],
          ["扩缩容", "流量涨了？人肉加实例"]
        ]
      },
      quiz: {
        q: "从单机 Docker 走向编排系统，最核心的动机是？",
        options: [
          "单机 Docker 命令太多记不住",
          "多机环境下调度、自愈、发布、发现、伸缩全靠人肉，不可持续",
          "编排系统能让容器跑得更快",
          "为了用上 YAML"
        ],
        answer: 1,
        explain: "编排解决的是「规模」问题：容器数量与机器数量上来后，调度、自愈、滚动发布、服务发现、扩缩容这些人肉操作必须交给系统。理解了这个动机，下一个问题就是：K8s 用什么机制实现这些自动化？答案是声明式 API。"
      },
      resources: {
        youtube: [
          { title: "Docker vs Kubernetes vs Docker Swarm | Comparison in 5 mins", channel: "TechWorld with Nana", url: "https://www.youtube.com/watch?v=9_s3h_GVzZc", why: "5 分钟讲清单机 Docker 管不了多机时编排工具解决什么问题" },
          { title: "Kubernetes in 5 mins", channel: "VMware Cloud Native Apps", url: "https://www.youtube.com/watch?v=PH-2FfFD2PU", why: "VMware 官方动画短片，用自愈、伸缩、滚动发布讲清为什么需要 Kubernetes" }
        ],
        bilibili: [
          { title: "Kubernetes(K8S) 入门进阶实战完整教程，黑马程序员K8S全套教程（基础+高级）", up: "黑马Java", url: "https://www.bilibili.com/video/BV1Qv41167ck", why: "85 集系统课，开篇从单机 Docker 的局限切入讲编排的必要性" },
          { title: "K8s入门到精通，B站最火k8s教程，Kubernetes实战", up: "尚硅谷", url: "https://www.bilibili.com/video/BV1w4411y7Go", why: "B站播放量最高的 K8s 课（184 万+），导论部分覆盖编排、自愈与服务发现动机" }
        ],
        keywords: ["为什么需要K8s", "容器编排是什么", "Docker单机部署的坑"]
      }
    },
    {
      id: "k8s-declarative",
      name: "声明式 API 与调和循环",
      en: "DECLARATIVE",
      branch: "prereq",
      deps: ["why-orchestration"],
      grid: { col: 4, row: 0 },
      summary: "提交期望状态，controller 持续把实际状态调回去",
      sections: {
        principle: "命令式是逐条下指令：「创建 3 个容器」「把这台机器上的旧容器删掉」——每一步都要人盯着，中间任何一步失败状态就漂移了。\n声明式只提交期望状态（YAML）：「我要 3 个副本持续运行」，之后由 controller 跑调和循环（reconcile loop）：不断对比实际状态与期望状态，发现偏差就纠正。\n这就是 K8s 一切自动化的发动机：自愈、扩缩、滚动发布，本质上都是 controller 在 reconcile。",
        formula: [
          "调和循环：observe（读实际状态）→ diff（比期望）→ act（纠正）→ 再 observe",
          "kubectl apply -f xxx.yaml：提交期望状态，不是「执行一次命令」",
          "actual ≠ desired ⇒ controller 持续纠正直到一致"
        ],
        example: [
          "YAML 写 replicas: 3，某 Pod 被删掉，controller 观察到 2≠3，自动补建一个",
          "把 replicas 改成 5 再 apply：controller 检测到偏差，多建 2 个",
          "命令式做法：kubectl create 三次，挂了一个没人管——状态漂移开始了",
          "节点宕机后 Pod 在其他节点重建，不是「故障转移脚本」，是调和循环的自然结果"
        ],
        tradeoffs: [
          "声明式让系统能自愈，但「系统自己在动」对新手是黑盒，排查要学会看 controller 的视角",
          "期望状态存 etcd，天然适合版本化与 GitOps；命令式操作不留清单，难以审计与回放",
          "调和是「最终一致」，不是瞬时生效——提交后有一小段收敛时间"
        ],
        pitfalls: [
          "把 apply 当一次性命令——只要 YAML 还在，controller 就会把你手工改的东西改回去",
          "混用命令式与声明式管理同一对象：手工 kubectl scale 之后，下次 apply 又被 YAML 覆盖"
        ]
      },
      diagram: {
        type: "loop",
        anim: "reconcileLoop",
        title: "调和循环（reconcile loop）",
        items: [
          ["observe", "读实际状态：现有 2 Pod"],
          ["diff", "对比期望：2 ≠ 3"],
          ["act", "调和：补建 1 个 Pod"],
          ["再观察", "3 = 3，循环不息"]
        ]
      },
      quiz: {
        q: "你 apply 了一份 replicas: 3 的 YAML，之后手工删掉一个 Pod，接下来会发生什么？",
        options: [
          "Pod 永久消失，直到下次 apply",
          "controller 在调和循环中发现 2≠3，自动重建一个",
          "K8s 报错说状态被破坏",
          "剩下的两个 Pod 会负载翻倍"
        ],
        answer: 1,
        explain: "调和循环持续对比实际与期望：你删掉的只是「实际状态」，期望状态还是 3，controller 必然补建。这就是自愈的本质。下一步看看这个循环跑在什么样的集群上——集群拓扑与 kubectl。"
      },
      resources: {
        youtube: [
          { title: "Episode 5 | Declarative vs Imperative in Kubernetes", channel: "Ahmed Moustafa", url: "https://www.youtube.com/watch?v=5oXfeSilo4c", why: "专讲声明式与命令式对象管理的区别，kubectl create/apply 行为对比清晰" },
          { title: "Kubernetes Explained - Desired State and the Reconcile Loop", channel: "Pattern Repetition", url: "https://www.youtube.com/watch?v=TyNeuvhE_L0", why: "专讲期望状态与调和循环的视频，正是 controller reconcile 的入门解释" }
        ],
        bilibili: [
          { title: "K8s入门到精通，B站最火k8s教程，Kubernetes实战", up: "尚硅谷", url: "https://www.bilibili.com/video/BV1w4411y7Go", why: "kubectl 章节讲解了命令式与声明式对象管理的差异及 YAML 清单的使用" }
        ],
        keywords: ["K8s声明式API", "K8s控制器原理", "期望状态与实际状态"]
      }
    },
    {
      id: "cluster-kubectl",
      name: "集群拓扑与 kubectl",
      en: "CLUSTER",
      branch: "prereq",
      deps: ["k8s-declarative"],
      grid: { col: 5, row: 0 },
      summary: "集群 = 控制平面 + 工作节点；kubectl 五件套走天下",
      sections: {
        principle: "一个 K8s 集群分两半边：控制平面（control plane）负责决策与状态存储，工作节点（worker nodes）负责真正跑容器。\nkubectl 是你与集群唯一的交互入口——所有操作都通过它发给控制平面的 API server。\n日常 90% 的操作落在五件套上：get 看列表、apply 提交期望、describe 看详情与事件、logs 看日志、exec 进容器。",
        formula: [
          "集群 = control plane + N × worker node",
          "kubectl get pods -n <ns>：看资源列表",
          "kubectl apply -f app.yaml：提交期望状态",
          "kubectl describe pod <name>：详情 + events（排障第一现场）",
          "kubectl logs <pod> / kubectl exec -it <pod> -- sh：日志与进容器"
        ],
        example: [
          "kubectl get nodes：看集群有几台节点、状态 Ready 与否",
          "kubectl get pods -A：跨 namespace 列出所有 Pod",
          "Pod 一直 Pending：kubectl describe pod 看 events 里的调度失败原因",
          "容器反复重启：kubectl logs --previous 看上一次退出前的日志"
        ],
        tradeoffs: [
          "kubectl 直连 API server，单点入口统一好管理，但 API server 不可用时整个集群失控（跑的容器不受影响）",
          "五件套够用但粒度粗，复杂筛选要靠 -o jsonpath / label selector 等进阶用法",
          "多集群环境要在 kubeconfig 里切换 context，切错集群是常见事故源"
        ],
        pitfalls: [
          "只看 get 不看 describe——events 里才有调度失败、拉镜像失败的第一手原因",
          "忘了 -n 指定 namespace，在 default 里找不到自己的资源就以为丢了"
        ]
      },
      diagram: {
        type: "tree",
        title: "集群两半与 kubectl 入口",
        items: [
          ["控制平面", "决策与状态：API server 等组件"],
          ["工作节点", "真正跑容器的机器"],
          ["kubectl", "唯一交互入口，直连 API server"],
          ["五件套", "get / apply / describe / logs / exec"]
        ]
      },
      quiz: {
        q: "Pod 创建后一直 Pending，第一步应该执行什么？",
        options: [
          "kubectl delete pod 删掉重建",
          "kubectl describe pod 看 events 里的失败原因",
          "kubectl logs 看日志",
          "重启 kubelet"
        ],
        answer: 1,
        explain: "Pending 说明容器还没启动，logs 里什么都没有；调度失败的原因写在 events 里，describe 是第一现场。有了集群视角和五件套，就可以动手部署第一个应用了。"
      },
      resources: {
        youtube: [
          { title: "Kubernetes Architecture Simplified | K8s Explained in 10 Minutes", channel: "KodeKloud", url: "https://www.youtube.com/watch?v=8C_SCDbUJTg", why: "KodeKloud 10 分钟讲清控制平面与工作节点各组件角色，图示非常清晰" },
          { title: "Kubernetes Tutorial for Beginners [FULL COURSE in 4 Hours]", channel: "TechWorld with Nana", url: "https://www.youtube.com/watch?v=X48VuDVv0do", why: "4 小时全程课，Minikube 集群搭建与 kubectl get/apply/describe 全程实操" }
        ],
        bilibili: [
          { title: "K8s入门到精通，B站最火k8s教程，Kubernetes实战", up: "尚硅谷", url: "https://www.bilibili.com/video/BV1w4411y7Go", why: "组件说明章节逐一讲 master/node 各角色，kubectl 命令贯穿全课" },
          { title: "Kubernetes(K8S) 入门进阶实战完整教程，黑马程序员K8S全套教程（基础+高级）", up: "黑马Java", url: "https://www.bilibili.com/video/BV1Qv41167ck", why: "集群架构章节配合 kubeadm 搭集群实操，能看到 kubectl 各命令的真实输出" }
        ],
        keywords: ["K8s集群架构", "kubectl常用命令", "K8s master和node区别"]
      }
    },
    {
      id: "first-app",
      name: "第一个应用",
      en: "FIRST APP",
      branch: "prereq",
      deps: ["cluster-kubectl"],
      grid: { col: 6, row: 0 },
      summary: "一条命令起一个 Deployment，YAML 四要素认清结构",
      sections: {
        principle: "在 K8s 里你不直接「跑容器」，而是创建一个 Deployment 对象，声明「用 nginx 镜像保持 N 个副本运行」，剩下的交给调和循环。\n任何 K8s 资源的 YAML 都有四要素：apiVersion（API 版本）、kind（资源类型）、metadata（名字与标签）、spec（期望状态本体）。\n从一条命令起步，到能读懂和手写 YAML，是整条主线（Pod/Deployment/Service…）的地基。",
        formula: [
          "kubectl create deployment nginx --image=nginx --replicas=2",
          "YAML 四要素：apiVersion / kind / metadata / spec",
          "kubectl get pods -o wide：看 Pod 落在哪个节点",
          "kubectl expose / port-forward：把应用暴露出来访问"
        ],
        example: [
          "kubectl create deployment nginx --image=nginx → get pods 看到 1 个 Running",
          "kubectl scale deployment nginx --replicas=3 → 观察到逐步补到 3 个",
          "对照 YAML：kind: Deployment，spec.replicas: 3，spec.template 里是 Pod 的定义",
          "kubectl delete pod 任意一个 → 调和循环立刻补回，第一次亲身体会自愈"
        ],
        tradeoffs: [
          "create/scale 命令式起步快，但不留清单，生产应尽早切换到 YAML + apply",
          "port-forward 适合本地调试，真正的流量入口要走 Service/Ingress（主线会讲）",
          "latest 镜像 tag 图省事，版本不可追溯，生产必须钉死具体版本号"
        ],
        pitfalls: [
          "直接创建裸 Pod——没有 controller 看管，挂了没人重建，生产必须用 Deployment",
          "YAML 里 apiVersion 写错（如 Deployment 写成 extensions/v1beta1 的老版本）apply 直接报错"
        ]
      },
      diagram: {
        type: "flow",
        title: "第一个应用落地",
        items: [
          ["kubectl create deployment", "声明：nginx 镜像 × 2 副本"],
          ["YAML 四要素", "apiVersion / kind / metadata / spec"],
          ["调和循环", "controller 建 Pod、调度、起容器"],
          ["验证", "get pods -o wide：Running 且落在某节点"],
          ["下一步", "Pod 为什么是最小单位？→ 主线 K03"]
        ]
      },
      quiz: {
        q: "一份合法的 K8s 资源 YAML 必须包含哪四个顶层字段？",
        options: [
          "name / image / replicas / port",
          "apiVersion / kind / metadata / spec",
          "version / type / labels / containers",
          "api / resource / meta / data"
        ],
        answer: 1,
        explain: "四要素：apiVersion 定 API 版本、kind 定资源类型、metadata 放名字与标签、spec 写期望状态。前置线到此打通：你已经会集群、会命令、会跑应用，接下来进入主线，从控制平面开始拆解 K8s 的内部机制。"
      },
      resources: {
        youtube: [
          { title: "Kubernetes Crash Course for Absolute Beginners [NEW]", channel: "TechWorld with Nana", url: "https://www.youtube.com/watch?v=s_o8dwzRlu4", why: "1.5 小时速成课，从 docker run 平滑过渡到 kubectl 部署第一个应用" },
          { title: "Kubernetes Crash Course: Learn the Basics and Build a Microservice Application", channel: "KodeKloud", url: "https://www.youtube.com/watch?v=XuSQU5Grv1g", why: "KodeKloud 速成课，动手写一个 YAML 并把微服务应用跑上集群" }
        ],
        bilibili: [
          { title: "Kubernetes(K8S) 入门进阶实战完整教程，黑马程序员K8S全套教程（基础+高级）", up: "黑马Java", url: "https://www.bilibili.com/video/BV1Qv41167ck", why: "基础篇用 nginx 做首个部署演示，kubectl run 与 YAML apply 两种方式都有" },
          { title: "K8s入门到精通，B站最火k8s教程，Kubernetes实战", up: "尚硅谷", url: "https://www.bilibili.com/video/BV1w4411y7Go", why: "Pod/Deployment 章节从 YAML 初识讲到部署第一个应用，节奏适合零基础" }
        ],
        keywords: ["K8s部署nginx", "第一个K8s应用", "K8s YAML入门"]
      }
    },
    {
      id: "control-plane",
      name: "控制平面组件",
      en: "CONTROL PLANE",
      branch: "arch",
      deps: ["cluster-kubectl"],
      grid: { col: 1, row: 1 },
      summary: "apiserver 守门、etcd 记账、scheduler 选人、controller 调和",
      sections: {
        principle: "控制平面四大件各管一摊：kube-apiserver 是集群唯一入口，所有请求（kubectl、各组件之间）都过它，负责认证、鉴权与准入控制。\netcd 是 Raft 一致性 KV 存储，整个集群的全部状态（期望与实际）都记在这里。\nkube-scheduler 给还没落节点的 Pod 选节点：先 filter 筛掉不满足条件的，再 score 打分选最优。controller-manager 跑各种 controller 的调和循环——Deployment、Node、Job 等控制器都在其中。",
        formula: [
          "请求链路：kubectl → apiserver →（认证/鉴权/准入）→ 写 etcd",
          "scheduler：filter（过滤不合适节点）→ score（打分选优）",
          "etcd：Raft 多数派一致性，存集群全部状态",
          "controller-manager：N 个 controller 的 reconcile loop 集合"
        ],
        example: [
          "kubectl apply 一个 Deployment：apiserver 校验后写入 etcd，只有期望状态变了",
          "deployment controller 发现 spec 里 3 副本实际 0 个 → 创建 Pod 对象",
          "scheduler 看到未绑定 Pod → filter 掉资源不足的节点 → score 选出最优节点",
          "etcd 挂掉：集群状态不可读写，但已运行的容器不受影响（决策瘫痪、运行照旧）"
        ],
        tradeoffs: [
          "apiserver 唯一入口统一了认证鉴权，但也成为性能与可用性的关键路径，生产要配多副本 + 负载均衡",
          "etcd 基于 Raft，强一致换来的是写延迟与多数派可用性要求，一般 3 或 5 节点",
          "组件职责单一、松耦合，代价是理解链路要跨多个组件串起来看"
        ],
        pitfalls: [
          "以为 scheduler 会「重新调度」已运行的 Pod——它只管未绑定的新 Pod，运行中的 Pod 不会自动搬家",
          "把 etcd 当普通数据库去读写——一切变更必须走 apiserver，直写 etcd 等于绕过所有校验"
        ]
      },
      diagram: {
        type: "flow",
        title: "apply 一个 Deployment 的旅程",
        items: [
          ["kubectl", "提交 YAML 到 apiserver"],
          ["apiserver", "认证/鉴权/准入 → 写 etcd"],
          ["controller-manager", "发现期望 3 实际 0 → 建 Pod 对象"],
          ["scheduler", "filter → score，给 Pod 选节点"],
          ["etcd", "每一步状态变更都落账"]
        ]
      },
      quiz: {
        q: "整个集群状态中，「期望 3 副本、实际已有 2 个」这条信息存在哪里？",
        options: [
          "controller-manager 的内存里",
          "etcd 里",
          "scheduler 的缓存里",
          "各个 worker 节点本地"
        ],
        answer: 1,
        explain: "etcd 存集群全部状态（期望与实际），其他组件都是无状态或可从 etcd 重建。控制平面发完决策，真正接活的是节点上的组件——下一站 kubelet。"
      },
      resources: {
        youtube: [
          { title: "Kubernetes Architecture Explained: Exploring etcd, Schedulers, Managers, and Node Components", channel: "KodeKloud", url: "https://www.youtube.com/watch?v=klxZke9qbvg", why: "KodeKloud 系统讲解控制平面四大组件，权威且覆盖面全" },
          { title: "Kubernetes Explained in 6 Minutes | k8s Architecture", channel: "ByteByteGo", url: "https://www.youtube.com/watch?v=TlHvYWVUZyc", why: "ByteByteGo 6 分钟动画速览整体架构，适合先建立全景认知" }
        ],
        bilibili: [
          { title: "12.简单懂点k8s组件（API server/Controller/Scheduler/kubelet/kube-proxy）", up: "简单懂点", url: "https://www.bilibili.com/video/BV1dZ4y1v7H3", why: "逐个讲清 apiserver、scheduler、controller-manager 等组件职责" },
          { title: "【尚硅谷】Kubernetes（k8s）入门到实战教程丨全新升级完整版", up: "尚硅谷", url: "https://www.bilibili.com/video/BV1GT4y1A756", why: "88万播放的系统课，前期章节专讲集群架构与控制平面组件" }
        ],
        keywords: ["k8s架构详解", "k8s控制平面组件", "etcd和apiserver"]
      }
    },
    {
      id: "node-runtime",
      name: "节点组件 kubelet",
      en: "NODE RUNTIME",
      branch: "arch",
      deps: ["control-plane"],
      grid: { col: 2, row: 1 },
      summary: "kubelet 在节点上接活：经 CRI 调 containerd 起容器",
      sections: {
        principle: "scheduler 把 Pod 绑定到某节点后，该节点的 kubelet 通过 watch apiserver 发现「分给我的新任务」，接管这个 Pod 的整个生命周期。\nkubelet 自己不直接起容器，而是通过 CRI（Container Runtime Interface）调用容器运行时（如 containerd）来拉镜像、建容器。\n节点上另一位常驻是 kube-proxy：它维护 iptables/IPVS 规则，把访问 Service 虚拟 IP 的流量转发到后端 Pod——这部分留到 Service 节点展开。",
        formula: [
          "kubelet：watch apiserver → 发现绑定本节点的 Pod → CRI → containerd 起容器",
          "CRI：kubelet 与容器运行时之间的标准接口",
          "kube-proxy：Service VIP → Pod IP 的 iptables/IPVS 规则"
        ],
        example: [
          "scheduler 决策「Pod A → node-3」写入 etcd，node-3 的 kubelet 立刻 watch 到",
          "kubelet 经 CRI 让 containerd 拉 nginx 镜像并启动容器",
          "kubelet 定期向 apiserver 上报节点与 Pod 状态（心跳）",
          "kubelet 还执行探针检查：liveness 失败就重启容器（运维线会细讲）"
        ],
        tradeoffs: [
          "CRI 抽象让运行时可插拔（containerd/CRI-O），但也多了一层间接，排障要分清 kubelet 层与运行时层",
          "kubelet 是节点上唯一「管事」的组件，它挂了节点上的容器还活着但失去管理（不报状态、不重启失败容器）",
          "kube-proxy 的 iptables 模式简单通用，Service 很多时规则膨胀，IPVS 模式性能更好"
        ],
        pitfalls: [
          "以为 kubelet 直接 run 容器——它只发 CRI 调用，镜像拉取失败这类错要去运行时层看",
          "节点 NotReady 就重启容器——先看 kubelet 是否活着、能否连上 apiserver"
        ]
      },
      diagram: {
        type: "flow",
        title: "Pod 在节点上被拉起",
        items: [
          ["scheduler", "绑定 Pod → node-3，写入 etcd"],
          ["kubelet", "watch 到分给自己的 Pod"],
          ["CRI 调用", "请 containerd 干活"],
          ["containerd", "拉镜像、起容器"],
          ["kube-proxy", "同步维护 Service 转发规则"]
        ]
      },
      quiz: {
        q: "kubelet 通过什么机制启动容器？",
        options: [
          "直接调用 Docker 命令",
          "通过 CRI 接口调用 containerd 等容器运行时",
          "SSH 到节点上执行 runc",
          "让 scheduler 代为启动"
        ],
        answer: 1,
        explain: "kubelet 经 CRI 标准接口调容器运行时（如 containerd），自身不碰容器实现细节。架构两侧（控制平面 + 节点）齐了，接下来进入工作负载本体：K8s 里最小的调度单位 Pod。"
      },
      resources: {
        youtube: [
          { title: "Kubernetes Worker Node Components Explained: kubelet, kube-proxy & Container Runtime", channel: "CodeLucky", url: "https://www.youtube.com/watch?v=tw9iSfcYw9c", why: "专题讲解 Worker 节点三件套 kubelet/kube-proxy/容器运行时" },
          { title: "Kube Proxy and Kubelet | Node Agents in Kubernetes", channel: "JMMTechnology", url: "https://www.youtube.com/watch?v=qzjpPUAvGHc", why: "聚焦 kubelet 与 kube-proxy 两个节点代理的分工" }
        ],
        bilibili: [
          { title: "kube-proxy 的三种网络实现到底差在哪", up: "混合云架构师星海", url: "https://www.bilibili.com/video/BV1LrHv6mEy6", why: "对比 kube-proxy 的 userspace/iptables/IPVS 三种模式" },
          { title: "k8s源码课程之 kube-proxy 中iptables模式的规则分析", up: "小乙运维杂货铺", url: "https://www.bilibili.com/video/BV1h34y1t7ei", why: "源码级分析 kube-proxy iptables 规则，适合进阶" }
        ],
        keywords: ["kubelet是干什么的", "kube-proxy原理", "k8s节点组件"]
      }
    },
    {
      id: "pod",
      name: "Pod 最小调度单元",
      en: "POD",
      branch: "arch",
      deps: ["first-app"],
      grid: { col: 3, row: 1 },
      summary: "一组共享网络的容器：pause 占位、localhost 互通",
      sections: {
        principle: "Pod 是 K8s 调度的最小单位，可以装一个或多个容器。为什么不直接调度容器？因为有些容器必须同生共死、共享网络与存储——这组容器的集合就是 Pod。\n实现上每个 Pod 里有一个看不见的 pause 容器先启动，创建并持有 network/uts namespace，业务容器再加入这些 namespace。\n因此同 Pod 内容器可以用 localhost 直接互访（共享网络栈），文件则要通过共享卷互通。sidecar 模式（日志收集、代理等辅助容器与主容器同 Pod）就是多容器 Pod 的典型用法。",
        formula: [
          "Pod = pause 容器（持有 net/uts namespace）+ 1..N 业务容器",
          "同 Pod 容器互访：localhost:<port>",
          "调度、IP 分配、生死都以 Pod 为单位"
        ],
        example: [
          "一个 Pod 跑 app + log-agent 两个容器：app 写日志到共享卷，log-agent 读走",
          "app 容器访问同 Pod 的 sidecar 代理：http://localhost:15001",
          "kubectl get pods 显示 2/2 Running：分子是就绪容器数，分母是容器总数",
          "Pod 删除：pause 与所有业务容器一起销毁，IP 随之释放"
        ],
        tradeoffs: [
          "多容器同 Pod 共享网络存储、协同紧密，但也绑定了调度与伸缩粒度——要扩就得整体扩",
          "sidecar 把辅助能力从应用镜像剥离，代价是每个 Pod 多一份资源开销",
          "Pod 是临时的：IP 会变、会被重建，任何依赖固定 IP 的设计都是反模式"
        ],
        pitfalls: [
          "在 Pod IP 上做硬编码——Pod 重建 IP 就变，寻址必须走 Service",
          "以为同 Pod 容器共享文件系统——只共享网络 namespace，文件互通要挂共享卷"
        ]
      },
      diagram: {
        type: "tree",
        title: "一个 Pod 的内部",
        items: [
          ["pause 容器", "先启动，持有 net/uts namespace"],
          ["业务容器 app", "加入 pause 的 namespace"],
          ["sidecar 容器", "同样加入，localhost 互通"],
          ["对外", "整个 Pod 一个 IP，同生共死"]
        ]
      },
      quiz: {
        q: "同一个 Pod 里的两个容器如何互相通信？",
        options: [
          "通过各自的 Pod IP 互访",
          "通过 localhost，因为共享 network namespace",
          "通过 Service 转发",
          "通过宿主机的 docker0 网桥"
        ],
        answer: 1,
        explain: "pause 容器持有 network namespace，业务容器加入其中，共享同一个网络栈，所以 localhost 直连即可。单个 Pod 会跑了，但它朝生暮死——谁来保证「始终有 N 个 Pod 活着」？下一站 Deployment。"
      },
      resources: {
        youtube: [
          { title: "Pods and Containers - Kubernetes Networking | Container Communication inside the Pod", channel: "TechWorld with Nana", url: "https://www.youtube.com/watch?v=5cNrTU6o3Fw", why: "Nana 讲清 Pod 内容器共享网络 namespace 的通信机制" },
          { title: "The Invisible Hero of Every Pod: The Kubernetes Pause Container", channel: "The Kube Chef", url: "https://www.youtube.com/watch?v=NiEVPdpKDdI", why: "专题解析 pause 容器为什么是每个 Pod 的隐形基石" }
        ],
        bilibili: [
          { title: "k8s pause容器（根容器）详解", up: "学亮编程手记", url: "https://www.bilibili.com/video/BV1EG41197CB", why: "5 分钟讲透 pause 根容器与共享 namespace" },
          { title: "【IT老齐899.37】容器日志收集模式DaemonSet vs SideCar", up: "IT老齐", url: "https://www.bilibili.com/video/BV1AhdYBqEpT", why: "以日志收集场景对比 sidecar 多容器模式与 DaemonSet" }
        ],
        keywords: ["k8s Pod详解", "pause容器是什么", "sidecar边车模式"]
      }
    },
    {
      id: "deployment",
      name: "Deployment 与 ReplicaSet",
      en: "DEPLOYMENT",
      branch: "arch",
      deps: ["pod"],
      grid: { col: 4, row: 1 },
      summary: "Deployment 管 RS、RS 保副本数，节点挂了自动重建",
      sections: {
        principle: "三层管理关系：Deployment 定义期望并管理 ReplicaSet，ReplicaSet 负责维持期望的 Pod 副本数，Pod 是最终干活的。\n为什么要中间这层 RS？发版时 Deployment 为每个版本建一个新 RS：新 RS 扩容、旧 RS 缩容，滚动替换；旧 RS 保留在那就是回滚档案。\n自愈是 RS 的本职：节点宕机，上面的 Pod 状态变为丢失，RS 发现实际副本 < 期望，立即在其他节点重建。",
        formula: [
          "Deployment → ReplicaSet（每版本一个）→ Pod × N",
          "spec.replicas: 期望副本数，RS 持续调和实际 = 期望",
          "kubectl rollout status/undo：发布状态与回滚"
        ],
        example: [
          "replicas: 3 的 Deployment，node-2 宕机，RS 发现 1 个 Pod 丢失",
          "几秒内在 node-1/node-3 上重建 Pod，副本回到 3——没人半夜被叫醒",
          "改镜像版本 apply：Deployment 建新 RS（v2），逐步扩到 3、旧 RS（v1）缩到 0",
          "kubectl rollout undo：旧 RS 原地扩回 3，秒级回滚，因为旧 RS 一直留着"
        ],
        tradeoffs: [
          "RS 保留历史版本让回滚秒级完成，代价是旧 RS 对象堆积（默认保留 10 个，可配 revisionHistoryLimit）",
          "自愈重建在新节点上意味着 IP 与本地数据全变——Pod 必须无状态或有持久卷",
          "Deployment 只管无状态副本，有状态应用（数据库等）要用 StatefulSet（本路线图之外）"
        ],
        pitfalls: [
          "绕过 Deployment 直接改 RS——Deployment 下次调和会覆盖你的手工改动",
          "以为节点挂了 Pod 立刻重建——要先等节点心跳超时（默认数十秒）才被标记驱逐"
        ]
      },
      diagram: {
        type: "tree",
        title: "三层管理结构",
        items: [
          ["Deployment", "声明版本与副本数，管发版"],
          ["ReplicaSet v2", "当前版本：保 3 副本"],
          ["ReplicaSet v1", "旧版本：缩到 0，留作回滚档案"],
          ["Pod × 3", "节点挂了？RS 在他节点重建"]
        ]
      },
      quiz: {
        q: "Deployment 更新镜像后能实现秒级回滚，关键机制是？",
        options: [
          "K8s 缓存了旧镜像",
          "旧版本的 ReplicaSet 被保留，rollout undo 时直接扩容回去",
          "kubectl 记录了你的历史命令",
          "etcd 每天自动备份"
        ],
        answer: 1,
        explain: "每个版本对应一个 RS，旧 RS 只是缩容到 0 并不删除，回滚 = 旧 RS 重新扩容。副本能保住了，但 Pod IP 随重建漂移，流量如何稳定地找到它们？下一站 Service。"
      },
      resources: {
        youtube: [
          { title: "Kubernetes Pods, ReplicaSets, and Deployments in 5 Minutes", channel: "Containers from the Couch", url: "https://www.youtube.com/watch?v=iC-WxZGhFqs", why: "5 分钟厘清 Pod→ReplicaSet→Deployment 的声明式层级关系" },
          { title: "Kubernetes Deployment Explained | Pods, ReplicaSets, Rolling Updates & Rollbacks", channel: "VictoryDeveloper", url: "https://www.youtube.com/watch?v=GqC7uqNLgx0", why: "覆盖滚动更新与回滚的完整 Deployment 工作流" }
        ],
        bilibili: [
          { title: "Kubernetes资源抽象的精髓：讲解Pod, Node, Deployment, ReplicaSet", up: "JimmyCoding", url: "https://www.bilibili.com/video/BV1eU4y1j7Uj", why: "从资源抽象角度串讲 Deployment 与 ReplicaSet 的关系" },
          { title: "Kubernetes(K8S) 入门进阶实战完整教程，黑马程序员K8S全套教程（基础+高级）", up: "黑马Java", url: "https://www.bilibili.com/video/BV1Qv41167ck", why: "74万播放系统课，含 Deployment 滚动更新实战章节" }
        ],
        keywords: ["k8s滚动更新", "Deployment和ReplicaSet区别", "k8s零停机发布"]
      }
    },
    {
      id: "service",
      name: "Service 与 kube-proxy",
      en: "SERVICE",
      branch: "arch",
      deps: ["deployment"],
      grid: { col: 5, row: 1 },
      summary: "虚拟 IP + 负载均衡：给漂移的 Pod 一个稳定身份",
      sections: {
        principle: "Pod 会重建、IP 会漂移，客户端不能追着 Pod IP 跑。Service 提供固定虚拟 IP 与 DNS 名，把流量负载均衡到后端一组 Pod。\n实现：kube-proxy 在每个节点维护 iptables/IPVS 规则，把发往 Service 虚拟 IP 的包转发到 endpoints 里登记的后端 Pod；endpoints 列表由 controller 根据 Pod 标签与就绪状态实时维护。\n三种类型：ClusterIP（默认，仅集群内可达）、NodePort（每节点开 30000-32767 区间端口对外）、LoadBalancer（向云厂商要一个外部 LB）。CoreDNS 负责把 Service 名解析成虚拟 IP，完成服务发现。",
        formula: [
          "Service VIP →（kube-proxy iptables/IPVS）→ endpoints（后端 Pod IP 列表）",
          "ClusterIP（默认）/ NodePort（30000-32767）/ LoadBalancer",
          "DNS：<svc>.<ns>.svc.cluster.local（CoreDNS）"
        ],
        example: [
          "kubectl expose deployment nginx --port=80 → 得到 ClusterIP 如 10.96.0.15",
          "集群内任意 Pod 访问 10.96.0.15:80，被轮询转发到 3 个 nginx Pod 之一",
          "直接访问 http://nginx：CoreDNS 把名字解析成 10.96.0.15",
          "NodePort: 30080 → 集群外访问 任一节点IP:30080 即可到达服务"
        ],
        tradeoffs: [
          "ClusterIP 零成本但只限集群内；NodePort 暴露简单但端口段受限、无真正负载均衡",
          "LoadBalancer 体验最好，但每个 Service 都向云厂商买一个 LB，贵了不说还难管理——生产入口一般用 Ingress 收敛",
          "iptables 模式规则随 Service 数线性膨胀，大规模集群用 IPVS 模式"
        ],
        pitfalls: [
          "Service 选了标签但 Pod 标签不匹配——endpoints 为空，访问超时，先 kubectl get endpoints 查",
          "以为 Service 是反向代理进程——它只是一组 iptables/IPVS 规则 + 一条 DNS 记录，没有「服务进程」可重启"
        ]
      },
      diagram: {
        type: "flow",
        anim: "trafficFanout",
        title: "一次 Service 访问的旅程",
        items: [
          ["客户端", "访问 nginx.default.svc:80"],
          ["CoreDNS", "解析为 ClusterIP 10.96.0.15"],
          ["kube-proxy 规则", "VIP → 从 endpoints 挑一个 Pod"],
          ["endpoints", "10.244.1.7 / 10.244.2.3 / 10.244.3.9"],
          ["Pod", "收到流量（漂移也不影响 VIP）"]
        ]
      },
      quiz: {
        q: "Service 的虚拟 IP 能稳定访问后端 Pod，流量转发是靠什么实现的？",
        options: [
          "一个运行中的 HAProxy Pod",
          "各节点上 kube-proxy 维护的 iptables/IPVS 规则",
          "CoreDNS 直接返回 Pod IP",
          "Ingress controller"
        ],
        answer: 1,
        explain: "Service 没有代理进程：kube-proxy 在每节点写入转发规则，endpoints controller 实时更新后端列表。四层入口有了，但每个服务一个 LB 太贵、也没有 host/path 路由——HTTP 场景需要七层的 Ingress。"
      },
      resources: {
        youtube: [
          { title: "Kubernetes Services explained | ClusterIP vs NodePort vs LoadBalancer vs Headless Service", channel: "TechWorld with Nana", url: "https://www.youtube.com/watch?v=T4Z7visMM4E", why: "Nana 经典课，四种 Service 类型对比讲得最清晰" },
          { title: "What is Kube-Proxy | Iptables vs IPVS | Kube-Proxy Explained in Simple Terms", channel: "The Devops Bucket", url: "https://www.youtube.com/watch?v=3NAAVpPTnVU", why: "专讲 kube-proxy 的 iptables 与 IPVS 模式差异" }
        ],
        bilibili: [
          { title: "Kubernetes(k8s)-服务(NodePort,LoadBalance,Headless Service)", up: "运维小路", url: "https://www.bilibili.com/video/BV1kNNoeeE5p", why: "实操演示 NodePort/LoadBalancer/Headless 三种服务类型" },
          { title: "【K8S教程】K8S DNS（CoreDNS）详解：CoreDNS配置解析", up: "学亮编程手记", url: "https://www.bilibili.com/video/BV1Cs4y1m7hN", why: "CoreDNS 配置与解析机制专题，补齐服务发现一环" }
        ],
        keywords: ["k8s Service类型", "ClusterIP和NodePort区别", "CoreDNS域名解析"]
      }
    },
    {
      id: "ingress",
      name: "Ingress 七层路由",
      en: "INGRESS",
      branch: "arch",
      deps: ["service"],
      grid: { col: 6, row: 1 },
      summary: "按 host/path 分发 HTTP，一个入口收敛所有服务",
      sections: {
        principle: "Service 是四层（IP+端口）负载均衡，看不懂 HTTP。Ingress 是七层路由：按域名与路径把请求分发给不同 Service——api.example.com 给订单服务、example.com/blog 给博客服务。\n关键认知：Ingress 资源本身只是一份路由规则的声明，真正干活的是 ingress controller（如 nginx ingress）——它 watch Ingress 资源，把规则渲染成自己的配置并热加载。\nTLS 终止通常也在 ingress controller 上做：证书配在入口一处，集群内部走明文。",
        formula: [
          "Ingress = 规则声明（host/path → Service）",
          "ingress controller = 规则执行者（nginx/traefik 等，需自行部署）",
          "TLS 终止：证书挂在 Ingress，入口解密"
        ],
        example: [
          "规则：host api.example.com，path / → service/order:8080",
          "规则：host example.com，path /blog → service/blog:80",
          "外部只需一个 LB 指向 ingress controller，后端服务全部 ClusterIP——收敛入口成本",
          "secret 里放证书，Ingress 引用之：HTTPS 在入口终止，内部 HTTP"
        ],
        tradeoffs: [
          "一个入口收敛全部 HTTP 服务，省 LB 钱且规则集中；但 ingress controller 自身成了关键单点，要高可用部署",
          "nginx ingress 生态最成熟，但 L7 规则能力受 nginx 模型约束，复杂流量治理（灰度、熔断）往往需要 Gateway API 或服务网格",
          "TLS 终止在入口，运维简单；端到端加密合规场景则需重新加密或透传"
        ],
        pitfalls: [
          "创建了 Ingress 资源却没装 controller——规则永远只是 etcd 里的数据，不生效也不报错",
          "path 匹配规则写错（Prefix vs Exact）导致路由互相打架，排查时先看 controller 生成的实际配置"
        ]
      },
      diagram: {
        type: "tree",
        title: "七层入口分流",
        items: [
          ["外部 LB", "唯一入口，指向 ingress controller"],
          ["api.example.com", "→ service/order:8080"],
          ["example.com/blog", "→ service/blog:80"],
          ["TLS", "证书在入口终止，内部明文"],
          ["前提", "必须部署 ingress controller（如 nginx）"]
        ]
      },
      quiz: {
        q: "创建了 Ingress 资源但访问 404/超时，最可能的原因是？",
        options: [
          "Ingress 资源需要重启才生效",
          "集群里没有部署 ingress controller，规则无人执行",
          "Service 的 ClusterIP 不够了",
          "CoreDNS 不支持 Ingress"
        ],
        answer: 1,
        explain: "Ingress 只是声明，干活的是 controller：没装 controller 规则就躺在 etcd 里。架构线走完：从控制平面到 Pod 到流量入口。接下来两条支线：调度线讲资源与伸缩，存储网络线讲数据面。"
      },
      resources: {
        youtube: [
          { title: "Kubernetes Ingress Tutorial for Beginners | simply explained | Kubernetes Tutorial 22", channel: "TechWorld with Nana", url: "https://www.youtube.com/watch?v=80Ew_fsV4rM", why: "Nana 新手向 Ingress 教程，含 nginx ingress controller 实操" },
          { title: "NGINX Ingress Controller for Kubernetes 101", channel: "NGINX", url: "https://www.youtube.com/watch?v=UExhlDjJ2_M", why: "NGINX 官方 101，讲七层路由与 controller 工作机制" }
        ],
        bilibili: [
          { title: "一小时精通Kubernetes的服务暴露和七层代理Ingress", up: "马哥高薪IT实战", url: "https://www.bilibili.com/video/BV1kj411D7Sz", why: "马哥一小时系统课，服务暴露到 Ingress 七层代理全覆盖" },
          { title: "K8s网关生态标准Ingress", up: "莲城的老李", url: "https://www.bilibili.com/video/BV1RKc2eEEd8", why: "18 分钟梳理 Ingress 在 K8s 网关生态中的定位" }
        ],
        keywords: ["k8s Ingress入门", "nginx ingress配置", "k8s七层负载均衡"]
      }
    },
    {
      id: "resources-qos",
      name: "requests/limits 与 QoS",
      en: "RESOURCES",
      branch: "sched",
      deps: ["pod"],
      grid: { col: 1, row: 2 },
      summary: "requests 定调度、limits 定生死，QoS 定谁先被驱逐",
      sections: {
        principle: "每个容器可以声明 resources.requests（我要多少，调度器按它选节点）与 resources.limits（我最多用多少，运行时强约束）。\n超限的后果分资源类型：CPU 超限被 throttle（限速，进程变慢但不死）；内存超限被 OOMKilled（直接杀，exit code 137）——CPU 可压缩、内存不可压缩。\nK8s 据此给 Pod 分三档 QoS：Guaranteed（所有容器 req=lim）最尊贵，Burstable 次之，BestEffort（啥都没设）最低。节点资源紧张驱逐 Pod 时，按 BestEffort → Burstable → Guaranteed 的顺序先杀贱民。",
        formula: [
          "requests.cpu: 250m（0.25 核）；requests.memory: 256Mi",
          "limits.cpu: 500m；limits.memory: 512Mi",
          "节点可调度量：Σrequests ≤ node allocatable",
          "QoS：Guaranteed（全 req=lim）> Burstable > BestEffort",
          "OOMKilled ⇒ exit code 137"
        ],
        example: [
          "节点 allocatable 4C8G，已有 Pod 的 requests 合计 3C6G",
          "新 Pod requests 500m/1Gi：3.5C7G ≤ 4C8G，可以调度上来",
          "再上一个 requests 2C 的 Pod：CPU 请求 5.5C > 4C，Pending",
          "某容器内存冲到 limits 512Mi → OOMKilled，describe 里 Reason: OOMKilled、Exit Code: 137"
        ],
        tradeoffs: [
          "requests 设高了浪费资源（调度预留空转），设低了节点超卖、高峰期互相踩踏",
          "limits 不设能「借用」空闲资源，但节点紧张时第一个被驱逐/被杀的就是你",
          "Guaranteed 最稳但资源利用率最低，生产常用 Burstable 折中"
        ],
        pitfalls: [
          "不设 requests 就配 HPA——利用率 = 用量 ÷ requests，分母为零没法算百分比（调度线 autoscaling 节点详述）",
          "把 limits.memory 设得比应用堆上限还低——Java 类应用没配 -Xmx 感知，启动即 OOMKilled"
        ]
      },
      diagram: {
        type: "bars",
        title: "三档 QoS 的生死排序",
        items: [
          ["Guaranteed", "req=lim，节点紧张时最后被驱逐"],
          ["Burstable", "设了部分 request，中等优先级"],
          ["BestEffort", "啥都没设，第一个被杀"],
          ["CPU 超限", "throttle：变慢但活着"],
          ["内存超限", "OOMKilled：exit code 137"]
        ]
      },
      quiz: {
        q: "容器内存使用超过 limits 而 CPU 也超过 limits，两者的后果分别是？",
        options: [
          "都被 OOMKilled",
          "内存 OOMKilled（exit 137），CPU 被 throttle 限速",
          "都被限速",
          "Pod 被驱逐到其他节点"
        ],
        answer: 1,
        explain: "内存不可压缩，超限直接杀（137）；CPU 可压缩，超限只限速。资源声明是调度的输入——下一站看调度器如何利用它，以及亲和/污点如何进一步约束落点。"
      },
      resources: {
        youtube: [
          { title: "Kubernetes Quality of Service (QoS) Classes for Pods (Guaranteed, Burstable, BestEffort)", channel: "Anton Putra", url: "https://www.youtube.com/watch?v=ka-HItczp2I", why: "实测驱动讲解三档 QoS 等级及其驱逐影响" },
          { title: "Kubernetes Requests and Limits Explained | QoS & Resource Quotas", channel: "Tech With Hassan", url: "https://www.youtube.com/watch?v=kSFZYbrr3q0", why: "requests/limits 与 QoS、ResourceQuota 联动讲解" }
        ],
        bilibili: [
          { title: "K8s的资源配额与限制", up: "莲城的老李", url: "https://www.bilibili.com/video/BV1czUfYwEwz", why: "28 分钟讲 requests/limits 与配额，覆盖 OOM 场景" },
          { title: "Kubernetes(k8s)-服务质量(QoS)", up: "运维小路", url: "https://www.bilibili.com/video/BV1LuQoYREwn", why: "QoS 三等级专题实操演示" }
        ],
        keywords: ["k8s资源限制", "OOMKilled排查", "requests和limits区别"]
      }
    },
    {
      id: "scheduling",
      name: "调度器与亲和/污点",
      en: "SCHEDULING",
      branch: "sched",
      deps: ["resources-qos"],
      grid: { col: 2, row: 2 },
      summary: "filter 筛掉不行、score 选出最优；亲和拉人、污点赶人",
      sections: {
        principle: "调度器两阶段：filter 先过滤——资源够不够（按 requests 求和 vs 节点 allocatable）、端口冲不冲突；score 再给剩下的节点打分选最优。\nPod 侧主动选节点用 nodeSelector（简单等值）或 nodeAffinity（丰富表达式）；节点侧拒绝 Pod 用 taint（污点），Pod 要带对应 toleration（容忍）才允许调度上来——亲和是「我想去」，污点是「你别来」。\nPod 一直 Pending 的常见原因就四类：资源不足、亲和条件不满足、污点未容忍、PVC 未绑定——全部写在 describe 的 events 里。",
        formula: [
          "filter：Σrequests ≤ allocatable？端口冲突？亲和/污点通过？",
          "score：对通过 filter 的节点打分取最优",
          "taint 打在节点上拒绝；toleration 打在 Pod 上容忍",
          "kubectl describe pod → Events：Pending 原因第一现场"
        ],
        example: [
          "Pod requests 2C，三节点剩余可调度 1C/1.5C/3C：filter 只剩 3C 那台",
          "nodeSelector: disktype=ssd，没有节点打这个标签 → 0 节点通过 filter，Pending",
          "GPU 节点打 taint gpu=true:NoSchedule，普通 Pod 上不来，训练 Pod 带 toleration 才能进",
          "events 原文：0/3 nodes are available: 2 Insufficient cpu, 1 node(s) had untolerated taint"
        ],
        tradeoffs: [
          "nodeSelector 简单直白但只能等值匹配，nodeAffinity 表达力强但 YAML 啰嗦",
          "污点把节点隔离得很干净，但 toleration 配多了等于门户大开，控制面组件正是靠 taint 独占 master 节点",
          "required 型亲和保证正确性，preferred 型亲和保证弹性——硬约束多了调度成功率会下降"
        ],
        pitfalls: [
          "给节点打了标签却忘了更新 Pod 的亲和——新增标签不会让已 Pending 的 Pod 自动满足旧条件",
          "以为污点会驱逐已运行的 Pod——NoSchedule 只管新调度，要驱逐需 NoExecute"
        ]
      },
      diagram: {
        type: "flow",
        anim: "scheduleBinpack",
        title: "调度两阶段",
        items: [
          ["filter", "资源/端口/亲和/污点，筛出可行节点"],
          ["score", "可行节点打分，选最优绑定"],
          ["亲和", "nodeSelector/nodeAffinity：Pod 想去哪"],
          ["污点", "taint 在节点：你不许来；toleration 在 Pod：我偏要来"],
          ["Pending 四因", "资源不足/亲和不满足/污点未容忍/PVC 未绑定"]
        ]
      },
      quiz: {
        q: "Pod 一直 Pending，events 显示「0/3 nodes are available: 3 node(s) had untolerated taint」，说明？",
        options: [
          "三个节点 CPU 都不足",
          "三个节点都有该 Pod 未容忍的污点",
          "镜像拉取失败",
          "Service 没创建"
        ],
        answer: 1,
        explain: "untolerated taint：节点有污点、Pod 没带对应 toleration，全部被 filter 掉。解法：给 Pod 加 toleration 或去掉节点污点。调度讲完了，副本数能不能也随负载自动调？下一站 HPA/VPA。"
      },
      resources: {
        youtube: [
          { title: "Kubernetes For Beginners: Taints Tolerations vs Node Affinity", channel: "KodeKloud", url: "https://www.youtube.com/watch?v=mB3ODCDWZIY", why: "KodeKloud 对比污点容忍与节点亲和两大调度机制" },
          { title: "Kubernetes Node Selector vs Node Affinity vs Pod Affinity vs Tains & Tolerations", channel: "Anton Putra", url: "https://www.youtube.com/watch?v=rX4v_L0k4Hc", why: "四种调度约束横向对比，一次建立完整图景" }
        ],
        bilibili: [
          { title: "K8s的污点和容忍", up: "莲城的老李", url: "https://www.bilibili.com/video/BV1RdzqYqEi8", why: "20 分钟专题讲 taints/tolerations 及 Pending 场景" },
          { title: "48.k8s 调度之：节点调度-亲和性-nodeAffinity、nodeName、nodeSelector", up: "YugeOps", url: "https://www.bilibili.com/video/BV1RoEPzvEMs", why: "53 分钟实操课覆盖 nodeSelector 与 nodeAffinity" }
        ],
        keywords: ["k8s污点与容忍", "k8s亲和性调度", "Pod一直Pending怎么办"]
      }
    },
    {
      id: "autoscaling",
      name: "HPA/VPA 自动伸缩",
      en: "AUTOSCALING",
      branch: "sched",
      deps: ["scheduling"],
      grid: { col: 3, row: 2 },
      summary: "HPA 调副本数、VPA 调 requests，利用率的分母是 requests",
      sections: {
        principle: "HPA（Horizontal Pod Autoscaler）按指标自动调整 Deployment 副本数：最常用的是 CPU 利用率 = 实际用量 ÷ requests——注意分母是 requests 不是 limits，没设 requests 的 Pod 没法按百分比弹。\nautoscaling/v2 API 支持多指标与自定义指标（如 QPS、队列长度），伸缩行为（冷却窗口、速率）也可配。\nVPA（Vertical Pod Autoscaler）走的是另一条路：不改副本数，而是根据历史用量调整 Pod 的 requests 本身，让「每个 Pod 更合身」。",
        formula: [
          "期望副本 = ceil(当前副本 × 当前指标 ÷ 目标指标)",
          "CPU 利用率(%) = 实际 CPU 用量 ÷ requests.cpu",
          "HPA：autoscaling/v2，minReplicas/maxReplicas/targetCPU",
          "VPA：调 requests 本身（需重建 Pod 生效）"
        ],
        example: [
          "requests.cpu=200m，目标利用率 50%，当前 2 副本实测用了 300m",
          "利用率 = 300 ÷ (2×200) = 75% > 50%",
          "期望副本 = ceil(2 × 75/50) = 3 → HPA 扩到 3 副本",
          "同场景若没设 requests：分母为零，HPA 直接罢工"
        ],
        tradeoffs: [
          "HPA 应对流量波动弹性好，但从指标采集到扩容生效有分钟级延迟，扛不了秒级脉冲",
          "副本扩了节点不够装就要 Cluster Autoscaler 补节点，链路更长",
          "VPA 让资源声明持续合身，但生效要重建 Pod，与 HPA 同时作用于同一指标会互相打架"
        ],
        pitfalls: [
          "没设 requests 就配 HPA——利用率算不出来，扩缩容完全不触发",
          "maxReplicas 顶到集群容量上限——HPA 扩完 Pending 一片，需要配合 Cluster Autoscaler"
        ]
      },
      diagram: {
        type: "flow",
        anim: "hpaScale",
        title: "HPA 一次扩容决策",
        items: [
          ["采集", "metrics-server 报用量：2 副本共 300m"],
          ["计算", "利用率 75% > 目标 50%"],
          ["公式", "期望 = ceil(2 × 75/50) = 3"],
          ["执行", "改 Deployment 副本数为 3"],
          ["前提", "requests 必须设置，否则分母为零"]
        ]
      },
      quiz: {
        q: "HPA 配置了 CPU 目标利用率 50% 却从不扩容，最常见的配置原因是？",
        options: [
          "metrics-server 版本太旧",
          "Pod 没设 resources.requests，利用率分母缺失",
          "副本数已经是 1 不能再少",
          "Deployment 没打标签"
        ],
        answer: 1,
        explain: "CPU 利用率 = 实际用量 ÷ requests，requests 是必需的锚点。调度线完结：资源、落点、伸缩都齐了。右边存储网络线从 PV/PVC 开始，解决数据持久化问题。"
      },
      resources: {
        youtube: [
          { title: "Scaling Explained Through Kubernetes HPA, VPA, KEDA & Cluster Autoscaler", channel: "DevOps & AI Toolkit", url: "https://www.youtube.com/watch?v=HQY2jgSN6pA", why: "一条视频横向对比 HPA/VPA/KEDA/Cluster Autoscaler，扩缩容全景清晰" },
          { title: "Kubernetes Autoscaling: HPA vs. VPA vs. Keda vs. CA vs. Karpenter vs. Fargate", channel: "Anton Putra", url: "https://www.youtube.com/watch?v=hsJ2qtwoWZw", why: "实测向对比各自动伸缩方案的触发条件与延迟，适合建立选型直觉" }
        ],
        bilibili: [
          { title: "【IT老齐386】K8S动态扩缩容之HPA实战", up: "IT老齐", url: "https://www.bilibili.com/video/BV12h4y1S7QZ", why: "基于 metrics-server 的 HPA 实战演示，与利用率扩缩容考点直接对应" },
          { title: "彻底搞懂 K8s HPA | 10分钟从自动扩缩容到企业级弹性伸缩", up: "简单-编程", url: "https://www.bilibili.com/video/BV1A2Kt6TEek", why: "10 分钟动画讲清 HPA 工作原理到企业级弹性伸缩" }
        ],
        keywords: ["K8s自动扩缩容", "HPA实战", "K8s弹性伸缩"]
      }
    },
    {
      id: "storage",
      name: "PV/PVC/StorageClass",
      en: "STORAGE",
      branch: "data",
      deps: ["deployment"],
      grid: { col: 5, row: 2 },
      summary: "PV 是资源、PVC 是申领单、StorageClass 自动开单",
      sections: {
        principle: "Pod 重建后数据还在吗？写在容器层的数据随 Pod 灰飞烟灭。K8s 的解法是把存储抽象成三层：PV（PersistentVolume）是集群里实际存在的存储资源，PVC（PersistentVolumeClaim）是应用的「申领单」——我要 10Gi、RWO——系统匹配合适的 PV 绑定。\nStorageClass 则把人工预建 PV 变成动态供给：提交 PVC 时自动按模板创建云盘等后端存储。\naccessModes 决定挂载形态：RWO（单节点读写）最常见，RWX（多节点读写）需要存储后端支持。另有两种临时卷：emptyDir 随 Pod 生灭，hostPath 把数据绑死在具体节点上。",
        formula: [
          "PVC：resources.requests.storage: 10Gi + accessModes: [ReadWriteOnce]",
          "StorageClass：provisioner + 参数，提交 PVC 即动态建 PV",
          "RWO = 单节点读写；RWX = 多节点读写",
          "emptyDir 随 Pod 生灭；hostPath 绑死节点"
        ],
        example: [
          "MySQL Pod 挂 PVC：Pod 被重建到他节点，云盘重新挂载，数据还在",
          "PVC 写 storageClassName: fast-ssd → 自动开出一块 SSD 云盘并绑定",
          "多副本 Deployment 共享一份 RWO 卷：两个 Pod 落在不同节点就挂不上——RWO 的宿命",
          "日志缓冲用 emptyDir：Pod 删了数据就没了，正好符合临时语义"
        ],
        tradeoffs: [
          "PVC 抽象让应用不感知后端存储，但绑定与挂载有延迟，Pod 启动会变慢一点",
          "动态供给免去人工建 PV，但回收策略（Retain/Delete）配错会丢数据或留垃圾盘",
          "RWX 方便多副本共享，性能与成本通常不如 RWO 云盘，选型要看后端能力"
        ],
        pitfalls: [
          "PVC 一直 Pending：没有匹配的 PV 或 StorageClass 不存在/供给失败，describe pvc 看 events",
          "用 hostPath 存重要数据——Pod 调度到其他节点就「丢数据」，它只适合节点级场景（日志采集等）"
        ]
      },
      diagram: {
        type: "flow",
        title: "从申领到挂载",
        items: [
          ["应用", "Pod 声明引用 pvc/mysql-data"],
          ["PVC", "我要 10Gi RWO，storageClass: fast-ssd"],
          ["StorageClass", "动态创建云盘 → 生成 PV"],
          ["绑定", "PV ↔ PVC 一对一绑定"],
          ["挂载", "kubelet 把卷挂进容器，重建不丢数据"]
        ]
      },
      quiz: {
        q: "一个有状态应用想实现「Pod 重建到其他节点后数据仍在」，正确做法是？",
        options: [
          "把数据写在容器镜像里",
          "用 PVC 申领 PV（如动态供给的云盘），Pod 挂载该 PVC",
          "用 emptyDir 卷",
          "用 hostPath 卷"
        ],
        answer: 1,
        explain: "只有 PV/PVC 的存储生命周期独立于 Pod，能跨节点重新挂载；emptyDir 随 Pod 灭，hostPath 绑死节点。存储解决了，Pod 之间、跨节点之间怎么联网？下一站网络模型与 CNI。"
      },
      resources: {
        youtube: [
          { title: "Kubernetes Volumes explained | Persistent Volume, Persistent Volume Claim & Storage Class", channel: "TechWorld with Nana", url: "https://www.youtube.com/watch?v=0swOh5C3OVM", why: "Nana 经典课，PV/PVC/StorageClass 三者关系讲得最清楚的入门视频" },
          { title: "Storage in Kubernetes MASTERCLASS | PV, PVC, StorageClass, ConfigMap, Secret, CSI Explained", channel: "Cloud With VarJosh", url: "https://www.youtube.com/watch?v=8oHoBCyg4eQ", why: "存储专题大师课，覆盖动态供给与 CSI，适合进阶" }
        ],
        bilibili: [
          { title: "5.简单懂点K8S的存储(Volume/PV/PVC/StorageClass)", up: "简单懂点", url: "https://www.bilibili.com/video/BV1a3411G7Sh", why: "系统课第 5 讲，循序渐进讲透存储四件套" },
          { title: "Kubernetes Volume 完整教程：EmptyDir、HostPath、PV、PVC、StorageClass 一次讲清", up: "简单-编程", url: "https://www.bilibili.com/video/BV1ifKz6oE26", why: "精准覆盖 emptyDir vs hostPath 对比与动态供给，与知识点完全对齐" }
        ],
        keywords: ["K8s存储PV和PVC", "StorageClass动态供给", "K8s持久化存储"]
      }
    },
    {
      id: "networking",
      name: "网络模型与 CNI",
      en: "NETWORKING",
      branch: "data",
      deps: ["service"],
      grid: { col: 6, row: 2 },
      summary: "每个 Pod 一个 IP、全网互通无 NAT，CNI 负责落地",
      sections: {
        principle: "K8s 网络模型只有两条铁律：每个 Pod 分到一个独立 IP；集群内任意 Pod 可以直接通信、无需 NAT。至于怎么实现，K8s 不管——交给 CNI 插件。\nCNI 插件（Calico/Flannel 等）在 Pod 创建时给它分 IP、接网络；跨节点通信常走 overlay 封装（如 VXLAN）：把 Pod 包裹在节点间 UDP 包里传输，对应用透明。\n默认全集群互通也意味着零隔离，NetworkPolicy 用来补白名单：声明「只允许打了某标签的 Pod 访问我的 3306 端口」，实现网络层的微分段。",
        formula: [
          "铁律 1：每 Pod 一 IP；铁律 2：Pod 互通无 NAT",
          "跨节点：overlay/VXLAN 封装（Flannel 默认），或 BGP 直连（Calico）",
          "NetworkPolicy：podSelector + ingress/egress 白名单规则"
        ],
        example: [
          "Pod A（10.244.1.7）直连 Pod B（10.244.3.9）：不同节点，包经 VXLAN 封装走节点间隧道",
          "kubectl 看到 IP 段按节点分配：node-1 分 10.244.1.0/24，node-3 分 10.244.3.0/24",
          "给 mysql Pod 配 NetworkPolicy：只允许 app 标签的 Pod 访问 3306，其他全部拒绝",
          "CNI 没就绪时新节点 NotReady：kubelet 报 network plugin is not ready"
        ],
        tradeoffs: [
          "overlay/VXLAN 部署简单、不依赖底层网络，但有封装开销与 MTU 问题；BGP 直连性能好但要求网络设备配合",
          "扁平网络模型让应用开发简单（不用管 NAT 与端口映射），代价是大规模下地址管理与策略复杂",
          "NetworkPolicy 精细但默认「全开」——不加策略等于没有隔离，策略又要 CNI 支持才生效"
        ],
        pitfalls: [
          "以为 NetworkPolicy 是 K8s 内建防火墙——它只是声明，CNI 插件不支持（如旧版 Flannel）就完全不生效",
          "跨节点 Pod 不通就怀疑应用——先查 CNI：节点路由、VXLAN 端口（UDP 8472 等）是否被安全组拦了"
        ]
      },
      diagram: {
        type: "compare",
        title: "K8s 网络模型要点",
        items: [
          ["铁律", "每 Pod 一 IP，全网互通无 NAT"],
          ["CNI", "Calico / Flannel 负责分配与连通"],
          ["跨节点", "overlay/VXLAN 封装，或 BGP 直连"],
          ["默认", "全通 = 零隔离"],
          ["NetworkPolicy", "白名单微分段，需 CNI 支持"]
        ]
      },
      quiz: {
        q: "K8s 网络模型规定集群内 Pod 间通信必须满足什么条件？",
        options: [
          "通过 NAT 转换后互通",
          "每个 Pod 有独立 IP，任意 Pod 可直接通信、无需 NAT",
          "必须走 Service 中转",
          "只有同节点 Pod 能直连"
        ],
        answer: 1,
        explain: "两条铁律：每 Pod 一 IP、全网无 NAT 直连，实现交给 CNI。网络通了，应用还差最后一块：配置与敏感信息怎么注入？下一站 ConfigMap 与 Secret。"
      },
      resources: {
        youtube: [
          { title: "Understanding Kubernetes Networking in 30 Minutes - Ricardo Katz & James Strong", channel: "CNCF [Cloud Native Computing Foundation]", url: "https://www.youtube.com/watch?v=Mj04QOqAaJ8", why: "CNCF 官方 30 分钟讲透 K8s 网络模型，权威首选" },
          { title: "Container Network Interface (CNI) Explained in 7 Minutes", channel: "KodeKloud", url: "https://www.youtube.com/watch?v=l2BS_kuQxBA", why: "KodeKloud 7 分钟讲清 CNI 职责与 Pod 互通原理" }
        ],
        bilibili: [
          { title: "阿里技术大牛 30 分钟讲透 Kubernetes ：理解 CNI 和 CNI 插件", up: "程序员小叨", url: "https://www.bilibili.com/video/BV1XJ411W7zZ", why: "阿里工程师视角讲 CNI 插件机制，中文讲解深入" },
          { title: "Kubernetes（k8s）CNI（Calico）网络模型原理", up: "大数据老司机", url: "https://www.bilibili.com/video/BV1Qr4213716", why: "聚焦 Calico 网络模型原理，短小精悍" }
        ],
        keywords: ["K8s网络模型", "CNI插件Calico", "K8s网络策略"]
      }
    },
    {
      id: "config-secret",
      name: "ConfigMap 与 Secret",
      en: "CONFIG/SECRET",
      branch: "data",
      deps: ["deployment"],
      grid: { col: 7, row: 2 },
      summary: "配置与镜像解耦；Secret 只是 base64，不是加密",
      sections: {
        principle: "ConfigMap 把配置从镜像里剥离：同一份镜像，测试集群挂测试配置、生产集群挂生产配置。注入方式两种：环境变量（envFrom）或挂载为卷文件。\nSecret 用法相同、面向敏感数据（密码、token、证书）。最大的误解必须破除：Secret 里的 data 只是 base64 编码，编码 ≠ 加密，任何能读 Secret 的人一条 base64 -d 就还原。\n真正的防护组合拳是：开启 etcd 静态加密（落盘加密）+ 严格 RBAC（谁能 get secrets）。另外注意：以 env 注入的配置，ConfigMap 更新后 Pod 不会自动感知，要重启才生效；卷挂载方式可以自动更新（有延迟）。",
        formula: [
          "ConfigMap：data 存明文键值；Secret：data 存 base64 值",
          "注入：envFrom / env.valueFrom / volume 挂载",
          "base64 ≠ 加密；安全 = etcd 静态加密 + RBAC",
          "env 注入改配置 → 需重建 Pod；卷挂载 → 自动更新（分钟级延迟）"
        ],
        example: [
          "kubectl create configmap app-conf --from-literal=LOG_LEVEL=debug",
          "Pod 里 envFrom configMapRef → 容器内读到 LOG_LEVEL=debug",
          "echo cGFzc3dvcmQ= | base64 -d → password——Secret 的「加密」就这水平",
          "改了 ConfigMap 的 LOG_LEVEL，env 注入的 Pod 里还是旧值，rollout restart 后才生效"
        ],
        tradeoffs: [
          "env 注入简单直观但更新要重启；卷挂载能热更新但应用要自己 watch 文件变化",
          "Secret 与 ConfigMap 分家便于权限区分，但本质上都是 etcd 里的对象，安全水位取决于集群配置",
          "配置外置带来环境一致性，配置项多了之后需要 Helm/Kustomize 等工具治理（运维线 helm-gitops 衔接）"
        ],
        pitfalls: [
          "把 Secret 提交进 git 仓库——base64 等于明文，密钥直接泄露",
          "改了 ConfigMap 就等配置生效——env 注入的必须重建 Pod，别以为系统会帮你"
        ]
      },
      diagram: {
        type: "compare",
        title: "ConfigMap vs Secret",
        items: [
          ["ConfigMap", "普通配置，明文存储"],
          ["Secret", "敏感数据，base64 编码（≠加密）"],
          ["注入方式", "env / volume 两种"],
          ["env 更新", "需重建 Pod 才生效"],
          ["真正防护", "etcd 静态加密 + RBAC 最小授权"]
        ]
      },
      quiz: {
        q: "关于 Secret 的安全性，下列哪项正确？",
        options: [
          "Secret 在 etcd 中默认加密存储，很安全",
          "Secret 只是 base64 编码，需配合 etcd 静态加密与 RBAC 才谈得上安全",
          "Secret 不能被任何用户读取",
          "Secret 挂载进容器后自动加密"
        ],
        answer: 1,
        explain: "base64 是可逆编码不是加密，能读 Secret 即可还原。数据面（存储/网络/配置）讲完，进入运维线：应用跑起来之后如何保健康？从探针开始。"
      },
      resources: {
        youtube: [
          { title: "Kubernetes ConfigMap and Secret as Kubernetes Volumes | Demo", channel: "TechWorld with Nana", url: "https://www.youtube.com/watch?v=FAnQTgr04mU", why: "Nana 演示 ConfigMap/Secret 以 Volume 挂载注入，实操性强" }
        ],
        bilibili: [
          { title: "彻底搞懂 K8s ConfigMap & Secret | 10分钟从配置注入到安全加密", up: "简单-编程", url: "https://www.bilibili.com/video/BV1AdKF64EJ7", why: "覆盖 base64 非加密与静态加密话题，与安全考点对齐" },
          { title: "【IT老齐357】K8S ConfigMap集中管理应用配置", up: "IT老齐", url: "https://www.bilibili.com/video/BV13X4y147FX", why: "从集中配置管理角度讲 ConfigMap 的使用场景" }
        ],
        keywords: ["K8s ConfigMap和Secret", "K8s配置管理", "Secret加密etcd"]
      }
    },
    {
      id: "probes",
      name: "探针健康检查",
      en: "PROBES",
      branch: "ops",
      deps: ["deployment"],
      grid: { col: 1, row: 3 },
      summary: "liveness 决定重启、readiness 决定接流、startup 护慢启动",
      sections: {
        principle: "kubelet 用探针回答两个不同的问题：livenessProbe「这个容器还活着吗」——失败就重启容器；readinessProbe「这个容器能接流量吗」——失败就从 Service endpoints 摘除，不重启。\n两种失败语义完全不同：活着但忙不过来（该摘流不该重启）vs 死锁假活（该重启）。用错探针是生产事故高发区。\nstartupProbe 保护慢启动应用（老 Java 服务启动要几分钟）：在它通过之前，liveness/readiness 一律不生效，防止「启动慢被 liveness 误杀、重启又启动慢」的死亡循环。常用参数：initialDelaySeconds（多久后开始探）、periodSeconds（间隔）、timeoutSeconds（单次超时）。",
        formula: [
          "liveness 失败 ⇒ 重启容器（restartCount +1）",
          "readiness 失败 ⇒ 从 Service endpoints 摘除（不重启）",
          "startupProbe 通过前，另两个探针不启用",
          "initialDelaySeconds / periodSeconds / timeoutSeconds / failureThreshold"
        ],
        example: [
          "httpGet: /healthz, port 8080：返回 200-399 算通过",
          "老应用启动 90s：startupProbe 配 failureThreshold 30 × periodSeconds 10 = 最多等 300s",
          "数据库连接池打满：readiness 失败摘流，流量切走，缓过来自动加回——全程不重启",
          "liveness 误配成重依赖的 /ready 接口：下游一抖，全容器集体重启，雪崩"
        ],
        tradeoffs: [
          "探针让系统自愈，但探针本身是依赖：探测接口挂了（哪怕业务正常）照样重启/摘流",
          "periodSeconds 太短探测开销大、太长故障发现慢，常见折中 10s",
          "exec 型探针灵活但要在容器里起进程，httpGet/tcp 更轻量"
        ],
        pitfalls: [
          "liveness 与 readiness 用同一个接口——下游故障时该摘流却重启，越重启越糟",
          "慢启动应用不配 startupProbe，liveness 反复误杀，Pod 永远 CrashLoopBackOff"
        ]
      },
      diagram: {
        type: "compare",
        anim: "probeBeat",
        title: "三种探针的分工",
        items: [
          ["startupProbe", "启动期保护伞：过了它才启用另两个"],
          ["liveness", "活着吗？失败 → 重启容器"],
          ["readiness", "能接流吗？失败 → 摘出 endpoints"],
          ["关键参数", "initialDelay / period / timeout / failureThreshold"],
          ["误区", "两个探针共用一个接口 = 自杀式配置"]
        ]
      },
      quiz: {
        q: "应用活着但临时过载，你希望它暂时不接收流量但不被重启，应该依赖哪个探针？",
        options: [
          "livenessProbe",
          "readinessProbe",
          "startupProbe",
          "exec 探针"
        ],
        answer: 1,
        explain: "readiness 失败只从 endpoints 摘流、不重启；liveness 失败才重启。探针保证单个副本健康，发布新版本时如何整体不停机？下一站滚动更新。"
      },
      resources: {
        youtube: [
          { title: "Kubernetes Health Checks: Liveness vs. Readiness vs. Startup Probe", channel: "Anton Putra", url: "https://www.youtube.com/watch?v=fqfieWP1jY4", why: "实测演示三种探针行为差异，重启与摘流区别一目了然" }
        ],
        bilibili: [
          { title: "K8S必备技能：启动、就绪、存活探针实战演示", up: "程序员暮闲", url: "https://www.bilibili.com/video/BV1hUzjBwECr", why: "28 分钟完整实战三种探针，覆盖 startup 探针场景" },
          { title: "Kubernetes（k8s） 探针/滚动发布", up: "徐晓伟工作室", url: "https://www.bilibili.com/video/BV1Jo4y1g7M4", why: "探针与滚动发布联动讲解，贴近生产发布场景" }
        ],
        keywords: ["K8s探针", "存活探针就绪探针", "K8s健康检查"]
      }
    },
    {
      id: "rollout",
      name: "滚动更新策略",
      en: "ROLLOUT",
      branch: "ops",
      deps: ["probes"],
      grid: { col: 2, row: 3 },
      summary: "maxSurge 多建、maxUnavailable 少停，分批换版不停机",
      sections: {
        principle: "RollingUpdate 的核心是两个旋钮：maxSurge（更新期间最多超出期望副本多少，默认 25%）与 maxUnavailable（最多允许多少副本不可用，默认 25%）。\n以 4 副本为例（25% = 1）：先发 1 个新版 Pod（surge 到 5），等它 readiness 通过，再下线 1 个旧版——如此滚动，全程可用副本 ≥ 3。\n这就是为什么 readiness 探针是滚动更新的安全阀：新 Pod 没就绪就不继续，坏版本最多影响一小批。回滚只需 kubectl rollout undo（旧 RS 还在）。金丝雀与蓝绿部署 K8s 原生不直接提供，需 Ingress/Service 层配合分流。",
        formula: [
          "strategy: RollingUpdate，maxSurge: 25%，maxUnavailable: 25%",
          "可用副本 ≥ replicas × (1 - maxUnavailable)",
          "kubectl rollout status deployment/x：盯发布进度",
          "kubectl rollout undo deployment/x：回滚到上一版本"
        ],
        example: [
          "4 副本发版：先 +1 新版（共 5），就绪后 -1 旧版（4），循环 4 轮换完",
          "新 Pod readiness 一直失败：发布卡在第一批，旧版 3 个仍在服务——止损成功",
          "kubectl rollout undo deployment/web：直接扩回旧 RS，秒级回滚",
          "金丝雀：另起一个 1 副本的新版 Deployment，Ingress 按权重切 5% 流量过去"
        ],
        tradeoffs: [
          "maxSurge 高发布快但多吃资源，maxUnavailable 高发布快但可用容量下降，两者都保守则发布慢",
          "滚动更新期间新旧版本共存，不兼容的 schema/协议变更会打架——这才是发布设计的真难点",
          "金丝雀/蓝绿风险控制更好，但要额外的流量管理层与双倍资源（蓝绿），成本更高"
        ],
        pitfalls: [
          "没配 readiness 就滚动更新——新 Pod 起来即接流，坏版本直接全量上线",
          "maxSurge: 0 且 maxUnavailable: 0——发布永远卡住，这两个数不能同时为 0"
        ]
      },
      diagram: {
        type: "loop",
        anim: "rolloutSwap",
        title: "滚动更新回环（4 副本 · 25%/25%）",
        items: [
          ["新 RS 扩容", "+1 新版 Pod（surge）"],
          ["等 readiness", "不就绪 → 卡住止损"],
          ["旧 RS 缩容", "-1 旧版，可用 ≥ 3"],
          ["回环", "未完成 → 下一轮"]
        ]
      },
      quiz: {
        q: "4 副本 Deployment 用默认 25%/25% 滚动更新，新版本的第一个 Pod readiness 始终失败，结果是？",
        options: [
          "全部旧副本被强杀，服务中断",
          "发布停在第一批，旧副本继续服务，损失被限制住",
          "系统自动回滚",
          "新 Pod 被反复删除重建直到成功"
        ],
        answer: 1,
        explain: "readiness 是安全阀：新 Pod 不就绪就不继续缩旧版，可用副本始终 ≥ 3。发布会做了，出事怎么查？下一站故障排查方法论。"
      },
      resources: {
        youtube: [
          { title: "Most Common Kubernetes Deployment Strategies (Examples & Code)", channel: "Anton Putra", url: "https://www.youtube.com/watch?v=lxc4EXZOOvE", why: "滚动/重建/蓝绿/金丝雀四种策略带代码示例逐一演示" },
          { title: "Kubernetes Deployment Strategies: Rolling vs. Blue-Green vs. Canary (Zero-Downtime Guide)", channel: "The Explainer", url: "https://www.youtube.com/watch?v=5LY3zXhXruk", why: "零停机视角对比三种发布策略，适合建立整体认知" }
        ],
        bilibili: [
          { title: "五分钟 k8s 实战-滚动更新与优雅停机", up: "crossoverJie", url: "https://www.bilibili.com/video/BV18C4y1A7LJ", why: "知名技术 UP 主 5 分钟实战滚动更新，含 maxSurge 相关行为" },
          { title: "【IT老齐294】大厂如何基于K8S实现金丝雀发布", up: "IT老齐", url: "https://www.bilibili.com/video/BV15o4y1Y7Bq", why: "大厂金丝雀发布落地思路，对应发布策略考点" }
        ],
        keywords: ["K8s滚动更新", "金丝雀发布", "K8s蓝绿部署"]
      }
    },
    {
      id: "troubleshoot",
      name: "故障排查",
      en: "TROUBLESHOOT",
      branch: "ops",
      deps: ["rollout"],
      grid: { col: 3, row: 3 },
      summary: "describe 看事件、logs 看遗言、exit code 定案型",
      sections: {
        principle: "排查套路三板斧，按顺序来：kubectl describe pod 看 events——调度失败、拉镜像失败、探针失败、OOMKilled 都在这留痕；kubectl logs（加 --previous 看上一次退出前的日志）看应用临终遗言；exit code 定案型：137 = OOMKilled（内存超限被杀），1 = 应用自身错误退出。\n对号入座：Pending → 看调度事件（资源/亲和/污点/PVC）；ImagePullBackOff → 查镜像名拼写与拉取凭证（imagePullSecret）；CrashLoopBackOff → logs --previous + exit code，再回看探针配置。",
        formula: [
          "kubectl describe pod <p>：events 第一现场",
          "kubectl logs <p> --previous：上一次容器退出前的日志",
          "exit 137 = OOMKilled；exit 1 = 应用错误；exit 143 = SIGTERM（正常终止信号）",
          "ImagePullBackOff → 镜像名/registry 凭证；Pending → 调度事件"
        ],
        example: [
          "CrashLoopBackOff，exit 137 → 回到 resources-qos：limits.memory 太小，调大或查内存泄漏",
          "ImagePullBackOff，events 显示 unauthorized → imagePullSecret 没配或过期",
          "Pending，events 显示 Insufficient cpu → requests 求和超了 allocatable，回看 scheduling 的算法",
          "describe 里 Liveness probe failed 刷屏 → 探针配置问题，不是应用问题（回看 probes）"
        ],
        tradeoffs: [
          "describe+logs 覆盖 80% 的 Pod 故障，但网络类问题（DNS、CNI）要进阶到 kubectl debug / 临时容器",
          "events 有保留期（默认约 1 小时），隔夜故障得靠外部监控与日志系统",
          "重启万能论在 K8s 不适用：不看清 exit code 就重启，现场没了根因也没了"
        ],
        pitfalls: [
          "只看 logs 不看 --previous——CrashLoop 场景当前容器的日志是新一轮的空现场",
          "Pod 全绿但服务不通——问题在 Service/endpoints/NetworkPolicy 层，别死磕 Pod（回看 service 与 networking）"
        ]
      },
      diagram: {
        type: "loop",
        anim: "crashLoop",
        title: "排查回环",
        items: [
          ["看症状", "Pending / CrashLoop"],
          ["describe", "events 第一现场"],
          ["logs", "--previous + 退出码"],
          ["修复", "改 limits 或探针"],
          ["回环验证", "未消失 → 再查一轮"]
        ]
      },
      quiz: {
        q: "Pod 处于 CrashLoopBackOff，describe 显示 Last State: Terminated, Exit Code: 137，最可能的原因是？",
        options: [
          "镜像拉取失败",
          "内存超过 limits 被 OOMKilled",
          "应用代码 bug 退出",
          "节点磁盘满了"
        ],
        answer: 1,
        explain: "137 = 128 + 9（SIGKILL），内存超限触发 OOMKilled 的标准签名；exit 1 才是应用错误。会救火了，最后一站讲防火：用 Helm 与 GitOps 把部署工程化。"
      },
      resources: {
        youtube: [
          { title: "5 Common Kubernetes Pod Errors Explained: CrashLoopBackOff, ImagePull, OOM & More | K8s Tutorial", channel: "careerwithricha", url: "https://www.youtube.com/watch?v=ZQ_TOHR_lBI", why: "逐一讲解 CrashLoopBackOff/ImagePullBackOff/OOM 等常见 Pod 错误" },
          { title: "Kubernetes CrashLoopBackoff explained in 3 minutes", channel: "Raghav Dua", url: "https://www.youtube.com/watch?v=gKuu1toptm8", why: "3 分钟快速定位 CrashLoopBackOff 排查路径，适合查漏补缺" }
        ],
        bilibili: [
          { title: "K8S工程师必备问题排查指南", up: "阿铭linux", url: "https://www.bilibili.com/video/BV1fN41167Q9", why: "系统化 K8s 故障排查方法论，适合面试与实战" },
          { title: "Linux懒人运维：k8s运维中常见报错如何解决", up: "Linux懒人运维", url: "https://www.bilibili.com/video/BV1H9tszhE7E", why: "常见报错速查，覆盖 Pending/ImagePull 等典型状态" }
        ],
        keywords: ["K8s故障排查", "CrashLoopBackOff解决", "K8s常见报错"]
      }
    },
    {
      id: "helm-gitops",
      name: "Helm 与 GitOps",
      en: "HELM/GITOPS",
      branch: "ops",
      deps: ["troubleshoot"],
      grid: { col: 4, row: 3 },
      summary: "Helm 模板化打包，GitOps 让 git 成为唯一真相源",
      sections: {
        principle: "一个应用要管 Deployment/Service/Ingress/ConfigMap 一堆 YAML，还要区分 dev/staging/prod 三套环境——纯手工维护必然失控。Helm 把整套 YAML 模板化为 chart，环境差异收敛到 values.yaml 一份参数文件。\nGitOps 再进一步：git 仓库是集群期望状态的唯一真相源，集群里的 ArgoCD 持续对比 git 与实际状态并自动同步，还能检测漂移（有人手工 kubectl 改了集群，会被发现并纠正）。\n这正是声明式 API 的逻辑终点：既然期望状态是一份声明，它就该进版本库、走 code review、可审计可回滚。",
        formula: [
          "helm install myapp ./chart -f values-prod.yaml",
          "chart = 模板（templates/）+ 参数（values.yaml）",
          "GitOps：git commit → ArgoCD 检测 diff → 自动 sync 到集群",
          "漂移检测：集群实际 ≠ git 期望 ⇒ 告警/自动纠正"
        ],
        example: [
          "values-dev.yaml 副本 1、values-prod.yaml 副本 6 + HPA，同一 chart 两副面孔",
          "helm upgrade myapp ./chart --set image.tag=v1.2.3：一行完成发版",
          "运维手工 kubectl scale 改了副本数，ArgoCD 页面立刻显示 OutOfSync",
          "回滚 = git revert：GitOps 把回滚变成一次普通的代码回退"
        ],
        tradeoffs: [
          "Helm 模板强大但模板调试体验差，渲染结果与源码隔一层，小项目可能 Kustomize 更轻",
          "GitOps 带来审计与可回滚，但「git 是唯一入口」要求团队纪律，紧急手工修复变成流程破例",
          "ArgoCD 自动同步爽，但误合并一个 PR 就自动全量下发——生产环境通常要配 sync window 与人工 approve"
        ],
        pitfalls: [
          "chart 里把密钥 values 明文提交进 git——和 Secret base64 一样，等于泄露，要配合密钥管理方案",
          "一边 GitOps 一边手工 kubectl 改生产——双入口必漂移，ArgoCD 的自动纠正会和你「打架」"
        ]
      },
      diagram: {
        type: "flow",
        title: "GitOps 工作流",
        items: [
          ["开发者", "改 chart/values，提 PR，过 review"],
          ["git merge", "期望状态更新，git 是唯一真相源"],
          ["ArgoCD", "对比 git 与集群，发现 diff"],
          ["自动 sync", "集群收敛到新期望状态"],
          ["漂移告警", "手工改动被检测并纠正"]
        ]
      },
      quiz: {
        q: "GitOps 模式下「回滚到上一个稳定版本」最自然的操作是？",
        options: [
          "kubectl rollout undo",
          "git revert 对应提交，让 ArgoCD 同步回去",
          "在 ArgoCD 界面点暂停",
          "删除 Deployment 重建"
        ],
        answer: 1,
        explain: "git 是唯一真相源，回滚 = 版本库回退 + 自动同步，审计链完整。至此 22 节点全线打通：从容器到编排、从架构到数据面、从发布到排查再到工程化——去集群里实战吧。"
      },
      resources: {
        youtube: [
          { title: "What is Helm in Kubernetes? Helm and Helm Charts explained | Kubernetes Tutorial 23", channel: "TechWorld with Nana", url: "https://www.youtube.com/watch?v=-ykwb1d0DXU", why: "Nana 讲 Helm 与 Chart 模板的经典入门课" },
          { title: "ArgoCD Tutorial for Beginners | GitOps CD for Kubernetes", channel: "TechWorld with Nana", url: "https://www.youtube.com/watch?v=MeU5_k9ssrs", why: "ArgoCD 声明式同步入门最佳教程，GitOps 工作流完整演示" }
        ],
        bilibili: [
          { title: "10分钟搞定k8s中的helm和Chart", up: "林时工Yeppy", url: "https://www.bilibili.com/video/BV1Qt421L7Wp", why: "10 分钟讲清 Helm 与 Chart 模板核心概念" },
          { title: "一小时玩转GitOps之ArgoCD", up: "王晓春老师", url: "https://www.bilibili.com/video/BV1NJ3v6qE5b", why: "马哥教育王晓春亲授，一小时系统掌握 ArgoCD GitOps" }
        ],
        keywords: ["Helm入门教程", "ArgoCD实战", "GitOps是什么"]
      }
    }
  ]
};
