# Admin Management Standardizer 设计稿

> 状态：已确认，进入实施
> 决策日期：2026-03-23
> 适用范围：`docs/plans/**`、`.codex/skills/admin-management-standardizer/**`、`apps/docs/**`

## 1. 背景

在 `UserManagement` 的一轮 CR 收口后，已经沉淀出一批可复用规则：

- CRUD 页面应保持“页面只编排、映射与副作用下沉”的结构。
- 列表 / 搜索 / 弹窗 / 批量操作需要统一可读性、性能与稳定性基线。
- 规则来源不等于规则作用域：即使规则最初从 `UserManagement` 总结出来，只要会横向推广到其他 `*Management` 模块，就不能继续当作 `UserManagement` 私有经验维护。

当前问题不是继续深挖 `UserManagement` 业务细节，而是把已验证规则稳定地推广到其他 `apps/admin/src/modules/*Management/**` 模块。仅靠口头说明或一次性 review 结论，后续容易漂移，因此需要一个仓库内可发现、可执行、可复用的本地 skill。

## 2. 目标

本次新增一个 repo-local skill：`admin-management-standardizer`。

目标：

1. 让 agent 在面对 `*Management` 模块横向整改时，有统一的执行入口。
2. 明确 skill 只是“执行器”，不与 `AGENTS.md` / docs 形成双维护规则源。
3. 固化一条稳定流程：命中范围判断 -> 读取规则源 -> 扫描差异 -> 落计划 -> 改代码 -> 跑门禁 -> 把新规则上提。
4. 首版只覆盖 admin 管理模块最常见的列表 / 弹窗 / CRUD 标准化，不扩大到跨包重构。

## 3. 范围冻结

### 3.1 本期必须做

1. 新增本地 skill：`.codex/skills/admin-management-standardizer`
2. skill 目录包含：
   - `SKILL.md`
   - `agents/openai.yaml`
   - `references/rollout-workflow.md`
   - `references/checklists.md`
   - `references/scope-guard.md`
   - `assets/rollout-plan-template.md`
3. 新增设计稿与实施计划到 `docs/plans/`
4. 在 `apps/docs` 增加一页说明文档，并接入导航入口
5. 验证 skill 文档与 docs 构建可通过

### 3.2 本期不做

1. 不创建全局 `~/.codex/skills` skill
2. 不把规则全文复制进 skill，避免与 `AGENTS.md` / docs 双维护
3. 不覆盖 `apps/portal`、`packages/core`、`packages/ui`、`packages/adapters`
4. 不把启动链路、主题系统、跨包适配器改造塞进首版 skill
5. 不引入额外脚本，首版以静态文档 + 参考清单为主

## 4. 方案对比

### 方案 A：继续用 `UserManagement` 作为唯一模板

- 优点：上手最快
- 缺点：会把“来源模块”误当成“规则作用域”，横向推广时容易携带业务私货

### 方案 B：把规则直接写死进 skill

- 优点：skill 自包含
- 缺点：规则源漂移风险最高，后续 `AGENTS.md` / docs 更新后 skill 容易过期

### 方案 C：skill 只负责执行，规则主版本继续留在 `AGENTS.md` 与 docs（采用）

- 优点：
  - 规则单一来源清晰
  - skill 体积可控，触发成本低
  - 后续推广到其他模块时，只需要更新规则源与参考清单
- 缺点：
  - skill 首次执行需要先读取规则源，流程约束要写清楚

## 5. 最终设计

### 5.1 定位

`admin-management-standardizer` 是一个“横向标准化执行器”，不是 `UserManagement` 迁移手册，也不是新的规则主版本。

它处理的核心问题是：

- 当前目标模块是否适合按管理模块基线整改
- 需要读取哪些规则源
- 如何把发现的问题组织成计划并直接推进改造
- 何时应把新规则继续上提到更高作用域

### 5.2 目录结构

```text
.codex/skills/admin-management-standardizer/
├── SKILL.md
├── agents/
│   └── openai.yaml
├── references/
│   ├── rollout-workflow.md
│   ├── checklists.md
│   └── scope-guard.md
└── assets/
    └── rollout-plan-template.md
```

设计原则：

- `SKILL.md` 只放触发条件、主流程、硬限制与引用导航。
- `references/` 放可按需读取的长文档。
- `assets/` 只放输出模板，不放知识说明。
- `agents/openai.yaml` 只承担 UI 元数据，不承载流程规则。

### 5.3 SKILL.md 最小必要内容

`SKILL.md` 仅保留以下信息：

1. **触发条件**
   - 用户要求“按 UserManagement 规则推广到 XManagement”
   - 用户要求“横向整改某个 `*Management` 模块”
   - 用户要求“直接检查并修某个管理模块的 CRUD 红线问题”
2. **执行入口**
   - 先判定是否命中 `apps/admin/src/modules/*Management/**`
   - 再读取规则源与范围护栏
   - 然后输出计划并推进实施
