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

## 配置方式（apps/admin）

构建期 `.env*` 仅保留：

- `VITE_API_BASE_URL`
- `VITE_USE_MOCK`（可选）
- `VITE_SCZFW_SYSTEM_PERMISSION_CODE`（仅 dev mock 使用）

运行时业务配置统一放在 `apps/admin/public/platform-config.json`：

- `backend: "sczfw"`
- `authMode: "token"`（推荐）
- `defaultSystemCode` / `systemHomeMap`（多系统推荐配置）
