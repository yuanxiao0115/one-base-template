# @one-base-template/core

本包是脚手架的“纯逻辑核心”，目标是让 `apps/*` 与 `packages/ui` 都能在不耦合具体后端字段、也不依赖 UI 库的前提下复用鉴权/菜单/SSO/主题/http 等能力。

## 1. 适配器（Adapter）契约

对接真实后端时，推荐只在 `apps/*` 或 `packages/adapters` 实现适配器，避免把后端字段写死进 core。

- 契约定义：`/Users/haoqiuzhi/code/one-base-template/packages/core/src/adapter/types.ts`

核心接口：

- `auth.login / logout / fetchMe`
- `menu.fetchMenuTree`
- `sso.exchangeToken / exchangeTicket / exchangeOAuthCode`（可选）

## 2. HTTP 封装：createObHttp（兼容 PureHttp 使用习惯）

入口：

- `createObHttp(options)`：创建一个带“业务码处理 + 上传/下载 + hooks 扩展点”的 Axios 包装层
- 默认返回 `response.data`（可用 `$rawResponse` 获取原始 `AxiosResponse`）

### 2.1 典型用法

```ts
import { createObHttp } from '@one-base-template/core';

const http = createObHttp({
  axios: { baseURL: '/api', withCredentials: true },
  auth: {
    mode: 'cookie', // cookie | token | mixed
    getToken: () => localStorage.getItem('ob_token') || undefined
  },
  biz: {
    // 默认约定：{ code, data, message }
    successCodes: [0, 200],
    logoutCodes: [401, 1000, 1003, 1020]
  },
  hooks: {
    onBizError: ({ message }) => console.error(message),
    onUnauthorized: () => console.warn('unauthorized')
  }
});

await http.post('/auth/login', { data: { username: 'demo', password: 'demo' } });
```

### 2.2 请求配置（ObHttpRequestConfig）

在 Axios 原有 `AxiosRequestConfig` 基础上，core 额外支持（常用）：

- `$isUpload?: boolean`：上传接口，自动设置 `multipart/form-data`
- `$isDownload?: boolean`：下载接口，自动 `responseType=blob`，并按需自动触发下载
- `$downloadFileName?: string`：下载文件名（优先级最高）
- `$noErrorAlert?: boolean`：业务码错误时不触发 `onBizError`
- `$rawResponse?: boolean`：返回原始 `AxiosResponse`
- `$throwOnBizError?: boolean`：业务码失败时强制抛异常（默认不抛，贴近旧项目习惯）
- `$cancelOnRouteChange?: boolean`：路由切换时是否自动取消该请求（默认 `true`）
- `$isAuth?: boolean` + `token?: string`：token/mixed 模式下，允许单次请求显式传 token
- `beforeRequestCallback / beforeResponseCallback`：单次请求回调（优先级高于全局）

此外，`ObHttp` 实例还提供：

- `cancelRouteRequests(reason?)`：取消当前“可随路由切换中断”的在途请求
- `getPendingCount()`：获取在途请求数量（调试观测用）

### 2.6 basic 签名注入 helper

为减少 `apps/*` 重复维护 `Client-Signature` 请求头拼装逻辑，core 提供：

- `createBasicClientSignatureBeforeRequest({ ... })`
  - 统一处理 headers 合并、`Client-Signature` 注入
  - 支持懒加载 `loadCreateClientSignature()`，避免把签名依赖拉进冷启动主链路
- `getClientSignatureInput(options?)` + `buildClientSignature({ clientId, timestamp, digestHex })`
  - 统一 `clientId/timestamp/salt` 默认值与三段式签名拼接
  - app 侧仅保留摘要算法（如 `SM3.digest`）适配，避免 admin / portal 各自维护拼接实现

适用场景：admin / portal 这类 `backend=basic` 的请求签名注入。

### 2.3 业务码（Biz）约定与可扩展点

默认“业务码响应”判定：响应 data 里存在 `code` 字段（适配 `{ code, data, message }` 形态）。

当后端字段不稳定/不同项目不一致时，可在 app 层通过 `options.biz` 覆盖：

- `isBizResponse(data, response)`：如何判断是业务码包装
- `getCode(data)`：如何读业务 code
- `getMessage(data)`：如何读 message
- `successCodes`：成功码集合（默认 `[200]`）
- `logoutCodes`：触发登出/跳转登录的业务码集合

### 2.4 下载（自动触发）

当 `$isDownload=true` 且 `download.autoDownload=true`（默认 true）时：

1. 自动切换 `responseType=blob`
2. 先对 blob 做“有限 JSON 探测”（避免后端返回 JSON 错误被当成文件下载）
3. 若确认为文件流，则触发自动下载（可用 `hooks.onAutoDownload` 自定义）

