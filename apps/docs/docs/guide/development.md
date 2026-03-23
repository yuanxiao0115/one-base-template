# 开发规范与维护

## 工作流（建议）

仓库内常用验证命令：

```bash
pnpm typecheck
pnpm lint
pnpm lint:arch
pnpm test
pnpm test:run
pnpm build
pnpm check:naming
pnpm verify
pnpm doctor
pnpm changeset
pnpm version:packages
pnpm release:packages
```

admin 常用 lint 脚本（在仓库根目录执行）：

```bash
pnpm lint
pnpm lint:arch
pnpm -C apps/admin lint
pnpm -C apps/admin lint:fix
```

说明：仓库 lint 已统一走 `vp lint`，不再维护 Biome 配置文件。

## Vite Task 运行约定

- 根目录 `pnpm build` 映射到 `vp run -r build`，按 workspace 依赖顺序执行。
- 对于只做 `typecheck` 的子包，`build` 脚本保持为 `pnpm typecheck` 即可，无需额外维护 task-runner 配置文件。
- 如需对任务关系做更细粒度编排，可在根 `vite.config.ts` 的 `run.tasks` 中声明 `dependsOn/inputs/env`。

## 构建 chunk warning 排查优先级

- `admin` / `portal` / `template` 出现大 chunk warning 时，**先看 Vite 的 `manualChunks` 是否已经把 vendor / workspace shell / 重模块拆开**
- 当前仓库优先采用“低风险拆包”策略：
  - 在 `apps/*/vite.config.ts` 中接入共享 helper：`scripts/vite/manual-chunks.ts`
  - 先拆 `vue`、`element-plus`、`vxe`、`iconify`、`gm-crypto` 等 vendor
  - 再按 app feature 拆 `portal` / `UserManagement` / `SystemManagement` / `LogManagement` 等重模块
- `admin` / `portal` / `template` 的路由壳层都不应默认引用完整 `@one-base-template/ui` 入口：
  - 路由壳组件改走 `@one-base-template/ui/shell`
  - 登录页优先直引 `@one-base-template/ui/lite-auth`，避免再经 `ui/lite` barrel 把 `one-ui-shell` 借道带回匿名首屏
- `admin` 的构建后处理会继续收紧 `index-*` / `admin-auth-*` / `LoginPage-*` / `lite-*` 的 preload map，避免登录相关页面提前拉起 `one-ui-shell` / `vxe` / `portal-engine` 等业务壳资源
- `admin-app-shell-*` 的 built preload map 也必须做同口径裁剪；`pnpm check:admin:bundle` 统计的 `startup dependency map` 需按构建后真实生效的 blocked prefixes 计算，不能再按未过滤的原始 `m.f` 列表误判
- 第四批补充（admin）：
  - preload 阻断前缀新增 `iconify-ri-*`（避免登录与运行时入口预拉 Remix Icon 全量集合）
  - `index-*` / `admin-runtime-*` 入口额外阻断 `element-plus-*` 预加载，避免非必要首屏抢占带宽
- 登录或未授权流程如果只是做状态清理或只读访问，优先补“细粒度子出口 + 动态 import”：
  - 当前 `tags` 清理固定走 `@one-base-template/tag/store`
  - 不要静态 import `@one-base-template/tag` 根入口
- `basic` 的 `Client-Signature` 生成也应采用同一思路：
  - `createObHttp()` 已支持异步 `beforeRequestCallback`
  - admin / portal 的签名逻辑统一在请求发出前 `await import('.../config/basic/client-signature')`
  - `config/basic/client-signature.ts` 与 `config/basic/crypto.ts` 必须共同复用 `config/basic/signature.ts`，禁止重复实现签名算法
  - 目标是把 `gm-crypto` 挪出冷启动依赖图，而不是继续静态挂在 `bootstrap/http.ts`
- 这类性能边界建议通过“源码约束测试或构建校验”固化；当前若仓库测试资产处于清理阶段，可先以 `typecheck/lint/build` 作为临时门禁。
- 离线 Iconify 数据按集合拆成独立异步 chunk：
  - `ep` / `ri` 图标集合不再直接塞进应用主入口
  - 管理端图标选择器打开时再加载完整集合，菜单渲染只在需要时注册对应集合
  - `ensureMenuIconifyCollectionsRegistered()` 默认只加载 `ep`，`ri` 仅在显式前缀或图标值命中时加载
