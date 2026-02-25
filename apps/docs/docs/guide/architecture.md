# 目录结构与边界

仓库根目录：`/Users/haoqiuzhi/code/one-base-template`

```text
apps/
  admin/                 # 主应用（Vite + Vue）
  docs/                  # 文档站点（VitePress）
packages/
  core/                  # 纯逻辑：鉴权/SSO/菜单/主题/tabs/http 等（禁止耦合 UI）
  ui/                    # UI 壳：Layout/Sidebar/Topbar/Tabs/KeepAlive/错误页 等（依赖 core）
  adapters/              # Adapter 示例：对接后端接口/字段映射
  tag/                   # 标签栏能力包（@one/tag，路由驱动 + 右键菜单 + 持久化）
```

## admin 的启动分层

为避免启动链路分散导致不可控，`apps/admin` 将启动逻辑集中在：

- `apps/admin/src/config/platform-config.ts`：加载并校验运行时配置（`public/platform-config.json`）
- `apps/admin/src/config/layout.ts`：管理端布局代码配置（`layoutMode/systemSwitchStyle`）
- `apps/admin/src/config/theme.ts`：主题注册入口（复用 core 内置主题 + 项目自定义主题）
- `apps/admin/src/infra/env.ts`：聚合构建期 env + 运行时配置，导出 `appEnv`
- `apps/admin/src/bootstrap/`：创建 app/pinia/router、初始化 http、安装 core、注册路由守卫
- `packages/tag`：提供标签栏插件，admin 在 bootstrap 阶段安装并接管 tabs 交互链路

启动顺序：

1. `main.ts` 先调用 `loadPlatformConfig()`
2. 配置加载成功后动态导入 `bootstrap`
3. `bootstrap` 内安装 `@one-base-template/ui` 插件（`app.use(OneUiPlugin, { prefix: 'Ob' })`，自动注册全局组件）
4. `bootstrap` 内安装 `@one/tag`（`app.use(OneTag, { pinia, router, ... })`）
5. 注册 core 路由守卫（admin 侧 `enableTabSync=false`，避免与 `@one/tag` 双写）
6. `router.isReady()` 后 mount
7. 配置加载失败时，应用硬失败并显示错误页（不进入业务路由）

## 主题架构分层

- `packages/core/src/stores/theme.ts`
  - 维护主题状态（preset/custom 模式、自定义主色、持久化）
  - 通过 `storageNamespace` 实现跨项目隔离存储
- `packages/core/src/theme/one/theme-tokens.ts`
  - 管理 one token：主色九阶、色板变量、反馈状态色（含 link）
  - token 单一来源收敛到 `PRESET_TOKENS`（`themes/palette/feedback`）
- `packages/core/src/theme/one/style-host.ts`
  - 主题样式宿主：负责 `style#one-theme-base` / `style#one-theme-runtime` 的创建与更新
- `packages/core/src/theme/one/apply-theme.ts`
  - 将主题变量分层写入 head 下双 style tag（不再写 `html.style`）
  - 将 One token 桥接到 Element Plus 变量（`--el-*`）
  - One 默认实现下反馈状态色固定（`success/warning/error/info/link`）
- `apps/admin/src/config/theme.ts`
  - 仅注册项目主题（例如 `adminOrange` / `adminPurple`），不再维护 token 引擎
  - 推荐仅注册 `name/primary/primaryScale`，语义色扩展位由 core 自定义应用器按需消费
- `packages/ui/src/components/theme/ThemeSwitcher.vue`
  - 提供用户切换入口（内置主题 / 自定义主色 / 恢复预设）
- `packages/ui/src/pages/error/*`
  - 维护通用错误页（403/404），admin 路由直接复用，避免多应用重复实现

## 边界规则（必须遵守）

- `packages/core`
  - 只写逻辑与契约，不依赖具体 UI（禁止引入 element-plus）。
  - 不假设具体后端字段（由 Adapter 适配）。
- `packages/ui`
  - 只做 UI 壳与交互。
  - 通过 core 的 store/composable 获取数据。
  - 禁止反向依赖 apps。
- `apps/admin`
  - 只做组装与页面样式。
  - 对接不同后端时优先替换 `packages/adapters` 或应用侧注入 adapter。

## 静态路由 + 动态菜单

核心约定：
- 路由：始终静态声明（`apps/admin/src/modules/**/routes.ts`）。
- 菜单：
  - `remote`：后端返回“可见菜单树”
  - `static`：从静态路由生成
- 权限（默认）：**菜单树出现过的 path 集合 = allowedPaths**；不在集合的路由统一拦截到 `403`。
  - 详情/编辑等“非菜单路由”用 `meta.activePath` 归属到某个菜单入口
  - 若页面是“本地维护但暂未接入菜单”，可用 `meta.skipMenuAuth=true`（仍需登录）
