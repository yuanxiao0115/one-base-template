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