- `apps/admin` 当前采用“路由静态声明 + 页面组件异步懒加载”策略；后续继续压缩首屏时，优先调优 vendor/feature chunk 与 preload 规则，避免在 HTTP1.0 场景过度细碎分包
- `admin` 仍保留较高的 `chunkSizeWarningLimit`，前提是 vendor / 图标集合 / 重模块已经独立拆出；这样可以避免静态路由壳层的误报噪音
- `admin` 已增加构建体积预算门禁脚本：`pnpm check:admin:bundle`
  - 检查对象（大 chunk 上沿）：`iconify-ri` / `wangeditor` / `vxe` / `element-plus` / `page-*`
  - 检查对象（HTTP1.0 排队风险）：`startup dependency map js count` / `startup dependency map js gzip` / `tiny chunks` 数量
  - 默认上限：`1120 / 980 / 1080 / 720 / 920 KiB`（大 chunk）+ `22`（startup js 数）+ `820 KiB`（startup js gzip）+ `12`（tiny chunks）
  - CI 在 `pnpm build` 后自动执行，超限直接失败，避免大体积回归静默进入主分支

## admin Vite 代理约定

- `apps/admin/vite.config.ts` 只保留构建/插件编排。
- `apps/admin` 开发默认通过 Vite 代理直连后端：
  - 配置 `VITE_API_BASE_URL`
  - 代理规则：`/api`、`/cmict` -> `VITE_API_BASE_URL`
- `admin` 运行依赖后端登录与菜单权限接口（例如 `token/verify`、`permission/my-tree` 返回 `permissionCode` 菜单树）。
- 不再内置开发态 mock 中间件，文档与配置均以“代理直连后端”为唯一口径。

## 文档必须随功能演进同步更新

本仓库约定：**更新功能后，必须同步更新文档站点**（`apps/docs`）。

常见需要更新文档的场景：

- 新增/调整 env 变量
- 新增布局模式、菜单行为、权限拦截逻辑
- Adapter 接口变更（路径、字段映射、鉴权模式）
- 核心约定变更（例如路由/菜单/SSO 流程）

## PortalManagement 注册链路回归

涉及 `portal-engine` 物料注册、分类扩展或设计器导出变更时，提交前至少执行：

```bash
pnpm -C packages/portal-engine run verify:materials
pnpm -C packages/portal-engine run test:run -- src/public-designer.test.ts src/materials/extensions.test.ts src/materials/registerMaterialExtensions.test.ts
pnpm -C apps/admin run test:run:file -- src/modules/PortalManagement/engine/register.unit.test.ts
pnpm -C apps/docs lint
pnpm -C apps/docs build
```

说明：

- `pnpm -C apps/admin run test:run` 当前会连带执行整组 admin 测试。
- 只想精确回归单文件时，统一使用 `pnpm -C apps/admin run test:run:file -- <path>`。

`verify:materials` 当前会覆盖三类门禁：

- 物料 `config.json` / `defineOptions({ name })` / fallback alias 一致性
- admin 扩展入口约束（`materialExtensions` 与 `materials/extensions/index.ts`）
- 语义化导出约束（`@one-base-template/portal-engine/designer` / `internal`）

## AGENTS 规则分层维护

仓库已启用“根目录全局规则 + 子项目专属规则”模式：

- 根目录 `AGENTS.md`：维护全局流程与协作规则
- 子项目 `AGENTS.md`：维护目录内专属约束

详细分类与适用范围见：`/guide/agents-scope`。

admin 业务迁移的公共组件与 CRUD 强制基线见：`/guide/admin-agent-redlines`。

## Agent / Harness 协作实践

本仓库采用“**全局运行时角色 + 仓库项目知识**”的拆分策略：

- 运行时角色、模型与 system prompt 继续由 `~/.codex` 维护
- 本仓库只维护项目规则、知识入口、验证命令与文档说明

因此，进入本仓库后的推荐顺序是：

1. 先确认任务是否明确针对 `one-base-template`
2. 先读根 `AGENTS.md` 与目标目录 `AGENTS.md`
3. 再读对应指南页与最近的 `docs/plans/*.md`
4. 改完后同步更新 `apps/docs` 与 `.codex/*.md`

详细说明见：`/guide/agent-harness`。

## 本地预览文档

```bash
pnpm -C apps/docs dev
```

## 构建文档

```bash
pnpm -C apps/docs build
```

## 命名规范校验

为保证“动词 + 名词”的通用命名约束，仓库提供命名白名单检查脚本：

```bash
pnpm check:naming
```

白名单来源：`apps/docs/public/cli-naming-whitelist.json`  
规则说明：`/guide/naming-whitelist`

## 一键验证与环境自检

