---
outline: [2]
---

# Utils API 速查

> 本页提供 `@one-base-template/utils` 的模块级快速索引，方便在业务开发中按需检索。  
> 完整实现请以源码为准：`/Users/haoqiuzhi/code/one-base-template/packages/utils/src`

## 导入范式

### 1) 命名空间导入（推荐）

```ts
import { array, tree, format, date, validation, hooks } from '@one-base-template/utils'
```

### 2) 直接导入（兼容导出）

```ts
import {
  createEmitter,
  createReactiveState,
  LocalStorage,
  SessionStorage,
  encode,
  decode,
  hash,
  encryptedCode,
  decryptedCode,
} from '@one-base-template/utils'
```

## 模块速查（按能力分组）

### 数据处理

| 模块 | 常用 API | 用途 |
| --- | --- | --- |
| `array` | `unique` / `groupBy` / `chunk` / `sortBy` / `difference` / `sum` | 数组去重、分组、切片、排序、集合运算、统计 |
| `object` | `deepClone` / `deepMerge` / `get` / `set` / `omit` | 对象深拷贝、合并、路径读写、字段裁剪 |
| `tree` | `flatToTree` / `treeToFlat` / `findNodePath` / `filterTree` / `traverseTree` | 菜单树与通用树结构转换、检索与遍历 |
| `math` | `getDistance` / `clamp` / `lerp` / `randomInt` / `standardDeviation` | 几何计算、范围收敛、随机与统计计算 |
| `type` | `isString` / `isNumber` / `isPlainObject` / `isEmpty` / `getType` | 运行时类型判断 |

### 格式化与日期

| 模块 | 常用 API | 用途 |
| --- | --- | --- |
| `format` | `formatCurrency` / `formatNumber` / `formatPhone` / `hideSensitive` / `toCamelCase` | 金额与文本格式化、敏感信息脱敏、命名风格转换 |
| `date` | `formatDate` / `formatTime` / `fromNow` / `diff` / `addTime` / `isToday` | 日期格式化、相对时间、时间差与时间偏移 |
| `url` | `addUrlParam` / `parseUrlParams` / `updateUrlParam` / `buildQueryString` | URL 参数读写与查询串拼接 |
| `validation` | `isEmail` / `isPhone` / `isIdCard` / `validatePassword` / `checkPasswordStrength` | 常见字段校验与密码强度检测 |

### 浏览器与存储

| 模块 | 常用 API | 用途 |
| --- | --- | --- |
| `file` | `getFileInfo` / `formatFileSize` / `validateFileType` / `readFileAsText` / `downloadFile` | 文件信息识别、大小格式化、读写与下载 |
| `storage` | `LocalStorage` / `SessionStorage` / `storage` | 本地与会话存储封装（支持过期时间） |
| `auth` | `getToken` / `setToken` / `removeToken` | token 读写辅助 |
| `base64` | `encode` / `decode` | Base64 编码与解码 |

### 安全与编码

| 模块 | 常用 API | 用途 |
| --- | --- | --- |
| `crypto` | `Crypto` | 常见加密能力封装 |
| `sm3` | `hash` | 国密 SM3 摘要 |
| `sm4` | `encryptedCode` / `decryptedCode` | 国密 SM4 对称加解密 |
| `pinyin` | `getPinYin` / `getPinYinFirstCharacter` | 中文转拼音与首字母 |

### Vue 与交互

| 模块 | 常用 API | 用途 |
| --- | --- | --- |
| `vue`（直接导出） | `withInstall` / `createPlugin` / `createValidator` / `createReactiveState` / `createEmitter` | 组件安装、插件封装、状态与事件工具 |
| `hooks` | `useLoading` / `useDialog` / `useDrawer` / `useTable` | 页面级 loading、弹窗、抽屉与表格逻辑复用 |

### useTable（新旧双模式）

`useTable` 返回值同时覆盖历史字段与新字段，迁移期可按需渐进使用。

#### 兼容旧字段（常用）

- `dataList`、`loading`、`pagination`
- `onSearch`、`resetForm`
- `handleSelectionChange`、`onSelectionCancel`
- `handleSizeChange`、`handleCurrentChange`
- `selectedList`、`selectedNum`
- `onDelete`、`deleteRow`、`batchDelete`

#### 新增能力字段（推荐）

- 请求：`fetchData`、`getData`、`getDataDebounced`、`cancelDebouncedSearch`
- 刷新策略：`refreshCreate`、`refreshUpdate`、`refreshRemove`、`refreshData`、`refreshSoft`
- 缓存：`cacheInfo`、`clearCache`、`clearExpiredCache`
- 状态：`error`、`searchParams`、`clearData`、`cancelRequest`

#### 新模式配置关键项

- `core.paginationKey`：主分页字段（如 `current/size`）
- `core.paginationAlias`：分页别名（如 `page/currentPage/pageSize`）
- `transform.responseAdapter`：统一后端响应结构
- `performance.enableCache` / `cacheTime` / `debounceTime`

### 其他扩展

| 模块 | 常用 API | 用途 |
| --- | --- | --- |
| `http` | `createRequest` / `formatUrl` / `parseQueryString` / `withTimeout` / `retryRequest` | 请求封装、URL 处理、超时与重试 |
| `microApp` | `getMicroData` / `getAppName` / `getIframeData` / `sendBaseInfo` | 微前端宿主与 iframe 数据桥接 |
| `tool` | `filterNull` / `downloadFile` / `checkBlobFile` / `getAgeByIdCard` | 历史业务通用小工具 |

## 高频示例

### 树结构转换（菜单常用）

```ts
import { tree } from '@one-base-template/utils'

const rows = [
  { id: 1, parentId: 0, name: '系统管理' },
  { id: 2, parentId: 1, name: '用户管理' },
]

const menuTree = tree.flatToTree(rows, { rootValue: 0 })
const flatRows = tree.treeToFlat(menuTree)
```

### 轻量响应式状态

```ts
import { createReactiveState } from '@one-base-template/utils'

const { state, setState, resetState } = createReactiveState({
  keyword: '',
  pageNum: 1,
})

setState({ keyword: '统计', pageNum: 1 })
resetState()
```

### 本地存储（带过期）

```ts
import { LocalStorage } from '@one-base-template/utils'

const local = new LocalStorage({ prefix: 'admin_' })
local.set('user', { id: 1 }, 5 * 60 * 1000)
const user = local.get('user')
```

## 质量校验

```bash
pnpm -C packages/utils typecheck
pnpm -C packages/utils lint
pnpm -C packages/utils test:run
pnpm -C apps/docs build
```

## 相关文档

- [Utils 工具包总览](/guide/utils)
- [目录结构与边界](/guide/architecture)
