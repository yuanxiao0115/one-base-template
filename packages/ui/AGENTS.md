# AGENTS.MD（packages/ui）

> 适用范围：`/Users/haoqiuzhi/code/one-base-template/packages/ui/**`
>
> 先遵循根规则：`/Users/haoqiuzhi/code/one-base-template/AGENTS.md`

## 核心职责

- `packages/ui` 只负责 UI 壳组件与交互抽象。
- 通过 `packages/core` 提供的 store/composable 获取逻辑能力，禁止反向依赖 apps。

## 组件边界与导出

- 仅内部使用的 UI 组件禁止在 `packages/ui/src/index.ts` 与 `packages/ui/src/plugin.ts` 对外导出/注册。
- 表格工具条组件统一命名为 `TableBox`（全局前缀组件名 `ObTableBox`），禁止继续使用 `OneTableBar` 或 `TableToolbar` 兼容别名。
- `ObCrudContainer`：未传 `container` 时读取全局默认；传入 `container` 时 props 优先。
- CRUD 通用容器必须保留 `footer` 插槽，并支持“纯容器模式”（仅通过 `v-model` 管理 `visible`，不强制 form 与默认确认/取消按钮）。
- `ObPageContainer` 需支持左侧插槽（`#left`）与 `leftWidth`，用于“左树右表”布局并保障分页器稳定可见。

## 主题与视觉规范

- 顶部系统菜单激活态颜色必须跟随主题 token，禁止写死固定色值。
- 侧栏菜单仅叶子菜单项保留激活高亮；菜单组（`el-sub-menu`）禁止出现激活态底色/主色文字。
- `el-button` 的 `link + danger` 组合不得覆盖 hover/active 颜色，保留 Element 默认 danger 交互态。
- 调整错误页能力时，必须同时检查 `403` 与 `404` 页面的一致性。

## ObVxeTable 规范（组件实现侧）

- `ObVxeTable` 必须在 `one-table-bar__content` 内撑满可用高度，分页器能力不可丢失（确保 VXE Pager 与样式已注册）。
- 默认采用“容器自适应撑满 + 分页器置底”布局。
- 颜色相关样式必须复用主题 token（`--one-*` / `--el-*`），禁止组件内维护硬编码色值体系。
- VXE 主题变量统一在 `packages/ui/src/styles/vxe-theme.css` 管理（通过 `packages/ui/src/index.ts` 引入），禁止在 `ObVxeTable` 内重复定义 `--vxe-ui-*`。
- 默认铺满 `one-table-bar__content` 可用宽度，避免右侧留白；纵向滚动条使用窄轨道轻量样式。
- `not--scroll-x` 场景下自动折叠 fixed 左右包裹层，禁止固定列占位导致右侧空白。
- 最后一行（`vxe-body--row:last-child`）默认不绘制 `border-bottom`，避免与分页分隔线双线叠加。

## 验证命令（ui）

```bash
pnpm -C packages/ui typecheck
pnpm -C packages/ui lint
pnpm -C packages/ui build
```
