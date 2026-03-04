# AGENTS.MD

全程使用中文进行 thinking、message 回复。

yuanxiao owns this. Start: say hi + 1 motivating line.

---

## 🎯 核心工作模式

### 技能优先原则（CRITICAL）

在任何响应或行动之前，**优先检查并调用相关技能/规范**（例如：turborepo、pnpm、vue-best-practices、vue-router-best-practices、pinia、vite、web-design-guidelines 等）。

> 目标：避免靠“记忆”猜 API/最佳实践，减少返工与隐性风险。

### 完整开发工作流（强制）

1) brainstorming（编码前先澄清边界/备选方案，输出可验证的设计）
2) using-git-worktrees（设计批准后再隔离工作区/新分支）
3) writing-plans（拆成 2-5 分钟小任务，每个任务含：文件路径 + 代码要点 + 验证方式）
4) executing-plans / subagent-driven-development（按计划实施，设置人工检查点）
5) test-driven-development（RED-GREEN-REFACTOR；本仓库当前无既定测试框架时，至少保证 typecheck/lint/build 通过）
6) requesting-code-review（阶段性审查，严重问题阻断进度）
7) finishing-a-development-branch（完成后跑验证、给出集成选项、清理工作区）

---

## 📂 项目结构（Monorepo）

仓库根目录：`/Users/haoqiuzhi/code/one-base-template`

```text
apps/
  admin/                 # 主应用（Vite + Vue）
  docs/                  # 文档站点（VitePress）
packages/
  adapters/              # Adapter：对接后端接口/字段映射
  core/                  # 纯逻辑：鉴权/SSO/菜单/主题/tabs/http 等
  lint-ruleset/          # 可发布 lint 规则子包
  tag/                   # 主题样式与视觉资产
  ui/                    # UI 壳：Layout/Sidebar/Topbar/Tabs/KeepAlive 等
  utils/                 # 通用工具能力
```

### 解耦/边界（全局）

- `packages/core`：只写逻辑与契约；**禁止**引入 `element-plus`/具体 UI 组件库；禁止写具体后端字段假设。
- `packages/ui`：只做 UI 壳与交互；通过 core 的 store/composable 获取数据；**禁止**反向依赖 apps。
- `packages/adapters`：只做后端协议适配与字段映射；禁止承载 UI 逻辑。
- `apps/admin`：只做组装与页面样式；对接不同后端时优先替换 adapters。
- `apps/docs`：只做文档内容与站点配置，保证与代码行为一致。

---

## 🗂️ 规则分层与适用范围（必须遵守）

| 作用域 | 规则文件 | 说明 |
| --- | --- | --- |
| 全仓通用 | `/Users/haoqiuzhi/code/one-base-template/AGENTS.md` | 工作流、沟通、提交、全局边界 |
| admin 应用 | `/Users/haoqiuzhi/code/one-base-template/apps/admin/AGENTS.md` | 路由菜单、主题、表格、UserManagement 等前端实现细则 |
| docs 站点 | `/Users/haoqiuzhi/code/one-base-template/apps/docs/AGENTS.md` | 文档结构、导航同步、构建校验 |
| adapters 子包 | `/Users/haoqiuzhi/code/one-base-template/packages/adapters/AGENTS.md` | 适配层契约、字段映射、mock/真实接口边界 |
| core 子包 | `/Users/haoqiuzhi/code/one-base-template/packages/core/AGENTS.md` | 逻辑内核、主题 token 引擎、无 UI 依赖 |
| ui 子包 | `/Users/haoqiuzhi/code/one-base-template/packages/ui/AGENTS.md` | 壳组件实现、样式 token、导出边界 |
| lint-ruleset 子包 | `/Users/haoqiuzhi/code/one-base-template/packages/lint-ruleset/AGENTS.md` | 规则映射、双口径统计、发布校验 |
| tag 子包 | `/Users/haoqiuzhi/code/one-base-template/packages/tag/AGENTS.md` | 主题样式资源与导出规范 |
| utils 子包 | `/Users/haoqiuzhi/code/one-base-template/packages/utils/AGENTS.md` | 工具函数语义、纯函数与可复用性 |

### 规则落盘原则（新增）

- **子项目专属规则**：写入对应子项目 `AGENTS.md`，不再堆到根目录。
- **跨子项目通用规则**：写在根目录，并在子项目文件中按需引用。
- **同一规则只维护一处主版本**：其他文件只做引用，避免冲突与重复维护。

---

## 🧪 默认验证命令（全仓）

根目录：

- `pnpm dev`
- `pnpm typecheck`
- `pnpm lint`
- `pnpm build`

注意：避免对全仓跑带 `--fix` 的 lint/format，优先定向到本次改动文件，避免引入无关 diff。

---

## 💬 沟通与协作规范（全局）

- 全程中文回复；结构清晰；重要信息加粗。
- 执行前说明要做什么，执行后汇报结果（包含：改动文件、验证命令、风险点）。
- 当用户纠正后：**把新规则补充到对应作用域的 AGENTS 文件**，避免重复犯错。
- 老项目（layout/menu 移植来源）固定为：`/Users/haoqiuzhi/code/sczfw/standard-oa-web-sczfw`（不要再误用其他仓库路径）。
- `.codex/` 目录下的工作文档（如 `operations-log.md` / `testing.md` / `verification.md` / `context-*.md`）如果创建或已存在：**开工前必须先阅读**，开发过程中同步更新，并在回复里引用关键结论；禁止“创建了但不看/不维护”。
- 新增/修改功能后：**必须同步更新文档站点** `apps/docs`（VitePress），确保 `pnpm -C apps/docs build` 可通过且内容与代码一致。
- 当前阶段尽量减少分支数量：默认在当前工作分支开发；完成后合并回 `main` 并清理临时分支/工作区。
- **Git 提交信息必须使用中文**（commit message 禁止英文）。
- **未收到“现在提交”的明确指令前，默认不执行 `git commit`；需要提交时先展示拟提交文件清单，并按模块拆分提交。**
- **开发阶段默认不做历史配置兼容**；除非用户明确要求，否则按当前方案直接收敛实现。
