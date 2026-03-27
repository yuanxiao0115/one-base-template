# AGENTS 规则分层与适用范围

## 背景

随着仓库内模块数量增多，把所有规则都堆在根目录 `AGENTS.md` 会带来两个问题：

- 子项目无关规则干扰实现判断，增加误操作风险。
- 同类规则分散后难维护，容易出现冲突与过期描述。

同时，本仓库还需要区分另外一层边界：

- `~/.codex` 负责 **运行时角色、模型、全局 system prompt**
- 仓库自身负责 **项目边界、验证命令、知识入口、规则落盘位置**

因此，本仓库已改为“**全局 Codex 运行时角色 + 仓库规则分层**”双层结构。

## 与全局 Codex 配置的边界

| 层级           | 位置                                           | 主要内容                                    | 是否放入仓库 |
| -------------- | ---------------------------------------------- | ------------------------------------------- | ------------ |
| 全局运行时角色 | `~/.codex`                                     | 角色模型、system prompt、工具权限、默认行为 | 否           |
| 仓库项目规则   | `AGENTS.md` + 子目录 `AGENTS.md` + `apps/docs` | 目录边界、知识入口、验证命令、协作规范      | 是           |

默认原则：

1. 用户明确针对 `one-base-template` 时，优先修改仓库内文件。
2. 除非用户明确要求，否则不要顺手修改 `~/.codex`。
3. 仓库不重复定义全局运行时角色配置，只维护项目知识。

## 规则文件总览

| 作用域             | 规则文件                           | 主要内容                                               |
| ------------------ | ---------------------------------- | ------------------------------------------------------ |
| 全仓通用           | `AGENTS.md`                        | 工作流、协作规范、目录边界、知识入口                   |
| admin 应用         | `apps/admin/AGENTS.md`             | 路由菜单、SSO、布局主题、表格迁移、UserManagement 细则 |
| template 应用      | `apps/template/AGENTS.md`          | 启动骨架、模块契约、迁移边界、架构门禁红线             |
| docs 站点          | `apps/docs/AGENTS.md`              | 文档同步、导航维护、VitePress 构建校验                 |
| adapters 子包      | `packages/adapters/AGENTS.md`      | 后端协议适配、字段映射边界                             |
| core 子包          | `packages/core/AGENTS.md`          | 逻辑契约、主题 token、核心 hooks 约束                  |
| portal-engine 子包 | `packages/portal-engine/AGENTS.md` | 门户引擎物料配置红线、统一封装组件复用                 |
| ui 子包            | `packages/ui/AGENTS.md`            | 壳组件导出边界、`ObVxeTable` 与视觉规范                |
| tag 子包           | `packages/tag/AGENTS.md`           | 样式资产与入口导出规范                                 |
| utils 子包         | `packages/utils/AGENTS.md`         | 通用工具函数语义与纯函数边界                           |

## 既有规则分类结果

### 1) 全局规则（保留在根目录）

- 技能优先、完整开发工作流、中文沟通要求。
- `.codex` 工作文档必须先读后维护。
- 文档与代码同步、提交策略、分支策略等协作规范。
- 当字段契约已经明确时，禁止过度防御性映射；`form.ts` / `mapper` / `adapter` 优先直白赋值，只在真实跨边界转换处做一次必要归一化。
- 项目目标一旦明确，应优先修改仓库内文件，不误改全局 Codex 配置。

### 2) admin/template 专属规则（迁入各自 `AGENTS.md`）

- 静态路由 + 动态菜单、`allowedPaths` 权限模型。
- `/sso` 登录回调、Cookie 模式鉴权。
- Layout/TopBar/个性设置规范、UserManagement 迁移细则。
- 表格迁移样式与结构规范（`ObPageContainer + ObTableBox + ObVxeTable`）。
- template 迁移基座红线（`manifest/module/routes` 契约、`lint:arch` 门禁、代码静态配置入口）。

### 3) core/ui 专属规则（分别下沉）

- `packages/core`：主题能力下沉、`useTable` 局部覆盖、`useEntityEditor` 保存语义。
- `packages/ui`：内部组件禁止对外暴露、菜单激活态 token 约束、`ObVxeTable` 视觉与布局规范。

## 新增规则的落盘原则

1. 规则仅影响一个子项目：写入该子项目 `AGENTS.md`。
2. 规则影响全仓协作：写入根目录 `AGENTS.md`。
3. **规则来源不等于规则作用域**：某条规则即使最初是在单个模块中总结出来的，只要后续验证会被横向推广到同层其他模块，就必须上提到对应更高作用域，而不是继续限制在原模块语境里。
4. 同一规则只保留一个“主版本”，其他文件仅引用，避免重复维护。
5. 运行时角色配置继续留在 `~/.codex`，仓库内只维护项目知识与约束。

### 例子

- `UserManagement` 中沉淀出的“场景对象编排”“远程搜索表单壳错误反馈边界”这类规则，如果后续会推广到其他 `*Management` 模块，就不应继续只写成 `UserManagement` 私有经验，而应提升到 `apps/admin/AGENTS.md` 或根 `AGENTS.md`。
- 只有像“角色分配页双栏选人弹层结构”“组织树具体接口约束”这种明显绑定业务域的规则，才应继续留在模块专属作用域。

## 维护建议

- 每次新增规则后，回查本页的“规则文件总览”是否仍与仓库结构一致。
- 子项目目录新增/拆分时，同步补齐对应 `AGENTS.md` 与本页映射表。
- 若规则涉及“为什么这样组织 agent / harness”，优先补充到 `/guide/agent-harness`，避免根 `AGENTS.md` 再次膨胀。