- 一键验证（本地提测前推荐）：

```bash
pnpm verify
```

`verify` 当前与 CI 保持同口径，顺序为：

- `pnpm lint:arch`
- `pnpm test:run`
- `pnpm typecheck`
- `pnpm lint`
- `pnpm build`
- `pnpm check:admin:bundle`

- 环境自检（新成员首次拉仓后推荐）：

```bash
pnpm doctor
```

## 子包发布与版本控制（Changesets）

仓库已接入 `changesets`，用于管理多子包版本发布：

- 创建发布说明：`pnpm changeset`
- 推进版本号：`pnpm version:packages`
- 发布到 registry：`pnpm release:packages`

详细流程见：`/guide/package-release`

## admin 启动与 env 约束

为减少隐性耦合与启动链路分散，本仓库增加了两条约束（由 `pnpm lint:arch` 架构脚本强制，默认集成到 CI）：

- 环境变量：业务模块禁止直接读 `import.meta.env`，统一通过 `apps/admin/src/config/env.ts` 的 `getAppEnv()`（构建期仅例外使用 `buildEnv`）读取
- 启动安装：`createApp/createPinia/createRouter` 只能在 `apps/admin/src/bootstrap/` 中进行；`app.use/app.component/...` 默认在 `bootstrap`，如需项目级扩展可在 `apps/admin/src/main.ts` 的 `beforeMount` 扩展位执行
- 样式入口：基础样式与 Element Plus 覆盖统一在 `apps/admin/src/bootstrap/admin-styles.ts`；团队覆写样式统一放在 `apps/admin/src/styles/team-overrides.css`，并由 `apps/admin/src/main.ts` 顶部显式引入

模块化阶段新增两条约束：

- 模块边界：`apps/admin/src/modules/**/*` 禁止直接 import `@/modules/*`（公共能力上移到 `services/types/core/ui`）
- API 边界：页面/组件/store 禁止直接 import `@/infra/http`；HTTP 调用统一收口到 `services/*` 与 `api.ts/api/client.ts`，并在 API 层通过 `@one-base-template/core` 的 `obHttp()` 获取客户端
- 目录边界：`apps/admin/src/config` / `apps/admin/src/services/auth` / `apps/admin/src/types` 仅承载应用级公共能力；单模块私有逻辑禁止上提到这些目录
- 约束脚本位置：`scripts/check-admin-arch.mjs`（可通过 `pnpm lint:arch` 或 `pnpm -C apps/admin lint:arch` 执行）

## 全局消息工具（兼容老项目 message.ts）

admin 已引入消息工具：`@one-base-template/ui`（`message` / `closeAllMessage` / `registerMessageUtils`），并在启动时全局注册：

- `bootstrap` 注册入口：`apps/admin/src/bootstrap/index.ts`
- Options API 全局属性：
  - `$obMessage`
  - `$closeAllMessage`
- `<script setup>` 可直接使用（Auto Import）：
  - `message`
  - `closeAllMessage`
  - `obConfirm`

示例：

```ts
message.success('保存成功');
message('删除失败，请稍后重试', { type: 'error' });
closeAllMessage();
```

迁移建议：

- 新代码优先使用 `message` / `closeAllMessage`，减少直接散落 `ElMessage` 调用。
- `type` 语义与旧项目保持一致，适合直接平移历史页面消息逻辑。
- `obConfirm` 已全局可用，`<script setup>` 中不再手动 `import { obConfirm } from '@one-base-template/ui'`。

## Tailwind v4（Monorepo）注意事项

本仓库的 `apps/admin` 使用 Tailwind CSS v4（通过 `@tailwindcss/postcss` 编译）。

在 Monorepo 场景下，如果 Tailwind 没有扫描到 `packages/ui` 的 class，会出现“部分工具类不生效”的现象（例如 `flex-col` / `flex-1` 缺失，导致布局错乱）。

当前约定：

- Tailwind 的扫描范围通过 `apps/admin/src/styles/index.css` 的 `@config` / `@source` 显式声明
- PostCSS 插件通过 `apps/admin/postcss.config.js` 指定 `base`，避免由于 cwd 不一致而找不到配置文件

参考片段（简化）：

```css
/* apps/admin/src/styles/index.css */
@import 'tailwindcss';
@config "../../tailwind.config.ts";
@source "../**/*.{vue,ts,tsx}";
@source "../../../../packages/ui/src/**/*.{vue,ts,tsx}";
```

```js
// apps/admin/postcss.config.js
tailwindcss({ base: path.dirname(fileURLToPath(import.meta.url)) });
```
