# 门户物料扩展与注册

> 适用范围：`packages/portal-engine/src/materials/**`、`apps/admin/src/modules/PortalManagement/materials/extensions/index.ts`

## 固定入口

- admin 扩展声明入口（唯一）：
  - `apps/admin/src/modules/PortalManagement/materials/extensions/index.ts`
- admin 注册执行入口：
  - `apps/admin/src/modules/PortalManagement/engine/register.ts`

## 推荐扩展方式

优先使用 helper：

- `definePortalMaterialCategory`
- `definePortalMaterial`
- `definePortalMaterialExtension`

新增规则：

- `materials` 目录不再维护 `examples/demo` 分叉目录。
- `materials/extensions/index.ts` 通过 `import.meta.glob('../*/material.ts')` 自动收集物料，不再手工 import 每个组件。
- 每个物料目录固定结构：`material.ts + defaults.ts + index.vue + content.vue + style.vue`。
- 默认值统一收敛在 `defaults.ts`，并复用于 `material.ts` 初始配置与 `content/style/index` 的 merge 兜底。
- 当前最小示例物料：
  - 组件文件：`apps/admin/src/modules/PortalManagement/materials/simple-hello-card/index.vue`
  - 内容设置：`apps/admin/src/modules/PortalManagement/materials/simple-hello-card/content.vue`
  - 样式设置：`apps/admin/src/modules/PortalManagement/materials/simple-hello-card/style.vue`
  - 默认值：`apps/admin/src/modules/PortalManagement/materials/simple-hello-card/defaults.ts`
  - descriptor：`apps/admin/src/modules/PortalManagement/materials/simple-hello-card/material.ts`
  - 注册入口：`apps/admin/src/modules/PortalManagement/materials/extensions/index.ts`

## 最小流程

1. 在 admin 侧新增物料目录：`apps/admin/src/modules/PortalManagement/materials/<material>/`。
2. 补齐 `material.ts + defaults.ts + index.vue + content.vue + style.vue`。
3. 在 `material.ts` 导出 `PORTAL_ADMIN_MATERIAL`，在 `defaults.ts` 定义默认值与 merge 规则。
4. `materials/extensions/index.ts` 自动收集 `*/material.ts` 并注册，无需手工追加。
5. 通过 `setupPortalEngineForAdmin()` 统一注册。
6. 跑 `verify:materials` 与 docs 构建。

## 内置配置可见性

- 内置基础/CMS 物料清单入口：`packages/portal-engine/src/registry/materials-registry.ts`
- 每个内置物料默认配置：`packages/portal-engine/src/materials/**/config.json`
- admin 自定义物料默认配置：`apps/admin/src/modules/PortalManagement/materials/*/defaults.ts`
- 推荐对外文档口径：按“物料名 -> content 字段 -> style 字段 -> 默认值”列出，便于业务同学快速对照。

## 关键约束

- 组件 `defineOptions({ name })` 必须与 schema 中 `cmptConfig.*.name` 对齐。
- 历史命名差异必须显式写入 `static-fallbacks/*.ts`。
- 避免在页面文件里临时注册物料；统一走 extension 声明。
- `setupPortalEngineForAdmin()` 对 extension 注册做了签名幂等保护；重复 setup 不会重复注册同一扩展。

## 回归命令

```bash
pnpm -C packages/portal-engine run verify:materials
pnpm -C packages/portal-engine run test:run -- src/materials/extensions.test.ts src/materials/registerMaterialExtensions.test.ts
pnpm -C apps/admin run test:run:file -- src/modules/PortalManagement/engine/register.unit.test.ts
pnpm -C apps/docs build
```
