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

## UserManagement 可维护性补充（2026-03-20）

- `api.ts` 的类型定义遵循“够用即可”：仅跨文件复用的实体类型留在 `types.ts`；一次性请求参数（如 `{ id }`、`{ roleId }`）优先在 `api.ts` 内联，避免类型噪音。
- `ApiResponse` 统一从 `apps/admin/src/shared/api/types.ts` 直接导入，禁止在模块 `types.ts` 中转。
- 删除已废弃且无调用链的接口与类型，避免“定义存在但业务不用”的误导（如 role-assign 中已切换到 `PersonnelSelector` 后遗留的本地联系人类型）。
- 组织管理员保存必须按差量提交（新增与移除分开计算），禁止把当前已选用户全量提交给新增接口。
- 远程搜索类表单组件必须提供失败提示与请求竞态保护，禁止静默失败。

## UserManagement 可读性基线（2026-03-20）

- 页面级 composable 只做编排：当一个 composable 同时承担 `table + editor + dialog + remote options/sidebar/data-source` 中 `3` 类及以上职责时，必须继续拆分，禁止形成 God composable。
- 列表、选中态、弹窗表单态只能保留一个真实数据源；禁止继续新增 `safeDataList`、`safeSelectedList` 这类影子状态。
- `defineExpose` 仅用于暴露最小通用句柄（如 `validate`、`resetFields`、`clearValidate`）；禁止暴露业务动作、加载方法、回填方法。
- 父层禁止依赖 `nextTick + ref + defineExpose` 链式驱动子组件内部初始化；弹窗回填、远程选项预加载、已选值同步优先改为 `props` 驱动或交由子组件内部处理。
- wrapper 组件禁止做重复 DTO 归一化；共享类型只允许在单一边界做一次映射，禁止跨层反复把 `nickName/phone` 改写成 `title/subTitle`。
- 页面 `<script setup>` 默认只解构 `table`、`editor`、`dialogs`、`sidebar`、`options` 等场景对象；禁止平铺暴露过多零散 action/ref。

### 反例提示

- `RoleAssignMemberSelectForm` 当前同时承担表单句柄暴露、`PersonnelSelector` 转接、已选用户二次映射，属于“看起来很薄、实际协议很多”的典型反例。
- `UserBindAccountForm` 当前同时维护 `userIds` 与 `selectedMap` 两套状态，并通过 `defineExpose` 暴露加载与回填方法，阅读时需要跨父子两层追状态流，不宜继续扩散。
