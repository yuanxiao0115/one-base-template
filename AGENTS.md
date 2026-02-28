# AGENTS.MD

全程使用中文进行 thinking、message 回复。

yuanxiao owns this. Start: say hi + 1 motivating line.

---

## 🎯 核心工作模式

### 技能优先原则（CRITICAL）

在任何响应或行动之前，**优先检查并调用相关技能/规范**（例如：turborepo、pnpm、vue-best-practices、vue-router-best-practices、pinia、vite、web-design-guidelines 等）。

> 目标：避免靠“记忆”猜 API/最佳实践，减少返工与隐性风险。

### 完整开发工作流（强制）

1) brainstorming（编码前先澄清边界/备选方案，输出可验证的设计）
2) using-git-worktrees（设计批准后再隔离工作区/新分支）
3) writing-plans（拆成 2-5 分钟小任务，每个任务含：文件路径 + 代码要点 + 验证方式）
4) executing-plans / subagent-driven-development（按计划实施，设置人工检查点）
5) test-driven-development（RED-GREEN-REFACTOR；本仓库当前无既定测试框架时，至少保证 typecheck/lint/build 通过）
6) requesting-code-review（阶段性审查，严重问题阻断进度）
7) finishing-a-development-branch（完成后跑验证、给出集成选项、清理工作区）

---

## 📂 项目结构（Monorepo）

仓库根目录：`/Users/haoqiuzhi/code/one-base-template`

```
apps/
  admin/                 # 主应用（Vite + Vue）
packages/
  core/                  # 纯逻辑：鉴权/SSO/菜单/主题/tabs/http 等（禁止耦合 UI）
  ui/                    # UI 壳：Layout/Sidebar/Topbar/Tabs/KeepAlive 等（依赖 core）
  adapters/              # Adapter 示例：对接后端接口/字段映射
```

### 解耦/边界（必须遵守）

- `packages/core`：只写逻辑与契约；**禁止**引入 `element-plus`/具体 UI 组件库；禁止写具体后端字段假设。
- `packages/ui`：只做 UI 壳与交互；通过 core 的 store/composable 获取数据；**禁止**反向依赖 apps。
- `apps/admin`：只做组装与页面样式；对接不同后端时只替换 `packages/adapters` 或应用侧 adapter 注入。

---

## 🧱 关键架构约定

### 静态路由 + 动态菜单

- 路由：全部在前端静态声明（模块化 `modules/**/routes.ts`），**不依赖**后端动态 addRoute 才能访问。
- 菜单：
  - `remote`：由后端返回“可见菜单树”
  - `static`：从静态路由 `meta.title` 生成菜单树（适合简单项目）
- 默认权限：**菜单树出现过的 path 集合 = allowedPaths**；不在集合的路由统一拦截到 `403`。

### SSO 单点登录

- 统一回调路由建议固定为：`/sso`（白名单）
- 支持策略（按优先级匹配）：`token` / `ticket` / `oauth code`
- exchange 成功后：`fetchMe()` -> `fetchMenu()` -> redirect 到站内安全地址

### Cookie(HttpOnly) 鉴权（默认）

- HTTP 客户端默认 `withCredentials: true`
- 前端默认不读写 token（除非切换 token 模式）
- dev mock 需要 Set-Cookie，因此采用 **Vite Dev Server middleware**（而不是纯浏览器侧 mock）

---

## 🧪 本仓库默认验证命令

根目录：

- `pnpm dev`
- `pnpm typecheck`
- `pnpm lint`
- `pnpm build`

注意：避免对全仓跑带 `--fix` 的 lint/format，优先定向到本次改动文件，避免引入无关 diff。

---

## 💬 沟通规范

