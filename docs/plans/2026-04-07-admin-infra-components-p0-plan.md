# 后台基建组件沉淀 P0 实施清单（AccountCenter / CommandPalette / DialogHost）

> 范围：`/Users/haoqiuzhi/code/one-base-template`
>
> 版本：P0（先收敛可复用基础能力）

## 1. 目标与边界

**目标**：在不引入 workflow 领域和 odFormComponents 业务耦合的前提下，优先沉淀后台通用基建组件，减少 `apps/admin`、`apps/admin-lite`、`apps/zfw-system-sfss` 三端重复实现。

**本次纳入（P0）**：

- `ObAccountCenter`（账号中心组件组）
- `ObCommandPalette`（全局菜单搜索弹层）
- `ObDialogHost`（指令式全局弹窗宿主）

**本次排除（明确不做）**：

- `workflow/**` 领域组件
- `odFormComponents/**` 组件群
- 与具体业务 API 强绑定且无复用收益的页面私有组件

## 2. 现状证据（用于立项）

- `apps/admin/src/components/top/**`、`apps/admin-lite/src/components/top/**`、`apps/zfw-system-sfss/src/components/top/**` 存在同构重复（含 `AdminTopBar`、`UserProfileDialog`、`ChangePasswordDialog`、`AvatarCropDialog`）。
- `sczfw` 5 项目中 `layout/components/search/components/*`（`SearchModal` 等）跨项目复用明显，可作为 command palette 能力来源。
- 当前 `packages/ui` 已有 `CrudContainer`，但缺少与 legacy `ReDialog` 对等的“全局指令式弹窗编排层”。

## 3. 里程碑与任务拆分

## Milestone A：`ObAccountCenter`（P0 第一优先）

### Task A1：定义组件契约与目录

**Files**

- Create: `packages/ui/src/components/account-center/AccountCenterPanel.vue`
- Create: `packages/ui/src/components/account-center/UserProfileDialog.vue`
- Create: `packages/ui/src/components/account-center/ChangePasswordDialog.vue`
- Create: `packages/ui/src/components/account-center/AvatarCropDialog.vue`
- Create: `packages/ui/src/components/account-center/types.ts`
- Create: `packages/ui/src/components/account-center/index.ts`

- [x] Step 1：抽离纯 UI 与交互（头像、改密表单、裁剪流程），禁止直连 `apps/*/services`。
- [x] Step 2：通过 props 注入业务能力（本轮落地：`uploadAvatar/checkPassword/changePassword/encryptPassword`）。
- [x] Step 3：统一 emits（本轮落地：`refresh-user`、`open-personalization`、`logout`）。

### Task A2：接入 `packages/ui` 导出与插件注册

**Files**

- Modify: `packages/ui/src/index.ts`
- Modify: `packages/ui/src/plugin.ts`
- Modify: `packages/ui/src/plugin-obtable.ts`

- [x] Step 1：导出 `AccountCenterPanel` 及相关类型。
- [x] Step 2：注册全局组件名（含 `Ob` 前缀链路）。

### Task A3：三端替换（先 admin，再 admin-lite、zfw-system-sfss）

**Files**

- Modify: `apps/admin/src/components/top/AdminTopBar.vue`
- Modify: `apps/admin-lite/src/components/top/AdminTopBar.vue`
- Modify: `apps/zfw-system-sfss/src/components/top/AdminTopBar.vue`

- [x] Step 1：改为消费 `@one-base-template/ui` 的账号中心组件。
- [x] Step 2：保留租户切换、系统切换等应用差异逻辑在 app 层。
- [ ] Step 3：删除 app 内重复的账号中心对话框实现（当前保留，避免影响自动生成类型声明文件）。

### Task A4：验收

Run:

```bash
pnpm -C packages/ui typecheck
pnpm -C packages/ui lint
pnpm -C apps/admin typecheck
pnpm -C apps/admin-lite typecheck
pnpm -C apps/zfw-system-sfss typecheck
```

> 备注：`apps/zfw-system-sfss typecheck` 目前有既有 legacy 类型债务，作为非本次改动阻断项记录在 `.codex/testing.md`。

- [x] 验收 1：三端账号中心行为一致（查看资料/改密/裁剪上传）。
- [x] 验收 2：`packages/ui` 无 apps 反向依赖。

---

## Milestone B：`ObCommandPalette`（P0 第二优先）

### Task B1：组件与状态能力沉淀

**Files**

- Create: `packages/ui/src/components/command-palette/CommandPalette.vue`
- Create: `packages/ui/src/components/command-palette/CommandPaletteHistory.vue`
- Create: `packages/ui/src/components/command-palette/CommandPaletteResult.vue`
- Create: `packages/ui/src/components/command-palette/CommandPaletteFooter.vue`
- Create: `packages/ui/src/components/command-palette/useCommandPalette.ts`
- Create: `packages/ui/src/components/command-palette/types.ts`
- Create: `packages/ui/src/components/command-palette/index.ts`

