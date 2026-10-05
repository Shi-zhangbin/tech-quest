# 生产线细节：视频调研 / 持久化 / 验证

## 视频调研（第 3 步）

子代理并行，每批 6-10 节点。调研 prompt 要点：
- 列出节点 id + 中文描述
- 优先权威来源（官方频道、领域公认 UP 主/讲师）
- 验证方式：WebSearch 找候选 → WebFetch/oEmbed/搜索 API 交叉印证；YouTube 不可直连时用 oEmbed/Invidious；B站用搜索 API 按 BV 号二次验证
- 验证不了 → 该字段空数组 + note 说明，绝不编造
- 附抖音/小红书搜索关键词 2-3 个（不用找链接）

输出 JSON（`research/videos-batchN.json`）：

```json
[{
  "id": "kv-cache",
  "youtube": [{"title":"...","channel":"...","url":"https://www.youtube.com/watch?v=...","why":"一句话"}],
  "bilibili": [{"title":"...","up":"...","url":"https://www.bilibili.com/video/BV...","why":"一句话"}],
  "keywords": ["KV cache 原理", "大模型推理优化"],
  "note": ""
}]
```

前端渲染：YouTube/B站 为直链（新开标签页）；抖音/小红书由 keywords 生成搜索直达：
`https://www.douyin.com/search/{encodeURIComponent(kw)}`、`https://www.xiaohongshu.com/search_result?keyword={encodeURIComponent(kw)}`，标注「搜索直达」。

## 进度持久化（第 8 步）

```js
const SAVE_KEY = '<theme>-<module>-v1';   // 如 llmq-inference-v1
function saveProgress(){
  try{ localStorage.setItem(SAVE_KEY, JSON.stringify({
    done: Object.keys(state).filter(k=>state[k]==='done'), cleared
  })); }catch(e){}
}
function loadProgress(){ /* 读回 state 与 cleared，恢复的通关补 markClear 显示钢印 */ }
function resetProgress(){ if(!confirm('清空所有校准进度与沙盒通关记录？')) return; localStorage.removeItem(SAVE_KEY); location.reload(); }
```

- quiz 答对（`state[id]='done'` 后）与 markClear 里各调一次 saveProgress
- 初始化：`loadProgress()` 在首次 `renderMatrix()` 之前
- 机头加 RST 按钮（小号等宽、边框 var(--ink2)、无背景）

## 验证门禁（第 9 步）

1. content.js node 校验（见 content-schema.md 末尾脚本）
2. Playwright 实测清单：
   - 首屏 1440×900 截图：矩阵无横向溢出、编号/分区正确
   - 解锁链路：首节点答对 quiz → 下游 locked→open；多前置节点需全部答对才解锁
   - 每个 Canvas 引擎节点：间隔 1.2s 双帧比对确认在动
   - 快切 5 个节点：rAF/timer 无泄漏（只剩当前一个）
   - 沙盒每关：FAIL 路径与 PASS 路径各走一遍，算式追踪读数正确
   - 持久化：答对→刷新→进度保留；RST→清零
   - 全程 pageerror/console.error 为 0（含 favicon 404 也要消掉）
