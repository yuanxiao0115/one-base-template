# Management Module Bridge

## 何时进入这条分支

同时满足以下条件时进入：

- 目标路径位于 `apps/admin/src/modules/*Management/**`
- 任务包含列表 / 搜索 / 弹窗 / CRUD
- 需求既是“老项目迁移”，又要求对齐当前 admin 基线

如果只是老项目普通模块迁移，留在主流程；如果只是已迁入模块横向整改，直接用 `$admin-management-standardizer`。

## 必读规则源

1. `/Users/haoqiuzhi/code/one-base-template/apps/admin/AGENTS.md`
2. `/Users/haoqiuzhi/code/one-base-template/apps/docs/docs/guide/admin-agent-redlines.md`
3. `/Users/haoqiuzhi/code/one-base-template/apps/docs/docs/guide/crud-module-best-practice.md`
4. `/Users/haoqiuzhi/code/one-base-template/.codex/skills/admin-management-standardizer/references/rollout-workflow.md`
5. `/Users/haoqiuzhi/code/one-base-template/.codex/skills/admin-management-standardizer/references/checklists.md`
6. `/Users/haoqiuzhi/code/one-base-template/.codex/skills/admin-management-standardizer/references/scope-guard.md`
7. `/Users/haoqiuzhi/code/one-base-template/.codex/skills/crud-module-best-practice/references/position-crud-blueprint.md`

## 强制接入的技能

- 使用 `$admin-management-standardizer`
- 使用 `$crud-module-best-practice`

## 当前仓库优先级修正

当 `$crud-module-best-practice` 与当前 admin 规则冲突时，以 `apps/admin/AGENTS.md` 为准。

当前必须显式修正的点：

- CRUD 编排页文件名统一使用 `list.vue`，不要继续新建 `page.vue`
- 路由注册统一收口在模块 `routes.ts`
- 删除链路优先走 `table.remove` / `actions.remove(row)`，不要在页面手写重复删除流程
- `adminManagement` 页面统一使用 `obConfirm`，不要回退 `ElMessageBox`
- 页面状态按 `table / editor / options / actions` 语义分组

## 迁移落地检查

### 结构

- `api.ts`
- `form.ts`
- `columns.tsx`
- `list.vue`
- `components/*EditForm.vue`
- `components/*SearchForm.vue`
- 需要时增加 `composables/` 或 `actions.ts`
- 模块 `routes.ts`

### 路由与表格

- 每个新页面都要在 `routes.ts` 同次变更内注册
- 路由目标文件必须真实存在
- 树表展示列必须显式配置 `treeNode: true`
- `useTable` 响应适配要确认兼容分页对象和 `data: []` 直返数组

### 标准化

- 不把 `UserManagement` 当唯一模板
- 页面只保留编排，不把历史映射堆回模板或点击事件
- 左树 + 右表场景优先服从现有 `ObTree` / `PageContainer` / `ObVxeTable` 基线
- 远程搜索、弹窗初始化、批量操作要补齐最新请求守卫或失败提示语义
