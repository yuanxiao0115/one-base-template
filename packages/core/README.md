# @one-base-template/core

本包是脚手架的“纯逻辑核心”，目标是让 `apps/*` 与 `packages/ui` 都能在不耦合具体后端字段、也不依赖 UI 库的前提下复用鉴权/菜单/SSO/主题/tabs/http 等能力。

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
- `$isAuth?: boolean` + `token?: string`：token/mixed 模式下，允许单次请求显式传 token
- `beforeRequestCallback / beforeResponseCallback`：单次请求回调（优先级高于全局）

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
