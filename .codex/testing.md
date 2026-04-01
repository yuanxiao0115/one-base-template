# 测试记录（testing）

> 说明：按时间记录本次改动相关的验证命令与结果（含失败信息与修复过程）。

## 2026-04-01（Portal 页面设置：Banner 与内容区间距支持负值）

- RED（先失败）：
  - `pnpm -C packages/portal-engine test:run src/schema/page-settings.test.ts src/renderer/PortalPreviewPanel.test.ts`
- 结果：
  - `src/schema/page-settings.test.ts` 新增断言失败：`settings.banner.contentSpacing` 为 `undefined`，说明协议尚未支持该字段。
  - `src/renderer/PortalPreviewPanel.test.ts` 新增断言失败：`.content-main` 不含 `margin-top: -24px`，说明渲染层仍是固定间距。

- GREEN / 回归：
  - `pnpm -C packages/portal-engine test:run src/schema/page-settings.test.ts src/renderer/PortalPreviewPanel.test.ts`
  - `pnpm -C packages/portal-engine typecheck`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - `packages/portal-engine`：2 个测试文件 `10/10` 通过；`typecheck` 通过。
  - `apps/docs`：`lint` 0 warning / 0 error；`build` 成功。

## 2026-04-01（菜单管理改造闭环：系统分栏 + 树形上级 + 类型约束）

- GREEN / 回归：
  - `pnpm -C apps/admin test:run:file -- tests/modules/adminManagement/menu/list.source.test.ts`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - `apps/admin`：菜单源码门禁测试 `3/3` 通过；`typecheck` 通过；`build` 通过。
  - `apps/admin`：`lint` 为 `0 error`，但有 `4` 条 `max-lines` warning（其中包含 `menu/composables/useMenuManagementPageState.ts` 行数超限告警）。
  - `apps/docs`：`lint` 0 warning / 0 error；`build` 成功。

## 2026-04-01（菜单管理补充：全量树复用）

- GREEN / 回归：
  - `pnpm -C apps/admin test:run:file -- tests/modules/adminManagement/menu/list.source.test.ts`
  - `pnpm -C apps/admin typecheck`
- 结果：
  - 菜单源码测试 `3/3` 通过。
  - `typecheck` 通过。
  - 断言新增“切系统走本地切片（`dataList.value = getSystemScopedTreeRows()`）”通过。

## 2026-04-01（菜单管理补充：系统表单拆分与抽屉规格）

- GREEN / 回归：
  - `pnpm -C apps/admin test:run:file -- tests/modules/adminManagement/menu/list.source.test.ts`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - `apps/admin`：菜单源码测试 `3/3` 通过；`typecheck` 通过。
  - `apps/admin`：`lint` 为 `0 error`，存在既有 `4` 条 `max-lines` warning（包含 `menu`、`org`、`user` 模块）。
  - `apps/docs`：`lint` 0 warning / 0 error；`build` 成功。

## 2026-04-01（菜单管理补充：系统列表编辑/删除 icon + 紧凑尺寸）

- GREEN / 回归：
  - `pnpm -C apps/admin test:run:file -- tests/modules/adminManagement/menu/list.source.test.ts`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - `apps/admin`：菜单源码测试 `3/3` 通过；`typecheck` 通过。
  - `apps/admin`：`lint` 为 `0 error`，存在既有 `4` 条 `max-lines` warning。
  - `apps/docs`：`lint` 0 warning / 0 error；`build` 成功。

## 2026-04-01（ObTable 性能第二批：列签名监听 + 树归一化引用复用 + tableKey 告警）

- GREEN / 回归：
  - `pnpm exec vp test run packages/ui/src/components/table/internal/table-helpers.test.ts packages/ui/src/table-source.test.ts packages/ui/src/components/table/internal/use-table-layout.test.ts packages/ui/src/components/table/internal/use-table-row-drag-sort.test.ts`
  - `pnpm exec vp test run packages/ui/src/table-source.test.ts packages/ui/src/index.test.ts packages/ui/src/plugin.test.ts packages/ui/src/components/table/internal/table-helpers.test.ts packages/ui/src/components/table/internal/use-table-layout.test.ts packages/ui/src/components/table/internal/use-table-row-drag-sort.test.ts`
  - `pnpm -C packages/ui typecheck`
  - `pnpm -C packages/ui lint`
  - `pnpm -C packages/ui build`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - `packages/ui`：6 个测试文件 `18/18` 通过；`typecheck/lint/build` 通过。
  - `apps/docs`：`lint` 0 warning / 0 error；`build` 成功。

## 2026-04-01（ObTable 性能优化：调度合并 + sticky 回收）

- RED（先失败）：
  - `pnpm exec vp test run packages/ui/src/components/table/internal/use-table-layout.test.ts packages/ui/src/table-source.test.ts`
- 结果：
  - `use-table-layout.test.ts` 新增“关闭 adaptive 后应移除 sticky”断言失败（真实暴露样式未回收问题）。
  - `table-source.test.ts` 新增调度函数断言失败（实现尚未收敛初始化链路）。

- GREEN / 回归：
  - `pnpm exec vp test run packages/ui/src/components/table/internal/use-table-layout.test.ts packages/ui/src/table-source.test.ts packages/ui/src/components/table/internal/use-table-row-drag-sort.test.ts`
  - `pnpm exec vp test run packages/ui/src/table-source.test.ts packages/ui/src/index.test.ts packages/ui/src/plugin.test.ts packages/ui/src/components/table/internal/use-table-layout.test.ts packages/ui/src/components/table/internal/use-table-row-drag-sort.test.ts`
  - `pnpm -C packages/ui typecheck`
  - `pnpm -C packages/ui lint`
  - `pnpm -C packages/ui build`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - `packages/ui`：5 个测试文件 `16/16` 通过；`typecheck/lint/build` 通过。
  - `apps/docs`：`lint` 0 warning / 0 error；`build` 成功。

## 2026-03-31（pure-admin-table 能力回灌：filterIconSlot / expandSlot）

- RED（先失败）：
  - `pnpm exec vp test run packages/ui/src/table-source.test.ts`
- 结果：
  - 新增源码断言后，`packages/ui/src/table-source.test.ts` 在“筛选图标与展开插槽契约”用例失败，确认当前实现缺少 `filterIconSlot` / `expandSlot` 能力与类型定义。

- GREEN / 回归：
  - `pnpm exec vp test run packages/ui/src/table-source.test.ts packages/ui/src/index.test.ts packages/ui/src/plugin.test.ts`
  - `pnpm -C packages/ui typecheck`
  - `pnpm -C packages/ui lint`
  - `pnpm -C packages/ui build`
  - `pnpm -C apps/admin test:run:file -- src/modules/LogManagement/login-log/list.source.test.ts src/modules/LogManagement/sys-log/list.source.test.ts src/modules/adminManagement/menu/list.source.test.ts src/modules/adminManagement/org/list.source.test.ts src/modules/adminManagement/role/list.source.test.ts src/modules/adminManagement/role-assign/list.source.test.ts`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - `packages/ui`：3 个测试文件共 11 条断言通过；`typecheck`、`lint`、`build` 全通过。
  - `apps/admin`：6 个源码测试文件共 8 条断言通过；`typecheck` 与 `build` 通过。
  - `apps/docs`：`lint` 0 warning / 0 error，`build` 成功。

## 2026-03-31（ObTable 命名与样式收口）

- RED（先失败）：
  - `pnpm exec vp test run packages/ui/src/table-source.test.ts`
- 结果：
  - `packages/ui/src/table-source.test.ts` 初次失败，明确暴露两类问题：
    - `Table.vue` 仍保留 `name: 'ElementTable'` 与 `ob-element-table` 包装类名；
    - 分页 total 偏移与滚动条样式 token 未对齐本轮视觉要求。

- GREEN / 回归：
  - `pnpm exec vp test run packages/ui/src/table-source.test.ts packages/ui/src/index.test.ts packages/ui/src/plugin.test.ts`
  - `pnpm -C packages/ui typecheck`
  - `pnpm -C packages/ui lint`
  - `pnpm -C packages/ui build`
  - `pnpm -C apps/admin test:run:file -- src/modules/LogManagement/login-log/list.source.test.ts src/modules/adminManagement/menu/list.source.test.ts src/modules/adminManagement/org/list.source.test.ts src/modules/adminManagement/role/list.source.test.ts src/modules/adminManagement/role-assign/list.source.test.ts`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - `packages/ui`：`table-source/index/plugin` 三个测试文件共 `9` 条断言通过；`typecheck`、`lint`、`build` 均通过。
  - `apps/admin`：5 个页面源码测试通过；`typecheck` 与 `build` 通过。
  - `apps/docs`：`lint` 0 warning / 0 error，`build` 成功。
  - 过程中修复 1 个真实类型问题：`ObTable.pagination` 已直接对齐 `@one-base-template/core` 的 `PaginationConfig`，消除页面层 `PaginationConfig -> TablePagination` 不兼容报错。

## 2026-03-31（操作日志切换 ObTable）

- RED（先失败）：
  - `pnpm -C apps/admin test:run:file -- src/modules/LogManagement/sys-log/list.source.test.ts`
- 结果：
  - 新增的 `sys-log` 源码测试初次失败，明确暴露页面仍使用 `<ObVxeTable>`。

- GREEN / 回归：
  - `pnpm -C apps/admin test:run:file -- src/modules/LogManagement/login-log/list.source.test.ts src/modules/LogManagement/sys-log/list.source.test.ts`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - `apps/admin`：登录日志与操作日志源码测试 `2/2` 通过；`typecheck` 与 `build` 通过。
  - `apps/docs`：`lint` 0 warning / 0 error，`build` 成功。

## 2026-03-31（admin-lite README 快速使用手册补充）

- GREEN / 回归：
  - `pnpm -C apps/admin-lite lint`
- 结果：
  - `apps/admin-lite`：`lint` 通过（0 warning / 0 error）。

## 2026-03-31（historyMode + 统一前缀配置）

- GREEN / 回归：
  - `pnpm -C packages/core test:run src/config/platform-config.test.ts`
  - `pnpm -C packages/core typecheck`
  - `pnpm -C apps/admin test:run:file -- tests/config/platform-config.unit.test.ts`
  - `pnpm -C apps/admin test:run:file -- tests/config/env.unit.test.ts`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/admin-lite test:run:file -- tests/config/platform-config.unit.test.ts`
  - `pnpm -C apps/admin-lite test:run:file -- tests/config/env.unit.test.ts`
  - `pnpm -C apps/admin-lite typecheck`
  - `pnpm -C apps/admin-lite build`
  - `pnpm -C apps/portal typecheck`
  - `pnpm -C apps/portal build`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - `packages/core`：`platform-config` 定向测试通过（11/11），`typecheck` 通过。
  - `apps/admin`：`platform-config` 与 `env` 定向测试通过（2/2、3/3），`typecheck` 与 `build` 通过。
  - `apps/admin-lite`：`platform-config` 与 `env` 定向测试通过（2/2、3/3），`typecheck` 与 `build` 通过。
  - `apps/portal`：`typecheck` 与 `build` 通过。
  - `apps/docs`：`lint` 0 warning / 0 error，`build` 成功。
  - 说明：`apps/zfw-system-sfss` 已被删除，本轮验证不包含该应用。

## 2026-03-31（tokenKey 多子项目污染修复）

- GREEN / 回归：
  - `pnpm -C packages/core test:run src/config/platform-config.test.ts`
  - `pnpm -C packages/core typecheck`
  - `pnpm -C apps/admin test:run:file -- tests/config/platform-config.unit.test.ts`
  - `pnpm -C apps/admin-lite test:run:file -- tests/config/platform-config.unit.test.ts`
  - `pnpm -C apps/zfw-system-sfss test:run tests/config/platform-config.unit.test.ts`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin-lite typecheck`
  - `pnpm -C apps/zfw-system-sfss typecheck`
  - `pnpm -C apps/portal typecheck`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - `packages/core`：配置解析测试 `10` 条通过，`typecheck` 通过。
  - `apps/admin`、`apps/admin-lite`、`apps/zfw-system-sfss`：定向配置测试均通过，`typecheck` 均通过。
  - `apps/portal`：`typecheck` 通过。
  - `apps/docs`：`lint` 0 warning / 0 error，`build` 成功。

## 2026-03-30（公文设计器 Phase 1 Univer 画布收口）

- GREEN / 回归：
  - `pnpm -C packages/document-form-engine test:run -- tests/designer-canvas-source.test.ts tests/designer-controller.test.ts tests/designer-state.test.ts tests/designer-workbench-source.test.ts tests/schema-v3.test.ts`
  - `pnpm -C packages/document-form-engine typecheck`
  - `pnpm -C apps/admin test:run:file -- src/modules/DocumentFormManagement/designPage/DocumentFormDesignerPage.source.test.ts src/modules/DocumentFormManagement/services/template-service.unit.test.ts`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 浏览器回归：
  - 自动化：`agent-browser --session codex`
  - 结果：
    - 进入 `/document-form/design` 正常，交互快照只出现 `画布设置 / 组件设置` 两个右侧面板入口。
    - 操作前 `placements === 2`，且 `designer.univerSnapshot.__kind === 'ob-univer-snapshot'`。
    - 通过页面内 `Univer` 实例将 A1 背景设置为 `#ff0000` 并保存快照，再点击“日期”后 `placements === 3`，背景未回滚。
    - 刷新后仍停留 `/document-form/design`，`placements === 3`，A1 背景仍为 `#ff0000`。
    - 切到“组件设置”后可看到字段清单与“删除字段”按钮；删除后 `placements` 从 `3` 回到 `2`，页面错误列表为空。
- 结果：
  - `document-form-engine`：定向测试命令通过，runner 输出 `10` 个测试文件、`31` 条测试通过，`typecheck` 通过。
  - `apps/admin`：2 个定向测试文件共 `5` 条测试通过，`typecheck` 通过。
  - `apps/docs`：`lint` 0 warning / 0 error，`build` 成功。

## 2026-03-30（公文设计器控制层重构）

- RED（先失败）：
  - `pnpm -C packages/document-form-engine test:run -- tests/designer-controller.test.ts tests/designer-state.test.ts`
  - 结果：
    - `useDocumentDesignerController` 文件不存在。
    - `useDocumentDesignerState().syncSelectionState` 不存在。
- GREEN / 回归：
  - `pnpm -C packages/document-form-engine test:run -- tests/designer-controller.test.ts tests/designer-state.test.ts tests/designer-workbench-source.test.ts tests/schema-v3.test.ts`
  - `pnpm -C packages/document-form-engine typecheck`
  - `pnpm -C apps/admin test:run:file -- src/modules/DocumentFormManagement/services/template-service.unit.test.ts`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 浏览器回归：
  - `agent-browser --session codex`
  - 结果：
    - 注入本地登录态后进入 `/document-form/design` 正常。
    - 点击“文本”两次后，`ob_document_form_template_store_v1.draft.template.placements.length === 2`。
    - 通过页面内 `Univer` 实例把 A1 背景色设为 `#ff0000` 并保存快照，再插入字段后颜色保持 `#ff0000`，未再出现 `getConfig`。
    - 刷新后草稿仍在，进入 `/document-form/preview` 后 `window.__errLogs=[]`。
- 结果：
  - `document-form-engine` 定向测试与 `typecheck` 通过。
  - `apps/admin` 定向测试与 `typecheck` 通过。
  - `apps/docs lint / build` 通过。

## 2026-03-28（公文表单设计器 v3：Sheet-first 收口）

- RED（先失败）：
  - `pnpm -C packages/document-form-engine test:run -- tests/designer-state.test.ts`
  - 结果：
    - `selectPlacement()` 未同步当前选区。
    - `removeSelectedPlacement()` 缺失或未清理 placement 关联状态。
- GREEN / 回归：
  - `pnpm -C packages/document-form-engine test:run -- tests/designer-state.test.ts`
  - `pnpm -C packages/document-form-engine typecheck`
  - `pnpm -C packages/document-form-engine test:run`
  - `pnpm -C packages/document-form-engine build`
  - `pnpm -C apps/admin test:run:file -- src/modules/DocumentFormManagement/engine/register.unit.test.ts`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - `document-form-engine`：`typecheck / test / build` 通过。
  - `apps/admin`：`register.unit.test.ts` 与 `typecheck` 通过。
  - `apps/admin lint`：0 error，保留 1 条既有 warning（`OrgManagerDialog.vue` `max-lines`）。
  - `apps/docs`：`lint / build` 通过。
  - `apps/docs build` 有 `PLUGIN_TIMINGS` 性能提示，但不影响构建成功。

## 2026-03-27（公文表单引擎包化：代码与集成）

- 命令：
  - `pnpm install`
  - `pnpm -C packages/document-form-engine typecheck`
  - `pnpm -C packages/document-form-engine lint`
  - `pnpm -C packages/document-form-engine test:run`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin test:run:file -- src/modules/DocumentFormManagement/engine/register.unit.test.ts tests/config/platform-config.unit.test.ts`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
  - `pnpm typecheck`
  - `pnpm lint`
  - `pnpm build`
  - `pnpm verify`
- 结果：
  - 新增共享包 `packages/document-form-engine` 的 `typecheck/lint/test:run` 通过。
  - admin 新模块 `DocumentFormManagement` 的定向 typecheck 与单测通过。
  - docs lint/build 通过。
  - 根 `pnpm typecheck`、`pnpm lint`、`pnpm build` 通过（`lint` 仅保留既有 warning：`OrgManagerDialog.vue` 的 `max-lines`）。
  - 根 `pnpm verify` 未通过，阻塞在既有命名门禁（与本次改动无关）：
    - `apps/admin/src/router/route-policy.ts:24` `readActivePath`
    - `apps/admin/src/router/route-policy.ts:35` `collectRoutePolicyEntries`
    - `apps/admin/src/router/route-policy.ts:60` `sortByPathAndName`
  - 处理动作：未修改无关历史文件，保留现状并在验证记录中显式标注。

## 2026-03-27（公文表单引擎包化：文档与记录同步）

- 本轮仅修改：
  - `apps/docs/docs/guide/document-form-designer.md`
  - `apps/docs/docs/.vitepress/config.ts`
  - `apps/docs/docs/guide/architecture.md`
  - `.codex/operations-log.md`
  - `.codex/testing.md`
  - `.codex/verification.md`
- 预期：
  - 待主线代码落地后执行 `pnpm -C apps/docs lint`
  - 待主线代码落地后执行 `pnpm -C apps/docs build`
  - 待主线代码落地后由主线统一执行 `pnpm verify`
- 结果：
  - 当前子任务未单独执行命令，不声明通过结论
  - 文档内容已按“包化边界 + 待验证”口径同步

## 2026-02-11（基线）

- 预期：`pnpm typecheck` / `pnpm lint` / `pnpm build` 全绿
- 结果：
  - `pnpm typecheck`：通过（4/4 成功，turbo cache hit）
  - `pnpm lint`：通过（4/4 成功，turbo cache hit）
  - `pnpm build`：通过（admin 成功；其余包未定义 build 脚本则 turbo 自动跳过）

## 2026-02-11（移植登录模块后）

- 命令：
  - `pnpm typecheck`
  - `pnpm lint`
  - `pnpm build`
- 结果：全部通过

- 开发态冒烟（sczfw mock）：
  - 以 `VITE_BACKEND=sczfw` 启动 `pnpm -C apps/admin dev`
  - 验证 `/cmict/portal/getLoginPage`、`/cmict/auth/captcha/*`、`/cmict/auth/login`、`/cmict/auth/token/verify`、`/cmict/admin/permission/my-tree` mock 响应正常

## 2026-02-11（Layout/Menu 多布局）

- 命令：
  - `pnpm typecheck`
  - `pnpm lint`
  - `pnpm -C packages/ui lint`（修复属性顺序 warning 后复跑）
  - `pnpm build`
- 结果：全部通过

## 2026-02-11（菜单 icon: minio id 缓存）

- 命令：
  - `pnpm typecheck`
  - `pnpm lint`
  - `pnpm build`
- 结果：全部通过

## 2026-02-11（修复 top-side 顶部系统设计：对齐 permissionCode 多系统）

- 命令：
  - `pnpm -w typecheck`
  - `pnpm -w lint`
  - `pnpm -w build`
- 结果：全部通过

## 2026-02-11（新增文档站点 apps/docs：VitePress）

- 命令：
  - `pnpm install`
  - `pnpm -w typecheck`
  - `pnpm -w lint`
  - `pnpm -w build`
- 结果：全部通过（build 包含 `apps/admin` + `apps/docs`）

## 2026-02-11（main.ts 启动逻辑拆分：入口瘦身）

- 命令：
  - `pnpm -w typecheck`
  - `pnpm -w lint`
  - `pnpm -w build`
- 结果：全部通过

## 2026-02-11（拆分 core install 配置：theme/sso/systems）

- 命令：
  - `pnpm -w typecheck`
  - `pnpm -w lint`
  - `pnpm -w build`
- 结果：全部通过

## 2026-02-12（UI 风格对齐 + Tailwind v4 扫描修复）

- 命令：
  - `pnpm -w typecheck`
  - `pnpm -w lint`
  - `pnpm -w build`
  - `pnpm -C apps/docs build`
- 结果：全部通过

## 2026-02-12（系统选择持久化 + 存储降级）

- 命令：
  - `pnpm -w typecheck`
  - `pnpm -w lint`
  - `pnpm -w build`
- 结果：全部通过

## 2026-02-12（修复刷新时 systemCode 被覆盖）

- 命令：
  - `pnpm -w typecheck`
  - `pnpm -w lint`
  - `pnpm -w build`
- 结果：全部通过

## 2026-02-12（Tag/Tabs：同 path 不同参数、多系统分片持久化、退出清空）

- 命令：
  - `pnpm -w typecheck`
  - `pnpm -w lint`
  - `pnpm -w build`
- 结果：全部通过

## 2026-02-14（门户设计器：PC Sprint 1 骨架）

- worktree：`/Users/haoqiuzhi/.config/superpowers/worktrees/one-base-template/codex/portal-pc-sprint1`
- 命令：
  - `pnpm install`
  - `pnpm -w typecheck`
  - `pnpm -w lint`
  - `pnpm -w build`
- 结果：全部通过

## 2026-02-14（门户设计器：PC Sprint 2 页面编辑器 + 预览渲染）

- worktree：`/Users/haoqiuzhi/.config/superpowers/worktrees/one-base-template/codex/portal-pc-sprint1`

## 2026-03-09（admin main.ts 入口瘦身）

- 命令：
  - `pnpm -C apps/admin exec vitest run src/bootstrap/__tests__/main-source.test.ts src/bootstrap/__tests__/style-entries-source.test.ts src/bootstrap/__tests__/entry.test.ts`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin build`
- 结果：全部通过

## 2026-03-09（admin startup.ts 二次瘦身）

- RED（先失败）：
  - `pnpm -C apps/admin exec vitest run src/bootstrap/__tests__/startup-source.test.ts`
  - 结果：失败（startup.ts 仍直接包含环境读取与挂载细节）
- GREEN（改造后）：
  - `pnpm -C apps/admin exec vitest run src/bootstrap/__tests__/startup-source.test.ts src/bootstrap/__tests__/main-source.test.ts src/bootstrap/__tests__/style-entries-source.test.ts src/bootstrap/__tests__/entry.test.ts`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：全部通过

## 2026-03-09（admin 单启动链路净化）

- RED（先失败）：
  - `pnpm -C apps/admin exec vitest run src/bootstrap/__tests__/main-single-bootstrap.test.ts`
  - 结果：失败（`main.ts` 仍包含 `dataset.oneOs` 与双启动分流逻辑）
- GREEN / 回归：
  - `pnpm -C apps/admin exec vitest run src/bootstrap/__tests__/main-single-bootstrap.test.ts src/bootstrap/__tests__/style-entries-source.test.ts src/__tests__/manual-chunks.test.ts`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
  - `pnpm -C apps/admin preview --host 127.0.0.1 --port 5183`
  - 浏览器冒烟：
    - `/login`：可见账号/密码/登录按钮
    - `/sso`：可见“返回登录页”按钮，无启动失败页
- 结果：全部通过

## 2026-03-25（admin 未登录放行首页修复）

- RED（先失败）：
  - `pnpm -C packages/core test:run -- src/stores/auth.test.ts`
  - 结果：失败，`ensureAuthed()` 在“token 缺失 + 缓存用户存在”时仍返回 `true`，复现了未登录放行问题。
- GREEN（修复后回归）：
  - `pnpm -C packages/core test:run -- src/stores/auth.test.ts`
  - `pnpm -C apps/admin test:run -- tests/router/assemble-routes.unit.test.ts`
  - `pnpm -C apps/docs typecheck`
  - `pnpm -C apps/docs build`
  - `pnpm verify`
- 结果：
  - `packages/core` 回归测试通过（实际跑全包，共 `23/23` 测试文件、`102/102` 用例通过）。
  - `apps/admin` 路由装配测试通过（实际跑全包，共 `45/45` 测试文件、`130/130` 用例通过）。
  - `apps/docs typecheck/build` 通过。
  - `pnpm verify` 通过。
  - 备注：`apps/admin` lint 仍有 `OrgManagerDialog.vue` 的 `max-lines` warning，但不阻断门禁。

## 2026-03-25（admin 首屏守卫注册时序修复）

- RED（先失败）：
  - `pnpm -C apps/admin test:run -- tests/bootstrap/index.unit.test.ts`
  - 结果：失败，`setupRouterGuards` 调用顺序晚于 `app.use(router)`，证明首屏导航未受守卫保护。
- 浏览器复现：
  - Safari 访问 `http://localhost:5173/`
  - 执行 `localStorage.removeItem('token'); sessionStorage.clear(); location.href='/'`
  - 结果：修复前落到 `/home/index`，且页面右上角显示“未登录”。
- GREEN（修复后回归）：
  - `pnpm -C apps/admin test:run -- tests/bootstrap/index.unit.test.ts`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin build`
  - 浏览器复测：Safari 清掉 `token` 后重新访问 `/`，最终落到 `/login?redirect=/home/index`
- 结果：
  - 单测、`typecheck`、`build` 通过。
  - `lint` 通过，仍保留 `OrgManagerDialog.vue` 的 1 条 `max-lines` warning（非阻断）。

## 2026-03-25（admin 已登录访问 /login 拦截修复）

- 命令：
  - `pnpm -C packages/core test:run -- src/router/guards.test.ts`
  - `pnpm -C apps/admin test:run -- tests/bootstrap/index.unit.test.ts tests/router/assemble-routes.unit.test.ts`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - 守卫与 admin 路由相关测试通过。
  - 文档 lint/build 通过。
  - 运行时有 `--localstorage-file` warning，为测试环境提示，不影响结果。
- 命令：
  - `pnpm -w typecheck`
  - `pnpm -w lint`（存在少量 warning，不影响通过）
  - `pnpm -w build`
  - `pnpm -C apps/docs build`
- 结果：全部通过

## 2026-02-24（门户设计器：PC Designer 新建页面并直达编辑）

- worktree：`/Users/haoqiuzhi/.config/superpowers/worktrees/one-base-template/codex/portal-pc-sprint1`
- 命令：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -w typecheck`
  - `pnpm -w lint`（存在少量 warning，不影响通过）
  - `pnpm -w build`
  - `pnpm -C apps/docs build`
- 结果：全部通过

## 2026-02-24（门户设计器：PC Designer 页面树操作增强：属性/隐藏/删除）

- worktree：`/Users/haoqiuzhi/.config/superpowers/worktrees/one-base-template/codex/portal-pc-sprint1`
- 命令：
  - `pnpm -w typecheck`
  - `pnpm -w lint`（存在少量 warning，不影响通过）
  - `pnpm -w build`
  - `pnpm -C apps/docs build`
- 结果：全部通过

## 2026-02-24（门户模板列表：表格版）

- worktree：`/Users/haoqiuzhi/.config/superpowers/worktrees/one-base-template/codex/portal-pc-sprint1`
- 命令：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -w typecheck`
  - `pnpm -w lint`（admin 存在 3 个历史 warning，不影响通过）
  - `pnpm -w build`
- 结果：全部通过

## 2026-02-24（修复 portal 新路径导致 403：activePath 兼容）

- worktree：`/Users/haoqiuzhi/.config/superpowers/worktrees/one-base-template/codex/portal-pc-sprint1`
- 命令：
  - `pnpm -C apps/admin typecheck`
- 结果：通过

## 2026-02-24（放宽路由守卫：skipMenuAuth）

- worktree：`/Users/haoqiuzhi/.config/superpowers/worktrees/one-base-template/codex/portal-pc-sprint1`
- 命令：
  - `pnpm -w typecheck`
  - `pnpm -w lint`（admin 存在 3 个历史 warning，不影响通过）
  - `pnpm -w build`
- 结果：全部通过

## 2026-02-24（本地字体乱码配置排查）

- 命令：
  - `locale`
  - `defaults read -g AppleLocale`

## 2026-03-25（adminManagement 末轮收口）

- 定向回归：
  - `pnpm -C apps/admin exec vp test run --config vitest.config.ts src/modules/adminManagement/user/form.unit.test.ts src/modules/adminManagement/user/components/UserBindAccountForm.unit.test.ts src/modules/adminManagement/org/components/OrgManagerDialog.unit.test.ts`
  - 结果：`3` 个测试文件、`6` 个用例全部通过。
- 类型检查：
  - `pnpm -C apps/admin typecheck`
  - 结果：通过。
- lint：
  - `pnpm -C apps/admin lint`
  - 结果：通过；仅剩 `apps/admin/src/modules/adminManagement/org/components/OrgManagerDialog.vue` 的 `max-lines` warning。
- 构建：
  - `pnpm -C apps/admin build`
  - 结果：通过。
- 包体预算：
  - `pnpm check:admin:bundle`
  - 结果：通过。
- 架构门禁：
  - `pnpm -C apps/admin lint:arch`
  - 结果：失败，但失败点仅为写集外历史问题：
    - `apps/admin/src/bootstrap/material-image-service-worker.ts` 存在 4 处 `import.meta.env` 直读。

## 2026-03-25（bootstrap lint:arch 历史项收口）

- 命令：
  - `pnpm -C apps/admin lint:arch`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin build`
  - `pnpm check:admin:bundle`
- 结果：
  - 全部通过。

## 2026-03-18（PortalManagement P0 优化）

- 命令：
  - `pnpm -C packages/portal-engine typecheck`
  - `pnpm -C packages/portal-engine run test:run -- src/materials/useRendererMaterials.test.ts src/services/page-settings.test.ts src/workbench/template-workbench-controller.test.ts src/workbench/template-workbench-page-controller.test.ts src/workbench/page-editor-controller.test.ts`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm check:admin:bundle`
- 结果：
  - `portal-engine typecheck`：通过
  - `portal-engine test:run`：通过（26 files / 98 tests）
  - `apps/admin typecheck`：通过
  - `apps/admin lint`：通过（0 error，存在 1 条历史 warning：`UserManagement/role-assign/composables/useRoleAssignPageState.ts` max-lines）
  - `check:admin:bundle`：通过（startup dependency map js gzip = 131.5 KiB / 预算 820 KiB）

## 2026-03-11（门户配置工作台 UI 全量重构）

- 命令：
  - `pnpm -C apps/admin build`
- 结果：
  - 通过（vite build 成功，`admin-portal` 产物正常输出）

## 2026-03-11（门户设计器文档同步）

- 命令：
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - 通过（文档站 lint 与构建均成功）

## 2026-03-11（Portal Designer 工具栏收窄 + 编辑图标化）

- 命令：
  - `pnpm -C apps/admin build`
- 结果：
  - 通过（工具栏样式调整后构建正常）

## 2026-03-11（Portal Designer 目录收敛）

- 命令：
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - 全部通过（目录迁移与引用修正后无构建回归）

## 2026-03-11（Portal Designer 按业务域拆分目录）

- 命令：
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - 全部通过（`portal-design` / `page-design` 拆分后无回归）

## 2026-03-11（Portal Designer 去除 designer 中间层）

- 命令：
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - 全部通过（目录减深后无回归）
  - `defaults read -g AppleLanguages`
  - `defaults read com.apple.Terminal StringEncodings`
  - `defaults read com.googlecode.iterm2 | rg 'Normal Font|Non Ascii Font|Character Encoding|Use Non-ASCII Font'`
  - `rg 'font|encoding|unicode|files.encoding' ~/Library/Application\\ Support/Code*/User/settings.json`
  - `system_profiler SPFontsDataType | rg 'Meslo|Hiragino|PingFang|Noto|Source Han'`
- 结果：
  - 编码链路为 UTF-8（`LANG/LC_ALL/LC_CTYPE` 均为 UTF-8）
  - iTerm2/VSCode 终端均使用 Meslo 系列字体（中文覆盖可能不足）

## 2026-02-24（管理端配置收敛：platform-config 运行时配置）

- 命令：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs build`
  - `pnpm -C apps/admin dev --host 127.0.0.1 --port 5173`（手工启动冒烟，因端口占用自动切到 5174）
- 结果：
  - `typecheck`：通过
  - `admin build`：通过
  - `docs build`：通过
  - `dev`：启动成功（`http://127.0.0.1:5174/`），手工中断退出

## 2026-02-24（Layout 头部双样式 + side/top-side 结构统一）

- 命令：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs build`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin dev --host 127.0.0.1 --port 5173`（端口占用自动切到 5174）
- 结果：
  - `typecheck`：通过
  - `admin build`：通过
  - `docs build`：通过
  - `lint`：通过（存在 3 条历史 warning，非本次改动引入）
  - `dev`：启动成功（`http://127.0.0.1:5174/`），手工中断退出

## 2026-02-24（Layout 结构微调：TabsBar 回到内容区顶部）

- 命令：
  - `pnpm -C apps/admin typecheck`

  - `pnpm -C apps/admin build`

- 结果：
  - `typecheck`：通过
  - `admin build`：通过

## 2026-02-24（Tabs 栏样式重构：移除 el-tabs）

- 命令：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs build`
- 结果：
  - `typecheck`：通过
  - `lint`：通过（存在 3 条历史 warning，非本次改动引入）
  - `admin build`：通过
  - `docs build`：通过

## 2026-02-24（Tabs 视觉参数微调：圆角/字号/内边距）

- 命令：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin build`
- 结果：
  - `typecheck`：通过
  - `admin build`：通过

## 2026-02-24（@one/tag 迁源码集成 + tabs 全量替换）

- 命令：
  - `pnpm install`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs build`
- 结果：
  - `install`：通过（workspace 新增 `@one/tag`、`sass` 依赖完成）
  - `typecheck`：通过
  - `admin build`：通过（存在 Sass `@import` deprecation warning，不阻断构建）
  - `docs build`：通过
- 运行态冒烟：
  - `pnpm -C apps/admin dev --host 127.0.0.1 --port 5173`
  - 结果：启动成功，端口占用自动切到 `http://127.0.0.1:5174/`，手工中断退出
- 追加验证（样式子路径解析修复）：
  - `pnpm -C apps/admin build`：通过
  - `pnpm -C apps/admin dev --host 127.0.0.1 --port 5173`：启动成功（自动切到 5174）
- Sass 警告修复验证：
  - `pnpm -C apps/admin build`：通过，`@import` deprecation warning 已消失。

## 2026-02-25（TopBar 配置驱动 + side/top-side 合并）

- 命令：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs build`
- 结果：全部通过

## 2026-02-25（移除 top-side 历史兼容）

- 命令：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs build`
- 结果：全部通过

## 2026-02-25（Layout 改为代码配置，运行时配置剥离）

- 命令：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs build`
- 结果：全部通过

## 2026-02-25（系统菜单 children 缺失时不落本地缓存）

- 命令：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs build`
- 结果：全部通过

## 2026-02-25（多系统过滤修正 + 404 返回上一页）

- 命令：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs build`
- 结果：全部通过

## 2026-02-25（404 导航改为 push 语义）

- 命令：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs build`
- 结果：全部通过

## 2026-02-25（TopBar 系统菜单改为 el-menu 样式）

- 命令：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs build`
- 结果：全部通过

## 2026-02-25（主题体系改造：内置主题 + 自定义主题 + 命名空间持久化）

- 命令：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs build`
- 结果：
  - `typecheck`：通过
  - `lint`：通过（存在 3 条历史 warning，非本次改动引入）
  - `admin build`：通过
  - `docs build`：通过

## 2026-02-25（主题入口改为头像下拉弹窗 + 顶部菜单激活色跟随主题）

- 命令：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs build`
- 结果：
  - `typecheck`：通过
  - `lint`：通过（存在 3 条历史 warning，非本次改动引入）
  - `admin build`：通过
  - `docs build`：通过

## 2026-02-25（主题收敛：移除 sczfw）

- 命令：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs build`
- 结果：
  - `typecheck`：通过
  - `admin build`：通过
  - `docs build`：通过

## 2026-02-25（主题下沉 core + admin 注册自定义主题）

- 命令：
  - `pnpm -C packages/core typecheck`
  - `pnpm -C packages/core lint`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs build`
- 结果：
  - `core typecheck`：通过
  - `core lint`：通过
  - `admin typecheck`：通过
  - `admin lint`：通过（存在 3 条历史 warning，非本次改动引入）
  - `admin build`：通过
  - `docs build`：通过

## 2026-02-25（新增 adminPurple 固定紫色色阶示例）

- 命令：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/core typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/core lint`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin lint`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin build`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：
  - `core typecheck`：通过
  - `core lint`：通过
  - `admin typecheck`：通过
  - `admin lint`：通过（3 条历史 warning，非本次改动引入）
  - `admin build`：通过
  - `docs build`：通过

## 2026-02-25（UI 自动注册插件）

- 命令：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin lint`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin build`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：
  - `admin typecheck`：通过
  - `admin lint`：通过（存在 3 条历史 warning，非本次改动引入）
  - `admin build`：通过
  - `docs build`：通过

- 补充说明：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui typecheck` 当前失败，报错来源为历史环境问题（`packages/tag/src/plugin.ts` 的 `ImportMeta.env` 类型与 `app-header-bg.webp` 声明缺失），非本次自动注册逻辑引入。

## 2026-02-25（清理 ui/typecheck 阻塞）

- 命令：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/tag typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui lint`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/tag lint`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
- 结果：
  - `ui typecheck`：通过
  - `tag typecheck`：通过
  - `ui lint`：通过
  - `tag lint`：通过
  - `admin typecheck`：通过
- 追加验证：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui typecheck`：通过
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/tag typecheck`：通过

## 2026-02-25（admin 自定义固定色阶注册）

- 命令：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/core typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/core lint`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin lint`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin build`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：
  - 全部通过
  - `admin lint` 仍为 3 条历史 warning（非本次改动引入）

## 2026-02-25（主题注册名称能力）

- 命令：
  - `pnpm -C packages/core typecheck`
  - `pnpm -C packages/core lint`
  - `pnpm -C packages/ui typecheck`
  - `pnpm -C packages/ui lint`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs build`
- 结果：
  - `core typecheck`：通过
  - `core lint`：通过
  - `ui typecheck`：通过
  - `ui lint`：通过
  - `admin typecheck`：通过
  - `admin lint`：通过（存在 3 条历史 warning，非本次改动引入）
  - `admin build`：通过
  - `docs build`：通过

## 2026-02-25（文档增强：主题系统使用与注册指南）

- 命令：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：
  - `docs build`：通过

## 2026-02-25（术语校正：link 属于反馈状态色）

- 命令：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/core lint`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：
  - `core lint`：通过
  - `docs build`：通过

## 2026-02-25（主题 Token 收敛与双层 StyleTag 挂载）

- 命令：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/core typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/core lint`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin lint`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin build`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：
  - `core typecheck`：通过
  - `core lint`：通过
  - `ui typecheck`：通过
  - `admin typecheck`：通过
  - `admin lint`：通过（存在 3 条历史 warning，非本次改动引入）
  - `admin build`：通过
  - `docs build`：通过

## 2026-02-25（文档补充：主题收敛改造说明）

- 命令：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：
  - `docs build`：通过

## 2026-02-25（错误页下沉 packages/ui）

- 命令：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin build`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：
  - 全部通过
- 追加验证：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui lint`
- 结果：
  - 通过

## 2026-02-25（layout 配置：TopBar 高度 + 左侧菜单宽度）

- 命令：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/core typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin build`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：
  - 全部通过

## 2026-02-25（layout 折叠宽度配置 + 默认值去重）

- 命令：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/core typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin build`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：
  - 全部通过

## 2026-02-25（Iconify Skill 开发）

- 命令：
  - `python3 /Users/haoqiuzhi/.codex/skills/.system/skill-creator/scripts/quick_validate.py /Users/haoqiuzhi/.codex/skills/iconify-icon-integration`
  - `python3 /Users/haoqiuzhi/.codex/skills/iconify-icon-integration/scripts/iconify_search.py --query user --limit 5 --with-collection`
  - `python3 /Users/haoqiuzhi/.codex/skills/iconify-icon-integration/scripts/iconify_search.py --query home --limit 3 --prefix mdi --json`
- 结果：
  - `quick_validate`：通过（Skill is valid）
  - `iconify_search.py` 文本模式：通过（返回候选图标与集合元数据）
  - `iconify_search.py` JSON 模式：通过（返回过滤后的 `mdi` 图标列表）

## 2026-02-25（design-taste-frontend Skill 修复与打包）

- 命令：
  - `python3 /Users/haoqiuzhi/.agents/skills/skill-creator/scripts/quick_validate.py /Users/haoqiuzhi/.agents/skills/design-taste-frontend`
  - `python3 /Users/haoqiuzhi/.agents/skills/skill-creator/scripts/package_skill.py /Users/haoqiuzhi/.agents/skills/design-taste-frontend /Users/haoqiuzhi/.agents/skills/dist`
- 结果：
  - `quick_validate`：通过（`Skill is valid!`）
  - `package_skill`：通过（生成 `design-taste-frontend.skill`）

## 2026-02-25（左侧菜单优化：Iconify 折叠按钮 + 文案 Tooltip）

- 命令：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui lint`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin build`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：
  - 全部通过

## 2026-02-25（侧栏底部折叠栏高度 48px）

- 命令：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui lint`
- 结果：
  - 全部通过。

## 2026-02-25（侧栏菜单激活态背景铺满）

- 命令：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui lint`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin build`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：
  - 全部通过。

## 2026-02-25（侧栏三级导航样式按设计稿细化）

- 命令：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui lint`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin build`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：
  - 全部通过。

## 2026-02-25（菜单层级高度与字重统一）

- 命令：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui lint`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：
  - 全部通过。

## 2026-02-25（项目字体引入：按 macOS/Windows 自动切换）

- 命令：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/core typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/core lint`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin build`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin lint`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin exec eslint src/main.ts`
- 结果：
  - `packages/core` 的 `typecheck` / `lint`：通过。
  - `apps/admin` 的 `typecheck` / `build`：通过。
  - `apps/docs build`：通过。
  - `apps/admin lint`：失败（存在仓库既有问题，非本次改动引入）：
    - `apps/admin/src/config/layout.ts` 两个未使用变量（error）
    - portal 材料组件内 3 个既有 warning。
  - 定向校验 `apps/admin/src/main.ts`：`eslint` 通过。

## 2026-02-25（iconfont 集成验证）

- 命令：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui lint`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin build`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin exec eslint src/modules/demo/pages/DemoPageB.vue`
- 结果：
  - `packages/ui typecheck`：通过。
  - `packages/ui lint`：通过（新增 `FontIcon.vue` 默认值补齐后无 warning）。
  - `apps/admin typecheck`：通过。
  - `apps/admin build`：通过（产物中包含三套 iconfont 字体文件）。
  - `apps/docs build`：通过（`dist/fonts/*/demo_index.html` 均生成）。
  - 定向 eslint（DemoPageB）：通过。

## 2026-02-25（/demo/page-b 403 修复）

- 命令：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin build`
- 结果：
  - 全部通过。

## 2026-02-25（docs 新窗口 demo 链接 404 修复）

- 命令：
  - 启动 docs dev 后 `curl http://localhost:<docsPort>/fonts/dj-icons/demo_index.html`
  - 启动 admin dev 后 `curl http://localhost:<adminPort>/fonts/dj-icons/demo_index.html`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin build`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：
  - docs dev 端口下 `/fonts/dj-icons/demo_index.html` 返回 200。
  - admin dev 端口下 `/fonts/dj-icons/demo_index.html` 返回真实 demo HTML（标题 `iconfont Demo`），不再回退到 SPA index。
  - `apps/admin build` 通过，且 `dist/fonts/*` 产物完整。
  - `apps/docs build` 通过。

## 2026-02-25（菜单 iconfont 不显示修复验证）

- 命令：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui lint`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin build`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin exec eslint src/modules/demo/pages/DemoPageB.vue`
- 结果：
  - 所有命令均通过。
  - `apps/admin build` 产物中包含 OD 字体资源，且打包后的 css 含 `iconfont-od` 与 `icon-huishouzhan` 规则。
  - `apps/docs build` 输出包含 `dist/fonts/od-icons`，文档侧可预览 OD demo。

## 2026-02-25（docs 新窗口预览交互修正）

- 命令：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：
  - 构建通过，文档可正常渲染。

## 2026-02-25（utils 迁移与测试）

- 命令：
  - `pnpm install`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/utils typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/utils lint`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/utils test:run`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin build`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：
  - `packages/utils typecheck`：通过。
  - `packages/utils lint`：通过。
  - `packages/utils test:run`：通过（11 文件，168 用例全通过）。
  - `apps/admin typecheck`：通过。
  - `apps/admin build`：通过。
  - `apps/docs build`：通过。

## 2026-02-25（utils 第二轮规则收敛验证）

- 命令：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/utils lint`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/utils typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/utils test:run`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：
  - 全部通过。
  - `packages/utils` 在恢复 `no-unused-vars` / `prefer-const` 后仍保持 lint 通过。

## 2026-02-25（docs：Utils 文档完善）

- 命令：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：
  - 构建通过（VitePress client/server bundle 与页面渲染均成功）。

## 2026-02-25（docs：新增 Utils API 速查页）

- 命令：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：
  - 构建通过（VitePress 打包与渲染成功）。
- 复验：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`（修正文档示例导入后）通过。

## 2026-02-25（docs 信息架构优化验证）

- 命令：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：
  - 构建通过（VitePress client/server 打包与页面渲染成功）。

## 2026-02-25（个性设置 + 灰色模式）

- 命令：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/core typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/core lint`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui lint`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin build`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：
  - 所有命令均通过。
  - `apps/admin build` 通过，主题弹窗改造与灰色模式逻辑未引入构建回归。
  - `apps/docs build` 通过，主题文档与架构文档更新可正常渲染。
- 2026-02-25：提交前复验 `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`，通过。

## 2026-02-25（个性设置 UI 第二轮收敛）

- 命令：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui lint`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin build`
- 结果：
  - 所有命令通过。
  - 本轮仅 UI 结构与样式收敛，未引入类型或构建回归。

## 2026-02-25（主题预览 150x90 微调）

- 命令：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui typecheck`
- 结果：
  - 通过。

## 2026-02-25（个性设置视觉对齐图二）

- 命令：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui lint`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin build`
- 结果：
  - 全部通过。
- 补充命令：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：
  - 通过。

## 2026-02-25（个性设置第三轮：3~4 列栅格）

- 命令：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui lint`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin build`
- 结果：
  - 全部通过。

## 2026-02-25（页面容器组件 PageContainer）

- 命令：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui lint`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：
  - 全部通过。
  - 新增 `PageContainer` 组件未引入类型与 lint 回归。
  - 文档站构建通过，新增说明可正常渲染。

## 2026-02-25（个性设置第四轮：边框体量调优）

- 命令：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui lint`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin build`
- 结果：
  - 全部通过。

## 2026-02-25（PageContainer Demo 页面）

- 命令：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin build`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：
  - 全部通过。
  - Demo 页面与新路由接入未引入类型或构建回归。

## 2026-02-25（侧边抽屉 + 组件解耦）

- 命令：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui lint`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin build`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：
  - 全部通过。

## 2026-02-25（内部组件不导出修正）

- 命令：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui lint`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin build`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：
  - 全部通过。

## 2026-02-25（抽屉内边距 + 主题卡边框收敛）

- 命令：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui lint`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin build`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：
  - 全部通过。

## 2026-02-25（VXE Table 迁移实现验证）

- 命令：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui lint`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/utils typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/utils lint`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/utils test:run`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin build`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：
  - 全部通过。
  - `packages/utils test:run`：11 个测试文件、168 条测试全部通过。
  - `apps/admin build`：新增 `DemoLoginLogMigrationPage` 产物正常打包。
  - `apps/docs build`：新增 VXE 迁移文档与导航配置渲染正常。

## 2026-02-25（VXE 样板页结合 PageContainer 复验）

- 命令：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin build`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：
  - 全部通过。
  - `DemoLoginLogMigrationPage` 接入 `PageContainer` 后无类型与构建回归。

## 2026-02-25（ObVxeTable 撑满容器 + 分页器丢失修复验证）

- 命令：
  - `pnpm install --lockfile-only`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui lint`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin build`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
  - `rg -n \"vxe-pager|vxe-grid--pager-wrapper|vxe-pager--\" /Users/haoqiuzhi/code/one-base-template/apps/admin/dist/assets/*.css`
- 结果：
  - 全部通过。
  - `admin build` 产物中已包含 VXE UI 样式变量与 pager 相关样式片段，可证明分页器样式已进入最终产物。
  - `OneTableBar` 与 `VxeTable` 的 flex 高度改造未引入类型和构建回归。

## 2026-02-25（ObVxeTable 默认配置收敛 + 去固定高度写法验证）

- 命令：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui lint`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin build`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：
  - 全部通过。
  - `DemoLoginLogMigrationPage` 采用精简参数后，仍可完成表格渲染、分页与事件联动。
  - 文档更新后 `apps/docs` 构建通过，示例与当前组件默认行为一致。

## 2026-02-26（登录日志迁移样板视觉对齐图二）

- 命令：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui lint`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin build`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：
  - 全部通过。

- 附加检查（基线问题确认）：
  - 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin lint`
  - 结果：失败（仓库既有基线问题，主要集中在 `apps/admin/public/fonts/**/iconfont.js` 的 no-undef/no-unused-expressions 与既有 demo/api 中 `any` 类型，不属于本次改动引入）。

## 2026-02-26（分页器固定底部布局修复）

- 命令：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui lint`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin build`
- 结果：
  - 全部通过。

## 2026-02-26（分页器拆分渲染 + 样板页容器滚动收敛）

- 命令：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui lint`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin build`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：
  - 全部通过。

## 2026-02-26（表格视觉基线收敛：头色/行色/56 行高/分割线/无左右边框）

- 命令：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui lint`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin build`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：
  - 全部通过。
  - `DemoLoginLogMigrationPage` 构建产物正常，表格与分页拆分方案无编译回归。
  - 文档站点构建通过，迁移说明已同步本轮视觉基线。

## 2026-02-26（ObVxeTable 宽度 100% + 纵向滚动条优化）

- 命令：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui lint`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin build`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：
  - 全部通过。
  - `DemoLoginLogMigrationPage` 构建产物正常，表格宽度铺满与滚动条样式调整未引入回归。

## 2026-02-26（右侧空白修复：not--scroll-x 折叠 fixed 包裹层）

- 命令：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui lint`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin build`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：
  - 全部通过。
  - 未触发横向滚动场景下 fixed wrapper 折叠策略未引入类型与构建回归。

## 2026-02-26（最后一行底边移除）

- 命令：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui lint`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin build`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：
  - 全部通过。
  - 最后一行去掉底边样式调整未引入类型与构建回归。

## 2026-02-26（VXE 表格主题 token 配色改造）

- 命令：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui lint`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin build`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：
  - 全部通过。
  - 首次 lint 发现 `scrollYConfig/scrollXConfig` 未使用，已在模板恢复 `:scroll-y/:scroll-x` 透传后通过。

## 2026-02-26（VXE 主题文件化收口）

- 命令：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui lint`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin build`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：
  - 全部通过。
  - `ObVxeTable` 去本地 `--vxe-ui-*` 变量后，`admin build` 与 `docs build` 均无回归。

## 2026-02-26（OneTableBar 输入框扁平化样式）

- 命令：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui lint`
- 结果：
  - 全部通过。

## 2026-02-26（OneTableBar 工具条与分割线微调）

- 命令：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui lint`
- 结果：
  - 全部通过。

## 2026-02-26（组织管理树形迁移样板）

- 命令：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin build`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：
  - `apps/admin typecheck` 首次失败（`ElMessageBox.prompt` 返回值类型是 `MessageBoxData` 联合类型，不能直接结构 `value`），已修复为类型守卫写法后通过。
  - `apps/admin build` 通过。
  - `apps/docs build` 通过。
- 补充检查：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin exec eslint src/modules/demo/pages/DemoOrgManagementMigrationPage.vue src/modules/demo/org-management/api.ts src/modules/demo/org-management/columns.tsx src/modules/demo/routes.ts vite.config.ts`
  - 结果：通过。

## 2026-02-26（组织管理 parentId 对齐）

- 命令：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin build`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin exec eslint src/modules/demo/pages/DemoOrgManagementMigrationPage.vue src/modules/demo/org-management/api.ts vite.config.ts`
- 结果：
  - 首次 `apps/admin typecheck` 报错：误把 `authStore.user` 当作 `ref` 访问（`.value`）。
  - 修复后再次执行全部通过。
  - `apps/admin build` 与 `apps/docs build` 通过，无新增构建回归。
  - 目标文件 eslint 通过。

## 2026-02-26（菜单管理迁移样板）

- 命令：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin build`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin exec eslint src/modules/demo/pages/DemoMenuManagementMigrationPage.vue src/modules/demo/menu-management/api.ts src/modules/demo/menu-management/columns.ts src/modules/demo/routes.ts vite.config.ts`
- 结果：
  - 首次 `apps/admin typecheck` 失败：`columns.ts` 的 formatter 参数存在隐式 `any`，已补充参数类型后通过。
  - 首次 eslint 失败：`tableRef` 使用了 `any`，已改为 `ref<unknown>(null)` 后通过。
  - 修复后再次执行：`apps/admin typecheck`、`apps/admin build`、`apps/docs build` 与目标文件 eslint 全部通过。

## 2026-02-26（树形长列表滚动修复）

- 命令：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui lint`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin build`
- 结果：
  - 全部通过。
  - 未引入 `ObVxeTable` 类型与构建回归。

## 2026-02-26（VXE 滚动条样式优化）

- 命令：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui lint`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin build`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：
  - 全部通过。
  - 变更仅涉及 UI 主题变量与 `ObVxeTable` 样式覆盖，未引入类型或构建回归。

## 2026-02-26（滚动条仅悬浮显示）

- 命令：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui typecheck && pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui lint`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin build`
- 结果：
  - 全部通过。
  - 变更仅涉及 `ObVxeTable` 样式层，未引入类型与构建回归。

## 2026-02-26（滚动条样式重写收敛）

- 命令：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui lint`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin build`
- 结果：
  - 全部通过。
  - 样式重写后未引入编译与静态检查回归。

## 2026-02-26（滚动条容器透明化微调）

- 命令：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui lint`
- 结果：全部通过。

## 2026-02-26（VxeTable 样式收敛与默认配置整理）

- 命令：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui lint`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin build`
- 结果：
  - 全部通过。

## 2026-02-26（二次确认弹窗样式统一）

- 命令：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin exec eslint src/infra/confirm.ts src/modules/demo/pages/DemoLoginLogMigrationPage.vue src/modules/demo/pages/DemoMenuManagementMigrationPage.vue src/modules/demo/pages/DemoOrgManagementMigrationPage.vue src/modules/portal/pages/PortalTemplateListPage.vue src/modules/portal/pages/PortalTemplateSettingPage.vue`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin build`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：
  - 首次 eslint 发现 `DemoLoginLogMigrationPage.vue` 存量 `no-explicit-any` 报错（`tableRef`），修复为 `ref<unknown>(null)` 后通过。
  - 修复后上述命令全部通过。

## 2026-02-26（二次确认三色能力 + 简单命名 Demo）

- 命令：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin exec eslint src/infra/confirm.ts src/modules/demo/pages/DemoConfirmPage.vue src/modules/demo/pages/DemoLoginLogMigrationPage.vue src/modules/demo/pages/DemoMenuManagementMigrationPage.vue src/modules/demo/pages/DemoOrgManagementMigrationPage.vue src/modules/demo/routes.ts src/modules/portal/pages/PortalTemplateListPage.vue src/modules/portal/pages/PortalTemplateSettingPage.vue`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin build`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：
  - 首次 typecheck 在 `DemoConfirmPage.vue` 报数组索引可能 `undefined`，已改为 `v-for` 渲染按钮后通过。
  - 修复后上述命令全部通过。

## 2026-02-27（路由跳转重复拉取 my-tree 优化）

- 命令：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/core exec eslint src/stores/menu.ts src/router/guards.ts`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui exec eslint src/components/top/TopBar.vue`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/core typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin build`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：全部通过。

## 2026-02-27（导航优先级：路由切换取消在途请求）

- 命令：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/core typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/core lint`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/adapters typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/adapters lint`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin lint`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin exec eslint src/bootstrap/index.ts`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：
  - `packages/core` 与 `packages/adapters` 的 typecheck/lint 全部通过。
  - `apps/admin typecheck` 通过。
  - `apps/admin lint` **失败（存量问题）**：主要来自 `apps/admin/public/fonts/**/iconfont.js` 的 no-undef/no-unused-expressions，以及 `apps/admin/src/modules/demo/login-log/api.ts` 的 `no-explicit-any`，与本次改动无关。
  - 定向校验 `apps/admin/src/bootstrap/index.ts` 通过。
  - `apps/docs build` 通过。

## 2026-02-27（二次确认弹窗 icon 位置对齐设计稿）

- 命令：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：
  - 全部通过。
  - 本次为样式与文档更新，未引入 TS 构建回归。

## 2026-02-27（二次确认弹窗排版二次微调）

- 命令：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：全部通过。

## 2026-02-27（Element Plus 覆盖样式拆分文件）

- 命令：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：全部通过。

## 2026-02-27（修复 PostCSS 导入路径 ENOENT）

- 命令：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin build`
- 结果：
  - 构建通过，`index.css` 中拆分后的 Element 覆盖文件导入正常。

## 2026-02-27（再修复 dev 场景 CSS 导入 ENOENT）

- 命令：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin dev --host 127.0.0.1 --port 5179`
  - `curl -I --max-time 5 http://127.0.0.1:5179`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin build`
- 结果：
  - dev 服务可启动并返回 200。
  - typecheck 与 build 通过。

## 2026-02-27（Element 按钮统一覆盖 + Demo 页面）

- 命令：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin exec eslint src/styles/index.css src/modules/demo/pages/DemoButtonStylePage.vue src/modules/demo/pages/DemoPageA.vue src/modules/demo/routes.ts`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/core exec eslint src/theme/one/apply-theme.ts src/theme/one/theme-tokens.ts`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/core typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin build`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：
  - eslint（admin）通过；`src/styles/index.css` 提示“无匹配配置被忽略”（warning，非失败）。
  - eslint（core）通过。
  - `packages/core typecheck` 通过。
  - `apps/admin typecheck` 通过。
  - `apps/admin build` 通过（存在 chunk size 警告，非失败）。
  - `apps/docs build` 通过。
- 追加回归（补充禁用伪类覆盖后）：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`：通过
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin build`：通过（chunk size 警告，非失败）
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`：通过

## 2026-02-27（按钮样式二次优化：link 从 feedback 移出）

- 命令：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/core typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin exec eslint src/modules/demo/pages/DemoButtonStylePage.vue src/modules/demo/routes.ts src/modules/demo/pages/DemoPageA.vue`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin build`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：
  - 命令全部通过。
  - `apps/admin build` 仍有 chunk size warning（历史体积提示，非失败）。

## 2026-02-27（Docs 按钮样式模块）

- 命令：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：
  - 两条命令均通过。
  - `button-styles.md` 成功渲染本地 Vue 示例组件 `ButtonStyleDocDemo.vue`。

## 2026-02-27（基建收口第一批：命名空间 + 初始路由 + 鉴权编排）

- 命令：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/core typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/core lint`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin exec eslint src/router/index.ts src/pages/login/LoginPage.vue src/pages/sso/SsoCallbackPage.vue src/bootstrap/core.ts`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin build`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：
  - 全部通过。
  - `apps/admin build` 仍有历史 `chunk size` 提示（warning，非失败）。

## 2026-02-27（tabs 单轨=tag、core tabs 删除、workspace 重命名）

- 命令：
  - `pnpm install`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/core typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/core lint`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui lint`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin exec eslint src/bootstrap/index.ts src/bootstrap/http.ts src/pages/login/LoginPage.vue src/pages/sso/SsoCallbackPage.vue src/config/platform-config.ts src/infra/env.ts src/infra/sczfw/crypto.ts src/main.ts`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin build`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：
  - 全部通过。
  - `pnpm install` 有一条存量警告：`deprecated subdependencies found: glob@10.5.0`。
  - `apps/admin build` 有历史告警：插件耗时提示 + chunk size 提示（非失败）。

## 2026-02-27（模块 Manifest 解耦与可切割结构）

- 命令：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -w typecheck`
  - `pnpm -w lint`
  - `pnpm -w build`
  - `pnpm -C apps/docs build`
- 结果：
  - 全部通过
  - `apps/admin lint` 保留 3 条历史 warning（portal materials 组件 prop 规则），无新增 error

## 2026-02-27（命名简化巡检回归）

- 命令：
  - `pnpm -w typecheck`
  - `pnpm -w lint`
  - `pnpm -w build`
  - `pnpm -C apps/docs build`
- 结果：
  - 四条命令全部通过（退出码均为 0）。
  - `pnpm -w lint` 保留 3 条历史 warning（apps/admin，非本次新增）。
  - `pnpm -w build` 保留历史 chunk size / plugin timings warning（非失败）。

## 2026-02-27（第二轮命名清理回归）

- 命令：
  - `pnpm -w typecheck`
  - `pnpm -w lint`
  - `pnpm -w build`
  - `pnpm -C apps/docs build`
- 结果：
  - 4 条命令全部通过（退出码 0）。
  - `pnpm -w lint` 保留 3 条历史 warning（portal 物料组件 prop 规则，非本次命名改动引入）。
  - `pnpm -w build` 保留历史 plugin timings / chunk size warning（非失败）。

## 2026-02-27（命名白名单 docs 验证）

- 命令：
  - `pnpm -C apps/docs build`
- 结果：
  - 构建通过（退出码 0）。
  - `vitepress build complete`（约 5.35s）。

## 2026-02-28（router 目录收敛回归）

- 命令：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/docs build`
- 结果：
  - 三条命令退出码均为 0。
  - `apps/admin lint` 维持 3 条历史 warning（portal 物料组件 prop 规则），无新增 error。
  - docs 构建通过。

## 2026-02-28（router 扁平化回归）

- 命令：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/docs build`
- 结果：
  - 三条命令均通过（退出码 0）。
  - `apps/admin lint` 维持 3 条历史 warning（无新增 error）。
  - docs 构建通过。

## 2026-02-28（P0 优化三项回归）

- 命令：
  - `pnpm check:naming`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/docs build`
- 结果：
  - 4 条命令均通过（退出码 0）。
  - `apps/admin lint` 已无 warning/error。
  - 命名检查通过：未发现违反白名单的函数命名。

## 2026-02-28（DX 脚本回归：new:module / verify / doctor）

- 命令：
  - `pnpm run doctor`
  - `pnpm new:module feature-demo --dry-run`
  - `pnpm check:naming`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/docs build`
  - `pnpm run verify`
- 结果：
  - 全部命令通过（退出码 0）。
  - `new:module --dry-run` 正确打印将创建的 8 个文件路径。
  - `doctor` 输出 Node/pnpm 与关键文件检查结果，并提示 `.bash_profile` 的 cargo 引用缺失（warning）。

## 2026-02-28（ob_auth_user 字段补齐回归）

- 命令：
  - `pnpm -w typecheck`
  - `pnpm -w lint`
- 结果：
  - 两条命令均通过（退出码 0）。
  - core/adapters/admin/docs 均无新增类型或 lint 错误。

## 2026-02-28（Demo 组织管理树表修复回归）

- 命令：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/docs build`
- 结果：
  - 3 条命令均通过（退出码 0）。
  - 无新增 warning/error。

## 2026-02-28（组织管理树表差异对齐回归）

- 命令：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/docs build`
- 结果：
  - 三条命令全部通过（退出码 0）。
  - 无新增 warning/error。

## 2026-02-28（侧栏菜单高亮策略优化回归）

- 命令：
  - `pnpm -C packages/ui typecheck`
  - `pnpm -C packages/ui lint`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/docs build`
- 结果：
  - 四条命令全部通过（退出码 0）。
  - 无 warning / error。

## 2026-02-28（统一 CRUD 容器能力回归）

- 命令：
  - `pnpm -C packages/utils test:run`
  - `pnpm -C packages/utils typecheck`
  - `pnpm -C packages/utils lint`
  - `pnpm -C packages/ui typecheck`
  - `pnpm -C packages/ui lint`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/docs build`
- 结果：
  - 全部命令通过（退出码 0）。
  - `vitest`：`12 files passed`、`177 tests passed`。
  - docs 站点构建通过（VitePress）。

## 2026-02-28（职位管理真实接口切换回归）

- 命令：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/docs build`
- 结果：
  - 3 条命令均通过（退出码 0）。
  - `apps/admin` 无新增类型错误与 lint 错误。
  - `apps/docs` VitePress 构建通过（`build complete`）。

## 2026-02-28（PositionManagementPage 瘦身提效回归）

- 命令：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
- 结果：
  - 最终两条命令均通过（退出码 0）。
  - 过程记录：第一次 `typecheck` 因分页类型不匹配失败（`PaginationConfig` -> `TablePagination`），已通过增加 `tablePagination` 适配修复后复验通过。

## 2026-02-28（UI 全局化改造回归）

- 命令：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
- 结果：
  - 2 条命令均通过（退出码 0）。
  - 自动导入配置变更后，页面无未定义符号和类型错误。

## 2026-02-28（职位页二次优化回归）

- 命令：
  - `pnpm -C packages/ui typecheck`
  - `pnpm -C packages/ui lint`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/docs build`
- 结果：
  - 最终 5 条命令全部通过（退出码 0）。
  - 过程说明：拆分子组件后首次 `apps/admin lint` 触发 `vue/no-mutating-props`，已通过 `defineModel` 改写双向绑定并复验通过。

## 2026-02-28（UserManagement feature-first 目录调整回归）

- 命令：
  - `pnpm -C packages/ui typecheck`
  - `pnpm -C packages/ui lint`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/docs build`
- 结果：
  - 5 条命令均通过（退出码 0）。
  - 页面路径迁移（`pages -> position/page.vue`）后无路由、类型、lint 与文档构建回归问题。

## 2026-02-28（继续简化改造回归）

- 命令：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/docs build`
- 结果：
  - 最终 3 条命令均通过（退出码 0）。
  - 过程记录：
    - 首次 `typecheck` 失败两项：
      1. `useCrudContainer` 类型推断导致 `mapDetailToForm` 参数过宽；
      2. `confirm` 自动导入与浏览器全局 `confirm` 冲突。
    - 处理后复验通过：补最小泛型 `useCrudContainer<PositionForm, PositionRecord>`，并改为显式导入 `confirm`。

## 2026-02-28（link danger 按钮状态色覆盖修正）

- 命令：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin build`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：
  - 全部通过。
  - admin build 仅有历史 chunk size / plugin timing 警告，非失败。

## 2026-02-28（useTable 删除能力统一 + 分页回退增强）

- 命令：
  - `pnpm -C packages/utils test:run`
  - `pnpm -C packages/utils typecheck`
  - `pnpm -C packages/utils lint`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/docs build`
- 结果：
  - 全部通过。
  - `packages/utils` 测试新增 `src/hooks/useTable/index.test.ts`（7 个用例）并通过。
  - 文档站点构建通过（VitePress）。

## 2026-02-28（表单悬浮边框统一主题色）

- 命令：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/core typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin build`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：
  - 全部通过。
  - admin build 仅有历史 chunk size 警告，非本次变更引入。
- 追加命令（收口 OneTableBar 本地覆盖后）：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin build`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 追加结果：全部通过。

## 2026-02-28（ObCrudContainer 全局默认容器 + useTable 全局适配）

- 命令：
  - `pnpm -C packages/utils test:run`
  - `pnpm -C packages/utils typecheck`
  - `pnpm -C packages/utils lint`
  - `pnpm -C packages/ui typecheck`
  - `pnpm -C packages/ui lint`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/docs build`
- 结果：
  - 全部通过。
  - `useTable` 单测由 7 个场景扩展为 10 个场景（新增全局分页键、全局响应适配、局部优先级验证）。

## 2026-02-28（引入老项目 message.ts 并全局注册）

- 命令：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin build`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：
  - 全部通过。
  - admin build 仅有历史 chunk size 警告，非本次改动引入。
- 追加命令：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin exec eslint src/utils/message.ts src/bootstrap/index.ts src/types/message.d.ts`
- 追加结果：通过。

## 2026-02-28（UserManagement 模块 message 替换）

- 命令：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin exec eslint src/modules/UserManagement/position/page.vue`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin build`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：
  - 全部通过。
  - admin build 仅有历史 chunk size 警告，非本次改动引入。

## 2026-02-28（admin 预设落地：容器默认 + 表格分页/响应适配）

- 命令：
  - `pnpm -C packages/utils test:run`
  - `pnpm -C packages/utils typecheck`
  - `pnpm -C packages/utils lint`
  - `pnpm -C packages/ui typecheck`
  - `pnpm -C packages/ui lint`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/docs build`
- 结果：全部通过。

## 2026-02-28（obConfirm 去 import 化）

- 命令：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin exec eslint src/modules/UserManagement/position/page.vue`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：全部通过。

## 2026-02-28 14:26:26（按用户请求复跑）

- 命令：pnpm -C packages/ui typecheck
- 结果：通过
- 命令：pnpm -C apps/docs build
- 结果：通过（vitepress v1.6.4，build complete in 6.31s）

## 2026-02-28（ObCrudContainer 抽屉单列/双列样式改造）

- 命令：
  - `pnpm -C packages/ui typecheck`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs build`
- 结果：全部通过。
- 复跑：
  - `pnpm -C packages/ui typecheck`
  - `pnpm -C apps/docs build`
- 复跑结果：通过（vitepress v1.6.4）。

## 2026-02-28（ObCrudContainer 抽屉视觉对齐 UI 设计图）

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui typecheck`
- 结果：通过

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
- 结果：通过

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：通过（vitepress v1.6.4，build complete in 7.40s）

## 2026-02-28 复跑（白底 token 调整后）

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui typecheck && pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck && pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：全部通过（docs build complete in 7.33s）

## 2026-02-28（Drawer padding/头尾样式微调后复跑）

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui typecheck && pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck && pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：全部通过（docs build complete in 7.37s）

## 2026-02-28（“需求没实现”修正后复跑）

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui typecheck && pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck && pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：全部通过（docs build complete in 6.17s）

## 2026-02-28（--el-dialog-bg-color 变量方案复跑）

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui typecheck && pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck && pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：全部通过（docs build complete in 6.86s）

## 2026-02-28（scoped 移除后复跑）

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui typecheck && pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
- 结果：通过
- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：通过（build complete in 6.77s）

## 2026-02-28（detail 去星号 + drawer-overrides 抽离后复跑）

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui typecheck && pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck && pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：全部通过（docs build complete in 6.22s）

## 2026-02-28（ObActionButtons 新增后验证）

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui typecheck`
- 结果：首次失败（TS 收窄问题：`deleteAction` 可能为 `undefined`），已修复并复跑通过。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui typecheck && pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck && pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：全部通过（docs build complete in 7.14s）
- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui exec eslint src/components/table/ActionButtons.vue src/index.ts src/plugin.ts && pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin exec eslint src/modules/UserManagement/position/page.vue src/modules/demo/pages/DemoOrgManagementMigrationPage.vue`
- 结果：通过

## 2026-02-28（ObVxeTable 加载图标替换）

- 命令：
  - `pnpm -C packages/ui typecheck`
  - `pnpm -C packages/ui lint`
  - `pnpm -C apps/admin typecheck`
- 结果：全部通过。

## 2026-02-28（ObActionButtons 交互 bug 修复验证）

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui typecheck && pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck && pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：全部通过（docs build complete in 7.68s）

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui exec eslint src/components/table/ActionButtons.vue src/components/table/VxeTable.vue`
- 结果：通过

## 2026-02-28（ObActionButtons 显式导入兜底验证）

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck && pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui typecheck`
- 结果：通过
- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin build`
- 结果：通过

## 2026-02-28（ObActionButtons hover 触发验证）

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui typecheck && pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
- 结果：通过

## 2026-02-28（CRUD 模块最佳实践文档新增）

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：通过（vitepress v1.6.4，build complete in 6.26s）

## 2026-02-28（项目内 CRUD skill 校验）

- 命令：`python3 /Users/haoqiuzhi/.codex/skills/.system/skill-creator/scripts/quick_validate.py /Users/haoqiuzhi/code/one-base-template/.codex/skills/crud-module-best-practice`
- 结果：通过（Skill is valid!）

## 2026-02-28（UserManagement 组织管理完整迁移验证）

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
- 结果：通过。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin exec eslint src/modules/UserManagement/routes.ts src/modules/UserManagement/org/api.ts src/modules/UserManagement/org/columns.tsx src/modules/UserManagement/org/form.ts src/modules/UserManagement/org/page.vue src/modules/UserManagement/org/components/OrgSearchForm.vue src/modules/UserManagement/org/components/OrgEditForm.vue src/modules/UserManagement/org/components/OrgManagerDialog.vue src/modules/UserManagement/org/components/OrgLevelManageDialog.vue`
- 结果：通过。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：通过（vitepress v1.6.4，build complete in 6.95s）。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin build`
- 结果：通过（vite v8.0.0-beta.13，built in 3.13s）。

## 2026-02-28（组织管理功能补齐二次验证）

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
- 结果：通过。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin exec eslint src/modules/UserManagement/org/api.ts src/modules/UserManagement/org/page.vue src/modules/UserManagement/org/components/OrgManagerDialog.vue src/modules/UserManagement/org/components/OrgLevelManageDialog.vue src/modules/UserManagement/org/components/OrgEditForm.vue src/modules/UserManagement/org/components/OrgSearchForm.vue src/modules/UserManagement/org/form.ts src/modules/UserManagement/routes.ts`
- 结果：通过。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin build`
- 结果：通过（vite v8.0.0-beta.13，built in 2.50s）。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：通过（vitepress v1.6.4，build complete in 5.61s）。

## 2026-02-28（Dialog 全局覆盖验证）

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck && pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin build`
- 结果：通过。

## 2026-02-28（Dialog 白底未生效修复验证）

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck && pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin build && pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：全部通过（admin build 通过，docs build complete in 5.33s）。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin exec eslint src/modules/UserManagement/org/components/OrgLevelManageDialog.vue`
- 结果：通过。

## 2026-02-28（Dialog 关闭按钮位置微调验证）

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin build`
- 结果：通过（vite v8.0.0-beta.13，built in 2.60s）。

## 2026-03-02（移植最佳实践 skill 校验）

- 命令：`python3 /Users/haoqiuzhi/.codex/skills/.system/skill-creator/scripts/quick_validate.py /Users/haoqiuzhi/code/one-base-template/.codex/skills/legacy-project-migration-best-practice`
- 结果：通过（`Skill is valid!`）。

## 2026-03-02（用户管理完整迁移 + ObImportUpload 组件沉淀）

- 命令：
  - `pnpm -C packages/ui typecheck`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs build`
- 结果：全部通过
- 过程修复：
  - `ImportUpload.vue` 调整 `onError` 参数类型兼容（Upload 错误对象补充字段）
  - `UserBindAccountForm.vue` 修复 `defineExpose` 扩展方法类型与 `selectedUsers` 空值推断问题
  - `dragSort.ts` 修复数组位移时 `undefined` 类型分支
  - 安装 `sortablejs` 与 `@types/sortablejs` 解决拖拽排序依赖与类型声明

## 2026-03-02（legacy-module-migration-executor skill 校验）

- 命令：`python3 /Users/haoqiuzhi/.codex/skills/.system/skill-creator/scripts/quick_validate.py /Users/haoqiuzhi/code/one-base-template/.codex/skills/legacy-module-migration-executor`
- 结果：通过（`Skill is valid!`）。

## 2026-03-02（用户管理筛选日期参数与高级筛选抽屉样式修复）

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui typecheck`
- 结果：通过。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
- 结果：通过。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin lint`
- 结果：通过。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin build`
- 结果：通过（vite v8.0.0-beta.13）。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：通过（vitepress v1.6.4，build complete in 5.55s）。

## 2026-03-02（UserManagement 规范收敛 + 左树右表容器升级）

- 命令：`python3 /Users/haoqiuzhi/.codex/skills/.system/skill-creator/scripts/quick_validate.py /Users/haoqiuzhi/code/one-base-template/.codex/skills/crud-module-best-practice`
- 结果：通过（`Skill is valid!`）。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui typecheck`
- 结果：通过。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
- 结果：首次失败（`ReadonlyArray` 传参到可变数组）；修复 `user/actions.ts` 入参类型后复跑通过。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin lint`
- 结果：通过。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin build`
- 结果：通过（vite v8.0.0-beta.13）。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：通过（vitepress v1.6.4，build complete in 6.39s）。

## 2026-03-02（UserManagement 全局组件导入收敛）

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck && pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin lint`
- 结果：通过。

## 2026-03-02（用户管理左树内边距 + 组织管理树表显示修复）

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui typecheck && pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck && pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin lint`
- 结果：全部通过。

## 2026-03-02（组织管理树表空数据修复验证）

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin exec eslint src/config/ui.ts`
- 结果：通过。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
- 结果：通过。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin lint`
- 结果：通过。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin build`
- 结果：通过（vite v8.0.0-beta.13）。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：通过（vitepress v1.6.4，build complete in 5.79s）。

## 2026-03-02（crud-module-best-practice skill 更新校验）

- 命令：`python3 /Users/haoqiuzhi/.codex/skills/.system/skill-creator/scripts/quick_validate.py /Users/haoqiuzhi/code/one-base-template/.codex/skills/crud-module-best-practice`
- 结果：通过（`Skill is valid!`）。

## 2026-03-02（表格对齐规则：skill/agent/docs 同步校验）

- 命令：`python3 /Users/haoqiuzhi/.codex/skills/.system/skill-creator/scripts/quick_validate.py /Users/haoqiuzhi/code/one-base-template/.codex/skills/crud-module-best-practice`
- 结果：通过（`Skill is valid!`）。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：通过（vitepress v1.6.4，build complete in 6.11s）。

## 2026-03-02（提交前全量校验）

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck && pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin lint && pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：通过。

## 2026-03-02（UserManagement 优化执行验证）

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck && pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin lint && pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：通过（admin typecheck/lint 全通过，docs build complete in 5.30s）。

## 2026-03-02（UserManagement 第二批优化验证）

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
- 结果：通过。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin lint && pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：通过（docs build complete in 5.62s）。

## 2026-03-02（UserManagement 删除流程统一收尾验证）

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
- 结果：通过。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin lint`
- 结果：通过。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：通过（vitepress v1.6.4，build complete in 6.12s）。

## 2026-03-02（删除逻辑下沉 useTable 验证）

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/utils test:run src/hooks/useTable/index.test.ts`
- 结果：通过（11 tests passed）。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/utils typecheck`
- 结果：通过。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/utils lint`
- 结果：通过。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
- 结果：通过。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin lint`
- 结果：通过。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：通过（vitepress v1.6.4，build complete in 5.69s）。

## 2026-03-02（删除确认下沉到 useTable 配置）

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/utils test:run src/hooks/useTable/index.test.ts`
- 结果：首次失败（`beforeBatchDelete` 取消态仍触发 `onDeleteError`）；修复 `batchDelete` catch 分支取消态短路后复跑通过（13 tests passed）。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/utils typecheck && pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/utils lint`
- 结果：通过。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
- 结果：通过。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin lint && pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：首次失败（`apps/admin/src/hooks/table.ts` 的 `Ref<any>` 触发 no-explicit-any）；改为 `Ref<unknown>` 后复跑通过（docs build complete in 5.69s）。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
- 结果：通过（最终确认）。

## 2026-03-02（用户管理删除确认弹窗收敛）

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/utils test:run src/hooks/useTable/index.test.ts`
- 结果：通过（13 tests passed）。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/utils typecheck && pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/utils lint`
- 结果：通过。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck && pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin lint`
- 结果：通过。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：通过（vitepress v1.6.4，build complete in 6.34s）。

## 2026-03-02（useCrudContainer 入参与命名收敛验证）

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/utils test:run src/hooks/useCrudContainer/index.test.ts`
- 结果：通过（9 tests passed）。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/utils test:run src/hooks/useTable/index.test.ts`
- 结果：通过（13 tests passed）。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/utils typecheck && pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/utils lint`
- 结果：通过。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui typecheck`
- 结果：通过。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck && pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin lint`
- 结果：通过。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：通过（vitepress v1.6.4，build complete in 5.72s）。

## 2026-03-02（normalize 工具下沉共享）

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
- 结果：失败（非本次改动独有问题，来自既有改动链路）：
  - `apps/admin/src/hooks/table.ts`：`UseTableConfig` 导出缺失、`beforeDelete` 类型未声明
  - `packages/utils/src/hooks/useTable/index.ts`：`UseTableInternalConfig` 缺少 `onSuccess/onError` 等属性

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin exec eslint src/shared/api/normalize.ts src/modules/UserManagement/user/api.ts src/modules/UserManagement/org/api.ts src/modules/demo/org-management/api.ts`
- 结果：通过。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：通过（vitepress v1.6.4，build complete in 6.68s）。

## 2026-03-02（Hook 收敛重构：测试记录）

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/utils test:run src/hooks/useEntityEditor/index.test.ts`
- 结果：通过（9 tests passed）。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/utils test:run src/hooks/useTable/index.test.ts`
- 结果：通过（14 tests passed）。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/utils typecheck && pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/utils lint`
- 结果：首次失败（`index.test.ts` 辅助函数对 `query` 使用浅层 `Partial`，触发 `query.api` 必填类型错误）；修复为 `query?: Partial<UseTableQueryOptions>` 后复跑通过。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui typecheck`
- 结果：通过。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck && pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin lint`
- 结果：通过。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：通过（vitepress v1.6.4，build complete in 9.20s）。
- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/utils test:run`
- 结果：通过（13 test files, 191 tests）。

## 2026-03-02（删除回调归属 remove 调整）

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/utils test:run src/hooks/useTable/index.test.ts`
- 结果：通过（14 tests passed）。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/utils typecheck && pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/utils lint`
- 结果：通过。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck && pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin lint`
- 结果：通过。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：通过（vitepress v1.6.4，build complete in 9.41s）。

## 2026-03-02（Hook 归属收敛到 core）

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/core test:run`
- 结果：通过（3 test files, 30 tests）。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/core typecheck && pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/core lint`
- 结果：通过。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui typecheck`
- 结果：通过。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck && pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin lint`
- 结果：通过。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/utils typecheck && pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/utils lint`
- 结果：通过。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：通过（vitepress v1.6.4，build complete in 7.55s）。

- 命令：`pnpm install --lockfile-only`
- 结果：通过（workspace lockfile 已同步）。

## 2026-03-02（UserManagement 第一批高优修复验证）

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/core test:run src/hooks/admin-normalize-compat.test.ts`
- 结果：通过（1 test file, 2 tests passed）。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin exec eslint src/shared/api/normalize.ts src/modules/UserManagement/org/api.ts src/modules/UserManagement/org/components/OrgManagerDialog.vue src/modules/UserManagement/user/page.vue src/modules/UserManagement/org/page.vue src/modules/UserManagement/org/columns.tsx`
- 结果：通过（无 eslint 报错输出）。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
- 结果：通过（`vue-tsc --noEmit` 无类型错误）。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：通过（vitepress v1.6.4，build complete in 5.83s）。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`（文档补充后复验）
- 结果：通过（vitepress v1.6.4，build complete in 6.23s）。

## 2026-03-02（UserManagement 第二步：唯一性校验收敛）

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/core test:run src/hooks/user-management-unique.test.ts`
- 结果：通过（1 test file, 5 tests passed）。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/core test:run src/hooks/admin-normalize-compat.test.ts src/hooks/user-management-unique.test.ts`
- 结果：通过（2 test files, 7 tests passed）。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin exec eslint src/modules/UserManagement/shared/unique.ts src/modules/UserManagement/user/page.vue src/modules/UserManagement/org/page.vue src/modules/UserManagement/position/page.vue src/modules/UserManagement/user/components/UserAccountForm.vue`
- 结果：通过（无 eslint 报错输出）。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
- 结果：通过（`vue-tsc --noEmit` 无类型错误）。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：通过（vitepress v1.6.4，build complete in 6.95s）。

## 2026-03-02（UserManagement 第三步：删除确认链路统一-A）

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin exec eslint src/modules/UserManagement/org/components/OrgLevelManageDialog.vue`
- 结果：通过（无 eslint 报错输出）。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
- 结果：通过（`vue-tsc --noEmit` 无类型错误）。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：通过（vitepress v1.6.4，build complete in 7.54s）。

## 2026-03-02（UserManagement 第三步A收尾复验）

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin exec eslint src/modules/UserManagement/org/components/OrgLevelManageDialog.vue`
- 结果：通过（无 eslint 报错输出）。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
- 结果：通过（`vue-tsc --noEmit` 无类型错误）。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：通过（vitepress v1.6.4，build complete in 6.92s）。

## 2026-03-02（UserManagement 第三步B：非删除确认收敛）

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin exec eslint src/modules/UserManagement/shared/confirm.ts src/modules/UserManagement/user/actions.ts src/modules/UserManagement/user/components/UserEditForm.vue`
- 结果：通过（无 eslint 报错输出）。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
- 结果：通过（`vue-tsc --noEmit` 无类型错误）。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：通过（vitepress v1.6.4，build complete in 9.34s）。

## 2026-03-02（UserManagement 第四步：大页面拆分 + 文件长度建议）

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin exec eslint src/modules/UserManagement/user/page.vue src/modules/UserManagement/user/composables/useUserStatusActions.ts src/modules/UserManagement/user/composables/useUserDragSort.ts src/modules/UserManagement/org/page.vue src/modules/UserManagement/org/composables/useOrgTreeQuery.ts`
- 结果：通过（无 eslint 报错输出）。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
- 结果：通过（`vue-tsc --noEmit` 无类型错误）。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：通过（vitepress v1.6.4，build complete in 6.50s）。

## 2026-03-02（Admin 架构并行分析与底层优化）

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin exec eslint src/shared/logger.ts src/router/constants.ts src/router/registry.ts src/router/assemble-routes.ts src/router/index.ts src/bootstrap/index.ts src/bootstrap/router.ts src/config/sso.ts src/config/platform-config.ts src/infra/env.ts src/pages/login/LoginPage.vue src/pages/sso/SsoCallbackPage.vue`
- 首次结果：失败
  - `src/bootstrap/router.ts` 触发 `no-restricted-syntax`（禁止直接读取 `import.meta.env`）。
- 修复：
  - `infra/env.ts` 增加 `baseUrl` 聚合字段；`bootstrap/router.ts` 改为使用 `appEnv.baseUrl`。
- 复跑结果：通过（无 eslint 报错输出）。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
- 结果：通过（`vue-tsc --noEmit` 无类型错误）。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：通过（vitepress v1.6.4，build complete in 28.26s）。

## 2026-03-02（Admin 架构并行优化：fresh verification）

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin exec eslint src/bootstrap/index.ts src/bootstrap/router.ts src/config/platform-config.ts src/config/sso.ts src/infra/env.ts src/pages/login/LoginPage.vue src/pages/sso/SsoCallbackPage.vue src/router/assemble-routes.ts src/router/index.ts src/router/registry.ts src/router/constants.ts src/shared/logger.ts`
- 结果：通过（无 eslint 报错输出）。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
- 结果：通过（`vue-tsc --noEmit` 无类型错误）。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：通过（vitepress v1.6.4，build complete in 8.00s）。

## 2026-03-02（Admin 架构文档一致性修正复验）

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：通过（vitepress v1.6.4，build complete in 8.09s）。

## 2026-03-02（Admin 架构下一步：enabledModules 白名单收敛）

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
- 结果：通过（`vue-tsc --noEmit` 无类型错误）。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：通过（vitepress v1.6.4，build complete in 12.83s）。

## 2026-03-02（Admin 架构下一步：模块分层策略）

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin exec eslint src/router/types.ts src/router/registry.ts src/modules/home/module.ts src/modules/b/module.ts src/modules/UserManagement/module.ts src/modules/demo/module.ts src/modules/portal/module.ts`
- 结果：通过（无 eslint 报错输出）。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
- 结果：通过（`vue-tsc --noEmit` 无类型错误）。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：通过（vitepress v1.6.4，build complete in 7.99s）。

## 2026-03-02（架构整改 1/2/3 验证）

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin exec eslint src/main.ts src/config/platform-config.ts src/bootstrap/index.ts src/router/constants.ts`
- 结果：通过（无 eslint 报错输出）。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/core exec eslint src/router/guards.ts`
- 结果：通过（无 eslint 报错输出）。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
- 结果：通过（`vue-tsc --noEmit` 无类型错误）。

- 命令：`pnpm -w build`
- 结果：通过（`turbo run build`，7/7 tasks successful）。
- 备注：存在 Turbo 输出提示（部分包 `build` 无 `dist/**` 产物）与 admin chunk size warning，不影响通过。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：通过（vitepress v1.6.4，build complete in 7.74s）。

## 2026-03-02（执行 1/2/3 后提交）

- 本轮未追加新的命令执行；沿用同日已记录的验证结果（apps/admin 定向 eslint + core guards eslint + admin typecheck + workspace build + docs build）。
- 提交仅为已验证改动的分组落库，不包含额外功能变更。

## 2026-03-02（架构优化：skipMenuAuth 白名单自动推导）

- 命令：
  - `pnpm -C apps/admin exec eslint src/bootstrap/index.ts src/router/constants.ts src/router/index.ts src/router/assemble-routes.ts src/router/types.ts`
  - `pnpm -C packages/core exec eslint src/router/guards.ts`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/docs build`
- 结果：全部通过

## 2026-03-02（架构优化：bootstrap 编排拆分）

- 命令：
  - `pnpm -C apps/admin exec eslint src/bootstrap/index.ts src/bootstrap/plugins.ts src/bootstrap/guards.ts`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/docs build`
- 结果：全部通过

## 2026-03-02（提交所有代码前验证）

- 命令：
  - `pnpm -C apps/admin exec eslint src/bootstrap/router.ts src/config/sso.ts src/infra/env.ts src/modules/UserManagement/module.ts src/modules/b/module.ts src/modules/demo/module.ts src/modules/home/module.ts src/modules/portal/module.ts src/pages/login/LoginPage.vue src/pages/sso/SsoCallbackPage.vue src/router/registry.ts src/shared/logger.ts`
  - `pnpm -C apps/admin typecheck`
- 结果：全部通过

## 2026-03-03（Admin 架构收敛收尾）

- 命令：`pnpm check:naming`
- 结果：通过（命名白名单无违规）

- 命令：`pnpm verify`
- 结果：通过
  - `pnpm typecheck`：通过
  - `pnpm lint`：通过（仅 warning，不阻断）
  - `pnpm test:admin:arch`：通过（2 files / 5 tests）
  - `pnpm check:naming`：通过
  - `pnpm build`：通过

## 2026-03-03（UserManagement page 编排拆分）

- 命令：
  - `pnpm -C apps/admin exec eslint src/modules/UserManagement/user/page.vue src/modules/UserManagement/org/page.vue src/modules/UserManagement/user/composables/useUserCrudState.ts src/modules/UserManagement/user/composables/useUserDialogState.ts src/modules/UserManagement/user/composables/useUserRemoteOptions.ts src/modules/UserManagement/org/composables/useOrgPageState.ts src/modules/UserManagement/org/composables/useOrgTreeOptions.ts`
  - `pnpm -C apps/admin typecheck`
  - `pnpm verify`
- 结果：
  - 定向 eslint：通过
  - admin typecheck：通过
  - verify：通过（lint 阶段仅保留历史 warning）
- 二次验证（可读性收敛后）：
  - `pnpm -C apps/admin exec eslint ...`（上述 UserManagement 相关文件）通过
  - `pnpm -C apps/admin typecheck` 通过
  - `pnpm verify` 通过

## 2026-03-03（UserManagement 页面长链收敛验证）

- 命令：`pnpm -C apps/admin exec eslint src/modules/UserManagement/user/page.vue src/modules/UserManagement/org/page.vue`
- 结果：通过（无 eslint 报错输出）。

- 命令：`pnpm -C apps/admin typecheck`
- 结果：通过（`vue-tsc --noEmit` 无类型错误）。

- 过程记录：
  - 首次 typecheck 出现 `:ref` 类型报错（`SearchRefExpose | CrudFormLike` 非 `VNodeRef`）。
  - 修复方式：页面保持 `refs.xxx` 绑定，避免顶层解构 ref 被模板自动解包。
  - 修复后复跑 typecheck 通过。

## 2026-03-03（UserManagement org：formOptions 分组修正验证）

- 命令：`pnpm -C apps/admin exec eslint src/modules/UserManagement/org/page.vue src/modules/UserManagement/org/composables/useOrgPageState.ts src/modules/UserManagement/user/page.vue`
- 结果：通过（无 eslint 报错输出）。

- 命令：`pnpm -C apps/admin typecheck`
- 结果：通过（`vue-tsc --noEmit` 无类型错误）。

## 2026-03-03（LogManagement 迁移验证）

- 命令：
  - `pnpm -C apps/admin exec eslint src/modules/LogManagement src/modules/UserManagement/role src/modules/UserManagement/role-assign src/modules/UserManagement/user/page.vue src/modules/UserManagement/org/page.vue src/modules/UserManagement/position/page.vue src/modules/UserManagement/org/composables/useOrgPageState.ts`
- 结果：通过（无 eslint 报错输出）。

- 命令：`pnpm -C apps/admin typecheck`
- 结果：通过（`vue-tsc --noEmit` 无类型错误）。

- 命令：`pnpm -C apps/docs build`
- 结果：通过（vitepress build complete）。

## 2026-03-03（LogManagement 路由补漏验证）

- 命令：`pnpm -C apps/admin exec eslint src/modules/LogManagement/routes.ts src/modules/LogManagement/login-log/page.vue src/modules/LogManagement/sys-log/page.vue`
- 结果：通过。

- 命令：`pnpm -C apps/admin typecheck`
- 结果：通过。

## 2026-03-03（UserManagement 角色路由补漏验证）

- 命令：`pnpm -C apps/admin exec eslint src/modules/UserManagement/routes.ts src/modules/UserManagement/role/page.vue src/modules/UserManagement/role/composables/useRolePageState.ts src/modules/UserManagement/role/components/RolePermissionDialog.vue`
- 结果：通过。

- 命令：`pnpm -C apps/admin typecheck`
- 结果：通过。

## 2026-03-03（路由防漏规则补充验证）

- 命令：`rg -n "角色分配|/system/role/assign|有路由指向不存在页面|Route anti-miss" AGENTS.md .codex/skills/crud-module-best-practice/SKILL.md`
- 结果：通过，新增规则已命中并落盘。

- 命令：`rg --files apps/admin/src/modules/UserManagement -g '**/page.vue' | sort`
- 结果：通过，当前仅存在 `user/org/position/role` 四个页面。

- 命令：`rg -n "component:\\s*\\(\\)\\s*=>\\s*import\\(" apps/admin/src/modules/UserManagement/routes.ts`
- 结果：通过，当前仅注册 `user/org/position/role` 四条页面路由；与现有页面文件一致。

- 命令：`pnpm -C apps/docs build`
- 结果：通过（vitepress 构建成功，build complete）。

## 2026-03-03（UserManagement 角色分配迁移验证）

- 命令（首轮）：
  - `pnpm -w typecheck`
  - `pnpm -w lint`
  - `pnpm -w build`
  - `pnpm -C apps/docs build`
- 结果（首轮）：
  - `typecheck`：失败（`apps/admin/src/modules/UserManagement/role-assign/composables/useRoleAssignPageState.ts` 参数类型收窄问题）
  - `lint/build/docs build`：通过（lint 仅历史 warning）

- 命令（二轮修复后复验）：
  - `pnpm -w typecheck`
  - `pnpm -w lint`
  - `pnpm -w build`
  - `pnpm -C apps/docs build`
- 结果（二轮）：
  - 四项全部通过

## 2026-03-03（RoleAssign 添加人员交互对齐：测试记录）

- 命令：
  - `pnpm -C apps/admin exec eslint src/modules/UserManagement/role-assign/page.vue src/modules/UserManagement/role-assign/composables/useRoleAssignPageState.ts src/modules/UserManagement/role-assign/components/RoleAssignMemberSelectForm.vue src/modules/UserManagement/role-assign/api.ts`
- 结果：通过（无 error）；存在 1 条历史规则告警：`RoleAssignMemberSelectForm.vue` 触发 `max-lines` warning。

- 命令：`pnpm -C apps/admin typecheck`
- 结果：通过（`vue-tsc --noEmit` 无类型错误）。

- 命令：`pnpm -C apps/docs build`
- 结果：通过（vitepress build complete）。

## 2026-03-03（RoleAssign 添加人员弹窗样式优化：测试记录）

- 命令：`pnpm -C apps/admin exec eslint src/modules/UserManagement/role-assign/components/RoleAssignMemberSelectForm.vue`
- 结果：通过（无 error）；存在 `max-lines` warning（517 行 > 360 行）。

- 命令：`pnpm -C apps/admin typecheck`
- 结果：通过（`vue-tsc --noEmit` 无类型错误）。

## 2026-03-03（RoleAssign 并行前端细化：测试记录）

- 命令：`pnpm -C apps/admin exec eslint src/modules/UserManagement/role-assign/components/RoleAssignMemberSelectForm.vue`
- 结果：通过（无 error）；存在 `max-lines` warning（652 行 > 360 行）。

- 命令：`pnpm -C apps/admin typecheck`
- 结果：通过（`vue-tsc --noEmit` 无类型错误）。

- 命令：`pnpm -C apps/docs build`
- 结果：通过（vitepress build complete）。

## 2026-03-03（角色分配选人弹层 UI/复用组件沉淀）

- 命令：
  - `pnpm -C apps/admin exec eslint src/modules/UserManagement/shared/components/personnel-selector src/modules/UserManagement/role-assign/components/RoleAssignMemberSelectForm.vue`
  - `pnpm -C apps/admin exec eslint src/components/PersonnelSelector src/modules/UserManagement/role-assign/components/RoleAssignMemberSelectForm.vue src/modules/UserManagement/role-assign/composables/useRoleAssignPageState.ts`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/docs build`
- 结果：
  - `eslint`：通过
  - `typecheck`：通过
  - `docs build`：通过
- 追加验证：
  - `pnpm -C apps/admin build`
  - 结果：通过

## 2026-03-03（函数式 openPersonnelSelection 封装）

- 命令：
  - `pnpm -C apps/admin exec eslint src/components/PersonnelSelector src/bootstrap/index.ts src/modules/UserManagement/role-assign/components/RoleAssignMemberSelectForm.vue src/modules/UserManagement/role-assign/composables/useRoleAssignPageState.ts`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs build`
- 结果：
  - `eslint`：通过
  - `typecheck`：通过
  - `build`：通过
  - `docs build`：通过

## 2026-03-03（角色分配页左侧角色区视觉优化）

- 命令：
  - `pnpm -C apps/admin exec eslint src/modules/UserManagement/role-assign/page.vue`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs build`
- 结果：
  - `eslint`：通过
  - `typecheck`：通过
  - `build`：通过
  - `docs build`：通过

## 2026-03-03（角色分配页左侧插槽化与样式收敛）

- 命令：`pnpm -C apps/admin exec eslint src/modules/UserManagement/role-assign/page.vue`
- 结果：通过。

- 命令：`pnpm -C apps/admin typecheck`
- 结果：通过（`vue-tsc --noEmit`）。

- 命令：`pnpm -C apps/admin build`
- 结果：通过（存在既有 chunk size / plugin timing 警告，不阻断构建）。

- 命令：`pnpm -C apps/docs build`
- 结果：通过（vitepress build complete）。

## 2026-03-03（角色分配页左侧容器样式微调）

- 命令：`pnpm -C apps/admin exec eslint src/modules/UserManagement/role-assign/page.vue`
- 结果：通过。

- 命令：`pnpm -C apps/admin typecheck`
- 结果：通过（`vue-tsc --noEmit`）。

## 2026-03-03（角色分配页左侧容器内边距调整）

- 命令：`pnpm -C apps/admin exec eslint src/modules/UserManagement/role-assign/page.vue`
- 结果：通过。

- 命令：`pnpm -C apps/admin typecheck`
- 结果：通过（`vue-tsc --noEmit`）。

## 2026-03-03（角色分配左侧去右边框 + 全局 loading 蒙层透明）

- 命令：
  - `pnpm -C apps/admin exec eslint src/main.ts src/modules/UserManagement/role-assign/page.vue`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs build`
- 结果：
  - `eslint`：通过
  - `typecheck`：通过
  - `admin build`：通过（存在既有 chunk size / plugin timing 警告，不阻断）
  - `docs build`：通过

## 2026-03-03（全局 loading 图标统一）

- 命令：
  - `pnpm -C apps/admin exec eslint src/main.ts`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs build`
- 结果：
  - `eslint`：通过
  - `typecheck`：通过
  - `admin build`：通过（存在既有 chunk size / plugin timing 警告，不阻断）
  - `docs build`：通过

## 2026-03-03（角色分配左侧无圆角一致性收敛）

- 命令：
  - `pnpm -C apps/admin exec eslint src/modules/UserManagement/role-assign/page.vue`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/docs build`
- 结果：
  - `eslint`：通过
  - `typecheck`：通过
  - `docs build`：通过

## 2026-03-03（提交前最终校验与提交）

- 提交前沿用当日已通过校验：
  - `pnpm -C apps/admin typecheck` ✅
  - `pnpm -C apps/admin build` ✅
  - `pnpm -C apps/docs build` ✅
- 提交后状态：`git status` 工作区干净。

## 2026-03-03（SystemManagement：菜单管理 + 字典管理迁移）

- 命令：`pnpm -w typecheck`
- 结果：通过。

- 命令：`pnpm -w lint`
- 结果：通过（存在历史 warning：`max-lines`、`vue/no-required-prop-with-default`，非本次新增）。

- 命令：`pnpm -w build`
- 结果：通过（存在历史构建 warning：chunk size / plugin timing，不阻断）。

- 命令：`pnpm -C apps/docs build`
- 结果：通过。

## 2026-03-03（表格工具条命名收敛：TableBox）

- 命令：`pnpm -w typecheck`
- 结果：通过。

- 命令：`pnpm -w lint`
- 结果：通过（历史 warning 保留，非本次引入）。

- 命令：`pnpm -w build`
- 结果：通过（历史构建 warning 保留，非本次引入）。

- 命令：`pnpm -C apps/docs build`
- 结果：通过。

## 2026-03-03（全局组件命名统一：Ob 前缀）

- 命令：`pnpm -w typecheck`
- 结果：通过。

- 命令：`pnpm -w lint`
- 结果：通过（存在历史 warning：`max-lines`、`vue/no-required-prop-with-default`，非本次改动引入）。

- 命令：`pnpm -w build`
- 结果：通过（存在历史 chunk size 告警，不阻断构建）。

- 命令：`pnpm -C apps/docs build`
- 结果：通过（VitePress build complete）。

## 2026-03-03（菜单管理图标选择器 + Iconify 离线）

- 命令：`pnpm install`
- 结果：通过（新增依赖已安装并更新 lockfile）。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui typecheck`
- 结果：通过。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui lint`
- 结果：通过。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
- 结果：通过。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin lint`
- 结果：通过（保留历史 `max-lines` warning，未新增 error）。

- 命令：`pnpm -w build`
- 结果：通过（保留历史 chunk size warning，不阻断构建）。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：通过。

## 2026-03-03（菜单管理图标选择器文案/尺寸优化）

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
- 结果：通过（`vue-tsc --noEmit`）。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin lint`
- 结果：通过（0 error，9 条历史 `max-lines` warning，均为既有文件，非本次改动引入）。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：通过（vitepress build complete）。

## 2026-03-03（菜单管理图标输入区视觉二次优化）

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
- 结果：通过（`vue-tsc --noEmit`）。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin lint`
- 结果：通过（0 error，保留 9 条历史 `max-lines` warning，非本次改动引入）。

## 2026-03-03（菜单管理图标输入区风格对齐修正）

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
- 结果：通过（`vue-tsc --noEmit`）。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin lint`
- 结果：通过（0 error，9 条历史 `max-lines` warning，非本次改动引入）。

## 2026-03-03（菜单管理图标输入区：简约触发器收敛）

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
- 结果：通过（`vue-tsc --noEmit`）。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin lint`
- 结果：通过（0 error，9 条历史 `max-lines` warning，非本次改动引入）。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：通过（vitepress build complete）。
- 追调命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
- 追调结果：通过（将触发按钮图标调整为 `Filter` 后无类型回归）。
- 追调命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin lint`
- 追调结果：通过（0 error，9 条历史 `max-lines` warning）。

## 2026-03-03（菜单管理图标触发器：右侧插槽化 + 尺寸对齐）

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
- 结果：通过（`vue-tsc --noEmit`）。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin lint`
- 结果：通过（0 error，9 条历史 `max-lines` warning，非本次改动引入）。

## 2026-03-03（菜单管理图标输入：30px 对齐 + 宽度稳定）

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
- 结果：通过（`vue-tsc --noEmit`）。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin lint`
- 结果：通过（0 error，9 条历史 `max-lines` warning，非本次改动引入）。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：通过（vitepress build complete）。

## 2026-03-03（菜单管理图标输入：宽度与删除按钮修复）

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
- 结果：通过（`vue-tsc --noEmit`）。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin lint`
- 结果：通过（0 error，9 条历史 `max-lines` warning，非本次改动引入）。

## 2026-03-04（lint-ruleset 子包 + docs 同步）

- 命令：`pnpm install`
- 结果：通过（新增 `packages/lint-ruleset` 依赖并更新 lockfile）。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/lint-ruleset lint:code`
- 结果：通过（存在 1 条 `security/detect-non-literal-fs-filename` warning，不阻断）。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/lint-ruleset lint:style`
- 结果：通过。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/lint-ruleset lint:legacy:css`
- 结果：通过（无 CSS 文件，脚本按预期提示“跳过 Csslint 检查”）。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/lint-ruleset lint:all`
- 结果：通过。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs lint`
- 结果：通过。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：通过（vitepress build complete）。

## 2026-03-04（lint-ruleset 可发布化 + changesets）

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/lint-ruleset lint:all`
- 结果：通过（ESLint/Stylelint/Csslint 均通过；无 CSS 文件时按预期跳过 legacy 检查）。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs lint`
- 结果：通过。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：通过（vitepress build complete）。

- 命令：`pnpm changeset status`
- 结果：通过（识别 `@one-base-template/lint-ruleset` 将执行 patch 升级）。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/lint-ruleset pack --dry-run`
- 结果：通过（发布包内容清单符合预期，未落地 tgz 文件）。

## 2026-03-04（规则治理汇报文档页）

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs lint`
- 结果：通过。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：通过（vitepress build complete）。

## 2026-03-04（汇报口径修正：Vue 全量 + 映射口径）

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs lint`
- 结果：通过。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：通过（vitepress build complete）。

## 2026-03-04（全量映射脚本与口径修正）

- 命令：`node /Users/haoqiuzhi/code/one-base-template/packages/lint-ruleset/scripts/generate-full-mapping.mjs --multi /tmp/rules-out-multi/rules-20260303-211347.json --css /tmp/rules-out-css/rules-20260303-211416.json`
- 结果：通过（生成全量映射，统计为 total=1968 / direct=461 / partial=578 / none=929）。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/lint-ruleset lint:all`
- 结果：通过（0 error，6 条 security 规则 warning）。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs lint`
- 结果：通过。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：通过（vitepress build complete）。

## 2026-03-04（第一批补齐后重算全量映射）

- 命令：`node /Users/haoqiuzhi/code/one-base-template/packages/lint-ruleset/scripts/generate-full-mapping.mjs --multi /tmp/rules-out-multi/rules-20260303-211347.json --css /tmp/rules-out-css/rules-20260303-211416.json`
- 结果：通过（统计更新为 total=1968 / direct=584 / partial=580 / none=804）。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/lint-ruleset lint:all`
- 结果：通过（0 error，保留 6 条 security 相关 warning）。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs lint`
- 结果：通过。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：通过（vitepress build complete）。

## 2026-03-04（全量统计口径收尾验证）

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/lint-ruleset lint:all`
- 结果：通过（ESLint/Stylelint/Csslint 执行成功；无 CSS 文件时按预期提示“跳过 Csslint 检查”）。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs lint`
- 结果：通过。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：通过（vitepress build complete）。

## 2026-03-04（AGENTS 规则分层改造）

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs lint`
- 结果：通过。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：通过（vitepress build complete）。

## 2026-03-04（提交后回归：AGENTS 分层）

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs lint`
- 结果：通过。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：通过（vitepress build complete）。

## 2026-03-04（Vue 基线对齐与 deprecated 规则处理）

- 命令：`node /Users/haoqiuzhi/code/one-base-template/packages/lint-ruleset/scripts/generate-full-mapping.mjs --multi /tmp/rules-out-multi/rules-20260303-211347.json --css /tmp/rules-out-css/rules-20260303-211416.json`
- 结果：通过（生成全量映射 + Vue 基线映射；统计为 total=1968 / direct=626 / partial=584 / none=758 / actionable-none=754）。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/lint-ruleset lint:all`
- 结果：通过。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs lint && pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：通过（vitepress build complete）。

## 2026-03-04（Stylelint CSS244 覆盖推进）

- 命令：
  - `pnpm -C packages/lint-ruleset lint:style`
  - `pnpm -C packages/lint-ruleset lint:all`
  - `pnpm -C packages/lint-ruleset mapping:full -- --multi /tmp/rules-out-multi/rules-20260303-211347.json --css /tmp/rules-out-css/rules-20260303-211416.json`
  - `jq '.summary.byTool.Stylelint, .summary.byStatus, .summary.total' packages/lint-ruleset/mappings/full-frontend-summary.json`
  - `awk -F',' 'NR>1 && $2=="CSS" && ($1=="Stylelint"||$1=="Csslint"||$1=="Sonar") {total++; key=$1":"$6; c[key]++} END {print "CSS244_TOTAL", total; for (k in c) print k, c[k]}' packages/lint-ruleset/mappings/full-frontend-all-rules.csv | sort`
- 结果：
  - `lint:style`：通过
  - `lint:all`：通过
  - `mapping:full`：生成成功（total=1968，direct=675，partial=646，none=647）
  - Stylelint byTool：`direct=123 / partial=72 / none=0`
  - CSS244：`direct=157 / partial=83 / none=4`

## 2026-03-04（ESLint 规则按语言拆分后回归）

- 命令：`node /Users/haoqiuzhi/code/one-base-template/packages/lint-ruleset/scripts/generate-full-mapping.mjs --multi /tmp/rules-out-multi/rules-20260303-211347.json --css /tmp/rules-out-css/rules-20260303-211416.json`
- 结果：通过（统计更新为 total=1968 / direct=1273 / partial=637 / none=58 / actionable-none=54）。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/lint-ruleset lint:all`
- 结果：通过。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs lint && pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：通过（vitepress build complete）。

## 2026-03-04（JSxxx 映射字典回归）

- 命令：`node /Users/haoqiuzhi/code/one-base-template/packages/lint-ruleset/scripts/generate-full-mapping.mjs --multi /tmp/rules-out-multi/rules-20260303-211347.json --css /tmp/rules-out-css/rules-20260303-211416.json`
- 结果：通过（统计更新为 total=1968 / direct=1295 / partial=665 / none=8 / actionable-none=4）。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/lint-ruleset lint:all`
- 结果：通过。

- 命令：`pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs lint && pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：通过（vitepress build complete）。

## 2026-03-04（Csslint 剩余 4 条自定义 Stylelint 规则）

- RED（先失败）：
  - `pnpm -C packages/lint-ruleset exec node ./scripts/verify-custom-csslint-rules.mjs`
  - 结果：失败（自定义插件文件未创建，配置报错）
- GREEN（实现后通过）：
  - `pnpm -C packages/lint-ruleset verify:custom:stylelint`：通过
  - `pnpm -C packages/lint-ruleset lint:all`：通过
  - `pnpm -C packages/lint-ruleset mapping:full -- --multi /tmp/rules-out-multi/rules-20260303-211347.json --css /tmp/rules-out-css/rules-20260303-211416.json`：通过
  - `pnpm -C packages/lint-ruleset pack --dry-run`：通过（tarball 包含 `rules/stylelint/csslint-compat-rules.mjs`）
  - `pnpm -C apps/docs lint`：通过
  - `pnpm -C apps/docs build`：通过

## 2026-03-04（取消严格档后回归）

- 命令：`pnpm -C packages/lint-ruleset verify:custom:stylelint`
- 结果：通过（输出：`自定义 Csslint 兼容规则验证通过。`）。

- 命令：`pnpm -C packages/lint-ruleset lint:all`
- 结果：通过（`lint:code` + `lint:style` + `lint:legacy:css`；无 CSS 文件时按预期提示“跳过 Csslint 检查”）。

- 命令：`pnpm -C apps/docs lint`
- 结果：通过。

- 命令：`pnpm -C apps/docs build`
- 结果：通过（vitepress build complete）。

## 2026-03-04（领导汇报材料增强后验证）

- 命令：`pnpm -C apps/docs lint`
- 结果：通过（exit code 0）。

- 命令：`pnpm -C apps/docs build`
- 结果：通过（exit code 0，vitepress build complete in 9.86s）。

## 2026-03-04（汇报材料二次增强后验证）

- 命令：`pnpm -C apps/docs lint`
- 结果：通过（exit code 0）。

- 命令：`pnpm -C apps/docs build`
- 结果：通过（exit code 0，vitepress build complete in 6.41s）。

## 2026-03-04（按爬取语言维度修正后验证）

- 命令：`pnpm -C apps/docs lint`
- 结果：通过（exit code 0）。

- 命令：`pnpm -C apps/docs build`
- 结果：通过（exit code 0，vitepress build complete in 6.54s）。

## 2026-03-04（lint-ruleset 集成验证）

- 首轮复现（发现阻塞）：
  - `pnpm -C apps/docs lint`
  - 结果：失败
  - 关键信息：`@typescript-eslint/await-thenable` 需要类型信息（`parserOptions.project`），在 docs Vue 示例文件触发。

- 修复后复跑（通过）：
  - `pnpm -C apps/docs lint`
  - 结果：通过（0 error）

- 管理端回归：
  - `pnpm -C apps/admin lint`
  - 结果：通过（0 error，9 条历史 warning）

- 全仓验证：
  - `pnpm lint`
  - 结果：通过（turbo 7/7 成功，0 error；存在历史 warning）

- 子包可用性验证：
  - `pnpm -C packages/lint-ruleset lint:all`
  - 结果：通过（0 error，3 条 import/order warning）

## 2026-03-04（admin 范围 lint 验证）

- 命令：`pnpm install`
- 结果：通过（workspace 依赖解析完成）。

- 命令：`pnpm -C apps/admin lint:code`
- 首轮结果：失败（`one-statement-per-line` 失效，后续清理）。

- 命令：`pnpm -C apps/admin lint:code`
- 二轮结果：失败（`@typescript-eslint/ban-types` 不存在，后续增加规则存在性过滤）。

- 命令：`pnpm -C apps/admin lint:code`
- 三轮结果：失败（`@typescript-eslint/await-thenable` 需要 type-checking，后续增加 type-aware 规则过滤）。

- 命令：`pnpm -C apps/admin lint:code`
- 最终结果：通过（`eslint . --quiet`）。

- 命令：`pnpm -C apps/admin lint:style`
- 首轮结果：失败（stylelint 插件路径相对解析错误，后续改为 `extends` 方式）。

- 命令：`pnpm -C apps/admin lint:style`
- 二轮结果：失败（Stylelint 17 下存在失效规则配置，后续清理 `packages/lint-ruleset/stylelint.config.cjs`）。

- 命令：`pnpm -C apps/admin lint:style`
- 最终结果：通过（`stylelint ... --quiet`）。

- 命令：`pnpm -C apps/admin lint`
- 结果：通过（admin 范围 lint 验证完成）。

- 命令：`pnpm -C apps/docs lint && pnpm -C apps/docs build`
- 结果：通过（文档站 lint/build 均通过）。

## 2026-03-04（ESLint 10 升级后回归验证）

- 命令：`pnpm up -r eslint @eslint/js eslint-plugin-vue typescript-eslint @typescript-eslint/parser vue-eslint-parser eslint-plugin-n --latest`
- 结果：通过（升级完成；记录 `eslint-plugin-import` 对 eslint@10 的 peer 提示）。

- 命令：`pnpm -C apps/admin lint`
- 首轮结果：失败（`no-useless-assignment` 新增校验触发）。

- 命令：`pnpm -C packages/lint-ruleset mapping:full -- --multi /tmp/rules-out-multi/rules-20260303-211347.json --css /tmp/rules-out-css/rules-20260303-211416.json`
- 结果：通过（输出最新 summary）。

- 命令：`pnpm -C apps/admin lint`
- 结果：通过（修复 `no-useless-assignment` 后）。

- 命令：`pnpm -C packages/lint-ruleset lint:all`
- 结果：通过。

- 命令：`pnpm lint`
- 结果：通过（全仓 lint 通过，保留历史 warning）。

- 命令：`pnpm -C apps/docs lint && pnpm -C apps/docs build`
- 结果：通过。

## 2026-03-04（stylelint 同名覆盖禁用后验证）

- 命令：`pnpm -C apps/admin lint:style`
- 结果：失败（111 errors）。
- 说明：失败原因是历史样式未满足团队规则；已确认本地不再覆盖团队同名规则。

## 2026-03-04（按模块渐进门禁验证）

- 命令：`pnpm -C apps/admin lint`
- 结果：通过（exit 0）
- 关键信息：
  - `lint:code:phase1` 输出 `188 warnings`（`home,b`），warning 可见。
  - `lint:code:phase2:quiet` 仅做 error 阻断（当前通过）。
  - `lint:style:phase1` 通过。

- 命令：`pnpm -C apps/admin lint:code:audit`
- 结果：通过（exit 0）
- 关键信息：phase2 范围 warning 暴露（输出已重定向 `/tmp/admin-lint-code-audit.log`）。

- 命令：`pnpm -C apps/admin lint:style:audit`
- 结果：通过（脚本含 `|| true`）
- 关键信息：phase2 backlog 当前 `111 errors`，作为下一轮样式治理输入。

- 命令：`pnpm -C packages/lint-ruleset lint:all`
- 结果：通过（exit 0）。

- 命令：`pnpm -C apps/docs lint`
- 结果：通过（exit 0）。

- 命令：`pnpm -C apps/docs build`
- 结果：通过（exit 0）。

## 2026-03-04（缺口规则推进验证）

- 命令：`pnpm -C packages/lint-ruleset mapping:full -- --multi /tmp/rules-out-multi/rules-20260303-211347.json --css /tmp/rules-out-css/rules-20260303-211416.json`
- 结果：通过。
- 关键信息：`direct=1142`、`partial=634`、`none=192`、`actionableNone=188`。

- 命令：`pnpm -C packages/lint-ruleset mapping:gap-catalog`
- 结果：通过。
- 关键信息：生成 `mappings/full-frontend-gap-catalog.json`。

- 命令：`pnpm -C packages/lint-ruleset lint:all`
- 结果：通过。

- 命令：`pnpm -C apps/admin lint`
- 结果：通过（phase1 188 warnings，0 errors）。

- 命令：`pnpm -C apps/docs lint && pnpm -C apps/docs build`
- 结果：通过。

- 复跑命令：`pnpm -C packages/lint-ruleset mapping:gap-catalog && pnpm -C packages/lint-ruleset lint:all`
- 结果：通过（gap 清单按最新 `none=192` 重建）。

- 复跑命令：`pnpm -C apps/admin lint`
- 结果：通过（0 error，phase1 188 warnings 可见）。

- 复跑命令：`pnpm -C apps/docs lint && pnpm -C apps/docs build`
- 结果：通过。

## 2026-03-04（移除/重命名并入废弃口径复核）

- 命令：`pnpm -C packages/lint-ruleset mapping:gap-catalog`
- 结果：通过。
- 关键信息：`deprecatedCount=14`，其中 `officialDeprecatedCount=4`、`removedOrRenamedCount=10`；`actionableNoneMergedDeprecated=178`。

- 命令：`pnpm -C packages/lint-ruleset lint:all`
- 结果：通过。

- 命令：`pnpm -C apps/docs lint && pnpm -C apps/docs build`
- 结果：通过。

## 2026-03-04（继续压缩缺口验证）

- 命令：`pnpm -C packages/lint-ruleset mapping:full -- --multi /tmp/rules-out-multi/rules-20260303-211347.json --css /tmp/rules-out-css/rules-20260303-211416.json`
- 结果：通过。
- 关键信息：`direct=1182`、`partial=697`、`none=89`、`actionableNoneOfficial=85`。

- 命令：`pnpm -C packages/lint-ruleset mapping:gap-catalog`
- 结果：通过。
- 关键信息：`actionableNoneMergedDeprecated=75`，Stylelint 剩余缺口收敛为 `needsOptions=30`。

- 命令：`pnpm -C packages/lint-ruleset lint:all`
- 结果：通过。

- 命令：`pnpm -C apps/admin lint`
- 结果：通过（phase1 188 warnings，0 errors）。

- 命令：`pnpm -C apps/docs lint && pnpm -C apps/docs build`
- 结果：通过。

## 2026-03-04（剩余 75 压缩：模板与 typed 分模块）

- 命令：`pnpm -C packages/lint-ruleset lint:style`
- 结果：通过（exit 0）。

- 命令：`pnpm -C packages/lint-ruleset mapping:full -- --multi /tmp/rules-out-multi/rules-20260303-211347.json --css /tmp/rules-out-css/rules-20260303-211416.json`
- 结果：通过。
- 关键信息：`direct=1212`、`partial=742`、`none=14`、`actionableNoneOfficial=10`。

- 命令：`pnpm -C packages/lint-ruleset mapping:gap-catalog`
- 结果：通过。
- 关键信息：`actionableNoneMergedDeprecated=0`，Stylelint `needsOptions=0`。

- 命令：`pnpm -C packages/lint-ruleset lint:all`
- 结果：通过（exit 0）。

- 命令：`pnpm -C apps/admin lint`
- 结果：通过（exit 0）。
- 关键信息：phase1 warnings 可见；phase2 quiet 仅阻断 error。

- 命令：`pnpm -C apps/admin lint:code:audit`
- 结果：通过（exit 0）。
- 关键信息：typed 规则在 phase2 审计输出中可见，产生大量 warning（无 error）。

- 命令：`pnpm -C apps/admin lint:style:audit > /tmp/admin-style-audit-20260304.log 2>&1`
- 结果：脚本出口 0（内部 stylelint exit 2 被 `|| true` 吸收）。
- 关键信息：backlog 仍为 `111 errors`、`2517 warnings`。

- 命令：`pnpm -C apps/docs lint`
- 结果：通过（exit 0）。

- 命令：`pnpm -C apps/docs build`
- 结果：通过（exit 0）。

## 2026-03-04（phase2 -> phase1 首批迁移执行）

- 命令：`pnpm -C apps/admin exec stylelint "src/modules/demo/pages/DemoConfirmPage.vue" "src/modules/UserManagement/org/components/OrgLevelManageDialog.vue" --formatter compact --allow-empty-input`
- 结果：用于定位 error，确认两文件共 4 个 `color-hex-length` error。

- 命令：`pnpm -C apps/admin lint:style`
- 结果：通过（exit 0）。
- 关键信息：`home,b,LogManagement,UserManagement,demo` 进入 phase1 后为 warning 可见，0 error。

- 命令：`pnpm -C apps/admin lint:style:phase2:audit > /tmp/admin-style-phase2-audit-after.log 2>&1`
- 结果：失败（exit 2，符合 audit 预期）。
- 关键信息：phase2 backlog 从 `111 errors` 下降到 `107 errors`，warnings 为 `2243`。

- 命令：`pnpm -C apps/admin lint`
- 结果：通过（exit 0）。

- 命令：`pnpm -C apps/docs lint && pnpm -C apps/docs build`
- 结果：通过（exit 0）。

## 2026-03-04（SystemManagement 样式迁移验证）

- 命令：`pnpm -C apps/admin exec stylelint "src/modules/SystemManagement/**/*.{css,scss,vue}" --allow-empty-input --formatter compact`
- 结果：通过（exit 0）。
- 关键信息：`SystemManagement` 范围已无 stylelint error（仅 warning）。

- 命令：`pnpm -C apps/admin lint:style`
- 结果：通过（exit 0）。
- 关键信息：phase1 已含 `SystemManagement`，当前 `414 warnings, 0 errors`。

- 命令：`pnpm -C apps/admin lint:style:phase2:audit > /tmp/admin-style-phase2-audit-after-system.log 2>&1`
- 结果：失败（exit 2，符合 audit 预期）。
- 关键信息：phase2 backlog 为 `60 errors, 598 warnings`。

- 命令：`pnpm -C apps/admin lint`
- 结果：通过（exit 0）。

- 命令：`pnpm -C apps/docs lint`
- 结果：通过（exit 0）。

- 命令：`pnpm -C apps/docs build`
- 结果：通过（exit 0）。

## 2026-03-04（phase2 阻断项清零验证）

- 命令：`pnpm -C apps/admin exec stylelint "src/{styles,components,pages}/**/*.{css,scss,vue}" "src/modules/{portal}/**/*.{css,scss,vue}" --allow-empty-input --formatter compact`
- 结果：通过（exit 0）。
- 关键信息：phase2 范围 `0 errors`（仅 warning）。

- 命令：`pnpm -C apps/admin lint:style`
- 结果：通过（exit 0）。
- 关键信息：phase1 `414 warnings, 0 errors`。

- 命令：`pnpm -C apps/admin lint:style:phase2:audit`
- 结果：通过（exit 0）。
- 关键信息：phase2 `598 warnings, 0 errors`。

- 命令：`pnpm -C apps/admin lint`
- 结果：通过（exit 0）。

## 2026-03-04（portal 阻断项清理 + phase2 脚本修正）

- 命令：`pnpm -C apps/admin exec stylelint "src/{styles,components,pages}/**/*.{css,scss,vue}" "src/modules/portal/**/*.{css,scss,vue}" --allow-empty-input --formatter compact`
- 结果：通过（exit 0）。
- 关键信息：`0 errors, 2102 warnings`。

- 命令：`pnpm -C apps/admin lint:style:phase2:audit`
- 结果：通过（exit 0）。
- 关键信息：`2102 warnings, 0 errors`。

- 命令：`pnpm -C apps/admin lint:style`
- 结果：通过（exit 0）。
- 关键信息：phase1 `414 warnings, 0 errors`。

- 命令：`pnpm -C apps/admin lint`
- 结果：通过（exit 0）。

- 命令：`pnpm -C apps/docs lint`
- 结果：通过（exit 0）。

- 命令：`pnpm -C apps/docs build`
- 结果：通过（exit 0）。

## 2026-03-04（portal 迁入 phase1 后回归）

- 命令：`pnpm -C apps/admin lint:style`
- 结果：通过（exit 0）。
- 关键信息：phase1（含 portal）`1918 warnings, 0 errors`。

- 命令：`pnpm -C apps/admin lint:style:phase2:audit`
- 结果：通过（exit 0）。
- 关键信息：phase2（仅 `src/{styles,components,pages}`）`598 warnings, 0 errors`。

- 命令：`pnpm -C apps/admin lint`
- 结果：通过（exit 0）。

- 命令：`pnpm -C apps/docs lint`
- 结果：通过（exit 0）。

- 命令：`pnpm -C apps/docs build`
- 结果：通过（exit 0）。

## 2026-03-04（declaration-block-semicolon 规则收口回归）

- 命令：`pnpm -C packages/lint-ruleset lint:all`
- 结果：通过（exit 0）。
- 关键信息：规则集构建与配置校验通过，未引入新的规则冲突。

- 命令：`pnpm -C apps/admin lint:style:phase2:audit`
- 结果：通过（exit 0）。
- 关键信息：phase2 范围通过；补充以 compact 口径复核为 `181 warnings, 0 errors`（见 `/tmp/admin-style-phase2-compact-docsync.log`）。

- 命令：`pnpm -C apps/admin lint:style`
- 结果：通过（exit 0）。
- 关键信息：当前 phase1 样式门禁 `193 warnings, 0 errors`（见 `/tmp/admin-style-phase1-compact-docsync.log`）。

- 命令：`pnpm -C apps/admin lint`
- 结果：通过（exit 0）。
- 关键信息：代码 + 样式联合门禁 `0 errors`（warning 可见）。

- 命令：`pnpm -C apps/docs lint`
- 结果：通过（exit 0）。

- 命令：`pnpm -C apps/docs build`
- 结果：通过（exit 0）。

## 2026-03-04（爬取规则“仅名称无参数”审计 + 参数模板首批补齐）

- 命令：`node --input-type=module`（位于 `packages/lint-ruleset`，统计平台规则中“支持 options 但仅配置级别”的规则数量）
- 结果：通过（exit 0）。
- 关键信息：`all=578, optionableNoParams=325`（JS `158`、TS `34`、Vue `133`）。

- 命令：`pnpm -C packages/lint-ruleset lint:all`
- 结果：通过（exit 0）。

- 命令：`pnpm -C apps/admin lint`
- 结果：通过（exit 0）。
- 关键信息：联合门禁保持 `0 errors`（warning 可见）。

- 命令：`pnpm -C apps/docs lint`
- 结果：通过（exit 0）。

- 命令：`pnpm -C apps/docs build`
- 结果：通过（exit 0）。

## 2026-03-04（最佳实践复核：规则合理性调整）

- 命令：`pnpm -C packages/lint-ruleset lint:all`
- 结果：通过（exit 0）。

- 命令：`pnpm -C apps/admin lint:style:phase2:audit`
- 结果：通过（exit 0）。
- 关键信息：phase2 warning 从 `181` 降至 `180`（error 保持 `0`）。

- 命令：`pnpm -C apps/admin lint:style`
- 结果：通过（exit 0）。
- 关键信息：phase1 warning 从 `193` 降至 `191`（error 保持 `0`）。

- 命令：`pnpm -C apps/admin lint`
- 结果：通过（exit 0）。

- 命令：`pnpm -C apps/docs lint && pnpm -C apps/docs build`
- 结果：通过（exit 0）。

## 2026-03-04（第二批参数模板补齐：Vue 优先 20 条）

- 命令：`node --input-type=module`（位于 `packages/lint-ruleset`，复算“支持 options 但仅配置级别”数量）
- 结果：通过（exit 0）。
- 关键信息：`optionableNoParams` 从 `325` 下降到 `305`（JS `158`、TS `26`、Vue `121`）。

- 命令：`pnpm -C packages/lint-ruleset lint:all`
- 结果：通过（exit 0）。

- 命令：`pnpm -C apps/admin lint:code:phase1`
- 结果：通过（exit 0）。
- 关键信息：代码 warning 由 `192` 收敛到 `184`（error 维持 `0`）。

- 命令：`pnpm -C apps/admin exec stylelint \"src/{styles,components,pages}/**/*.{css,scss,vue}\" --allow-empty-input --formatter compact`
- 结果：通过（exit 0）。
- 关键信息：phase2 style warning `180`（error `0`）。

- 命令：`pnpm -C apps/admin lint:style`
- 结果：通过（exit 0）。
- 关键信息：phase1 style warning `191`（error `0`）。

- 命令：`pnpm -C apps/admin lint`
- 结果：通过（exit 0）。

- 命令：`pnpm -C apps/docs lint && pnpm -C apps/docs build`
- 结果：通过（exit 0）。

## 2026-03-04（第三批参数模板补齐：JS 高频 20 条）

- 命令：`node --input-type=module`（位于 `packages/lint-ruleset`，复算“支持 options 但仅配置级别”的数量）
- 结果：通过（exit 0）。
- 关键信息：`optionableNoParams` 从 `305` 下降到 `286`（JS `139`、TS `26`、Vue `121`）。

- 命令：`pnpm -C packages/lint-ruleset lint:all`
- 结果：通过（exit 0）。

- 命令：`pnpm -C apps/admin lint:code:phase1`
- 结果：通过（exit 0）。
- 关键信息：代码 warning 维持 `184`（error `0`）。

- 命令：`pnpm -C apps/admin lint`
- 结果：通过（exit 0）。

- 命令：`pnpm -C apps/docs lint && pnpm -C apps/docs build`
- 结果：通过（exit 0）。

## 2026-03-04（对标 antfu/stylelint 最佳实践后复验）

- 命令：`pnpm -C packages/lint-ruleset lint:all`
- 结果：通过（exit 0）。

- 命令：`pnpm -C apps/admin lint`
- 结果：通过（exit 0）。
- 关键信息：
  - `lint:code:phase1`：`168 warnings, 0 errors`
  - `lint:style:phase1`：`193 warnings, 0 errors`

- 命令：`pnpm -C apps/admin lint:style:phase2:audit`
- 结果：通过（exit 0）。
- 关键信息：`183 warnings, 0 errors`。

- 命令：`pnpm -C apps/docs lint && pnpm -C apps/docs build`
- 结果：通过（exit 0）。

## 2026-03-05（第四批参数显式化：defaultOptions 回填）

- 命令：`pnpm -C packages/lint-ruleset lint:all`
- 结果：通过（exit 0）。

- 命令：`pnpm -C apps/admin lint`
- 结果：通过（exit 0）。
- 关键信息：
  - `lint:code:phase1`：`168 warnings, 0 errors`
  - `lint:style:phase1`：`193 warnings, 0 errors`

- 命令：`pnpm -C apps/docs lint && pnpm -C apps/docs build`
- 结果：通过（exit 0）。

- 命令：`node --input-type=module`（统计“支持 options 但仅级别配置”）
- 结果：通过（exit 0）。
- 关键信息：`286 -> 189`（JS `73` / TS `0` / Vue `116`）。

## 2026-03-05（第 5 批参数显式化：JS/Vue）

- 命令：`pnpm -C packages/lint-ruleset lint:code`
- 结果：通过（exit 0）。

- 命令：`pnpm -C packages/lint-ruleset lint:all`
- 结果：通过（exit 0）。

- 命令：`node --input-type=module`（统计“支持 options 但仅配置级别”）
- 结果：通过（exit 0）。
- 关键信息：`189 -> 23`（JS `4` / TS `0` / Vue `19`）。

- 命令：`pnpm -C apps/admin lint`
- 结果：通过（exit 0）。
- 关键信息：
  - `lint:code:phase1`：`90 warnings, 0 errors`
  - `lint:style:phase1`：`193 warnings, 0 errors`

- 命令：`pnpm -C apps/docs lint && pnpm -C apps/docs build`
- 结果：通过（exit 0）。

## 2026-03-05（继续完善规则：23 -> 17）

- 命令：`pnpm -C packages/lint-ruleset lint:all`
- 结果：通过（exit 0）。

- 命令：`node --input-type=module`（统计“支持 options 但仅级别配置”）
- 结果：通过（exit 0）。
- 关键信息：`23 -> 17`（JS `4` / TS `0` / Vue `13`）。

- 命令：`pnpm -C apps/admin lint`
- 结果：通过（exit 0）。
- 关键信息：
  - `lint:code:phase1`：`90 warnings, 0 errors`
  - `lint:style:phase1`：`193 warnings, 0 errors`

- 命令：`pnpm -C apps/docs lint && pnpm -C apps/docs build`
- 结果：通过（exit 0）。

## 2026-03-05（继续完善规则：17 -> 0）

- 命令：`pnpm -C packages/lint-ruleset lint:all`
- 结果：通过（exit 0）。

- 命令：`node --input-type=module`（统计“支持 options 但仅级别配置”）
- 结果：通过（exit 0）。
- 关键信息：`17 -> 0`（JS `0` / TS `0` / Vue `0`）。

- 命令：`pnpm -C apps/admin lint`
- 结果：通过（exit 0）。
- 关键信息：
  - `lint:code:phase1`：`90 warnings, 0 errors`
  - `lint:style:phase1`：`193 warnings, 0 errors`

- 命令：`pnpm -C apps/docs lint && pnpm -C apps/docs build`
- 结果：通过（exit 0）。

## 2026-03-05（admin lint 审计、自动修复与复跑）

- 审计命令（before 已存在产物复用）：
  - `pnpm -C apps/admin exec eslint "src/modules/{home,b,LogManagement,SystemManagement,UserManagement,demo,portal}/**/*.{ts,tsx,vue}" "src/{bootstrap,router,config,shared,infra,pages,components}/**/*.{ts,tsx,vue}" -f json -o /tmp/admin-eslint-audit-final.json`
  - `pnpm -C apps/admin exec stylelint "src/modules/{home,b,LogManagement,UserManagement,demo,SystemManagement,portal}/**/*.{css,scss,vue}" "src/{styles,components,pages}/**/*.{css,scss,vue}" --allow-empty-input --formatter json --output-file /tmp/admin-stylelint-audit-final.json`
- 自动修复命令：
  - `pnpm -C apps/admin exec eslint "src/modules/{home,b,LogManagement,SystemManagement,UserManagement,demo,portal}/**/*.{ts,tsx,vue}" "src/{bootstrap,router,config,shared,infra,pages,components}/**/*.{ts,tsx,vue}" --fix`
  - `pnpm -C apps/admin exec stylelint "src/modules/{home,b,LogManagement,UserManagement,demo,SystemManagement,portal}/**/*.{css,scss,vue}" "src/{styles,components,pages}/**/*.{css,scss,vue}" --allow-empty-input --fix`
- 门禁复跑：
  - `pnpm -C apps/admin lint`
- 结果：
  - 门禁通过（phase1 warning 可见，phase2 quiet 无 error 阻断）
  - ESLint final：10606 warnings / 0 errors
  - Stylelint final：169 warnings / 0 errors

## 2026-03-05（规则降噪收敛：sort-keys / no-undef-components / specificity）

- 命令：`pnpm -C packages/lint-ruleset lint:all`
  - 结果：通过
- 命令：`pnpm -C apps/admin lint`
  - 结果：通过（phase1 warning 可见，phase2 quiet 无 error）
- 命令：
  - `pnpm -C apps/admin exec eslint "src/modules/{home,b,LogManagement,SystemManagement,UserManagement,demo,portal}/**/*.{ts,tsx,vue}" "src/{bootstrap,router,config,shared,infra,pages,components}/**/*.{ts,tsx,vue}" -f json -o /tmp/admin-eslint-audit-tuned.json`
  - `pnpm -C apps/admin exec stylelint "src/modules/{home,b,LogManagement,UserManagement,demo,SystemManagement,portal}/**/*.{css,scss,vue}" "src/{styles,components,pages}/**/*.{css,scss,vue}" --allow-empty-input --formatter json --output-file /tmp/admin-stylelint-audit-tuned.json`
  - 结果：产物生成成功
- 命令：`pnpm -C apps/docs lint && pnpm -C apps/docs build`
  - 结果：通过

## 2026-03-05（继续：Stylelint 41 -> 0）

- 命令：`pnpm -C packages/lint-ruleset lint:all`
  - 结果：通过
- 命令：`pnpm -C apps/admin lint`
  - 结果：通过（stylelint phase1 无告警输出）
- 命令：`pnpm -C apps/admin exec stylelint "src/modules/{home,b,LogManagement,UserManagement,demo,SystemManagement,portal}/**/*.{css,scss,vue}" "src/{styles,components,pages}/**/*.{css,scss,vue}" --allow-empty-input --formatter json --output-file /tmp/admin-stylelint-audit-tuned3.json`
  - 结果：`warnings=0, errors=0`
- 命令：`pnpm -C apps/docs lint && pnpm -C apps/docs build`
  - 结果：通过

## 2026-03-05（按要求排除 i18n 规则）

- 命令：`pnpm -C packages/lint-ruleset lint:all`
  - 结果：通过
- 命令：`pnpm -C apps/admin lint`
  - 结果：通过（phase1 剩余 warning 15 条，已不包含 i18n 文案告警）
- 命令：`pnpm -C apps/admin exec eslint "src/modules/{home,b,LogManagement,SystemManagement,UserManagement,demo,portal}/**/*.{ts,tsx,vue}" "src/{bootstrap,router,config,shared,infra,pages,components}/**/*.{ts,tsx,vue}" -f json -o /tmp/admin-eslint-audit-noi18n.json`
  - 结果：ESLint warning `6150` / error `0`
- 命令：`pnpm -C apps/docs lint && pnpm -C apps/docs build`
  - 结果：通过

## 2026-03-05（继续：admin phase1 清零）

- 命令：`pnpm -C apps/admin lint:code:phase1`
- 结果：通过（exit 0）。
- 关键信息：`home,b` 作用域 warning 已清零（0 warning / 0 error）。

- 命令：`pnpm -C apps/admin lint`
- 结果：通过（exit 0）。
- 关键信息：保持“phase1 warning 可见、phase2 quiet 仅 error 阻断”门禁。

- 命令：`pnpm -C apps/admin exec eslint "src/modules/{home,b,LogManagement,SystemManagement,UserManagement,demo,portal}/**/*.{ts,tsx,vue}" "src/{bootstrap,router,config,shared,infra,pages,components}/**/*.{ts,tsx,vue}" -f json -o /tmp/admin-eslint-audit-noi18n-next.json`
- 结果：通过（exit 0）。

- 命令：`node`（对比 `/tmp/admin-eslint-audit-noi18n.json` 与 `/tmp/admin-eslint-audit-noi18n-next.json`）
- 结果：通过（exit 0）。
- 关键信息：ESLint warning `6150 -> 6135`（`-15`），error 持续 `0`。

- 命令：`pnpm -C apps/docs lint && pnpm -C apps/docs build`
- 结果：通过（exit 0）。
- 命令：`pnpm -C apps/admin lint:style:phase2:audit`
- 结果：通过（exit 0）。
- 关键信息：phase2 stylelint 当前无 warning 输出（0 warning / 0 error）。
- 命令：`pnpm -C apps/admin build`
- 结果：失败（exit 1）。
- 失败原因：`apps/admin/src/modules/demo/pages/DemoMenuManagementMigrationPage.vue:8` 存在 `import type` 与命名导入 `type` 修饰符并用的语法错误（历史改动，非本轮修改文件）。

## 2026-03-05（继续：规则最佳实践收敛 + 路由静态导入）

- 命令：`pnpm -C apps/admin exec eslint src/modules/demo/routes/layout.ts src/modules/portal/routes/layout.ts src/modules/portal/routes/standalone.ts src/modules/LogManagement/routes.ts src/modules/SystemManagement/routes.ts src/modules/UserManagement/routes.ts`
- 结果：通过（exit 0）。

- 命令：`pnpm -C packages/lint-ruleset lint:all`
- 结果：通过（exit 0）。

- 命令：`pnpm -C apps/admin lint`
- 结果：通过（exit 0）。

- 命令：`pnpm -C apps/admin exec eslint "src/modules/{home,b,LogManagement,SystemManagement,UserManagement,demo,portal}/**/*.{ts,tsx,vue}" "src/{bootstrap,router,config,shared,infra,pages,components}/**/*.{ts,tsx,vue}" -f json -o /tmp/admin-eslint-audit-noi18n-next4.json`
- 结果：通过（exit 0）。
- 关键信息：ESLint warning `2505 -> 1872`（`-633`）；相对 `6150` 基线累计 `-4278`。

- 命令：`pnpm -C apps/admin lint:code:phase1`
- 结果：通过（exit 0）。
- 关键信息：phase1(`home,b`) 仍保持 `0 warning / 0 error`。

- 命令：`pnpm -C apps/docs lint && pnpm -C apps/docs build`
- 结果：通过（exit 0）。

## 2026-03-05（LogManagement phase1 迁移验证）

- 命令：`pnpm -C apps/admin exec eslint "src/modules/LogManagement/**/*.{ts,tsx,vue}"`
- 结果：通过（exit 0）。
- 关键信息：初始 `12 warnings / 0 errors`，修复后复跑为 `0 warnings / 0 errors`。

- 命令：`pnpm -C apps/admin lint:code:phase1`
- 结果：通过（exit 0）。
- 关键信息：`home,b,LogManagement` 作用域无 warning 输出。

- 命令：`pnpm -C apps/admin lint`
- 结果：通过（exit 0）。
- 关键信息：保持“phase1 warning 可见、phase2 quiet 仅 error 阻断”。

- 命令：`pnpm -C packages/lint-ruleset lint:all`
- 结果：通过（exit 0）。

- 命令：`pnpm -C apps/admin build`
- 结果：通过（exit 0）。

- 命令：`pnpm -C apps/docs lint && pnpm -C apps/docs build`
- 结果：通过（exit 0）。

- 命令：`pnpm -C apps/admin exec eslint "src/modules/{home,b,LogManagement,SystemManagement,UserManagement,demo,portal}/**/*.{ts,tsx,vue}" "src/{bootstrap,router,config,shared,infra,pages,components}/**/*.{ts,tsx,vue}" -f json -o /tmp/admin-eslint-audit-noi18n-next5.json`
- 结果：通过（exit 0）。
- 关键信息：审计文件生成成功。

## 2026-03-05（admin warning 清零验证）

- 命令：`pnpm -C apps/admin exec eslint "src/modules/{home,b,LogManagement,SystemManagement,UserManagement,demo,portal}/**/*.{ts,tsx,vue}" "src/{bootstrap,router,config,shared,infra,pages,components}/**/*.{ts,tsx,vue}" --fix`
- 结果：通过（exit 0）。
- 备注：存在 `ESLintCircularFixesWarning`（历史规则冲突提示），后续已通过团队规则降噪收敛。

- 命令：`pnpm -C apps/admin exec eslint "src/modules/{home,b,LogManagement,SystemManagement,UserManagement,demo,portal}/**/*.{ts,tsx,vue}" "src/{bootstrap,router,config,shared,infra,pages,components}/**/*.{ts,tsx,vue}" -f json -o /tmp/admin-eslint-audit-noi18n-next6.json`
- 结果：通过（exit 0）。
- 关键信息：`1795 warnings / 0 errors`。

- 命令：`pnpm -C packages/lint-ruleset lint:all`
- 结果：通过（exit 0）。

- 命令：`pnpm -C apps/admin exec eslint "src/modules/{home,b,LogManagement,SystemManagement,UserManagement,demo,portal}/**/*.{ts,tsx,vue}" "src/{bootstrap,router,config,shared,infra,pages,components}/**/*.{ts,tsx,vue}" -f json -o /tmp/admin-eslint-audit-noi18n-next8.json`
- 结果：通过（exit 0）。
- 关键信息：`0 warnings / 0 errors`。

- 命令：`pnpm -C apps/admin exec stylelint "src/modules/{home,b,LogManagement,UserManagement,demo,SystemManagement,portal}/**/*.{css,scss,vue}" "src/{styles,components,pages}/**/*.{css,scss,vue}" --allow-empty-input --formatter json --output-file /tmp/admin-stylelint-audit-next5.json`
- 结果：通过（exit 0）。
- 关键信息：`0 warnings / 0 erroredFiles`。

- 命令：`pnpm -C apps/admin lint`
- 结果：通过（exit 0）。

- 命令：`pnpm -C apps/admin build`
- 结果：通过（exit 0）。

- 命令：`pnpm -C apps/docs lint && pnpm -C apps/docs build`
- 结果：通过（exit 0）。

- 命令：`pnpm -C apps/admin lint:code:audit`
- 结果：通过（exit 0）。
- 关键信息：phase1 + phase2:audit 全量无 warning 输出。

## 2026-03-05（Phase A 规则回收验证）

- 命令：`pnpm -C apps/admin lint:code:phase1`
- 结果：通过（exit 0）。
- 关键信息：恢复 5 条 type-aware 规则后，phase1 仍无 warning。

- 命令：`pnpm -C apps/admin lint`
- 结果：通过（exit 0）。

- 命令：`pnpm -C apps/admin exec eslint "src/modules/{home,b,LogManagement,SystemManagement,UserManagement,demo,portal}/**/*.{ts,tsx,vue}" "src/{bootstrap,router,config,shared,infra,pages,components}/**/*.{ts,tsx,vue}" -f json -o /tmp/admin-eslint-audit-noi18n-next9.json`
- 结果：通过（exit 0）。
- 关键信息：`0 warnings / 0 errors`。

- 命令：`pnpm -C apps/admin build`
- 结果：通过（exit 0）。

- 命令：`pnpm -C apps/docs lint && pnpm -C apps/docs build`
- 结果：通过（exit 0）。

## 2026-03-05（规则回收 Wave1 验收）

- 命令：`pnpm -C packages/lint-ruleset lint:all`
  - 结果：通过（Csslint 输出“未找到 CSS 文件，跳过 Csslint 检查”）
- 命令：`pnpm -C apps/admin lint:code:phase1`
  - 结果：通过（`home,b,LogManagement,SystemManagement`）
- 命令：`pnpm -C apps/admin lint:code:audit`
  - 结果：通过
- 命令：`pnpm -C apps/admin exec eslint "src/modules/{home,b,LogManagement,SystemManagement,UserManagement,demo,portal}/**/*.{ts,tsx,vue}" "src/{bootstrap,router,config,shared,infra,pages,components}/**/*.{ts,tsx,vue}" -f json -o /tmp/admin-eslint-audit-recovery-wave1.json`
  - 结果：通过
  - 审计文件：`/tmp/admin-eslint-audit-recovery-wave1.json`
  - 汇总：`files=247, warnings=0, errors=0`
- 命令：`pnpm -C apps/admin lint`
  - 结果：通过
- 命令：`pnpm -C apps/admin build`
  - 结果：通过（保留 Vite chunk size 提示，不影响 exit code）
- 命令：`pnpm -C apps/docs lint && pnpm -C apps/docs build`
  - 结果：通过

### 扩面试跑记录（未纳入门禁）

- 命令：`pnpm -C apps/admin exec eslint "src/modules/UserManagement/**/*.{ts,tsx,vue}"`
  - 结果：`75 warnings, 0 errors`
  - 处置：按“warning 回潮即停批”回退 `UserManagement` 迁入 phase1 动作。

## 2026-03-05（规则回收 Wave2：UserManagement 75->0）

- 预览命令：
  - `pnpm -C apps/admin exec eslint "src/modules/UserManagement/**/*.{ts,tsx}" --rule "@typescript-eslint/strict-boolean-expressions:[1,{allowString:true,allowNumber:true,allowNullableObject:true,allowNullableBoolean:true,allowNullableString:true,allowNullableNumber:true,allowAny:false}]" --rule "@typescript-eslint/no-unnecessary-condition:1" --rule "@typescript-eslint/no-unsafe-assignment:1" --rule "@typescript-eslint/no-unsafe-member-access:1" --rule "@typescript-eslint/no-unsafe-return:1" --rule "@typescript-eslint/no-floating-promises:1"`
  - 结果：`75 warnings -> 0 warnings`

- 固定验收命令（Wave2）
  1. `pnpm -C packages/lint-ruleset lint:all`：通过
  2. `pnpm -C apps/admin lint:code:phase1`：通过（含 UserManagement）
  3. `pnpm -C apps/admin lint:code:audit`：通过
  4. `pnpm -C apps/admin exec eslint "src/modules/{home,b,LogManagement,SystemManagement,UserManagement,demo,portal}/**/*.{ts,tsx,vue}" "src/{bootstrap,router,config,shared,infra,pages,components}/**/*.{ts,tsx,vue}" -f json -o /tmp/admin-eslint-audit-recovery-wave2.json`：通过
  5. `pnpm -C apps/admin lint`：通过
  6. `pnpm -C apps/admin build`：通过
  7. `pnpm -C apps/docs lint && pnpm -C apps/docs build`：通过

- 审计汇总：`/tmp/admin-eslint-audit-recovery-wave2.json` => `files=247, warnings=0, errors=0`

## 2026-03-05（Wave3：范围收口后回归验证）

- `pnpm -C packages/lint-ruleset lint:all`
  - 结果：通过（exit 0）
- `pnpm -C apps/admin lint:code:phase1`
  - 结果：通过（exit 0，范围 `home/LogManagement/SystemManagement/UserManagement`）
- `pnpm -C apps/admin lint:code:audit`
  - 结果：通过（exit 0）
- `pnpm -C apps/admin exec eslint "src/modules/{home,LogManagement,SystemManagement,UserManagement}/**/*.{ts,tsx,vue}" "src/{bootstrap,router,config,shared,infra,pages,components}/**/*.{ts,tsx,vue}" -f json -o /tmp/admin-eslint-audit-recovery-wave3.json`
  - 结果：通过（exit 0）
  - 汇总：`files=138, warnings=0, errors=0`
- `pnpm -C apps/admin lint`
  - 结果：通过（exit 0）
- `pnpm -C apps/admin build`
  - 结果：通过（exit 0；存在 Vite chunk size 提示，不阻断）
- `pnpm -C apps/docs lint && pnpm -C apps/docs build`
  - 结果：通过（exit 0）

### 补充检查（非本轮门禁）

- `pnpm -C apps/admin typecheck`
  - 结果：失败（exit 2）
  - 说明：为历史类型基线问题（RouteRecordRaw 类型收紧、若干模块与 `registry.ts` 旧问题），非本轮 lint 收口改动引入。

## 2026-03-05（新增测试文件 ESLint 忽略策略验证）

- `pnpm -C packages/lint-ruleset lint:all`
  - 结果：通过（exit 0）
- `pnpm -C apps/admin lint:code:audit`
  - 结果：通过（exit 0）
- `pnpm -C apps/docs lint && pnpm -C apps/docs build`
  - 结果：通过（exit 0）

## 2026-03-05（继续清理后的回归验证）

- `pnpm -C packages/lint-ruleset lint:all`
  - 结果：通过（exit 0）
- `pnpm -C apps/admin lint:code:audit`
  - 结果：通过（exit 0）
- `pnpm -C apps/admin build`
  - 结果：通过（exit 0；保留 chunk size 与 plugin timing 提示）
- `pnpm -C apps/admin exec eslint "src/modules/{home,LogManagement,SystemManagement,UserManagement}/**/*.{ts,tsx,vue}" "src/{bootstrap,router,config,shared,infra,pages,components}/**/*.{ts,tsx,vue}" -f json -o /tmp/admin-eslint-audit-recovery-wave4.json`
  - 结果：通过（exit 0）
  - 汇总：`files=136, warnings=0, errors=0`
- `pnpm -C apps/docs lint && pnpm -C apps/docs build`
  - 结果：通过（exit 0）

## 2026-03-05（统一门禁去 phase 化验证）

- `pnpm -C packages/lint-ruleset lint:all`
  - 结果：通过（exit 0）
- `pnpm -C apps/admin lint:code:audit`
  - 结果：通过（exit 0）
- `pnpm -C apps/admin lint`
  - 结果：通过（exit 0，`lint:code`/`lint:style` 均启用 `--max-warnings=0`）
- `pnpm -C apps/admin build`
  - 结果：通过（exit 0；保留 chunk size 提示）
- `pnpm -C apps/admin exec eslint "src/modules/{home,LogManagement,SystemManagement,UserManagement}/**/*.{ts,tsx,vue}" "src/{bootstrap,router,config,shared,infra,pages,components}/**/*.{ts,tsx,vue}" -f json -o /tmp/admin-eslint-audit-unified-gate.json`
  - 结果：通过（exit 0）
  - 汇总：`files=136, warnings=0, errors=0`
- `pnpm -C apps/docs lint && pnpm -C apps/docs build`
  - 结果：通过（exit 0）

## 2026-03-05（lint:report 封装回归）

- `pnpm -C apps/admin lint:report`
  - 结果：通过（exit 0）
  - 输出：
    - `ESLint: files=136, filesWithProblems=0, warnings=0, errors=0`
    - `Stylelint: files=50, filesWithProblems=0, warnings=0, errors=0`
    - `Total: files=186, filesWithProblems=0, warnings=0, errors=0`
- `pnpm -C apps/admin lint`
  - 结果：通过（exit 0）
- `pnpm -C apps/docs lint && pnpm -C apps/docs build`
  - 结果：通过（exit 0）

## 2026-03-05（admin lint 迁移到 Ultracite + Biome）

- 命令：`pnpm -C apps/admin lint:doctor`
  - 结果：通过（Ultracite v7.2.4；Biome v2.4.5；No conflicting tools）
- 命令：`pnpm -C apps/admin lint`
  - 结果：通过（`Checked 142 files`，`0 warning / 0 error`）
- 命令：`pnpm -C apps/admin build`
  - 结果：通过（Vite 构建成功）
- 命令：`pnpm -C apps/docs lint`
  - 结果：通过
- 命令：`pnpm -C apps/docs build`
  - 结果：通过（VitePress 构建成功）
- 回滚误触发格式化后复验：
  - `pnpm -C apps/admin lint`：通过（`Checked 142 files`）
  - `pnpm -C apps/admin build`：通过

## 2026-03-05（删除 lint-ruleset 后回归）

- `pnpm install`：通过（workspace 从 8 个项目重新计算依赖，lockfile 已更新）。
- `pnpm -C apps/admin lint`：通过（Checked 142 files，0 warning / 0 error）。
- `pnpm -C apps/admin build`：通过。
- `pnpm -C apps/docs lint`：通过。
- `pnpm -C apps/docs build`：通过。
- `pnpm lint`（turbo 全仓）：通过。

## 2026-03-05（Biome 脚本配置回归）

- `pnpm -C apps/admin run biome:lint -- --help`
  - 结果：失败（exit 1）
  - 说明：脚本成功执行并进入 `biome lint ./src`；由于 `--help` 透传方式被当作路径参数，实际触发 lint 扫描，命中 admin 历史存量问题（`2532 errors, 2 warnings`）。
- `pnpm run biome:ci -- --help`
  - 结果：失败（exit 1）
  - 说明：根脚本代理成功执行并进入 `apps/admin biome:ci`；同样触发实际扫描，命中历史存量问题（`2756 errors, 2 warnings`）。
- `pnpm -C apps/admin exec biome --version`
  - 结果：通过（exit 0）
  - 输出：`Version: 2.4.5`
- `pnpm -C apps/docs lint`
  - 结果：通过（exit 0）
- `pnpm -C apps/docs build`
  - 结果：通过（exit 0，VitePress 构建成功）

## 2026-03-05（Biome 全局化回归）

- `pnpm -C apps/admin lint:doctor`
  - 结果：通过（exit 0）
  - 备注：提示当前 `apps/admin` 目录无本地 `biome.json(c)`，符合“配置上收到根目录”的目标状态。
- `pnpm biome:lint`
  - 结果：失败（exit 1）
  - 说明：根级脚本可正常调用 `biome` 并扫描 `apps/admin/src`；失败原因为 admin 现存 Biome 存量问题（`2495 errors, 2 warnings`），非本次脚本改造引入。
- `pnpm -C apps/docs lint`
  - 结果：通过（exit 0）
- `pnpm -C apps/docs build`
  - 结果：通过（exit 0）

### 追加回归（同日）

- `pnpm biome:lint`
  - 结果：失败（exit 1）
  - 说明：脚本已按预期调用 `pnpm -C apps/admin exec biome lint --config-path ../../biome.jsonc ./src`，确认根脚本显式命中全局配置；失败原因仍为存量规则问题（`2508 errors, 2 warnings`）。

### 追加回归（同日：依赖上收）

- `pnpm install`
  - 结果：通过（exit 0）
- `pnpm biome:lint`
  - 结果：失败（exit 1）
  - 说明：根脚本成功执行 `pnpm exec biome lint --config-path ./biome.jsonc ./apps/admin/src`；失败原因仍是 admin 代码库存量问题（`2495 errors, 2 warnings`）。
- `pnpm -C apps/admin lint:doctor`
  - 结果：通过（exit 0）
- `pnpm -C apps/docs lint`
  - 结果：通过（exit 0）
- `pnpm -C apps/docs build`
  - 结果：通过（exit 0）

## 2026-03-05（Biome monorepo 用法配置回归）

- `pnpm biome:lint`
  - 结果：失败（exit 1）
  - 说明：根脚本可正常执行并命中全局配置；当前失败为仓库存量规则问题（`5168 errors, 2 warnings`），非配置链路错误。
- `pnpm -C apps/docs lint`
  - 结果：通过（exit 0）
- `pnpm -C apps/docs build`
  - 结果：通过（exit 0）

## 2026-03-05（前端并行修复回归）

- 并行命令（两轮）：
  - `pnpm exec biome check --config-path ./biome.jsonc --write --unsafe apps/admin/src`
  - `pnpm exec biome check --config-path ./biome.jsonc --write --unsafe packages/core/src packages/ui/src packages/tag/src packages/utils/src packages/adapters/src`
  - `pnpm exec biome check --config-path ./biome.jsonc --write --unsafe scripts apps/docs/docs/.vitepress`
- 结果：命令均退出码 1（存在不可自动修复问题），但已完成大规模自动修复。
- 统计命令：
  - `pnpm exec biome lint --config-path ./biome.jsonc apps/admin/src --reporter summary`
  - `pnpm exec biome lint --config-path ./biome.jsonc packages/core/src packages/ui/src packages/tag/src packages/utils/src packages/adapters/src --reporter summary`
  - `pnpm exec biome lint --config-path ./biome.jsonc scripts apps/docs/docs/.vitepress --reporter summary`
- 当前未通过项：
  - admin：`2206 errors, 2 warnings`
  - packages：`1239 errors`
  - scripts：`7 errors`
- 变更规模：`git diff --shortstat` -> `423 files changed, 26979 insertions(+), 39163 deletions(-)`。

## 2026-03-05（前端并行修复：scripts/docs 定向收口）

- `pnpm exec biome lint --config-path ./biome.jsonc scripts apps/docs/docs/.vitepress --reporter summary`
  - 结果：失败（exit 1）
  - 诊断：2 errors（`scripts/doctor.mjs`、`scripts/new-module.mjs`，规则 `useTopLevelRegex`）。
- 修复后复跑同命令：
  - 结果：通过（exit 0）
  - 输出：`Checked 4 files in 9ms. No fixes applied.`

## 2026-03-05（前端并行修复继续：admin/packages 错误清零）

- 规则收敛后统计：
  - `pnpm exec biome lint --config-path ./biome.jsonc apps/admin/src --reporter summary`
    - 结果：失败（exit 1）
    - 从 `2206 errors` 降至 `174 errors`，随后降至 `42 errors`，再降至 `20 errors`。
  - `pnpm exec biome lint --config-path ./biome.jsonc packages/core/src packages/ui/src packages/tag/src packages/utils/src packages/adapters/src --reporter summary`
    - 结果：失败（exit 1）
    - 从 `1239 errors` 降至 `339 errors`，随后降至 `123 errors`，再降至 `7 errors`。
- error 级最终验证：
  - `pnpm exec biome lint --config-path ./biome.jsonc --diagnostic-level=error apps/admin/src`
    - 结果：通过（exit 0）
  - `pnpm exec biome lint --config-path ./biome.jsonc --diagnostic-level=error packages/core/src packages/ui/src packages/tag/src packages/utils/src packages/adapters/src`
    - 结果：通过（exit 0）
  - `pnpm exec biome lint --config-path ./biome.jsonc --diagnostic-level=error scripts apps/docs/docs/.vitepress`
    - 结果：通过（exit 0）
- 当前 summary（warnings 口径）：
  - admin：`156 warnings, 0 errors`
  - packages：`332 warnings, 0 errors`
  - scripts/docs：`0 warnings, 0 errors`

### 追加回归（同日）：根脚本验证

- `pnpm exec biome check --config-path ./biome.jsonc --write --unsafe apps/admin/vite.config.ts packages/tag/vite.config.ts packages/tag/vitest.config.ts`
  - 结果：通过（exit 0）
- `pnpm biome:lint`
  - 结果：通过（exit 0）
  - 输出：`Found 499 warnings`（无 error）

## 2026-03-05（warning 分布统计）

- `pnpm exec biome lint --config-path ./biome.jsonc apps/admin/src --reporter summary`
  - 结果：通过（exit 0），`156 warnings`
- `pnpm exec biome lint --config-path ./biome.jsonc packages/core/src packages/ui/src packages/tag/src packages/utils/src packages/adapters/src --reporter summary`
  - 结果：通过（exit 0），`332 warnings`
- `pnpm exec biome lint --config-path ./biome.jsonc apps/admin/vite.config.ts packages/tag/vite.config.ts packages/tag/vitest.config.ts --reporter summary`
  - 结果：通过（exit 0），`11 warnings`

## 2026-03-05（iconfont 约束收尾回归）

- `pnpm biome:lint`
  - 结果：通过（exit 0）
  - 输出：`Checked 404 files ... No fixes applied.`
- `pnpm exec biome lint --config-path ./biome.jsonc --reporter summary .`
  - 结果：通过（exit 0）
  - 输出：`Checked 404 files ... No fixes applied.`

## 2026-03-05（用户请求复跑全链路）

- `pnpm typecheck`
  - 结果：失败（exit 2）
  - 关键错误：`packages/core/src/hooks/useTable/index.ts:932`、`:944`，`TS2322 Type 'void' is not assignable to type 'UseTableStandardResponse<any> | undefined'`。
- `pnpm lint`
  - 结果：失败（exit 1）
  - 关键错误：`packages/adapters/src/{defaultAdapter.ts,index.ts,menus/demoMenus.ts,sczfwAdapter.ts}` 共 `49` 个 `quotes` 规则错误（可 `--fix`）。
- `pnpm build`
  - 结果：失败（exit 2）
  - 阻断原因：同 `packages/core/src/hooks/useTable/index.ts:932/:944` 的 `TS2322`。

## 2026-03-05（修复后全量回归）

- `pnpm -C apps/admin typecheck`
  - 结果：通过（exit 0）
- `pnpm -C apps/docs lint`
  - 结果：通过（exit 0）
- `pnpm lint`
  - 结果：通过（exit 0）
- `pnpm typecheck`
  - 结果：通过（exit 0）
- `pnpm build`
  - 结果：通过（exit 0）
- `pnpm biome:lint`
  - 结果：通过（exit 0），`Checked 404 files ... No fixes applied.`
- `pnpm exec biome lint --config-path ./biome.jsonc --reporter summary .`
  - 结果：通过（exit 0），`Checked 404 files ... No fixes applied.`

## 2026-03-05（分批提交后统一回归）

- `pnpm typecheck`：通过（exit 0）
- `pnpm lint`：通过（exit 0）
- `pnpm build`：通过（exit 0）
- `pnpm biome:lint`：通过（exit 0）
- `pnpm exec biome lint --config-path ./biome.jsonc --reporter summary .`：通过（exit 0）

## 2026-03-05（菜单路由文档收敛）

- `pnpm -C apps/docs lint`
  - 结果：通过（exit 0）
- `pnpm -C apps/docs build`
  - 结果：通过（exit 0）

## 2026-03-05（preset 收敛执行）

- RED 阶段
  - `pnpm -C packages/core test:run src/config/platform-config.test.ts`
  - 结果：失败（4/4 fail），确认新增行为未实现。
- GREEN 阶段
  - `pnpm -C packages/core test:run src/config/platform-config.test.ts`
  - 结果：通过（4/4）。
- 审查修复后回归
  - `pnpm -C packages/core test:run src/config/platform-config.test.ts`
  - 结果：通过（6/6）。
  - `pnpm -C packages/core typecheck`
  - 结果：通过。
  - `pnpm -C apps/docs lint`
  - 结果：通过。
  - `pnpm -C apps/docs build`
  - 结果：通过。
- 全仓回归
  - `pnpm typecheck && pnpm lint && pnpm build`
  - 结果：通过（含 turbo 编排）。

## 2026-03-05（执行回归确认：preset 收敛）

- `pnpm -C packages/core test:run src/config/platform-config.test.ts`
  - 结果：通过（6/6）。
- `pnpm -C packages/core typecheck`
  - 结果：通过。
- `pnpm -C apps/docs lint`
  - 结果：通过。
- `pnpm -C apps/docs build`
  - 结果：通过。
- `pnpm typecheck && pnpm lint && pnpm build`
  - 结果：通过（turbo 全绿）。

## 2026-03-05（提交后远端同步）

- `git push origin main`
  - 结果：通过（exit 0）
  - 输出：`0652923..d51aaa2  main -> main`

## 2026-03-05（template 最小静态菜单项目）

- `pnpm install`
  - 结果：通过。
- `pnpm -C apps/template typecheck`
  - 结果：通过。
- `pnpm -C apps/template lint`
  - 结果：通过（修复 1 条 `useSimplifiedLogicExpression` 后）。
- `pnpm -C apps/template build`
  - 结果：通过。
- `pnpm -C apps/docs lint`
  - 结果：通过。
- `pnpm -C apps/docs build`
  - 结果：通过。
- `pnpm typecheck && pnpm lint && pnpm build`
  - 结果：通过（turbo 覆盖 8 个 workspace，含 template）。

## 2026-03-05（template 提交后推送）

- `git push origin main`
  - 结果：通过（exit 0）
  - 输出：`d51aaa2..3c3747d  main -> main`

## 2026-03-05（portal 独立 + 物料抽包规划阶段）

- 本阶段仅完成设计与实施计划落盘，未执行代码级测试命令。
- 待进入实施后按计划执行：
  - `pnpm typecheck`
  - `pnpm lint`
  - `pnpm build`
  - `pnpm -C apps/docs build`

## 2026-03-06（portal 动作协议规划阶段）

- 本阶段仅更新设计/计划文档，未执行代码实现与自动化测试命令。
- 待实施阶段执行：
  - `pnpm -C packages/portal-engine typecheck`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/portal typecheck`
  - `pnpm typecheck && pnpm lint && pnpm build`

## 2026-03-06（Task 1 骨架验证）

- `pnpm -C packages/portal-engine typecheck`：通过（exit 0）
- `pnpm -C packages/portal-engine lint`：通过（exit 0）
- `pnpm -C . install --lockfile-only`：通过（exit 0）

## 2026-03-06（portal-engine Task 2：类型/工具抽离）

- `pnpm -C packages/portal-engine typecheck`
  - 结果：通过（exit 0）。
- `pnpm -C packages/portal-engine lint`
  - 首次结果：失败（10 个 `quotes` 错误）。
  - 修复：统一改为单引号后复跑通过（exit 0）。
- `pnpm -C apps/admin typecheck`
  - 首次结果：失败（`Cannot find module '@one-base-template/portal-engine'` 及连带 TS7006）。
  - 修复：`apps/admin/package.json` 增加 workspace 依赖并执行 `pnpm install`。
  - 复跑结果：通过（exit 0）。
- `pnpm -C apps/admin lint`
  - 结果：通过（exit 0）。
- `pnpm -C apps/docs lint`
  - 结果：通过（exit 0）。
- `pnpm -C apps/docs build`
  - 结果：通过（exit 0）。

## 2026-03-06（portal-engine Task 3：store/editor/renderer 迁移）

- 首轮验证：
  - `pnpm -C packages/portal-engine typecheck`：通过。
  - `pnpm -C packages/portal-engine lint`：通过（首次有 1 条 warning，随后修复）。
  - `pnpm -C apps/admin typecheck`：失败（`MaterialLibrary` props 类型过窄导致 categories 赋值不兼容）。
  - `pnpm -C apps/admin lint`：通过。
- 修复后复跑：
  - `pnpm -C packages/portal-engine typecheck`：通过。
  - `pnpm -C packages/portal-engine lint`：通过。
  - `pnpm -C apps/admin typecheck`：通过。
  - `pnpm -C apps/admin lint`：通过。
- 文档验证：
  - `pnpm -C apps/docs lint`：通过。
  - `pnpm -C apps/docs build`：通过。

## 2026-03-06（portal-engine Task 4：materials/registry/useMaterials 迁移）

- 首轮验证：
  - `pnpm -C packages/portal-engine typecheck`：失败（`import.meta.glob` 类型缺失 + `Object.values` 推断为 unknown）。
  - `pnpm -C packages/portal-engine lint`：通过。
  - `pnpm -C apps/admin typecheck`：通过。
  - `pnpm -C apps/admin lint`：通过。
- 处置：
  - `packages/portal-engine/tsconfig.json` 增加 `types: ["vite/client"]` 与 `src/**/*.d.ts`。
  - `packages/portal-engine/src/materials/useMaterials.ts` 对 `Object.values(...)` 增加 `MaterialModule[]` 断言。
- 复跑验证：
  - `pnpm -C packages/portal-engine typecheck`：通过。
  - `pnpm -C packages/portal-engine lint`：通过。
  - `pnpm -C apps/admin typecheck`：通过。
  - `pnpm -C apps/admin lint`：通过。
  - `pnpm -C apps/docs lint`：通过。
  - `pnpm -C apps/docs build`：通过。

## 2026-03-06（清理阶段：删除旧实现后的回归）

- `pnpm -C packages/portal-engine typecheck`：通过。
- `pnpm -C packages/portal-engine lint`：通过。
- `pnpm -C apps/admin typecheck`：通过。
- `pnpm -C apps/admin lint`：通过（扫描文件数从 235 降至 176，符合删除预期）。
- `pnpm -C apps/docs lint`：通过。
- `pnpm -C apps/docs build`：通过。

## 2026-03-06（Task 7：apps/portal 验证）

- `pnpm install`
  - 结果：通过（workspace=11，lockfile 已更新）。
- `pnpm -C apps/portal typecheck`
  - 结果：通过。
- `pnpm -C apps/portal lint`
  - 结果：通过（Checked 24 files, No fixes applied）。
- `pnpm -C apps/portal build`
  - 结果：通过（产物输出成功；存在大 chunk warning，不阻断构建）。
- `pnpm -C apps/docs lint`
  - 结果：通过。
- `pnpm -C apps/docs build`
  - 结果：通过。

## 2026-03-06（共享登录收敛：LoginBox/LoginBoxV2）

- 首轮验证（定位编译问题）：
  - `pnpm -C packages/ui typecheck`
  - 结果：失败。
  - 失败原因：
    - `packages/ui/src/components/auth/LoginBox.vue`：`withDefaults(defineProps())` 中 `passwordPattern` 默认值引用局部常量，触发 Vue SFC hoist 限制。
    - `packages/ui/src/components/auth/LoginBoxV2.vue`：模板使用 `<>...</>` 片段语法，Vue SFC 解析失败。
- 修复后复跑：
  - `pnpm -C packages/core test:run src/auth/login.test.ts`
    - 结果：通过（7/7）。
  - `pnpm -C packages/ui typecheck`
    - 结果：通过。
  - `pnpm -C packages/ui lint`
    - 结果：通过。
  - `pnpm -C apps/admin typecheck`
    - 结果：通过。
  - `pnpm -C apps/admin lint`
    - 结果：通过。
  - `pnpm -C apps/portal typecheck`
    - 结果：通过。
  - `pnpm -C apps/portal lint`
    - 结果：通过。
  - `pnpm -w build`
    - 结果：通过（admin / portal / template / docs / packages 全部成功；存在大 chunk warning，不阻断构建）。
  - `pnpm -C apps/docs build`
    - 结果：通过。

## 2026-03-06（admin 登录页统一改为 ObLoginBoxV2）

- `pnpm -C apps/admin typecheck`
  - 结果：通过。
- `pnpm -C apps/admin lint`
  - 结果：通过。
- `pnpm -C apps/admin build`
  - 结果：通过（存在既有大 chunk warning，不阻断构建）。
- `pnpm -C apps/docs build`
  - 结果：通过。

## 2026-03-06（sczfw infra 清理）

- `pnpm -C apps/admin typecheck`
  - 结果：通过。
- `pnpm -C apps/admin lint`
  - 结果：通过（Checked 174 files，较清理前减少，符合删除死代码预期）。
- `pnpm -C apps/admin build`
  - 结果：通过（存在既有大 chunk warning，不阻断构建）。
- `pnpm -C apps/portal typecheck`
  - 结果：通过。
- `pnpm -C apps/portal lint`
  - 结果：通过。
- `pnpm -C apps/portal build`
  - 结果：通过（存在既有大 chunk warning，不阻断构建）。
- `pnpm -C apps/docs build`
  - 结果：通过。

## 2026-03-06（继续收口：清理 verifition-plus 目录名）

- 引用检查：
  - `rg -n "verifition-plus|reqGet|reqCheck" apps/admin apps/portal apps/docs AGENTS.md`
  - 结果：源码侧旧目录引用已清零，仅根 `AGENTS.md` 保留规则说明。
- `pnpm -C apps/admin typecheck`
  - 结果：通过。
- `pnpm -C apps/admin lint`
  - 结果：通过。
- `pnpm -C apps/admin build`
  - 结果：通过（存在既有大 chunk warning，不阻断构建）。
- `pnpm -C apps/portal typecheck`
  - 结果：通过。
- `pnpm -C apps/portal lint`
  - 结果：通过。
- `pnpm -C apps/portal build`
  - 结果：通过（存在既有大 chunk warning，不阻断构建）。
- `pnpm -C apps/docs build`
  - 结果：通过。

## 2026-03-06（Agent / Harness 项目规则重构）

- `pnpm -C apps/docs lint`
  - 结果：通过。
- `pnpm -C apps/docs typecheck`
  - 结果：通过。
- `pnpm -C apps/docs build`
  - 结果：通过（VitePress 成功收录新页面与导航变更）。

## 2026-03-06（共享登录框滑块验证码回归修复）

- `pnpm exec vitest run --config packages/ui/vitest.config.ts packages/ui/src/components/auth/VerifySlide.test.ts`
  - 结果：通过（4/4 用例通过，覆盖 PNG 裸 base64、JPEG 裸 base64、已带 data 前缀、拼图切片挂载与初始拖动底座宽度）。
- `pnpm -C packages/ui typecheck`
  - 结果：通过。
- `pnpm -C packages/ui lint`
  - 结果：通过。
- `pnpm -C apps/admin typecheck`
  - 结果：通过。
- `pnpm -C apps/portal typecheck`
  - 结果：通过。
- 本地浏览器冒烟（browser_debugger）：
  - 地址：`http://127.0.0.1:5174/login?redirect=/home/index`
  - 结果：通过，验证码背景图与切片图 `naturalWidth/naturalHeight` 分别为 `310x155` / `47x155`，未采集到 `console.error`、`window error`、`unhandledrejection` 或资源加载失败。
- `pnpm build`
  - 结果：通过（turbo 10/10 successful，`admin` / `portal` / `template` / `docs` 全部完成构建；存在既有大 chunk warning、plugin timings warning，以及 `@one-base-template/ui#build` 未声明 turbo outputs 的提示，不阻断构建）。

## 2026-03-06（Turborepo build.outputs warning 清理）

- `pnpm build`
  - 结果：通过（Turbo `10 successful, 10 total`，且不再出现 `@one-base-template/ui#build no output files found` warning）。
  - 保留提示：`admin` / `portal` / `template` 的大 chunk warning，以及 `admin` 的 plugin timings warning；均为既有非阻断提示。
- `pnpm -C apps/docs lint`
  - 结果：通过。

## 2026-03-06（构建 chunk warning 收口：第二轮减重）

- `pnpm -C packages/ui exec vitest run src/iconify/menu-iconify.test.ts`
  - 结果：先红后绿；最终通过（2/2），覆盖按 prefix 懒注册、缓存去重、读取图标名时按需加载集合。
- `pnpm -C packages/ui typecheck`
  - 结果：通过。
- `pnpm -C packages/ui lint`
  - 结果：通过。
- `pnpm -C apps/admin build`
  - 结果：通过；未再出现 chunk size warning，仅保留非阻断的 plugin timings warning。
- `pnpm -C apps/portal build`
  - 结果：通过；无 chunk size warning。
- `pnpm -C apps/template build`
  - 结果：通过；无 chunk size warning。
- `pnpm -C apps/docs lint`
  - 结果：通过。
- `pnpm -C apps/docs build`
  - 结果：通过。

## 2026-03-06（review follow-up：chunk 收口补修）

- `pnpm -C packages/ui exec vitest run src/iconify/menu-iconify.test.ts src/components/auth/VerifySlide.test.ts`
  - 结果：通过（7/7）；新增 `getMenuIconifyPrefix()` 空白字符场景验证。
- `pnpm -C packages/ui typecheck`
  - 结果：通过。
- `pnpm -C packages/ui lint`
  - 结果：通过。
- `pnpm -C apps/admin typecheck`
  - 结果：通过。
- `pnpm -C apps/admin build`
  - 结果：通过；仍仅保留 `PLUGIN_TIMINGS` warning，无 chunk size warning。
- `pnpm -C apps/portal build`
  - 结果：通过；无 chunk size warning。
- `pnpm -C apps/template build`
  - 结果：通过；无 chunk size warning。

## 2026-03-06（共享登录框 / portal 收尾全量验收）

- `pnpm typecheck`
  - 结果：通过（Turbo `10 successful, 10 total`）。
- `pnpm lint`
  - 结果：通过（Turbo `10 successful, 10 total`）。
- `pnpm build`
  - 结果：通过（Turbo `10 successful, 10 total`）。
  - 备注：
    - `admin` 构建仍提示 `PLUGIN_TIMINGS`，属于非阻断性能提示。
    - `portal` 构建仍提示 `Some chunks are larger than 500 kB after minification`，当前由 `element-plus` 主包带来，但退出码仍为 `0`。
- `pnpm -C apps/docs build`
  - 结果：通过。
- `pnpm exec vitest run packages/portal-engine/src/materials/navigation.test.ts --environment happy-dom`
  - 结果：通过（`1` 个文件 / `2` 个测试全部通过）。
- `git status --short --untracked-files=all`
  - 结果：空输出，源码工作区干净。

## 2026-03-06（本地 Web 性能分析 skill 验证）

- `./.codex/skills/web-performance-audit/scripts/run_lighthouse.sh --help`
  - 结果：通过。
- `node ./.codex/skills/web-performance-audit/scripts/summarize_lighthouse.mjs --help`
  - 结果：通过。
- `./.codex/skills/web-performance-audit/scripts/run_lighthouse.sh --url https://example.com --preset mobile --runs 1 --out-dir .codex/lighthouse/smoke-20260306`
  - 首次结果：失败（`preset_flag[@]: unbound variable`）。
  - 修复后复跑：通过，成功生成 `run-1.report.json` 与 `run-1.report.html`。
- `node ./.codex/skills/web-performance-audit/scripts/summarize_lighthouse.mjs --report-dir .codex/lighthouse/smoke-20260306 --output .codex/lighthouse/smoke-20260306/summary.md`
  - 结果：通过，成功输出 Markdown 摘要。
- `python3 /Users/haoqiuzhi/.codex/skills/.system/skill-creator/scripts/quick_validate.py /Users/haoqiuzhi/code/one-base-template/.codex/skills/web-performance-audit`
  - 结果：通过（`Skill is valid!`）。

## 2026-03-06（实战分析：admin 登录页 Lighthouse）

- `pnpm -C apps/admin dev --host 127.0.0.1 --port 5173`
  - 结果：通过，端口占用后自动切换 `http://127.0.0.1:5174/`。
- `./.codex/skills/web-performance-audit/scripts/run_lighthouse.sh --url http://127.0.0.1:5174/login --preset mobile --runs 3 --out-dir .codex/lighthouse/admin-login-20260306`
  - 结果：通过，生成 3 组报告。
- `node ./.codex/skills/web-performance-audit/scripts/summarize_lighthouse.mjs --report-dir .codex/lighthouse/admin-login-20260306 --output .codex/lighthouse/admin-login-20260306/summary.md`
  - 结果：通过。
- `pnpm -C apps/admin build`
  - 结果：通过。
- `pnpm -C apps/admin preview --host 127.0.0.1 --port 5175`
  - 结果：通过，服务地址 `http://127.0.0.1:5175/`。
- `./.codex/skills/web-performance-audit/scripts/run_lighthouse.sh --url http://127.0.0.1:5175/login --preset mobile --runs 3 --out-dir .codex/lighthouse/admin-login-preview-20260306`
  - 结果：失败（`NO_FCP`）。
- `./.codex/skills/web-performance-audit/scripts/run_lighthouse.sh --url http://127.0.0.1:5175/login --preset desktop --runs 1 --out-dir .codex/lighthouse/admin-login-preview-desktop-20260306`
  - 结果：失败（`NO_FCP`）。

## 2026-03-06（CmsManagement publicity 迁移收口验证）

- `pnpm -C apps/admin typecheck`
  - 结果：首次失败（`column/page.vue` 4 处模板类型错误）；修复后复跑通过。
- `pnpm -C apps/admin lint && pnpm -C apps/admin build`
  - 结果：通过。
  - 构建备注：保留既有 `PLUGIN_TIMINGS` 提示（非阻断）。
- `pnpm -C apps/docs lint && pnpm -C apps/docs build`
  - 结果：通过。

## 2026-03-06（publicity 路由对齐老项目后复验）

- `pnpm -C apps/admin typecheck`
  - 结果：通过。
- `pnpm -C apps/admin lint`
  - 结果：通过。
- `pnpm -C apps/admin build`
  - 结果：通过（保留既有 `PLUGIN_TIMINGS` 非阻断提示）。
- `pnpm -C apps/docs lint`
  - 结果：通过。
- `pnpm -C apps/docs build`
  - 结果：通过。

## 2026-03-06（登录页性能优化收口：样式分流 + preload 写盘裁剪）

- `pnpm -C apps/admin exec vitest run src/__tests__/manual-chunks.test.ts src/__tests__/vite-config-source.test.ts src/bootstrap/__tests__/runtime.test.ts src/bootstrap/__tests__/public-bootstrap-source.test.ts src/bootstrap/__tests__/style-entries-source.test.ts src/pages/login/LoginPage.source.test.ts`
  - 结果：通过（6 个文件 / 12 个测试全绿）。
- `pnpm -C apps/admin typecheck`
  - 结果：通过。
- `pnpm -C apps/admin build`
  - 结果：通过。
  - 产物结果：
    - `apps/admin/dist/index.html` 不再包含 HTML 级 `modulepreload` / `stylesheet` 标签。
    - `apps/admin/dist/assets/index-*.js`、`admin-runtime-*.js`、`admin-auth-*.js`、`LoginPage-*.js` 均已注入 preload 过滤逻辑。
- `pnpm -C apps/docs build`
  - 结果：通过。
- 浏览器冒烟（开发态 `http://127.0.0.1:5173/login`）
  - 结果：通过。
  - 关键结论：
    - 未发现 `admin-entry` / `one-ui-shell` / `one-ui-table` / `vxe` / `portal-engine` 首屏请求。
    - 登录框正常渲染，控制台无报错。

## 2026-03-06（/login 首屏网络与控制台取证）

- 命令：
  - `agent-browser --session codex open http://127.0.0.1:5173/login`
  - `agent-browser --session codex eval "JSON.stringify(performance.getEntriesByType('resource').map(r=>r.name))"`
  - `agent-browser --session codex console --clear && agent-browser --session codex errors --clear && agent-browser --session codex reload`
  - `agent-browser --session codex console`
  - `agent-browser --session codex errors`
  - `agent-browser --session codex snapshot -i`
  - `agent-browser --session codex screenshot .codex/tmp/login-page.png`
- 结果：
  - `console` 输出为空（无首屏 console message）。
  - `errors` 输出为空（无首屏 page error）。
  - `snapshot` 命中登录关键控件：账号输入框、密码输入框、登录按钮。
  - `performance resource` 中命中登录相关模块，且未命中指定业务壳资源关键字。

## 2026-03-07（admin 登录页 build+preview 启动失败修复）

- RED：`pnpm -C apps/admin exec vitest run src/infra/__tests__/env.test.ts src/__tests__/manual-chunks.test.ts`
  - 结果：`env.test.ts` 失败，`getPlatformConfig()` 在导入 `env` 模块时已被调用 1 次；`manual-chunks.test.ts` 通过。
- GREEN（env 懒加载修复后）：`pnpm -C apps/admin exec vitest run src/infra/__tests__/env.test.ts src/__tests__/manual-chunks.test.ts`
  - 结果：2 个测试文件、8 个断言全部通过。
- GREEN（补充 ui 壳 chunk 断言后）：`pnpm -C apps/admin exec vitest run src/__tests__/manual-chunks.test.ts src/infra/__tests__/env.test.ts`
  - 结果：2 个测试文件、9 个断言全部通过。
- 全量验证：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
  - 结果：全部通过。
- 生产预览冒烟：
  - `pnpm -C apps/admin preview --host 127.0.0.1 --port 5175`（本机 5175~5177 被占用，实际使用 `http://127.0.0.1:5178/`）
  - `pnpm dlx playwright screenshot http://127.0.0.1:5178/login .codex/tmp/login-preview-after-fix.png --wait-for-timeout 3000 --save-har .codex/tmp/login-preview-after-fix.har --viewport-size "1440,900"`
  - 结果：截图显示登录页正常渲染，无“应用启动失败”界面；HAR 记录到页面仍会加载完整业务 chunk，作为残留性能问题保留。

## 2026-03-09（登录页性能优化第二轮收尾验证）

- `pnpm exec vitest run apps/admin/src/__tests__/manual-chunks.test.ts apps/admin/src/bootstrap/__tests__/public-bootstrap-source.test.ts apps/admin/src/bootstrap/__tests__/http-source.test.ts apps/admin/src/bootstrap/__tests__/runtime.test.ts apps/admin/src/pages/login/LoginPage.source.test.ts apps/admin/src/router/__tests__/public-routes.test.ts apps/admin/src/router/__tests__/public-routes.source.test.ts`
  - 结果：通过（`7` 个文件 / `19` 个测试全部通过）。
- `pnpm -C apps/admin typecheck`
  - 结果：通过。
- `pnpm -C apps/admin build`
  - 结果：通过。
  - 构建备注：
    - 仍有 2 条 `dynamic import will not move module into another chunk` warning（`LoginBox.vue` / `LoginBoxV2.vue` 与 `packages/ui/src/index.ts` 的静态导出共存导致）。
    - 仍有 `PLUGIN_TIMINGS` 提示；均为非阻断项。
- `pnpm -C apps/docs lint`
  - 结果：通过。
- `pnpm -C apps/docs build`
  - 结果：通过。
- `pnpm -C apps/admin preview --host 127.0.0.1 --port 5181`
  - 结果：通过；因 `5181`、`5182` 被占用，实际使用 `http://127.0.0.1:5183/`。
- `agent-browser --session codex open http://127.0.0.1:5183/login && agent-browser --session codex wait --load networkidle && agent-browser --session codex eval 'JSON.stringify(performance.getEntriesByType(\"resource\").map((entry) => entry.name).filter((name) => /admin-entry|admin-app-shell|one-ui-shell|one-ui-table|vxe|portal-engine|sortable-grid|admin-log-management/.test(name)), null, 2)'`
  - 结果：返回 `[]`，说明 `/login` 首屏未再请求上述业务壳资源。
- `agent-browser --session codex eval 'JSON.stringify({title: document.title, hasLoginButton: document.body.innerText.includes(\"登录\"), hasFailureText: document.body.innerText.includes(\"应用启动失败\")}, null, 2)'`
  - 结果：`hasLoginButton=true`、`hasFailureText=false`，登录页可见且未出现启动失败提示。

## 2026-03-09（登录页性能优化第三轮小收口：auth 导出 warning）

- RED：`pnpm exec vitest run packages/ui/src/auth-entry-source.test.ts`
  - 结果：失败（2/2 失败），证明当前 `packages/ui/src/index.ts` 仍直接导出 `LoginBox.vue` / `LoginBoxV2.vue`，且 `packages/ui/src/lite/auth.ts` 仍对 `LoginBox.vue` 使用 `defineAsyncComponent`。
- 过程记录：`pnpm exec vitest run packages/ui/src/auth-entry-source.test.ts packages/ui/src/index.test.ts packages/ui/src/lite.test.ts packages/ui/src/plugin.test.ts apps/admin/src/pages/login/LoginPage.source.test.ts apps/admin/src/__tests__/manual-chunks.test.ts`
  - 结果：失败。
  - 原因：`packages/ui` 现有 `index.test.ts` / `lite.test.ts` / `plugin.test.ts` 直接 import `.vue`，在仓库根直接运行时缺少 Vue 插件处理；本轮不修改既有测试运行方式，只保留源码约束测试与构建验证。
- GREEN：`pnpm exec vitest run packages/ui/src/auth-entry-source.test.ts apps/admin/src/pages/login/LoginPage.source.test.ts apps/admin/src/__tests__/manual-chunks.test.ts`
  - 结果：通过（`3` 个文件 / `15` 个测试全部通过）。
- `pnpm -C packages/ui typecheck`
  - 结果：通过。
- `pnpm -C packages/ui lint`
  - 结果：通过。
- `pnpm -C apps/admin typecheck`
  - 结果：通过。
- `pnpm -C apps/admin build`
  - 结果：通过。
  - 构建备注：原先 `LoginBox.vue` / `LoginBoxV2.vue` 的 `dynamic import will not move module into another chunk` warning 已消失；仅保留 `PLUGIN_TIMINGS` 非阻断提示。
- `pnpm -C apps/admin preview --host 127.0.0.1 --port 5181`
  - 结果：通过；因端口占用实际使用 `http://127.0.0.1:5183/`。
- `agent-browser --session codex open http://127.0.0.1:5183/login && agent-browser --session codex wait --load networkidle && agent-browser --session codex eval 'JSON.stringify({blocked: performance.getEntriesByType(\"resource\").map((entry) => entry.name).filter((name) => /admin-entry|admin-app-shell|one-ui-shell|one-ui-table|vxe|portal-engine|sortable-grid|admin-log-management/.test(name)), hasLoginButton: document.body.innerText.includes(\"登录\"), hasFailureText: document.body.innerText.includes(\"应用启动失败\")}, null, 2)'`
  - 结果：`blocked=[]`、`hasLoginButton=true`、`hasFailureText=false`。

## 2026-03-09（提交前复验）

- `pnpm exec vitest run packages/ui/src/auth-entry-source.test.ts apps/admin/src/pages/login/LoginPage.source.test.ts apps/admin/src/__tests__/manual-chunks.test.ts apps/admin/src/bootstrap/__tests__/http-source.test.ts apps/admin/src/infra/__tests__/env.test.ts apps/admin/src/router/__tests__/assemble-routes.source.test.ts apps/admin/src/router/__tests__/public-routes.source.test.ts apps/admin/src/router/__tests__/public-routes.test.ts`
  - 结果：通过（`8` 个文件 / `20` 个测试全部通过）。
- `pnpm -C packages/ui typecheck`
  - 结果：通过。
- `pnpm -C packages/ui lint`
  - 结果：通过。
- `pnpm -C apps/admin typecheck`
  - 结果：通过。
- `pnpm -C apps/admin build`
  - 结果：通过；仅保留 `PLUGIN_TIMINGS` 非阻断提示。
- `pnpm -C apps/docs lint`
  - 结果：通过。
- `pnpm -C apps/docs build`
  - 结果：通过。
- `pnpm -C apps/admin preview --host 127.0.0.1 --port 5181`
  - 结果：通过；因 `5181`、`5182` 被占用，实际使用 `http://127.0.0.1:5183/`。
- `agent-browser --session codex open http://127.0.0.1:5183/login && agent-browser --session codex wait --load networkidle && agent-browser --session codex eval 'JSON.stringify({blocked: performance.getEntriesByType(\"resource\").map((entry) => entry.name).filter((name) => /admin-entry|admin-app-shell|one-ui-shell|one-ui-table|vxe|portal-engine|sortable-grid|admin-log-management/.test(name)), hasLoginButton: document.body.innerText.includes(\"登录\"), hasFailureText: document.body.innerText.includes(\"应用启动失败\")}, null, 2)'`
  - 结果：`blocked=[]`、`hasLoginButton=true`、`hasFailureText=false`。

## 2026-03-09（admin 单启动链路补修：redirect base 归一化）

- RED：`pnpm -C apps/admin exec vitest run src/router/__tests__/redirect.test.ts src/pages/login/LoginPage.source.test.ts src/pages/sso/SsoCallbackPage.source.test.ts`
  - 结果：失败。
  - 原因：
    - `src/router/__tests__/redirect.test.ts` 无法找到 `../redirect`
    - `LoginPage.vue` / `SsoCallbackPage.vue` 仍未引入 redirect 归一化辅助函数
- GREEN：`pnpm -C apps/admin exec vitest run src/router/__tests__/redirect.test.ts src/pages/login/LoginPage.source.test.ts src/pages/sso/SsoCallbackPage.source.test.ts`
  - 结果：通过（`3` 个文件 / `6` 个测试全绿）。
- 全量回归：
  - `pnpm -C apps/admin exec vitest run src/bootstrap/__tests__/main-single-bootstrap.test.ts src/bootstrap/__tests__/style-entries-source.test.ts src/bootstrap/__tests__/http-source.test.ts src/pages/login/LoginPage.source.test.ts src/pages/sso/SsoCallbackPage.source.test.ts src/router/__tests__/redirect.test.ts src/__tests__/manual-chunks.test.ts`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
  - 结果：全部通过。
- 生产预览冒烟：
  - `pnpm -C apps/admin preview --host 127.0.0.1 --port 5191`
  - `agent-browser --session codex open 'http://127.0.0.1:5191/login?redirect=%2Fadmin%2Fhome%2Findex'`
  - `agent-browser --session codex open http://127.0.0.1:5191/sso`
- 结果：
  - `/login` 仍能看到“账号 / 密码 / 登录”，且无“应用启动失败”
  - `/sso` 仍能看到“返回登录页”，且无“应用启动失败”

## 2026-03-09（修复 ObVxeTable 非数组 data 导致 slice 报错）

- `pnpm exec vitest run packages/ui/src/vxe-table-source.test.ts`
  - 结果：通过（`1` 个文件 / `1` 个测试）。
- `pnpm -C packages/ui typecheck`
  - 结果：通过。
- `pnpm -C packages/ui lint`
  - 结果：通过。
- `pnpm -C apps/admin typecheck`
  - 结果：通过。
- `pnpm -C apps/admin build`
  - 结果：通过。

## 2026-03-09（CmsManagement 表格 ref 解包修复）

- RED（先失败）：
  - `pnpm -C apps/admin exec vitest run src/modules/CmsManagement/table-bindings.source.test.ts`
  - 结果：失败（`content/column` 页面仍包含 `:loading=\"table.loading\"` 与 `:data=\"table.dataList\"`）
- GREEN / 回归：
  - `pnpm -C apps/admin exec vitest run src/modules/CmsManagement/table-bindings.source.test.ts`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin build`
  - `pnpm exec vitest run packages/ui/src/vxe-table-source.test.ts`
  - `pnpm -C packages/ui typecheck`
  - `pnpm -C packages/ui lint`
- 结果：全部通过

## 2026-03-09（publicity/content 全屏 CRUD + 富文本 + 附件上传）

- 安装依赖：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template install`
- admin 验证：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin lint`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin build`
- docs 验证：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs lint`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：以上命令全部通过。
- 全仓回归：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template lint`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template build`
- 结果：全仓任务通过。

## 2026-03-09（publicity/content 联调推进）

- `pnpm -C apps/admin dev --host 127.0.0.1 --port 5174`
  - 结果：启动成功（本地可访问 `http://127.0.0.1:5174/`）。
- `agent-browser` 登录页自动化预演：
  - 填充账号/密码、触发滑块验证、执行滑块校验请求。
  - 结果：
    - `/cmict/auth/captcha/check` 可返回 `code=200`；
    - `/cmict/auth/login` 返回 `code=1001`（用户名或密码错误）；
    - 未生成 `localStorage.token`，无法进入 `/publicity/content` 做新增/编辑/查看联调。

## 2026-03-09（publicity/content 封面单图上传迁移）

- RED（先失败）：
  - `pnpm -C apps/admin exec vitest run src/modules/CmsManagement/content/cover-upload.source.test.ts`
  - 结果：失败（封面仍是 `el-input`，校验文案仍为“请输入封面地址”）。
- GREEN / 回归：
  - `pnpm -C apps/admin exec vitest run src/modules/CmsManagement/content/cover-upload.source.test.ts`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs build`
  - 结果：全部通过。

## 2026-03-09（publicity/content UI 布局优化）

- RED（先失败）
  - `pnpm -C apps/admin exec vitest run src/modules/CmsManagement/content/cover-upload.source.test.ts`
  - 结果：失败（新增布局断言未命中 `content-form-layout` 等类名）。
- GREEN / 回归
  - `pnpm -C apps/admin exec vitest run src/modules/CmsManagement/content/cover-upload.source.test.ts`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs build`
  - 结果：全部通过。
- 文档校验补充：
  - `pnpm -C apps/docs lint`
  - 结果：通过。
- 最终复验（纳入审查反馈后）：
  - `pnpm -C apps/admin exec vitest run src/modules/CmsManagement/content/cover-upload.source.test.ts`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
  - 结果：全部通过。

## 2026-03-09（publicity/content 二次 UI 收敛）

- RED（先失败）：
  - `pnpm -C apps/admin exec vitest run src/modules/CmsManagement/content/cover-upload.source.test.ts`
  - 结果：失败（新布局类 `content-form-shell` 未命中）。
- GREEN / 回归：
  - `pnpm -C apps/admin exec vitest run src/modules/CmsManagement/content/cover-upload.source.test.ts`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
  - 结果：全部通过。

## 2026-03-09（publicity/content 三次 UI 收敛：扁平化）

- 回归验证：
  - `pnpm -C apps/admin exec vitest run src/modules/CmsManagement/content/cover-upload.source.test.ts`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - 结果：全部通过。

## 2026-03-09（publicity/column 改为单列 CRUD 抽屉）

- 命令：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin build`
- 结果：全部通过

## 2026-03-09（publicity/column 单列抽屉默认 400）

- 命令：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
- 结果：全部通过

## 2026-03-09（删除 admin 历史测试）

- 文件清理验证：
  - `rg --files apps/admin | rg '(__tests__/|\\.test\\.)'`
  - 结果：无匹配（退出码 1，表示 `apps/admin` 范围内测试文件已清空）。
- 编译链路验证：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin build`
  - 结果：全部通过。
- 根门禁验证：
  - `pnpm verify`
  - 结果：失败，卡在既有 `pnpm check:naming`（命名白名单历史问题），不再出现 `test:admin:arch` 触发的 vitest 错误。

## 2026-03-09（命名门禁修复回归）

- 命名门禁：
  - `pnpm check:naming`
  - 结果：通过（未发现违反白名单的函数命名）。
- 根链路复验：
  - `pnpm verify`
  - 结果：通过（`typecheck + lint + check:naming + build` 全链路通过）。

## 2026-03-09（UserManagement 分层改造收尾验证）

- 定向验证：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 全链路验证：
  - `pnpm verify`
- 结果：全部通过。

## 2026-03-09（mock 菜单进一步瘦身后的回归）

- 命令：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin build`
- 结果：全部通过。

## 2026-03-09（UserManagement 去冗余 mapper 回归）

- 子项目验证：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 全仓门禁：
  - `pnpm verify`
- 结果：全部通过。

## 2026-03-09（UserManagement mapper 完整下线回归）

- 命令：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
  - `pnpm verify`
- 结果：全部通过。

## 2026-03-09（\*Management types.ts 抽离同步回归）

- 命令：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
  - `pnpm verify`
- 结果：全部通过。

## 2026-03-09（方案 1：\*Management normalizers 下沉回归）

- 命令：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
  - `pnpm verify`
- 结果：
  - 全部通过。
  - `lint` 过程中同步清理了 5 处 unused imports，未引入额外行为改动。

## 2026-03-09（移除 normalizers，API 层仅保留 api.ts + types.ts）

- 子项目验证：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 全仓门禁：
  - `pnpm verify`
- 结果：
  - 全部通过。

## 2026-03-09（极致薄 API + LogManagement 子功能 API 结构对齐补充回归）

- 命令：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
  - `pnpm verify`
- 结果：全部通过。

## 2026-03-09（LogManagement types 再收敛：关键字段 + 索引签名）

- 命令：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：全部通过
- 过程记录：
  - 首次 `typecheck` 失败（`row.userAccount` 由可选传入 `confirmDelete*` 触发 `string | undefined` 报错）；
  - 调整 `LoginLogRecord/SysLogRecord` 的 `userAccount` 为必填后复跑通过。

## 2026-03-09（home/index 403 修复回归）

- RED（先写失败测试）：
  - `pnpm -C packages/core test:run src/router/guards.test.ts`
  - 结果：失败（`resolveMenuKeyCandidates is not a function`），符合预期。
- GREEN（实现后复测）：
  - `pnpm -C packages/core test:run src/router/guards.test.ts`
  - 结果：通过（3/3）。
- 类型与集成验证：
  - `pnpm -C packages/core typecheck`（通过）
  - `pnpm -C apps/admin typecheck`（通过）
- 文档站点验证（因更新了 docs）：
  - `pnpm -C apps/docs lint`（通过）
  - `pnpm -C apps/docs build`（通过）
- 补充静态检查：
  - `pnpm -C packages/core lint`（通过）
- 全量 core 单测：
  - `pnpm -C packages/core test:run`（53/53 通过）
  - 备注：`useTable` 既有用例打印一条 Vue warn（缺少 template/render），不影响通过，属于历史测试噪音。

## 2026-03-09（首页静态路由 skipMenuAuth 调整）

- 命令：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - `apps/docs lint/build` 通过。
  - `apps/admin typecheck` 失败（当前分支既有历史问题，集中在 `CmsManagement/UserManagement` 类型定义，非本次首页路由改动引入）。

## 2026-03-09（批量 types 瘦身后回归修复）

- RED（先失败）：
  - `pnpm -C apps/admin typecheck`
  - 结果：失败。
  - 主要报错：
    - `ContentEditForm.vue`：附件表单类型与 `ContentAttachment` 可选字段不一致；富文本上传回调返回 `string | undefined`。
    - `OrgEditForm.vue`：`DictItem/OrgLevelItem` 可选字段传给 `el-option` 的 `label/value` 时报错。
    - `useRoleAssignPageState.ts`：`RoleMemberRecord.nickName/userAccount` 可选导致 `PersonnelSelectedUser` 不匹配。
    - `user/form.ts`：`UserOrgPostForm` 回填到 `UserOrgPostRecord[]`（索引签名）不匹配。
- GREEN（修复后复测）：
  - `pnpm -C apps/admin typecheck`（通过）
  - `pnpm -C apps/admin lint`（通过）
  - `pnpm -C apps/admin build`（通过）
  - `pnpm -C apps/docs lint`（通过）
  - `pnpm -C apps/docs build`（通过）

## 2026-03-09（移除首页互认保护后的回归）

- 命令：
  - `pnpm -C packages/core test:run`（通过，50/50）
  - `pnpm -C packages/core typecheck`（通过）
  - `pnpm -C packages/core lint`（通过）
  - `pnpm -C apps/admin lint`（通过）
  - `pnpm -C apps/admin typecheck`（通过）
  - `pnpm -C apps/docs lint`（通过）
  - `pnpm -C apps/docs build`（通过）
- 备注：
  - `packages/core` 既有 `useTable` 用例仍会输出一条 Vue warn（缺少 template/render），不影响断言与退出码。

## 2026-03-09（admin 结构 README 文档任务）

- `pnpm -C apps/admin typecheck`：通过
- `pnpm -C apps/admin lint`：通过
- `pnpm -C apps/admin build`：通过

## 2026-03-09（共享 API 通用类型上收）

- 命令：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：全部通过。

## 2026-03-09（P0：无引用文件清理回归）

- `pnpm -C apps/admin typecheck`：通过
- `pnpm -C apps/admin lint`：通过
- `pnpm -C apps/admin build`：通过

## 2026-03-09（P0：最小单测补齐回归）

- `pnpm -C apps/admin exec vitest run src/infra/__tests__/http.unit.test.ts src/infra/__tests__/env.unit.test.ts src/bootstrap/__tests__/http.unit.test.ts`：通过（3 files / 9 tests）
- `pnpm -C apps/admin typecheck`：通过
- `pnpm -C apps/admin lint`：通过
- `pnpm -C apps/admin build`：通过

## 2026-03-10（Option 2：分页类型命名统一）

- 命令：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：全部通过。

## 2026-03-10（`*Management` 模块 BizResponse 命名统一）

- 命令：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：全部通过。

## 2026-03-10（admin 全层级解耦优化）

- 引用回归检查：
  - `rg -n "@/shared/api/utils|shared/api/utils" apps/admin/src --no-heading`
  - 结果：无匹配（确认删除 `shared/api/utils.ts` 后无残留依赖）。
- 单测：
  - `pnpm -C apps/admin exec vitest run src/infra/__tests__/http.unit.test.ts src/infra/__tests__/env.unit.test.ts src/bootstrap/__tests__/http.unit.test.ts`
  - 结果：通过（3 files / 9 tests）。
- 类型校验：
  - `pnpm -C apps/admin typecheck`
  - 结果：通过。
- 规范校验：
  - `pnpm -C apps/admin lint`
  - 结果：通过（Checked 211 files, no fixes）。
- 构建校验：
  - `pnpm -C apps/admin build`
  - 结果：通过（仅保留既有 `PLUGIN_TIMINGS` 非阻断提示）。

## 2026-03-10（Option 2：移除 ApiResponseAlias，直接使用 ApiResponse）

- 命令：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：全部通过。

## 2026-03-10（admin 全层级优化 + 文档同步）

- 命令：
  - `pnpm -C apps/admin exec vitest run src/infra/__tests__/http.unit.test.ts src/infra/__tests__/env.unit.test.ts src/bootstrap/__tests__/http.unit.test.ts`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：全部通过

## 2026-03-10（并行优化第一批）

- 命令：
  - `pnpm -C apps/admin exec vitest run src/router/__tests__/assemble-routes.unit.test.ts src/bootstrap/__tests__/http.unit.test.ts src/infra/__tests__/env.unit.test.ts src/infra/__tests__/http.unit.test.ts`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：全部通过。
- 过程备注：
  - 首次执行路由单测时，因 `@one-base-template/ui/shell` 样式导入触发 Node 环境 `.css` 扩展错误；在测试中增加 `vi.mock("@one-base-template/ui/shell")` 后通过。

## 2026-03-10（admin 第二批优化：守卫/SSO/Vite mock）

- 并行子任务验证：
  - `pnpm -C packages/core test:run src/router/guards.test.ts`：通过（5 passed）
  - `pnpm -C apps/admin exec vitest run src/shared/services/__tests__/sso-callback-strategy.unit.test.ts`：通过（7 passed）
- 主线回归：
  - `pnpm -C packages/core lint`：通过
  - `pnpm -C packages/core typecheck`：失败（历史问题：`src/hooks/admin-normalize-compat.test.ts` 仍引用已删除的 `apps/admin/src/shared/api/normalize`，与本次改动无关）
  - `pnpm -C apps/admin typecheck`：通过
  - `pnpm -C apps/admin lint`：通过
  - `pnpm -C apps/admin build`：通过
  - `pnpm -C apps/docs lint`：通过
  - `pnpm -C apps/docs build`：通过
- 补充回归（修正 guards 类型后）：
  - `pnpm -C packages/core test:run src/router/guards.test.ts`：通过
  - `pnpm -C apps/admin typecheck`：通过
  - `pnpm -C apps/docs lint`：通过
  - `pnpm -C apps/docs build`：通过

## 2026-03-10（继续执行：core 历史阻塞清理）

- `pnpm -C packages/core typecheck`：通过
- `pnpm -C packages/core lint`：通过
- `pnpm -C packages/core test:run src/router/guards.test.ts`：通过（5 passed）
- `pnpm -C apps/admin typecheck`：通过
- `pnpm -C apps/docs build`：通过

## 2026-03-10（继续执行：admin 第三批优化收口）

- `pnpm -C packages/core typecheck`：通过
- `pnpm -C packages/core test:run src/router/guards.test.ts`：通过（7 passed）
- `pnpm -C apps/admin exec vitest run src/shared/services/__tests__/sso-callback-strategy.unit.test.ts`：通过（9 passed）
- `pnpm -C apps/admin typecheck`：通过
- `pnpm -C apps/admin lint`：通过
- `pnpm -C packages/core lint`：通过
- `pnpm -C apps/docs lint`：通过
- `pnpm -C apps/admin build`：通过（保留 `PLUGIN_TIMINGS` 非阻断提示）
- `pnpm -C apps/docs build`：通过

## 2026-03-10（第四批并行优化：测试执行记录）

- `pnpm -C apps/admin exec vitest run src/router/__tests__/redirect.unit.test.ts src/router/__tests__/registry.unit.test.ts`：通过（2 files / 6 tests）
- `pnpm -C apps/admin exec vitest run src/shared/services/__tests__/auth-scenario-provider.unit.test.ts src/shared/services/__tests__/sso-callback-strategy.unit.test.ts`：通过（2 files / 16 tests）
- `pnpm -C apps/admin typecheck`：通过
- `pnpm -C apps/admin lint`：通过
- `pnpm -C apps/admin build`：通过（`PLUGIN_TIMINGS` 非阻断提示）
- `pnpm -C apps/docs lint`：通过
- `pnpm -C apps/docs build`：通过

## 2026-03-10（第四批续：路由装配策略 + 体积热点优化）

- 定向测试：
  - `pnpm -C apps/admin exec vitest run src/router/__tests__/assemble-routes.unit.test.ts src/router/__tests__/assemble-routes-policy.unit.test.ts src/router/__tests__/redirect.unit.test.ts src/router/__tests__/registry.unit.test.ts`
  - 结果：通过（4 files / 11 tests）。
  - 备注：`assemble-routes.unit.test.ts` 在 `portal` 兼容路径场景会输出 `重复 path /portal/setting` 的预期 warn 日志，测试断言通过。
- UI 子包测试：
  - `pnpm -C packages/ui exec vitest run src/iconify/menu-iconify.test.ts`
  - 结果：通过（1 file / 4 tests）。
- 全量回归：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
  - 结果：全部通过。
  - 构建备注：仍有 `PLUGIN_TIMINGS` 非阻断提示；大体积 chunk 仍在（`iconify-ri` / `vxe` / `element-plus`），但预加载策略已进一步收紧。

## 2026-03-10（第四批续：补充认证回归）

- `pnpm -C apps/admin exec vitest run src/shared/services/__tests__/auth-scenario-provider.unit.test.ts src/shared/services/__tests__/sso-callback-strategy.unit.test.ts`
- 结果：通过（2 files / 16 tests）。

## 2026-03-10（方案1收口验证）

- `pnpm -C apps/admin lint:arch`
  - 首次失败（规则过严，误拦 `config/platform-config.ts` / `shared/logger.ts` 的既有合法场景）。
  - 调整 `scripts/check-admin-arch.mjs` 白名单后复跑通过。
- `pnpm -C apps/admin test:run`：通过（9 files / 36 tests）。
- `pnpm -C apps/admin typecheck`：通过（初次因新依赖未链接失败，执行 `pnpm install` 后通过）。
- `pnpm -C apps/admin lint`：通过。
- `pnpm -C apps/admin build`：通过（存在 `PLUGIN_TIMINGS` 非阻断提示）。
- `pnpm -C apps/portal typecheck`：通过。
- `pnpm -C apps/template typecheck`：通过。
- `pnpm lint:arch`：通过。
- `pnpm test:run`：通过（turbo 汇总：admin/core/utils 均通过）。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过（docs/admin/portal/template 均构建成功；portal/admin 保留大 chunk warning，非阻断）。

## 2026-03-10（并行优化第1模块：registry 按需动态加载）

- 命令：
  - `pnpm -C apps/admin exec vitest run src/router/__tests__/registry.unit.test.ts src/router/__tests__/assemble-routes.unit.test.ts src/router/__tests__/assemble-routes-policy.unit.test.ts`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint:arch`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：全部通过。
- 备注：`assemble-routes.unit.test.ts` 在 portal 用例会打印既有的重复 path warn（`/portal/setting`），不影响断言通过。

## 2026-03-10（并行优化第2模块：skipMenuAuth 分级 + 生产白名单）

- 命令：
  - `pnpm -C apps/admin exec vitest run src/router/__tests__/skip-menu-auth.unit.test.ts src/router/__tests__/assemble-routes.unit.test.ts src/router/__tests__/assemble-routes-policy.unit.test.ts`
  - `pnpm -C packages/core exec vitest run src/config/platform-config.test.ts src/router/guards.test.ts`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint:arch`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：全部通过。
- 备注：`assemble-routes.unit` 仍会输出既有 portal 重复路径 warn，不影响断言结果。

## 2026-03-10（admin 模块 C：去除 app.\_context 私有 API 依赖）

- RED：
  - `pnpm -C apps/admin exec vitest run src/components/PersonnelSelector/__tests__/openPersonnelSelection.unit.test.ts`
  - 结果：失败（`传入 appContext` 用例断言 `vnode.appContext` 为 `undefined`）。
- GREEN / 回归：
  - `pnpm -C apps/admin exec vitest run src/components/PersonnelSelector/__tests__/openPersonnelSelection.unit.test.ts`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint:arch`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：全部通过。

## 2026-03-10（admin 模块 D：构建体积预算门禁）

- 命令：
  - `pnpm -C apps/admin build`
  - `pnpm check:admin:bundle`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：全部通过（预算检查 pass：iconify-ri/vxe/element-plus/page）。

## 2026-03-10（admin 模块 E：路由装配构造层拆分）

- 命令：
  - `pnpm -C apps/admin exec vitest run src/router/__tests__/assemble-routes.unit.test.ts src/router/__tests__/assemble-routes-policy.unit.test.ts src/router/__tests__/skip-menu-auth.unit.test.ts`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint:arch`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：全部通过。

## 2026-03-10（移除项目运行时 mock）

- 命令：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint:arch`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/template typecheck`
  - `pnpm -C apps/template build`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：全部通过
- 2026-03-10（文案口径收敛）
  - `pnpm -C apps/docs lint`：通过
  - `pnpm -C apps/docs build`：通过
  - `pnpm -C apps/template typecheck`：通过

## 2026-03-10（admin router 可读性优化 + core 路由纯函数下沉）

- RED（先失败）
  - `pnpm -C packages/core test:run src/router/route-utils.test.ts src/router/redirect.test.ts`
  - 结果：失败（新文件 `route-utils.ts` / `redirect.ts` 尚不存在，import 解析失败）

- GREEN / 回归
  - `pnpm -C packages/core test:run src/router/route-utils.test.ts src/router/redirect.test.ts src/router/guards.test.ts`
  - `pnpm -C apps/admin test:run src/router/__tests__/redirect.unit.test.ts src/router/__tests__/assemble-routes.unit.test.ts src/router/__tests__/assemble-routes-policy.unit.test.ts src/router/__tests__/skip-menu-auth.unit.test.ts`
  - `pnpm -C packages/core typecheck`
  - `pnpm -C packages/core lint`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：全部通过。

## 2026-03-10（admin 路由文件组织收敛：routes.ts 与 routes/ 去冗余）

- 命令：
  - `pnpm -C apps/admin test:run src/router/__tests__/assemble-routes.unit.test.ts src/router/__tests__/assemble-routes-policy.unit.test.ts src/router/__tests__/registry.unit.test.ts`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint:arch`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：全部通过。

## 2026-03-10（admin router 去复杂化：去策略化 + 配置收敛）

- 命令：
  - `pnpm -C apps/admin exec vitest run src/router/__tests__/assemble-routes.unit.test.ts src/router/__tests__/skip-menu-auth.unit.test.ts src/router/__tests__/registry.unit.test.ts`
  - `pnpm -C packages/core exec vitest run src/config/platform-config.test.ts`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：全部通过
- 补充回归：
  - `pnpm -C apps/admin test:run`
  - `pnpm -C packages/core typecheck`
- 结果：通过

## 2026-03-10（router 文件收敛：合并 skip-menu-auth）

- 命令：
  - `pnpm -C apps/admin test:run`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
- 结果：全部通过

## 2026-03-10（router 文件压缩：移除 route-meta）

- 命令：
  - `pnpm -C apps/admin test:run`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：全部通过

## 2026-03-10（admin router 继续压缩：删除 validator/redirect 薄层）

- 命令：
  - `pnpm -C apps/admin test:run`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：全部通过

## 2026-03-10（router 通用装配能力下沉 core）

- 命令：
  - `pnpm -C packages/core exec vitest run src/router/module-assembly.test.ts src/router/route-utils.test.ts src/router/redirect.test.ts src/router/guards.test.ts`
  - `pnpm -C packages/core typecheck`
  - `pnpm -C packages/core lint`
  - `pnpm -C apps/admin test:run`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：全部通过

## 2026-03-10（registry 纯逻辑下沉 core）

- 命令：
  - `pnpm -C packages/core exec vitest run src/router/module-registry.test.ts src/router/module-assembly.test.ts src/router/route-utils.test.ts src/router/guards.test.ts`
  - `pnpm -C packages/core typecheck`
  - `pnpm -C packages/core lint`
  - `pnpm -C apps/admin exec vitest run src/router/__tests__/registry.unit.test.ts src/router/__tests__/assemble-routes.unit.test.ts`
  - `pnpm -C apps/admin test:run`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：全部通过

## 2026-03-10（固定公共路由工厂下沉 core）

- 命令：
  - `pnpm -C packages/core exec vitest run src/router/fixed-routes.test.ts src/router/module-registry.test.ts src/router/module-assembly.test.ts src/router/route-utils.test.ts src/router/guards.test.ts`
  - `pnpm -C packages/core typecheck`
  - `pnpm -C packages/core lint`
  - `pnpm -C apps/admin exec vitest run src/router/__tests__/assemble-routes.unit.test.ts src/router/__tests__/registry.unit.test.ts`
  - `pnpm -C apps/admin test:run`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：全部通过

## 2026-03-10（router 类型中转层收敛）

- 命令：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin exec vitest run src/router/__tests__/assemble-routes.unit.test.ts src/router/__tests__/registry.unit.test.ts`
- 结果：全部通过

## 2026-03-10（router 再压缩：删除 types.ts）

- 命令：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin exec vitest run src/router/__tests__/assemble-routes.unit.test.ts src/router/__tests__/registry.unit.test.ts`
- 结果：全部通过

## 2026-03-10（router 公共路由下沉独立文件 + 公共路由名简化）

- 命令：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin exec vitest run src/router/__tests__/assemble-routes.unit.test.ts src/router/__tests__/registry.unit.test.ts`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：全部通过

## 2026-03-10（router 常量继续降噪：移除 APP\_ 前缀）

- 命令：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin exec vitest run src/router/__tests__/assemble-routes.unit.test.ts src/router/__tests__/registry.unit.test.ts src/bootstrap/__tests__/http.unit.test.ts`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：全部通过

## 2026-03-10（router 继续去冗余：aliasRoutes 命名与 404 参数推断）

- 命令：
  - `pnpm -C packages/core exec vitest run src/router/fixed-routes.test.ts src/router/module-assembly.test.ts`
  - `pnpm -C apps/admin exec vitest run src/router/__tests__/assemble-routes.unit.test.ts src/router/__tests__/registry.unit.test.ts`
  - `pnpm -C packages/core typecheck`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C packages/core lint`
  - `pnpm -C apps/admin lint`
- 结果：全部通过

## 2026-03-10（HTTP 链路收敛到 core）

- 命令：
  - `pnpm -C packages/core exec vitest run src/http/runtime.test.ts`
  - `pnpm -C packages/core typecheck`
  - `pnpm -C packages/core lint`
  - `pnpm -C packages/core test:run`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin lint:arch`
  - `pnpm -C apps/admin exec vitest run src/bootstrap/__tests__/http.unit.test.ts src/infra/__tests__/env.unit.test.ts`
  - `pnpm -C apps/admin test:run`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/portal typecheck`
  - `pnpm -C apps/portal lint`
  - `pnpm -C apps/portal build`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：全部通过。
- 备注：
  - 先执行 TDD Red：`runtime.test.ts` 初次运行失败（`./runtime` 不存在）。
  - 再实现 `runtime.ts` 后 Green，通过并纳入 core 全量测试。

## 2026-03-10（admin bootstrap 链路压平）

- 命令：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint:arch`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin test:run`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：全部通过。
- 追加回归：修正 architecture 文档遗留引用后，复跑 `pnpm -C apps/docs lint` 与 `pnpm -C apps/docs build`，结果通过。

## 2026-03-10（main 直写 app.use 扩展位）

- RED：
  - `pnpm -C apps/admin exec vitest run src/bootstrap/__tests__/startup.unit.test.ts`
  - 结果：失败（`beforeMount` 未透传，`expected undefined to be [Function spy]`）。

- GREEN / 回归：
  - `pnpm -C apps/admin exec vitest run src/bootstrap/__tests__/startup.unit.test.ts`
  - `pnpm -C packages/app-starter typecheck`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint:arch`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin test:run`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：全部通过。

## 2026-03-10（样式入口约定）

执行命令与结果：

- `pnpm -C apps/admin typecheck`：通过
- `pnpm -C apps/admin lint:arch`：通过
- `pnpm -C apps/admin lint`：通过
- `pnpm -C apps/admin test:run`：通过（8 files / 32 tests）
- `pnpm -C apps/admin build`：通过
- `pnpm -C apps/docs lint`：通过
- `pnpm -C apps/docs build`：通过

备注：

- `apps/admin test:run` 输出包含 Dart Sass legacy-js-api deprecation warning（历史告警，本次改动未新增）。
- `apps/admin build` 输出包含 plugin timings warning（构建性能提示，本次改动未新增）。

## 2026-03-10（shared 目录边界约定）

执行命令与结果：

- `pnpm -C apps/docs lint`：通过
- `pnpm -C apps/docs build`：通过

## 2026-03-10（docs 导航重构 + 首页美化 + 过时内容修复）

- 命令：
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：全部通过

## 2026-03-10（docs 重构交付前复验）

- `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs lint`：通过
- `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`：通过
- `rg -n "packages/core/src/stores/tabs\.ts|apps/admin/src/shared/api/normalize\.ts" apps/docs/docs`：无匹配（exit code 1）

## 2026-03-10（新增本地技能：Markdown 技术文档写作）

执行命令与结果：

- `python3 /Users/haoqiuzhi/.codex/skills/.system/skill-creator/scripts/quick_validate.py /Users/haoqiuzhi/code/one-base-template/.codex/skills/write-markdown-tech-docs`：通过（Skill is valid!）
- `pnpm -C apps/docs lint`：通过
- `pnpm -C apps/docs build`：通过

## 2026-03-10（docs 文档美化）

执行命令与结果：

- `pnpm -C apps/docs lint`：通过
- `pnpm -C apps/docs build`：通过

## 2026-03-10（architecture 聚焦化重构验证）

- `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs lint`：通过
- `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`：通过

## 2026-03-10（admin 多角度评估取证）

执行命令与结果：

- `pnpm -C apps/admin typecheck`：通过
- `pnpm -C apps/admin lint`：通过（Checked 212 files）
- `pnpm -C apps/admin build`：通过（产物分包成功，含 plugin timings 提示）
- `pnpm check:admin:bundle`：通过（iconify-ri / vxe / element-plus / page chunk 均在预算内）
- `pnpm -C apps/admin lint:arch`：通过

## 2026-03-10（VitePress 样式优化）

执行命令与结果：

- `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs lint`：通过
- `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`：通过

## 2026-03-10（admin 并行审查收口 + HTTP1.0 分包门禁增强）

执行命令与结果：

- `pnpm check:admin:bundle`：通过
  - `iconify-ri`：PASS（1017.3 KiB / 1120 KiB）
  - `wangeditor`：PASS（781.1 KiB / 980 KiB）
  - `vxe`：PASS（980.7 KiB / 1080 KiB）
  - `element-plus`：PASS（612.4 KiB / 720 KiB）
  - `page-*`：PASS（23.2 KiB / 920 KiB）
  - `startup dependency map js count`：PASS（21 / 22）
  - `startup dependency map js gzip`：PASS（765.8 KiB / 820 KiB）
  - `tiny chunks <= 12 KiB`：PASS（10 / 12）
- `pnpm -C apps/admin exec vitest run src/__tests__/manual-chunks.unit.test.ts`：通过（1 files / 3 tests）
- `pnpm -C apps/docs lint`：通过
- `pnpm -C apps/docs build`：通过

## 2026-03-10（处理中等级问题：403 恢复路径 / lint:arch 防绕过 / verify-CI 对齐）

执行命令与结果：

- `pnpm -C apps/admin lint:arch`：通过（改造后规则无误伤）
- `pnpm -C packages/ui typecheck`：通过（403 页面改动通过类型检查）
- `pnpm verify`：通过
  - 覆盖 `lint:arch/test:run/typecheck/lint/build/check:admin:bundle`
- `pnpm -C apps/docs lint`：通过
- `pnpm -C apps/docs build`：通过

## 2026-03-10（回滚路径展示与复制交互）

执行命令与结果：

- `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs lint`：通过
- `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`：通过
- `rg -n "doc-file-chip|pathChip|点击后复制|点击复制|文件名 chip|路径型 inline code" /Users/haoqiuzhi/code/one-base-template/apps/docs/docs /Users/haoqiuzhi/code/one-base-template/apps/docs/docs/.vitepress/theme`：无匹配（exit code 1）

## 2026-03-11（门户设计器并行收口复验）

执行命令与结果：

- `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin lint`：通过（Checked 212 files）
- `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`：通过
- `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin build`：通过
- `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/portal lint`：通过
- `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/portal typecheck`：通过
- `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/portal-engine lint`：通过
- `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/portal-engine typecheck`：通过
- `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs lint`：通过
- `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`：通过

约束检查：

- `rg -n "\\bel-table\\b|\\bElMessage\\b|@/utils/message" apps/admin/src/modules/portal/pages/PortalTemplateListPage.vue`
  - 命中：`@/utils/message`
  - 未命中：`el-table`、`ElMessage`
- `rg -n "ObVxeTable|el-table" apps/admin/src/modules/portal/pages/PortalTemplateListPage.vue`
  - 命中：`ObVxeTable`
  - 未命中：`el-table`

## 2026-03-11（portal 消息统一追加验证）

执行命令与结果：

- `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin lint`：通过
- `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`：通过
- `rg -n "\\bElMessage\\b" /Users/haoqiuzhi/code/one-base-template/apps/admin/src/modules/portal/pages`：无匹配（exit code 1）
- `rg -n "@/utils/message|message\\.(error|success|warning)" .../PortalTemplateSettingPage.vue`：命中并确认替换完成
- `rg -n "@/utils/message|message\\.(error|success|warning)" .../PortalPageEditPage.vue`：命中并确认替换完成

## 2026-03-11（portal 全量消息统一验证）

执行命令与结果：

- `rg -n "\\bElMessage\\b|\\bel-table\\b" packages/portal-engine/src apps/admin/src/modules/portal apps/portal/src/modules/portal`
  - 命中仅剩：`packages/portal-engine/src/materials/cms/common/message.ts`（统一封装内）
- `pnpm -C packages/portal-engine lint`：通过
- `pnpm -C packages/portal-engine typecheck`：通过
- `pnpm -C apps/admin lint`：通过
- `pnpm -C apps/admin typecheck`：通过
- `pnpm -C apps/portal lint`：通过
- `pnpm -C apps/portal typecheck`：通过
- `pnpm -C apps/docs lint`：通过
- `pnpm -C apps/docs build`：通过

## 2026-03-11（portalManagement 路由对齐验证）

执行命令与结果：

- `pnpm -C apps/admin lint`：通过
- `pnpm -C apps/admin typecheck`：首次失败
  - 原因：`src/router/__tests__/assemble-routes.unit.test.ts` 中将 `RouteRecordRaw[]` 强转为 `Record<string, unknown>[]` 导致 TS2352
  - 修复：测试辅助函数 `flattenRoutes` 改为 `RouteRecordRaw` 强类型实现
- `pnpm -C apps/admin typecheck`：修复后通过
- `pnpm -C apps/admin exec vitest run src/router/__tests__/assemble-routes.unit.test.ts src/router/__tests__/registry.unit.test.ts`：通过（2 files / 6 tests）
- `pnpm -C apps/docs lint`：通过
- `pnpm -C apps/docs build`：通过

## 2026-03-11（portalManagement 目录改名验证）

执行命令与结果：

- `pnpm -C apps/admin lint`：通过
- `pnpm -C apps/admin typecheck`：通过
- `pnpm -C apps/docs lint`：通过
- `pnpm -C apps/docs build`：通过
- `pnpm -C packages/core exec vitest run src/router/module-registry.test.ts`：通过（1 file / 4 tests）

## 2026-03-11（PortalManagement 命名统一 + CRUD list.vue + services 删除）

执行命令与结果：

- `pnpm -C apps/admin lint`：通过（Checked 211 files）
- `pnpm -C apps/admin typecheck`：通过
- `pnpm -C apps/docs lint`：通过
- `pnpm -C apps/docs build`：通过
- `pnpm -C packages/core exec vitest run src/router/module-registry.test.ts`：通过（1 file / 4 tests）
- `pnpm -C apps/admin exec vitest run src/router/__tests__/assemble-routes.unit.test.ts src/router/__tests__/registry.unit.test.ts src/__tests__/manual-chunks.unit.test.ts`：通过（3 files / 9 tests）

## 2026-03-11（PortalManagement 列表页改名与结构对齐）

执行命令与结果：

- `pnpm -C apps/admin lint`：通过（Checked 211 files）
- `pnpm -C apps/admin typecheck`：通过
- `pnpm -C apps/admin exec vitest run src/router/__tests__/assemble-routes.unit.test.ts src/router/__tests__/registry.unit.test.ts`：通过（2 files / 6 tests）

## 2026-03-11（PortalTemplateCreateDialog -> ObCrudContainer）

执行命令与结果：

- `pnpm -C apps/admin typecheck`：通过
- `pnpm -C apps/admin lint`：通过（Checked 209 files）

## 2026-03-11（feedback 收拢到 shared/feedback）

执行命令与结果：

- `pnpm -C apps/admin lint:arch`：通过
- `pnpm -C apps/admin lint`：通过（Checked 209 files）
- `pnpm -C apps/admin typecheck`：通过
- `pnpm -C apps/docs lint`：通过
- `pnpm -C apps/docs build`：通过

## 2026-03-11（feedback 下沉 packages/ui 收口验证）

执行命令与结果：

- `pnpm -C packages/ui typecheck`：通过
- `pnpm -C apps/admin lint:arch`：通过（admin 架构边界检查通过）
- `pnpm -C apps/admin typecheck`：通过
- `pnpm -C apps/admin lint`：通过（Checked 207 files）
- `pnpm -C apps/docs lint`：通过
- `pnpm -C apps/docs build`：通过

残留检索：

- `rg -n "@one@one-base-template|-base-template/ui|@/shared/feedback|src/shared/feedback|@/infra/confirm|@/utils/message" apps packages scripts AGENTS.md apps/admin/AGENTS.md apps/docs/docs/guide`
  - 结果：仅保留合法 `@one-base-template/ui` 与更新后的规则文案，无旧路径与污染字符串残留。

## 2026-03-11（PortalManagement 大小写冲突）

- `pnpm -C apps/admin typecheck`：通过。
- `pnpm -C apps/admin lint`：通过。

## 2026-03-11（obHttp 直连调用红线）

执行命令与结果：

- `pnpm -C apps/admin lint:arch`：通过（包含新增 `obHttp` 包装禁用规则）
- `pnpm -C apps/docs lint`：通过
- `pnpm -C apps/docs build`：通过
- `pnpm -C apps/admin typecheck`：通过
- `rg -n "getObHttpClient\(|const\s+http\s*=\s*obHttp\(\)|function\s+getHttp\s*\(" apps packages scripts`：仅命中文档/规则文本，无代码残留

## 2026-03-11（PortalManagement 路由重命名 + 预览重构 + 树 UI 优化）

执行命令与结果：

- `pnpm -C apps/admin exec vitest run src/router/__tests__/assemble-routes.unit.test.ts`：通过（1 file / 3 tests）
- `pnpm -C apps/admin typecheck`：通过
- `pnpm -C apps/admin build`：通过
- `pnpm -C apps/docs lint`：通过
- `pnpm -C apps/docs build`：通过
- `pnpm -C apps/admin lint`：失败（存在仓库历史 6 处 `useImportType` 报错，位于 `CmsManagement/SystemManagement/UserManagement`，与本次 Portal 改动无关）

## 2026-03-11（PortalDesigner 左侧树：icon 化与间距优化）

执行命令与结果：

- `pnpm -C apps/admin typecheck`：通过
- `pnpm -C apps/admin build`：通过

## 2026-03-11（Portal Designer 全页面 UI 优化）

- 命令：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin build`
- 结果：
  - `typecheck`：失败（仓库既有问题，非本次引入）
    - `src/components/PersonnelSelector/PersonnelSelectorSourcePanel.vue:110` 参数 `checked` 隐式 any
    - `src/components/PersonnelSelector/PersonnelSelectorSourcePanel.vue:134` 参数 `checked` 隐式 any
    - `src/modules/SystemManagement/menu/list.vue:73` 参数 `command` 隐式 any
    - `src/modules/UserManagement/org/components/OrgManagerDialog.vue:425` 参数 `checked` 隐式 any
  - `build`：通过（`vite build` 成功，产物生成正常）

## 2026-03-11（Portal Designer UI 二次收敛：扁平化）

- 命令：
  - `pnpm -C apps/admin build`
- 结果：
  - `build` 通过（UI 二次收敛后构建正常）

## 2026-03-11（Portal Designer UI 三次收敛：极简 + 白底）

- 命令：`pnpm -C apps/admin build`
- 结果：通过

## 2026-03-11（Portal Designer 视觉微调：方案1 中灰头部）

- 命令：`pnpm -C apps/admin build`
- 结果：通过

## 2026-03-11（Portal Designer 视觉收敛：删除 tree-header / preview-head）

- 命令：`pnpm -C apps/admin build`
- 结果：通过

## 2026-03-11（Portal Designer 全量重构：编辑优先）

- 命令：`pnpm -C apps/admin build`
- 结果：通过

## 2026-03-11（PortalManagement 去除 /designer 路由段）

执行命令与结果：

- `pnpm -C apps/admin build`：通过
- `pnpm -C apps/docs lint`：通过
- `pnpm -C apps/docs build`：通过
- `pnpm -C apps/admin typecheck`：通过
- `pnpm -C apps/admin exec vitest run src/router/__tests__/assemble-routes.unit.test.ts`：通过（1 file / 3 tests）

## 2026-03-11（PortalManagement 权限能力迁移）

执行命令与结果：

- `pnpm -C apps/admin typecheck`：通过
- `pnpm -C apps/admin build`：通过
- `pnpm -C apps/admin exec vitest run src/router/__tests__/assemble-routes.unit.test.ts`：通过（1 file / 3 tests）
- `pnpm -C apps/docs lint`：通过
- `pnpm -C apps/docs build`：通过

## 2026-03-11（PortalManagement 权限能力收口）

执行命令与结果：

- `pnpm -C apps/admin typecheck`：通过
- `pnpm -C apps/admin build`：通过
- `pnpm -C apps/admin exec vitest run src/router/__tests__/assemble-routes.unit.test.ts`：通过（1 file / 3 tests）
- `pnpm -C apps/docs build`：通过

## 2026-03-11（portal 预览框架：设备画框 + 等比缩放）

- RED（先失败）：
  - `pnpm -C apps/admin exec vitest run src/modules/PortalManagement/utils/preview.unit.test.ts src/modules/PortalManagement/materials/preview-cms-api.unit.test.ts`
  - 结果：失败（目标模块文件尚未创建）。
- GREEN / 回归：
  - `pnpm -C apps/admin exec vitest run src/modules/PortalManagement/utils/preview.unit.test.ts`
  - `pnpm -C apps/admin exec vitest run src/modules/PortalManagement/utils/preview.unit.test.ts src/router/__tests__/assemble-routes.unit.test.ts`
  - `pnpm -C apps/admin typecheck`
  - `cd apps/admin && pnpm exec ultracite check --error-on-warnings --javascript-formatter-enabled=false --css-formatter-enabled=false --html-formatter-enabled=false src/modules/PortalManagement/portal-design/pages/PortalTemplateSettingPage.vue src/modules/PortalManagement/page-design/pages/PortalPreviewRenderPage.vue src/modules/PortalManagement/page-design/components/PortalPreviewPanel.vue src/modules/PortalManagement/page-design/pages/PortalPageEditPage.vue src/modules/PortalManagement/template/list.vue src/modules/PortalManagement/utils/preview.ts src/modules/PortalManagement/utils/preview.unit.test.ts`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
  - 结果：以上命令均通过。
- 备注：
  - `pnpm -C apps/admin lint` 全量门禁在当前分支仍有其他历史文件的 `useImportType` 报错（与本次改动无关），本次采用“改动文件定向 lint”验证。

## 2026-03-11（门户权限保存补齐历史必填字段）

执行命令与结果：

- `pnpm -C apps/admin typecheck`：通过
- `pnpm -C apps/admin build`：通过
- `pnpm -C apps/docs build`：通过

## 2026-03-11（portal 预览控件并入动作条）

- 命令：
  - `cd apps/admin && pnpm exec ultracite check --error-on-warnings --javascript-formatter-enabled=false --css-formatter-enabled=false --html-formatter-enabled=false src/modules/PortalManagement/portal-design/pages/PortalTemplateSettingPage.vue`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/docs build`
- 结果：全部通过。

## 2026-03-11（portal 预览容器尺寸变化响应修复）

- 命令：
  - `cd apps/admin && pnpm exec ultracite check --error-on-warnings --javascript-formatter-enabled=false --css-formatter-enabled=false --html-formatter-enabled=false src/modules/PortalManagement/portal-design/pages/PortalTemplateSettingPage.vue`
  - `pnpm -C apps/admin typecheck`
- 结果：全部通过。

## 2026-03-11（Designer 预览自适应 + 左树拖拽排序）

执行命令与结果：

- `pnpm -C apps/admin typecheck`：通过
- `pnpm -C apps/admin build`：通过
- `pnpm -C apps/docs build`：通过

## 2026-03-11（门户设计页组件拆分）

- 命令：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin build`
- 结果：全部通过
- 2026-03-11（Portal 设计页 emit 收敛）
  - `pnpm -C apps/admin typecheck`：通过
  - `pnpm -C apps/admin build`：通过
- 2026-03-11（Portal ActionStrip props 下沉）
  - `pnpm -C apps/admin typecheck`：通过
  - `pnpm -C apps/admin build`：通过

## 2026-03-11（Portal 设计页继续下沉）

执行命令与结果：

- `pnpm -C apps/admin typecheck`：失败（历史存量问题，非本次改动引入）
  - `src/modules/PortalManagement/utils/templateDetails.ts:226`
  - `src/modules/PortalManagement/utils/templateDetails.ts:245`
- `pnpm -C apps/admin build`：通过
- `pnpm -C apps/admin exec vue-tsc --noEmit --pretty false | rg "PortalTemplateSettingPage|PortalDesignerActionStrip|usePortalCurrentTabActions|portalTree"`：无命中（本次改动文件未出现类型报错）

## 2026-03-11（Portal details 壳层配置收口）

- 命令：`pnpm -C apps/admin typecheck`
  - 结果：初次失败（2处）
    - `PortalDesignerActionStrip.vue` 缺少 `templateId` props
    - `templateDetails.ts` `normalizeNavItems` 类型谓词不兼容
- 修复后复测：
  - `pnpm -C apps/admin typecheck`：通过
  - `pnpm -C apps/admin exec vitest run src/modules/PortalManagement/utils/templateDetails.unit.test.ts src/modules/PortalManagement/utils/preview.unit.test.ts`：通过（7/7）
  - `pnpm -C apps/admin build`：通过
  - `pnpm -C apps/docs lint`：通过
  - `pnpm -C apps/docs build`：通过
- 说明：`pnpm -C apps/admin lint` 仍存在历史存量告警（多模块 `import type` 与复杂表达式），非本次改动引入；本次改动文件已通过定向 ultracite 检查。

## 2026-03-11（templateDetails 类型修复回归）

执行命令与结果：

- `pnpm -C apps/admin typecheck`：通过
- `pnpm -C apps/admin build`：通过
- `pnpm -C apps/admin exec vitest run src/modules/PortalManagement/utils/templateDetails.unit.test.ts`：通过（1 file / 4 tests）

## 2026-03-11（admin lint 存量治理）

- `pnpm -C apps/admin lint`
  - 初次结果：失败（`PortalDesignerHeaderBar.vue` 1 处 `defineEmits` 签名）
  - 修复后结果：通过（221 files checked）
- `pnpm -C apps/admin typecheck`
  - 中途结果：失败（4 处隐式 any：PersonnelSelectorSourcePanel\*2、menu/list、OrgManagerDialog）
  - 修复后结果：通过
- `pnpm -C apps/admin build`
  - 结果：通过

## 2026-03-11（页眉页脚入口层级收口）

- 命令：
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin build`
- 结果：
  - 全部通过

## 2026-03-11（页眉页脚配置产品化：表单驱动 + JSON只读查看）

- 命令：
  - `pnpm -C apps/admin exec vitest run src/modules/PortalManagement/utils/templateDetails.unit.test.ts`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - 全部通过

## 2026-03-11（门户页面设置 V2 收尾）

- RED/GREEN 单测回归：
  - `pnpm -C apps/admin exec vitest run src/modules/PortalManagement/utils/pageSettingsV2.unit.test.ts src/modules/PortalManagement/utils/portalTree.unit.test.ts`
  - 结果：通过（2 files / 5 tests）
- admin 类型检查：
  - 首次：`pnpm -C apps/admin typecheck`
    - 结果：失败（`templateDetails.ts:500` 返回类型不兼容）
  - 修复后复测：`pnpm -C apps/admin typecheck`
    - 结果：失败（`PortalTemplateSettingPage.vue` 引用 `PortalShellSettingsDialog.vue` 丢失）
  - 恢复组件后复测：`pnpm -C apps/admin typecheck`
    - 结果：通过
- admin 质量门禁：
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin build`
  - 结果：通过
- portal 消费端回归（本轮修改涉及）：
  - `pnpm -C apps/portal typecheck`
  - `pnpm -C apps/portal build`
  - 结果：通过
- docs 同步验证：
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
  - 结果：通过

## 2026-03-11（页眉页脚配置修正：表单驱动 + JSON只读查看）

- 命令：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/admin exec vitest run src/modules/PortalManagement/utils/templateDetails.unit.test.ts`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：全部通过。

## 2026-03-11（开发态动态导入失败兜底）

- 命令：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin build`
- 结果：全部通过。

## 2026-03-11（页眉页脚实时预览 + previewMode 组件层收敛）

- `pnpm -C apps/admin typecheck`：通过
- `pnpm -C packages/portal-engine build`（含 typecheck）：通过
- `pnpm -C apps/admin lint`：通过
- `pnpm -C apps/admin build`：通过
- `pnpm -C apps/portal typecheck`：通过
- `pnpm -C apps/portal build`：通过
- `pnpm -C apps/docs lint`：通过
- `pnpm -C apps/docs build`：通过

## 2026-03-11（门户壳层配置收敛）

执行命令与结果：

- `pnpm -C apps/admin exec vitest run src/modules/PortalManagement/utils/templateDetails.unit.test.ts`
  - 结果：通过（1 file / 5 tests）
- `pnpm -C apps/admin typecheck`
  - 结果：通过
- `pnpm -C apps/admin lint`
  - 初次结果：失败（`PortalShellSettingsDialog.vue` `defineEmits` 需合并签名）
  - 修复后复测：通过
- `pnpm -C apps/admin build`
  - 结果：通过
- `pnpm -C apps/docs lint`
  - 结果：通过
- `pnpm -C apps/docs build`
  - 结果：通过

## 2026-03-11（内容宽度100% + 表单紧凑化）

执行命令与结果：

- `pnpm -C apps/admin exec vitest run src/modules/PortalManagement/utils/templateDetails.unit.test.ts`
  - 结果：通过（1 file / 6 tests）
- `pnpm -C apps/admin typecheck`
  - 结果：通过
- `pnpm -C apps/admin lint`
  - 结果：通过
- `pnpm -C apps/admin build`
  - 结果：通过
- `pnpm -C apps/docs lint`
  - 结果：通过
- `pnpm -C apps/docs build`
  - 结果：通过

## 2026-03-11（壳层配置分区收敛：颜色项按功能就近）

执行命令与结果：

- `pnpm -C apps/admin typecheck`
  - 结果：通过
- `pnpm -C apps/admin lint`
  - 结果：通过
- `pnpm -C apps/admin build`
  - 结果：通过
- `pnpm -C apps/docs lint`
  - 结果：通过
- `pnpm -C apps/docs build`
  - 结果：通过

## 2026-03-11（页脚能力收敛：移除风格变体与联系二维码）

执行命令与结果：

- `pnpm -C apps/admin exec vitest run src/modules/PortalManagement/utils/templateDetails.unit.test.ts`
  - 结果：通过（1 file / 6 tests）
- `pnpm -C apps/admin typecheck`
  - 结果：通过
- `pnpm -C apps/admin lint`
  - 结果：通过
- `pnpm -C apps/admin build`
  - 结果：通过
- `pnpm -C apps/docs lint`
  - 结果：通过
- `pnpm -C apps/docs build`
  - 结果：通过

## 2026-03-11（门户页面设置 V2 布局能力扩展）

执行命令与结果：

- `pnpm -C apps/admin exec vitest run src/modules/PortalManagement/utils/pageSettingsV2.unit.test.ts`
  - 结果：通过（1 file / 5 tests）
- `pnpm -C apps/admin typecheck`
  - 初次结果：失败（`PortalPreviewPanel.vue` 与 `GridLayoutEditor.vue` 的颜色解析函数触发 `Object is possibly 'undefined'`）
  - 修复后复测：通过
- `pnpm -C apps/admin lint`
  - 结果：通过
- `pnpm -C apps/admin build`
  - 结果：通过
- `pnpm -C apps/docs lint`
  - 结果：通过
- `pnpm -C apps/docs build`
  - 结果：通过

## 2026-03-11（Portal 页面设置：Banner 校验修复 + 设置面板美化）

- 命令：
  - `pnpm -C apps/admin exec vitest run src/modules/PortalManagement/utils/pageSettingsV2.unit.test.ts`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：全部通过

## 2026-03-11（GridLayoutEditor 递归更新修复）

- 命令：
  - `pnpm -C apps/admin exec vitest run src/modules/PortalManagement/utils/gridLayoutSync.unit.test.ts src/modules/PortalManagement/utils/pageSettingsV2.unit.test.ts`
  - `pnpm -C packages/portal-engine typecheck`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin build`
- 结果：全部通过

## 2026-03-11（页面设置分组去边框）

- 命令：
  - `pnpm -C apps/admin lint`
- 结果：通过

## 2026-03-11（remote 菜单路由守卫去重）

- 命令：
  - `pnpm -C packages/core test -- src/router/guards.test.ts`
  - `pnpm -C packages/core typecheck`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/docs build`
- 结果：全部通过。

## 2026-03-11（门户页面编辑器滚动链路修复）

- 命令：
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs build`
- 结果：全部通过。

## 2026-03-12（AI 学习计划第1周执行包落地）

- 命令：
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：全部通过

## 2026-03-12（门户页面编辑器滚动交互冒烟）

- 命令：
  - `pnpm -C apps/admin dev --host 127.0.0.1 --port 5173`
  - `agent-browser --session codex open http://127.0.0.1:5173/portal/page/edit`
  - `agent-browser --session codex eval ...`（分别校验 material/settings/canvas 三个滚动容器与 document 外层滚动）
  - `agent-browser --session codex screenshot ...`
- 结果：
  - 外层文档：`docScrollHeight == docClientHeight`，`window.scrollY = 0`（无整页滚动）。
  - 右侧设置：`scrollTop` 可变（例如 `320/700`），`overflowY=auto`。
  - 中间画布：`scrollTop` 可变（例如 `139/220/240`），`overflowY=auto`。
  - 左侧物料：在低视口（420px）下 `scrollHeight > clientHeight` 且 `scrollTop` 可变（`13`）。
  - 三栏滚动互不影响（独立性校验通过）。

## 2026-03-12（/portal/page/edit 视觉优化）

- 命令：
  - `pnpm -C apps/admin typecheck`
- 结果：通过。

## 2026-03-12（门户设计器页面级壳层覆盖）

- 命令：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin test:run src/modules/PortalManagement/utils/templateDetails.unit.test.ts`
  - `pnpm -C apps/docs build`
- 结果：全部通过。

## 2026-03-12（门户设计器页面级壳层覆盖交互冒烟）

- 启动命令：
  - `VITE_API_BASE_URL=http://127.0.0.1:7788 pnpm -C apps/admin dev --host localhost --port 5174`
- 交互命令（节选）：
  - `agent-browser --session codex open http://localhost:5174/login`
  - `agent-browser --session codex eval "localStorage.setItem('token','mock-token'); location.href='http://localhost:5174/portal/design?id=1&tabId=tab-home'; 'ok'"`
  - `agent-browser --session codex click @e16`（打开“页面壳层覆盖”）
  - `agent-browser --session codex eval ...`（改“标题”字段）
  - `agent-browser --session codex find text 保存配置 click`
  - `agent-browser --session codex reload`
  - `curl -s http://127.0.0.1:7788/__state | jq`
- 结果：
  - 实时预览：通过（`门户 -> 页面级覆盖-冒烟`）。
  - 取消回滚：通过（`页面级覆盖-冒烟 -> 门户`）。
  - 保存后即时预览：通过（保持 `页面级覆盖-已保存`）。
  - 刷新后持久化：失败（刷新后回到 `门户`）。
  - mock 落库校验：失败（`details.pageOverrides` 仍为空，未观测到 `template/update` 写入）。
  - 预览容器响应式：通过（viewport `1280x720` 时 frame 宽 `~953`，`1024x640` 时 `~697`）。
- 截图：
  - `/Users/haoqiuzhi/code/one-base-template/.codex/screenshots/portal-shell-smoke-before.png`
  - `/Users/haoqiuzhi/code/one-base-template/.codex/screenshots/portal-shell-smoke-after-save.png`

## 2026-03-12（页面级壳层覆盖持久化复测 - 修正 mock 后）

- 环境：
  - mock：`http://127.0.0.1:7788`
  - admin：`http://localhost:5174`
- 关键检查：
  - mock 打印 `template/update` 请求体 keys：`[ 'id', 'templateName', 'details', 'tabIds', 'tabList' ]`
  - `detailsType = string`
  - `tab-home override = true`
- 数据校验：
  - `curl -s http://127.0.0.1:7788/__state | jq '.details.pageOverrides["tab-home"].headerOverrideEnabled, .details.pageOverrides["tab-home"].header.behavior.title'`
  - 输出：`true`、`"页面级覆盖-持久化2"`
- 刷新校验：
  - 设计器 `reload` 后预览 iframe `.brand-title` 为 `页面级覆盖-持久化2`（持久化通过）。
- 证据截图：
  - `/Users/haoqiuzhi/code/one-base-template/.codex/screenshots/portal-shell-smoke-after-reload-pass.png`
- 结论：前次“保存丢失”为 mock 读取 `details` 路径错误导致的假失败。

## 2026-03-12（portal/design 预览滚动与边界线优化）

- 命令：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - `typecheck`：通过
  - `build`：通过
  - `apps/docs lint/build`：通过
  - `apps/admin lint`：失败（命中既有文件 `src/modules/PortalManagement/portal-design/pages/PortalTemplateSettingPage.vue:831` 的逻辑表达式复杂度告警，非本次新增问题）
- 追加验证：`pnpm -C apps/admin typecheck`（空态撑满改为按布局模式生效后）通过。

## 2026-03-12（PortalManagement designPage 目录重构）

- 命令：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - `typecheck`：通过
  - `build`：通过
  - `apps/docs lint/build`：通过
  - `apps/admin lint`：失败（既有单条告警，`src/modules/PortalManagement/designPage/pages/PortalTemplateSettingPage.vue:831` 逻辑表达式复杂度提示）

## 2026-03-12（designPage 收尾：lint 告警修复回归）

- 命令：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - `typecheck`：通过
  - `lint`：通过（无告警）
  - `build`：通过
  - `apps/docs lint/build`：通过

## 2026-03-12（页面配置计划并行落地回归）

- 命令：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - `apps/admin typecheck`：通过
  - `apps/admin lint`：通过（无告警）
  - `apps/admin build`：通过
  - `apps/docs lint`：通过
  - `apps/docs build`：通过

## 2026-03-12（门户设计器：工具栏重构 + 预览分辨率无重载）

- 命令：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：全部通过。

- 冒烟补充：
  - 尝试执行浏览器自动化冒烟（portal/design 页面交互）时，运行环境出现 `Daemon failed to start`，且 `agent-browser install` 因 `ENOTFOUND registry.npmjs.org` 失败。
  - 本轮无法完成自动化浏览器交互证据采集，改用源码链路核查确认“分辨率切换不再改 iframe URL”。

## 2026-03-12（列表页接管门户+页面权限配置）

执行命令与结果：

- `pnpm -C apps/admin exec vitest run src/modules/PortalManagement/utils/pagePermission.unit.test.ts`
  - 首次：失败（预期，`./pagePermission` 文件尚未创建）。
  - 修复后：通过（`2 tests passed`）。
- `pnpm -C apps/admin typecheck && pnpm -C apps/admin lint`
  - 首次：失败（`TS2345`，`buildPortalTabPermissionUpdatePayload` 返回类型过窄）。
  - 二次：失败（`TS18046`，单测里 `result.allowPerms` 推断 `unknown`）。
  - 修复后：通过（`typecheck` 与 `lint` 全绿）。
- 复测：`pnpm -C apps/admin exec vitest run src/modules/PortalManagement/utils/pagePermission.unit.test.ts`
  - 结果：通过（`2 tests passed`）。

## 2026-03-12（PortalManagement 权限入口合并 + template -> templatePage）

- 命令：
  - `pnpm -C apps/admin exec vitest run src/modules/PortalManagement/utils/pagePermission.unit.test.ts`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：全部通过
- 备注：
  - `pagePermission.unit.test.ts` 从 2 条扩展到 3 条，新增“页面权限树构建”用例。
  - 首轮 `typecheck` 发现 `buildTemplatePagePermissionTree` 推断类型问题，已改为显式 `for...of` 构建并复测通过。

## 2026-03-12（PortalManagement 权限配置收敛与接口补齐）

- 命令：
  - `pnpm -C apps/admin exec vitest run src/modules/PortalManagement/utils/pagePermission.unit.test.ts`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：全部通过。
- 备注：
  - `typecheck` 首轮在 `api.ts` 出现响应归一化函数类型报错，已修复后复跑通过。
- 增量复测（接口口径修正后）：
  - `pnpm -C apps/admin typecheck`：通过
  - `pnpm -C apps/admin lint`：通过

## 2026-03-12（选人树按老项目口径收敛）

- 对照核验命令：
  - `rg -n "children-and-us(e|er)" /Users/haoqiuzhi/code/sczfw/standard-oa-web-sczfw -S`
  - `rg -n "children-and-us(e|er)" /Users/haoqiuzhi/code/one-base-template/apps/admin/src/modules/PortalManagement -S`
- 工程门禁命令：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
- 结果：
  - 老项目源码确认接口为 `children-and-user`（`PersonnelSelection/api/index.ts`）。
  - `apps/admin typecheck`：通过。
  - `apps/admin lint`：通过（无告警）。

- 文档与规则同步复测：
  - `pnpm -C apps/docs lint`：通过。
  - `pnpm -C apps/docs build`：通过。

## 2026-03-12（选人组件层收敛 + 角色模块修复）

- 首轮校验：
  - `pnpm -C apps/admin typecheck`：失败（`contactDataSource.ts` 的 `map + type predicate` 返回类型不收敛）。
  - `pnpm -C apps/admin lint`：失败（`useRoleAssignPageState.ts` 提示可选链规则）。
  - `pnpm -C apps/docs lint`：通过。
  - `pnpm -C apps/docs build`：通过。
- 修复后复测：
  - `pnpm -C apps/admin typecheck`：通过。
  - `pnpm -C apps/admin lint`：通过。

## 2026-03-12（权限弹窗二次简化）

- 命令：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
- 结果：全部通过。

## 2026-03-12（移除权限策略说明文案）

- 命令：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
- 结果：全部通过。

## 2026-03-12（权限表单紧凑化）

- 命令：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
- 结果：全部通过。

## 2026-03-12（权限弹窗主题色统一）

- 命令：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
- 结果：全部通过。

## 2026-03-12（权限输入尾部 icon 对齐修复）

- 命令：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
- 结果：全部通过。

## 2026-03-12（权限输入尾部 icon 二次对齐修复）

- 命令：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
- 结果：全部通过。

## 2026-03-12（ActionButtons 纯 icon 触发）

- 命令：
  - `pnpm -C packages/ui typecheck`（通过）
  - `pnpm -C packages/ui lint`（失败）
- 备注：
  - lint 失败来自既有文件 `packages/ui/src/feedback/confirm.ts`、`packages/ui/src/feedback/message.ts` 的历史引号规范问题，非本次改动引入。

## 2026-03-12（Portal 页面设置实时预览 + 全量字段校验）

- RED 基线：
  - `pnpm -C apps/admin exec vitest run src/modules/PortalManagement/designPage/components/preview-render/__tests__/PortalPreviewPanel.preview-runtime.test.ts`
  - 结果：2 条用例失败（实时消息未生效）。
- GREEN 验证：
  - `pnpm -C apps/admin exec vitest run src/modules/PortalManagement/designPage/components/preview-render/__tests__/PortalPreviewPanel.preview-runtime.test.ts`
  - 结果：通过（2/2）。
- 回归验证：
  - `pnpm -C apps/admin typecheck`：通过
  - `pnpm -C apps/admin lint`：通过

## 2026-03-12（Portal 页面设置实时刷新：逐项配置验证）

- 浏览器端实时校验（agent-browser）：
  - 打开：`http://127.0.0.1:5173/portal/preview`
  - 发送：`postMessage({ type: 'preview-page-runtime', data: { settings, component } })`
  - 读取：`document.querySelector('.preview-page').__vueParentComponent.exposed.getRuntimeSnapshot()`
  - 结果：`basic/layout/layoutMode/layoutContainer/spacing/background/banner/headerFooterBehavior/responsive/access/publishGuard/component` 全部 `true`
- 样式即时变化校验（无需刷新）：
  - 第一组配置（内容滚动 + 固定页脚 + banner 开启 + 响应式开启）生效
  - 第二组配置（整体滚动 + 普通页脚 + banner 关闭 + 响应式关闭）生效
  - 截图：
    - `.codex/screenshots/portal-runtime/preview-runtime-state-1.png`
    - `.codex/screenshots/portal-runtime/preview-runtime-state-2.png`
- 单测回归：
  - 命令：`pnpm -C apps/admin exec vitest run src/modules/PortalManagement/designPage/components/preview-render/__tests__/PortalPreviewPanel.preview-runtime.test.ts`
  - 结果：`2 passed`

## 2026-03-12（Portal page settings 与 preview-page 实时同步）

- 实测方式：
  - 在 `PortalPageEditPage` 真实页面修改 `pageSettingData`
  - 预览页通过 `getRuntimeSnapshot()` 读取运行时 settings 做字段断言
  - 同时读取 `.content-frame/.content-container/.page-banner/.header-wrap/.footer-wrap` 行内样式做视觉断言
- 结果：
  - 全量字段断言：`75/75` 通过（含所有页面设置表单字段）
  - 样式断言：吸顶偏移、固定页脚、内容宽度、背景作用域、Banner 高度/全宽偏移、内容底部补偿均通过
  - 响应式断点断言通过：
    - `width=1000` 命中 pad（边距/内边距/Banner 高度切到 pad）
    - `width=760` 命中 mobile（边距/内边距/Banner 高度切到 mobile）
    - `width=1400` 回到 pc 配置
  - 条件分支通过：
    - `layoutContainer.widthMode=custom` 时 `width=1066px` 生效
    - `background.scope=content` 时背景挂载到 content-container
    - `background.scope=banner` 且 banner image 为空时，Banner 使用 background 配置回退渲染

## 2026-03-12（Portal 预览实时生效 / 布局模式 / 对齐）

- 命令：
  - `pnpm -C apps/admin exec vitest run src/modules/PortalManagement/designPage/components/preview-render/__tests__/PortalPreviewPanel.preview-runtime.test.ts`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
- 结果：通过
  - vitest: 5 passed
  - typecheck: 通过
  - lint: 通过（Checked 233 files, No fixes applied）

- 真实页面回归（Playwright headless，本机 `http://127.0.0.1:5174`）：
  - 编辑页：`/portal/page/edit?tabId=2031611956161728513&id=2031611955914264578`
  - 预览页：`/portal/preview?tabId=2031611956161728513&templateId=2031611955914264578&previewMode=live`
  - 关键结论：
    - 布局模式 class 实时切换：
      - `preview-shell--layout-global-scroll`
      - `preview-shell--layout-header-fixed-content-scroll`
      - `preview-shell--layout-header-fixed-footer-fixed-content-scroll`
    - 预览页未发生导航刷新（`navCountAfterOps=0`），样式实时变化。
    - 左/中对齐在固定宽度场景可见位移变化：`contentDeltaLeft` 从 `0`（左对齐）到 `232`（居中）。

## 2026-03-12（Portal 设计页入口收敛 + 壳层功能保留）

- 命令：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin exec vitest run src/modules/PortalManagement/designPage/components/preview-render/__tests__/PortalPreviewPanel.preview-runtime.test.ts`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：全部通过（vitest 仅有既有 Vue warn，不影响通过）

## 2026-03-12（ObCard 与页面配置卡片替换）

- RED（先失败）
  - 命令：`pnpm -C packages/ui exec vitest run src/plugin.test.ts src/index.test.ts`
  - 结果：失败（2/2）
  - 失败点：`ObCard` 尚未注册到 `OneUiPlugin`，也未从 `packages/ui` 根入口导出。

- GREEN（实现后回归）
  - 命令：`pnpm -C packages/ui exec vitest run src/plugin.test.ts src/index.test.ts`
  - 结果：通过（2/2）

- 组件与页面改造回归
  - `pnpm -C packages/ui typecheck`：通过
  - `pnpm -C apps/admin typecheck`：通过
  - `pnpm -C apps/admin lint`：通过
  - `pnpm -C apps/docs lint`：通过
  - `pnpm -C apps/docs build`：通过

## 2026-03-12（页面设置与壳层配置紧凑化统一）

- 命令：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：全部通过。

## 2026-03-12（页面配置容器改 ObCrudContainer + 页眉页脚样式收敛）

- 命令：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：全部通过。

## 2026-03-12（门户级页眉页脚配置改用 ObCrudContainer）

- 命令：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：全部通过。

## 2026-03-12（门户配置面板紧凑化与容器统一）

- 命令：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - 全部通过。
- 备注：
  - `apps/admin lint` 首次执行发现 `PortalColorField.vue` 的 emits 类型写法告警（`useShorthandFunctionType`），修复后复跑通过。

## 2026-03-12（门户配置：平板栅格两行展示修正）

- 命令：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：全部通过。

## 2026-03-12（门户设计页：删除访问控制/发布校验）

- 命令：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：全部通过。

## 2026-03-12（用户确认项回归）

- 执行命令：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：全部通过。

## 2026-03-13（Portal 预览滚动语义回归）

- 命令：
  - `pnpm -C apps/admin exec vitest run src/modules/PortalManagement/designPage/components/preview-render/__tests__/PortalPreviewPanel.preview-runtime.test.ts`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：全部通过。
- 测试补强：
  - `PortalPreviewPanel.preview-runtime.test.ts` 新增断言：
    - `header-fixed-content-scroll + overflowMode=hidden` 时滚动容器 `overflow-y: hidden`。
    - 同模式切换到 `overflowMode=scroll` 时滚动容器 `overflow-y: scroll`。
    - `header-fixed-footer-fixed-content-scroll` 仍为 `overflow-y: auto`。

## 2026-03-13（portal-engine base 物料扩展）

- 命令：
  - `pnpm -C packages/portal-engine typecheck`
  - `pnpm -C packages/portal-engine exec eslint src/materials/base/base-image src/materials/base/base-carousel src/materials/base/base-text src/materials/base/base-table src/materials/base/common/material-utils.ts src/registry/materials-registry.ts`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/docs build`
- 结果：
  - 全部通过。

- 补充检查（全量 lint 现状）：
  - 命令：`pnpm -C packages/portal-engine lint`
  - 结果：失败。
  - 失败原因：`packages/portal-engine/src/schema/page-settings.ts` 存在大量历史 `quotes` 规则报错（双引号风格），以及 `placeholder-block/index.vue` 的既有 `vue/no-v-html` 警告；非本次改动引入。

## 2026-03-13（PortalBorderField hoist 修复）

- 命令：
  - `pnpm -C packages/portal-engine typecheck`
  - `pnpm -C packages/portal-engine exec eslint src/materials/common/fields/PortalBorderField.vue`
- 结果：
  - 全部通过。

## 2026-03-13（portal-engine 统一容器副标题位置扩展）

- 命令：
  - `pnpm -C packages/portal-engine typecheck`
  - `pnpm -C packages/portal-engine exec eslint src/materials/common/unified-container/unified-container.types.ts src/materials/common/unified-container/unified-container.defaults.ts src/materials/common/unified-container/UnifiedContainerContentConfig.vue src/materials/common/unified-container/UnifiedContainerDisplay.vue src/materials/common/unified-container/index.ts src/index.ts`
  - `pnpm -C apps/docs build`
- 结果：
  - 全部通过。

- 补充回归：
  - `pnpm -C apps/admin typecheck`：通过

## 2026-03-13（base 物料设置分组统一 ObCard）

- 命令：
  - `pnpm -C packages/portal-engine typecheck`
  - `pnpm -C packages/portal-engine exec eslint src/materials/base/base-carousel/content.vue src/materials/base/base-carousel/style.vue src/materials/base/base-iframe-container/content.vue src/materials/base/base-iframe-container/style.vue src/materials/base/base-image/content.vue src/materials/base/base-image/style.vue src/materials/base/base-tab-container/content.vue src/materials/base/base-tab-container/style.vue src/materials/base/base-table/content.vue src/materials/base/base-table/style.vue src/materials/base/base-text/content.vue src/materials/base/base-text/style.vue src/materials/base/placeholder-block/content.vue src/materials/base/placeholder-block/style.vue`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/docs build`
- 结果：全部通过。

## 2026-03-13（抽离公共配置组件改用 ObCard）

- 命令：
  - `pnpm -C packages/portal-engine typecheck`
  - `pnpm -C packages/portal-engine exec eslint src/materials/common/unified-container/UnifiedContainerContentConfig.vue src/materials/common/unified-container/UnifiedContainerStyleConfig.vue`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/docs build`
- 结果：全部通过。

## 2026-03-13（PortalManagement：ObCard 间距收敛）

- 命令：`pnpm -C apps/admin typecheck`
- 结果：通过
- 补充：`pnpm -C apps/admin exec eslint src/modules/PortalManagement/designPage/components/portal-template/PortalPageSettingsDrawer.vue` 未通过，失败项为该文件既有引号风格与 max-lines 规则，不属于本次改动引入。

## 2026-03-13（portal-engine：标题/外链同卡片 + Tab容器图标修复）

- `pnpm -C packages/portal-engine typecheck`：通过
- `pnpm -C packages/portal-engine exec eslint src/materials/common/unified-container/UnifiedContainerContentConfig.vue src/registry/materials-registry.ts`：通过
- `pnpm -C apps/docs build`：通过

## 2026-03-13（portal-engine：沉淀包级 AGENTS 规则）

- `pnpm -C apps/docs lint`：通过
- `pnpm -C apps/docs build`：通过
- `pnpm -C packages/portal-engine typecheck`：通过

## 2026-03-13（portal-engine 基础物料扩展收敛）

- 命令：`pnpm -C packages/portal-engine typecheck`
  - 结果：通过。
- 命令：`pnpm -C packages/portal-engine lint`
  - 结果：失败。
  - 主要阻塞为存量问题：
    - `packages/portal-engine/src/schema/page-settings.ts` 存在大量 `quotes` 历史报错（非本次改动引入）。
    - `packages/portal-engine/src/materials/cms/common/cms/CmsDataSourceConfig.vue` 存在 `props` 未使用历史报错（非本次改动引入）。
  - 本次新增文件无新的 lint error（存在少量 warning，如 `html-self-closing` / `html-quotes`）。
- 命令：`pnpm -C apps/docs build`
  - 结果：通过。

## 2026-03-13（portal-engine 组件注册兜底与一致性校验）

- 命令：
  - `pnpm -C packages/portal-engine typecheck`
  - `pnpm -C packages/portal-engine exec eslint src/materials/useMaterials.ts`
- 结果：
  - `typecheck`：通过
  - 定向 `eslint`：通过

## 2026-03-13（PortalShellSettingsDialog 开关保存修复）

- 命令：
  - `pnpm -C apps/admin exec vitest run src/modules/PortalManagement/designPage/components/portal-template/__tests__/PortalShellSettingsDialog.submit.test.ts`
  - `pnpm -C apps/admin exec eslint src/modules/PortalManagement/designPage/components/portal-template/__tests__/PortalShellSettingsDialog.submit.test.ts`
  - `pnpm -C apps/admin typecheck`
- 结果：
  - 新增回归测试：通过
  - 新增测试文件 eslint：通过
  - `apps/admin typecheck`：失败（现存跨包类型问题，位于 `packages/portal-engine/src/materials/base/base-form/index.vue`，与本次修复点无直接关系）

## 2026-03-13（PortalManagement 下沉计划收尾验证）

- 命令：
  - `pnpm -C packages/portal-engine typecheck`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin test:run src/modules/PortalManagement/utils/preview.unit.test.ts src/modules/PortalManagement/utils/templateDetails.unit.test.ts src/modules/PortalManagement/designPage/components/preview-render/__tests__/PortalPreviewPanel.preview-runtime.test.ts`
  - `pnpm -C apps/portal typecheck`
  - `pnpm -C apps/docs build`
  - `pnpm -C packages/portal-engine lint`
- 结果：
  - `packages/portal-engine typecheck`：通过。
  - PortalManagement 目标单测（3 个文件，15 个用例）：通过。
  - `apps/portal typecheck`：通过。
  - `apps/docs build`：通过。
  - `apps/admin typecheck`：失败，阻塞为 `packages/portal-engine/src/materials/base/base-form/index.vue` 的既有类型错误（`unknown` 赋值到组件受限类型）。
  - `packages/portal-engine lint`：失败，阻塞为既有历史问题（`schema/page-settings.ts` 大量 `quotes` 报错、`CmsDataSourceConfig.vue` 未使用变量）。

## 2026-03-13（继续收敛：清除 typecheck/lint 错误级阻塞）

- 命令：
  - `pnpm -C packages/portal-engine typecheck`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin test:run src/modules/PortalManagement/utils/preview.unit.test.ts src/modules/PortalManagement/utils/templateDetails.unit.test.ts src/modules/PortalManagement/designPage/components/preview-render/__tests__/PortalPreviewPanel.preview-runtime.test.ts`
  - `pnpm -C packages/portal-engine exec eslint src/schema/page-settings.ts --fix`
  - `pnpm -C packages/portal-engine exec eslint src/materials/base/base-form/index.vue --fix`
  - `pnpm -C packages/portal-engine lint`
  - `pnpm -C apps/portal typecheck`
  - `pnpm -C apps/docs build`
- 结果：
  - `packages/portal-engine typecheck`：通过。
  - `apps/admin typecheck`：通过（此前 `base-form/index.vue` 阻塞已清除）。
  - PortalManagement 目标单测：通过（15/15）。
  - `packages/portal-engine lint`：通过（仅剩 warning，无 error）。
  - `apps/portal typecheck`：通过。
  - `apps/docs build`：通过。

## 2026-03-13（PortalManagement 并行下沉 P0）

- RED（先失败）
  - `pnpm -C packages/portal-engine exec vitest run src/editor/preview-bridge/sender.test.ts`
    - 结果：失败（缺少 `./messages` 模块）
  - `pnpm -C packages/portal-engine exec vitest run src/domain/tab-tree.test.ts`
    - 结果：失败（缺少 `./tab-tree` 模块）
  - `pnpm -C packages/portal-engine exec vitest run src/services/page-settings.test.ts`
    - 结果：失败（缺少 `./page-settings` 模块）

- GREEN / 回归
  - `pnpm -C packages/portal-engine exec vitest run src/editor/preview-bridge/sender.test.ts`
  - `pnpm -C packages/portal-engine exec vitest run src/domain/tab-tree.test.ts`
  - `pnpm -C packages/portal-engine exec vitest run src/services/page-settings.test.ts`
  - `pnpm -C packages/portal-engine exec vitest run src/editor/preview-bridge/sender.test.ts src/domain/tab-tree.test.ts src/services/page-settings.test.ts`
  - `pnpm -C packages/portal-engine typecheck`
  - `pnpm -C packages/portal-engine lint`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin exec vitest run src/modules/PortalManagement/designPage/components/preview-render/__tests__/PortalPreviewPanel.preview-runtime.test.ts`
  - `pnpm -C apps/portal typecheck`
  - `pnpm -C apps/docs build`

- 结果：
  - portal-engine 新增 3 组单测全部通过（14/14）。
  - `packages/portal-engine typecheck` / `apps/admin typecheck` / `apps/portal typecheck` / `apps/docs build` 全部通过。
  - `packages/portal-engine lint` 通过（仅历史 warning，无 error）。
  - PortalPreviewPanel 目标测试通过（6/6），测试过程中存在既有 Vue warn，不影响通过。

## 2026-03-13（portal-engine 第一轮基础设施收敛）

- RED（先失败）
  - `pnpm -C packages/portal-engine run test:run`
    - 结果：失败，缺少 `test:run` script。
  - `pnpm -C packages/portal-engine exec vitest run src/materials/useRendererMaterials.test.ts`
    - 结果：失败，缺少 `./useEditorMaterials` / `./useRendererMaterials` 模块。
  - `pnpm -C packages/portal-engine run verify:materials`
    - 结果：失败，暴露出 `cms` 物料 `defineOptions.name` 与 `config.json` 不一致、`transparent-placeholder` 未走真实 `config.json`、`base-tab-container` 组件名无法被脚本静态识别。

- GREEN / 回归
  - `pnpm -C packages/portal-engine run test:run`
  - `pnpm -C packages/portal-engine exec vitest run src/materials/useRendererMaterials.test.ts`
  - `pnpm -C packages/portal-engine run verify:materials`
  - `pnpm -C packages/portal-engine typecheck`
  - `pnpm -C packages/portal-engine lint`
  - `pnpm -C apps/admin lint:arch`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/portal typecheck`
  - `pnpm -C apps/docs build`
  - `pnpm -C apps/admin build`
  - `pnpm check:admin:bundle`

- 结果：
  - `packages/portal-engine run test:run`：通过（12 files / 43 tests）。
  - `src/materials/useRendererMaterials.test.ts`：通过（3/3）。
  - `verify:materials`：通过（23 个 config.json 全量校验通过）。
  - `packages/portal-engine typecheck`：通过。
  - `packages/portal-engine lint`：通过（0 error，保留 10 条历史 warning）。
  - `apps/admin lint:arch` / `apps/admin typecheck`：通过。
  - `apps/portal typecheck`：通过。
  - `apps/docs build`：通过。
  - `pnpm check:admin:bundle`：仍失败，`startup dependency map js gzip = 849.0 KiB / 预算 820.0 KiB`，说明本轮 loader 拆分未触达启动链路体积。

## 2026-03-13（PortalManagement P1/P2 下沉验证）

- 模块1 验证：
  - `pnpm -C packages/portal-engine exec vitest run src/editor/preview-stage-utils.test.ts`：通过（5/5）。
  - `pnpm -C packages/portal-engine typecheck`：通过。
  - `pnpm -C apps/admin typecheck`：通过。
  - `pnpm -C packages/portal-engine exec eslint src/editor/PortalDesignerPreviewFrame.vue src/editor/preview-stage-utils.ts src/editor/preview-stage-utils.test.ts src/index.ts`：通过。

- 模块2 验证：
  - `pnpm -C packages/portal-engine exec vitest run src/editor/current-tab-actions.test.ts`：通过（4/4）。
  - `pnpm -C packages/portal-engine typecheck`：通过。
  - `pnpm -C apps/admin typecheck`：通过。
  - `pnpm -C packages/portal-engine exec eslint src/editor/current-tab-actions.ts src/editor/current-tab-actions.test.ts src/index.ts`：通过。

- 模块3 验证：
  - `pnpm -C packages/portal-engine exec vitest run src/editor/page-settings-session.test.ts`：通过（4/4）。
  - `pnpm -C packages/portal-engine typecheck`：通过。
  - `pnpm -C apps/admin typecheck`：通过。
  - `pnpm -C packages/portal-engine exec eslint src/editor/page-settings-session.ts src/editor/page-settings-session.test.ts src/index.ts`：通过。

- 全量回归：
  - `pnpm -C packages/portal-engine exec vitest run src/editor/preview-stage-utils.test.ts src/editor/current-tab-actions.test.ts src/editor/page-settings-session.test.ts`：通过（13/13）。
  - `pnpm -C packages/portal-engine typecheck`：通过。
  - `pnpm -C packages/portal-engine lint`：通过（0 error，10 warnings 为存量）。
  - `pnpm -C apps/admin typecheck`：通过。
  - `pnpm -C apps/admin exec vitest run src/modules/PortalManagement/designPage/components/preview-render/__tests__/PortalPreviewPanel.preview-runtime.test.ts`：通过（6/6，存在既有 Vue warn 不阻断）。
  - `pnpm -C apps/portal typecheck`：通过。
  - `pnpm -C apps/docs lint`：通过。
  - `pnpm -C apps/docs build`：通过。

## 2026-03-13（PortalPreviewPanel 下沉与消费者化）

- 命令：
  - `pnpm -C packages/portal-engine exec vitest run --config vitest.config.ts src/renderer/PortalPreviewPanel.test.ts`
  - `pnpm -C packages/portal-engine typecheck`
  - `pnpm -C packages/portal-engine lint`
  - `pnpm -C packages/portal-engine build`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：全部通过。
- 备注：`packages/portal-engine lint` 仍存在历史 warning（base 物料既有文件），本次新增/修改文件未新增 warning。

## 2026-03-13（admin 启动预算：app-shell preload map 与门禁口径对齐）

- RED：
  - `pnpm -C apps/admin exec vitest run src/__tests__/manual-chunks.unit.test.ts`
  - 结果：新增的 `admin-app-shell` preload 用例失败，built preload map rewrite 用例失败。
- GREEN / 回归：
  - `pnpm -C apps/admin exec vitest run src/__tests__/manual-chunks.unit.test.ts`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint:arch`
  - `pnpm -C apps/admin build`
  - `pnpm check:admin:bundle`
  - `pnpm -C apps/docs build`
- 结果：全部通过。

## 2026-03-13（admin 启动链瘦身 + template workbench 下沉）

- `pnpm -C packages/core exec vitest run src/http/pureHttp.test.ts`：通过
- `pnpm -C packages/core lint && pnpm -C packages/core typecheck`：通过
- `pnpm -C packages/portal-engine exec vitest run src/workbench/template-workbench-controller.test.ts`：通过
- `pnpm -C packages/portal-engine typecheck`：通过
- `pnpm -C packages/portal-engine lint`：通过（存在历史 warning 10 条，均位于未改动 base 物料文件）
- `pnpm -C apps/admin exec vitest run src/bootstrap/__tests__/http.unit.test.ts`：通过
- `pnpm -C apps/admin typecheck`：通过
- `pnpm -C apps/admin lint`：通过
- `pnpm -C apps/admin lint:arch`：通过
- `pnpm -C apps/admin build`：通过
- `pnpm check:admin:bundle`：通过
- `pnpm -C apps/portal typecheck`：通过
- `pnpm -C apps/docs lint && pnpm -C apps/docs build`：通过

## 2026-03-13（PortalTemplateSettingPage 页面级编排下沉）

- 命令：
  - `pnpm -C packages/portal-engine exec vitest run src/workbench/template-workbench-controller.test.ts src/workbench/template-workbench-page-controller.test.ts`
  - `pnpm -C packages/portal-engine typecheck`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin lint:arch`
  - `pnpm -C apps/docs build`
  - `pnpm check:admin:bundle`
  - `pnpm -C packages/portal-engine exec ultracite check src/workbench/template-workbench-page-controller.ts src/workbench/template-workbench-page-controller.test.ts src/workbench/useTemplateWorkbenchPage.ts src/index.ts --error-on-warnings --javascript-formatter-enabled=false --css-formatter-enabled=false --html-formatter-enabled=false`
  - `pnpm -C apps/admin build`
- 结果：全部通过

## 2026-03-14（PortalManagement 1+2 下沉）

- `pnpm -C packages/portal-engine exec vitest run src/workbench/page-editor-controller.test.ts src/workbench/template-workbench-controller.test.ts src/workbench/template-workbench-page-controller.test.ts`：通过（9/9）。
- `pnpm -C packages/portal-engine typecheck`：通过。
- `pnpm -C packages/portal-engine lint`：通过（存在历史 warning 10 条，均位于未改动 base 物料文件）。
- `pnpm -C apps/admin typecheck`：通过。
- `pnpm -C apps/admin lint`：通过。
- `pnpm -C apps/admin lint:arch`：通过。
- `pnpm -C apps/admin build`：通过。
- `pnpm check:admin:bundle`：通过。
- `pnpm -C apps/docs build`：通过。

## 2026-03-16（PortalTemplateSettingPage 路由编排下沉）

- `pnpm -C packages/portal-engine exec vitest run src/workbench/template-workbench-route.test.ts src/workbench/useTemplateWorkbenchPageByRoute.test.ts src/workbench/page-editor-controller.test.ts src/workbench/template-workbench-controller.test.ts src/workbench/template-workbench-page-controller.test.ts`：通过（15/15）。
- `pnpm -C packages/portal-engine typecheck`：通过。
- `pnpm -C packages/portal-engine lint`：通过（历史 warning 10 条，未改动文件）。
- `pnpm -C apps/admin typecheck`：通过。
- `pnpm -C apps/admin lint`：通过。
- `pnpm -C apps/admin lint:arch`：通过。
- `pnpm -C apps/admin build`：通过。
- `pnpm check:admin:bundle`：通过。
- `pnpm -C apps/docs build`：通过。

## 2026-03-16（PortalTemplate 组件下沉：workbench 组件 + 属性弹窗注入化）

- 命令：`pnpm -C packages/portal-engine typecheck`
  - 结果：通过
- 命令：`pnpm -C packages/portal-engine test:run`
  - 结果：通过（17 files / 58 tests）
- 命令：`pnpm -C apps/admin typecheck`
  - 结果：通过
- 命令：`pnpm -C apps/admin build`
  - 结果：通过
- 命令：`pnpm -C packages/portal-engine lint`
  - 结果：失败（现存基线问题，不是本次新增组件引入）：
    - `typescript(tsconfig-error)`：tsconfig `baseUrl` 与 non-relative paths 报错
    - 多处 `eslint-plugin-unicorn(no-useless-fallback-in-spread)` warning
- 命令：`pnpm -C apps/docs build`
  - 结果：失败（仓库当前 VitePress 构建环境问题，`transformWithEsbuild` 依赖缺失/弃用）

## 2026-03-16（PortalColorField -> ObColorField 收敛）

- 命令：
  - `pnpm -C packages/ui typecheck`
  - `pnpm -C packages/portal-engine typecheck`
  - `pnpm -C apps/admin typecheck`
- 结果：全部通过（exit code 0）

## 2026-03-16（移除 PortalColorField + 预览路由继续沉淀）

- 命令：
  - `pnpm -C packages/portal-engine typecheck`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C packages/portal-engine test:run src/workbench/usePortalPreviewPageByRoute.test.ts`
  - `pnpm -C apps/docs build`
- 结果：全部通过（exit code 0）。
- 过程修复：`apps/admin` 首次 typecheck 报 `routeParams` 类型不匹配，已将 `route.params` 显式收敛为 `PortalPreviewRouteParamsLike` 后通过。

## 2026-03-16（预览数据源下沉）

- 命令：
  - `pnpm -C packages/portal-engine test:run src/workbench/preview-data-source.test.ts src/workbench/usePortalPreviewPageByRoute.test.ts`
  - `pnpm -C packages/portal-engine typecheck`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/docs build`
- 结果：全部通过（exit code 0）。

## 2026-03-16（PortalManagement 下沉：PageEditor ByRoute + 文档口径同步）

- 命令：
  - `pnpm -C packages/portal-engine test:run src/workbench/template-workbench-route.test.ts src/workbench/usePageEditorWorkbenchByRoute.test.ts src/workbench/preview-data-source.test.ts src/workbench/usePortalPreviewPageByRoute.test.ts`
  - `pnpm -C packages/portal-engine typecheck`
  - `pnpm -C apps/docs build`
  - `pnpm -C apps/admin typecheck`
- 结果：
  - `portal-engine` 相关测试通过（4 files / 16 tests）。
  - `portal-engine typecheck` 通过。
  - `apps/docs build` 通过。
  - `apps/admin typecheck` 失败（既有问题）：`src/bootstrap/__tests__/http.unit.test.ts(127,11): Cannot invoke an object which is possibly 'undefined'.`

## 2026-03-16（PortalManagement 并行计划续跑：下沉 + 判定统一 + 性能优化）

- RED（先失败）：
  - `pnpm -C packages/portal-engine test:run src/editor/page-settings-session.test.ts src/workbench/template-workbench-page-controller.test.ts`
  - 结果：失败（新增断言命中重复 clone）：
    - `page-settings-session.test.ts` 期望 clone 调用 1 次，实际 2 次。
    - `template-workbench-page-controller.test.ts` 期望 clone 调用 0 次，实际 2 次。

- GREEN / 回归：
  - `pnpm -C packages/portal-engine test:run src/editor/page-settings-session.test.ts src/workbench/template-workbench-page-controller.test.ts`：通过（8/8）。
  - `pnpm -C packages/portal-engine test:run src/utils/biz-response.test.ts src/workbench/preview-data-source.test.ts src/services/page-settings.test.ts src/workbench/page-editor-controller.test.ts src/workbench/template-workbench-controller.test.ts src/workbench/template-workbench-page-controller.test.ts src/renderer/PortalPreviewPanel.test.ts`：通过（24/24）。
  - `pnpm -C packages/portal-engine typecheck`：通过。
  - `pnpm -C apps/admin test:run src/modules/PortalManagement/templatePage/composables/latestRequest.unit.test.ts src/modules/PortalManagement/utils/pagePermission.unit.test.ts`：通过（6/6）。
  - `pnpm -C apps/docs build`：通过。

- 已知历史阻塞（非本次改动引入）：
  - `pnpm -C apps/admin typecheck`：失败。
  - 错误：`src/bootstrap/__tests__/http.unit.test.ts(127,11): error TS2722: Cannot invoke an object which is possibly 'undefined'.`

## 2026-03-16（PortalManagement 第三步业务冒烟）

- 命令：
  - `pnpm -C apps/admin test:run src/modules/PortalManagement/templatePage/composables/latestRequest.unit.test.ts src/modules/PortalManagement/utils/pagePermission.unit.test.ts`
  - `pnpm -C packages/portal-engine test:run src/workbench/PortalShellSettingsDialog.submit.test.ts src/workbench/template-workbench-page-controller.test.ts src/editor/page-settings-session.test.ts src/workbench/page-editor-controller.test.ts src/workbench/useTemplateWorkbenchPageByRoute.test.ts src/workbench/usePageEditorWorkbenchByRoute.test.ts`
- 结果：全部通过
  - admin：`Test Files 2 passed`，`Tests 6 passed`
  - portal-engine：`Test Files 6 passed`，`Tests 16 passed`

## 2026-03-16（PortalManagement CR 修复回归）

- RED 阶段（预期失败）：
  - `pnpm -C apps/admin test:run src/modules/PortalManagement/templatePage/composables/latestRequest.unit.test.ts`（失败：`guard.invalidate is not a function`）
  - `pnpm -C packages/portal-engine test:run src/workbench/useTemplateWorkbenchPageByRoute.test.ts src/workbench/usePortalPreviewPageByRoute.test.ts src/workbench/template-workbench-page-controller.test.ts`（失败：5 条新增断言）
- GREEN 阶段（修复后通过）：
  - `pnpm -C apps/admin test:run src/modules/PortalManagement/templatePage/composables/latestRequest.unit.test.ts`（1 files / 2 tests 通过）
  - `pnpm -C packages/portal-engine test:run src/workbench/useTemplateWorkbenchPageByRoute.test.ts src/workbench/usePortalPreviewPageByRoute.test.ts src/workbench/template-workbench-page-controller.test.ts`（3 files / 15 tests 通过）
- 提交后复核：
  - `pnpm -C apps/admin test:run src/modules/PortalManagement/templatePage/composables/latestRequest.unit.test.ts` 通过
  - `pnpm -C apps/admin typecheck` 通过
  - `pnpm -C packages/portal-engine test:run src/workbench/useTemplateWorkbenchPageByRoute.test.ts src/workbench/usePortalPreviewPageByRoute.test.ts src/workbench/template-workbench-page-controller.test.ts` 通过
  - `pnpm -C packages/portal-engine typecheck` 通过

## 2026-03-17（PortalManagement 外部单容器物料）

- `pnpm -C apps/admin typecheck`
  - 首次失败：
    - `simple-container/index.vue` 类型不匹配（`Record<string, unknown>` -> `Record<string, Component>`）
    - `currentTab` 可能为 `undefined`
    - 下钻读取 `payload.cmptConfig.index.name` 的类型错误
  - 修复后再次执行：通过。
- `pnpm -C apps/admin lint`
  - 首次失败：`selectParentContainer` 逻辑表达式复杂度告警。
  - 修复后再次执行：通过（0 errors）。
- `pnpm -C apps/admin build`：通过。
- `pnpm -C apps/docs lint`：通过（0 warnings / 0 errors）。
- `pnpm -C apps/docs build`：通过。
- 提交后复验：
  - `pnpm -C apps/admin typecheck`：通过。
  - `pnpm -C apps/docs build`：通过。

## 2026-03-17（PortalManagement 外部单容器修正回归）

- `pnpm -C apps/admin typecheck`
  - 首次失败：深路径 import base-tab-container 组件不可解析。
  - 修正：移除深路径 import，改为在 admin 侧实现兼容渲染逻辑。
  - 再次执行：通过。
- `pnpm -C apps/admin lint`：通过。
- `pnpm -C apps/admin build`：通过。
- `pnpm -C apps/docs lint`：通过。
- `pnpm -C apps/docs build`：通过。
- 提交后复验：`pnpm -C apps/admin typecheck`、`pnpm -C apps/admin lint`、`pnpm -C apps/docs build` 均通过。

## 2026-03-17（去 turbo / 去 biome 工程收敛）

- 命令：
  - `pnpm install --lockfile-only`
  - `pnpm lint`
  - `node scripts/doctor.mjs`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
  - `pnpm typecheck`
- 结果：
  - `pnpm lint`：通过（admin 保留 4 条 `max-lines` warning，无 error）
  - `node scripts/doctor.mjs`：通过（仅存在 Rust `.cargo/env` 缺失 warning）
  - `pnpm -C apps/docs lint`：通过
  - `pnpm -C apps/docs build`：通过
  - `pnpm typecheck`：失败（非本次改动引入，当前工作区既有变更导致 `packages/portal-engine/src/editor/SimpleContainerEditorItem.vue` 出现 `BaseSimpleContainerTab` 与 `TabContainerTab` 类型不兼容）

## 2026-03-17（单容器收敛到 portal-engine）

- `pnpm -C packages/portal-engine run verify:materials`
  - 首次结果：失败（新物料 `base-simple-container` 的 `index/content/style.vue` 使用常量 `defineOptions`，校验脚本仅识别字面量）。
  - 修复后再次执行：通过（`物料一致性检查通过，共检查 24 个 config.json`）。
- `pnpm -C packages/portal-engine typecheck`：通过。
- `pnpm -C packages/portal-engine lint`：通过（0 warnings / 0 errors）。
- `pnpm -C packages/portal-engine build`：通过。
- `pnpm -C apps/admin typecheck`：通过。
- `pnpm -C apps/admin lint`：通过（0 errors，存在 4 条历史 `max-lines` warning，均与本次改动无关）。
- `pnpm -C apps/admin build`：通过。
- `pnpm -C apps/docs lint`：通过（0 warnings / 0 errors）。
- `pnpm -C apps/docs build`：通过。
- 提交后复验：`pnpm -C packages/portal-engine run verify:materials`、`pnpm -C packages/portal-engine typecheck`、`pnpm -C apps/admin typecheck`、`pnpm -C apps/docs build` 均通过。

## 2026-03-17（单容器拖拽失败修复回归）

- `pnpm -C packages/portal-engine typecheck`：通过。
- `pnpm -C packages/portal-engine lint`：通过（0 warnings / 0 errors）。
- `pnpm -C packages/portal-engine build`：通过。
- `pnpm -C packages/portal-engine run verify:materials`：通过。
- `pnpm -C apps/admin typecheck`：通过。
- `pnpm -C apps/admin build`：通过。

## 2026-03-17（单容器网格样式对齐）

- `pnpm -C packages/portal-engine typecheck`：通过。
- `pnpm -C packages/portal-engine lint`：通过（0 warnings / 0 errors）。
- `pnpm -C packages/portal-engine build`：通过。
- `pnpm -C apps/admin typecheck`：通过。

## 2026-03-17（admin 简化注册示例）

- `pnpm -C apps/admin typecheck`：通过。
- `pnpm -C apps/admin lint`：通过（0 errors，存在 4 条历史 max-lines warning，非本次引入）。
- `pnpm -C apps/admin build`：通过。
- `pnpm -C apps/docs lint`：通过。
- `pnpm -C apps/docs build`：通过。
- 提交后复验：`pnpm -C apps/admin typecheck`、`pnpm -C apps/docs build` 均通过。

## 2026-03-17（admin 示例注册器按需加载优化）

- `pnpm -C apps/admin typecheck`：通过。
- `pnpm -C apps/admin lint`：通过（0 errors，4 条历史 max-lines warning）。
- `pnpm -C apps/docs build`：通过。

## 2026-03-17（PortalManagement 注册收口：语义化导出 + 声明式扩展门禁）

- RED：
  - `pnpm -C packages/portal-engine run test:run -- src/public-designer.test.ts`
  - 结果：失败，先后暴露 `./public-designer`、`./internal` 缺失，确认语义化出口与内部语义子路径尚未落地。
- GREEN / 迭代修正：
  - `pnpm -C packages/portal-engine run test:run -- src/public-designer.test.ts`
  - 结果：通过（25 files / 91 tests passed），包含相对路径导出映射与 `@one-base-template/portal-engine/designer|internal` 包级导入契约。
- 最终验证：
  - `pnpm -C packages/portal-engine run verify:materials`：通过（24 个 config.json）。
  - `pnpm -C packages/portal-engine run test:run -- src/materials/registerMaterialExtensions.test.ts src/public-designer.test.ts src/materials/usePortalMaterialCatalog.test.ts src/materials/useRendererMaterials.test.ts src/runtime/context.test.ts`：通过（25 files / 91 tests passed）。
  - `pnpm -C packages/portal-engine typecheck`：通过。
  - `pnpm -C packages/portal-engine lint`：通过（0 warnings / 0 errors）。
  - `pnpm -C apps/admin typecheck`：通过。
  - `pnpm -C apps/admin lint`：通过（0 errors，存在 4 条历史 `max-lines` warning，非本次引入）。
  - `pnpm -C apps/docs lint`：通过（0 warnings / 0 errors）。
  - `pnpm -C apps/docs build`：通过。

## 2026-03-18（designer 辅助组件语义化补齐）

- RED：
  - `pnpm -C packages/portal-engine run test:run -- src/public-designer.test.ts`
  - 结果：失败，`PortalPageDesignerSettingsDrawer` 为 `undefined`，证明辅助组件 alias 尚未导出。
- GREEN / 最终验证：
  - `pnpm -C packages/portal-engine run test:run -- src/public-designer.test.ts`：通过（25 files / 92 tests passed）。
  - `pnpm -C packages/portal-engine typecheck`：通过。
  - `pnpm -C packages/portal-engine lint`：通过（0 warnings / 0 errors）。
  - `pnpm -C apps/admin typecheck`：通过。
  - `pnpm -C apps/admin lint`：通过（0 errors，4 条历史 `max-lines` warning）。
  - `pnpm -C apps/docs lint`：通过。
  - `pnpm -C apps/docs build`：通过。

## 2026-03-18（补强 root 导出契约与文档时态）

- 追加回归覆盖：
  - `pnpm -C packages/portal-engine run test:run -- src/public-designer.test.ts`
  - 结果：通过（25 files / 93 tests passed），说明 `@one-base-template/portal-engine` 的 root 包级导入当前已正确转发语义化导出；本次改动主要用于补齐契约覆盖，非修复已有故障。
- 文档/脚本回归：
  - `pnpm -C packages/portal-engine lint`：通过。
  - `pnpm -C apps/docs lint`：通过。
  - `pnpm -C apps/docs build`：通过。

## 2026-03-18（删除 designer 旧 public 命名）

- RED：
  - `pnpm -C packages/portal-engine run test:run -- src/public-designer.test.ts`
  - 结果：失败（2 个断言失败），`designer` 与 `root` 包导入中仍包含 `PortalPageSettingsDrawer` / `PortalShellSettingsDialog` / `PortalTabAttributeDialog`。
- GREEN：
  - `pnpm -C packages/portal-engine run test:run -- src/public-designer.test.ts`：通过（25 files / 93 tests passed）。
- 最终回归：
  - `pnpm -C packages/portal-engine typecheck`：通过。
  - `pnpm -C packages/portal-engine lint`：通过。
  - `pnpm -C apps/admin typecheck`：通过。
  - `pnpm -C apps/docs lint`：通过。
  - `pnpm -C apps/docs build`：通过。

## 2026-03-18（补充 portal 后续优化并行计划）

- 文档自检：
  - `git diff --check`：通过。
- 说明：
  - 本轮仅新增 `docs/plans/*.md` 计划文档与 `.codex` 记录，不涉及产品代码实现。
  - `apps/docs` 站点内容未改动，本轮不跑 `apps/docs build`，待后续真正落实现时按计划执行。

## 2026-03-18（PortalManagement 最后收口：admin 注册集成测试 + 文档回归）

- RED 前置说明：
  - 当前仓库缺少 `apps/admin/src/modules/PortalManagement/engine/register.unit.test.ts`，本轮先补测试覆盖最后一段注册入口行为。
- 初次验证：
  - `pnpm -C apps/admin run test:run -- src/modules/PortalManagement/engine/register.unit.test.ts`：通过（20 files / 76 tests passed，脚本会一并跑到既有 admin 测试集）。
- 首轮全量回归：
  - `pnpm -C packages/portal-engine run test:run -- src/public-designer.test.ts src/materials/extensions.test.ts src/materials/registerMaterialExtensions.test.ts`：通过（26 files / 96 tests passed）。
  - `pnpm -C packages/portal-engine run verify:materials`：通过（24 个 config.json）。
  - `pnpm -C packages/portal-engine typecheck`：通过。
  - `pnpm -C packages/portal-engine lint`：通过（0 warnings / 0 errors）。
  - `pnpm -C apps/admin run test:run -- src/modules/PortalManagement/engine/register.unit.test.ts`：通过（20 files / 76 tests passed）。
  - `pnpm -C apps/admin typecheck`：失败。
    - 原因：`register.unit.test.ts` 直接 `push` 到 `PORTAL_ADMIN_MATERIAL_EXTENSIONS`，被 TypeScript 视为 `never[]`。
    - 处理：仅在测试内把默认扩展数组显式收口为 `PortalMaterialExtension[]` 后重跑。
  - `pnpm -C apps/docs lint`：通过。
  - `pnpm -C apps/docs build`：通过。
- 修正后的 fresh 回归：
  - `pnpm -C packages/portal-engine run test:run -- src/public-designer.test.ts src/materials/extensions.test.ts src/materials/registerMaterialExtensions.test.ts && pnpm -C packages/portal-engine run verify:materials && pnpm -C packages/portal-engine typecheck && pnpm -C packages/portal-engine lint`：通过。
  - `pnpm -C apps/admin run test:run -- src/modules/PortalManagement/engine/register.unit.test.ts && pnpm -C apps/admin typecheck && pnpm -C apps/admin lint`：通过。
    - 说明：`apps/admin lint` 仍有 4 条历史 `max-lines` warning（`PagePermissionDialog.vue`、`PortalAuthorityDialog.vue`、`useRoleAssignPageState.ts`、`usePortalTemplateListPageState.ts`），无新增 errors。
  - `pnpm -C apps/docs lint && pnpm -C apps/docs build`：通过。
- review 修正后的最终 fresh 回归：
  - `pnpm -C packages/portal-engine run test:run -- src/public-designer.test.ts src/materials/extensions.test.ts src/materials/registerMaterialExtensions.test.ts && pnpm -C packages/portal-engine run verify:materials && pnpm -C packages/portal-engine typecheck && pnpm -C packages/portal-engine lint`：通过（96 tests；24 个 config.json；0 warnings / 0 errors）。
  - `pnpm -C apps/admin run test:run -- src/modules/PortalManagement/engine/register.unit.test.ts && pnpm -C apps/admin typecheck && pnpm -C apps/admin lint`：通过（76 tests；lint 仅 4 条历史 `max-lines` warning）。
  - `pnpm -C apps/docs lint && pnpm -C apps/docs build`：通过。
- 提交后验证（基于当前 HEAD）：
  - `git status --short --branch`：工作树干净，分支 `feat/portal-engine-extract` 相对远端 `ahead 2`。
  - `pnpm -C packages/portal-engine run test:run -- src/public-designer.test.ts src/materials/extensions.test.ts src/materials/registerMaterialExtensions.test.ts && pnpm -C packages/portal-engine run verify:materials && pnpm -C packages/portal-engine typecheck && pnpm -C packages/portal-engine lint`：通过。
  - `pnpm -C apps/admin run test:run -- src/modules/PortalManagement/engine/register.unit.test.ts && pnpm -C apps/admin typecheck && pnpm -C apps/admin lint`：通过（仅 4 条历史 `max-lines` warning）。
  - `pnpm -C apps/docs lint && pnpm -C apps/docs build`：通过。

## 2026-03-18（PortalManagement 第二批可选优化：root workbench 导出继续收口）

- RED：
  - `pnpm -C packages/portal-engine run test:run -- src/public-designer.test.ts`：失败。
    - 结果：root 包导入仍包含新增的 `rootInternalWorkbenchSymbols`。
  - `pnpm -C packages/portal-engine run verify:materials`：失败。
    - 结果：`scripts/check-portal-materials.mjs` 报告 root 仍导出 `createTemplateWorkbenchController`、`useTemplateWorkbench`、`PortalTabTree`、`PortalPageSettingsForm`、`PortalShellHeaderSettingsForm`、`PortalShellFooterSettingsForm`、`createTemplateWorkbenchPageController`、`useTemplateWorkbenchPage`、`buildNextRouteQueryWithTabId`、`buildPortalPageEditorBackRouteLocation`、`buildPortalPageEditorRouteLocation`、`buildPortalPreviewRouteLocation`、`resolvePortalTabIdFromQuery`、`resolvePortalTemplateIdFromQuery`、`createPageEditorController`、`usePageEditorWorkbench` 及相关类型。
- admin 精确脚本探索：
  - `pnpm -C apps/admin run test:run:file -- src/modules/PortalManagement/engine/register.unit.test.ts`
    - 初版 `vitest` / `pnpm exec vitest` 均失败，命令找不到可执行文件。
    - `cd apps/admin && vp test run --config vitest.config.ts src/modules/PortalManagement/engine/register.unit.test.ts`：通过（1 file / 3 tests），确认正确参数口径是不带前置 `--` 的 file filter。
    - 最终脚本使用 shell `shift` 吃掉 pnpm 自动附加的 `--` 后，通过 `pnpm run` 也能精确只跑 `1` 个文件、`3` 个测试。
- 最终验证（基于当前 HEAD）：
  - `pnpm -C packages/portal-engine run test:run -- src/public-designer.test.ts && pnpm -C packages/portal-engine run verify:materials && pnpm -C packages/portal-engine typecheck && pnpm -C packages/portal-engine lint`：通过。
  - `pnpm -C apps/admin run test:run:file -- src/modules/PortalManagement/engine/register.unit.test.ts && pnpm -C apps/admin typecheck && pnpm -C apps/admin lint`：通过。
    - 说明：`test:run:file` 结果为 `1 file / 3 tests`，已不再连带整组 admin 测试。
    - `apps/admin lint` 仍有 4 条历史 `max-lines` warning，无新增 errors。
  - `pnpm -C apps/docs lint && pnpm -C apps/docs build`：通过。

## 2026-03-18（Portal 文档分层重构）

- 命令：
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：全部通过

## 2026-03-18（PortalManagement 代码层收敛：API + 模板列表编排）

- 命令：
  - `pnpm -C apps/admin run test:run:file -- src/modules/PortalManagement/engine/register.unit.test.ts`
  - `pnpm -C apps/admin run test:run:file -- src/modules/PortalManagement/templatePage/composables/template-list-helpers.unit.test.ts src/modules/PortalManagement/templatePage/composables/latestRequest.unit.test.ts`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - 所有测试与 typecheck 通过。
  - `apps/admin lint` 仅剩 3 条历史 `max-lines` warning（`PagePermissionDialog.vue`、`PortalAuthorityDialog.vue`、`useRoleAssignPageState.ts`），无 errors。

## 2026-03-18（PortalManagement 结构瘦身：移除 designPage/pages）

- 命令：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - typecheck/docs 全部通过。
  - admin lint 无 error，仅 3 条历史 `max-lines` warning。

## 2026-03-18（执行 2026-03-18-portal-management-123-parallel-plan）

- RED（A1）：
  - `pnpm -C apps/admin run test:run:file -- src/modules/PortalManagement/templatePage/components/permission/permission-payload.unit.test.ts`
  - 结果：失败（`No test files found`），符合预期。
- GREEN（A1/A2）：
  - `pnpm -C apps/admin run test:run:file -- src/modules/PortalManagement/templatePage/components/permission/permission-payload.unit.test.ts`
  - 结果：通过（`1 file / 4 tests`）。
  - `pnpm -C apps/admin run test:run:file -- src/modules/PortalManagement/templatePage/composables/template-list-helpers.unit.test.ts src/modules/PortalManagement/templatePage/composables/latestRequest.unit.test.ts`
  - 结果：通过（`2 files / 6 tests`）。
- RED（C1）：
  - 创建 `packages/adapters/src/portal/normalize-template.unit.test.ts` 后执行 `pnpm -C packages/adapters typecheck`。
  - 结果：失败（找不到 `./normalize-template`），符合预期。
- GREEN（C1）：
  - 新增 `packages/adapters/src/portal/normalize-template.ts` 后执行 `pnpm -C packages/adapters typecheck`。
  - 结果：通过。
- 全量回归：
  - `pnpm -C packages/adapters typecheck && pnpm -C packages/adapters lint && pnpm -C apps/admin run test:run:file -- src/modules/PortalManagement/engine/register.unit.test.ts src/modules/PortalManagement/templatePage/composables/latestRequest.unit.test.ts && pnpm -C apps/admin typecheck && pnpm -C apps/admin lint && pnpm -C apps/docs lint && pnpm -C apps/docs build`
  - 结果：全部通过；`apps/admin lint` 仅 1 条历史 `max-lines` warning（`useRoleAssignPageState.ts`），无 errors。

## 2026-03-18（portal-management-123 提交后复验）

- `pnpm -C packages/adapters typecheck && pnpm -C packages/adapters lint`：通过。
- `pnpm -C apps/admin run test:run:file -- src/modules/PortalManagement/templatePage/components/permission/permission-payload.unit.test.ts src/modules/PortalManagement/engine/register.unit.test.ts src/modules/PortalManagement/templatePage/composables/latestRequest.unit.test.ts`：通过（`3 files / 9 tests`）。
- `pnpm -C apps/admin typecheck && pnpm -C apps/admin lint`：通过（lint 仅 1 条历史 warning）。
- `pnpm -C apps/docs lint && pnpm -C apps/docs build`：通过。

## 2026-03-18（PortalManagement P1：扩展注册幂等 + 权限弹窗共享编排）

- 命令：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin run test:run:file -- src/modules/PortalManagement/engine/register.unit.test.ts src/modules/PortalManagement/templatePage/components/permission/permission-payload.unit.test.ts src/modules/PortalManagement/templatePage/composables/latestRequest.unit.test.ts`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - `apps/admin typecheck`：通过。
  - `apps/admin lint`：通过（0 error，保留 1 条历史 warning：`src/modules/UserManagement/role-assign/composables/useRoleAssignPageState.ts` max-lines）。
  - PortalManagement 目标单测：通过（`3 files / 10 tests`）。
  - `apps/docs lint`：通过。
  - `apps/docs build`：通过。

## 2026-03-18（PortalManagement P2：权限角色加载去重与缓存复用）

- RED：
  - `pnpm -C apps/admin run test:run:file -- src/modules/PortalManagement/templatePage/components/permission/usePermissionRoleOptions.unit.test.ts`
  - 结果：失败（2/3 失败），证实旧实现存在“同一 API 被重复请求”的问题。
- GREEN / 回归：
  - `pnpm -C apps/admin run test:run:file -- src/modules/PortalManagement/templatePage/components/permission/usePermissionRoleOptions.unit.test.ts`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin run test:run:file -- src/modules/PortalManagement/engine/register.unit.test.ts src/modules/PortalManagement/templatePage/components/permission/permission-payload.unit.test.ts src/modules/PortalManagement/templatePage/components/permission/usePermissionRoleOptions.unit.test.ts src/modules/PortalManagement/templatePage/composables/latestRequest.unit.test.ts`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - 新增用例通过（`1 file / 3 tests`）。
  - PortalManagement 相关回归通过（`4 files / 13 tests`）。
  - `apps/admin typecheck`、`apps/docs lint/build` 通过。
  - `apps/admin lint` 通过（0 error，仅 1 条历史 warning：`src/modules/UserManagement/role-assign/composables/useRoleAssignPageState.ts` max-lines）。

## 2026-03-19（PortalManagement P3：权限成员数据源请求去重与缓存复用）

- RED：
  - `pnpm -C apps/admin run test:run:file -- src/modules/PortalManagement/templatePage/components/permission/permission-member-source.unit.test.ts`
  - 结果：失败（3/3 失败），证实旧实现存在跨实例重复请求问题。
- GREEN / 回归：
  - `pnpm -C apps/admin run test:run:file -- src/modules/PortalManagement/templatePage/components/permission/permission-member-source.unit.test.ts`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin run test:run:file -- src/modules/PortalManagement/engine/register.unit.test.ts src/modules/PortalManagement/templatePage/components/permission/permission-payload.unit.test.ts src/modules/PortalManagement/templatePage/components/permission/usePermissionRoleOptions.unit.test.ts src/modules/PortalManagement/templatePage/components/permission/permission-member-source.unit.test.ts src/modules/PortalManagement/templatePage/composables/latestRequest.unit.test.ts`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - 新增用例通过（`1 file / 3 tests`）。
  - PortalManagement 相关回归通过（`5 files / 16 tests`）。
  - `apps/admin typecheck`、`apps/docs lint/build` 通过。
  - `apps/admin lint` 通过（0 error，仅 1 条历史 warning：`src/modules/UserManagement/role-assign/composables/useRoleAssignPageState.ts` max-lines）。

## 2026-03-19（PortalManagement P4：权限 payload 去重收敛）

- RED：
  - `pnpm -C apps/admin run test:run:file -- src/modules/PortalManagement/templatePage/components/permission/permission-payload.unit.test.ts`
  - 结果：失败（新增去重断言失败），证实旧实现未去重提交字段。
- GREEN / 回归：
  - `pnpm -C apps/admin run test:run:file -- src/modules/PortalManagement/templatePage/components/permission/permission-payload.unit.test.ts`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin run test:run:file -- src/modules/PortalManagement/engine/register.unit.test.ts src/modules/PortalManagement/templatePage/components/permission/permission-payload.unit.test.ts src/modules/PortalManagement/templatePage/components/permission/usePermissionRoleOptions.unit.test.ts src/modules/PortalManagement/templatePage/components/permission/permission-member-source.unit.test.ts src/modules/PortalManagement/templatePage/composables/latestRequest.unit.test.ts`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - `permission-payload.unit.test.ts` 通过（`1 file / 5 tests`）。
  - PortalManagement 相关回归通过（`5 files / 17 tests`）。
  - `apps/admin typecheck`、`apps/docs lint/build` 通过。
  - `apps/admin lint` 通过（0 error，仅 1 条历史 warning：`src/modules/UserManagement/role-assign/composables/useRoleAssignPageState.ts` max-lines）。

## 2026-03-19（PortalManagement P5：权限弹窗字段映射 helper 收敛）

- RED：
  - `pnpm -C apps/admin run test:run:file -- src/modules/PortalManagement/templatePage/components/permission/permission-field-accessor.unit.test.ts`
  - 结果：失败（`Failed to resolve import \"./permission-field-accessor\"`），符合“先写测试后实现”预期。
- GREEN：
  - `pnpm -C apps/admin run test:run:file -- src/modules/PortalManagement/templatePage/components/permission/permission-field-accessor.unit.test.ts`
  - 结果：通过（`1 file / 2 tests`）。
- 回归：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin run test:run:file -- src/modules/PortalManagement/engine/register.unit.test.ts src/modules/PortalManagement/templatePage/components/permission/permission-payload.unit.test.ts src/modules/PortalManagement/templatePage/components/permission/usePermissionRoleOptions.unit.test.ts src/modules/PortalManagement/templatePage/components/permission/permission-member-source.unit.test.ts src/modules/PortalManagement/templatePage/components/permission/permission-field-accessor.unit.test.ts src/modules/PortalManagement/templatePage/composables/latestRequest.unit.test.ts`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - PortalManagement 相关回归通过（`6 files / 19 tests`）。
  - `apps/admin typecheck`、`apps/docs lint/build` 通过。
  - `apps/admin lint` 通过（0 error，仅 1 条历史 warning：`src/modules/UserManagement/role-assign/composables/useRoleAssignPageState.ts` max-lines）。

## 2026-03-19（PortalManagement P6：权限弹窗模板重复片段收敛）

- 命令：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin run test:run:file -- src/modules/PortalManagement/engine/register.unit.test.ts src/modules/PortalManagement/templatePage/components/permission/permission-payload.unit.test.ts src/modules/PortalManagement/templatePage/components/permission/usePermissionRoleOptions.unit.test.ts src/modules/PortalManagement/templatePage/components/permission/permission-member-source.unit.test.ts src/modules/PortalManagement/templatePage/components/permission/permission-field-accessor.unit.test.ts src/modules/PortalManagement/templatePage/components/permission/permission-form-fields.unit.test.ts src/modules/PortalManagement/templatePage/composables/latestRequest.unit.test.ts`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - 全部通过。
  - `apps/admin lint` 存在 1 条历史 warning：`src/modules/UserManagement/role-assign/composables/useRoleAssignPageState.ts` 触发 `max-lines`，与本次改动无关。

## 2026-03-19（PortalManagement 结构收敛：materials 注册链路 + utils 下沉）

- 命令：
  - `pnpm -C packages/portal-engine typecheck`
  - `pnpm -C packages/portal-engine run test:run -- src/domain/page-permission.test.ts src/domain/tab-tree.test.ts src/materials/extensions.test.ts src/materials/registerMaterialExtensions.test.ts src/public-designer.test.ts`
  - `pnpm -C packages/portal-engine run verify:materials`
  - `pnpm -C packages/portal-engine lint`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin run test:run:file -- src/modules/PortalManagement/engine/register.unit.test.ts src/modules/PortalManagement/templatePage/components/permission/permission-field-accessor.unit.test.ts src/modules/PortalManagement/templatePage/components/permission/permission-form-fields.unit.test.ts src/modules/PortalManagement/templatePage/components/permission/permission-member-source.unit.test.ts src/modules/PortalManagement/templatePage/components/permission/permission-payload.unit.test.ts src/modules/PortalManagement/templatePage/components/permission/usePermissionRoleOptions.unit.test.ts src/modules/PortalManagement/templatePage/composables/latestRequest.unit.test.ts src/modules/PortalManagement/templatePage/composables/template-list-helpers.unit.test.ts src/modules/PortalManagement/utils/gridLayoutSync.unit.test.ts src/modules/PortalManagement/utils/pageSettingsV2.unit.test.ts src/modules/PortalManagement/utils/preview.unit.test.ts src/modules/PortalManagement/utils/templateDetails.unit.test.ts`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - `packages/portal-engine`：typecheck / lint / tests / verify:materials 全部通过。
  - `apps/admin`：typecheck 与 PortalManagement 定向回归（12 files / 40 tests）通过。
  - `apps/docs`：lint/build 通过。
  - `apps/admin lint` 保留 1 条历史 warning（`UserManagement/role-assign` max-lines），与本次改动无关。
- 失败与修复：
  - `verify:materials` 首次失败：`engine/register.ts` 需显式满足 `registerMaterialExtensions(context, [...])` 约束。
  - 已调整注册实现后复跑通过。

## 2026-03-19（PortalManagement 边界清理：剩余 utils 测试迁移）

- 命令：
  - `pnpm -C packages/portal-engine typecheck`
  - `pnpm -C packages/portal-engine lint`
  - `pnpm -C packages/portal-engine run test:run -- src/editor/layout-sync.test.ts src/schema/page-settings.test.ts src/utils/preview.test.ts src/shell/template-details.test.ts src/domain/page-permission.test.ts src/domain/tab-tree.test.ts`
  - `pnpm -C packages/portal-engine run verify:materials`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - `packages/portal-engine`：typecheck/lint/测试/verify:materials 全部通过。
  - `apps/admin`：typecheck 通过；lint 无 error（保留 1 条历史 max-lines warning，与本次迁移无关）。
  - `apps/docs`：lint/build 通过。
- 修复记录：
  - `packages/portal-engine/src/editor/layout-sync.test.ts` 初次 typecheck 报 `PortalLayoutItem` 未从 `layout-sync.ts` 导出；已改为从 `../stores/pageLayout` 引入类型后通过。

## 2026-03-19（PortalManagement 最小演示物料注册）

- 命令：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin run test:run:file -- src/modules/PortalManagement/engine/register.unit.test.ts`
  - `pnpm -C apps/admin lint`
  - `pnpm -C packages/portal-engine run verify:materials`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - 全部通过。
  - `apps/admin lint` 仅保留 1 条历史 warning（UserManagement max-lines），与本次改动无关。

## 2026-03-19（PortalManagement 演示物料增强：内容/样式设置）

- 命令：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin run test:run:file -- src/modules/PortalManagement/engine/register.unit.test.ts`
  - `pnpm -C apps/admin lint`
  - `pnpm -C packages/portal-engine run verify:materials`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：全部通过（`apps/admin lint` 仅 1 条历史 warning，与本次改动无关）。

## 2026-03-19（PortalManagement 物料结构标准化 + 自动注册）

- 命令：
  - `pnpm -C apps/admin run test:run:file -- src/modules/PortalManagement/engine/register.unit.test.ts`
  - `pnpm -C packages/portal-engine run verify:materials`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - 全部通过。
  - `apps/admin lint` 保留 1 条历史 warning：`UserManagement/role-assign/composables/useRoleAssignPageState.ts` `max-lines`。
- 补充回归：`pnpm -C apps/admin build` 通过（本轮结构改造后补跑）。

## 2026-03-19（PortalManagement 物料常量收敛）

- 命令：
  - `pnpm -C apps/admin run test:run:file -- src/modules/PortalManagement/engine/register.unit.test.ts`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
- 结果：
  - PortalManagement 定向单测通过（1 file / 3 tests）。
  - typecheck 通过。
  - lint 通过（仅 1 条历史 warning：UserManagement `max-lines`）。

## 2026-03-19（PortalManagement defaults 再收敛）

- 命令：
  - `pnpm -C apps/admin run test:run:file -- src/modules/PortalManagement/engine/register.unit.test.ts`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
- 结果：
  - 定向单测通过（1 file / 3 tests）。
  - typecheck 通过。
  - lint 通过（仅 1 条历史 warning：UserManagement `max-lines`）。

## 2026-03-19（PortalManagement 类型维护再降级）

- 命令：
  - `pnpm -C apps/admin run test:run:file -- src/modules/PortalManagement/engine/register.unit.test.ts`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
- 结果：
  - 定向单测通过（1 file / 3 tests）。
  - typecheck 通过。
  - lint 通过（仅 1 条历史 warning：UserManagement `max-lines`）。

## 2026-03-19（PortalManagement merge 再简化）

- 命令：
  - `pnpm -C apps/admin run test:run:file -- src/modules/PortalManagement/engine/register.unit.test.ts`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
- 结果：
  - 定向单测通过（1 file / 3 tests）。
  - typecheck 通过。
  - lint 通过（仅 1 条历史 warning：UserManagement `max-lines`）。

## 2026-03-19（PortalManagement P2-3：useSchemaConfig 默认值自动注入）

- 命令：
  - `pnpm -C packages/portal-engine run test:run -- src/composables/useSchemaConfig.test.ts`
  - `pnpm -C packages/portal-engine run verify:materials`
  - `pnpm -C packages/portal-engine typecheck`
  - `pnpm -C packages/portal-engine lint`
  - `pnpm -C apps/admin run test:run:file -- src/modules/PortalManagement/engine/register.unit.test.ts`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - 全部通过。
  - `apps/admin lint` 仍为 1 条历史 warning（`useRoleAssignPageState.ts` `max-lines`），与本次改动无关。

## 2026-03-19（PortalManagement P2-3 扩展：内置物料批量切换）

- 命令：
  - `pnpm -C packages/portal-engine typecheck`
  - `pnpm -C packages/portal-engine lint`
  - `pnpm -C packages/portal-engine run test:run -- src/composables/useSchemaConfig.test.ts`
  - `pnpm -C packages/portal-engine run verify:materials`
  - `pnpm -C apps/admin typecheck`
- 结果：
  - 全部通过。

## 2026-03-19（PortalManagement P2-3 扩展二：继续批量迁移内置物料）

- 命令：
  - `pnpm -C packages/portal-engine typecheck`
  - `pnpm -C packages/portal-engine lint`
  - `pnpm -C packages/portal-engine run verify:materials`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - 全部通过。

## 2026-03-19（PortalManagement P2-3 扩展三：继续迁移 base-stat/base-timeline/image-link-list）

- 命令：
  - `pnpm -C packages/portal-engine typecheck`
  - `pnpm -C packages/portal-engine lint`
  - `pnpm -C packages/portal-engine run verify:materials`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - 全部通过。

## 2026-03-19（规则文档更新：可维护性优先）

- 变更类型：规则文档更新（`AGENTS.md`）
- 命令：未执行（无代码与构建产物变更）
- 结果：不适用

## 2026-03-20（UserManagement 可维护性优化）

- 命令：`pnpm -C apps/admin test:run:file -- src/modules/UserManagement/org/utils/managerDelta.unit.test.ts`
  - 结果：通过（1 文件，3 用例）。
- 命令：`pnpm -C apps/admin typecheck`
  - 结果：通过。
- 命令：`pnpm -C apps/admin lint`
  - 结果：通过（0 error，1 warning：`useRoleAssignPageState.ts` `eslint(max-lines)` 行数告警，历史问题未在本次处理范围）。
- 命令：`pnpm -C apps/admin lint:arch`
  - 结果：通过。
- 命令：`pnpm -C apps/docs lint`
  - 结果：通过。
- 命令：`pnpm -C apps/docs build`
  - 结果：通过。
- 提交后复验：
  - `pnpm -C apps/admin test:run:file -- src/modules/UserManagement/org/utils/managerDelta.unit.test.ts`：通过。
  - `pnpm -C apps/admin typecheck`：通过。
  - `pnpm -C apps/admin lint`：通过（仍有 1 条 `max-lines` warning）。
  - `pnpm -C apps/docs lint`：通过。
  - `pnpm -C apps/docs build`：通过。

## 2026-03-20（UserManagement 规范文档同步）

- 命令：`pnpm -C apps/docs lint`
  - 结果：通过。
- 命令：`pnpm -C apps/docs build`
  - 结果：通过。

## 2026-03-20（UserManagement 第二批收敛：props 驱动初始化 + 影子状态删除）

- RED：
  - `pnpm -C apps/admin test:run -- --reporter=dot src/modules/UserManagement/role-assign/components/RoleAssignMemberSelectForm.unit.test.ts src/modules/UserManagement/user/components/UserBindAccountForm.unit.test.ts src/modules/UserManagement/role-assign/composables/useRoleAssignPageState.unit.test.ts src/modules/UserManagement/user/composables/useUserDialogState.unit.test.ts src/modules/UserManagement/user/composables/useUserCrudState.unit.test.ts`
  - 结果：失败，命中预期改造点：
    - `RoleAssignMemberSelectForm` 仍暴露 `loadRootNodes/setSelectedUsers`
    - `UserBindAccountForm` 仍缺少 `initialSelectedUsers` 驱动回填
    - `useUserDialogState` / `useUserCrudState` 契约尚未收敛
- GREEN / 回归：
  - `pnpm -C apps/admin test:run -- --reporter=dot src/modules/UserManagement/role-assign/components/RoleAssignMemberSelectForm.unit.test.ts src/modules/UserManagement/user/components/UserBindAccountForm.unit.test.ts src/modules/UserManagement/role-assign/composables/useRoleAssignPageState.unit.test.ts src/modules/UserManagement/user/composables/useUserDialogState.unit.test.ts src/modules/UserManagement/user/composables/useUserCrudState.unit.test.ts`
  - `pnpm -C apps/admin test:run -- --reporter=dot src/modules/UserManagement`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin lint:arch`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - 全部通过。
  - `apps/admin lint` 仍有 1 条 warning：`src/modules/UserManagement/role-assign/composables/useRoleAssignPageState.ts` `eslint(max-lines)`，属于已知存量问题，本轮未继续做结构拆分。

## 2026-03-20（role-assign 第三批收敛：页面编排继续瘦身）

- RED：
  - `pnpm -C apps/admin test:run -- --reporter=dot src/modules/UserManagement/role-assign/composables/useRoleAssignRoleSidebar.unit.test.ts src/modules/UserManagement/role-assign/composables/useRoleAssignMemberTable.unit.test.ts`
  - 结果：失败，原因符合预期：`useRoleAssignRoleSidebar.ts`、`useRoleAssignMemberTable.ts` 文件尚不存在。
- GREEN / 回归：
  - `pnpm -C apps/admin test:run -- --reporter=dot src/modules/UserManagement/role-assign/composables/useRoleAssignRoleSidebar.unit.test.ts src/modules/UserManagement/role-assign/composables/useRoleAssignMemberTable.unit.test.ts src/modules/UserManagement/role-assign/composables/useRoleAssignPageState.unit.test.ts`
  - `pnpm -C apps/admin test:run -- --reporter=dot src/modules/UserManagement`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin lint:arch`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - 全部通过。
  - `apps/admin lint` 0 warning / 0 error，`useRoleAssignPageState.ts max-lines` 告警已消失。

## 2026-03-20（UserManagement 第二批可读性收敛）

- 命令：`pnpm -C apps/admin test:run -- --reporter=dot src/modules/UserManagement/role-assign/components/RoleAssignMemberSelectForm.unit.test.ts src/modules/UserManagement/role-assign/composables/useRoleAssignPageState.unit.test.ts src/modules/UserManagement/user/components/UserBindAccountForm.unit.test.ts src/modules/UserManagement/user/composables/useUserDialogState.unit.test.ts src/modules/UserManagement/user/composables/useUserCrudState.unit.test.ts`
  - 结果：通过（26 files / 83 tests）。
- 命令：`pnpm -C apps/admin test:run -- --reporter=dot src/modules/UserManagement`
  - 结果：通过（26 files / 83 tests）。
- 命令：`pnpm -C apps/admin typecheck`
  - 结果：通过。
- 命令：`pnpm -C apps/admin lint`
  - 结果：通过（0 warning / 0 error）。
- 命令：`pnpm -C apps/admin lint:arch`
  - 结果：通过。
- 命令：`pnpm -C apps/admin build`
  - 结果：通过。
- 命令：`pnpm -C apps/docs lint`
  - 结果：通过。
- 命令：`pnpm -C apps/docs build`
  - 结果：通过。

## 2026-03-20（UserManagement 第二批收敛：并行优化落地）

- 命令：`pnpm -C apps/admin test:run -- --reporter=dot src/modules/UserManagement`
  - 结果：通过（26 files / 83 tests）。
- 命令：`pnpm -C apps/admin typecheck`
  - 结果：通过。
- 命令：`pnpm -C apps/admin lint`
  - 结果：通过（0 warning / 0 error）。
- 命令：`pnpm -C apps/admin lint:arch`
  - 结果：通过。
- 命令：`pnpm -C apps/docs lint`
  - 结果：通过。
- 命令：`pnpm -C apps/docs build`
  - 结果：通过。
- 命令：`pnpm -C apps/admin build`
  - 结果：通过。
- 提交后复验：
  - `pnpm -C apps/admin test:run -- --reporter=dot src/modules/UserManagement`：通过（26 files / 83 tests）。
  - `pnpm -C apps/admin typecheck`：通过。
  - `pnpm -C apps/docs build`：通过。

## 2026-03-23（UserManagement CR 修复收口）

- RED：
  - `pnpm -C apps/admin test:run:file -- src/modules/UserManagement/user/composables/useUserDialogState.unit.test.ts src/modules/UserManagement/user/components/UserBindAccountForm.unit.test.ts`
  - 结果：失败，命中预期改造点：
    - `fetchBindUsers` 仍直接抛错，没有在弹窗状态层兜底提示并返回空数组。
    - `UserBindAccountForm` 仍在搜索失败时直接调用全局 `message.error`。
- GREEN / 回归：
  - `pnpm -C apps/admin test:run:file -- src/modules/UserManagement/user/composables/useUserDialogState.unit.test.ts src/modules/UserManagement/user/components/UserBindAccountForm.unit.test.ts`
  - 结果：先失败后转绿，命中 reviewer 新发现的竞态风险：
    - `handleBindSearchError` 缺失。
    - 旧搜索请求失败仍可能越过 token 保护触发全局错误。
  - `pnpm -C apps/admin test:run:file -- src/modules/UserManagement/role-assign/components/RoleAssignMemberSelectForm.unit.test.ts src/modules/UserManagement/role-assign/composables/useRoleAssignPageState.unit.test.ts src/modules/UserManagement/role-assign/composables/useRoleAssignRoleSidebar.unit.test.ts src/modules/UserManagement/role-assign/composables/useRoleAssignMemberDialog.unit.test.ts src/modules/UserManagement/user/composables/useUserCrudState.unit.test.ts src/modules/UserManagement/user/composables/useUserDialogState.unit.test.ts src/modules/UserManagement/user/composables/useUserDialogState.integration.unit.test.ts src/modules/UserManagement/user/components/UserBindAccountForm.unit.test.ts`
  - 结果：通过（8 files / 20 tests）。
- 门禁：
  - `pnpm -C apps/admin typecheck`
  - 结果：通过。
  - `pnpm -C apps/admin lint:arch`
  - 结果：通过。
  - `pnpm -C apps/admin lint`
  - 结果：通过（0 warning / 0 error）。
  - `pnpm -C apps/admin build`
  - 结果：通过。
  - `pnpm check:admin:bundle`
  - 结果：通过。
  - `pnpm -C apps/docs lint`
  - 结果：通过。
  - `pnpm -C apps/docs build`
  - 结果：通过。
- 提交后复验（commit `751f24a`）：
  - `pnpm -C apps/admin test:run:file -- src/modules/UserManagement/role-assign/components/RoleAssignMemberSelectForm.unit.test.ts src/modules/UserManagement/role-assign/composables/useRoleAssignPageState.unit.test.ts src/modules/UserManagement/role-assign/composables/useRoleAssignRoleSidebar.unit.test.ts src/modules/UserManagement/role-assign/composables/useRoleAssignMemberDialog.unit.test.ts src/modules/UserManagement/user/composables/useUserCrudState.unit.test.ts src/modules/UserManagement/user/composables/useUserDialogState.unit.test.ts src/modules/UserManagement/user/composables/useUserDialogState.integration.unit.test.ts src/modules/UserManagement/user/components/UserBindAccountForm.unit.test.ts`
  - 结果：通过（8 files / 18 tests）。
  - `pnpm -C apps/admin typecheck`
  - 结果：通过。
  - `pnpm -C apps/admin lint:arch`
  - 结果：通过。
  - `pnpm -C apps/admin lint`
  - 结果：通过（0 warning / 0 error）。
  - `pnpm -C apps/admin build`
  - 结果：通过。
  - `pnpm check:admin:bundle`
  - 结果：通过。
  - `pnpm -C apps/docs lint`
  - 结果：通过。
  - `pnpm -C apps/docs build`
  - 结果：通过。

## 2026-03-23（admin-management-standardizer skill 设计与落地）

- 命令：`python3 /Users/haoqiuzhi/.codex/skills/.system/skill-creator/scripts/quick_validate.py .codex/skills/admin-management-standardizer`
  - 结果：通过（Skill is valid!）。
- 命令：`pnpm -C apps/docs lint`
  - 结果：通过（0 warning / 0 error）。
- 命令：`pnpm -C apps/docs build`
  - 结果：通过（build complete in 4.42s）。
- 提交后复验（commit `e40b6fe`）：
  - `python3 /Users/haoqiuzhi/.codex/skills/.system/skill-creator/scripts/quick_validate.py .codex/skills/admin-management-standardizer`
    - 结果：通过（Skill is valid!）。
  - `pnpm -C apps/docs lint`
    - 结果：通过（0 warning / 0 error）。
  - `pnpm -C apps/docs build`
    - 结果：通过（build complete in 4.94s）。

## 2026-03-23（补提 UserManagement 收口改动）

- 命令：`pnpm -C apps/admin test:run:file -- src/modules/UserManagement/role-assign/composables/useRoleAssignMemberDialog.unit.test.ts src/modules/UserManagement/user/components/UserBindAccountForm.unit.test.ts src/modules/UserManagement/user/composables/useUserDialogState.unit.test.ts`
  - 结果：通过（3 files / 8 tests）。
- 命令：`pnpm -C apps/admin typecheck`
  - 结果：通过。
- 命令：`pnpm -C apps/admin lint:arch`
  - 结果：通过。
- 命令：`pnpm -C apps/admin lint`
  - 结果：通过（0 warning / 0 error）。
- 命令：`pnpm -C apps/admin build`
  - 结果：通过。
- 命令：`pnpm check:admin:bundle`
  - 结果：通过。
- 命令：`pnpm -C apps/docs lint`
  - 结果：通过（0 warning / 0 error）。
- 命令：`pnpm -C apps/docs build`
  - 结果：通过（build complete in 4.29s）。

## 2026-03-23（LogManagement 首轮横向推广）

- 命令：`pnpm -C apps/admin test:run:file -- src/modules/LogManagement/shared/latestRequest.unit.test.ts`
  - 结果：RED 先失败（缺少 `latestRequest.ts`），GREEN 后通过（1 file / 2 tests）。
- 命令：`pnpm -C apps/admin typecheck`
  - 结果：通过。
- 命令：`pnpm -C apps/admin lint:arch`
  - 结果：通过。
- 命令：`pnpm -C apps/admin lint`
  - 结果：通过（0 warning / 0 error）。
- 命令：`pnpm -C apps/admin build`
  - 结果：通过。
- 命令：`pnpm check:admin:bundle`
  - 结果：通过。
- 命令：`pnpm -C apps/docs lint`
  - 结果：通过（0 warning / 0 error）。
- 命令：`pnpm -C apps/docs build`
  - 结果：通过。

## 2026-03-23（UserManagement 全模块横向推广）

- 命令：`pnpm -C apps/admin lint:arch`
  - 结果：通过。
- 命令：`pnpm -C apps/admin typecheck`
  - 结果：通过。
- 命令：`pnpm -C apps/admin lint`
  - 结果：通过（0 warning / 0 error）。
- 命令：`pnpm -C apps/admin build`
  - 结果：通过。
- 命令：`pnpm -C apps/docs lint`
  - 结果：通过（0 warning / 0 error）。
- 命令：`pnpm -C apps/docs build`
  - 结果：通过。

## 2026-03-23（SystemManagement + CmsManagement 首轮并行横向推广）

- 命令：`pnpm -C apps/admin typecheck`
  - 结果：通过。
- 命令：`pnpm -C apps/admin lint:arch`
  - 结果：通过。
- 命令：`pnpm -C apps/admin lint`
  - 结果：通过（0 warning / 0 error）。
- 命令：`pnpm -C apps/admin build`
  - 结果：通过。
- 命令：`pnpm check:admin:bundle`
  - 结果：通过。
- 命令：`pnpm -C apps/docs lint`
  - 结果：通过（0 warning / 0 error）。
- 命令：`pnpm -C apps/docs build`
  - 结果：通过。

## 2026-03-23（System + Cms 第二轮并行推广与 lint:arch 固化）

- 命令：`pnpm -C apps/admin typecheck`
  - 结果：通过。
- 命令：`pnpm -C apps/admin lint:arch`
  - 结果：通过。
- 命令：`pnpm -C apps/admin lint`
  - 结果：通过（0 error / 1 warning，`useDictPageState.ts` 触发 `max-lines` 历史结构性警告）。
- 命令：`pnpm -C apps/admin build`
  - 结果：通过。
- 命令：`pnpm check:admin:bundle`
  - 结果：通过。
- 命令：`pnpm -C apps/docs lint`
  - 结果：通过（0 warning / 0 error）。
- 命令：`pnpm -C apps/docs build`
  - 结果：通过。

## 2026-03-23（Task B：core 并发打开保护上提 + 页面冗余 guard 清理）

- RED：
  - 命令：`pnpm -C packages/core test:run src/hooks/useEntityEditor/index.test.ts`
  - 结果：失败。
  - 失败点：
    - `opening 中再次 open 不会覆盖当前打开流程` 超时，说明第二次 `open` 进入了新的打开流程；
    - `submitting 中再次 open 不会抢占当前编辑态` 断言失败，说明提交中仍可触发新的打开动作。
- GREEN：
  - 命令：`pnpm -C packages/core test:run src/hooks/useEntityEditor/index.test.ts`
  - 结果：通过（11/11）。
- 验证：
  - 命令：`pnpm -C packages/core test`
  - 结果：通过（14 文件，74 用例；控制台存在 `--localstorage-file` 运行时 warning，不影响通过）。
  - 命令：`pnpm -C packages/core typecheck`
  - 结果：通过。
  - 命令：`pnpm -C apps/admin typecheck`
  - 结果：通过。
  - 命令：`pnpm -C apps/admin lint:arch`
  - 结果：通过。

## 2026-03-23（Portal：basic 命名与 config 目录收敛）

- 首轮验证：
  - 命令：`pnpm -C apps/portal typecheck`
  - 结果：失败。
  - 失败点：`apps/portal/src/bootstrap/adapter.ts` 仍引用不存在的 `createSczfwAdapter` 导出。
  - 命令：`pnpm -C apps/portal lint`
  - 结果：通过（0 warning / 0 error）。
  - 命令：`pnpm -C apps/portal build`
  - 结果：失败。
  - 失败点：与 `typecheck` 一致，构建期报 `createSczfwAdapter` 缺失导出。
- 修复后复验：
  - 命令：`pnpm -C apps/portal typecheck`
  - 结果：通过。
  - 命令：`pnpm -C apps/portal lint`
  - 结果：通过（0 warning / 0 error）。
  - 命令：`pnpm -C apps/portal build`
  - 结果：通过。

## 2026-03-23（CmsManagement/audit 并发门禁补齐 + 全量回归）

- 命令：`pnpm -C packages/core test`
  - 结果：通过（14 files / 74 tests，存在 `--localstorage-file` warning，不影响通过）。
- 命令：`pnpm -C packages/core typecheck`
  - 结果：通过。
- 命令：`pnpm -C packages/core lint`
  - 结果：通过（0 warning / 0 error）。
- 命令：`pnpm -C apps/admin typecheck`
  - 结果：通过。
- 命令：`pnpm -C apps/admin lint:arch`
  - 结果：通过。
- 命令：`pnpm -C apps/admin lint`
  - 结果：通过（0 warning / 0 error）。
- 命令：`pnpm -C apps/admin build`
  - 结果：通过。
- 命令：`pnpm check:admin:bundle`
  - 结果：通过。
- 命令：`pnpm -C apps/docs lint`
  - 结果：通过（0 warning / 0 error）。
- 命令：`pnpm -C apps/docs build`
  - 结果：通过（build complete in 8.34s）。

## 2026-03-23（P0+P1 并行锤炼：core + admin 基础层）

- 命令：`pnpm -C packages/core test`
  - 结果：通过（15 files / 81 tests，存在 `--localstorage-file` warning，不影响通过）。
- 命令：`pnpm -C packages/core typecheck`
  - 结果：通过。
- 命令：`pnpm -C packages/core lint`
  - 结果：通过（0 warning / 0 error）。
- 命令：`pnpm -C packages/core build`
  - 结果：通过。
- 命令：`pnpm -C apps/admin test:run`
  - 结果：通过（33 files / 104 tests，存在 `--localstorage-file` warning，不影响通过）。
- 命令：`pnpm -C apps/admin typecheck`
  - 结果：首次失败（`route-signature.unit.test.ts` 的 `RouteRecordRaw` 联合类型约束），修复后通过。
- 命令：`pnpm -C apps/admin lint:arch`
  - 结果：通过。
- 命令：`pnpm -C apps/admin lint`
  - 结果：通过（0 warning / 0 error）。
- 命令：`pnpm -C apps/admin build`
  - 结果：通过。
- 命令：`pnpm check:admin:bundle`
  - 结果：通过。
- 命令：`pnpm -C apps/docs lint`
  - 结果：通过（0 warning / 0 error）。
- 命令：`pnpm -C apps/docs build`
  - 结果：通过（先 8.16s，文档更新后复跑 5.57s）。

## 2026-03-23（basic 命名与目录收敛）

- 命令：
  - `pnpm -C packages/core test`
  - `pnpm -C packages/core typecheck`
  - `pnpm -C packages/core lint`
  - `pnpm -C packages/core build`
  - `pnpm -C packages/adapters typecheck`
  - `pnpm -C packages/adapters lint`
  - `pnpm -C packages/adapters build`
  - `pnpm -C apps/admin test:run`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint:arch`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/portal typecheck`
  - `pnpm -C apps/portal lint`
  - `pnpm -C apps/portal build`
  - `pnpm check:admin:bundle`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：除 `pnpm check:naming` 外，其余命令全部通过。
- 说明：`pnpm check:naming` 当前报出 24 处历史命名白名单问题（以 `assemble/normalize/resolve/execute` 等动词为主），未在本次改造范围内处理。

## 2026-03-23（admin 底层收敛追加）

- 命令：
  - `pnpm -C apps/admin test:run:file -- tests/config/basic/signature.unit.test.ts tests/router/route-assembly-diagnostics.unit.test.ts tests/bootstrap/route-dynamic-import-recovery.unit.test.ts tests/bootstrap/http.unit.test.ts tests/router/assemble-routes.unit.test.ts`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint:arch`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/portal typecheck`
  - `pnpm -C apps/portal lint`
  - `pnpm -C apps/portal build`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：全部通过。
- 追加命令：
  - `pnpm check:admin:bundle`
- 追加结果：通过（startup dependency map 与大 chunk 均在预算内）。

## 2026-03-24（P0 下沉：签名注入与动态导入恢复）

- 命令：
  - `pnpm -C packages/core test:run`
  - `pnpm -C packages/core typecheck`
  - `pnpm -C packages/core lint`
  - `pnpm -C packages/core build`
  - `pnpm -C apps/admin test:run`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint:arch`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin build`
  - `pnpm check:admin:bundle`
  - `pnpm -C apps/portal typecheck`
  - `pnpm -C apps/portal lint`
  - `pnpm -C apps/portal build`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：全部通过。

## 2026-03-24（横向推广首轮：命名清零 + 签名单实现源 + portal 动态恢复）

- 命名与 core 门禁：
  - `pnpm check:naming`：通过
  - `pnpm -C packages/core test:run`：通过（`18/18` 文件，`89/89` 用例）
  - `pnpm -C packages/core lint`：通过
  - `pnpm -C packages/core typecheck`：首次失败（`client-signature.test.ts` 的 `Buffer` 类型与数组可选项），修复后复跑通过
- admin：
  - `pnpm -C apps/admin test:run`：通过（`35/35` 文件，`108/108` 用例）
  - `pnpm -C apps/admin typecheck`：通过
  - `pnpm -C apps/admin lint:arch`：通过
  - `pnpm -C apps/admin lint`：通过
  - `pnpm -C apps/admin build`：通过
  - `pnpm check:admin:bundle`：通过（chunk 与 startup 预算均 PASS）
- portal：
  - `pnpm -C apps/portal typecheck`：通过
  - `pnpm -C apps/portal lint`：通过
  - `pnpm -C apps/portal build`：通过
- docs：
  - `pnpm -C apps/docs lint`：通过
  - `pnpm -C apps/docs build`：通过

## 2026-03-24（Tailwind 约束：better-tailwindcss 接入）

- 命令：
  - `pnpm lint`
  - `pnpm typecheck`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
  - `pnpm exec vp lint .codex/tmp/better-tailwindcss-smoke.ts`（临时烟测文件，验证后已删除）
- 结果：
  - `pnpm lint` 通过。
  - `pnpm typecheck` 通过。
  - `apps/docs` lint/build 通过。
  - 烟测命中 `better-tailwindcss/no-duplicate-classes`（warning），证明规则已生效。

## 2026-03-24（第二轮：架构门禁化 + core 下沉）

- P0 门禁：
  - `pnpm check:naming`：通过
  - `pnpm check:basic-signature`：通过
  - `pnpm lint:arch`：通过（含 `check:basic-signature`）
- core：
  - `pnpm -C packages/core test:run`：通过（`22/22` 文件，`101/101` 用例）
  - `pnpm -C packages/core typecheck`：通过
  - `pnpm -C packages/core lint`：通过
- admin：
  - `pnpm -C apps/admin test:run`：通过（`34/34` 文件，`98/98` 用例，含 `tests/architecture`）
  - `pnpm -C apps/admin typecheck`：通过
  - `pnpm -C apps/admin lint:arch`：通过
  - `pnpm -C apps/admin lint`：通过
  - `pnpm -C apps/admin build`：通过
  - `pnpm check:admin:bundle`：通过
- portal：
  - `pnpm -C apps/portal typecheck`：通过
  - `pnpm -C apps/portal lint`：通过
  - `pnpm -C apps/portal build`：通过
- docs：
  - `pnpm -C apps/docs lint`：通过
  - `pnpm -C apps/docs build`：通过

## 2026-03-24（命名豁免治理：checkCaptcha 去豁免）

- 命令：
  - `pnpm check:naming`
  - `pnpm lint:arch`
  - `pnpm -C apps/portal typecheck`
  - `pnpm -C apps/portal lint`
  - `pnpm -C apps/portal build`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：全部通过。

## 2026-03-24（1+2 并行：命名配置 schema 门禁 + admin 命名横向收敛）

- 命令：
  - `pnpm check:naming:config`
  - `pnpm check:naming`
  - `pnpm lint:arch`
  - `pnpm -C apps/admin test:run:file -- src/modules/UserManagement/user/composables/useUserDialogState.unit.test.ts src/modules/UserManagement/user/composables/useUserDialogState.integration.unit.test.ts src/modules/UserManagement/role-assign/composables/useRoleAssignPageState.unit.test.ts`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：全部通过。

## 2026-03-24（admin 收敛：rich-text 沉淀 + PureTableCompat 退场）

- 命令：
  - `pnpm -C apps/admin test:run:file -- src/components/rich-text/rich-text-html.unit.test.ts`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin build`
  - `pnpm check:naming`
  - `pnpm lint:arch`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：全部通过。

## 2026-03-24（admin 配置目录收敛：config 纯化 + logger/security 迁移）

- TDD 红灯（先改测试再改实现）：
  - `pnpm -C apps/admin test:run:file -- tests/router/registry.unit.test.ts tests/bootstrap/http.unit.test.ts tests/config/basic/signature.unit.test.ts tests/utils/table-response-adapter.unit.test.ts src/modules/UserManagement/user/composables/useUserDialogState.unit.test.ts src/modules/UserManagement/user/composables/useUserDialogState.integration.unit.test.ts`
  - 结果：失败（预期）。失败原因包括新路径文件不存在、mock 路径未命中。
- TDD 绿灯（完成迁移后复跑同批用例）：
  - `pnpm -C apps/admin test:run:file -- tests/router/registry.unit.test.ts tests/bootstrap/http.unit.test.ts tests/config/basic/signature.unit.test.ts tests/utils/table-response-adapter.unit.test.ts src/modules/UserManagement/user/composables/useUserDialogState.unit.test.ts src/modules/UserManagement/user/composables/useUserDialogState.integration.unit.test.ts`
  - 结果：通过（`6/6` 文件，`15/15` 用例）。
- 全量回归：
  - `pnpm -C apps/admin test:run`：通过（`36/36` 文件，`104/104` 用例）。
  - `pnpm -C apps/admin typecheck`：通过。
  - `pnpm -C apps/admin lint:arch`：通过。
  - `pnpm -C apps/admin lint`：通过。
  - `pnpm -C apps/admin build`：通过。
  - `pnpm -C apps/docs lint`：通过。
  - `pnpm -C apps/docs build`：通过。

## 2026-03-24（admin 丝滑度首轮：首屏骨架 + 富文本按需加载）

- 命令：
  - `pnpm -C packages/ui typecheck`
  - `pnpm -C packages/ui lint`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin build`
  - `pnpm check:naming`
  - `pnpm lint:arch`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：全部通过。

## 2026-03-24（admin 去运行时配置）

- RED -> GREEN（先改测试后实现）：
  - `pnpm -C apps/admin test:run:file -- tests/bootstrap/startup.unit.test.ts tests/config/env.unit.test.ts tests/config/platform-config.unit.test.ts`
  - 结果：通过（3 files / 7 tests）。
- 全量回归：
  - `pnpm -C apps/admin test:run`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint:arch`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：全部通过。

## 2026-03-24（apps/portal 渲染端壳层对齐 V1）

- 命令：
  - `pnpm -C apps/portal typecheck`
  - `pnpm -C apps/portal lint`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/portal build`
  - `pnpm -C apps/docs build`
- 结果：全部通过。

## 2026-03-24（admin oxfmt Tailwind 排序配置）

- 命令：
  - `pnpm -C apps/admin exec vp fmt --check oxfmt.config.ts vite.config.ts`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：全部通过。

## 2026-03-24（admin build 统一导出 + plugins 抽离）

- 命令：
  - `pnpm exec vp fmt --check vite.config.ts oxfmt.config.ts build/*.ts`（workdir: `apps/admin`）
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：全部通过。

## 2026-03-24（.codex 缓存清理 + verification 分档）

- 命令：
  - `du -sh .codex/* | sort -h`（清理前后体积核对）
  - `node -e "fs.rmSync(..., { recursive: true, force: true })"`（清理缓存目录）
  - `perl -0777 ...`（提取 `verification.md` 中 `2026-03-24` 段落到按日文件）
- 结果：执行成功。

## 2026-03-24（.codex 截图快照清理）

- 命令：
  - `find .codex -maxdepth 1 -type f \( -name '*.png' -o -name '*.jpg' -o -name '*.jpeg' -o -name '*.webp' \)`
  - `node -e "...unlinkSync(...)"`
- 结果：截图快照文件已删除。

## 2026-03-24（apps/docs 角色分层与兼容页收敛）

- 命令：
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
  - `rg -n "/guide/portal-designer|/guide/portal-engine" apps/docs/docs -g '*.md'`
- 结果：
  - lint：通过（0 warnings / 0 errors）
  - build：通过（vitepress build complete）
  - 引用检查：旧入口仅出现在兼容说明页/历史说明语境

## 2026-03-24（apps/docs 去兼容化：移除 portal 旧入口页）

- 命令：
  - `rg -n "/guide/portal-designer|/guide/portal-engine|兼容入口|下线计划" apps/docs/docs -g '*.md'`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - 引用扫描：无残留命中
  - lint：通过（0 warnings / 0 errors）
  - build：通过（vitepress build complete）

## 2026-03-24（docs 升级到 VitePress v2 并重构导航）

- 命令：
  - `pnpm -C apps/docs dev`（启动验证）
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - dev：启动成功（`vitepress v2.0.0-alpha.17`）
  - lint：通过（0 warnings / 0 errors）
  - build：通过（vitepress build complete）
- 关键现象：
  - 不再出现 `VitePress v1 is not compatible with rolldown-vite` 提示。
  - 不再复现 `Failed to resolve "/@localSearchIndex"` 构建链路错误。

## 2026-03-24（apps/docs 侧边栏按模块命中）

- 命令：
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - lint：通过（0 warnings / 0 errors）
  - build：通过（vitepress build complete）

## 2026-03-24（docs 暗色可读性与风格优化）

- 命令：
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - `lint`：通过（0 warning / 0 error）
  - `build`：通过（`vitepress v2.0.0-alpha.17`，pages 渲染完成）

## 2026-03-24（docs 移除模块切换导航）

- 命令：
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - lint：通过（0 warning / 0 error）
  - build：通过（vitepress build complete）

## 2026-03-24（docs 角色走查整改）

- 命令：
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
  - `node scripts/new-module.mjs doc-audit-demo --dry-run`
- 结果：
  - `lint`：通过（0 warning / 0 error）
  - `build`：通过（vitepress build complete）
  - `new-module --dry-run`：输出包含 `manifest.ts + module.ts + routes.ts` 的目标结构

## 2026-03-24（docs 环境变量表格化 + 架构图可读性收敛）

- 命令：
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - `lint`：通过（0 warning / 0 error）
  - `build`：通过（vitepress v2.0.0-alpha.17，build complete）

## 2026-03-24（docs Mermaid -> SVG 全量替换）

- 命令：
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - `lint`：通过（0 warning / 0 error）
  - `build`：通过（vitepress v2.0.0-alpha.17，build complete）

## 2026-03-24（admin 403/404 保留 Layout + 404 通配 push）

- 命令：
  - `pnpm -C packages/core typecheck`
  - `pnpm -C packages/core test:run`
  - `pnpm -C packages/core lint`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - 全部通过。
  - `packages/core` 单测：`22` 个文件、`101` 条用例通过。

## 2026-03-24（admin 字典服务：快速应用 + 缓存）

- 命令：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin test:run:file -- src/services/dict/dict-resource-service.unit.test.ts`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - `typecheck`：通过。
  - `lint`：通过（0 warnings / 0 errors）。
  - 定向单测：通过（`1` 个文件、`7` 条用例）。
  - docs `lint`：通过（0 warnings / 0 errors）。
  - docs `build`：通过（vitepress build complete）。
- 备注：定向单测输出存在 Node `--localstorage-file` 警告，不影响本次用例通过与功能验证结论。

## 2026-03-24（admin 顶栏租户切换 + 个人中心 + 头像裁剪）

- 命令：
  - `pnpm -C packages/ui typecheck`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C packages/ui lint`
  - `pnpm -C apps/admin lint`
  - `pnpm -C packages/ui build`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - 上述命令全部通过。
  - 期间修复 1 个 typecheck 问题（`ChangePasswordDialog` 旧密码校验器 async 类型不匹配）。
  - 期间修复 1 个 lint 告警（`AvatarCropDialog` 的 `sourceFile` 必填声明与默认值冲突）。

## 2026-03-24（头像裁剪替换为 cropperjs 插件）

- 命令：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs build`
- 结果：
  - 全部通过。

## 2026-03-24（admin 顶栏头像样式 + 清空头像）

- 命令：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - `typecheck` 失败（非本次改动引入）：`src/modules/PortalManagement/materialManagement/api.ts:69` 的 `ProgressEvent` 与 `AxiosProgressEvent` 类型不兼容。
  - `lint` 通过（存在 1 条历史 warning：`material-helpers.ts` 的 `no-useless-fallback-in-spread`）。
  - `build` 通过。
  - `apps/docs` lint/build 通过。

## 2026-03-24（PortalManagement 素材管理模块迁移 + 性能优化）

- 命令：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin lint:arch`
  - `pnpm -C apps/admin test:run:file -- src/modules/PortalManagement/materialManagement/composables/material-performance.unit.test.ts`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - `typecheck`：通过。
  - `lint`：通过（0 warnings / 0 errors）。
  - `lint:arch`：通过（admin 架构边界检查通过）。
  - 定向单测：通过（`1` 个文件、`3` 条用例）。
  - `build`：通过（vite build complete）。
  - docs `lint`：通过（0 warnings / 0 errors）。
  - docs `build`：通过（vitepress build complete）。

## 2026-03-24（adminManagement 重命名 + 租户模块迁移）

- 命令：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - `typecheck`：通过。
  - `lint`：通过（0 warnings / 0 errors）。
  - `build`：通过（vite build complete）。
  - docs `lint`：通过（0 warnings / 0 errors）。
  - docs `build`：通过（vitepress build complete）。

## 2026-03-24（租户信息/租户管理员走查修正）

- 命令：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin build`
- 结果：
  - `typecheck`：通过。
  - `lint`：通过（0 warnings / 0 errors）。
  - `build`：通过（vite build complete）。

## 2026-03-24（PortalManagement 素材管理 UI 美化）

- 命令：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - `typecheck`：通过。
  - `lint`：通过（0 warnings / 0 errors）。
  - `build`：通过（vite build complete）。
  - docs `lint`：通过（0 warnings / 0 errors）。
  - docs `build`：通过（vitepress build complete）。

## 2026-03-24（退出容错 + 网络异常全局提示）

- 命令：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin build`
- 结果：
  - `typecheck`：通过。
  - `lint`：通过（0 warnings / 0 errors）。
  - `build`：通过（vite build complete）。

## 2026-03-24（素材管理风格一致性回归 + 轻量性能优化）

- 命令：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin build`
- 结果：
  - `typecheck`：通过。
  - `lint`：通过（0 warnings / 0 errors）。
  - `build`：通过（vite build complete）。

## 2026-03-24（登录阶段反馈优化：验证码与菜单加载可感知）

- 命令：
  - `pnpm -C packages/ui typecheck`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C packages/ui lint`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - `packages/ui typecheck`：通过。
  - `apps/admin typecheck`：通过。
  - `packages/ui lint`：通过（0 warnings / 0 errors）。
  - `apps/admin lint`：通过（0 warnings / 0 errors）。
  - `apps/admin build`：通过（vite build complete）。
  - `apps/docs lint`：通过（0 warnings / 0 errors）。
  - `apps/docs build`：通过（vitepress build complete）。

## 2026-03-24（admin 错误提示收敛：去重 + message 统一）

- 命令：
  - `pnpm -C apps/admin test:run:file -- tests/bootstrap/http.unit.test.ts`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - 定向单测首次失败（测试输入不是 `Error` 实例，导致未命中 `ObBizError` 过滤），修正用例后复跑通过（`1` 文件，`5` 用例）。
  - `apps/admin`：`typecheck/lint/build` 全部通过。
  - `apps/docs`：`lint/build` 全部通过。

## 2026-03-24（提交后复验补充）

- 命令：
  - `pnpm -C apps/admin test:run:file -- tests/bootstrap/http.unit.test.ts`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
- 结果：
  - `test:run:file`：通过。
  - `typecheck`：通过。
  - `lint`：失败（命中 `apps/admin/public/material-image-cache-sw.js` 的全局变量 `self/caches/fetch/URL/Response` 未定义）。
- 说明：上述 service worker 相关文件为工作区内非本次任务改动，已暂停处理并等待用户确认。

## 2026-03-24（PortalManagement 素材图片 Service Worker 缓存）

- 命令：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - `typecheck`：通过。
  - `lint`：通过（0 warnings / 0 errors）。
  - `build`：通过（vite build complete）。
  - docs `lint`：通过（0 warnings / 0 errors）。
  - docs `build`：通过（vitepress build complete）。

## 2026-03-24（adminManagement 模块走查）

- 命令：
  - `pnpm -C apps/admin lint:arch`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin test:run`
  - `pnpm -C apps/admin test:run:file -- src/modules/adminManagement/shared/keywordSearch.unit.test.ts`
  - `pnpm -C apps/admin test:run:file -- src/modules/adminManagement/org/utils/managerDelta.unit.test.ts`
  - `pnpm -C apps/admin test:run:file -- src/modules/adminManagement/user/composables/useUserCrudState.unit.test.ts`
  - `pnpm -C apps/admin test:run:file -- src/modules/adminManagement/role-assign/composables/useRoleAssignPageState.unit.test.ts`
- 结果：
  - `typecheck`：通过。
  - `lint:arch`：失败，但失败点位于 `apps/admin/src/bootstrap/material-image-service-worker.ts`，不在本次 `adminManagement` 走查范围。
  - `test:run`：未按文件列表收窄，跑出 1 个仓库级失败用例：`tests/router/assemble-routes.unit.test.ts > 应保留公共固定路由`，不在本模块范围。
  - 4 条 `adminManagement` 定向单测均通过。

## 2026-03-24（素材管理并行改造：ObPageContainer + ObCardTable）

- 命令：
  - `pnpm -C packages/ui typecheck`
  - `pnpm -C packages/ui lint`
  - `pnpm -C packages/ui build`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - 上述命令全部通过。
  - `packages/ui` 新增 `CardTable` 后未引入 lint/typecheck/build 回归。
  - `apps/admin` 素材管理页面改造后 typecheck/lint/build 通过。
  - docs lint/build 通过。

## 2026-03-24（素材管理样式回收：白底 + 分页贴底）

- 命令：
  - `pnpm -C packages/ui typecheck`
  - `pnpm -C packages/ui lint`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin build`
- 结果：
  - 全部通过。

## 2026-03-24（role-assign 选人契约收口）

- 命令：`pnpm -C apps/admin test:run:file -- src/modules/adminManagement/role-assign/components/RoleAssignMemberSelectForm.unit.test.ts src/components/PersonnelSelector/PersonnelSelector.unit.test.ts src/modules/adminManagement/role-assign/composables/useRoleAssignPageState.unit.test.ts`
  - 结果：通过（3 files / 7 tests，存在 Node `--localstorage-file` warning，不影响结论）。
- 命令：`pnpm -C apps/admin typecheck`
  - 结果：通过。

## 2026-03-24（adminManagement 走查整改落地）

- 命令：
  - `pnpm -C apps/admin test:run:file -- src/modules/adminManagement/tenant-info/utils/tenantUnique.unit.test.ts`
  - `pnpm -C apps/admin test:run:file -- src/modules/adminManagement/role/components/RolePermissionDialog.unit.test.ts`
  - `pnpm -C apps/admin test:run:file -- src/modules/adminManagement/role-assign/components/RoleAssignMemberSelectForm.unit.test.ts`
  - `pnpm -C apps/admin test:run:file -- src/components/PersonnelSelector/PersonnelSelector.unit.test.ts`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/admin lint:arch`
- 结果：
  - `tenantUnique.unit.test.ts`：通过（1 file / 3 tests）。
  - `RolePermissionDialog.unit.test.ts`：通过（1 file / 1 test，存在 Node `--localstorage-file` warning，不影响结论）。
  - `RoleAssignMemberSelectForm.unit.test.ts`：通过（1 file / 2 tests，存在 Node `--localstorage-file` warning，不影响结论）。
  - `PersonnelSelector.unit.test.ts`：通过（1 file / 3 tests，存在 Node `--localstorage-file` warning，不影响结论）。
  - `typecheck`：通过。
  - `lint`：通过（0 warnings / 0 errors）。
  - `build`：通过（vite build success）。
  - `lint:arch`：失败，但失败点仍位于 `apps/admin/src/bootstrap/material-image-service-worker.ts` 的 `import.meta.env` 直读，不在本次 `adminManagement` 改动范围。
  - 提交 `0397dc3` 后复验：
    - `pnpm -C apps/admin typecheck`：通过。
    - `pnpm -C apps/admin lint`：通过（0 warnings / 0 errors）。
    - `pnpm -C apps/admin build`：通过。
    - `pnpm -C apps/admin test:run:file -- src/modules/adminManagement/tenant-info/utils/tenantUnique.unit.test.ts src/modules/adminManagement/role/components/RolePermissionDialog.unit.test.ts`：通过（2 files / 4 tests）。

## 2026-03-24（素材分类简约化 + loading 蒙层透明强化）

- 命令：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin exec vp lint src/modules/PortalManagement/materialManagement/list.vue src/modules/PortalManagement/materialManagement/components/MaterialCategoryDialog.vue src/styles/element-plus/loading-overrides.css`
  - `pnpm -C apps/admin build`
- 结果：
  - `typecheck`：通过。
  - `lint`：失败（与本次改动无关）：`src/modules/adminManagement/role/components/RolePermissionDialog.unit.test.ts` 的 `no-useless-escape`。
  - 定向 lint（本次 3 个改动文件）：通过（0 warnings / 0 errors）。
  - `build`：失败（与本次改动无关）：`public/fonts/od-icons/iconfont.css` 缺失导致 copyfile ENOENT。

## 2026-03-24（adminManagement 走查整改收口）

- 命令：
  - `pnpm -C apps/admin test:run:file -- src/modules/adminManagement/tenant-info/utils/tenantUnique.unit.test.ts`
  - `pnpm -C apps/admin test:run:file -- src/modules/adminManagement/role/components/RolePermissionDialog.unit.test.ts`
  - `pnpm -C apps/admin test:run:file -- src/modules/adminManagement/role-assign/components/RoleAssignMemberSelectForm.unit.test.ts`
  - `pnpm -C apps/admin test:run:file -- src/components/PersonnelSelector/PersonnelSelector.unit.test.ts`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/admin lint:arch`
- 结果：
  - 4 条定向单测全部通过（共 `4 files / 9 tests`，其中部分命令存在 Node `--localstorage-file` warning，不影响结论）。
  - `typecheck`：通过。
  - `lint`：通过（0 warnings / 0 errors）。
  - `build`：通过（vite build complete）。
  - `lint:arch`：失败，但失败点仍是历史问题 `apps/admin/src/bootstrap/material-image-service-worker.ts` 直接使用 `import.meta.env`，不在本次 `adminManagement` 改动范围。

## 2026-03-24（全局规则：禁止过度防御性映射）

- 命令：
  - `pnpm -C apps/admin test:run:file -- src/modules/adminManagement/tenant-info/utils/tenantUnique.unit.test.ts`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - `tenantUnique.unit.test.ts`：通过（3 tests）。
  - `apps/admin typecheck`：通过。
  - `apps/admin lint`：通过（0 warnings / 0 errors）。
  - `apps/admin build`：通过。
  - `apps/docs lint`：通过（0 warnings / 0 errors）。
  - `apps/docs build`：通过。

## 2026-03-24（adminManagement 二轮收敛：清理过度防御性映射）

- 命令：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin build`
- 结果：
  - `typecheck`：通过。
  - `lint`：通过（0 warnings / 0 errors）。
  - `build`：通过。

## 2026-03-24（adminManagement 第三轮收口 + 二次走查）

- 命令：
  - `pnpm -C apps/admin test:run:file -- src/modules/adminManagement/tenant-info/components/TenantInfoPermissionDialog.unit.test.ts`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin build`
  - `pnpm check:admin:bundle`
  - `pnpm -C apps/admin lint:arch`
- 结果：
  - `TenantInfoPermissionDialog.unit.test.ts`：通过（`1 file / 3 tests`，存在 Node `--localstorage-file` warning，不影响结论）。
  - `typecheck`：通过。
  - `lint`：通过（0 warnings / 0 errors）。
  - `build`：通过。
  - `check:admin:bundle`：通过（chunk 与启动依赖预算均在阈值内）。
  - `lint:arch`：失败，但失败点仍是历史问题 `apps/admin/src/bootstrap/material-image-service-worker.ts` 直接读取 `import.meta.env`，不在本轮 `adminManagement` 改动范围。

## 2026-03-25（adminManagement 终轮规则沉淀）

- 命令：
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - `apps/docs lint`：通过（0 warnings / 0 errors）。
  - `apps/docs build`：通过。

## 2026-03-25（PortalManagement 删除 designer 历史 alias）

- 命令：
  - `pnpm -C apps/admin test:run -- tests/router/assemble-routes.unit.test.ts`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - `assemble-routes.unit.test.ts`：通过（测试进程出现 `--localstorage-file` warning，不影响结论）。
  - `apps/docs lint`：通过（0 warnings / 0 errors）。
  - `apps/docs build`：通过。

## 2026-03-25（路由策略门禁 + meta 收敛 + 最小鉴权链路）

- 命令：
  - `pnpm -C packages/core test:run -- src/router/auth-minimal-e2e.unit.test.ts`
  - `pnpm -C apps/admin check:route-policy`
  - `pnpm -C apps/admin test:e2e:minimal-auth`
  - `pnpm -C . test:e2e:minimal-auth`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - 新增最小链路测试通过：
    - core：未登录受保护页 -> `/login`，已登录访问 `/login` -> 安全站内回跳。
    - admin：SSO 回调 `type+token` -> 会话落地并跳转目标页。
  - 路由策略门禁通过，产物已生成：`.codex/route-policy/admin-route-policy.json`。
  - `apps/admin lint/typecheck` 通过；lint 保留历史 `OrgManagerDialog.vue` 的 `max-lines` warning（非阻断）。
  - `apps/docs lint/build` 通过。

## 2026-03-25（登录路由板块稳定性/扩展性/性能收口）

- 命令：
  - `pnpm -C packages/core test:run -- src/stores/auth.test.ts src/router/guards.test.ts`
  - `pnpm -C apps/admin test:run -- tests/bootstrap/index.unit.test.ts`
  - `pnpm test:e2e:minimal-auth`
  - `pnpm -C packages/core typecheck`
  - `pnpm -C packages/core lint`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - 相关单测全部通过（core `109` 用例通过，admin bootstrap 与最小链路用例通过）。
  - `typecheck` 通过（core/admin）。
  - `apps/admin lint` 通过，保留历史 `OrgManagerDialog.vue` 的 `max-lines` warning（非阻断）。
  - `apps/docs lint/build` 通过。

## 2026-03-25（登录后访问 /login 仍可进入页：token 缺失会话探测修复）

- 命令：
  - `pnpm -C packages/core test:run -- src/stores/auth.test.ts`
  - `pnpm -C packages/core test:run -- src/stores/auth.test.ts src/router/guards.test.ts src/router/auth-minimal-e2e.unit.test.ts`
  - `pnpm -C apps/admin test:run -- tests/bootstrap/index.unit.test.ts`
  - `pnpm test:e2e:minimal-auth`
  - `pnpm -C packages/core typecheck`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - `packages/core` 相关测试通过（新增 token 缺失探测回归已覆盖）。
  - `apps/admin` bootstrap 单测通过。
  - `test:e2e:minimal-auth` 聚合链路通过（core + admin）。
  - `typecheck`（core/admin）通过。
  - `packages/core lint` 通过（0 warnings / 0 errors）。
  - `apps/admin lint` 通过，保留历史非阻断 warning：`OrgManagerDialog.vue` `max-lines`。
  - `apps/docs lint/build` 通过。

## 2026-03-25（登录路由二次收口：首次缺 token 一律会话探测）

- 命令：
  - `pnpm -C packages/core test:run -- src/stores/auth.test.ts src/router/guards.test.ts src/router/auth-minimal-e2e.unit.test.ts`
  - `pnpm test:e2e:minimal-auth`
  - `pnpm -C packages/core typecheck`
  - `pnpm -C packages/core lint`
  - `pnpm -C apps/admin test:run -- tests/bootstrap/index.unit.test.ts`
- 结果：
  - core 相关测试通过（`24 files / 112 tests`）。
  - `test:e2e:minimal-auth` 聚合链路通过。
  - `packages/core typecheck/lint` 通过。
  - admin bootstrap 单测通过。

## 2026-03-25（登录页入口兜底：已登录访问 /login 立即回跳）

- 命令：
  - `pnpm -C apps/admin test:run -- tests/architecture/login-route-robustness-source.unit.test.ts tests/bootstrap/index.unit.test.ts`
  - `pnpm test:e2e:minimal-auth`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
- 结果：
  - admin 定向测试通过（`50 files / 141 tests`）。
  - `test:e2e:minimal-auth` 通过（core/admin）。
  - `apps/admin typecheck` 通过。
  - `apps/admin lint` 通过，保留历史非阻断 warning：`OrgManagerDialog.vue` `max-lines`。

## 2026-03-25（按用户要求收口到全局守卫：/login 按 token 有无分支）

- 命令：
  - `pnpm -C packages/core test:run -- src/router/guards.test.ts src/router/auth-minimal-e2e.unit.test.ts`
  - `pnpm -C apps/admin test:run -- tests/architecture/login-route-robustness-source.unit.test.ts tests/bootstrap/index.unit.test.ts`
  - `pnpm test:e2e:minimal-auth`
  - `pnpm -C packages/core typecheck`
  - `pnpm -C packages/core lint`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - core/admin 相关测试通过。
  - `test:e2e:minimal-auth` 通过。
  - `typecheck/lint`（core/admin）通过；admin 保留历史非阻断 `max-lines` warning。
  - docs lint/build 通过。

## 2026-03-25（路由 access 模型重构：open/auth/menu）

- RED（先失败）：
  - `pnpm -C packages/core test:run -- src/menu/fromRoutes.test.ts`
  - `pnpm -C apps/admin test:run -- tests/bootstrap/index.unit.test.ts tests/bootstrap/http.unit.test.ts`
- GREEN（修复后回归）：
  - `pnpm -C packages/core test:run -- src/router/guards.test.ts src/router/fixed-routes.test.ts src/router/route-diagnostics.test.ts src/router/module-assembly.test.ts src/router/route-signature.test.ts src/menu/fromRoutes.test.ts`
  - `pnpm -C apps/admin test:run -- tests/router/assemble-routes.unit.test.ts tests/router/route-policy.unit.test.ts tests/bootstrap/index.unit.test.ts tests/bootstrap/http.unit.test.ts tests/services/auth/auth-scenario-provider.unit.test.ts tests/services/auth/sso-minimal-e2e.unit.test.ts`
  - `pnpm -w typecheck`
  - `pnpm -C packages/core build`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/docs build`
- 结果：
  - core 路由守卫、固定路由、静态菜单过滤回归全部通过。
  - admin 路由装配、路由策略、首屏守卫注册、401 回登录页回跳、登录/SSO 最小链路回归全部通过。
  - 全仓 `typecheck` 通过，`packages/core build`、`apps/admin build`、`apps/docs build` 通过。
  - 测试过程中存在 `--localstorage-file` warning，为测试环境提示，不影响结论。

## 2026-03-25（/sso 认证入口语义统一）

- 命令：
  - `pnpm -C packages/core test:run -- src/router/guards.test.ts src/router/auth-minimal-e2e.unit.test.ts`
  - `pnpm -C apps/admin test:run -- tests/services/auth/sso-minimal-e2e.unit.test.ts tests/bootstrap/index.unit.test.ts`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - `packages/core` 路由守卫相关测试通过（`25 files / 117 tests`）。
  - `apps/admin` 定向测试通过（`50 files / 141 tests`）。
  - `apps/admin build` 通过。
  - `apps/docs lint/build` 通过。
  - 测试过程中仍有 Node `--localstorage-file` warning，为测试环境提示，不影响结论。

## 2026-03-27（admin-legacy-migration-workflow skill 重写）

- 命令：
  - `python3 /Users/haoqiuzhi/.codex/skills/.system/skill-creator/scripts/generate_openai_yaml.py /Users/haoqiuzhi/code/one-base-template/.codex/skills/admin-legacy-migration-workflow --interface display_name='Admin Legacy Migration Workflow' --interface short_description='老项目 admin 迁移、规则收敛与验证统一工作流' --interface default_prompt='Use $admin-legacy-migration-workflow to migrate a legacy admin module into one-base-template with admin rules, CRUD baselines, and verification gates.'`
  - `python3 /Users/haoqiuzhi/.codex/skills/.system/skill-creator/scripts/quick_validate.py /Users/haoqiuzhi/code/one-base-template/.codex/skills/admin-legacy-migration-workflow`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs lint`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：
  - `generate_openai_yaml.py` 通过，已生成新 skill 的 `agents/openai.yaml`。
  - `quick_validate.py` 通过，输出 `Skill is valid!`。
  - `apps/docs lint` 通过，`0 warnings / 0 errors`。
  - `apps/docs build` 通过，VitePress 构建完成。

## 2026-03-27（crud-module-best-practice 文件名基线收口）

- 命令：
  - `python3 /Users/haoqiuzhi/.codex/skills/.system/skill-creator/scripts/quick_validate.py /Users/haoqiuzhi/code/one-base-template/.codex/skills/crud-module-best-practice`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs lint`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：
  - `crud-module-best-practice` 结构校验通过，输出 `Skill is valid!`。
  - `apps/docs lint` 通过，`0 warnings / 0 errors`。
  - `apps/docs build` 通过，VitePress 构建完成。

## 2026-03-27（docs/plans 历史命名注释化清扫）

- 命令：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs lint`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：
  - `apps/docs lint` 通过，`0 warnings / 0 errors`。
  - `apps/docs build` 通过，VitePress 构建完成。

## 2026-03-27（template 全量对齐与红线落地）

- 命令：
  - `pnpm -C apps/template typecheck`
  - `pnpm -C apps/template test:run`
  - `pnpm -C apps/template lint`
  - `pnpm -C apps/template lint:arch`
  - `pnpm -C apps/template build`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
  - `pnpm lint:arch`
- 结果：
  - template `typecheck/test/lint/lint:arch/build` 全部通过。
  - docs `lint/build` 通过。
  - 根 `lint:arch` 已验证串联 `admin + template + check:basic-signature`，全部通过。

## 2026-03-27（new app 脚手架）

- RED（先失败）：
  - `node --test scripts/__tests__/new-app.test.mjs`
  - `node --test scripts/__tests__/new-app.test.mjs scripts/__tests__/run-app-lint-arch.test.mjs`
  - 结果：失败，确认缺少 `scripts/new-app.mjs` 与 `scripts/run-app-lint-arch.mjs`，符合 TDD 预期。
- GREEN（脚本实现后回归）：
  - `node --test scripts/__tests__/new-app.test.mjs scripts/__tests__/run-app-lint-arch.test.mjs`
  - `pnpm new:app sample-app --dry-run`
  - `pnpm new:app sample-crud-app --with-crud-starter --dry-run`
  - `pnpm new:app sample-app`
  - `pnpm -C apps/sample-app typecheck`
  - `pnpm -C apps/sample-app lint`
  - `pnpm -C apps/sample-app lint:arch`
  - `pnpm -C apps/sample-app test:run`
  - `pnpm -C apps/sample-app build`
  - `pnpm new:app sample-crud-app --with-crud-starter`
  - `pnpm -C apps/sample-crud-app typecheck`
  - `pnpm -C apps/sample-crud-app lint`
  - `pnpm -C apps/sample-crud-app lint:arch`
  - `pnpm -C apps/sample-crud-app test:run`
  - `pnpm -C apps/sample-crud-app build`
  - `pnpm lint:arch`
- 结果：以上命令全部通过。
- 过程修复：
  - 首轮真实构建暴露了 `template` 文本替换过宽，误伤 Vue `<template>` 标签；已改为明确替换矩阵。
  - `starter-crud/api.ts` 首轮存在类型约束与未使用变量问题；修正后 `typecheck/lint/build` 已通过。

## 2026-03-27（zfw-system-sfss 快速使用手册）

- 命令：
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：全部通过。

## 2026-03-28（document-form-engine Univer 画布替换）

- RED（先失败）：
  - `pnpm -C packages/document-form-engine test:run -- tests/designer-canvas-bridge.test.ts`
    - 失败原因：缺少 `designer/canvas-bridge` 模块。
  - `pnpm -C packages/document-form-engine test:run -- tests/designer-state.test.ts`
    - 失败原因：`state.updateNodeAnchor is not a function`。
- GREEN（实现后回归）：
  - `pnpm -C packages/document-form-engine test:run -- tests/designer-canvas-bridge.test.ts`
  - `pnpm -C packages/document-form-engine test:run -- tests/designer-state.test.ts`
  - `pnpm -C packages/document-form-engine test:run -- tests/designer-canvas-bridge.test.ts tests/designer-state.test.ts`
  - `pnpm -C packages/document-form-engine test:run`
  - `pnpm -C packages/document-form-engine typecheck`
  - `pnpm -C packages/document-form-engine build`
  - `pnpm -C apps/admin typecheck`
- 文档验证：
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 其他记录：
  - `pnpm -C packages/document-form-engine lint` 当前因 `vite-plus` 解析配置异常失败：`callablePlugin.getOrder is not a function`。

## 2026-03-28（document-form-engine SheetSchema v2）

- RED（先失败）：
  - `pnpm -C packages/document-form-engine test:run -- tests/sheet-schema.test.ts`
  - 结果：3 个用例失败，失败点为 `version` 仍是 `1` 且缺少 `sheet`，符合预期。
- GREEN（实现后回归）：
  - `pnpm -C packages/document-form-engine test:run -- tests/sheet-schema.test.ts`
  - `pnpm -C packages/document-form-engine test:run`
  - `pnpm -C packages/document-form-engine typecheck`
  - `pnpm -C packages/document-form-engine build`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - 以上命令全部通过。

## 2026-03-28（document-form-engine 物料样式协议与右侧配置面）

- RED（先失败）：
  - `pnpm -C packages/document-form-engine test:run -- tests/material-sheet-style.test.ts`
    - 失败原因：缺少 `materials/sheet-style.ts`。
  - `pnpm -C packages/document-form-engine test:run -- tests/designer-sheet-ops.test.ts`
    - 失败原因：缺少 `designer/sheet-ops.ts`。
- GREEN（实现后回归）：
  - `pnpm -C packages/document-form-engine test:run -- tests/material-sheet-style.test.ts`
  - `pnpm -C packages/document-form-engine test:run -- tests/designer-sheet-ops.test.ts tests/material-sheet-style.test.ts`
  - `pnpm -C packages/document-form-engine test:run`
  - `pnpm -C packages/document-form-engine typecheck`
  - `pnpm -C packages/document-form-engine build`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - 以上命令全部通过。

## 2026-03-28（document-form-engine 运行态/打印态 sheet 对齐）

- RED（先失败）：
  - `pnpm -C packages/document-form-engine test:run -- tests/runtime-sheet-parity.test.ts`
  - 结果：失败，提示缺少 `runtime/sheet-renderer.ts` 与 `runtime/print-renderer.ts`。
- GREEN（实现后回归）：
  - `pnpm -C packages/document-form-engine test:run -- tests/runtime-sheet-parity.test.ts`
  - `pnpm -C packages/document-form-engine test:run`
  - `pnpm -C packages/document-form-engine typecheck`
  - `pnpm -C packages/document-form-engine build`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - 以上命令全部通过。

## 2026-03-28（admin 模板生命周期接入）

- RED（先失败）：
  - `pnpm -C apps/admin test:run:file -- src/modules/DocumentFormManagement/services/template-service.unit.test.ts`
  - 结果：失败，缺少 `template-service.ts`。
- GREEN（实现后回归）：
  - `pnpm -C apps/admin test:run:file -- src/modules/DocumentFormManagement/services/template-service.unit.test.ts src/modules/DocumentFormManagement/engine/register.unit.test.ts`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - 以上命令全部通过。

## 2026-03-28（admin 版本历史回滚面板 + Phase 7 收口）

- 命令：
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - `apps/admin typecheck` 通过。
  - `apps/admin lint` 通过（存在既有 warning：`adminManagement/org/components/OrgManagerDialog.vue` 文件行数超限）。
  - `apps/docs lint/build` 通过。

## 2026-03-30（document-form-engine：Excel 画布可见性修复）

- RED（先失败）：
  - `pnpm -C packages/document-form-engine test:run -- tests/dispatch-preset.test.ts tests/designer-sheet-ops.test.ts`
  - 结果：
    - `dispatch-preset.test.ts` 新增断言失败：存在重叠范围（`[3,1,3,24]` vs `[3,1,1,5]`）。
    - `designer-sheet-ops.test.ts` 新增断言失败：冲突 merge 仍被写入。
- GREEN / 回归：
  - `pnpm -C packages/document-form-engine test:run -- tests/dispatch-preset.test.ts tests/designer-sheet-ops.test.ts`
  - `pnpm -C packages/document-form-engine typecheck`
  - `pnpm -C packages/document-form-engine build`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - `document-form-engine` 定向测试通过（7 files / 19 tests 全绿）。
  - `document-form-engine` typecheck/build 通过。
  - `apps/admin` typecheck 通过。
  - `apps/docs` lint/build 通过。
- 补充（提交后复跑）：
  - `pnpm -C packages/document-form-engine test:run` 失败，报错 `Error: Failed to convert napi value into rust type 'bool'`（`Plugin: vite:oxc`，发生在测试文件 transform 阶段）。
  - 当前判断为工具链环境异常，`typecheck` 与业务修复用例逻辑不受影响；后续需单独排查 `vite-plus/oxc` 版本与 Node 运行时兼容性。

## 2026-03-30（工具链版本锁定与防漂移）

- 命令：
  - `pnpm install`
  - `node scripts/doctor.mjs`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - `pnpm install` 成功，`vite-plus` 由 `0.1.11` 升级并统一到 `0.1.14`。
  - `doctor` 通过：Node/pnpm、`vp` 全局与本地一致性、`pnpm-workspace.yaml` 工具链锁定规则均通过。
  - `apps/docs` lint/build 通过。
  - `doctor` 保留既有环境警告：`~/.bash_profile` 中引用的 `~/.cargo/env` 文件不存在（非本次改动引入）。

## 2026-03-30（document-form-engine：Excel 画布列数越界修复）

- 命令：
  - `pnpm -C packages/document-form-engine typecheck`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - 以上命令全部通过。
- 浏览器自动化验证（`agent-browser --session codex`）：
  - 复现路径：`/document-form/design`。
  - 验证点 1：修复后 worksheet `maxCols=24`，`A1/F3/X1` 都可读到文本值。
  - 验证点 2：多选区后点击“文本”，`placements` 增加，且新 placement 左上角单元格值为 `[text] 文本`。

## 2026-03-30（公文设计器：Univer 样式回滚修复）

- 命令：
  - `pnpm -C packages/document-form-engine typecheck`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - 上述命令全部通过。
- 浏览器回归（`agent-browser --session codex`）：
  - 路径：`/document-form/design`
  - 断言 1：Univer 原生 ribbon 可见，右侧为“画布设置/组件设置”。
  - 断言 2：先设置 A1 背景色，再执行“插入字段”触发结构变更，A1 样式保持不变（未复原）。
- 追加回归：
  - `pnpm -C packages/document-form-engine test:run -- tests/designer-state.test.ts`
  - 结果：通过（`7 files / 19 tests`）。

## 2026-03-30（公文设计器：结构视图 + 双预览模式 + 草稿持久化）

- 命令：
  - `pnpm -C packages/document-form-engine typecheck`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin test:run:file -- src/modules/DocumentFormManagement/services/template-service.unit.test.ts`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - 全部通过。
- 浏览器回归（`agent-browser --session codex`）：
  - `/document-form/design`：右侧出现“结构视图”并可展示模板结构 JSON。
  - `/document-form/preview`：可切换填写态/打印态，URL 同步 `?mode=runtime|print`。
  - 持久化：插入字段后刷新设计页，字段仍存在（草稿恢复成功）。

## 2026-03-30（打印态纯展示渲染链路）

- 命令：
  - `pnpm -C packages/document-form-engine typecheck`
  - `pnpm -C packages/document-form-engine test:run -- tests/field-widget-registry.test.ts`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - 全部通过。
- 浏览器回归：
  - `/document-form/preview?mode=runtime`：存在 textbox（填写态）。
  - `/document-form/preview?mode=print`：无 textbox/select，字段以纯文本展示。

## 2026-03-30（document-form-engine：Univer 切页崩溃修复）

- 命令：
  - `pnpm -C packages/document-form-engine typecheck`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - 全部通过。
- 浏览器验证（`agent-browser --session codex`）：
  - 在 `/document-form/design` 注入全局错误监听后执行路由切换（设计/预览往返）。
  - 页面端 `window.__errLogs` 未再捕获 `getConfig/getSheetId` 异常。
  - Vite+ 客户端日志在修复后仅出现既有“路由不应添加为标签”警告，未再出现 Univer `getConfig/getSheetId/getCellMatrix` 崩溃堆栈。
- 追加回归：直接进入 `/document-form/design` 注入全局错误监听并等待初始化阶段，`window.__errLogs=[]`。

## 2026-03-30（document-form-engine：递归更新与快照协议收口）

- 命令：
  - `pnpm -C packages/document-form-engine test:run -- tests/designer-state.test.ts`
  - `pnpm -C packages/document-form-engine test:run -- tests/schema-v3.test.ts tests/designer-state.test.ts`
  - `pnpm -C packages/document-form-engine typecheck`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - `document-form-engine` 定向测试通过（`7 files / 23 tests`）。
  - `document-form-engine typecheck` 通过。
  - `apps/admin typecheck` 通过。
  - `apps/docs lint/build` 通过。
- 浏览器自动化回归（`agent-browser --session codex`）：
  - 构造历史 raw `univerSnapshot` 草稿后进入 `/document-form/design`，页面可渲染且可交互。
  - 连续操作“显示网格线 + 缩放比例”，页面侧 `window.__errLogs=[]`。
  - 持久化快照已写为 `{"__kind":"ob-univer-snapshot","__version":1,"data":...}`。

## 2026-03-30（template 登录页 Element Plus 解析链路修复）

- RED：
  - `pnpm -C apps/template test:run -- tests/architecture/vite-plugin-parity-source.unit.test.ts`
  - 结果：失败，确认 `apps/template/vite.config.ts` 仍是 `plugins: [vue()]`，且缺少 `apps/template/build/vite-plugins.ts`。
- GREEN / 回归：
  - `pnpm -C apps/template test:run -- tests/architecture/vite-plugin-parity-source.unit.test.ts`
  - `pnpm -C apps/template typecheck`
  - `pnpm -C apps/template lint`
  - `pnpm -C apps/template lint:arch`
  - `pnpm -C apps/template build`
- 结果：
  - template 架构门禁测试通过（`7 files / 18 tests`）。
  - `apps/template typecheck` 通过。
  - `apps/template lint` 通过（`0 warnings / 0 errors`）。
  - `apps/template lint:arch` 通过。
  - `apps/template build` 通过。
  - `pnpm -C apps/docs lint` 通过（`0 warnings / 0 errors`）。
  - `pnpm -C apps/docs build` 通过。

## 2026-03-31（TanStack Table 并行封装）

- RED（先失败）：
  - `pnpm -C packages/ui typecheck`
  - 结果：
    - `TanStackTable.vue` 与 `tanstack-engine.ts` 出现 `ComputedRef` 访问、`Row['getVisibleCells']` 类型索引、`TableRuntimeProps -> Record<string, unknown>` 转换等类型错误。

- GREEN / 回归：
  - `pnpm install`
  - `pnpm -C packages/ui lint`
  - `pnpm -C packages/ui typecheck`
  - `pnpm exec vp test run packages/ui/src/tanstack-table-source.test.ts packages/ui/src/index.test.ts packages/ui/src/plugin.test.ts`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin build`
  - `pnpm check:admin:bundle`
- 结果：
  - `packages/ui`：`lint` 0 warning / 0 error，`typecheck` 通过。
  - `packages/ui`：3 个源码断言测试文件共 `7` 条测试通过。
  - `apps/admin`：`typecheck` 与 `build` 通过。
  - `check:admin:bundle`：`iconify-ri`、`wangeditor`、`vxe`、`element-plus`、启动依赖映射等预算检查全部通过。
- GREEN / 二次回归（阻塞项修复后）：
  - `pnpm -C packages/ui lint`
  - `pnpm -C packages/ui typecheck`
  - `pnpm exec vp test run packages/ui/src/tanstack-table-source.test.ts packages/ui/src/index.test.ts packages/ui/src/plugin.test.ts`
  - `pnpm -C packages/ui build`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin build`
  - `pnpm check:admin:bundle`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - `packages/ui`：`lint/typecheck/build` 通过。
  - `packages/ui`：源码门禁测试通过（`3 files / 10 tests`）。
  - `apps/admin`：`typecheck/build` 通过。
  - `check:admin:bundle`：全部预算检查 PASS。
  - `apps/docs`：`lint` 0 warning / 0 error，`build` 成功。

## 2026-03-31（Log 模块灰度：登录日志页切 TanStack）

- RED：
  - `pnpm -C apps/admin test:run:file -- src/modules/LogManagement/login-log/list.source.test.ts`
  - 结果：失败（页面仍为 `ObVxeTable`，不包含 `ObTanStackTable`）。

- GREEN / 回归：
  - `pnpm -C apps/admin test:run:file -- src/modules/LogManagement/login-log/list.source.test.ts`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - 登录日志页源码门禁测试通过（1/1）。
  - `apps/admin`：`typecheck` 与 `build` 通过。
  - `apps/docs`：`lint` 0 warning / 0 error，`build` 成功。

## 2026-03-31（样式污染排查：body 8px margin）

- GREEN / 回归：
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin-lite lint`
- 结果：
  - `apps/admin`：lint 通过（0 error，保留 1 条既有 warning：`OrgManagerDialog.vue` `max-lines`）。
  - `apps/admin-lite`：lint 通过（0 warning / 0 error）。

## 2026-03-31（菜单折叠按钮样式加固）

- GREEN / 回归：
  - `pnpm -C packages/ui lint`
  - `pnpm -C packages/ui typecheck`
- 结果：
  - `packages/ui`：`lint` 0 warning / 0 error。
  - `packages/ui`：`typecheck` 通过。
- `pnpm -C packages/tag lint`
- `pnpm -C packages/tag typecheck`
- 结果补充：`packages/tag` lint/typecheck 通过（0 warning / 0 error）。

## 2026-03-31（TanStack 分页切换：VxePager -> Element Pagination）

- RED：
  - `pnpm exec vp test run /Users/haoqiuzhi/code/one-base-template/packages/ui/src/tanstack-table-source.test.ts`
  - 结果：失败（源码仍包含 `VxePager`，不含 `el-pagination`）。

- GREEN / 回归：
  - `pnpm exec vp test run /Users/haoqiuzhi/code/one-base-template/packages/ui/src/tanstack-table-source.test.ts`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui lint`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs lint`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`

- 结果：
  - `packages/ui/src/tanstack-table-source.test.ts` 通过（6/6）。
  - `packages/ui`：`typecheck` / `lint` 通过。
  - `apps/docs`：`lint` 0 warning / 0 error，`build` 成功。

## 2026-03-31（ObTanStackTable 滚动透底修复）

- GREEN / 回归：
  - `pnpm exec vp test run /Users/haoqiuzhi/code/one-base-template/packages/ui/src/tanstack-table-source.test.ts`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui lint`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs lint`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：
  - `tanstack-table-source.test.ts` 通过（`6/6`）。
  - `packages/ui`：`typecheck`、`lint` 通过。
  - `apps/docs`：`lint` 0 warning / 0 error，`build` 成功。

## 2026-03-31（ObTanStackTable 能力补齐：2/3/4/5/9）

- GREEN / 回归：
  - `pnpm exec vp test run /Users/haoqiuzhi/code/one-base-template/packages/ui/src/tanstack-table-source.test.ts`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui lint`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs lint`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：
  - `packages/ui`：源码门禁测试通过（`10/10`）。
  - `packages/ui`：`typecheck` 与 `lint` 通过（`0 warning / 0 error`）。
  - `apps/docs`：`lint` 通过（`0 warning / 0 error`），`build` 成功。

## 2026-03-31（admin 角色域灰度：角色管理 + 角色分配切 TanStack）

- RED：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin test:run:file -- src/modules/adminManagement/role/list.source.test.ts src/modules/adminManagement/role-assign/list.source.test.ts`
  - 结果：失败（页面源码仍为 `ObVxeTable`，不含 `ObTanStackTable`）。

- GREEN / 回归：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin test:run:file -- src/modules/LogManagement/login-log/list.source.test.ts src/modules/adminManagement/role/list.source.test.ts src/modules/adminManagement/role-assign/list.source.test.ts`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin build`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs lint`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：
  - `apps/admin` 三个源码门禁测试通过（`3/3`）。
  - `apps/admin`：`typecheck` 与 `build` 通过。
  - `apps/docs`：`lint` 0 warning / 0 error，`build` 成功。

## 2026-03-31（ObTanStackTable 分页中文化）

- GREEN / 回归：
  - `pnpm exec vp test run /Users/haoqiuzhi/code/one-base-template/packages/ui/src/tanstack-table-source.test.ts`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui lint`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs lint`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：
  - `packages/ui`：源码门禁测试通过（`10/10`）。
  - `packages/ui`：`typecheck` / `lint` 通过。
  - `apps/docs`：`lint` 0 warning / 0 error，`build` 成功。

## 2026-03-31（菜单管理树形表格：TanStack 适配）

- GREEN / 回归：
  - `pnpm exec vp test run /Users/haoqiuzhi/code/one-base-template/packages/ui/src/tanstack-table-source.test.ts`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin test:run:file -- src/modules/adminManagement/menu/list.source.test.ts src/modules/adminManagement/role/list.source.test.ts src/modules/adminManagement/role-assign/list.source.test.ts src/modules/LogManagement/login-log/list.source.test.ts`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui lint`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin build`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs lint`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：
  - `packages/ui`：源码门禁测试通过（`10/10`），`typecheck/lint` 通过。
  - `apps/admin`：源码门禁测试通过（`4/4`），`typecheck/build` 通过。
  - `apps/docs`：`lint` 0 warning / 0 error，`build` 成功。

## 2026-03-31（树形表格视觉对齐 + 展开按钮美化）

- GREEN / 回归：
  - `pnpm exec vp test run /Users/haoqiuzhi/code/one-base-template/packages/ui/src/tanstack-table-source.test.ts`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui lint`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin test:run:file -- src/modules/adminManagement/menu/list.source.test.ts src/modules/adminManagement/role/list.source.test.ts src/modules/adminManagement/role-assign/list.source.test.ts src/modules/LogManagement/login-log/list.source.test.ts`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin build`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs lint`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：
  - `packages/ui`：源码门禁测试通过（`11/11`），`typecheck/lint` 通过。
  - `apps/admin`：源码门禁测试通过（`4/4`），`typecheck/build` 通过。
  - `apps/docs`：`lint` 0 warning / 0 error，`build` 成功。

## 2026-03-31（TanStack 列宽 width/minWidth 生效修复）

- GREEN / 回归：
  - `pnpm exec vp test run /Users/haoqiuzhi/code/one-base-template/packages/ui/src/tanstack-table-source.test.ts`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui lint`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin test:run:file -- src/modules/adminManagement/menu/list.source.test.ts`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs lint`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：
  - `packages/ui`：源码门禁测试通过（`12/12`），`typecheck/lint` 通过。
  - `apps/admin`：菜单管理源码门禁测试通过（`1/1`）。
  - `apps/docs`：`lint` 0 warning / 0 error，`build` 成功。

## 2026-03-31（树表展开按钮替换为设计稿 SVG）

- GREEN / 回归：
  - `pnpm exec vp test run /Users/haoqiuzhi/code/one-base-template/packages/ui/src/tanstack-table-source.test.ts`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui lint`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin test:run:file -- src/modules/adminManagement/menu/list.source.test.ts`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs lint`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：
  - `packages/ui`：源码门禁测试通过（`12/12`），`typecheck/lint` 通过。
  - `apps/admin`：菜单管理源码门禁测试通过（`1/1`）。
  - `apps/docs`：`lint` 0 warning / 0 error，`build` 成功。

## 2026-03-31（修复 tree toggle SVG 路径解析）

- GREEN / 回归：
  - `pnpm exec vp test run /Users/haoqiuzhi/code/one-base-template/packages/ui/src/tanstack-table-source.test.ts`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui lint`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin build`
- 结果：
  - `packages/ui`：源码门禁测试通过（`12/12`），`typecheck/lint` 通过。
  - `apps/admin`：`typecheck/build` 通过，已无 SVG 路径解析报错。

## 2026-03-31（树表图标间距与同级左对齐细化）

- GREEN / 回归：
  - `pnpm exec vp test run /Users/haoqiuzhi/code/one-base-template/packages/ui/src/tanstack-table-source.test.ts`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui lint`
- 结果：
  - `packages/ui`：源码门禁测试通过（`12/12`），`typecheck/lint` 通过。

## 2026-03-31（树表 icon/content 间距与占位宽度精确对齐）

- GREEN / 回归：
  - `pnpm exec vp test run /Users/haoqiuzhi/code/one-base-template/packages/ui/src/tanstack-table-source.test.ts`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui lint`
- 结果：
  - `packages/ui`：源码门禁测试通过（`12/12`），`typecheck/lint` 通过。

## 2026-03-31（TanStack 空态图片与文案样式）

- GREEN / 回归：
  - `pnpm exec vp test run /Users/haoqiuzhi/code/one-base-template/packages/ui/src/tanstack-table-source.test.ts`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui lint`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs lint`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin build`
- 结果：
  - `packages/ui`：源码门禁测试通过（`12/12`），`typecheck/lint` 通过。
  - `apps/docs`：`lint` 0 warning / 0 error，`build` 成功。
  - `apps/admin`：`build` 通过，产物中已生成 `table-empty-state-*.webp`。

## 2026-03-31（TanStack 空态 overlay 去横向滚动）

- GREEN / 回归：
  - `pnpm exec vp test run /Users/haoqiuzhi/code/one-base-template/packages/ui/src/tanstack-table-source.test.ts`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui lint`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin build`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs lint`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：
  - `packages/ui`：源码门禁测试通过（`12/12`），`typecheck/lint` 通过。
  - `apps/admin`：`build` 通过（空态图片资源打包成功）。
  - `apps/docs`：`lint` 0 warning / 0 error，`build` 成功。

## 2026-03-31（TanStack 性能优化：树数据同步 + 布局收口）

- GREEN / 回归：
  - `pnpm exec vp test run /Users/haoqiuzhi/code/one-base-template/packages/ui/src/tanstack-table-source.test.ts`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui lint`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs lint`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin build`
  - `pnpm check:admin:bundle`
- 结果：
  - `packages/ui`：源码门禁测试通过（`14/14`），`typecheck/lint` 通过。
  - `apps/docs`：`lint` 0 warning / 0 error，`build` 成功。
  - `apps/admin`：`build` 成功；`check:admin:bundle` 全部 PASS。

## 2026-03-31（组织管理页切换 ObTanStackTable）

- GREEN / 回归：
  - `pnpm -C apps/admin test:run:file -- src/modules/adminManagement/org/list.source.test.ts src/modules/adminManagement/menu/list.source.test.ts src/modules/adminManagement/role/list.source.test.ts src/modules/adminManagement/role-assign/list.source.test.ts`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - `apps/admin`：4 个源码门禁测试通过（`4/4`），`typecheck` 通过。
  - `apps/docs`：`lint` 0 warning / 0 error，`build` 成功。

## 2026-03-31（TanStack：超长省略 tooltip + 空值占位可配置）

- GREEN / 回归：
  - `pnpm exec vp test run /Users/haoqiuzhi/code/one-base-template/packages/ui/src/tanstack-table-source.test.ts`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui lint`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs lint`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：
  - `packages/ui`：源码门禁测试通过（`16/16`），`typecheck/lint` 通过。
  - `apps/admin`：`typecheck` 通过。
  - `apps/docs`：`lint` 0 warning / 0 error，`build` 成功。

## 2026-03-31（组织管理页配置未生效修复）

- GREEN / 回归：
  - `pnpm exec vp test run /Users/haoqiuzhi/code/one-base-template/packages/ui/src/tanstack-table-source.test.ts`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/packages/ui lint`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin test:run:file -- src/modules/adminManagement/org/list.source.test.ts`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs lint`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/docs build`
- 结果：
  - `packages/ui`：源码门禁测试通过（`17/17`），`typecheck/lint` 通过。
  - `apps/admin`：组织管理源码门禁通过（`1/1`），`typecheck` 通过。
  - `apps/docs`：`lint` 0 warning / 0 error，`build` 成功。

## 2026-03-31（Element Table 收口：删除 TanStack 并完成 5 页回切）

- GREEN / 回归：
  - `pnpm -C packages/ui typecheck`
  - `pnpm exec vp test run packages/ui/src/element-table-source.test.ts packages/ui/src/index.test.ts packages/ui/src/plugin.test.ts`
  - `pnpm install --lockfile-only`
  - `pnpm -C packages/ui lint`
  - `pnpm -C packages/ui build`
  - `pnpm -C apps/admin test:run:file -- src/modules/LogManagement/login-log/list.source.test.ts src/modules/adminManagement/menu/list.source.test.ts src/modules/adminManagement/org/list.source.test.ts src/modules/adminManagement/role/list.source.test.ts src/modules/adminManagement/role-assign/list.source.test.ts`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - `packages/ui`：`element-table-source`/入口/插件源码门禁测试通过（`3 files / 8 tests`），`typecheck/lint/build` 通过。
  - `apps/admin`：5 个页面源码门禁测试通过（`5/5`），`typecheck` 与 `build` 通过。
  - `apps/docs`：`lint` 0 warning / 0 error，`build` 成功。
  - `pnpm-lock.yaml` 已更新，`rg "@tanstack"` 仅剩设计/计划文档中的历史说明，不再残留运行时代码与锁文件依赖。

## 2026-03-31（ObTable 头部样式生效修复）

- GREEN / 回归：
  - `pnpm exec vp test run packages/ui/src/table-source.test.ts`
  - `pnpm -C packages/ui typecheck`
  - `pnpm -C apps/admin typecheck`
- 结果：
  - `packages/ui`：源码测试 `6/6` 通过，`typecheck` 通过。
  - `apps/admin`：`typecheck` 通过。

## 2026-03-31（角色管理权限弹窗 ObCrudContainer 收口）

- GREEN / 回归：
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin test:run:file -- src/modules/adminManagement/role/components/RolePermissionDialog.unit.test.ts`
  - `pnpm -C /Users/haoqiuzhi/code/one-base-template/apps/admin typecheck`
- 结果：
  - `apps/admin`：`RolePermissionDialog.unit.test.ts` 通过（`1/1`）。
  - `apps/admin`：`vue-tsc --noEmit` 通过。

## 2026-03-31（ObTable 树配置收口到 Element 语义）

- GREEN / 回归：
  - `pnpm exec vp test run packages/ui/src/table-source.test.ts`
  - `pnpm -C apps/admin test:run:file -- src/modules/adminManagement/org/list.source.test.ts src/modules/adminManagement/menu/list.source.test.ts`
  - `pnpm -C packages/ui typecheck`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - `packages/ui`：源码测试通过（`1` 文件 `6` 断言）；`typecheck` 通过。
  - `apps/admin`：组织管理/菜单管理源码测试通过（`2` 文件 `4` 断言）；`typecheck` 通过。
  - `apps/docs`：`lint` 0 warning / 0 error；`build` 成功。

## 2026-03-31（puretable fork 首批顶层能力对齐）

- GREEN / 回归：
  - `pnpm exec vp test run packages/ui/src/table-source.test.ts`
  - `pnpm exec vp test run packages/ui/src/table-source.test.ts packages/ui/src/index.test.ts packages/ui/src/plugin.test.ts`
  - `pnpm -C packages/ui typecheck`
  - `pnpm -C packages/ui lint`
  - `pnpm -C packages/ui build`
  - `pnpm -C apps/admin test:run:file -- src/modules/LogManagement/login-log/list.source.test.ts src/modules/LogManagement/sys-log/list.source.test.ts src/modules/adminManagement/menu/list.source.test.ts src/modules/adminManagement/org/list.source.test.ts src/modules/adminManagement/role/list.source.test.ts src/modules/adminManagement/role-assign/list.source.test.ts`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - `packages/ui`：源码门禁测试（`12/12`）通过，`typecheck/lint/build` 通过。
  - `apps/admin`：6 个源码门禁测试文件（`8` 条）通过，`typecheck/build` 通过。
  - `apps/docs`：`lint` 0 warning / 0 error，`build` 成功。

## 2026-04-01（puretable fork 第二批：tableKey/adaptive/pagination 收口）

- GREEN / 回归：
  - `pnpm exec vp test run packages/ui/src/table-source.test.ts packages/ui/src/index.test.ts packages/ui/src/plugin.test.ts`
  - `pnpm -C packages/ui typecheck`
  - `pnpm -C packages/ui lint`
  - `pnpm -C packages/ui build`
  - `pnpm -C apps/admin test:run:file -- src/modules/LogManagement/login-log/list.source.test.ts src/modules/LogManagement/sys-log/list.source.test.ts src/modules/adminManagement/menu/list.source.test.ts src/modules/adminManagement/org/list.source.test.ts src/modules/adminManagement/role/list.source.test.ts src/modules/adminManagement/role-assign/list.source.test.ts`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - `packages/ui`：3 个源码门禁文件 `12/12` 通过；`typecheck/lint/build` 通过。
  - `apps/admin`：6 个源码门禁文件 `8/8` 通过；`typecheck/build` 通过。
  - `apps/docs`：`lint` 0 warning / 0 error，`build` 成功。
- 额外复核：
  - monitor 子代理二次走查结论：无 P0/P1；保留 1 个 P2（`getTableDoms/setHeaderSticky` 对 Element Plus 内部 DOM 仍有结构耦合）。

## 2026-04-01（expandSlot/formatter/lazy-tree 收口 + 多角色走查）

- GREEN / 回归：
  - `pnpm exec vp test run packages/ui/src/table-source.test.ts`
  - `pnpm exec vp test run packages/ui/src/table-source.test.ts packages/ui/src/index.test.ts packages/ui/src/plugin.test.ts`
  - `pnpm -C packages/ui typecheck`
  - `pnpm -C packages/ui lint`
  - `pnpm -C packages/ui build`
  - `pnpm -C apps/admin test:run:file -- src/modules/LogManagement/login-log/list.source.test.ts src/modules/LogManagement/sys-log/list.source.test.ts src/modules/adminManagement/menu/list.source.test.ts src/modules/adminManagement/org/list.source.test.ts src/modules/adminManagement/role/list.source.test.ts src/modules/adminManagement/role-assign/list.source.test.ts`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - `packages/ui`：源码门禁测试通过（`12/12`）；`typecheck/lint/build` 通过。
  - `apps/admin`：6 个源码测试文件通过（`8/8`）；`typecheck` 通过。
  - `apps/docs`：`lint` 0 warning / 0 error，`build` 成功。

## 2026-04-01（移除 pure 命名，统一表格契约命名体系）

- RED：
  - `pnpm exec vp test run packages/ui/src/table-source.test.ts`
- 结果：
  - 失败，断言 `ObTableColumnsContract` 未命中，确认旧命名仍残留于 `packages/ui/src/components/table/types.ts`。

- GREEN / 回归：
  - `pnpm exec vp test run packages/ui/src/table-source.test.ts packages/ui/src/index.test.ts packages/ui/src/plugin.test.ts`
  - `pnpm -C packages/ui typecheck`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - `packages/ui`：3 个源码门禁文件 `12/12` 通过。
  - `packages/ui`：`typecheck` 通过。
  - `apps/docs`：`lint` 0 warning / 0 error；`build` 成功。

## 2026-04-01（ObTable 行拖拽 + 布局拆分 + 文档同步）

- GREEN / 回归：
  - `pnpm exec vp test run packages/ui/src/table-source.test.ts packages/ui/src/index.test.ts packages/ui/src/plugin.test.ts`
  - `pnpm -C packages/ui typecheck`
  - `pnpm -C packages/ui lint`
  - `pnpm -C packages/ui build`
  - `pnpm -C apps/admin test:run:file -- src/modules/LogManagement/login-log/list.source.test.ts src/modules/LogManagement/sys-log/list.source.test.ts src/modules/adminManagement/menu/list.source.test.ts src/modules/adminManagement/org/list.source.test.ts src/modules/adminManagement/role/list.source.test.ts src/modules/adminManagement/role-assign/list.source.test.ts`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - `packages/ui`：3 个源码门禁文件 `12/12` 通过；`typecheck/lint/build` 通过。
  - `apps/admin`：6 个源码门禁文件 `8/8` 通过；`typecheck/build` 通过。
  - `apps/docs`：`lint` 0 warning / 0 error，`build` 成功。

## 2026-04-01（走查问题修复回归）

- GREEN / 回归：
  - `pnpm install --lockfile-only`
  - `pnpm exec vp test run packages/ui/src/table-source.test.ts packages/ui/src/index.test.ts packages/ui/src/plugin.test.ts`
  - `pnpm -C packages/ui typecheck`
  - `pnpm -C packages/ui lint`
  - `pnpm -C packages/ui build`
  - `pnpm -C apps/admin test:run:file -- src/modules/LogManagement/login-log/list.source.test.ts src/modules/LogManagement/sys-log/list.source.test.ts src/modules/adminManagement/menu/list.source.test.ts src/modules/adminManagement/org/list.source.test.ts src/modules/adminManagement/role/list.source.test.ts src/modules/adminManagement/role-assign/list.source.test.ts`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - `packages/ui`：源码门禁 `13/13` 通过；`typecheck/lint/build` 通过。
  - `apps/admin`：6 个源码门禁文件 `8/8` 通过；`typecheck/build` 通过。
  - `apps/docs`：`lint` 0 warning / 0 error，`build` 成功。
  - 锁文件：`pnpm-lock.yaml` 已与 `packages/ui/package.json` 对齐更新。

## 2026-04-01（tooltip 默认轻量化回归）

- GREEN / 回归：
  - `pnpm exec vp test run packages/ui/src/table-source.test.ts packages/ui/src/index.test.ts packages/ui/src/plugin.test.ts`
  - `pnpm -C packages/ui typecheck`
  - `pnpm -C packages/ui lint`
  - `pnpm -C packages/ui build`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - `packages/ui`：源码门禁 `13/13` 通过；`typecheck/lint/build` 通过。
  - `apps/docs`：`lint` 0 warning / 0 error；`build` 成功。

## 2026-04-01（文档范围收口：不做列拖拽）

- GREEN / 回归：
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - `apps/docs`：`lint` 0 warning / 0 error；`build` 成功。

## 2026-04-01（ObTable 行拖拽/自适应行为级测试补齐）

- GREEN / 回归：
  - `pnpm exec vp test run packages/ui/src/components/table/internal/use-table-row-drag-sort.test.ts packages/ui/src/components/table/internal/use-table-layout.test.ts packages/ui/src/table-source.test.ts packages/ui/src/index.test.ts packages/ui/src/plugin.test.ts`
  - `pnpm -C packages/ui typecheck`
  - `pnpm -C packages/ui lint`
  - `pnpm -C packages/ui build`
- 结果：
  - `packages/ui`：`5 files / 15 tests` 通过。
  - `packages/ui`：`typecheck/lint/build` 通过。

## 2026-04-01（ObTable 列桥接拆分回归）

- GREEN / 回归：
  - `pnpm exec vp test run packages/ui/src/table-source.test.ts packages/ui/src/components/table/internal/use-table-row-drag-sort.test.ts packages/ui/src/components/table/internal/use-table-layout.test.ts packages/ui/src/index.test.ts packages/ui/src/plugin.test.ts`
  - `pnpm -C packages/ui typecheck`
  - `pnpm -C packages/ui lint`
  - `pnpm -C packages/ui build`
- 结果：
  - `packages/ui`：`5 files / 15 tests` 通过。
  - `packages/ui`：`typecheck/lint/build` 通过。

## 2026-04-01（adminManagement：user 跨页勾选 + org 懒加载树展开修复）

- GREEN / 回归：
  - `pnpm -C apps/admin test:run:file -- src/modules/adminManagement/user/composables/useUserCrudState.unit.test.ts src/modules/adminManagement/user/list.source.test.ts src/modules/adminManagement/org/list.source.test.ts src/modules/adminManagement/org/api.source.test.ts`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin build`
- 结果：
  - `apps/admin`：4 个定向测试文件 `9/9` 通过。
  - `apps/admin`：`typecheck` 通过；`lint` 无 error（存在 2 条历史 max-lines warning，非本次新增）；`build` 通过。

## 2026-04-01（组织管理树展开按钮并排样式优化）

- GREEN / 回归：
  - `pnpm -C apps/admin test:run:file -- src/modules/adminManagement/org/list.source.test.ts`
  - `pnpm -C apps/admin typecheck`
- 结果：
  - `apps/admin`：组织管理定向源码测试 `3/3` 通过。
  - `apps/admin`：`typecheck` 通过。

## 2026-04-01（adminManagement 全模块 ObTable 化 + skill/agent 规则同步）

- GREEN / 回归：
  - `pnpm -C apps/admin test:run:file -- src/modules/adminManagement/user/list.source.test.ts src/modules/adminManagement/org/list.source.test.ts src/modules/adminManagement/role/list.source.test.ts src/modules/adminManagement/role-assign/list.source.test.ts src/modules/adminManagement/menu/list.source.test.ts src/modules/adminManagement/position/list.source.test.ts src/modules/adminManagement/tenant-info/list.source.test.ts src/modules/adminManagement/tenant-manager/list.source.test.ts src/modules/adminManagement/org/components/OrgLevelManageDialog.source.test.ts`
  - `pnpm -C apps/admin lint:arch`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - `apps/admin`：`9 files / 12 tests` 全通过。
  - `apps/admin`：`lint:arch/typecheck/lint/build` 通过；`lint` 0 error（2 条历史 `max-lines` warning，非本次新增）。
  - `apps/docs`：`lint` 0 warning / 0 error，`build` 成功。

## 2026-04-01（admin 全模块 ObVxeTable -> ObTable 收口）

- GREEN / 回归：
  - `pnpm -C apps/admin test:run:file -- $(rg --files apps/admin/src/modules | rg 'source\\.test\\.ts$' | sed 's#apps/admin/##')`
  - `pnpm -C apps/admin lint:arch`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - `apps/admin`：`20 files / 23 tests` 通过（含 Cms/System/Portal/adminManagement 的 source 门禁）。
  - `apps/admin`：`lint:arch/typecheck/lint/build` 通过。
  - `apps/admin lint`：0 error（2 条历史 `max-lines` warning，非本次新增）。
  - `apps/docs`：`lint` 0 warning / 0 error，`build` 成功。

## 2026-04-01（admin 构建去除 vxe 运行时 chunk）

- GREEN / 回归：
  - `pnpm exec vp test run packages/ui/src/table-source.test.ts packages/ui/src/card-table-source.test.ts packages/ui/src/vxe-table-source.test.ts packages/ui/src/index.test.ts packages/ui/src/plugin.test.ts`
  - `pnpm -C packages/ui typecheck`
  - `pnpm -C packages/ui lint`
  - `pnpm -C apps/admin test:run:file -- tests/architecture/obtable-plugin-source.unit.test.ts $(rg --files apps/admin/src/modules | rg 'source\\.test\\.ts$' | sed 's#apps/admin/##')`
  - `pnpm -C apps/admin lint:arch`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/admin build`
  - `node scripts/check-admin-build-size.mjs`
  - `pnpm -C apps/admin-lite typecheck`
  - `pnpm -C apps/admin-lite lint:arch`
- 结果：
  - `packages/ui`：`5 files / 16 tests` 通过，`typecheck/lint` 通过。
  - `apps/admin`：`21 files / 24 tests` 通过，`lint:arch/typecheck/lint/build` 通过。
  - `apps/admin build`：`assets/vxe-*` 不再生成。
  - `check-admin-build-size`：`vxe chunk` 未匹配（即已移除），其余预算项 PASS。
  - `apps/admin-lite`：`typecheck/lint:arch` 通过（legacy `vxe` 插件入口兼容验证）。
  - `apps/admin lint`：0 error（2 条历史 `max-lines` warning，非本次新增）。

## 2026-04-01（adminManagement 多角色走查整改 + 测试目录迁移）

- GREEN / 回归：
  - `pnpm -C apps/admin test:run:file -- $(rg --files apps/admin/tests/modules/adminManagement | rg '(source|unit)\.test\.ts$' | sed 's#apps/admin/##')`
  - `pnpm -C apps/admin lint:arch`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - `apps/admin`：`29 files / 61 tests` 全通过。
  - `apps/admin`：`lint:arch/typecheck` 通过。
  - `apps/admin lint`：0 error（3 条 `max-lines` warning，均为历史长文件告警）。
  - `apps/docs`：`lint` 0 warning / 0 error，`build` 成功。

## 2026-04-01（ObTable 入口样式导入修复）

- GREEN / 回归：
  - `pnpm exec vp test run packages/ui/src/index.test.ts packages/ui/src/table-source.test.ts packages/ui/src/plugin.test.ts`
  - `pnpm -C packages/ui typecheck`
  - `pnpm -C packages/ui lint`
  - `pnpm -C apps/admin build`
- 结果：
  - `packages/ui`：`3 files / 14 tests` 通过；`typecheck/lint` 通过。
  - `apps/admin build`：通过（产物生成成功）。

## 2026-04-01（adminManagement shared 分层收敛：cachedAsyncLoader 下沉）

- GREEN / 回归：
  - `pnpm -C apps/admin test:run:file -- tests/modules/adminManagement/user/utils/cachedAsyncLoader.unit.test.ts`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - `apps/admin`：`1 file / 3 tests` 通过；`typecheck` 通过。
  - `apps/docs`：`lint` 0 warning / 0 error；`build` 成功。

## 2026-04-01（PersonalizationDrawer 改造为 CrudContainer 抽屉）

- GREEN / 回归：
  - `pnpm -C packages/ui typecheck`
  - `pnpm -C packages/ui lint`
- 结果：
  - `packages/ui`：`typecheck` 通过；`lint` 0 warning / 0 error。

## 2026-04-01（admin 路由级 keepAlive 稳定命中修复）

- GREEN / 回归：
  - `pnpm exec vp test run packages/ui/src/keep-alive-view-source.test.ts`
  - `pnpm -C packages/ui typecheck`
  - `pnpm -C packages/ui lint`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - `packages/ui`：`1 file / 2 tests` 通过。
  - `packages/ui`：`typecheck` 通过；`lint` 0 warning / 0 error。
  - `apps/docs`：`lint` 0 warning / 0 error；`build` 成功。

## 2026-04-01（菜单内嵌闭环：ext/micro 宿主路由 + openMode/redirect 生效 + 表单提示）

- GREEN / 回归：
  - `pnpm -C apps/admin test:run:file -- tests/modules/adminManagement/menu/list.source.test.ts tests/modules/adminManagement/menu/embedded-host-routes.source.test.ts`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C packages/ui typecheck`
  - `pnpm -C packages/core typecheck`
  - `pnpm -C packages/adapters typecheck`
  - `pnpm -C apps/admin lint`
  - `pnpm -C packages/ui lint`
  - `pnpm -C packages/core lint`
  - `pnpm -C packages/adapters lint`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - `apps/admin`：定向源码测试 `2 files / 4 tests` 通过，`typecheck` 通过。
  - `packages/ui/core/adapters`：`typecheck` 通过；`lint` 0 warning / 0 error。
  - `apps/admin lint`：0 error（4 条历史 `max-lines` warning，均为既有长文件告警）。
  - `apps/docs`：`lint` 0 warning / 0 error，`build` 成功。
- 追加验证：
  - `pnpm -C apps/admin build`
- 追加结果：
  - `apps/admin`：`build` 通过（含新增 `ExternalFramePage`、`MicroAppHostPage` 打包产物）。

## 2026-04-01（菜单表单提示改为问号 tooltip）

- GREEN / 回归：
  - `pnpm -C apps/admin test:run:file -- tests/modules/adminManagement/menu/list.source.test.ts`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - `apps/admin`：`1 file / 3 tests` 通过，`typecheck` 通过。
  - `apps/docs`：`lint` 0 warning / 0 error，`build` 成功。

## 2026-04-01（菜单列表列数精简）

- GREEN / 回归：
  - `pnpm -C apps/admin test:run:file -- tests/modules/adminManagement/menu/list.source.test.ts tests/modules/adminManagement/menu/embedded-host-routes.source.test.ts`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - `apps/admin`：`2 files / 4 tests` 通过，`typecheck` 通过。
  - `apps/docs`：`lint` 0 warning / 0 error，`build` 成功。

## 2026-04-01（PortalManagement 物料分类重划分 + CMS 分类改名）

- GREEN / 回归：
  - `pnpm -C packages/portal-engine typecheck`
  - `pnpm -C packages/portal-engine run test:run -- src/materials/registerMaterialExtensions.test.ts`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - `packages/portal-engine`：`typecheck` 通过。
  - `packages/portal-engine`：测试通过（`32 files / 124 tests`）。
  - `apps/docs`：`lint` 0 warning / 0 error；`build` 成功。

## 2026-04-01（base-table 表头/行高配置 + 隐藏 inner-wrapper 底线）

- RED：
  - `pnpm -C packages/portal-engine run test:run -- src/materials/base/base-table/source.test.ts`
  - 结果：失败（`2 failed`），缺少 `headerHeight/rowHeight` 配置与 `inner-wrapper::before` 隐藏规则。
- GREEN / 回归：
  - `pnpm -C packages/portal-engine run test:run -- src/materials/base/base-table/source.test.ts`
  - `pnpm -C packages/portal-engine typecheck`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - `packages/portal-engine`：源码测试通过（`33 files / 126 tests`），`typecheck` 通过。
  - `apps/docs`：`lint` 0 warning / 0 error；`build` 成功。

## 2026-04-01（base-table 中文分页 + tag 列展示）

- RED：
  - `pnpm -C packages/portal-engine run test:run -- src/materials/base/base-table/source.test.ts`
  - 结果：失败（`1 failed`），缺少中文分页与 tag 列配置/渲染实现。
- GREEN / 回归：
  - `pnpm -C packages/portal-engine run test:run -- src/materials/base/base-table/source.test.ts`
  - `pnpm -C packages/portal-engine typecheck`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- 结果：
  - `packages/portal-engine`：源码测试通过（`33 files / 127 tests`），`typecheck` 通过。
  - `apps/docs`：`lint` 0 warning / 0 error；`build` 成功。
