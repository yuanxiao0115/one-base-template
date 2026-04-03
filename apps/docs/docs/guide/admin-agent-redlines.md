---
outline: [2, 3]
---

# Admin Agent 红线（公共组件与 CRUD）

## 背景

admin 侧已经沉淀了统一壳组件与交互工具（`ObCrudContainer`、`ObPageContainer`、`ObTableBox`、`ObTable`、`@one-base-template/ui` 等）。
后续迁移与重构必须优先复用这些公共能力，避免回退到分散实现，保证封装持续产生价值。

## 适用范围

- 目录：`apps/admin/src/modules/**`
- 场景：CRUD 迁移、页面重构、新增业务模块、列表页改造
- 规则主版本：`apps/admin/AGENTS.md`（本页为可读版说明）

## 强制红线

- `apps/admin/src/modules/**` 的 CRUD 列表编排页必须使用 `ObPageContainer + ObTableBox + ObTable`，禁止页面层直接使用 `el-table` 与 `ObVxeTable`。
- `ObTable` 迁移默认不传 `adaptive` 与 `header-cell-style`；仅在有明确证据证明默认布局/样式不满足时，才允许页级例外并补注释说明。
- `ObTableBox` 在 `:showSearchBar="false"` 场景仍需保留 `#buttons` 操作区，禁止隐藏搜索栏后丢失操作按钮。
- CRUD 新增/编辑/查看容器必须使用 `ObCrudContainer`，禁止在 CRUD 场景直接使用 `el-dialog` 或 `el-drawer` 编排。
- 业务消息提示统一使用 `@one-base-template/ui`，禁止在模块业务代码中直接使用 `ElMessage`。
- 业务确认交互统一使用 `@one-base-template/ui` 的 `obConfirm`/`tryConfirmWarn`，禁止直接使用 `ElMessageBox`。
- admin 启动层插件统一使用 `@one-base-template/ui/obtable`（`OneUiObTablePlugin`），禁止回退到全量 `OneUiPlugin` 以免把 `vxe` 运行时重新打入 admin 包体。
- CRUD 目录范式固定为 `list.vue + api.ts + types.ts + routes.ts`，禁止回退到 `page.vue` 与散乱接口分层。
- `api.ts` 禁止从 `./types` 做类型中转导出（`export type {...} from './types'`）；业务文件需要类型时直接从 `types.ts` 导入。
- `api.ts` / `api/client.ts` 禁止 `const http = obHttp()` 与 `getHttp` 包装；统一直接调用 `obHttp().get/post/...`。
- 导入上传优先使用 `ObImportUpload`；业务型 `el-upload` 仅允许在表单/领域组件内部使用，禁止在 `list.vue` 直接编排上传控件。
- `apps/admin/src/modules/**` 禁止放测试文件（`*.unit.test.ts` / `*.source.test.ts`）；模块测试统一放在 `apps/admin/tests/modules/**`，目录按模块镜像组织。
- `adminManagement` 工具分层固定为：单子模块使用放 `modules/adminManagement/<feature>/utils`；同域多子模块复用放 `modules/adminManagement/shared`；跨一级业务模块复用且无领域语义才上提 `apps/admin/src/utils`。

## 门禁脚本（可执行）

`pnpm -C apps/admin lint:arch` 现已覆盖以下检查：

- `modules/**` 禁止直接 import `ElMessage` / `ElMessageBox`
- `modules/**/list.vue` 禁止出现 `<el-table>`
- `modules/**/list.vue` 禁止出现 `<el-dialog>`
- `modules/**/list.vue` 禁止出现 `<el-upload>`
- `modules/**/list.vue` 禁止模板事件内联箭头函数（如 `@click="() => handleXxx(row)"`）
- `modules/**/api.ts` 禁止 `export type {...} from './types'` 类型中转
- `modules/**/api.ts` 禁止 `const http = obHttp()` 与 `getHttp(){ return obHttp() }` 包装写法

## 例外处理

- 仅在用户明确授权时允许突破红线。
- 任何例外都需要在对应模块 `AGENTS.md` 或本页追加“例外原因 + 生效范围 + 回收条件”。

## 开发自检清单

