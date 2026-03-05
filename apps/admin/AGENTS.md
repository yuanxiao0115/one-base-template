# AGENTS.MD（apps/admin）

> 适用范围：`/Users/haoqiuzhi/code/one-base-template/apps/admin/**`
>
> 先遵循根规则：`/Users/haoqiuzhi/code/one-base-template/AGENTS.md`

## 核心职责

- admin 只负责页面组装、路由组织与样式落地。
- 通用逻辑优先下沉 `packages/core`，通用壳组件优先复用 `packages/ui`。
- 后端字段差异优先通过 `packages/adapters` 解决，不在页面层散落兼容。

## 架构约定（必须）

### 静态路由 + 动态菜单

- 路由全部前端静态声明（`modules/**/routes.ts`），不依赖后端动态 `addRoute` 才能访问。
- 模块路由文件（`modules/**/routes*.ts`、`modules/**/routes/*.ts`）中的页面组件当前统一使用静态 `import`，不再使用 `component: async () => import(...)`，也不额外抽离通用 lazy loader。
- 菜单模式支持：
  - `remote`：后端返回可见菜单树。
  - `static`：基于静态路由 `meta.title` 生成菜单树。
- 默认权限模型：菜单树出现过的 path 集合即 `allowedPaths`，不在集合统一拦截到 `403`。

### SSO 与鉴权

- SSO 回调路由统一为 `/sso`（白名单）。
- SSO 策略优先级：`token` / `ticket` / `oauth code`。
- exchange 成功流程：`fetchMe()` -> `fetchMenu()` -> 跳转站内安全地址。
- 默认 Cookie(HttpOnly) 鉴权：HTTP 客户端保持 `withCredentials: true`，前端默认不读写 token。

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
- 涉及错误页能力调整时必须同时检查并覆盖 `403` 与 `404` 两个页面。

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

- `UserManagement`（职位/用户/组织）默认直连真实后端，禁止在 `apps/admin/vite.config.ts` 新增对应 mock 分支；仅用户明确要求 mock 时例外。
- `UserManagement` 目录采用 feature-first（一个功能一个文件夹）；所有路由集中在模块根目录 `routes.ts`。
- 新增/迁移 `UserManagement` 页面时，必须同次提交更新 `apps/admin/src/modules/UserManagement/routes.ts`。
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
- 角色分配页左侧角色区优先使用 `ObPageContainer` 的 `#left` + `el-menu`；搜索框与角色选中项保持扁平化无圆角。
- 用户管理左侧组织树统一使用 `ObTree`：仅叶子节点文本溢出时显示 tooltip。
- 组织管理树形迁移必须对齐老项目 `parentId` 逻辑：根查询/搜索透传 `companyId`（无值回退 `0`），禁止写死 `parentId='0'`。
- 树形表从 Element 迁移到 `ObVxeTable` 时，必须显式给树展示列配置 `treeNode: true`；仅配置 `treeConfig` 不足以显示展开图标。

## CRUD 与交互约定

- CRUD 页面默认使用 `useEntityEditor` 内置错误提示，不再为每页重复编写同构 `onError`。
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

## 额外约束

- `apps/admin/src/styles/index.css` 禁止通过 CSS `@import` 引入本地 Element 覆盖文件；统一在 `apps/admin/src/main.ts` 显式导入 `styles/element-plus/*.css`。
- admin 全局 `v-loading` 遮罩背景统一透明（含 fullscreen 场景），并统一 loading 图标主色与文案样式，禁止回退深色蒙层。
- 接入 `@one-base-template/lint-ruleset` 后，`stylelint.project-overrides` 禁止覆盖与团队规则集同名的规则；本地只允许补充团队规范未定义的项目专属规则。
- ESLint warning 清理同样遵循“团队规则优先”：同名规则优先在 `packages/lint-ruleset` 收敛，`apps/admin` 仅保留项目专属补充，不做同名覆盖。
- lint 门禁采用“按模块渐进”：
  - `lint:code:phase1`（`home,b,LogManagement`）warning 可见；`lint:code:phase2:quiet`（`SystemManagement,UserManagement,demo,portal + bootstrap/router/config/shared/infra/pages/components`）仅 error 阻断；
  - `lint:style:phase1`（`home,b,LogManagement,UserManagement,demo,SystemManagement,portal`）warning 可见；其余范围通过 `lint:style:phase2:audit` 建立待治理清单；
  - 模块完成治理后，从 phase2 移入 phase1，最终目标是全量移除 `--quiet`。
- 当前阶段 lint 治理不包含 i18n 文案约束：`vue/no-bare-strings-in-template` 不作为治理与门禁目标。
- 命名必须“短、清楚、通用”，优先 `get/list/build/create/update/remove`。
- 方法命名优先“动词 + 名词”结构（如 `getInitialPath`、`parseRuntimeConfig`、`clearByPrefixes`）。
- 涉及老项目对齐时，固定参考路径：`/Users/haoqiuzhi/code/sczfw/standard-oa-web-sczfw`。

## 本地验证命令（admin）

```bash
pnpm -C apps/admin dev
pnpm -C apps/admin typecheck
pnpm -C apps/admin lint
pnpm -C apps/admin build
```
