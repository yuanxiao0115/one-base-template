# AGENTS.MD（apps/admin）

> 适用范围：`/Users/haoqiuzhi/code/one-base-template/apps/admin/**`
>
> 先遵循根规则：`/Users/haoqiuzhi/code/one-base-template/AGENTS.md`

## 核心职责

- admin 只负责页面组装、路由组织与样式落地。
- 通用逻辑优先下沉 `packages/core`，通用壳组件优先复用 `packages/ui`。
- 后端字段差异优先通过 `packages/adapters` 解决，不在页面层散落兼容。

## 架构约定（必须）

### shared 目录边界

- `apps/admin/src/shared` 定位为 **admin 应用内跨模块共享层**（不是 `packages/core` 的跨应用共享层）。
- `shared` 当前允许内容仅限：
  - `shared/api/types.ts`（跨模块复用的通用协议类型，如 `ApiResponse`/`ApiPageData`）。
  - `shared/services/auth-*.ts`、`shared/services/sso-callback-strategy.ts`（登录/SSO 场景编排能力）。
  - `shared/logger.ts`（路由装配等应用级日志能力）。
- admin 反馈能力（`message` / `obConfirm` / `registerMessageUtils`）统一来自 `@one-base-template/ui`，禁止在 `apps/admin/src/shared` 继续新增同类实现。
- 模块私有逻辑（仅单模块使用的 `mapper/normalize/helper`）禁止上提到 `shared`，保持在 `modules/<module>/**` 就近维护。
- 能抽成跨应用能力时优先下沉到 `packages/core`/`packages/adapters`，不要把跨应用逻辑长期滞留在 `apps/admin/src/shared`。

### 静态路由 + 动态菜单

- 路由全部前端静态声明（`modules/**/routes.ts`），不依赖后端动态 `addRoute` 才能访问。
- 模块路由文件（`modules/**/routes*.ts`、`modules/**/routes/*.ts`）保持“路由静态声明 + 页面组件 `component: async () => import(...)` 懒加载”模式；禁止回退到运行时动态 `addRoute` 装配，也不额外抽离通用 lazy loader。
- 菜单模式支持：
  - `remote`：后端返回可见菜单树。
  - `static`：基于静态路由 `meta.title` 生成菜单树。
- 默认权限模型：菜单树出现过的 path 集合即 `allowedPaths`，不在集合统一拦截到 `403`。
- admin 首页固定走本地静态路由 `/home/index`：通过首页路由 `meta.skipMenuAuth=true` 放行登录后访问；不要再在 core 守卫中新增 `/home` 与 `/home/index` 互认兼容逻辑。

### SSO 与鉴权

- SSO 回调路由统一为 `/sso`（白名单）。
- SSO 策略优先级：`token` / `ticket` / `oauth code`。
- exchange 成功流程：`fetchMe()` -> `fetchMenu()` -> 跳转站内安全地址。
- 默认 Cookie(HttpOnly) 鉴权：HTTP 客户端保持 `withCredentials: true`，前端默认不读写 token。
- `apps/admin/src/main.ts` 必须保持**单启动链路**：统一执行 `loadPlatformConfig() -> import('./bootstrap/index') -> router.isReady() -> mount`，禁止再次引入 `public/admin` 双启动分流或运行时 OS 字体切换。
- 允许在 `apps/admin/src/main.ts` 通过 `startAdminApp({ beforeMount })` 安装项目级插件（`app.use(...)`）；除该扩展位外，不要在业务文件散落全局安装逻辑。
- 样式入口约定：基础样式与 Element Plus 覆盖统一在 `apps/admin/src/bootstrap/admin-styles.ts`；团队项目覆写样式只允许在 `apps/admin/src/main.ts` 顶部通过 `import './styles/team-overrides.css'` 引入。
- `/login`、`/sso` 只作为主路由表中的公共路由存在；登录/SSO 成功后统一使用站内 `router.replace()` 跳转，未授权清理仅允许按需动态导入细粒度子入口（如 `@one-base-template/tag/store`），不要恢复匿名独立 bootstrap。

## 布局与主题（admin 侧）

