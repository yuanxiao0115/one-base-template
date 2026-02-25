---
outline: [2]
---

# Utils 工具包

`@one-base-template/utils` 用于承载跨应用复用的通用工具函数，能力迁移自历史项目 `one-admin-monorepo/packages/utils`。

> 想快速按模块查 API：请直接看 [Utils API 速查](/guide/utils-api)。
> 如果你只想“拷贝可用代码”，优先看下方「快速开始」与「在 admin 中使用」。

## 包定位

- **职责边界**：仅提供工具能力，不耦合 `packages/core` 与 `packages/ui` 的业务实现。
- **适用范围**：`apps/admin` 与后续业务应用可直接复用，避免重复造轮子。
- **导出策略**：以命名空间导出为主（`array/tree/format/date/...`），并保留部分兼容导出（如 `createEmitter`、`storage`）。

## 快速开始

### 导入方式

```ts
import {
  array,
  tree,
  format,
  date,
  LocalStorage,
  createEmitter,
  createReactiveState,
} from '@one-base-template/utils'
```

### 常见场景示例

```ts
import { array, tree, format, date, LocalStorage } from '@one-base-template/utils'

// 1) 数组处理
const uniqueList = array.unique([1, 1, 2, 3]) // [1, 2, 3]

// 2) 扁平菜单转树
const menuTree = tree.flatToTree(
  [
    { id: 1, parentId: 0, name: '系统管理' },
    { id: 2, parentId: 1, name: '用户管理' },
  ],
  { rootValue: 0 },
)

// 3) 格式化与日期
const money = format.formatCurrency(123456.789) // ¥123,456.79
const now = date.formatTime(new Date()) // YYYY-MM-DD HH:mm:ss

// 4) 带过期时间的本地存储（毫秒）
const localStorageKit = new LocalStorage({ prefix: 'admin_' })
localStorageKit.set('user', { id: 1, name: 'yuanxiao' }, 60_000)
const user = localStorageKit.get('user')
```

```ts
import { createEmitter, createReactiveState } from '@one-base-template/utils'

// 5) Vue 组件事件透传
const emitter = createEmitter((event, payload) => {
  console.log(event, payload)
})
emitter.success('保存成功', { id: 1 })

// 6) 轻量响应式状态
const { state, setState, resetState } = createReactiveState({ count: 0 })
setState({ count: 1 })
resetState()
console.log(state.count) // 0
```

## 能力清单

| 分类 | 模块 | 代表能力 |
| --- | --- | --- |
| 数据处理 | `array` / `object` / `tree` / `math` / `type` | 去重、分组、树转换、数值计算、类型判断 |
| 格式化 | `format` / `date` / `url` | 金额与敏感信息脱敏、日期格式化、URL 参数处理 |
| 浏览器能力 | `file` / `storage` / `auth` / `base64` | 下载、local/session 封装、cookie/token 辅助、编解码 |
| 安全能力 | `crypto` / `sm3` / `sm4` | 常见加解密与国密摘要/对称加密 |
| Vue 能力 | `vue` / `hooks` | `withInstall`、`createEmitter`、`createReactiveState`、`useLoading/useDialog/useDrawer/useTable` |
| 其他扩展 | `http` / `micro-app` / `pinyin` / `validation` / `tool` | 请求封装、微应用数据桥接、拼音与校验等 |

## 在 admin 中使用

- 页面内直接从 `@one-base-template/utils` 导入即可，无需额外注册插件。
- 推荐以命名空间调用（如 `array.unique`），可读性更高，也便于后续检索与替换。
- 涉及 `localStorage/sessionStorage/window` 的 API 仅应在浏览器环境调用。

## 测试与质量校验

在仓库根目录执行：

```bash
pnpm -C packages/utils typecheck
pnpm -C packages/utils lint
pnpm -C packages/utils test:run
```

> 说明：`packages/utils` 已接入 Vitest + happy-dom；Vue 工具模块采用行为断言（黑盒）测试，避免快照脆弱性。

## 迁移说明

- 当前实现为**整包迁移 + 渐进收敛**策略，优先保证功能可用与可测试。
- 已完成首轮规则收敛（如 `no-unused-vars`、`prefer-const`）。
- 后续会继续收敛迁移期豁免规则（`any` / `unsafe-function-type` / `control-regex`）。
