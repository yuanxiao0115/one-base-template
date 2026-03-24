# basic Adapter

示例实现位于：

- `packages/adapters/src/basicAdapter.ts`

对接接口（示例）：

- 登录：`/cmict/auth/login`
- 当前用户：`/cmict/auth/token/verify`
- 菜单：`/cmict/admin/permission/my-tree`
- 菜单 icon blob：`/cmict/file/resource/show?id=<minioId>`

## 签名与加密职责边界

- `apps/admin/src/services/security/crypto.ts`
  - 保留：`createClientSignature()`（SM3 摘要适配），供 `@one-base-template/core` 的签名注入 helper 调用
  - 保留：`sm4EncryptBase64()`，供 admin 侧仍存在的业务字段加密场景复用（如用户管理改账号）
- `apps/portal/src/config/basic/crypto.ts`
  - 当前只保留 `createClientSignature()`（SM3 摘要适配），供 portal HTTP 请求签名
- 统一签名算法（默认参数 + 三段式拼接）位于：
  - `packages/core/src/http/client-signature.ts`
- 统一签名注入逻辑位于：
  - `packages/core/src/http/basic-client-signature.ts`
- 共享登录相关的 SM4 逻辑已下沉到 UI 组件：
  - `packages/ui/src/components/auth/LoginBox.vue`
  - `packages/ui/src/components/auth/VerifySlide.vue`

因此，admin 侧由 `services/security` 承载“请求签名的摘要适配 + 少量 app 级业务加密”，不再承载共享登录框内部加密。

## 多系统菜单

当后端 `my-tree` 返回多个根时：

- Adapter 会映射为 `AppMenuSystem[]`（`code/name/menus`）
- core 会写入 `systemStore.systems`，菜单按系统分片缓存

## 配置方式（apps/admin）

构建期 `.env*` 仅保留：

- `VITE_API_BASE_URL`

运行时业务配置统一放在 `apps/admin/public/platform-config.json`：

- `backend: "basic"`
- `authMode: "token"`（推荐）
- `defaultSystemCode` / `systemHomeMap`（多系统推荐配置）
