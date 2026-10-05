# 沙盒关卡设计规范

## 原则

- 用户扮演工程师，在资源约束下调参数达成 SLA——**博弈感来自真实的资源矛盾**
- 全部 JS 真实计算，算式追踪面板逐行显示计算过程（用户能跟着手算复核）
- 沙盒公式必须与知识库卡片教的公式**完全一致**（实测踩过不一致的坑）
- 默认值设为不通过态，让用户必须动手调才能通关
- 每关明确的 PASS/FAIL 判定 + 通关钢印（stamp）

## 关卡结构（3 关递进）

1. **资源关**：算清预算不超标（显存/容量）
2. **架构关**：选型/组合策略满足多维约束（并行拓扑/调度摆放）
3. **诊断关**（推理型）：场景症状 → 选动作 → 选根因 → 选修复，三连对才过

## 实例公式集

### LLM 推理三关

- CH-01 显存：权重（70B FP16=140G/INT8=70G/INT4=35G）+ KV（2×L×kv_heads×d×2B×ctx×batch；MLA 用 2×61×576×2B）+ 激活缓冲 4G + 碎片 2G vs 容量；TPOT=（权重+KV）÷带宽；吞吐=batch×(1/TPOT)×0.7；TTFT=2×N×P÷(算力×0.5)
- CH-02 并发：static 有效 batch=max×0.4（等尾空转），continuous=max×0.9；PagedAttention off=按 max_ctx 全额预留（浪费60%），on=按实际分配；并发容量=可用KV显存÷每序列KV；吞吐=min(并发,有效batch)×(带宽÷每token字节)
- CH-03 长上下文：prefix caching 命中时 prefill 只算新 token；chunked prefill 块越小 TTFT 越平滑但总吞吐打折（0.95/0.9/0.8）

### LLM 训练三关

- CH-01 显存：模型状态=16B/参数（混合精度：2 bf16+4 master+2 grad+8 Adam）÷ZeRO 切分系数；激活≈34×d×batch×seq×层数字节（checkpoint on 按 4×d）
- CH-02 并行：TP≤8（机内 NVLink），TP×PP 整除总卡数，DP=总数/(TP×PP)；每卡模型状态=16B×N÷(TP×PP)；bubble=(PP-1)/(m+PP-1)
- CH-03 Loss 诊断：spike→坏 batch/降 lr 回滚；平台期→查数据配比/lr schedule；grad norm 持续攀升→发散前兆，clip+降 lr

### K8s 三关

- CH-01 上线：每节点可放 Pod 数=min(⌊allocatable_cpu/req⌋, ⌊allocatable_mem/req⌋)；总容量 vs replicas→Pending；image 非法→ImagePullBackOff；ClusterIP 外部不可达
- CH-02 调度：贪心 first-fit bin-packing；污点/容忍约束关键负载落位；PASS=关键负载全 Running 且利用率达标
- CH-03 排障：exit 137=OOMKilled→调 limits；0/3 nodes Insufficient→降 requests/加节点；502+无 readiness→配探针

## 算式追踪面板

每步一行等宽文本，格式：`量 = 代入数字的算式 = 结果`，最后给判定行（`合计 = 156.7 GB / 80 GB → OOM ✗`）。