1. 当前 admin 列表是否采用 `ObPageContainer + ObTableBox + ObTable`？
2. 新增/编辑弹层是否采用 `ObCrudContainer`？
3. 消息与确认是否走统一入口（`message`、`obConfirm`）？
4. 上传是否满足“导入走 `ObImportUpload`，业务上传不出现在 `list.vue`”？
5. 是否通过 `pnpm -C apps/admin lint`、`pnpm -C apps/admin lint:arch`、`pnpm -C apps/admin typecheck`？

## UserManagement 可维护性补充（2026-03-20）

- `api.ts` 的类型定义遵循“够用即可”：仅跨文件复用的实体类型留在 `types.ts`；一次性请求参数（如 `{ id }`、`{ roleId }`）优先在 `api.ts` 内联，避免类型噪音。
- `ApiResponse` 统一从 `apps/admin/src/types/api.ts` 直接导入，禁止在模块 `types.ts` 中转。
- 删除已废弃且无调用链的接口与类型，避免“定义存在但业务不用”的误导（如 role-assign 中已切换到 `PersonnelSelector` 后遗留的本地联系人类型）。
- 组织管理员保存必须按差量提交（新增与移除分开计算），禁止把当前已选用户全量提交给新增接口。
- 远程搜索类表单组件必须提供失败提示与请求竞态保护，禁止静默失败。

## UserManagement 可读性基线（2026-03-20）

- 页面级 composable 只做编排：当一个 composable 同时承担 `table + editor + dialog + remote options/sidebar/data-source` 中 `3` 类及以上职责时，必须继续拆分，禁止形成 God composable。
- 业务代码类型标注遵循“够用即可”：局部变量和局部 `ref` 在语义清晰时优先类型推导，不强制写冗长泛型；跨文件公共契约、函数边界和复杂联合类型再补显式类型。
- 列表、选中态、弹窗表单态只能保留一个真实数据源；禁止继续新增 `safeDataList`、`safeSelectedList` 这类影子状态。
- `defineExpose` 仅用于暴露最小通用句柄（如 `validate`、`resetFields`、`clearValidate`）；禁止暴露业务动作、加载方法、回填方法。
- 父层禁止依赖 `nextTick + ref + defineExpose` 链式驱动子组件内部初始化；弹窗回填、远程选项预加载、已选值同步优先改为 `props` 驱动或交由子组件内部处理。
- 弹窗内的“选人/选账号”表单壳统一采用 `v-model + initialSelectedUsers + validate/resetFields/clearValidate` 契约；父层只传初始值与提交结果，不再直接调子组件加载/回填方法。
- wrapper 组件禁止做重复 DTO 归一化；共享类型只允许在单一边界做一次映射，禁止跨层反复把 `nickName/phone` 改写成 `title/subTitle`。
- 页面级弹窗状态 composable 统一返回 `refs`、`dialogs`、`actions` 场景对象；禁止把十几个 `ref` / `action` 平铺到 `<script setup>` 顶层。
- 当页面级场景对象内部仍包含 `ref/computed` 字段时，页面 `<script setup>` 必须先用 `reactive(...)` 投影成模板友好视图，再交给模板消费；禁止让模板直接承担嵌套 `Ref` 解包心智负担。
- 列表模板渲染可选枚举 / 布尔字段时，必须显式处理 `undefined/null` 并给出 `--`；禁止用 truthy / `Number()` 三元表达式把缺失值静默渲染成正常业务值。
- 页面 `<script setup>` 默认只解构 `table`、`editor`、`dialogs`、`sidebar`、`options` 等场景对象；禁止平铺暴露过多零散 action/ref。
- 命名与结构优先可读：函数命名保持“动词 + 名词”，同层避免 `do/handleData/processItem` 这类语义弱命名；一个 composable 承载职责超过 `3` 类时必须拆分。
- 低层远程搜索表单壳若不直接承担全局消息提示，则必须由调用方 composable 明确接管错误反馈；禁止既移除子组件提示、又不在上层补齐反馈，导致静默失败。
- 遵循根 `AGENTS.md` 的全仓规则：当表单 / DTO 字段契约已经明确时，禁止继续堆 `String(...)`、`Number(...)`、`value == null ? '' : ...` 这类过度防御性映射；admin 模块默认按当前契约直白赋值，只在真实协议边界做一次必要转换。