3. **三条硬限制**
   - 不允许把 `UserManagement` 当唯一模板
   - 不允许把范围外目录强行纳入改造
   - 不允许只改代码不改文档 / 不做验证
4. **引用导航**
   - 需要看执行流程时读 `references/rollout-workflow.md`
   - 需要看清单时读 `references/checklists.md`
   - 需要做作用域判断时读 `references/scope-guard.md`

明确不放入 `SKILL.md` 的内容：

- 不复制 `AGENTS.md`、`admin-agent-redlines.md`、`crud-module-best-practice.md` 的长段规则
- 不堆砌示例 diff
- 不写一次性项目背景和历史复盘

### 5.4 参考文件职责

#### `references/rollout-workflow.md`

记录 skill 的 7 步执行流：

1. 判定是否命中范围
2. 读取规则源并完成作用域判断
3. 扫描目标模块并产出差异清单
4. 写入 `docs/plans/` 落地计划
5. 按计划直接推进改造
6. 执行固定门禁
7. 把新发现的可复用规则上提

#### `references/checklists.md`

记录三类清单：

1. 进入前自检：范围、依赖、现有模式、脏工作区风险
2. 实施中清单：页面编排、状态分组、请求次数、错误反馈、门禁覆盖
3. 收口清单：文档同步、验证命令、规则上提、提交范围核对

#### `references/scope-guard.md`

专门回答两个问题：

1. 哪些规则可以从 `UserManagement` 上提到 `apps/admin` 层
2. 哪些规则仍然必须留在模块私有作用域

这一页必须显式强调：**规则来源不等于规则作用域。**

#### `assets/rollout-plan-template.md`

提供一个面向 `docs/plans/` 的最小计划模板，要求包含：

- Goal / Architecture / Tech Stack
- 任务拆分
- 需要修改的文件
- 验证命令
- 文档同步项

### 5.5 执行流

skill 首版执行流固定为：

1. **范围命中**：只接 `apps/admin/src/modules/*Management/**`
2. **规则读取**：优先读根 `AGENTS.md`、`apps/admin/AGENTS.md`、`apps/docs/docs/guide/agents-scope.md`、`apps/docs/docs/guide/admin-agent-redlines.md`、`apps/docs/docs/guide/crud-module-best-practice.md`
3. **差异扫描**：以“精简、性能、稳定性、可维护性、团队可接受度”为维度做模块差异盘点
4. **计划落盘**：把差异整理为 `docs/plans/YYYY-MM-DD-<module>-standardization-plan.md`
5. **直接推进**：默认不是“只评审”，而是直接实施整改
6. **门禁验证**：至少运行目标模块相关测试 + `pnpm -C apps/admin typecheck` + `pnpm -C apps/admin lint` + `pnpm -C apps/admin build`，文档有变更时补 `pnpm -C apps/docs lint/build`
7. **规则上提**：若新结论具备横向价值，写回更高作用域规则源，而不是塞回单模块说明

### 5.6 验证与防漂移

本次 skill 的验证分三层：

1. **结构校验**：skill 目录完整，`SKILL.md` frontmatter 合法，`agents/openai.yaml` 与 skill 内容一致
2. **前向测试**：用 2-3 组真实触发语句检查 skill 是否容易被发现、是否会误把范围外目录纳入执行
3. **文档同步校验**：`apps/docs` 新页面与导航一致，构建通过

防漂移策略：

- 规则主版本继续放在 `AGENTS.md` 与 `apps/docs/docs/guide/*`
- skill 只引用规则，不复制规则正文
- 当规则发生变化时，优先更新规则源，再检查 skill 的引用与清单是否仍然成立

## 6. 验收口径

满足以下条件即可视为完成：

1. `.codex/skills/admin-management-standardizer/**` 目录完整
2. `SKILL.md` 明确触发条件、执行流程与硬限制
3. `references/*` 能覆盖执行流、清单、作用域判断三类信息
4. skill 未把 `UserManagement` 写成唯一模板
5. `apps/docs` 存在对应说明页，并已接入导航与总览入口
6. `pnpm -C apps/docs lint`
7. `pnpm -C apps/docs build`
8. skill 结构校验通过

## 7. 风险与控制

1. 风险：skill 变成第二份规则仓库  
   控制：只保留流程与引用，不复制长规则正文

2. 风险：继续把 UserManagement 经验误当成私有规则  
   控制：在 `scope-guard.md` 与文档页重复强调“来源不等于作用域”

3. 风险：skill 范围写得过大，后续被用于跨包重构  
   控制：在 `SKILL.md` 与说明页都明确首版只覆盖 `apps/admin/src/modules/*Management/**`

4. 风险：新增 skill 后文档入口缺失  
   控制：同步更新 `guide/index.md` 与 `.vitepress/config.ts`