- Layout 模式与系统切换样式使用代码配置：`apps/admin/src/config/layout.ts`，禁止通过 `platform-config.json` 运行时修改。
- 布局尺寸（TopBar 高度/侧栏展开宽度/侧栏折叠宽度）统一在 `apps/admin/src/config/layout.ts` 配置，禁止在页面或组件内硬编码。
- TopBar 主题设置入口必须放在用户头像下拉菜单内，并通过弹窗承载独立主题配置组件。
- 个性设置面板约束：
  - `ob-personalize__section` 不加外边框。
  - 主色微调与主题切换同级，作为独立标题分区。
  - 主题预览固定 `150px × 90px`，采用“紧凑预览 + 选中行”。
  - 主题区在可用宽度下支持单行 `3~4` 个卡片（auto-fill）。
  - 主题卡需有清晰外框体量，禁止仅保留预览细边框。
  - 个性设置容器统一使用侧边抽屉并抽离为独立组件（TopBar 仅保留触发逻辑）。

## 页面与组件使用约定

- `PageContainer` 与 `TableBox` 在 `apps/admin` 页面中统一使用全局前缀标签：`ObPageContainer` / `ObTableBox`。
- `@one-base-template/ui` 组件在 admin 页面默认走全局注册（`Ob*` 前缀）；仅在明确说明原因时才允许局部 import。
- `ObPageContainer` 外层禁止再包无业务意义占位 `div`，优先使用片段根节点保持结构扁平。
- admin 下 CRUD 编排页文件名统一使用 `list.vue`（不再使用 `page.vue`），对应路由懒加载路径必须保持一致。
- 门户模板列表页（`apps/admin/src/modules/PortalManagement/templatePage/list.vue`）必须对齐 admin 列表基线：禁止使用 `el-table` 与 `ElMessage`，统一使用 `ObVxeTable` 与 `@one-base-template/ui`。
- PortalManagement 权限选人左树严格对齐老项目：固定调用 `GET /cmict/admin/org/detail/children-and-user`，不做多接口兼容兜底；根节点请求使用当前登录用户 `companyId`（缺失时才回退 `parentId=\"0\"`）。
- 门户管理模块标识固定为 `PortalManagement`；管理侧路由路径固定为：`/portal/setting`、`/portal/design`、`/portal/page/edit`、`/portal/preview`（`/resource/portal/setting` 仅作为兼容 alias），禁止再通过 `compat.routeAliases` 为该模块做旧路径别名兜底。
- `PortalManagement` 的设计能力统一收敛到 `designPage` 目录：`pages` 存放页面级入口，`components` 必须按页面边界分组（如 `portal-template`、`preview-render`），禁止在 `components` 根目录平铺堆叠组件。
- `PortalManagement/designPage/components/portal-template` 中涉及壳层（门户级）能力时，入口必须放在顶部栏（`PortalDesignerHeaderBar`）；页面工具栏（`PortalDesignerActionStrip`）只允许放页面级动作，禁止放门户级页眉页脚配置入口。
- `PortalManagement/designPage/components/portal-template` 的页眉页脚配置必须以可视化表单项为主，不允许把“手工编辑 JSON 文本”作为主配置方式；仅可提供“只读 JSON 结构查看/复制”能力用于联调与排错。
- `PortalManagement/designPage/components/portal-template` 的页眉页脚配置在弹窗编辑过程中必须实时驱动右侧预览（仅前端预览态，不直接落库）；`safe/live` 差异必须下沉到物料组件层，禁止在壳层（页眉/页脚/容器）做模式分叉。
- `PortalManagement/designPage/components/portal-template` 的页脚配置基线不包含“风格变体”和“联系二维码”；面板必须按功能区分组，并保持颜色项在对应功能区就近配置。
- `PortalManagement` 页面设置能力默认**不包含配置预设**（如“默认/营销/政务”）；除非用户明确提出，否则禁止新增预设模板入口与对应数据结构。
- admin 登录页统一使用 `ObLoginBoxV2`，不要回退到基础版 `ObLoginBox`。
- 涉及错误页能力调整时必须同时检查并覆盖 `403` 与 `404` 两个页面。

## Agent 执行红线（公共组件优先）

