# sczfw Infra Cleanup Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 精简 `apps/admin` / `apps/portal` 中 `infra/sczfw` 的冗余实现，仅保留当前真实链路仍需的签名与业务加密能力。

**Architecture:** 共享登录组件内部已经承担登录框账号密码与滑块坐标的 SM4 加密，因此 app 层 `infra/sczfw` 只保留“请求签名”和“admin 业务仍在使用的加密函数”。对已无引用的旧滑块组件与未使用导出做删除，避免后续误用。

**Tech Stack:** Vue 3、TypeScript、Vite、Ultracite、VitePress

---

### Task 1: 梳理保留边界

**Files:**
- Inspect: `apps/admin/src/infra/sczfw/crypto.ts`
- Inspect: `apps/portal/src/infra/sczfw/crypto.ts`
- Inspect: `apps/admin/src/bootstrap/http.ts`
- Inspect: `apps/portal/src/bootstrap/http.ts`
- Inspect: `apps/admin/src/modules/UserManagement/user/composables/useUserDialogState.ts`

**Step 1: 确认仍有引用的能力**

- `createClientSignature`：admin / portal HTTP 启动链路仍依赖
- `sm4EncryptBase64`：admin 用户管理业务仍依赖
- `sm4DecryptUtf8`：当前无引用，可删除

### Task 2: 删除冗余实现

**Files:**
- Modify: `apps/admin/src/infra/sczfw/crypto.ts`
- Modify: `apps/portal/src/infra/sczfw/crypto.ts`
- Delete: `apps/admin/src/components/verifition-plus/VerifySlide.vue`
- Delete: `apps/admin/src/components/verifition-plus/utils/util.ts`

**Step 1: admin 保留必要导出**

- 保留 `sm4EncryptBase64`
- 保留 `createClientSignature`
- 删除 `sm4DecryptUtf8`

**Step 2: portal 保留签名能力**

- 删除未使用的 `SM4` 与 `sm4EncryptBase64`
- 保留 `createClientSignature`

**Step 3: 删除 admin 旧滑块组件**

- 删除未被引用的 `VerifySlide.vue`
- 删除仅被该组件使用的 `utils/util.ts`
- 保留 `api/code.ts`，继续供 `ObLoginBoxV2` 页面接入验证码接口

### Task 3: 同步文档

**Files:**
- Modify: `apps/docs/docs/guide/adapter-sczfw.md`
- Modify: `apps/docs/docs/guide/architecture.md`

**Step 1: 补充职责边界**

- 说明 `infra/sczfw` 当前主要承载 `Client-Signature`
- 说明登录框 SM4 已下沉到共享 UI 组件
- 说明 admin 仍有业务级字段加密场景

### Task 4: 定向验证

**Files:**
- Verify only

**Step 1: 运行验证命令**

```bash
pnpm -C apps/admin typecheck
pnpm -C apps/admin lint
pnpm -C apps/admin build
pnpm -C apps/portal typecheck
pnpm -C apps/portal lint
pnpm -C apps/portal build
pnpm -C apps/docs build
```

**Expected:** 全部通过；若仍有大 chunk warning，视为既有告警，不阻断本次交付。
