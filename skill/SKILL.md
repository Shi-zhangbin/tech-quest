---
name: tech-quest-console
description: 把一个技术主题（LLM 推理/训练、K8s、数据库、网络、操作系统等）做成「游戏化学习控制台」——仪器风格单页 HTML：技能树解锁 + 六段式技术卡片（原理/公式/算例/权衡/误区/资源）+ Canvas 机制动画 + 真实计算的沙盒关卡 + 联网验证过的视频资源 + localStorage 进度持久化。当用户说「做个游戏化的学习界面」「把某个技术主题做成闯关/技能树」「像 tech-quest 那样的学习机台」「深入浅出系统学 X（不要科普）」「知识卡片+沙盒实验」时必用。也适用于给已有 quest 控制台增补模块或知识点。不是做科普页面——内核必须是可计算、可复核的工程深度。
---

# TECH-QUEST CONSOLE · 游戏化学习控制台生产线

把一个技术主题做成一台「仪器控制台」：用户扮演工程师，沿技能树逐节点校准（读卡片→答测验→解锁下游），在沙盒关卡里调真实参数达成 SLA 通关。

**核心立场：游戏化是外壳，工程深度是内核。** 每个知识点必须可计算（公式 + 真实数字算例）、可复核（数字不许编）、可延伸（真实视频链接）。用户明确拒绝科普。

## 参照实现（先读）

`assets/console-template.html` 是完整可用的参照实现（LLM 推理模块，1584 行）——设计系统、技能矩阵、六段式卡片、quiz 解锁、Canvas 动画引擎、三关沙盒、localStorage 持久化全在里面。**新模块从克隆它开始，手术式替换，不从零写。**

## 生产线（9 步，按序执行）

### 0. 需求澄清
确认：主题、目标读者起点（决定前置链深度）、节点规模（20-30 个为宜）、沙盒关卡数（3 个为宜）、交付目录。**前置链不是可选项**——实测教训：用户不懂前置概念会完全无法进入主线（「我完全不知道你在干什么」）。每个模块都必须从零基础前置链讲起（如 LLM 推理从 Tokenization 讲起、K8s 从「物理机→VM→容器」讲起）。

### 1. 知识地图
设计节点图：1 条前置链（6-8 节点，链式依赖）+ 3-5 条支线（每线 3-6 节点）+ 依赖关系。节点粒度：一个节点 = 一个可独立讲清且能出算例的概念。先画在纸上（或设计文档里）给用户确认再往下。

### 2. 事实库
为该主题写一份事实清单：硬件参数、公式、真实案例数字（如 A100 带宽 2039GB/s、KV cache 公式、K8s NodePort 范围 30000-32767）。**内容生成时只允许用事实库里的数字**，未覆盖的只定性描述、不许编具体数。这是准确性的根基。

### 3. 视频资源调研（子代理并行，每批 6-10 节点）
每个节点：YouTube 1-2 个 + B站 1-2 个真实精选视频 + 抖音/小红书搜索关键词 2-3 个。
- YouTube/B站：必须联网验证存在性（oEmbed/搜索 API/打开页面交叉印证），**验证不了就宁缺毋滥**，绝不编造 URL 或 BV 号
- 抖音/小红书：单视频直链不稳定且有登录墙，给关键词即可，前端生成搜索直达链接（`https://www.douyin.com/search/{kw}`、`https://www.xiaohongshu.com/search_result?keyword={kw}`）
- 输出 JSON 存 `research/videos-batchN.json`，结构见 `references/pipeline.md`

### 4. content.js 知识库
纯数据文件（`window.LLM_QUEST_CONTENT = {nodes:[...]}`），schema、六段式写作规范、质量门禁见 `references/content-schema.md`。写完必须跑节点校验脚本（依赖闭合、字段齐全）。

### 5. 控制台 HTML
克隆 `assets/console-template.html`，手术式替换：品牌（标题/机型/阶段）、技能矩阵布局（grid 行列、分区丝印、编号前缀）、沙盒关卡逻辑。设计系统 token（配色/字体/组件）见 `references/design-system.md`。**知识内容一律从 content.js 动态读，HTML 不硬编码。**

### 6. Canvas 机制动画
通用动画（flow 点亮/bars 生长/compare 擦入/tree 级联）覆盖全部节点；核心概念节点（6-10 个）配专属 Canvas 引擎，真正展示机制。引擎编写规范 + 已有 23 个引擎的模式库见 `references/animation-engines.md`。**循环概念（自回归、reconcile、训练 step）用回环动画**——这是用户体感最强的点。

### 7. 沙盒关卡（3 关）
每关：给资源约束 + 可调参数 + SLA 判定，全部 JS 真实计算 + 算式追踪面板逐行显示计算过程。设计规范见 `references/sandbox-design.md`（含推理/训练/K8s 三个实例的完整公式集）。

### 8. 进度持久化
localStorage 存已校准节点 + 沙盒通关（键名按模块命名空间，如 `llmq-inference-v1`）；机头 RST 按钮 confirm 后清零。模式见 `references/pipeline.md` §8。

### 9. 验证门禁（不通过不交付）
- `node` 校验 content.js：节点数、依赖闭合、六段/quiz/resources 字段齐全
- Playwright 实测：首屏无溢出、答对 quiz 解锁下游、每关 PASS/FAIL 路径各走一遍、动画双帧确认在动、快切节点无 rAF 泄漏、**pageerror/console 零错误**
- 截图存档

## 踩过的坑（实测教训）

1. **没有前置链 = 用户进不了门**——永远从最基础讲起，宁可多 8 个节点
2. **视频链接编造是死罪**——调研子代理必须联网验证，验证不了的字段留空并在 note 说明
3. **「动画太简陋」的解法不是更多 CSS**——是 Canvas 定制引擎，画出机制本身（KV 块填充、梯度下降小球、Pod 摆放）
4. **沙盒公式必须与知识库教的公式一致**——曾出现卡片教 (p-1)/(m+p-1) 而沙盒算成别的近似值的矛盾
5. **进度不持久 = 每次重学一遍**——localStorage 是硬需求
6. 循环概念一定要做成循环动画，静态流程图传达不了「这是个 loop」
7. 反 AI slop：禁紫渐变、禁 emoji 图标、禁通用暗色霓虹；仪器质感 = 米色机箱 + 琥珀示波屏 + 单一 accent

## 多模块组织

```
<theme>-quest/
  <module-a>/<theme>-quest-<module-a>.html + <-content.js>
  <module-b>/...
  research/videos-*.json
```

发布版仓库（如 github.com/Shi-zhangbin/tech-quest）：`index.html` 总机门户 + 各模块目录 + README，GitHub Pages 直接可玩。
