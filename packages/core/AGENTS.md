# AGENTS.MD（packages/core）

> 适用范围：`/Users/haoqiuzhi/code/one-base-template/packages/core/**`
>
> 先遵循根规则：`/Users/haoqiuzhi/code/one-base-template/AGENTS.md`

## 核心职责

- core 只承载逻辑、状态、契约与可复用 hooks。
- core 输出必须可被不同 app/ui 复用，避免绑定具体页面实现。

## 必须遵守

- **禁止**引入 `element-plus` 或其他具体 UI 组件库。
- **禁止**写死某个后端字段形态（由 adapters 负责适配）。
- 主题能力优先下沉到 core：admin 侧仅做主题注册与组装。
- `link` 不归类为 core feedback 状态集合；保持静态 token，仅用于 Element `link` 与链接语义展示。
- `useTable` 必须支持“全局默认 + 页面局部覆盖”的分页参数键与响应结构适配（局部优先）。
- `useEntityEditor` 保存入口保持结构化语义：`entity/form/detail/save`，流程固定 `save.buildPayload -> save.request -> save.onSuccess`，避免使用歧义命名 `submit`。

## 测试与验证（core）

```bash
pnpm -C packages/core typecheck
pnpm -C packages/core lint
pnpm -C packages/core test
pnpm -C packages/core build
```