- [ ] Step 1：抽象菜单数据输入契约：`items`（path/title/icon/pinyin keywords）。
- [ ] Step 2：提供历史/收藏存储 key 可配置化，避免多应用互相污染。
- [ ] Step 3：支持键盘交互（↑/↓/Enter/Esc）与移动端宽度适配。

### Task B2：接入 UI 导出

**Files**

- Modify: `packages/ui/src/index.ts`
- Modify: `packages/ui/src/plugin.ts`

- [ ] Step 1：导出 `CommandPalette` 与 `useCommandPalette`。
- [ ] Step 2：文档化组件 props/emits/expose。

### Task B3：应用层接入

**Files**

- Modify: `apps/admin/src/components/top/AdminTopBar.vue`
- Modify: `apps/admin-lite/src/components/top/AdminTopBar.vue`
- Modify: `apps/zfw-system-sfss/src/components/top/AdminTopBar.vue`

- [ ] Step 1：顶栏增加统一触发入口（快捷键 + 按钮）。
- [ ] Step 2：菜单源使用 core 的菜单树扁平化输出，禁止 app 内重复 flatten 实现。

### Task B4：验收

Run:

```bash
pnpm -C packages/ui typecheck
pnpm -C packages/ui lint
pnpm -C apps/admin lint
pnpm -C apps/admin-lite lint
pnpm -C apps/zfw-system-sfss lint
```

- [ ] 验收 1：三端可通过 command palette 跳转菜单。
- [ ] 验收 2：历史/收藏行为一致，且支持清理。

---

## Milestone C：`ObDialogHost`（P0 第三优先）

### Task C1：定义全局弹窗宿主能力

**Files**

- Create: `packages/ui/src/components/dialog-host/DialogHost.vue`
- Create: `packages/ui/src/components/dialog-host/dialog-host.ts`
- Create: `packages/ui/src/components/dialog-host/types.ts`
- Create: `packages/ui/src/components/dialog-host/index.ts`

- [ ] Step 1：提供 `openDialog/closeDialog/closeAll` API。
- [ ] Step 2：支持 `contentRenderer/headerRenderer/footerRenderer` 与 before hooks。
- [ ] Step 3：对齐现有 `CrudContainer`，避免能力重叠冲突（定位：全局编排层）。

### Task C2：渐进迁移策略

**Files**

- Modify: `packages/ui/src/index.ts`
- Modify: `packages/ui/src/plugin.ts`
- Optional Modify: `packages/utils/src/hooks/useDialog/index.ts`

- [ ] Step 1：先提供并行能力，不强制一次性替换所有页面。
- [ ] Step 2：给出“旧页面迁移到 ObDialogHost”的示例（1-2 个代表页面）。

### Task C3：验收

Run:

```bash
pnpm -C packages/ui typecheck
pnpm -C packages/ui lint
pnpm -C apps/admin typecheck
```

- [ ] 验收 1：至少 1 个复杂弹窗流程完成迁移并通过回归。
- [ ] 验收 2：无全局状态泄漏（重复打开关闭无残留）。

## 4. 统一质量门禁（每个里程碑都要过）

- [ ] 代码门禁：`typecheck + lint + build`（按影响范围最小集执行）。
- [ ] 测试门禁：为新增公共能力补 `packages/ui` 单测。
- [ ] 文档门禁：同步 `apps/docs` 组件库文档与导航。
- [ ] 边界门禁：`packages/ui` 不得反向依赖 `apps/*`。

## 5. 风险与应对

- 风险 1：账号中心接口差异导致组件 props 过多。
  - 应对：统一 service adapter 接口，组件只认标准契约。
- 风险 2：command palette 菜单源不一致。
  - 应对：在 `@one-base-template/core` 补统一 `flatten + searchable` 适配函数。
- 风险 3：DialogHost 与 CrudContainer 角色冲突。
  - 应对：明确定位：`DialogHost` 负责全局指令式编排；`CrudContainer` 负责页面 CRUD 容器。

## 6. 执行顺序（建议）

1. 先做 Milestone A（收益最高、重复度最高、风险可控）。
2. 再做 Milestone B（提升跨模块效率）。
3. 最后做 Milestone C（基础设施升级，需灰度迁移）。

## 7. P0 完成定义（DoD）

- [ ] `ObAccountCenter`、`ObCommandPalette`、`ObDialogHost` 在 `packages/ui` 可导出可注册。
- [ ] `admin/admin-lite/zfw-system-sfss` 至少完成 A+B 全量接入，C 至少落地 1 个迁移样例。
- [ ] 文档站新增 3 个组件页并可通过构建。
- [ ] 全部验证命令通过，且无新增架构边界告警。
