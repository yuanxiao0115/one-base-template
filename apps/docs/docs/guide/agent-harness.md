# Agent Harness 与仓库知识

## 适用范围

本页适用于整个仓库：`one-base-template`

目标：说明本仓库如何借鉴 Harness Engineering 的思路，把“agent 需要知道的项目知识”放回仓库，而不是继续堆到全局配置里。

## 为什么不在仓库里重复定义运行时角色

本仓库当前的运行时角色（如 `default / worker / reviewer / explorer`）已经放在全局 Codex 配置中维护。  
因此，本仓库**不再重复维护一套项目内运行时角色配置**，而是专注于沉淀以下内容：

1. **项目边界**：哪些目录负责什么，哪些依赖是禁止的。
2. **验证口径**：改完以后跑哪些命令才算闭环。
3. **知识入口**：agent 需要先读哪些文档，才能少走弯路。
4. **规则落盘位置**：新规则到底写根 `AGENTS.md` 还是写子目录 `AGENTS.md`。

一句话概括：

- `~/.codex` 负责 **通用运行时角色**
- 仓库自身负责 **项目知识与可执行约束**

## 仓库中的知识入口

| 入口                                       | 作用                             | 何时优先阅读                |
| ------------------------------------------ | -------------------------------- | --------------------------- |
| `AGENTS.md`                                | 全仓工作流、边界、验证、协作规则 | 进入仓库后的第一站          |
| `apps/*/AGENTS.md`、`packages/*/AGENTS.md` | 子项目专属约束                   | 确认改动落点后立即阅读      |
| `apps/docs/docs/guide/architecture.md`     | 目录结构、启动链路、分层边界     | 改动跨目录、跨包时          |
| `apps/docs/docs/guide/development.md`      | 验证命令、维护流程、文档同步要求 | 实施前与完成前              |
| `apps/docs/docs/guide/agents-scope.md`     | 规则分层、作用域映射             | 新增或调整规则时            |
| `docs/plans/*.md`                          | 已批准设计稿、实施计划、范围冻结 | 承接已有设计 / 历史上下文时 |
| `.codex/operations-log.md`                 | 历史操作与降级记录               | 开工前必须阅读              |
| `.codex/testing.md`                        | 测试命令与结果                   | 准备验证时                  |
| `.codex/verification.md`                   | 完成前的闭环结论                 | 准备宣告完成时              |

## 推荐工作流（项目版）

### 1. 先确认目标仓库与作用域

开始前先回答两个问题：

1. 当前任务是不是明确针对 `one-base-template`？
2. 改动落在根目录规则、某个子项目规则，还是具体代码功能？

如果用户明确说的是“项目里的规则 / 文档 / 实现”，默认应当先改仓库内文件，而不是回去修改 `~/.codex`。

### 2. 先读规则，再动实现

推荐阅读顺序：

1. 根 `AGENTS.md`
2. 目标目录的 `AGENTS.md`
3. 对应指南页（如 `architecture`、`development`、`agents-scope`）
4. 最近的 `docs/plans/*.md`
5. `.codex` 下的历史日志与验证记录

### 3. 把约束写成仓库可读信息

以下信息优先写进仓库，而不是只停留在聊天里：

- 目录职责
- 模块边界
- 验证命令
- 文档同步要求
- 新增规则的落盘位置
- 用户刚刚纠正过的“容易再犯”的规则

### 4. 文档与实现同步演进

凡是会影响 agent 判断的变化，都应该同步更新：

1. `AGENTS.md`
2. `apps/docs/docs/guide/*`
3. `apps/docs/docs/.vitepress/config.ts`
4. `apps/docs/docs/guide/index.md`
5. `.codex/*.md`（操作、测试、验证）

## 什么时候该改 `~/.codex`

只有以下场景才应该回到全局配置：

1. 用户明确要求“更新 Codex / 全局 agent / 模型配置”
2. 变更目标本身就是跨仓库通用的运行时角色策略
3. 当前问题无法通过仓库知识与项目规则解决，必须上移为全局规则

其余情况下，默认优先修改本仓库内文件。

## 新规则应该写到哪里

### 写根 `AGENTS.md`

适用于：

- 全仓通用的协作流程
- 项目级目录边界
- 验证与提测要求
- “不要误改别的仓库 / 全局配置”这类范围规则

### 写子目录 `AGENTS.md`

适用于：

- 只影响某个 app / package 的约束
- 只在局部目录成立的实现细则
- 只和局部技术栈有关的操作方式

### 写到 `apps/docs`

适用于：

- 需要长期检索的架构说明
- 需要新人快速理解的知识地图
- 需要多页面互链的维护指南

### 写到 `docs/plans`

适用于：

- 一次性的设计稿
- 已批准的实施计划
- 需要明确冻结范围的阶段性方案

## 这次重构后的推荐心智模型

- 根 `AGENTS.md`：**导航页 + 执行边界**
- 子目录 `AGENTS.md`：**局部规则**
- `apps/docs`：**长期知识库**
- `docs/plans`：**设计与实施档案**
- `.codex/*.md`：**过程证据**

这样做的好处是：

1. agent 进入仓库后更快定位正确知识源。
2. 规则不再混入无关项目或全局角色配置。
3. 用户纠正后的规则能沉淀到仓库，而不是只存在会话历史里。

## 仓库内本地技能示例：Web 性能分析

仓库已新增本地 skill：`.codex/skills/web-performance-audit`。

用途：

- 通过 Lighthouse 批量采集页面性能报告（JSON + HTML）
- 自动汇总核心指标、机会项与风险项
- 输出可执行的性能优化优先级清单

常用命令：

```bash
# 若本机未安装
npm install -g lighthouse

# 采集 3 次移动端报告
./.codex/skills/web-performance-audit/scripts/run_lighthouse.sh \
  --url http://127.0.0.1:5173 \
  --preset mobile \
  --runs 3

# 汇总结果
node ./.codex/skills/web-performance-audit/scripts/summarize_lighthouse.mjs \
  --report-dir .codex/lighthouse/<timestamp> \
  --output .codex/lighthouse/<timestamp>/summary.md
```

补充说明：

- 该 skill 除 Lighthouse 外，还内置了 bundle/runtime/network 的补充分析方法，见 skill `references/` 目录。
- 分析结果应按固定口径复测（同 URL、同 preset、同 runs）后再下结论。

## 仓库内本地技能示例：Markdown 技术文档写作

仓库已新增本地 skill：`.codex/skills/write-markdown-tech-docs`。

用途：

- 为技术文档提供固定信息架构（目标、范围、步骤、验收、回滚）
- 统一 Markdown 排版规范（标题层级、代码块、表格、术语）
- 提供可复用模板，降低“从零起稿”的沟通与维护成本

资源入口：

- 核心说明：`./.codex/skills/write-markdown-tech-docs/SKILL.md`
- 结构规范：`./.codex/skills/write-markdown-tech-docs/references/information-architecture.md`
- 排版规范：`./.codex/skills/write-markdown-tech-docs/references/visual-style-guide.md`
- 模板文件：`./.codex/skills/write-markdown-tech-docs/assets/tech-doc-template.md`

## 相关阅读

- `/guide/architecture`
- `/guide/development`
- `/guide/agents-scope`
