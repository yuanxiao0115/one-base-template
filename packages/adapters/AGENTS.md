# AGENTS.MD（packages/adapters）

> 适用范围：`/Users/haoqiuzhi/code/one-base-template/packages/adapters/**`
>
> 先遵循根规则：`/Users/haoqiuzhi/code/one-base-template/AGENTS.md`

## 核心职责

- adapters 只负责“后端协议适配 + 字段映射 + 请求参数转换”。
- 向上提供稳定契约，屏蔽不同后端实现差异。

## 必须遵守

- 禁止引入 UI 组件库或页面渲染逻辑。
- 禁止依赖 `apps/admin` 代码；仅通过共享契约与类型交互。
- 默认按真实后端接口语义设计；仅在用户明确要求时提供 mock 分支。
- 不在 adapter 层实现业务页面状态（分页选中、弹窗显示等）。

## 推荐验证命令（adapters）

```bash
pnpm -C packages/adapters typecheck
pnpm -C packages/adapters lint
pnpm -C packages/adapters build
```
