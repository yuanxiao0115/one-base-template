---
outline: [2, 3]
---

# Template Agent 红线（迁移基座）

## 背景

template 已从“最小静态示例”升级为“新子项目孵化 + 老项目迁移承接”的基座应用。  
为了避免后续迁移批次把基建能力再次打散，template 必须继承 admin 已验证的公共红线，并补充 template 专属约束。

## 适用范围

- 目录：`apps/template/**`
- 场景：template 基建升级、迁移基线维护、新子项目派生前改造
- 规则主版本：`apps/template/AGENTS.md`（本页为可读版说明）

## 继承 admin 的通用红线

- 业务消息提示统一使用 `@one-base-template/ui`，禁止在业务层直接使用 `ElMessage`。
- 业务确认交互统一使用 `@one-base-template/ui` 的 `obConfirm`，禁止直接使用 `ElMessageBox`。
- CRUD 列表编排页禁用 `el-table` / `el-dialog` / `el-upload`，统一走 `ObVxeTable` / `ObCrudContainer` / 领域组件。
- 模板事件禁止内联箭头函数（如 `@click="() => handleXxx(row)"`）。
- `api.ts` 禁止 `obHttp` 中间变量包装与 `types.ts` 类型中转导出。

## template 专属红线

### 启动骨架

- 启动链路固定为：`main.ts -> bootstrap/startup.ts -> bootstrap/index.ts -> mount`。
- Vue App / Pinia / Router 创建仅允许在 `src/bootstrap/**`。
- 全局安装动作（`app.use/component/directive/provide`）仅允许在 `src/bootstrap/**` 与 `main.ts(beforeMount)`。
- `bootstrap/index.ts` 必须先注册路由守卫，再安装 router。

### 模块契约与迁移边界

- 模块契约固定为 `manifest.ts + module.ts + routes.ts`。
- 路由装配必须通过 `router/registry.ts + router/assemble-routes.ts`。
- 禁止恢复 `src/router/routes.ts` 静态直拼模式。
- 模块间禁止直接相互 import，共享能力必须通过 `services/types/utils` 或下沉 `packages/*`。

### 配置与鉴权口径

- `src/config/platform-config.ts` 是平台配置唯一入口，禁止恢复 `public/platform-config.json`。
- 默认口径：`remote-single + token + backend=basic`。
- 必须支持 `default/basic` 双后端分支，后端差异只允许收口在 `config/**` 与 `bootstrap/{http,adapter}.ts`。

### HTTP 与安全边界

- `services/security/signature.ts` 必须继续复用 `@one-base-template/core` 的签名辅助方法。
- 页面/组件/store 禁止直接依赖 `infra/http`（template 已移除 infra 目录）。
- `import.meta.env` 只允许在 `config/env.ts` 与 `utils/logger.ts` 出现。

## 可执行门禁

```bash
pnpm -C apps/template lint:arch
```

门禁脚本：`scripts/check-template-arch.mjs`，当前覆盖：

- 启动骨架边界
- 全局安装边界
- 模块间依赖边界
- CRUD 与模板事件红线
- API 与类型中转红线

根命令串联：

```bash
pnpm lint:arch
```

## 例外机制

- 仅用户明确授权时允许突破红线。
- 例外必须落盘到 `apps/template/AGENTS.md` 或本页，记录：`原因 + 生效范围 + 回收条件`。

## 自检清单

1. 平台配置是否只在 `src/config/platform-config.ts` 维护？
2. 模块是否全部遵循 `manifest/module/routes` 契约？
3. 启动链路是否仍保持 bootstrap 分层与守卫先注册？
4. 是否执行并通过 `typecheck/lint/lint:arch/test:run/build`？
5. 是否同步更新 docs 与 `.codex` 证据链？
