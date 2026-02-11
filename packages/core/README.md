# @standard-base-tamplate/core

本包只放“纯逻辑”，不依赖任何具体业务接口字段，也不包含 UI。

核心目标：让 `apps/*` 只做组装；对接不同后端时只需要替换 Adapter；要裁剪功能时可以直接删模块目录或替换 UI 包。

## 1) Adapter 契约（解耦关键）

文件：`/Users/haoqiuzhi/code/standard-base-tamplate/packages/core/src/adapter/types.ts`

- `auth.login/logout/fetchMe`
- `menu.fetchMenuTree`
- `sso.exchange*`（可选）

脚手架默认走 Cookie(HttpOnly) 模式：登录/换票接口由后端 `Set-Cookie` 写会话，前端默认不读写 token。

## 2) Core 初始化

入口：`/Users/haoqiuzhi/code/standard-base-tamplate/packages/core/src/createCore.ts`

```ts
import { createCore } from '@standard-base-tamplate/core'

app.use(createCore({
  adapter,
  menuMode: 'remote',
  sso: { enabled: true, routePath: '/sso', strategies: [...] },
  theme: { defaultTheme: 'blue', themes: { blue: { primary: '#1677ff' } } }
}))
```

## 3) 静态路由 + 动态菜单（默认权限规则）

- 路由：始终在前端静态声明（不依赖后端 addRoute）
- 菜单：
  - `menuMode=remote`：通过 `adapter.menu.fetchMenuTree()` 获取
  - `menuMode=static`：由 app 提供 `staticMenus`（可通过本包工具函数从路由生成）

默认权限校验（`router/guards.ts`）：
- **allowedPaths = 菜单树出现过的 path 集合**
- 用户手动输入一个不在 allowedPaths 的地址 -> `403`

菜单生成工具（适合简单项目）：

```ts
import { createStaticMenusFromRoutes } from '@standard-base-tamplate/core'
const staticMenus = createStaticMenusFromRoutes(routes, { rootPath: '/' })
```

## 4) SSO 回调处理（多策略）

文件：`/Users/haoqiuzhi/code/standard-base-tamplate/packages/core/src/router/sso.ts`

统一回调页路由建议固定为 `/sso`，支持按策略优先级匹配：
- `token`：`?token=...` / `?access_token=...`（可选 direct 或 adapter exchange）
- `ticket`：`?ticket=...`（走 adapter.exchangeTicket）
- `oauth`：`?code=...&state=...`（走 adapter.exchangeOAuthCode）

exchange 成功后会自动：
`fetchMe()` -> `loadMenus()` -> 返回安全的站内 redirect。

## 5) 主题切换（多套主题色）

文件：`/Users/haoqiuzhi/code/standard-base-tamplate/packages/core/src/stores/theme.ts`

- 通过 `mix()` 计算 Element Plus 主色派生色
- 写入 CSS 变量：
  - `--el-color-primary`
  - `--el-color-primary-light-3/5/7/8/9`
  - `--el-color-primary-dark-2`

## 6) Tabs + KeepAlive 缓存

文件：`/Users/haoqiuzhi/code/standard-base-tamplate/packages/core/src/stores/tabs.ts`

约定：
- route.meta.keepAlive === true 时加入缓存
- keep-alive 的 include 使用 **组件名**，推荐约定为 `route.name`

