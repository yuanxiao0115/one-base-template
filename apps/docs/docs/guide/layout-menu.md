# 布局与菜单

## 布局模式

布局由 `packages/core` 的 layout store 驱动，app 通过 env 注入默认值：

- `side`：左侧菜单（可折叠）
- `top`：顶部横向菜单
- `top-side`：顶部系统切换 + 左侧展示当前系统菜单

配置项：
- `apps/admin`：`VITE_LAYOUT_MODE=side|top|top-side`

## 多系统菜单（permissionCode）

适配 sczfw 时，`/cmict/admin/permission/my-tree` 可能一次返回多个根节点（每个根代表一个系统）。

本模板约定：
- 系统 code：根节点 `permissionCode`
- 系统 name：优先用根节点 `title`，无则兜底 `resourceName/permissionCode`

UI 行为：
- 顶部系统切换：展示 `systemStore.systems`
- 左侧菜单：展示 `menuStore.menus`（当前系统菜单树）
- 切系统后跳系统首页：`systemStore.resolveHomePath(systemCode)`（受 `VITE_SYSTEM_HOME_MAP` 影响）

## 系统选择持久化（刷新保持当前系统）

为保证“选择系统后刷新页面仍停留在当前系统”，`packages/core` 会把系统状态做轻量持久化：

- 当前系统：`ob_system_current`（只存 systemCode）
- 系统列表：`ob_system_list`（只存 `{ code, name }`）

写入策略（含降级）：

- 优先写入 `localStorage`（跨 Tab/关闭浏览器后仍存在）
- 若 `localStorage` 不可用或满额（QuotaExceededError），会先清理**可再拉取的菜单缓存**并重试
- 仍失败则降级写入 `sessionStorage`（至少保证“当前 Tab 刷新”可恢复；关闭标签页后失效）

路由首页兜底：

- 根路径 `/` 会优先使用 `VITE_SYSTEM_HOME_MAP[systemCode]` 作为首页
- 若未配置，则会尝试从 `ob_menu_tree:<systemCode>` 的缓存菜单树中推断第一个可访问的叶子节点作为首页

同时，为避免菜单树缓存把 `localStorage` 顶满导致关键状态无法写入，菜单缓存也做了“限额 + 降级”：

- 菜单树缓存 key：`ob_menu_tree:<systemCode>`（可能很大）
  - 单条缓存超过 **1MB** 时不会落盘（并清理旧值）
- path 索引缓存 key：`ob_menu_path_index`
  - 超过 **256KB** 时不会落盘（并清理旧值）

## 标签页（Tabs / Tag）

本模板的“标签页条”由 `packages/core` 的 tabs store 驱动，目标是：
- 列表页打开多个详情页时，**同 path 不同参数**也能拆成多个页签
- 点击页签切换时，**参数不丢失**（回到之前打开的那一个详情 id）
- 刷新页面不丢页签；但**关闭浏览器需要清空**，避免下次换用户仍保留旧页签

### 页签唯一性（同 path 不同参数 = 两个页签）

tabs 的 key 由路由 `path + query + params` 组成（对 query/params 做稳定序列化，避免 query 顺序不同导致重复页签）。

因此：
- `/demo/detail?id=1` 与 `/demo/detail?id=2` 会产生两个页签
- `/demo/detail?a=1&b=2` 与 `/demo/detail?b=2&a=1` 不会产生两个页签

### 页签跳转（携带参数）

点击页签时会使用该页签记录的 `fullPath` 进行跳转，因此 query/params 都会被带回（例如 `id` 不会丢失）。

### 持久化策略（刷新保持 / 关闭浏览器清空）

tabs 状态只写入 `sessionStorage`（不写入 `localStorage`）：

- 持久化 key：`ob_tabs_state:<systemCode>`
- 刷新页面：会从 `sessionStorage` 恢复 tabs
- 关闭浏览器：`sessionStorage` 自动清空（符合“换用户不保留旧 tabs”）

多系统场景下，tabs 会按 `systemCode` 分片缓存，避免系统 A 的页签污染系统 B。

### 退出登录/鉴权失效：强制清空 tabs

为避免“Cookie 过期或退出后重新登录，旧用户的 tabs 复活”：

- 手动退出：`packages/ui/src/components/top/TopBar.vue` 会在 `logout` 后 `tabsStore.reset()`
- 鉴权失效跳登录：`packages/core/src/router/guards.ts` 在重定向 `/login` 前会 `tabsStore.reset()`

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

## 菜单 icon：class / url / minio id

后端的 `menu.icon` 可能是：
- iconfont class（如 `i-icon-xxx` / `icon-xxx`）
- url（http/https/data/blob）
- minio 资源 id（需要额外请求拿图片）

本模板做法：
- UI：`packages/ui/src/components/menu/MenuIcon.vue`
- core：`packages/core/src/stores/assets.ts`（IndexedDB 持久化 blob，刷新不重复拉取）
- adapter：实现 `assets.fetchImageBlob({ id })`

## 主题与风格（sczfw）

为对齐老项目（sczfw）的一些视觉习惯，本仓库提供了“主题色 + 顶栏背景图”的基础能力：

- 主题配置：`apps/admin/src/config/theme.ts`
  - 默认内置 `sczfw/blue/green/orange` 等主题（本质是 Element Plus 的 primary 色）
  - 可通过顶栏的主题下拉切换（会持久化到 localStorage：`ob_theme`）
- 顶栏背景图：`packages/ui/src/assets/app-header-bg.png`
