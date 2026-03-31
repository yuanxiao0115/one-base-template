# Element Table 封装替换 TanStack 设计稿

> 日期：2026-03-31
> 作用域：`packages/ui`、`apps/admin`、`apps/docs`

## 背景

当前仓库已经引入一套 `ObTanStackTable` 灰度链路，但真实业务在本仓库里已经长期依赖 `Element Plus + ObVxeTable` 的组合。

继续维护 `TanStack Table` 会带来三类额外成本：

1. 需要额外维护 `@tanstack/vue-table` 与 `@tanstack/vue-virtual` 依赖、列映射和树表状态同步。
2. 业务页要同时理解 `VXE / TanStack / Element` 三套表格语义，迁移口径变复杂。
3. 当前仓库已经引入 `element-plus`，直接基于 `el-table` 封装更符合现有技术栈与维护心智。

用户已明确要求：**仓库整体收回到 TanStack 封装之前的边界，但保留 `dea7b24c4bf39e85f1c53b946784038693f4a796` 与 `9c359a5e13c2b4dd4e7729c3e132654aadff7875` 两个提交，不回滚。**

## 目标

1. 删除 TanStack Table 相关实现、导出、依赖、测试和文档口径。
2. 在 `packages/ui` 新增基于 `el-table + el-pagination` 的统一封装，命名为 `ObElementTable`（导出名 `ElementTable`）。
3. `ObElementTable` 与 `ObVxeTable` 对齐核心契约，做到页面可低成本切换。
4. 将当前已经切到 `ObTanStackTable` 的 5 个 admin 页面切换到 `ObElementTable`。
5. 保持视觉样式与现有 `ObVxeTable` 尽量一致，并保留当前已验证的业务能力。

## 非目标

1. 不直接修改当前工作区里与本次需求无关的 5 个脏文件。
2. 不把所有历史 `ObVxeTable` 页面一次性替到 `ObElementTable`。
3. 不引入新的分页、虚拟滚动或第三方表格库。

## 方案选择

### 方案 A：直接回滚到 TanStack 前，页面全部退回 `ObVxeTable`

优点：回滚成本最低。

缺点：没有响应“直接用 Element Table”的新方向，也无法沉淀新的可替代底座。

### 方案 B：保留 `ObTanStackTable` 组件名，但内部改成 `el-table`

优点：页面改动最少。

缺点：名称与实现严重不符，后续维护会持续误导；也不符合“回滚到封装 TanStack 之前”的要求。

### 方案 C：删除 TanStack 链路，新增 `ObElementTable`，并把 5 个已灰度页面切到新封装

**采用此方案。**

原因：

- 语义清晰，后续仓库只保留 `ObVxeTable + ObElementTable` 两个明确底座。
- 页面切换成本可控，因为复用 `ObVxeTable` 的 props / emits / slots 契约。
- 能保留此前用户已确认的树表、空态、ellipsis、tooltip、中文分页等业务要求。

## 设计决策

### 1. 回滚策略

不使用整段 `git reset --hard` 或粗暴批量回退。

采用“**按文件回收 TanStack 资产 + 保留两笔非 TanStack 提交**”的策略：

- 删除 TanStack 新增文件：组件、internal engine、源码测试、SVG 资产、计划文档等。
- 将 TanStack 改写过的页面、导出、文档恢复到 TanStack 之前的基线，再接入新的 `ObElementTable`。
- 保留 `apps/admin/src/styles/index.css`、`apps/admin-lite/src/styles/index.css`、`packages/ui/src/layouts/modes/SideLayout.vue` 中由两个保留提交带来的有效改动。

### 2. `ObElementTable` 契约范围

首期收口以下能力：

- `data / columns / loading / pagination / rowKey / tableLayout`
- `showOverflowTooltip / showEmptyValue / emptyValueText / emptyText`
- `alignWhole / headerAlign / stripe / border`
- `treeConfig`（含普通树表与 `lazy + loadMethod`）
- `selection-change / page-size-change / page-current-change / sort-change`
- `getTableRef / setAdaptive / clearSelection`
- 列配置兼容：`slot`、`headerSlot`、`cellRenderer`、`headerRenderer`、`children`、`hide`、`fixed`、`width`、`minWidth`、`ellipsis`

不承诺兼容：

- VXE 专属虚拟滚动与高级编程式 API
- TanStack 专属列顺序/列尺寸状态 API

### 3. 样式策略

继续保留 `packages/ui/src/styles/table-theme.css` 作为共享 token 层，但改为服务 `ObVxeTable + ObElementTable`，不再服务 TanStack。

视觉基线：

- 字号统一 `14px`
- 表头字重 `600`
- 表体字重 `400`
- 浅灰表头、白底表体、底部分页左总数右操作
- 空态图片与文案继续复用当前业务样式

### 4. 页面切换策略

以下页面切到 `ObElementTable`：

- `apps/admin/src/modules/LogManagement/login-log/list.vue`
- `apps/admin/src/modules/adminManagement/menu/list.vue`
- `apps/admin/src/modules/adminManagement/role/list.vue`
- `apps/admin/src/modules/adminManagement/role-assign/list.vue`
- `apps/admin/src/modules/adminManagement/org/list.vue`

这样可以直接覆盖当前 TanStack 灰度范围，同时不打扰其他稳定的 `ObVxeTable` 页面。

### 5. 规则与文档收口

需要同步把“admin 列表页禁止 `el-table`、只允许 `ObVxeTable`”的口径收敛成：

- **页面层禁止直接使用原生 `<el-table>`**
- **统一使用 `packages/ui` 提供的 `ObVxeTable` 或 `ObElementTable`**

避免后续 agent 再把“禁止 el-table”误解成“禁止基于 Element Plus 的统一封装”。

## 验收口径

1. TanStack 相关组件、依赖、导出、测试、文档不再作为现行方案存在。
2. `ObElementTable` 在 5 个已灰度页面完成替换，页面源码测试通过。
3. 组织管理与菜单管理树表可正常使用。
4. 超长文本省略、tooltip、空值占位、空态图片、中文分页正常工作。
5. 以下验证至少通过：
   - `pnpm -C packages/ui typecheck`
   - `pnpm -C packages/ui lint`
   - `pnpm -C apps/admin test:run:file -- ...`
   - `pnpm -C apps/admin typecheck`
   - `pnpm -C apps/admin build`
   - `pnpm -C apps/docs lint`
   - `pnpm -C apps/docs build`

## 风险

1. `el-table` 与 `ObVxeTable` 的列/树表语义并不完全相同，递归列渲染与树表懒加载需要显式桥接。
2. 当前工作区存在无关脏改动，实施过程中必须避免误覆盖。
3. `pnpm-lock.yaml` 需要与依赖移除同步更新，否则仓库会残留 TanStack 痕迹。
