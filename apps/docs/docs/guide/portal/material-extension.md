# 门户物料扩展与注册

> 适用范围：`packages/portal-engine/src/materials/**`、`apps/admin/src/modules/PortalManagement/materials/extensions/index.ts`

## TL;DR

- 新增物料时，不再手工在页面层注册，统一走 `materials/extensions/index.ts` 的自动收集。
- 每个物料目录固定五件套：`material.ts + defaults.ts + index.vue + content.vue + style.vue`。
- 验收必须同时覆盖：物料注册生效、编辑器可见、默认值注入生效、扩展测试通过。

## 背景与目标

- 背景：门户物料新增历史上常出现“入口分散、默认值散落、注册方式不一致”的问题，导致迁移和排障成本高。
- 目标：把新增物料流程收敛成一条固定路径，做到“目录即声明、声明即注册、注册可验收”。

## 范围与非范围

范围：

- `packages/portal-engine/src/materials/**` 内置与扩展物料定义。
- `apps/admin/src/modules/PortalManagement/materials/**` 的管理端扩展物料。
- 物料注册、默认值、分类展示、兼容别名链路。

非范围：

- 具体业务页面实现（通讯录、应用中心等）不放在 `portal-engine`。
- 业务路由跳转映射不在物料组件层硬编码。
- 非物料体系的通用布局与菜单重构。

## 前置条件

1. 已确认物料所属分类与命名（避免后续再做重命名迁移）。
2. 已准备内容配置（content）与样式配置（style）的默认值。
3. 已明确是否涉及历史 `pb-*` 类型别名兼容。
4. 本地可运行 `packages/portal-engine` 的物料验证命令。

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
- `content.vue` / `style.vue` 建议通过 `useSchemaConfig({ sections: { xxx: { defaultValue } } })` 声明默认值；引擎会自动做“默认值 + schema”合并，减少每个物料手写初始化 merge。
- 内置参考（已迁移到该模式）：`base-text`、`base-notice`、`base-search-box`、`base-table`、`base-file-list`、`base-card-list`、`base-stat`、`base-timeline`、`image-link-list`。
- `base-table` 样式配置新增 `headerHeight` 与 `rowHeight`，默认值均为 `56`（单位 `px`），用于控制表头与行高；分页器文案固定中文（上一页/下一页），列配置支持 `tag` 标签展示（含背景/文字色）。
- 当前最小示例物料：
  - 组件文件：`apps/admin/src/modules/PortalManagement/materials/simple-hello-card/index.vue`
  - 内容设置：`apps/admin/src/modules/PortalManagement/materials/simple-hello-card/content.vue`
  - 样式设置：`apps/admin/src/modules/PortalManagement/materials/simple-hello-card/style.vue`
  - 默认值：`apps/admin/src/modules/PortalManagement/materials/simple-hello-card/defaults.ts`
  - descriptor：`apps/admin/src/modules/PortalManagement/materials/simple-hello-card/material.ts`
  - 注册入口：`apps/admin/src/modules/PortalManagement/materials/extensions/index.ts`

## 最短执行路径（15 分钟）

1. 在 admin 侧新增物料目录：`apps/admin/src/modules/PortalManagement/materials/<material>/`。
2. 补齐 `material.ts + defaults.ts + index.vue + content.vue + style.vue`。
3. 在 `material.ts` 导出 `PORTAL_ADMIN_MATERIAL`，在 `defaults.ts` 定义默认值；`content/style` 通过 `sections.defaultValue` 自动注入默认值。
4. `materials/extensions/index.ts` 自动收集 `*/material.ts` 并注册，无需手工追加。
5. 通过 `setupPortalEngineForAdmin()` 统一注册。
6. 跑 `verify:materials` 与 docs 构建。

## 内置配置可见性

- 内置物料分类（基础/容器/列表/链接/业务/党建风格cms组件）清单入口：`packages/portal-engine/src/registry/materials-registry.ts`
- 每个内置物料默认配置：`packages/portal-engine/src/materials/**/config.json`
- admin 自定义物料默认配置：`apps/admin/src/modules/PortalManagement/materials/*/defaults.ts`
- 推荐对外文档口径：按“物料名 -> content 字段 -> style 字段 -> 默认值”列出，便于业务同学快速对照。

## 老项目组件迁移（2026-04）

- 本轮已迁移并收敛到当前统一容器/公共配置体系的组件：
  - `publicity-education`
  - `mail-list`
  - `dept-upload-files`
  - `document-card-list`
  - `app-entrance`
  - `image-link-list`
  - `image-text-list`
  - `image-text-column`
  - `carousel-text-list`
