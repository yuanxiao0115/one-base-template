# AGENTS.MD

全程使用中文进行 thinking、message 回复。

Ethan owns this. Start: say hi + 1 motivating line.

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

仓库根目录：`/Users/haoqiuzhi/code/standard-base-tamplate`

```
apps/
  admin/                 # 主应用（Vite + Vue）
packages/
  core/                  # 纯逻辑：鉴权/SSO/菜单/主题/tabs/http 等（禁止耦合 UI）
  ui/                    # UI 壳：Layout/Sidebar/Topbar/Tabs/KeepAlive 等（依赖 core）
  adapters/              # Adapter 示例：对接后端接口/字段映射
```

### 解耦/边界（必须遵守）

- `packages/core`：只写逻辑与契约；**禁止**引入 `element-plus`/具体 UI 组件库；禁止写具体后端字段假设。
- `packages/ui`：只做 UI 壳与交互；通过 core 的 store/composable 获取数据；**禁止**反向依赖 apps。
- `apps/admin`：只做组装与页面样式；对接不同后端时只替换 `packages/adapters` 或应用侧 adapter 注入。

---

## 🧱 关键架构约定

### 静态路由 + 动态菜单

- 路由：全部在前端静态声明（模块化 `modules/**/routes.ts`），**不依赖**后端动态 addRoute 才能访问。
- 菜单：
  - `remote`：由后端返回“可见菜单树”
  - `static`：从静态路由 `meta.title` 生成菜单树（适合简单项目）
- 默认权限：**菜单树出现过的 path 集合 = allowedPaths**；不在集合的路由统一拦截到 `403`。

### SSO 单点登录

- 统一回调路由建议固定为：`/sso`（白名单）
- 支持策略（按优先级匹配）：`token` / `ticket` / `oauth code`
- exchange 成功后：`fetchMe()` -> `fetchMenu()` -> redirect 到站内安全地址

### Cookie(HttpOnly) 鉴权（默认）

- HTTP 客户端默认 `withCredentials: true`
- 前端默认不读写 token（除非切换 token 模式）
- dev mock 需要 Set-Cookie，因此采用 **Vite Dev Server middleware**（而不是纯浏览器侧 mock）

---

## 🧪 本仓库默认验证命令

根目录：

- `pnpm dev`
- `pnpm typecheck`
- `pnpm lint`
- `pnpm build`

注意：避免对全仓跑带 `--fix` 的 lint/format，优先定向到本次改动文件，避免引入无关 diff。

---

## 💬 沟通规范

- 全程中文回复；结构清晰；重要信息加粗
- 执行前说明要做什么，执行后汇报结果（包含：改动文件、验证命令、风险点）
- 当用户纠正后：**把新规则补充到本文件**，避免重复犯错

