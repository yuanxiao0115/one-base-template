# AGENTS.md（zfw-system-sfss）

> 作用域：`/Users/haoqiuzhi/code/one-base-template/apps/zfw-system-sfss/**`
> 主版本：本文件
> 继承：根 `AGENTS.md` + `apps/docs/docs/guide/admin-lite-agent-redlines.md`

## 目标定位

- `zfw-system-sfss` 是从 `admin-lite` 派生的业务应用。
- 本目录负责业务模块开发与项目级配置，不负责修改后台基座默认规则。
- 遇到可复用基建问题时，优先回推 `apps/admin-lite` 或 `packages/*`，不要在本目录长期复制基础能力。

## 启动与配置红线

- 启动链路固定为：`main.ts -> bootstrap/startup.ts -> bootstrap/index.ts -> mount`。
- `src/config/platform-config.ts` 是平台配置唯一入口。
- `src/config/env.ts` 是构建期 env 聚合入口；除 `env.ts` 与 `utils/logger.ts` 外，禁止直接读取 `import.meta.env`。
- 全局能力注册（`app.use/component/directive/provide`）仅允许在 `src/bootstrap/**` 或 `src/main.ts` 的 beforeMount 扩展中处理。

## 模块与路由红线

- 模块目录固定契约：`manifest.ts + module.ts + routes.ts`。
- 模块路由统一经 `router/registry.ts + router/assemble-routes.ts` 装配。
- 模块之间禁止直接相互 import；共享能力优先提升到 `services/types/utils` 或下沉 `packages/*`。
- 路由 meta 统一通过 `router/meta.ts` helper 生成，保持与 `admin-lite` 一致。

## API 与交互红线

- API 调用统一使用 `obHttp().get/post/...`，禁止 `const http = obHttp()`、`getHttp(){ return obHttp() }` 包装。
- `modules/**/api.ts` 禁止类型中转导出。
- 消息与确认统一走 `@one-base-template/ui`，禁止直接直连 `ElMessage` / `ElMessageBox`。
- CRUD 列表编排页禁止回退 `<el-table>`、`<el-dialog>`、`<el-upload>`，统一走 `ObVxeTable` / `ObCrudContainer` / 领域组件。
- 模板事件禁止内联箭头函数。

## 安全与签名红线

- `services/security/signature.ts` 必须继续复用 `@one-base-template/core` 的签名辅助方法。
- 页面/组件/store 禁止直接依赖 `infra/http`。

## 门禁与验收命令

```bash
pnpm -C apps/zfw-system-sfss typecheck
pnpm -C apps/zfw-system-sfss lint
pnpm -C apps/zfw-system-sfss lint:arch
pnpm -C apps/zfw-system-sfss test:run
pnpm -C apps/zfw-system-sfss build
```

涉及文档或规则变更时，追加：

```bash
pnpm -C apps/docs lint
pnpm -C apps/docs build
```