- 新增目录：
  - `packages/portal-engine/src/materials/cms/publicity-education`
  - `packages/portal-engine/src/materials/cms/mail-list`
  - `packages/portal-engine/src/materials/cms/dept-upload-files`
- 老数据兼容策略（`pb-*`）：
  - 类型别名：`packages/portal-engine/src/registry/materials-registry.ts` 的 `createPortalMaterialTypeAliases()`
  - 组件名别名：`packages/portal-engine/src/materials/static-fallbacks/*.ts`
  - 示例：`pb-publicity-education-index` → `cms-publicity-education-index`，`pb-app-entrance-index` → `app-entrance-index`
- 样式收口（2026-04-02）：
  - 渲染层按老项目视觉复刻，配置层继续使用新项目协议（统一容器 + 公共字段）：
    - 重点复刻：`publicity-education`、`mail-list`、`dept-upload-files`、`app-entrance`、`image-link-list`
    - 细节对齐：`image-text-column`（恢复 `showDot` 绑定）、`carousel-text-list`（轮播图 `coverUrl/carouselUrl` 双字段兼容）
  - 迁移口径：**配置组件可以按新项目标准演进，但前台渲染样式以老项目效果为基准**。
- 分类与命名收口（2026-04-02）：
  - `app-entrance`：配置面板新增统一 `PortalDataSourceCard`，支持静态 JSON / 接口数据；渲染层数据源优先，失败时回退到入口列表兜底。
  - 物料分类调整：
    - `cms-mail-list`、`cms-dept-upload-files` -> `列表组件`
    - `cms-related-links` -> `链接组件`
    - `basic-app-entrance` -> `业务组件`
  - 物料重命名：
    - `文件专栏卡片` -> `卡片专栏`
    - `宣传教育` -> `分页签图文轮播`
  - 物料库中组件名称发生省略时，统一通过 tooltip 展示完整名称。

## 关键约束

- 组件 `defineOptions({ name })` 必须与 schema 中 `cmptConfig.*.name` 对齐。
- 历史命名差异必须显式写入 `static-fallbacks/*.ts`。
- 避免在页面文件里临时注册物料；统一走 extension 声明。
- `setupPortalEngineForAdmin()` 对 extension 注册做了签名幂等保护；重复 setup 不会重复注册同一扩展。

## 业务跳转与页面落位（新增约定）

- 业务物料（如通讯录入口、应用中心入口）禁止在组件内写死业务路由；组件层只维护业务语义 `target/action`。
- 具体跳转路径由应用层维护：
  - `apps/admin` 维护 admin 场景的 `target -> route` 映射；
  - `apps/portal` 维护前台场景的 `target -> route` 映射。
- 被跳转的业务页面必须放在应用层页面目录，而不是 `portal-engine`：
  - 前台页面：`apps/portal/src/modules/<domain>/pages/*.vue`
  - 后台页面：`apps/admin/src/modules/<domain>/pages/*.vue`
- `portal-engine` 只提供动作协议、执行入口与扩展机制，不承载通讯录/应用中心这类业务页面实现。

## 验证与验收（通过标准）

```bash
pnpm -C packages/portal-engine run verify:materials
pnpm -C packages/portal-engine run test:run -- src/materials/extensions.test.ts src/materials/registerMaterialExtensions.test.ts
pnpm -C apps/admin run test:run:file -- src/modules/PortalManagement/engine/register.unit.test.ts
pnpm -C apps/docs lint
pnpm -C apps/docs build
```

通过标准：

- 新物料在 admin 设计器物料面板可见，且分类与名称符合预期。
- `defaults.ts` 的默认值可在 `material/content/style` 三处一致生效。
- `verify:materials` 与两组扩展注册测试均通过，无新增注册冲突。
- 文档构建通过，页面无断链或语法错误。

失败处理：

1. 物料未显示：先检查 `material.ts` 是否导出 `PORTAL_ADMIN_MATERIAL`，再检查目录是否被 `import.meta.glob('../*/material.ts')` 命中。
2. 默认值未注入：优先核对 `defaults.ts` 与 `useSchemaConfig({ sections.defaultValue })` 的字段名是否一致。
3. 历史数据打不开：检查 `materials-registry.ts` 类型别名与 `static-fallbacks/*.ts` 组件名别名是否补齐。

## FAQ

### 1) 为什么新增物料后页面里看不到？

优先检查目录结构是否完整五件套，其次检查 `material.ts` 导出名是否正确。

### 2) 为什么我在组件里写了路由，评审被驳回？

因为业务跳转属于应用层职责，物料层只维护 `target/action` 协议，避免引擎层耦合具体业务页面。

### 3) 为什么已经有同名旧组件，还要做别名映射？

历史页面可能仍保存旧 `pb-*` 类型；没有别名映射会导致老数据渲染丢失，影响线上可用性。
