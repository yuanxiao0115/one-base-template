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
import { createObHttp } from '@one-base-template/core'

const http = createObHttp({
  axios: { baseURL: '/api', withCredentials: true },
  auth: {
    mode: 'cookie', // cookie | token | mixed
    getToken: () => localStorage.getItem('ob_token') || undefined,
  },
  biz: {
    // 默认约定：{ code, data, message }
    successCodes: [0, 200],
    logoutCodes: [401, 1000, 1003, 1020],
  },
  hooks: {
    onBizError: ({ message }) => console.error(message),
    onUnauthorized: () => console.warn('unauthorized'),
  },
})

await http.post('/auth/login', { data: { username: 'demo', password: 'demo' } })
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

1) 自动切换 `responseType=blob`
2) 先对 blob 做“有限 JSON 探测”（避免后端返回 JSON 错误被当成文件下载）
3) 若确认为文件流，则触发自动下载（可用 `hooks.onAutoDownload` 自定义）

### 2.5 如何扩展自定义 `$xxx` 字段

如果你们项目需要增加类似旧项目的 `$isMatter/$isReport` 等标记，推荐用 TS 模块增强，而不是在业务里使用 `as any`：

```ts
declare module '@one-base-template/core' {
  interface ObHttpRequestConfig {
    $isMatter?: boolean
    $isReport?: boolean
  }
}
```

## 3. 路由守卫与菜单模式

- `setupRouterGuards(router)`：默认实现“未登录跳转登录页 + 菜单 allowedPaths 控制访问”
- `menuMode=remote|static`
  - `remote`：菜单树来自 adapter（后端）
  - `static`：菜单树从静态路由 `meta.title` 生成（适合简单项目）

注意：本脚手架约定“路由始终静态声明”，菜单只影响**显示与访问控制**，不会做动态 addRoute。

## 4. 存储命名空间与首次路由能力

- `createCore({ storageNamespace })`：为 core 内建状态缓存增加命名空间前缀，避免多应用同域 key 冲突。
- 已纳入命名空间规则的存储：auth/system/menu/layout/assets。
- 兼容策略：读取阶段自动回退 legacy key（无命名空间），支持平滑升级。

首次进入路由兜底（根路由重定向）建议使用：

- `getInitialPath({ defaultSystemCode, systemHomeMap, storageNamespace, fallbackHome })`

决策顺序：
1) 命中 `systemHomeMap[当前系统]`
2) 未命中时尝试菜单缓存的首个可访问叶子路径
3) 全部未命中回退 `fallbackHome`

## 5. 通用鉴权收口函数

为减少应用层重复的“登录后拉取用户与菜单”样板代码，core 提供：

- `finalizeAuthSession({ shouldFetchMe })`
  - `shouldFetchMe=true`：适合 token 直登/SSO 落 token 后
  - `shouldFetchMe=false`：适合已执行 `authStore.login()` 的场景
- `safeRedirect(raw, fallback)`：统一站内 redirect 安全校验

## 6. 运行时配置 Schema（platform-config）

为降低 admin/其他消费者重复维护配置校验逻辑的成本，core 提供：

- `parseRuntimeConfig(input)`：解析并校验运行时配置对象
- `RuntimeConfig`：配置类型定义（含 `backend/authMode/menuMode/systemHomeMap` 等）

安全口径约定：

- sczfw 签名字段统一命名为 `clientSignatureSalt`（公开盐值）
- 若仍传 `clientSignatureSecret`，解析阶段会直接报错并提示改名
