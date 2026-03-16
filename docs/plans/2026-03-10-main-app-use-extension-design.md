# Admin main.ts 插件扩展位设计

## 背景

当前 admin 的启动链路已收敛到 `main.ts -> bootstrap/startup.ts -> bootstrap/index.ts`，但团队二开习惯是直接在 `main.ts` 使用 `app.use(...)` 安装插件。现状下若要满足该习惯，只能改 `bootstrap` 内核，容易污染核心代码。

## 目标

- 允许同事继续在 `main.ts` 使用 `app.use(...)` 风格扩展。
- 保持 `bootstrap/index.ts` 作为内部稳定内核，不被业务插件改动入侵。
- 不引入额外中转文件（不新增 `main.plugins.ts`）。

## 方案对比

### 方案 A（推荐）：在 `app-starter/startup` 增加 `beforeMount` 钩子

- `startAppWithRuntimeConfig()` 支持可选 `beforeMount(context)`。
- `apps/admin/src/bootstrap/startup.ts` 透传该钩子。
- `apps/admin/src/main.ts` 直接传入 `beforeMount`，在回调中写 `app.use(...)`。

优点：

- main 仍可直接写 `app.use`，符合团队习惯。
- bootstrap 内核保持稳定，不让同事改核心编排。
- 对 portal/template 无破坏（可选参数）。

### 方案 B：把插件安装逻辑继续放 `bootstrap/plugins.ts`

优点：

- 启动职责集中。

缺点：

- 与用户诉求冲突：同事会继续改 bootstrap。

### 方案 C：新增 `main.plugins.ts`

优点：

- 结构更清晰。

缺点：

- 用户已明确不要抽离该文件。

## 决策

采用方案 A。

## 影响文件

- 修改 `packages/app-starter/src/startup.ts`
- 修改 `apps/admin/src/bootstrap/startup.ts`
- 修改 `apps/admin/src/main.ts`
- 新增测试 `apps/admin/src/bootstrap/__tests__/startup.unit.test.ts`
- 同步文档：
  - `apps/admin/AGENTS.md`
  - `apps/docs/docs/guide/architecture.md`
  - `apps/docs/docs/guide/development.md`

## 验证口径

- `pnpm -C apps/admin exec vitest run src/bootstrap/__tests__/startup.unit.test.ts`
- `pnpm -C packages/app-starter typecheck`
- `pnpm -C apps/admin typecheck`
- `pnpm -C apps/admin lint`
- `pnpm -C apps/admin test:run`
- `pnpm -C apps/admin build`
- `pnpm -C apps/docs lint`
- `pnpm -C apps/docs build`
