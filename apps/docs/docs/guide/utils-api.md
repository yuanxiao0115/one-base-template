---
outline: [2, 3]
---

# Utils API 速查（结构化版）

<div class="doc-tldr">
  <strong>TL;DR：</strong>`@one-base-template/utils` 采用“命名空间导出 + 直出高频函数”双轨模型；业务侧优先用命名空间导入，按模块查 API，再用最小示例验证调用。
</div>

## 适用范围

- 适用目录：`packages/utils/src/**`
- 适用场景：业务页面开发、工具函数复用、API 快速检索
- 目标读者：前端业务开发者、基础包维护者

## 1. 导入范式（推荐顺序）

### 1.1 命名空间导入（推荐）

```ts
import { array, tree, format, date, validation } from '@one-base-template/utils';
```

### 1.2 高频函数直出（按需）

```ts
import {
  cloneDeep,
  formatTime,
  getToken,
  setToken,
  LocalStorage,
  encode,
  decode
} from '@one-base-template/utils';
```

> 导出真源：`packages/utils/src/index.ts`

## 2. 模块级 API 索引

### 2.1 数据结构与类型

| 模块     | 常用 API（示例）                                                     | 用途                           |
| -------- | -------------------------------------------------------------------- | ------------------------------ |
| `array`  | `unique` / `groupBy` / `chunk` / `difference` / `sum`                | 数组去重、分组、集合运算、统计 |
| `object` | `deepClone` / `deepMerge` / `get` / `set` / `omit`                   | 对象克隆、合并、路径读写       |
| `tree`   | `flatToTree` / `treeToFlat` / `findNodePath` / `filterTree`          | 菜单树与通用树结构处理         |
| `type`   | `isString` / `isNumber` / `isPlainObject` / `isEmpty`                | 运行时类型判断                 |
| `math`   | `getDistance` / `clamp` / `lerp` / `randomInt` / `standardDeviation` | 计算与统计辅助                 |

### 2.2 格式化、日期与校验

| 模块         | 常用 API（示例）                                                                    | 用途                           |
| ------------ | ----------------------------------------------------------------------------------- | ------------------------------ |
| `format`     | `formatCurrency` / `formatNumber` / `formatPhone` / `hideSensitive` / `toCamelCase` | 金额文本格式化、脱敏、命名转换 |
| `date`       | `formatDate` / `formatTime` / `fromNow` / `diff` / `addTime`                        | 时间格式化与计算               |
| `url`        | `addUrlParam` / `parseUrlParams` / `updateUrlParam` / `buildQueryString`            | URL 参数处理                   |
| `validation` | `isEmail` / `isPhone` / `validatePassword` / `checkPasswordStrength`                | 常见字段与密码校验             |

### 2.3 浏览器、存储与安全

| 模块          | 常用 API（示例）                                                       | 用途                 |
| ------------- | ---------------------------------------------------------------------- | -------------------- |
| `file`        | `getFileInfo` / `formatFileSize` / `validateFileType` / `downloadFile` | 文件信息、校验与下载 |
| `storage`     | `LocalStorage` / `SessionStorage` / `storage`                          | 本地/会话存储封装    |
| `auth`        | `getToken` / `setToken` / `removeToken`                                | token 读写           |
| `base64`      | `encode` / `decode`                                                    | Base64 编解码        |
| `sm3` / `sm4` | `hash` / `encryptedCode` / `decryptedCode`                             | 国密摘要与对称加解密 |
| `crypto`      | `Crypto`                                                               | 通用加密封装         |

### 2.4 工程扩展与 Vue 工具

| 模块          | 常用 API（示例）                                                         | 用途                     |
| ------------- | ------------------------------------------------------------------------ | ------------------------ |
| `http`        | `createRequest` / `formatUrl` / `retryRequest` / `withTimeout`           | 请求辅助与重试超时       |
| `microApp`    | `getMicroData` / `sendBaseInfo` / `MicroAppManager`                      | 微前端与 iframe 数据桥接 |
| `tool`        | `filterNull` / `checkBlobFile` / `getAgeByIdCard`                        | 历史通用工具             |
| `vue`（直出） | `withInstall` / `createPlugin` / `createReactiveState` / `createEmitter` | Vue 组件与状态辅助       |
| `hooks`       | `useLoading`                                                             | 页面级 loading 状态复用  |

## 3. 高频示例

### 3.1 树结构转换（菜单场景）

```ts
import { tree } from '@one-base-template/utils';

const rows = [
  { id: 1, parentId: 0, name: '系统管理' },
  { id: 2, parentId: 1, name: '用户管理' }
];

const menuTree = tree.flatToTree(rows, { rootValue: 0 });
const flatRows = tree.treeToFlat(menuTree);
```

### 3.2 轻量响应式状态

```ts
import { createReactiveState } from '@one-base-template/utils';

const { state, setState, resetState } = createReactiveState({
  keyword: '',
  pageNum: 1
});

setState({ keyword: '统计', pageNum: 1 });
resetState();
```

### 3.3 本地存储（带过期）

```ts
import { LocalStorage } from '@one-base-template/utils';

const local = new LocalStorage({ prefix: 'admin_' });
local.set('user', { id: 1 }, 5 * 60 * 1000);
const user = local.get('user');
```

## 4. 最小可运行路径

在仓库根目录执行：

```bash
pnpm -C packages/utils typecheck
pnpm -C packages/utils lint
pnpm -C apps/docs build
```

通过标准：

1. `utils` 包类型与 lint 通过。
2. docs 构建通过。

## 5. 常见问题

| 问题                | 原因                  | 解决方式                                       |
| ------------------- | --------------------- | ---------------------------------------------- |
| 不确定 API 是否存在 | 文档和源码不一致      | 以 `packages/utils/src/index.ts` 导出为准      |
| 导入后体积变大      | 直接全量导入过多模块  | 优先使用命名空间并按需引用                     |
| Hook 找不到         | Hook 已迁移到 core/ui | 先看 [CRUD 容器与 Hook](/guide/crud-container) |

## 6. 相关阅读

- [Utils 工具包总览](/guide/utils)
- [CRUD 容器与 Hook](/guide/crud-container)
- [目录结构与边界](/guide/architecture)