### 参考实现

- `RoleAssignMemberSelectForm` 现已收敛为 `initialSelectedUsers + form handles` 契约：父层只负责提供初始已选人员与提交结果，不再通过 `ref` 链式回填。
- `UserBindAccountForm` 现已收敛为 props 驱动初始化：`selectedMap` 仅保存当前已选项，父层通过 `initialSelectedUsers` 传入初始账号列表，不再暴露加载 / 回填方法。
- `useUserDialogState` 现已按 `refs / dialogs / actions` 场景返回；同类页面应复用“场景对象解构 + 页面只保留编排层 + 低层表单不直接承担全局错误提示”的基线，而不是逐字段照抄 `user/list.vue`。

## 横向推广补充（UserManagement 全模块，2026-03-23）

- `UserManagement` 各子模块（`org`、`position`、`role`、`role-assign`、`user`）已统一采用 `list.vue + api.ts + types.ts + routes.ts` 目录范式。
- 页面层默认按场景对象消费状态：`table`、`editor`、`dialogs`、`options`、`actions`，禁止回退为平铺式解构大量 `ref/action`。
- 当场景对象内部仍承载 `ref/computed` 字段时，`<script setup>` 必须先 `reactive(...)` 投影，再交由模板消费，降低模板层嵌套 `Ref` 心智负担。
- 本轮横向推广参考实现：
  - `apps/admin/src/modules/UserManagement/org/list.vue`
  - `apps/admin/src/modules/UserManagement/position/list.vue`
  - `apps/admin/src/modules/UserManagement/role/list.vue`
  - `apps/admin/src/modules/UserManagement/role-assign/list.vue`
  - `apps/admin/src/modules/UserManagement/user/list.vue`

## 横向推广补充（LogManagement，2026-03-23）

- 日志/详情类弹层（含抽屉与对话框）如果存在异步详情加载，必须增加“最新请求守卫”，并在关闭时失效旧请求，禁止旧响应回写当前详情态。
- 列表页操作列点击事件禁止在模板内写内联箭头函数（如 `@click="() => handleXxx(row)"`），统一使用直接调用（如 `@click="handleXxx(row)"`）。
- 基于 `useCrudPage/useEntityEditor` 的列表页必须把 `openCreate/openEdit/openDetail` 收口到显式 handler；并发打开短路统一由 `useEntityEditor` 内置 `opening/submitting` 保护兜底，页面层禁止重复堆叠同构 busy guard。

## AdminManagement 终轮走查补充（2026-03-25）

- 组织树 / 通讯录 / 选人类弹窗如果同时存在“初始化、进入节点、面包屑跳转、关键字搜索”等多条异步链路，必须给所有会回写当前节点、面包屑、已选态的链路补齐“最新请求守卫”；不能只守初始化请求。
- 模板内联箭头函数禁令不只适用于 `list.vue` 操作列；表单组件、弹窗组件、图标选择器等业务模板同样禁止 `@click="() => ..."`、`@close="() => ..."`、`@update:model-value="(value) => ..."` 这类闭包写法。
- 常规单删默认收口到 `tableOpt.remove` / `useCrudPage.table.remove`，行内只保留 `actions.remove(row)`；禁止在 composable 或页面里继续手写 `obConfirm + 删除接口 + onSearch(false)` 删除链路。
- 即使存在“新增子级 / 新增平级”这类多分支操作，也不要在 `ObActionButtons` 内叠 `el-dropdown`；应改为独立触发区或交给组件内置折叠能力。
- 即使在弹窗/子组件内部，模板也不要直接写 `crud.openCreate/openEdit/openDetail`；应先收口到局部 handler 或 `actions`，避免后续补前置校验、埋点、并发保护时继续改模板。
- 像用户这类包含“组织 + 岗位”嵌套结构的 `form.ts`，只允许保留数组关系与真实协议边界转换；字段契约已明确的字符串/数字/布尔值，禁止继续堆 `trimText`、`toNaturalNumber`、`String/Number/Boolean` 兜底。
