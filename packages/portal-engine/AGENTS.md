# AGENTS.MD（packages/portal-engine）

> 适用范围：`/Users/haoqiuzhi/code/one-base-template/packages/portal-engine/**`
>
> 先遵循根规则：`/Users/haoqiuzhi/code/one-base-template/AGENTS.md`

## 核心职责

- `portal-engine` 负责门户编辑器、物料配置与渲染共享能力。
- 优先沉淀“统一配置组件 + 统一 schema 约束”，避免各物料重复造轮子。

## 强制统一组件（必须遵守）

- 配置分组标题：**必须**使用 `ObCard`，禁止新增 `el-divider` 作为分组标题方案。
- 颜色选择：**必须**优先使用 `@one-base-template/ui` 的 `ObColorField`；`PortalColorField` 已废弃并移除，禁止新增兼容壳/兼容导出。
- 间距配置：**必须**优先使用 `PortalSpacingField`（上/右/下/左一体化），禁止拆成多个 `el-input-number` 手工拼接。
- 边框配置：**必须**优先使用 `PortalBorderField`，禁止每个物料重复实现边框样式/颜色/宽度逻辑。
- 统一容器头部：标题、副标题、图标、外链配置必须复用 `common/unified-container/**` 能力，不在物料内重复造字段。

## 配置实现红线

- 新增 base/cms 物料时，优先复用 `materials/common/fields/**` 与 `materials/common/unified-container/**`。
- 物料配置默认值与回写必须走 `createDefault* + merge*`，禁止在页面内散落兜底常量。
- 物料库图标必须使用可渲染的 `MenuIcon` 值（`ri:`/`ep:`/iconfont/资源 id），避免不可用图标导致空白占位。
- 影响配置面板结构时，同步维护文档：`apps/docs/docs/guide/portal-engine.md`。

## 组件注册一致性（防再发）

- 新增物料后，`config.json` 的 `index/content/style.name`、对应 `*.vue` 的 `defineOptions({ name })`、以及 `useMaterials` 最终 `materialsMap` 三者必须一致。
- `useMaterials` 必须维护“静态兜底注册”清单（至少覆盖近期新增与高频物料），不能仅依赖 `import.meta.glob`。
- 开发态必须执行 registry 与 `materialsMap` 的一致性检查；发现缺失 name 时输出明确日志（缺失项 + 可用样本），禁止静默失败。
- 存在历史 `base-` 前缀差异时，必须提供别名兼容（`base-xxx-*` 与 `xxx-*`）以避免已存量 schema 报“组件类型不存在”。

## 验证命令（portal-engine）

```bash
pnpm -C packages/portal-engine typecheck
pnpm -C packages/portal-engine lint
pnpm -C packages/portal-engine build
pnpm -C apps/docs build
```
