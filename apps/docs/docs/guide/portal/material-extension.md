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
- 需要注册的扩展直接在 `materials/extensions/index.ts` 数组中罗列。
- 当前最小示例物料：
  - 组件文件：`apps/admin/src/modules/PortalManagement/materials/simple-hello-card/index.vue`
  - 内容设置：`apps/admin/src/modules/PortalManagement/materials/simple-hello-card/content.vue`
  - 样式设置：`apps/admin/src/modules/PortalManagement/materials/simple-hello-card/style.vue`
  - 注册入口：`apps/admin/src/modules/PortalManagement/materials/extensions/index.ts`

## 最小流程

1. 在引擎内新增物料目录：`materials/cms/<material>/`。
2. 补齐 `config.json + index.vue + content.vue + style.vue`。
3. 在 `materials/extensions/index.ts` 直接声明 extension。
4. 通过 `setupPortalEngineForAdmin()` 统一注册。
5. 跑 `verify:materials` 与 docs 构建。

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
