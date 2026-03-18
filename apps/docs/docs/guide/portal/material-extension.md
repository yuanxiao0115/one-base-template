# 门户物料扩展与注册

> 适用范围：`packages/portal-engine/src/materials/**`、`apps/admin/src/modules/PortalManagement/materials/extensions/**`

## 固定入口

- admin 扩展声明入口：
  - `apps/admin/src/modules/PortalManagement/materials/extensions/index.ts`
- admin 注册执行入口：
  - `apps/admin/src/modules/PortalManagement/engine/register.ts`

## 推荐扩展方式

优先使用 helper：

- `definePortalMaterialCategory`
- `definePortalMaterial`
- `definePortalMaterialExtension`

最小示例参考：

- `apps/admin/src/modules/PortalManagement/materials/extensions/minimal-example.ts`

## 最小流程

1. 在引擎内新增物料目录：`materials/cms/<material>/`。
2. 补齐 `config.json + index.vue + content.vue + style.vue`。
3. 在 admin 扩展入口声明 extension。
4. 通过 `setupPortalEngineForAdmin()` 统一注册。
5. 跑 `verify:materials` 与 docs 构建。

## 关键约束

- 组件 `defineOptions({ name })` 必须与 schema 中 `cmptConfig.*.name` 对齐。
- 历史命名差异必须显式写入 `static-fallbacks/*.ts`。
- 避免在页面文件里临时注册物料；统一走 extension 声明。

## 回归命令

```bash
pnpm -C packages/portal-engine run verify:materials
pnpm -C packages/portal-engine run test:run -- src/materials/extensions.test.ts src/materials/registerMaterialExtensions.test.ts
pnpm -C apps/admin run test:run:file -- src/modules/PortalManagement/engine/register.unit.test.ts
pnpm -C apps/docs build
```
