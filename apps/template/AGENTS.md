# AGENTS.md（template）

> 作用域：`/Users/haoqiuzhi/code/one-base-template/apps/template/**`
> 主版本：本文件
> 继承：根 `AGENTS.md` + `apps/docs/docs/guide/template-agent-redlines.md`

## 目标定位

- template 是 **新子项目孵化 + 老项目迁移承接** 的基座应用，不再是“最小静态示例”。
- 本目录只维护“可复制底盘 + 可执行红线 + 示例模块契约”，不承载具体业务迁移。
- 新项目从 template 派生时，优先复用 `bootstrap/config/router/services/types` 分层，不要回退到单文件拼装。

## 启动骨架红线

- 启动链路固定为：`main.ts -> bootstrap/startup.ts -> bootstrap/index.ts -> mount`。
- `vite.config.ts` 必须通过 `build/vite-plugins.ts` 的 `createTemplatePlugins()` 统一装配插件，保持与 admin 一致的 Element Plus 组件解析链路；禁止回退到仅 `vue()` 的最小配置。
- Vue App / Pinia / Router 创建只允许出现在 `src/bootstrap/**`，禁止回流到 `modules/**`、`pages/**`。
- 全局能力注册（`app.use/component/directive/provide`）仅允许在 `src/bootstrap/**` 或 `src/main.ts` 的 beforeMount 扩展中处理。
- 应用反馈能力统一走 `@one-base-template/ui`：`registerMessageUtils`、`message`、`obConfirm`；禁止业务层直连 `ElMessage` / `ElMessageBox`。
- `src/bootstrap/index.ts` 必须先 `setupRouterGuards(...)` 再 `app.use(router)`，禁止改回先装 router 的顺序。

## 配置与环境红线

- `src/config/platform-config.ts` 是 template 平台配置唯一入口；禁止恢复 `public/platform-config.json` 运行时配置。
- 默认配置口径：`preset=remote-single + authMode=token + backend=basic`。
- 必须兼容 `backend=default/basic` 双后端分支；跨后端差异只允许收口在 `src/config/**` 与 `src/bootstrap/{http,adapter}.ts`。
- 除 `src/config/env.ts` 与 `src/utils/logger.ts` 外，禁止直接读取 `import.meta.env`。

## 模块契约与路由红线

- 模块目录固定契约：`manifest.ts + module.ts + routes.ts`。
- 模块路由统一经 `router/registry.ts + router/assemble-routes.ts` 装配，禁止回退到 `src/router/routes.ts` 静态直拼。
- 路由 meta 统一通过 `router/meta.ts` helper 生成，`open/auth/menu` 语义必须与 admin 保持一致。
- 模块之间禁止直接相互 import（`modules/a` 依赖 `modules/b`）；共享能力请提升到 `services/types/utils/core/ui`。

## HTTP / API 红线

- API 调用统一使用 `obHttp().get/post/...`，禁止 `const http = obHttp()`、`getHttp(){ return obHttp() }` 包装。
- `modules/**/api.ts` 禁止 `export type {...} from './types'` 类型中转导出。
- `services/security/signature.ts` 必须继续复用 `@one-base-template/core` 的 `getClientSignatureInput/buildClientSignature`。
- 页面/组件/store 禁止直接依赖 `infra/http`（template 当前已移除 infra 目录）。

## CRUD 与模板事件红线

- CRUD 列表编排页（`modules/**/list.vue`）禁止 `<el-table>`、`<el-dialog>`、`<el-upload>`，统一走 `ObVxeTable` / `ObCrudContainer` / 领域组件。
- 模板事件禁止内联箭头函数（如 `@click="() => handleXxx(row)"`），改为显式 handler（如 `@click="handleXxx(row)"`）。

## 迁移边界

- 本轮及后续基座维护只提供契约、骨架、门禁与文档，不在 template 内落地具体业务模块迁移。
- 老项目迁移来源固定：`/Users/haoqiuzhi/code/basic/standard-oa-web-basic`。
- 遇到红线例外，必须有用户明确授权，并记录“原因 + 范围 + 回收条件”。

## 门禁与验收命令

```bash
pnpm -C apps/template typecheck
pnpm -C apps/template lint
pnpm -C apps/template lint:arch
pnpm -C apps/template test:run
pnpm -C apps/template build
```

- 涉及文档或规则变更时，追加：

```bash
pnpm -C apps/docs lint
pnpm -C apps/docs build
```

- 变更结果必须同步到 `.codex/operations-log.md`、`.codex/testing.md`、`.codex/verification/YYYY-MM-DD.md`。
