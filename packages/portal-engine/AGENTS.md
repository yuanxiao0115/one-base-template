# AGENTS.MD（packages/portal-engine）

> 适用范围：`/Users/haoqiuzhi/code/one-base-template/packages/portal-engine/**`
>
> 先遵循根规则：`/Users/haoqiuzhi/code/one-base-template/AGENTS.md`

## 核心职责

- `portal-engine` 负责门户编辑器、物料配置与渲染共享能力。
- 优先沉淀“统一配置组件 + 统一 schema 约束”，避免各物料重复造轮子。

## 强制统一组件（必须遵守）

- 配置分组标题：**必须**使用 `ObCard`，禁止新增 `el-divider` 作为分组标题方案。
- 颜色选择：**必须**优先使用 `PortalColorField`，禁止在物料配置面板直接散落 `el-color-picker`。
- 间距配置：**必须**优先使用 `PortalSpacingField`（上/右/下/左一体化），禁止拆成多个 `el-input-number` 手工拼接。
- 边框配置：**必须**优先使用 `PortalBorderField`，禁止每个物料重复实现边框样式/颜色/宽度逻辑。
- 统一容器头部：标题、副标题、图标、外链配置必须复用 `common/unified-container/**` 能力，不在物料内重复造字段。

## 配置实现红线

- 新增 base/cms 物料时，优先复用 `materials/common/fields/**` 与 `materials/common/unified-container/**`。
- 物料配置默认值与回写必须走 `createDefault* + merge*`，禁止在页面内散落兜底常量。
- 物料库图标必须使用可渲染的 `MenuIcon` 值（`ri:`/`ep:`/iconfont/资源 id），避免不可用图标导致空白占位。
- 影响配置面板结构时，同步维护文档：`apps/docs/docs/guide/portal-engine.md`。

## 验证命令（portal-engine）

```bash
pnpm -C packages/portal-engine typecheck
pnpm -C packages/portal-engine lint
pnpm -C packages/portal-engine build
pnpm -C apps/docs build
```
