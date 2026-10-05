# Canvas 机制动画引擎规范

## 为什么

CSS 级「点亮+移点」被用户评价为「太简陋」。机制动画的价值在于**画出过程本身**：KV 块逐格填充、梯度下降小球滚曲面、Pod 落到节点上。核心概念节点（每模块 6-10 个）配专属引擎，其余节点用通用动画。

## 引擎形态

```js
const ANIM = {
  engineId(ctx, W, H, t) { /* 纯函数渲染，t 为秒，循环周期 4-8s */ }
};
```

- Canvas 2D，约 560×280，DPR 自适应
- rAF 驱动；句柄注册到统一清理机制（`clearDgm`），切节点/关卡片必须 cancel，防泄漏
- 公共工具：`aGrid`（网格底纹）、`aTxt`（等宽标签）、信号色常量、确定性伪随机（`srnd(seed)`，避免每帧闪烁）
- 视觉：示波屏暗底 + 模块 accent 信号色 + 等宽读数。仪器感，禁卡通弹跳
- 首帧 t 可能为负（rAF 时间戳早于挂载时刻）→ 统一钳制 `Math.max(0, t)`

## content.js 接线

`diagram.anim = "engineId"`；`type` 保留作 fallback。渲染分支：有 anim → canvas，无 → 通用 CSS 动画。

## 通用动画（所有节点默认享有）

| 类型 | 动画 |
|---|---|
| flow | 步骤框 500ms 间隔依次点亮，信号点沿连线流动，循环 |
| bars | 条从 0 生长（800ms 缓动）+ 数值滚动计数 |
| compare | 左右两列交替擦入 |
| tree | 层级级联出现 |
| loop | 步骤围成回环，信号点绕环流动——**循环概念专用**（自回归、reconcile、训练 step、all-reduce） |

## 已有引擎模式库（23 个，复刻时可照抄思路）

**推理**：decodeLoop（逐 token 生成+top5 概率条）、kvGrow（KV 池逐块填充+占用读数）、attnGrid（N×N 因果热力扫掠）、ropeSpin（向量旋转表相对位置）、pagedMem（显存块分页落位+浪费对比条）、batchFlow（static/continuous 泳道对比+利用率曲线）、draftVerify（虚影 draft→verify 接受/拒绝）、quantBits（位宽格压缩+显存读数）、tempMorph（分布随 T 尖锐↔摊平）

**训练**：gdCurve（小球滚损失曲面，演示 lr 合适 vs 过大震荡）、backpropNet（正向波/反向梯度波逐层流）、ringAllreduce（环上 chunk 两相位同化）、zeroShard（ZeRO 0→3 切分账本）、pipelineFlow（micro-batch 对角流+bubble 斜纹）、precisionBits（FP32 master↔BF16 位宽生命周期）、overfitCurves（train/val 双线+拐点红圈）

**K8s**：reconcileLoop（desired vs actual 补建/删除循环）、scheduleBinpack（filter 打叉→score→落位→Pending）、trafficFanout（Service 扇出+故障摘除+补位）、rolloutSwap（surge 起新→readiness 勾→摘旧，含止损演示）、probeBeat（liveness 重启 vs readiness 摘流双泳道心跳）、hpaScale（利用率越线→算式→扩容摊薄→缩回）、crashLoop（exit 137→指数退避→排查清单点亮）

## 新引擎设计步骤

1. 问：这个概念的「机制动作」是什么？（填充？流动？对比？循环？）
2. 画出 4-8s 的循环脚本：什么在变、什么读数在跳
3. 数字必须真实（来自事实库），读数随动画同步更新
4. 两帧验证法：间隔 1.2s 截两帧，像素必须不同
