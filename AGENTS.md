# AGENTS.MD

全程使用中文进行 thinking、message 回复。

yuanxiao owns this. Start: say hi + 1 motivating line.

---

## 🎯 Agent / Harness 定位

- `~/.codex` 的全局配置负责 **运行时角色、模型、system prompt、工具权限**。
- 本仓库负责 **项目知识、目录边界、验证口径、文档入口、协作规则**。
- **当用户明确指向本仓库时，默认只修改 `/Users/haoqiuzhi/code/one-base-template/**`；除非用户明确要求，否则不要修改 `~/.codex`、其他仓库或全局角色配置。**
- 在本仓库工作时，优先让仓库本身对 agent 可读：规则写进 `AGENTS.md`，项目知识写进 `apps/docs`，实施记录写进 `docs/plans` 与 `.codex/*.md`。

---

## 🧭 核心工作模式

### 技能优先原则（CRITICAL）

在任何响应或行动之前，**优先检查并调用相关技能/规范**（例如：`turborepo`、`pnpm`、`vue-best-practices`、`vue-router-best-practices`、`pinia`、`vite`、`web-design-guidelines` 等）。

> 目标：避免靠“记忆”猜 API/最佳实践，减少返工与隐性风险。

### 完整开发工作流（强制）

1. `brainstorming`：编码前先澄清边界、备选方案与验收口径，输出可验证设计。
2. `using-git-worktrees`：**需要隔离未提交改动、并行分支或大任务拆分时**启用；当前仓库默认优先在当前工作分支开发。
3. `writing-plans`：拆成 2-5 分钟小任务，每个任务写清文件路径、代码要点、验证方式。
4. `executing-plans` / `subagent-driven-development`：按计划实施，并设置检查点。
5. `test-driven-development`：RED-GREEN-REFACTOR；本仓库若无现成测试框架，至少保证 `typecheck / lint / build` 通过。
6. `requesting-code-review`：阶段性审查，严重问题阻断进度。
7. `finishing-a-development-branch`：完成后跑验证、给出集成选项、清理临时工作区。

---

## 📂 项目结构（Monorepo）

仓库根目录：`/Users/haoqiuzhi/code/one-base-template`

```text
apps/
  admin/                 # 主应用（Vite + Vue）
  portal/                # 门户消费者应用（独立渲染）
  template/              # 最小可用示例（静态菜单）
  docs/                  # 文档站点（VitePress）
packages/
  adapters/              # Adapter：对接后端接口/字段映射
  core/                  # 纯逻辑：鉴权/SSO/菜单/主题/tabs/http 等
  portal-engine/         # 门户设计器/渲染引擎共享能力（admin 与 portal 复用）
  tag/                   # 主题样式与视觉资产
  ui/                    # UI 壳：Layout/Sidebar/Topbar/Tabs/KeepAlive 等
  utils/                 # 通用工具能力
docs/
  plans/                 # 设计稿、实施计划、阶段性方案沉淀
.codex/
  operations-log.md      # 操作日志
  testing.md             # 测试记录
  verification.md        # 完成前验证结论
```

### 解耦 / 边界（全局）

- `packages/core`：只写逻辑与契约；**禁止**引入 `element-plus` / 具体 UI 组件库；禁止写死后端字段假设。
- `packages/ui`：只做 UI 壳与交互；通过 core 的 store / composable 获取数据；**禁止**反向依赖 apps。
- `packages/adapters`：只做后端协议适配与字段映射；禁止承载 UI 逻辑。
- `apps/admin`：只做组装与页面样式；对接不同后端时优先替换 adapters。
- `apps/portal`：维持前台独立静态应用边界；默认不依赖后台菜单接口。
- `apps/template`：只保留最小静态菜单链路，用于验证模板最小闭环。
- `apps/docs`：只做文档内容与站点配置，保证与代码行为一致。

---

## 🗂️ 规则分层与适用范围（必须遵守）

| 作用域 | 规则文件 | 说明 |
| --- | --- | --- |
| 全仓通用 | `/Users/haoqiuzhi/code/one-base-template/AGENTS.md` | 工作流、项目边界、协作规范、知识入口 |
| admin 应用 | `/Users/haoqiuzhi/code/one-base-template/apps/admin/AGENTS.md` | 路由菜单、主题、表格、UserManagement 等实现细则 |
| docs 站点 | `/Users/haoqiuzhi/code/one-base-template/apps/docs/AGENTS.md` | 文档结构、导航同步、构建校验 |
| adapters 子包 | `/Users/haoqiuzhi/code/one-base-template/packages/adapters/AGENTS.md` | 适配层契约、字段映射、mock / 真实接口边界 |
| core 子包 | `/Users/haoqiuzhi/code/one-base-template/packages/core/AGENTS.md` | 逻辑内核、主题 token、无 UI 依赖 |
| portal-engine 子包 | `/Users/haoqiuzhi/code/one-base-template/packages/portal-engine/AGENTS.md` | 门户引擎物料配置红线、统一封装组件复用约束 |
| ui 子包 | `/Users/haoqiuzhi/code/one-base-template/packages/ui/AGENTS.md` | 壳组件实现、样式 token、导出边界 |
| tag 子包 | `/Users/haoqiuzhi/code/one-base-template/packages/tag/AGENTS.md` | 主题样式资源与导出规范 |
| utils 子包 | `/Users/haoqiuzhi/code/one-base-template/packages/utils/AGENTS.md` | 工具函数语义、纯函数与可复用性 |

### 规则落盘原则

- **子项目专属规则**：写入对应子项目 `AGENTS.md`，不再堆到根目录。
- **跨子项目通用规则**：写在根目录，并在子项目文件中按需引用。
- **同一规则只维护一处主版本**：其他文件只做引用，避免冲突与重复维护。
- **运行时角色配置不进仓库**：本仓库不重复维护 `~/.codex` 中的角色模型与 system prompt。

