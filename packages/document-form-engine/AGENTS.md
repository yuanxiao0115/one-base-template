# AGENTS.MD（packages/document-form-engine）

> 适用范围：`/Users/haoqiuzhi/code/one-base-template/packages/document-form-engine/**`
>
> 先遵循根规则：`/Users/haoqiuzhi/code/one-base-template/AGENTS.md`

## 核心职责

- `document-form-engine` 负责公文表单设计器、运行时渲染与物料协议。
- 包内实现必须保持“共享能力”定位，不能写死 `apps/admin` 私有逻辑。

## 强制约束

- **禁止**依赖 `apps/*` 下的任何源码。
- 业务差异通过注册与注入解决，不在包内直接引用具体应用组件。
- schema、物料定义、运行时渲染必须优先保证可序列化与可测试。
