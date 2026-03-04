# AGENTS.MD（packages/utils）

> 适用范围：`/Users/haoqiuzhi/code/one-base-template/packages/utils/**`
>
> 先遵循根规则：`/Users/haoqiuzhi/code/one-base-template/AGENTS.md`

## 核心职责

- `utils` 子包沉淀跨项目通用工具函数（数组/对象/树/日期/校验等）。
- 优先提供稳定、可测试、可复用的通用 API，避免夹带业务特例。

## 必须遵守

- 以纯函数和确定性输出优先，避免隐式副作用。
- 禁止引入页面层依赖（Vue 组件、Element Plus、业务 store）。
- 命名遵循“短、清楚、通用”，优先“动词 + 名词”。

## 验证命令（utils）

```bash
pnpm -C packages/utils typecheck
pnpm -C packages/utils lint
pnpm -C packages/utils test
pnpm -C packages/utils build
```
