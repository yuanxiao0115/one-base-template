# AGENTS.MD（packages/tag）

> 适用范围：`/Users/haoqiuzhi/code/one-base-template/packages/tag/**`
>
> 先遵循根规则：`/Users/haoqiuzhi/code/one-base-template/AGENTS.md`

## 核心职责

- `tag` 子包负责主题样式资产、样式入口与视觉层基础能力。
- 对外提供稳定样式入口，避免上层应用直接依赖内部文件结构。

## 必须遵守

- 禁止在 `tag` 子包引入业务页面逻辑。
- 禁止依赖 `apps/admin` 模块，保持可复用与低耦合。
- 样式入口改动需同步检查 admin 侧别名与导入路径（如 `@one-base-template/tag/style`）。

## 验证命令（tag）

```bash
pnpm -C packages/tag typecheck
pnpm -C packages/tag lint
pnpm -C packages/tag build
```