- 全程中文回复；结构清晰；重要信息加粗
- 执行前说明要做什么，执行后汇报结果（包含：改动文件、验证命令、风险点）
- 当用户纠正后：**把新规则补充到本文件**，避免重复犯错
- 老项目（layout/menu 移植来源）固定为：`/Users/haoqiuzhi/code/sczfw/standard-oa-web-sczfw`（不要再误用其他仓库路径）
- `.codex/` 目录下的工作文档（如 `operations-log.md` / `testing.md` / `verification.md` / `context-*.md`）如果创建或已存在：**开工前必须先阅读**，开发过程中同步更新，并在回复里引用关键结论；禁止“创建了但不看/不维护”
- 新增/修改功能后：**必须同步更新文档站点** `apps/docs`（VitePress），确保 `pnpm -C apps/docs build` 可通过且内容与代码一致
- 当前阶段尽量减少分支数量：默认在当前工作分支开发；完成后合并回 `main` 分支，并删除临时分支/工作区（如无特殊需求不再创建多个分支）
- **Git 提交信息必须使用中文**（commit message 禁止英文）
- **未收到“现在提交”的明确指令前，默认不执行 `git commit`；需要提交时先展示拟提交文件清单，并按模块拆分提交**
- **开发阶段默认不做历史配置兼容**；除非用户明确要求，否则按当前方案直接收敛实现
- **Layout 模式与系统切换样式使用代码配置**（`apps/admin/src/config/layout.ts`），不通过运行时 `platform-config.json` 让用户改
- **TopBar 主题设置入口必须放在用户头像下拉菜单内，并通过弹窗承载独立主题配置组件**
- **个性设置弹窗保持紧凑风格：`ob-personalize__section` 不加外边框，主色微调需与主题切换同级作为独立标题分区，避免大字号与大卡片造成界面拥挤**
- **个性设置视觉需对齐参考图二：主题预览固定 `150px × 90px`，采用“紧凑预览 + 选中行”而非大面积整卡容器**
- **个性设置避免“过紧”与“过松”两极：在可用宽度下主题区应支持单行展示 3~4 个卡片（auto-fill），并保持正文可读字号与间距**
- **个性设置主题卡需有明确外框体量（不可仅剩预览细边框），在保持 `150x90` 预览前提下通过卡片容器边框与留白提升舒展感**
- **个性设置容器统一使用侧边抽屉并抽离为独立组件（TopBar 仅保留触发逻辑，禁止内联耦合设置面板实现）**
- **仅内部使用的 UI 组件禁止在 `packages/ui/src/index.ts` 与 `packages/ui/src/plugin.ts` 对外导出/注册（避免暴露无维护承诺的内部实现）**
- **顶部系统菜单激活态颜色必须跟随主题 token（禁止写死固定色值）**
- **侧栏菜单仅叶子菜单项保留激活高亮，菜单组（`el-sub-menu`）禁止出现激活态底色/主色文字，避免父子同时高亮**
- **主题能力优先下沉到 `packages/core`：admin 侧只做项目主题注册与组装，不重复维护 token 引擎/默认映射逻辑**
- **`link` 不归类为 core feedback 状态集合；保留固定色阶静态 token，仅用于 Element `link` 语义与链接场景展示**
- **`el-button` 的 `link + danger` 组合不得覆盖 hover/active 颜色，需保留 Element 默认 danger 交互态色值**
- **涉及错误页能力调整时必须同时检查并覆盖 `403` 与 `404` 两个页面，保持路由与交互行为一致**
- **布局尺寸（TopBar 高度/侧栏展开宽度/侧栏折叠宽度）统一在 `apps/admin/src/config/layout.ts` 配置，不在 UI 内硬编码**
- **涉及表格迁移样板页（如登录日志）时，页面主体必须结合 `PageContainer` 承载，保持“页面容器 + OneTableBar + ObVxeTable”结构一致**
- **`ObVxeTable` 必须在 `one-table-bar__content` 内可撑满可用高度，且分页器能力不可丢失（需确保 VXE Pager 组件与样式已注册）**
- **`ObVxeTable` 默认采用“容器自适应撑满 + 分页器置底”方案，避免业务页再传固定高度；仅在特殊场景按需覆盖**
- **表格迁移时优先使用 `ObVxeTable` 内置默认配置，业务页先只传核心参数（`data/columns/pagination/loading`），其余配置按需追加**
- **登录日志类迁移样板视觉需对齐老项目参考图：`OneTableBar` 默认“搜索框 + 筛选图标按钮”，`ObVxeTable` 默认浅灰表头与“分页左总数右操作”排布，避免出现明显样式漂移**
- **分页布局必须满足“分页器固定底部 + 表格主体独立滚动”：禁用把 Table 与 Pager 放在同一外层滚动容器中滚动的实现**
- **使用 `OneTableBar + ObVxeTable` 的业务页应优先包裹 `PageContainer`（建议 `overflow=\"hidden\"`），统一高度链路，避免双滚动与分页器漂移**
- **`ObVxeTable` 颜色相关样式必须复用主题 token（`--one-*` / `--el-*`），禁止在组件内再维护一套硬编码色值体系；迁移页如无特别需求不得偏离**
- **VXE 主题变量统一在 `packages/ui/src/styles/vxe-theme.css` 管理（并通过 `packages/ui/src/index.ts` 引入），禁止在 `ObVxeTable` 组件内重复定义 `--vxe-ui-*` 主题变量**
- **`ObVxeTable` 必须默认铺满 `one-table-bar__content` 可用宽度（避免右侧留白带），并保持纵向滚动条为窄轨道轻量样式，禁止出现粗重滚动条视觉**
- **`ObVxeTable` 在未触发横向滚动时必须自动折叠 fixed 左右包裹层（`not--scroll-x` 场景），严禁出现固定列占位导致的右侧空白区域**
- **`ObVxeTable` 最后一行（`vxe-body--row:last-child`）默认不绘制 `border-bottom`，避免表体与分页分隔线双线叠加**
- **`OneTableBar` 快捷搜索输入框遵循扁平化样式：宽 `360px`、高 `32px`、右间距 `8px`、无圆角、无阴影（筛选按钮同高度扁平风格）**
- **`OneTableBar` 工具条顶部间距固定 `8px`，并默认去掉 `one-table-bar-title` 分割线（维持扁平化页面头部）**
- **组织管理树形迁移必须对齐老项目 `parentId` 逻辑：根查询/搜索均透传 `companyId`（无值回退 `0`），禁止固定写死 `parentId='0'`**
- **树形表从 Element 迁移到 `ObVxeTable` 时必须显式给树展示列配置 `treeNode: true`；仅配置 `treeConfig` 不足以显示展开图标**
- **`apps/admin/src/styles/index.css` 禁止再通过 CSS `@import` 引入本地 Element 覆盖文件；统一在 `apps/admin/src/main.ts` 里显式导入 `styles/element-plus/*.css`，避免 PostCSS 路径解析 ENOENT**
- **命名必须“短、清楚、通用”：优先使用 `get/list/build/create/update/remove` 等常见词，避免过度抽象或过长命名（如 `resolve/assemble/orchestrate` 连续叠加）**
- **方法命名优先“动词 + 名词”结构（例如 `getInitialPath`、`parseRuntimeConfig`、`clearByPrefixes`），避免语义不明缩写与链式长词**
- **`ObCrudContainer` 在未传 `container` 时必须读取全局配置默认值；若 props 传入 `container`，以 props 为最高优先级**
- **`useTable` 必须支持“全局默认 + 页面局部覆盖”的分页参数键与响应结构适配（局部优先），以兼容不同项目后端字段差异**
- **UserManagement（职位/用户/组织）迁移默认直连真实后端接口，禁止在 `apps/admin/vite.config.ts` 新增对应 mock 分支；仅在用户明确要求 mock 时例外**
- **`PageContainer` 外层禁止再包无业务意义的占位 `div`；优先使用片段根节点保持结构扁平**
- **CRUD 页面默认使用 `useCrudContainer` 的内置错误提示，不再为每个页面重复编写同构 `onError`**
- **管理页脚本体超过单屏后，优先拆分“新增/编辑表单组件”和“高级搜索组件”，页面只保留编排逻辑**
- **`UserManagement` 模块采用“一个功能一个文件夹（feature-first）”组织方式；`routes` 统一在模块根目录集中维护所有页面路由**
- **CRUD 通用容器必须保留 `footer` 插槽，并支持“纯容器模式”（仅通过 `v-model` 管理 `visible`，不强制 form 与默认确认/取消按钮）**
