# Utils 工具包

`@one-base-template/utils` 用于承载跨应用复用的工具函数，能力迁移自历史项目 `one-admin-monorepo/packages/utils`。

## 包定位

- **定位**：通用工具层（与 `core` / `ui` 解耦），可被 `apps/admin` 与后续业务应用直接复用。
- **导出方式**：以命名空间导出为主（例如 `array` / `tree` / `format`），同时保留部分兼容导出。
- **测试方案**：使用 `Vitest`，并采用 `happy-dom` 环境覆盖浏览器相关 API（storage、cookie、Vue 工具等）。

## 已迁移模块

- 基础工具：`array`、`object`、`tree`、`url`、`type`、`math`、`tool`、`validation`
- 格式化与日期：`format`、`date`
- 浏览器与存储：`file`、`storage`、`auth`、`base64`
- 安全相关：`crypto`、`sm3`、`sm4`
- Vue 相关：`vue`、`hooks`
- 其他：`http`、`micro-app`、`pinyin`

## 使用示例

```ts
import { array, tree, format, date, createEmitter } from '@one-base-template/utils';

const uniqueList = array.unique([1, 1, 2, 3]);
const menuTree = tree.arrayToTree(
  [
    { id: 1, parentId: 0, name: '系统管理' },
    { id: 2, parentId: 1, name: '用户管理' }
  ],
  { id: 'id', parentId: 'parentId' }
);

const money = format.formatCurrency(123456.789); // ¥123,456.79
const now = date.formatTime(new Date()); // 2024-01-05 12:00:00（示例）

const emitter = createEmitter((event, payload) => {
  console.log(event, payload);
});
emitter.success('保存成功', { id: 1 });
```

## 质量校验

在仓库根目录执行：

```bash
pnpm -C packages/utils typecheck
pnpm -C packages/utils lint
pnpm -C packages/utils test:run
```

> 说明：Vue 工具模块补充了行为测试，遵循 `vue-testing-best-practices`（黑盒断言、避免快照依赖）。
