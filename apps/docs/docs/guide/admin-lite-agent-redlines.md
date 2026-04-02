---
outline: [2, 3]
---

# admin-lite Agent 红线

## 背景

`admin-lite` 是后台快速起项目基座，不再承担强业务默认模块的落点。
本页用于说明 `apps/admin-lite` 的可读版红线；规则主版本在 `apps/admin-lite/AGENTS.md`。

## 适用范围

- 目录：`apps/admin-lite/**`
- 场景：基座维护、新后台项目派生、默认模块收敛、后台扩展开关治理
- 主版本：`apps/admin-lite/AGENTS.md`

## 基座定位红线

- 默认模块只允许保留：`home`、`admin-management`、`system-management`、`log-management`。
- 强业务模块默认不得回到基线；需要时只能做成可开关扩展。
- 不允许再把 `admin-lite` 写成“最小静态示例”或“当前业务后台成品”。

## 启动与配置红线

- 启动链路固定为：`main.ts -> bootstrap/startup.ts -> bootstrap/index.ts -> mount`。
- 平台配置唯一入口：`src/config/platform-config.ts`。
- UI 开关唯一入口：`src/config/ui.ts`。
- 登录页与顶栏文案从配置读取，禁止在页面中写死业务名称。

## 路由与模块红线

- 模块契约固定为：`manifest.ts + module.ts + routes.ts`。
- 路由统一经 `router/registry.ts + router/assemble-routes.ts` 装配。
- 禁止恢复运行时动态 `addRoute` 驱动主路由。
- 模块间禁止直接相互 import，共享能力优先通过 `services/types` 或下沉 `packages/*`。

## CRUD 与交互红线

- CRUD 列表编排页必须使用 `ObPageContainer + ObTableBox + ObTable`。
- CRUD 新增/编辑/查看必须使用 `ObCrudContainer`。
- 消息与确认统一使用 `@one-base-template/ui`，禁止直接使用 `ElMessage` / `ElMessageBox`。
- 模板事件禁止内联箭头函数。

## API 与类型红线

- `api.ts` / `api/client.ts` 禁止 `const http = obHttp()` 或 `getHttp()` 包装。
- 禁止在 `api.ts` 中做同源类型中转导出。
- 通用协议类型统一放 `src/types/api.ts`。
- `services/security/signature.ts` 必须继续复用 `@one-base-template/core` 的签名辅助方法。

## 可执行门禁

```bash
pnpm -C apps/admin-lite lint:arch
```

门禁脚本：`scripts/check-admin-lite-arch.mjs`

当前覆盖：

- 启动骨架边界
- 模块依赖边界
- CRUD 红线
- 模板事件红线
- API 与类型红线

## 自检清单

1. 默认模块是否仍只保留四类基线模块？
2. 新扩展是否为默认关闭并有独立文档说明？
3. 登录页、顶栏和 UI 开关是否仍统一收口在 `config/ui.ts`？
4. 是否执行并通过 `typecheck/lint/lint:arch/test:run/build`？
5. 是否同步更新 docs 与 `.codex` 证据链？
