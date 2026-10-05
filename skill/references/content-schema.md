# content.js 知识库 Schema 与写作规范

## 文件形态

纯数据文件，无 UI 逻辑。文件头注释标明模块与节点数。

```js
window.LLM_QUEST_CONTENT = {
  nodes: [ /* ... */ ]
};
```

## 节点 Schema（严格一致）

```js
{
  id: "kv-cache",              // kebab-case，全库唯一
  name: "KV Cache 原理",        // 中文名
  en: "KV CACHE",              // 英文丝印标签（短，全大写）
  branch: "kv",                // prereq | 各支线 id
  deps: ["prefill-decode"],    // 前置依赖 id 数组，必须闭合
  grid: { col: 3, row: 2 },    // 矩阵布局位置
  summary: "一句话定位（≤40字）",
  sections: {
    principle: "原理讲解 2-4 句，纯文本",
    formula: ["公式行1", "公式行2"],
    example: ["算例行1", "算例行2"],
    tradeoffs: ["权衡1", "权衡2", "权衡3"],
    pitfalls: ["误区1", "误区2"]
  },
  diagram: {
    type: "flow|bars|compare|tree|loop",
    anim: "kvGrow",            // 可选：挂 Canvas 引擎（见 animation-engines.md）
    title: "图题",
    items: [["标签", "值或说明"]]
  },
  quiz: {
    q: "题干（考理解不考记忆）",
    options: ["A", "B", "C", "D"],
    answer: 0,
    explain: "解析，点明为什么"
  },
  resources: {
    youtube: [{ title, channel, url, why }],
    bilibili: [{ title, up, url, why }],
    keywords: ["抖音/小红书搜索词"]
  }
}
```

## 六段式写作规范

1. **原理**：2-4 句讲清机制，不说废话。第一句给定位，后面给机制
2. **公式**：纯文本规范公式（无 LaTeX 渲染），变量含义就近说明
3. **算例**：用真实数字完整代入公式，每一步可手算复核。例：`KV/token = 2×80层×8头×128维×2B = 320 KB`
4. **工程权衡**：2-3 条真话，如「量化只省权重显存，KV cache 才是长上下文的大头」
5. **常见误区**：2-3 条，如「以为加算力就能加速 decode——batch=1 时瓶颈是带宽不是 FLOPS」
6. **学习资源**：从调研 JSON 拷贝，一字不改（URL 已验证过）

## 承上启下

节点内容要有指向性：前置节点结尾点出「这个问题正是下游 X 节点要解决的」。这让技能树的依赖关系变成叙事线，不是装饰。

## 准确性红线

- 所有数字必须来自该模块的事实库（pipeline 第 2 步产出）
- 事实库没覆盖的 → 定性描述，不许编具体数字
- 中文「」引号，术语保留英文原名

## 校验脚本（写完必跑）

```bash
node --input-type=module -e "
global.window={};
await import('file://<绝对路径>/content.js');
const n=window.LLM_QUEST_CONTENT.nodes;
console.log('nodes:', n.length);
console.log('deps ok:', n.every(x=>x.deps.every(d=>n.find(y=>y.id===d))));
console.log('sections ok:', n.every(x=>x.sections&&x.quiz&&x.resources));
"
```
