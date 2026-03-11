---
outline: [2, 3]
---

# Admin Agent 红线（公共组件与 CRUD）

## 背景

admin 侧已经沉淀了统一壳组件与交互工具（`ObCrudContainer`、`ObPageContainer`、`ObTableBox`、`ObVxeTable`、`@one-base-template/ui` 等）。  
后续迁移与重构必须优先复用这些公共能力，避免回退到分散实现，保证封装持续产生价值。

## 适用范围

- 目录：`apps/admin/src/modules/**`
- 场景：CRUD 迁移、页面重构、新增业务模块、列表页改造
- 规则主版本：`apps/admin/AGENTS.md`（本页为可读版说明）

## 强制红线

- CRUD 列表编排页必须使用 `ObPageContainer + ObTableBox + ObVxeTable`，禁止使用 `el-table`。
- CRUD 新增/编辑/查看容器必须使用 `ObCrudContainer`，禁止在 CRUD 场景直接使用 `el-dialog` 或 `el-drawer` 编排。
- 业务消息提示统一使用 `@one-base-template/ui`，禁止在模块业务代码中直接使用 `ElMessage`。
- 业务确认交互统一使用 `@one-base-template/ui` 的 `obConfirm`/`tryConfirmWarn`，禁止直接使用 `ElMessageBox`。
- CRUD 目录范式固定为 `list.vue + api.ts + types.ts + routes.ts`，禁止回退到 `page.vue` 与散乱接口分层。
- `api.ts` 禁止从 `./types` 做类型中转导出（`export type {...} from './types'`）；业务文件需要类型时直接从 `types.ts` 导入。
- `api.ts` / `api/client.ts` 禁止 `const http = obHttp()` 与 `getHttp` 包装；统一直接调用 `obHttp().get/post/...`。
- 导入上传优先使用 `ObImportUpload`；业务型 `el-upload` 仅允许在表单/领域组件内部使用，禁止在 `list.vue` 直接编排上传控件。

## 门禁脚本（可执行）

`pnpm -C apps/admin lint:arch` 现已覆盖以下检查：

- `modules/**` 禁止直接 import `ElMessage` / `ElMessageBox`
- `modules/**/list.vue` 禁止出现 `<el-table>`
- `modules/**/list.vue` 禁止出现 `<el-dialog>`
- `modules/**/list.vue` 禁止出现 `<el-upload>`
- `modules/**/api.ts` 禁止 `export type {...} from './types'` 类型中转
- `modules/**/api.ts` 禁止 `const http = obHttp()` 与 `getHttp(){ return obHttp() }` 包装写法

## 例外处理

- 仅在用户明确授权时允许突破红线。
- 任何例外都需要在对应模块 `AGENTS.md` 或本页追加“例外原因 + 生效范围 + 回收条件”。

## 开发自检清单

1. 列表是否采用 `ObPageContainer + ObTableBox + ObVxeTable`？
2. 新增/编辑弹层是否采用 `ObCrudContainer`？
3. 消息与确认是否走统一入口（`message`、`obConfirm`）？
4. 上传是否满足“导入走 `ObImportUpload`，业务上传不出现在 `list.vue`”？
5. 是否通过 `pnpm -C apps/admin lint`、`pnpm -C apps/admin lint:arch`、`pnpm -C apps/admin typecheck`？
