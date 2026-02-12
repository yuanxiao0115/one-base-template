# sczfw Adapter

示例实现位于：

- `packages/adapters/src/sczfwAdapter.ts`

对接接口（示例）：
- 登录：`/cmict/auth/login`
- 当前用户：`/cmict/auth/token/verify`
- 菜单：`/cmict/admin/permission/my-tree`
- 菜单 icon blob：`/cmict/file/resource/show?id=<minioId>`

## 多系统菜单

当后端 `my-tree` 返回多个根时：
- Adapter 会映射为 `AppMenuSystem[]`（`code/name/menus`）
- core 会写入 `systemStore.systems`，菜单按系统分片缓存

## 需要的 env（apps/admin）

- `VITE_BACKEND=sczfw`
- `VITE_AUTH_MODE=token`（推荐）
- `VITE_SCZFW_SYSTEM_PERMISSION_CODE=admin_server`（仅单系统退化场景需要）
- `VITE_DEFAULT_SYSTEM_CODE` / `VITE_SYSTEM_HOME_MAP`（多系统推荐配置）