- 该节为 admin 场景的强制红线；后续 CRUD 迁移与重构默认按此执行，除非用户明确授权例外。
- CRUD 列表编排页必须采用 `ObPageContainer + ObTableBox + ObVxeTable`；禁止回退 `el-table`。
- CRUD 新增/编辑/查看容器必须使用 `ObCrudContainer`；禁止在 CRUD 场景回退 `el-dialog`/`el-drawer` 直连编排。
- 模块业务代码（`apps/admin/src/modules/**`）的消息提示统一使用 `@one-base-template/ui`；禁止直接使用 `ElMessage`。
- 模块业务代码（`apps/admin/src/modules/**`）的二次确认统一使用 `obConfirm`/`tryConfirmWarn`；禁止直接使用 `ElMessageBox`。
- CRUD 目录范式固定：`list.vue + api.ts + types.ts + routes.ts`；禁止恢复 `pages/page.vue`、`services` 中转或散乱接口分层。
- 上传能力红线：导入类上传优先使用 `ObImportUpload`（`packages/ui`）；业务型 `el-upload` 仅允许在表单/领域组件内部使用，禁止在 `list.vue` 直接编排上传控件。
- 页面禁止重复封装同构基础能力（消息、确认、CRUD 容器、表格容器）；已有公共组件满足诉求时必须复用。

## 表格迁移（业务页侧）

- 登录日志等迁移页结构保持：`ObPageContainer + ObTableBox + ObVxeTable`。
- 业务页优先使用 `ObVxeTable` 默认配置，仅先传核心参数：`data/columns/pagination/loading`，其他配置按需追加。
- 默认采用“容器自适应撑满 + 分页器置底”方案，避免业务页再传固定高度（特殊场景可覆盖）。
- 分页布局必须满足“分页器固定底部 + 表格主体独立滚动”，禁止把 Table 与 Pager 放在同一滚动容器。
- 使用 `ObTableBox + ObVxeTable` 的页面应优先包裹 `ObPageContainer`（建议 `overflow="hidden"`），避免双滚动与分页漂移。
- 登录日志迁移视觉需对齐老项目：`TableBox`“搜索框 + 筛选图标按钮”，`ObVxeTable`“浅灰表头 + 分页左总数右操作”。
- 表格对齐统一：表头左对齐；数值列右对齐；操作列右对齐；常规文本列左对齐。
- `TableBox` 样式规范：搜索输入框宽 `360px`、高 `32px`、右间距 `8px`、无圆角无阴影；筛选按钮同高度扁平；工具条顶部间距固定 `8px`，去掉标题分割线。

## UserManagement 与迁移规则

- `apps/admin/src/modules/*Management/**` 的接口层统一采用“`api.ts + types.ts`”：`api.ts` 仅维护接口地址与请求调用，不做数据保底、归一化、字段兜底；`types.ts` 仅保留页面真实消费的对外类型，避免过度细粒度类型定义。
- `api.ts` 禁止同源类型中转：禁止出现 `import type {...} from "./types"` 后再 `export type {...} from "./types"`；业务文件需直接从 `types.ts` 引用类型。
- `api.ts` / `api/client.ts` 禁止 `const http = obHttp()` 与 `getHttp` 包装函数；HTTP 请求必须直接写为 `obHttp().get/post/...`，避免无意义中间层。
- 跨模块重复的通用协议类型（如 `ApiResponse<T>`、`ApiPageData<T>`）统一维护在 `apps/admin/src/shared/api/types.ts`；模块内 `types.ts` 仅做直接复用（`export type { ApiResponse }` 或直接引用 `ApiPageData<T>`），不要再新增 `BizResponse`/`ApiResponseAlias` 这类中间别名，业务实体类型继续就地维护，避免“全局大而全类型池”。
- `types.ts` 的实体类型默认只保留页面真实使用字段：仅主键与关键交互字段设为必填，其余字段优先可选，避免完整镜像后端 DTO 导致维护成本上升。
- 对于日志、审计等“弱结构 + 字段经常变动”的列表实体，优先使用“`id` + 少量关键字段 + 索引签名”的宽松定义（如 `[key: string]: string | number | null | undefined`），避免维护超长字段清单。
- `LogManagement` 目录结构与其他模块保持一致：`login-log/api.ts + login-log/types.ts`、`sys-log/api.ts + sys-log/types.ts`，禁止回退到集中式 `LogManagement/api/*.ts`。
- `UserManagement`（职位/用户/组织）默认直连真实后端，禁止在 `apps/admin/vite.config.ts` 新增对应 mock 分支；仅用户明确要求 mock 时例外。
- `UserManagement` 目录采用 feature-first（一个功能一个文件夹）；所有路由集中在模块根目录 `routes.ts`。
- 新增/迁移 `UserManagement` 页面时，必须同次提交更新 `apps/admin/src/modules/UserManagement/routes.ts`。
- `UserManagement` 的接口分层默认采用 `api.ts + types.ts`：`api.ts` 仅维护接口路径与请求参数透传；`types.ts` 保持“够用即可”，禁止过度细粒度类型设计；后端字段已对齐场景下，禁止新增 `normalizers.ts` / `mapper.ts` / `compat.ts`。
- UserManagement 编排层已按 composable 分层后，禁止再新增汇总式 `actions.ts`；复杂逻辑按语义归入 `useXxxState/useXxxActions/useXxxQuery` 等 composable，页面仅保留编排解构。
- 角色域迁移必须同时包含：
  - `角色管理`：`/system/role/management`
  - `角色分配`：`/system/role/assign`