### 2.5 如何扩展自定义 `$xxx` 字段

如果你们项目需要增加类似旧项目的 `$isMatter/$isReport` 等标记，推荐用 TS 模块增强，而不是在业务里使用 `as any`：

```ts
declare module '@one-base-template/core' {
  interface ObHttpRequestConfig {
    $isMatter?: boolean;
    $isReport?: boolean;
  }
}
```

## 3. 路由守卫与菜单模式

- `setupRouterGuards(router, options?)`：默认实现“未登录跳转登录页 + 菜单 allowedPaths 控制访问”
  - 可注入 `publicRoutePaths/loginRoutePath/forbiddenRoutePath`，避免路由常量多处硬编码
  - 可配置 `allowedSkipMenuAuthRouteNames`，对白名单外的 `skipMenuAuth` 路由执行拒绝并告警（显式传入空数组也会启用严格模式）
- `installRouteDynamicImportRecovery(router)`：动态 import chunk 加载失败自动恢复（单路由一次重试，避免死循环刷新）
- `menuMode=remote|static`
  - `remote`：菜单树来自 adapter（后端）
  - `static`：菜单树从静态路由 `meta.title` 生成（适合简单项目）

注意：本脚手架约定“路由始终静态声明”，菜单只影响**显示与访问控制**，不会做动态 addRoute。

## 4. 存储命名空间与首次路由能力

- `createCore({ storageNamespace })`：为 core 内建状态缓存增加命名空间前缀，避免多应用同域 key 冲突。
- `createCore({ auth: { mode, tokenKey } })`：当应用使用 `token` 鉴权时，core 会按 token + 用户态共同判定登录态，避免残留 `ob_auth_user` 缓存误放行路由。
- 已纳入命名空间规则的存储：auth/system/menu/layout/assets。
- 兼容策略：读取阶段自动回退 legacy key（无命名空间），支持平滑升级。

首次进入路由兜底（根路由重定向）建议使用：

- `getInitialPath({ defaultSystemCode, systemHomeMap, storageNamespace, fallbackHome })`

决策顺序：

1. 命中 `systemHomeMap[当前系统]`
2. 未命中时尝试菜单缓存的首个可访问叶子路径
3. 全部未命中回退 `fallbackHome`

## 5. 通用鉴权收口函数

为减少应用层重复的“登录后拉取用户与菜单”样板代码，core 提供：

- `finalizeAuthSession({ shouldFetchMe })`
  - `shouldFetchMe=true`：适合 token 直登/SSO 落 token 后
  - `shouldFetchMe=false`：适合已执行 `authStore.login()` 的场景
- `safeRedirect(raw, fallback)`：统一站内 redirect 安全校验
- `buildLoginScenario({ ... })`：统一登录页场景判定（是否启用验证登录、是否加载登录页配置、是否提取直登 token）
- `startSsoCallbackStrategy({ searchParams, handlers })`：统一 SSO 参数优先级分派

## 6. 运行时配置 Schema（platform-config）

为降低 admin/其他消费者重复维护配置校验逻辑的成本，core 提供：

- `parseRuntimeConfig(input)`：解析并校验运行时配置对象
- `RuntimeConfig`：配置类型定义（含 `backend/authMode/menuMode/systemHomeMap` 等）

收敛配置建议：

- 支持 `preset=static-single | remote-single`，可自动补全默认字段，降低接入门槛。
- `preset` 模式下强制单系统约束（`systemHomeMap` 仅允许一个系统）。
- `preset` 与显式 `menuMode` 冲突时会直接报错，避免混合模式语义不清。

安全口径约定：

- basic 签名字段统一命名为 `clientSignatureSalt`（公开盐值）
- 若仍传 `clientSignatureSecret`，解析阶段会直接报错并提示改名

## 7. 通用时序守卫（Latest Request Guard）

为减少“异步详情加载/远程搜索”场景中的旧响应回写风险，core 提供：

- `createLatestRequestGuard()`
  - `next()`：生成并推进最新 token
  - `isLatest(token)`：判断当前响应是否仍是最新请求
  - `invalidate()`：在关闭弹层/切换上下文时主动失效旧请求

建议在存在“请求竞态 + 状态回写”的编排层统一使用该守卫，避免模块内重复实现 token 逻辑。

## 8. 路由装配诊断

为减少应用层重复维护装配诊断逻辑，core 提供：

- `getRouteSignature(routes)`：对路由树生成确定性签名
- `getRouteCount(routes)`：统计嵌套路由总数
- `createRouteAssemblyDiagnostics({ routes, skipMenuAuthRouteNames })`：统一产出 routeCount / skipMenuAuthCount / signature