---

## 📚 项目知识入口（执行前先看）

1. 根 `AGENTS.md`：确认全仓工作流、边界、验证与协作规则。
2. 目标目录下的 `AGENTS.md`：确认该子项目的专属约束。
3. `apps/docs/docs/guide/architecture.md`：确认目录结构、启动链路与分层边界。
4. `apps/docs/docs/guide/development.md`：确认验证命令、维护流程与文档同步要求。
5. `apps/docs/docs/guide/agents-scope.md`：确认规则分层与作用域。
6. `apps/docs/docs/guide/agent-harness.md`：确认本仓库的 Agent / Harness 实践与知识落点。
7. `docs/plans/*.md`：确认最近的设计稿、实施计划与已冻结范围。
8. `.codex/operations-log.md` / `.codex/testing.md` / `.codex/verification.md`：确认历史操作、验证与风险。

---

## 🧪 默认验证命令（全仓）

根目录常用命令：

- `pnpm dev`
- `pnpm typecheck`
- `pnpm lint`
- `pnpm build`
- `pnpm verify`
- `pnpm -C apps/docs build`

注意：

- 避免对全仓跑带 `--fix` 的 lint / format，优先定向到本次改动文件，避免引入无关 diff。
- 文档、规则、结构说明发生变化时，至少补跑 `pnpm -C apps/docs lint` 与 `pnpm -C apps/docs build`。

---

## 🧩 可读性与封装约束（全仓）

- **可读性优先于抽象层级**：优先写“拿来就能读懂”的直白实现，避免为展示技巧而增加间接层。
- **禁止过度封装**：若只是单点使用、没有稳定复用价值或不能显著降低复杂度，不要新增 helper / mapper / adapter 包装层。
- **抽象前先证明收益**：至少满足“多处重复 + 语义稳定 + 能显著降低维护成本”再抽象；否则保留在业务就近实现。
- **冗余逻辑及时删除**：发现历史包装函数/兜底转换与当前后端契约不再匹配时，优先删减而不是继续叠加兼容。
- **禁止类型中转导出**：禁止在同一文件里出现“从同一路径 `import type` 后再 `export type`”的中转写法（尤其 `api.ts -> ./types`）；类型应由源 `types.ts` 直接导入。
- **HTTP 调用禁止中间变量包装**：在 `api.ts` / `api/client.ts` 中禁止 `const http = obHttp()`、`function getHttp(){ return obHttp() }` 这类中转；统一直接使用 `obHttp().get/post/...`。

---

## 💬 沟通与协作规范（全局）

- 全程中文回复；结构清晰；重要信息加粗。
- 执行前说明要做什么，执行后汇报结果（包含：改动文件、验证命令、风险点）。
- 当用户纠正后：**把新规则补充到对应作用域的 AGENTS 文件**，避免重复犯错。
- **当用户纠正了“目标仓库 / 目标目录 / 目标作用域”时，先校验当前工作目录与改动范围；不要继续修改 `~/.codex` 或其他无关仓库。**
- 老项目（layout/menu 移植来源）固定为：`/Users/haoqiuzhi/code/sczfw/standard-oa-web-sczfw`（不要再误用其他仓库路径）。
- `.codex/` 目录下的工作文档（如 `operations-log.md` / `testing.md` / `verification.md` / `context-*.md`）如果创建或已存在：**开工前必须先阅读**，开发过程中同步更新，并在回复里引用关键结论；禁止“创建了但不看 / 不维护”。
- 新增 / 修改功能后：**必须同步更新文档站点** `apps/docs`（VitePress），确保 `pnpm -C apps/docs build` 可通过且内容与代码一致。
- admin 迁移与重构需强制遵守“公共组件与 CRUD 红线”，主版本在 `apps/admin/AGENTS.md`，说明文档在 `apps/docs/docs/guide/admin-agent-redlines.md`。
- 当前阶段尽量减少分支数量：默认在当前工作分支开发；完成后合并回 `main` 并清理临时分支 / 工作区。
- **Git 提交信息必须使用中文**（commit message 禁止英文）。
- **未收到“现在提交”的明确指令前，默认不执行 `git commit`；需要提交时先展示拟提交文件清单，并按模块拆分提交。**
- **开发阶段默认不做历史配置兼容**；除非用户明确要求，否则按当前方案直接收敛实现。
- **共享登录能力命名固定为通用名**：公共登录框组件使用 `LoginBox.vue`，公共登录动作文件使用 `login.ts`；后续新版本使用 `v1` / `v2` 后缀，禁止再使用后端或项目名（如 `sczfw`）命名公共能力。
- **`apps/portal` 维持前台独立静态应用边界**：默认不接菜单接口，不依赖 `/cmict/admin/permission/*` 菜单能力；登录后仅处理前台页面跳转与门户分流。
- **共享登录组件收敛原则**：
  - `LoginBox.vue` 内置默认密码校验规则，并通过 props 允许关闭或覆盖。
  - `LoginBox.vue` 可直接内置 SM4 处理，页面层不再重复拼装同构加密逻辑。
  - 开发态 `backend === "default"` 不再保留 `demo/demo` 自动填充逻辑。
  - 需要滑动验证时，新增版本化组件（如 `LoginBoxV2.vue`），不要继续把验证码逻辑散落回页面。
- **应用层验证码接口收口规则**：`admin` / `portal` 的滑块验证码接口统一放在各自 `src/shared/services/auth-captcha-service.ts`，禁止继续放在 `components/verifition-plus/**` 这类组件目录下。