- 角色分配页“添加人员”弹层规则：
  - 必须使用 `dialog`（禁止抽屉）。
  - 保持“左侧组织通讯录 + 右侧已选人员”双栏结构。
  - 右侧已选人员支持拖拽排序并显示手机号，列表超长独立滚动。
  - 空态图文在右侧面板完全居中。
  - 左侧面包屑区域禁止额外显示“组织”抬头。
  - 列表 `loading` 遮罩背景保持透明。
- 选人能力沉淀为可复用组件：`apps/admin/src/components/PersonnelSelector`。
- 选人能力相关的数据源（组织树/人员搜索）必须优先收敛到 `apps/admin/src/components/PersonnelSelector/**` 公共层；业务模块（如 `PortalManagement`、`UserManagement/role-assign`）禁止各自硬编码不同接口路径。
- 角色分配页左侧角色区优先使用 `ObPageContainer` 的 `#left` + `el-menu`；搜索框与角色选中项保持扁平化无圆角。
- 用户管理左侧组织树统一使用 `ObTree`：仅叶子节点文本溢出时显示 tooltip。
- 组织管理树形迁移必须对齐老项目 `parentId` 逻辑：根查询/搜索透传 `companyId`（无值回退 `0`），禁止写死 `parentId='0'`。
- 树形表从 Element 迁移到 `ObVxeTable` 时，必须显式给树展示列配置 `treeNode: true`；仅配置 `treeConfig` 不足以显示展开图标。

## CRUD 与交互约定

- CRUD 页面默认使用 `useEntityEditor` 内置错误提示，不再为每页重复编写同构 `onError`。
- 用户已确认的 CRUD 范式为后续迁移/重构唯一基线：目录组织、`list.vue` 编排层、`api.ts + types.ts` 接口层、`routes.ts` 懒加载注册均需按该范式落地，禁止在新迁移中回退到自定义散乱结构。
- 管理页脚本超过单屏后，优先拆分“新增/编辑表单组件”和“高级搜索组件”，页面仅保留编排逻辑。
- `UserManagement`（组织/职位/用户）页面禁止直接使用 `ElMessageBox`，统一使用 `obConfirm`（含输入型确认）。
- 业务页已使用 `ObActionButtons` 时，禁止叠加手写 `el-dropdown` 操作列。
- `ObActionButtons` 在 UserManagement 页面作为全局组件使用，默认不再手动 import。
- 页面状态分组语义固定：`editor` 仅承载 CRUD 编辑态（`visible/mode/title/submitting/form/uniqueCheck`）；选项/字典/树数据统一放在 `options`。

## 菜单管理与图标选择

- 菜单管理图标分组缩写必须展示全称：`CP=产品 Iconfont`、`DJ=党建 Iconfont`、`OM=OM Iconfont`、`OD=公文 Iconfont`、`EP=Element Plus`、`RI=Remix Icon`。
- 图标预览区保持大尺寸高可读（优先满足 `44px` 触控与清晰 focus 态）。
- 图标触发器保持“输入框 + 图标按钮”简约样式，不展示“选择图标”文字按钮。
- 图标触发器优先放在 `el-input` 右侧插槽（append/suffix），触发器高度与输入框一致，整体宽度与同页控件对齐。
- 图标输入控件高度统一 `30px`；清空/取消交互不得引发布局宽度变化。

