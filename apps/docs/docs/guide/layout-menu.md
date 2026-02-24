# 布局与菜单

## 布局模式

布局由 `packages/core` 的 layout store 驱动，app 在启动时从 `platform-config.json` 注入默认值：

- `side`：顶部栏 + 左侧菜单（可折叠）
- `top`：顶部横向菜单
- `top-side`：顶部栏菜单式系统切换 + 左侧展示当前系统菜单

配置项：
- `apps/admin/public/platform-config.json`：`layoutMode=side|top|top-side`
- `apps/admin/public/platform-config.json`：`systemSwitchStyle=dropdown|menu`（仅 `side` 生效；`top-side` 固定为 `menu`）

## 多系统菜单（permissionCode）

适配 sczfw 时，`/cmict/admin/permission/my-tree` 可能一次返回多个根节点（每个根代表一个系统）。

本模板约定：
- 系统 code：根节点 `permissionCode`
- 系统 name：优先用根节点 `title`，无则兜底 `resourceName/permissionCode`

UI 行为：
- 顶部系统切换：支持 `dropdown`（下拉）与 `menu`（顶栏菜单）两种样式
- 左侧菜单：展示 `menuStore.menus`（当前系统菜单树）
- 切系统后跳系统首页：`systemStore.resolveHomePath(systemCode)`（受 `platform-config.json` 中 `systemHomeMap` 影响）

## 标签栏（Tabs）

- 组件：`packages/ui/src/components/tabs/TabsBar.vue`（UI 壳）+ `packages/tag/src/index.vue`（交互核心）
- 当前实现基于 `@one/tag`（workspace 包），并在 admin 启动时通过插件安装：
  - `app.use(OneTag, { pinia, router, ... })`
  - `packages/core/src/router/guards.ts` 对 admin 以 `enableTabSync=false` 关闭 core tabs 自动同步，避免双写冲突
- 保持的行为约定：
  - 点击切换、关闭当前、关闭左/右/其他/全部
  - 滚轮横向滚动标签区
  - KeepAlive include 按标签 `meta.keepAlive + route.name` 推导
  - 标签状态按 `storageKey=ob_tags` 写入 `sessionStorage`（全局共享，不按 systemCode 分桶）
- 隐藏规则：
  - `meta.hiddenTab=true` 或 `meta.noTag=true` 不进入标签栏
  - admin 默认忽略 `/login`、`/sso`、`/403`、`/404`、`/`、`/redirect*`、`/error*`

## 非菜单路由（详情/编辑）与 meta.activePath

详情/编辑类页面通常不出现在菜单里，但仍需要：
- 菜单高亮正确
- 权限校验“归属到某个菜单入口”

做法：在路由上补 `meta.activePath`，指向其所属菜单的 path。

```ts
// 示例（伪代码）
{
  path: '/demo/detail/:id',
  component: () => import('./DetailPage.vue'),
  meta: {
    activePath: '/demo/page-a'
  }
}
```

守卫逻辑会以 `menuKey = to.meta.activePath ?? to.path` 做系统识别与权限校验。

## 本地维护路由（未进菜单）与 meta.skipMenuAuth

有些页面可能由前端先行维护（或开发期联调临时页），暂时**不会出现在后端菜单**里。

默认策略下：`allowedPaths` 来自菜单树，不在集合内的路由会被拦截到 `403`。

如果你希望“**仍需要登录**，但不依赖菜单权限即可访问”，可以在路由上增加：

```ts
{
  path: '/local/page',
  component: () => import('./LocalPage.vue'),
  meta: {
    skipMenuAuth: true
  }
}
```

注意：
- `skipMenuAuth` 只会跳过“菜单 allowedPaths 校验”，不会跳过登录校验（仍会被重定向到 `/login`）。
- 该能力会放宽前端权限控制，应谨慎使用；**能用 `activePath` 归属到已有菜单时，优先用 `activePath`**。

## 菜单 icon：class / url / minio id

后端的 `menu.icon` 可能是：
- iconfont class（如 `i-icon-xxx` / `icon-xxx`）
- url（http/https/data/blob）
- minio 资源 id（需要额外请求拿图片）

本模板做法：
- UI：`packages/ui/src/components/menu/MenuIcon.vue`
- core：`packages/core/src/stores/assets.ts`（IndexedDB 持久化 blob，刷新不重复拉取）
- adapter：实现 `assets.fetchImageBlob({ id })`
