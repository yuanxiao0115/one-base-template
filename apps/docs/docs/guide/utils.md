---
outline: [2, 3]
---

# Utils 工具包

## TL;DR

- `@one-base-template/utils` 是跨应用通用工具库，定位是“纯工具能力”，不承载 UI 或业务流程。
- 日常使用建议优先命名空间导入（如 `array`、`tree`、`format`），常用能力可用直出（如 `cloneDeep`、`formatTime`）。
- 改动 utils 后，至少跑 `packages/utils` 的 `typecheck + lint`，再按影响范围补应用验证。

## 适用范围

- 适用于：`apps/admin`、`apps/admin-lite`、`apps/portal` 及后续业务应用。
- 适用于：数组/树/日期/格式化/浏览器能力/加解密等通用工具复用。
- 不适用于：组件封装、状态管理、路由权限等业务逻辑（应放在 `core` 或 `ui`）。

## 前置条件

1. 已安装仓库依赖并可执行 `pnpm`。
2. 明确当前需求属于“通用工具”，不是业务专属逻辑。
3. 知道目标导出入口：`packages/utils/src/index.ts`。

## 包定位与边界

- 职责边界：只提供工具能力，不耦合 `packages/core` 与 `packages/ui` 的业务实现。
- 导出策略：以命名空间导出为主（`array/tree/format/date/...`），并保留兼容导出（如 `createEmitter`、`storage`）。
- 常用直出：`cloneDeep`、`deepClone`、`formatTime`。

## 最短执行路径

### 1. 先确认导出能力

查看统一入口：`packages/utils/src/index.ts`。

可用命令：

```bash
rg -n "export \* as|export \{ cloneDeep|export \{ formatTime" packages/utils/src/index.ts
```

### 2. 在业务侧按命名空间导入

```ts
import { array, tree, format, date, LocalStorage } from '@one-base-template/utils';

const uniqueList = array.unique([1, 1, 2, 3]);
const menuTree = tree.flatToTree(
  [
    { id: 1, parentId: 0, name: '系统管理' },
    { id: 2, parentId: 1, name: '用户管理' }
  ],
  { rootValue: 0 }
);

const money = format.formatCurrency(123456.789);
const now = date.formatTime(new Date());

const localStorageKit = new LocalStorage({ prefix: 'admin_' });
localStorageKit.set('user', { id: 1, name: 'yuanxiao' }, 60_000);
```

### 3. 需要直出能力时按需使用

```ts
import { cloneDeep, formatTime } from '@one-base-template/utils';

const copied = cloneDeep({ a: 1 });
const text = formatTime(new Date());
```

### 4. 改动后执行最小验证

```bash
pnpm -C packages/utils typecheck
pnpm -C packages/utils lint
```

如果改动已被应用侧使用，建议补跑目标应用：

```bash
pnpm -C apps/admin typecheck
pnpm -C apps/admin lint
```

## 能力清单（按模块）

| 分类       | 模块                                                    | 代表能力                                                            |
| ---------- | ------------------------------------------------------- | ------------------------------------------------------------------- |
| 数据处理   | `array` / `object` / `tree` / `math` / `type`           | 去重、分组、树转换、数值计算、类型判断                              |
| 格式化     | `format` / `date` / `url`                               | 金额脱敏、日期格式化、URL 参数处理                                  |
| 浏览器能力 | `file` / `storage` / `auth` / `base64`                  | 下载、local/session 封装、cookie/token 辅助                         |
| 安全能力   | `crypto` / `sm3` / `sm4`                                | 常见加解密与国密能力                                                |
| Vue 能力   | `vue` / `hooks`                                         | `withInstall`、`createEmitter`、`createReactiveState`、`useLoading` |
| 其他扩展   | `http` / `micro-app` / `pinyin` / `validation` / `tool` | 请求封装、微应用数据桥接、拼音与校验                                |

## 验证与验收

通过标准：

1. `packages/utils` 的 `typecheck` 与 `lint` 通过。
2. 导出入口与文档示例一致（命名空间与直出能力可用）。
3. 影响到应用侧时，目标应用校验通过。

## FAQ

### 新工具应该放到 utils 还是 core？

若是跨应用、无业务语义的通用方法，放 `utils`；涉及业务流程、鉴权、路由等放 `core`。

### 为什么推荐命名空间导入？

可读性更好，检索与批量替换成本更低，也能减少命名冲突。

### CRUD Hook 在 utils 里吗？

不是。`useTable/useEntityEditor/useCrudPage` 已迁移到 `@one-base-template/core`（真源）+ `@one-base-template/ui`（`useEntityEditor` 薄封装）。

## 相关阅读

- [Utils API 速查（按模块）](/guide/utils-api)
- [CRUD 容器与 Hook（进阶）](/guide/crud-container)
- [表格开发规范](/guide/table-vxe-migration)