## 并行评估与优化沉淀（用户偏好）

- 用户要求“并行前端 + 多角度评价”时，默认拆分为至少 `3` 条并行评审线：`架构边界`、`工程质量`、`性能与体验`。
- 每次 admin 大批量优化后，评价结论必须包含固定维度：`架构一致性`、`可维护性`、`质量门禁`、`性能预算`、`体验一致性`、`文档同步度`。
- 评价输出必须给出证据链：`命令结果`（如 `typecheck/lint/build/check:admin:bundle/lint:arch`）+ `文件路径` + `风险等级`。
- 风险列表必须按严重度排序：`严重` -> `中` -> `低`，并给出对应“可直接执行”的修复建议。
- 完成评价后，必须将可复用结论沉淀到 `apps/admin/AGENTS.md` 或 `apps/docs/docs/guide/*`，避免同类优化反复口头沟通。
- `check:admin:bundle` 默认执行“双门禁”：既检查大 chunk 上沿（如 `iconify-ri`/`vxe`/`wangeditor`/`element-plus`/`page`），也检查 HTTP1.0 排队风险（`startup dependency map js count`、`startup dependency map js gzip`、`tiny chunks` 数量），禁止只追求拆包导致过度碎片化。

## 额外约束

- `apps/admin/src/styles/index.css` 禁止通过 CSS `@import` 引入本地 Element 覆盖文件；统一在 `apps/admin/src/bootstrap/admin-styles.ts` 显式导入 `styles/element-plus/*.css`（由 `bootstrap/startup.ts` 统一加载）。
- `apps/admin/src/styles/team-overrides.css` 作为团队覆写样式唯一入口（由 `main.ts` 引入）；禁止在业务模块、页面组件里新增全局样式入口型 import。
- admin 全局 `v-loading` 遮罩背景统一透明（含 fullscreen 场景），并统一 loading 图标主色与文案样式，禁止回退深色蒙层。
- admin lint 已切换到 `Ultracite + Biome`（单引擎门禁，不再保留 ESLint/Stylelint 双轨脚本）。
- lint 门禁命令：
  - `lint`：`ultracite check --error-on-warnings --javascript-formatter-enabled=false --css-formatter-enabled=false --html-formatter-enabled=false src`（按 admin 子项目 `src` 范围统一门禁，warning 与 error 同级阻断）；
  - `lint:arch`：`node ../../scripts/check-admin-arch.mjs`（架构边界门禁，使用仓库脚本，不新增 ESLint 子配置；检测同时覆盖 `@/` alias 与相对路径 import，避免绕过）；
  - `lint:fix`：`ultracite fix src`（按 admin 子项目 `src` 范围统一格式化与可自动修复项）；
  - `lint:doctor`：`ultracite doctor`（诊断本地配置/环境）。
- admin 架构边界检查统一通过 `lint:arch` 脚本实现，禁止再为 admin 新增 `eslint.*` 架构门禁配置文件。
- Biome 规则改为仓库根 `biome.jsonc` 全局维护；admin 不再保留本地 `biome.jsonc`。
- `.vue` 文件启用 HTML-ish 全支持解析（`html.experimentalFullSupportEnabled=true`），降低模板场景误报。
- 对于已在全局注入的能力（如 `obConfirm`），禁止为“消除 lint 未声明”而补显式 import；应在全局配置中声明 globals。
- 命名必须“短、清楚、通用”，优先 `get/list/build/create/update/remove`。
- 方法命名优先“动词 + 名词”结构（如 `getInitialPath`、`parseRuntimeConfig`、`clearByPrefixes`）。
- 涉及老项目对齐时，固定参考路径：`/Users/haoqiuzhi/code/sczfw/standard-oa-web-sczfw`。

## 本地验证命令（admin）

```bash
pnpm -C apps/admin dev
pnpm -C apps/admin typecheck
pnpm -C apps/admin lint:doctor
pnpm -C apps/admin lint
pnpm -C apps/admin lint:fix
pnpm -C apps/admin build
```
