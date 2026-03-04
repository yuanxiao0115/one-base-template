# AGENTS 规则分层与适用范围

## 背景

随着仓库内模块数量增多，把所有规则都堆在根目录 `AGENTS.md` 会带来两个问题：

- 子项目无关规则干扰实现判断，增加误操作风险。
- 同类规则分散后难维护，容易出现冲突与过期描述。

本仓库已改为“**根目录全局规则 + 子项目专属规则**”双层结构。

## 规则文件总览

| 作用域 | 规则文件 | 主要内容 |
| --- | --- | --- |
| 全仓通用 | `AGENTS.md` | 工作流、协作规范、提交约束、全局边界 |
| admin 应用 | `apps/admin/AGENTS.md` | 路由菜单、SSO、布局主题、表格迁移、UserManagement 细则 |
| docs 站点 | `apps/docs/AGENTS.md` | 文档同步、导航维护、VitePress 构建校验 |
| adapters 子包 | `packages/adapters/AGENTS.md` | 后端协议适配、字段映射边界 |
| core 子包 | `packages/core/AGENTS.md` | 逻辑契约、主题 token、核心 hooks 约束 |
| ui 子包 | `packages/ui/AGENTS.md` | 壳组件导出边界、`ObVxeTable` 与视觉规范 |
| lint-ruleset 子包 | `packages/lint-ruleset/AGENTS.md` | 规则映射、双口径统计、发布校验 |
| tag 子包 | `packages/tag/AGENTS.md` | 样式资产与入口导出规范 |
| utils 子包 | `packages/utils/AGENTS.md` | 通用工具函数语义与纯函数边界 |

## 既有规则分类结果

### 1) 全局规则（保留在根目录）

- 技能优先、完整开发工作流、中文沟通要求。
- `.codex` 工作文档必须先读后维护。
- 文档与代码同步、提交策略、分支策略等协作规范。

### 2) admin 专属规则（迁入 `apps/admin/AGENTS.md`）

- 静态路由 + 动态菜单、`allowedPaths` 权限模型。
- `/sso` 登录回调、Cookie 模式鉴权。
- Layout/TopBar/个性设置规范、UserManagement 迁移细则。
- 表格迁移样式与结构规范（`ObPageContainer + ObTableBox + ObVxeTable`）。

### 3) core/ui/lint-ruleset 专属规则（分别下沉）

- `packages/core`：主题能力下沉、`useTable` 局部覆盖、`useEntityEditor` 保存语义。
- `packages/ui`：内部组件禁止对外暴露、菜单激活态 token 约束、`ObVxeTable` 视觉与布局规范。
- `packages/lint-ruleset`：规则统计双口径、`full-frontend-summary.json` 作为唯一事实源。

## 新增规则的落盘原则

1. 规则仅影响一个子项目：写入该子项目 `AGENTS.md`。
2. 规则影响全仓协作：写入根目录 `AGENTS.md`。
3. 同一规则只保留一个“主版本”，其他文件仅引用，避免重复维护。

## 维护建议

- 每次新增规则后，回查本页的“规则文件总览”是否仍与仓库结构一致。
- 子项目目录新增/拆分时，同步补齐对应 `AGENTS.md` 与本页映射表。
