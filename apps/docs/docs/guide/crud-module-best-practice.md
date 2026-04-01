---
outline: [2, 3]
---

# CRUD 模块最佳实践（基于 Position 模块）

本文以 `Position`（职位管理）为蓝本，沉淀一套可复用的 CRUD 模块落地规范，目标是：

- **业务页只做编排**，不堆积数据转换和弹层状态机
- **目录清晰且可迁移**，便于后续批量复制到组织、用户、字典等模块
- **统一交互与视觉**，admin 模块默认保持 `ObTableBox + ObTable + ObCrudContainer` 一致体验

参考实现：

- `apps/admin/src/modules/UserManagement/position/list.vue`
- `apps/admin/src/modules/UserManagement/position/composables/usePositionPageState.ts`
- `apps/admin/src/modules/UserManagement/position/api.ts`
- `apps/admin/src/modules/UserManagement/position/form.ts`

## 1. 标准目录与职责分层

推荐按 feature-first 组织（与 Position 一致）：

```text
modules/<FeatureName>/<EntityName>/
├── list.vue                    # 页面编排层（表格 + 搜索 + 容器）
├── composables/
│   └── use<Entity>PageState.ts # 状态编排与副作用（useCrudPage/查询/删除/分页）
├── api.ts                      # 接口层（请求参数/响应类型/接口函数）
├── form.ts                     # 表单模型、规则、映射函数
├── columns.tsx                 # 表格列定义
└── components/
    ├── <Entity>EditForm.vue    # 编辑/查看表单
    └── <Entity>SearchForm.vue  # 高级筛选表单
```

当前 admin 规则主版本以 `list.vue` 为准。旧迁移稿中若出现 `page.vue`，仅表示“页面编排层”这一职责概念，不再代表当前文件名基线。

职责边界：

- `api.ts`：只关心接口契约与字段映射，**不写页面状态逻辑**
- `form.ts`：统一做 `detail -> form`、`form -> payload` 转换
- `composables/use<Entity>PageState.ts`：收敛 `useCrudPage`、查询参数、删除链路、分页动作与页面副作用
- `list.vue`：只做 orchestration（编排解构 + 模板绑定），不堆积字段清洗细节

## 2. API 与类型契约规范

### 2.1 必备类型

每个模块建议定义以下类型：

- `BizResponse<T>`：统一响应包裹（`code/data/message`）
- `XXXRecord`：表格行数据
- `XXXPageParams` / `XXXPageData`：分页查询入参与出参
- `XXXSavePayload`：新增/编辑提交体

### 2.2 参数清洗与字段收敛

参考 Position：

- 查询文本统一 `trimText()` 后再传给后端
- 数值字段在 `toPayload()` 中显式 `Number(...)`
- 避免在页面里散落 `trim/Number`，全部收敛到 `form.ts`

## 3. 页面编排基线（强推荐）

统一采用：

`ObPageContainer` + `ObTableBox` + `ObTable` + `ObCrudContainer`

启动层要求：

- admin 启动插件统一使用 `@one-base-template/ui/obtable`（`OneUiObTablePlugin`），避免把 `vxe` 运行时打进 admin 包体。

Hook 来源建议：

- `useTable / useCrudPage`：从 `@one-base-template/core` 使用（唯一实现源）
- `useEntityEditor`：业务页直用 `useCrudPage` 即可；若单独使用，优先 `@one-base-template/ui`（含默认错误提示）

### 3.1 列表层

`list.vue` 保持以下最小职责：

1. 调用 `use<Entity>PageState()` 获取分组状态（`refs/table/options/editor/actions/dialogs`）
2. 在脚本中按语义二次解构，模板避免长链访问
3. 绑定分页事件与查询事件（由 `actions` 输出）
4. 在 `operation` 插槽编排行操作（编辑/查看/删除）
5. `openCreate/openEdit/openDetail` 先收口到显式 handler 或 `actions`，模板不要直接写 `crud.openCreate/openEdit/openDetail`

这里的文件名约束来自 `apps/admin/AGENTS.md`：admin 下 CRUD 编排页统一使用 `list.vue`，并要求与 `routes.ts` 的懒加载路径保持一致。

### 3.2 删除交互

遵循 Position 的删除链路：

1. 在 `tableOpt.remove` 里配置 `deleteConfirm`（nameKey / requireInput）
2. 行内只调用 `actions.remove(row)`（确认 + 删除由 hook 托管）
3. 成功/失败统一 `message.success/error`

## 4. CRUD 状态机：统一使用 useEntityEditor

推荐最小配置（Position 同款）：

```ts
const crudPage = useCrudPage<FormModel, RowModel>({
  table: {
    query: {
      api: api.page,
      params: searchForm,
      pagination: true
    },
    remove: {
      api: api.remove,
      deleteConfirm: {
        nameKey: 'name'
      }
    }
  },
  editor: {
    entity: { name: '实体中文名' },
    form: {
      create: () => ({ ...defaultForm }),
      ref: editFormRef
    },
    detail: {
      load: async ({ row }) => row,
      mapToForm: ({ detail }) => toForm(detail)
    },
    save: {
      buildPayload: ({ form }) => toPayload(form),
      request: async ({ mode, payload }) => {
        const res = mode === 'create' ? await api.add(payload) : await api.update(payload);
        if (res.code !== 200) throw new Error(res.message || '保存失败');
        return res;
      },
      onSuccess: async ({ mode }) => {
        message.success(mode === 'create' ? '新增成功' : '更新成功');
      }
    }
  }
});

const { table, editor, actions } = crudPage;
```

关键点：

- `detail` 模式只读由 `editor.readonly` 统一控制
- `editor.confirm()` 内部已串联校验 + 提交 + 关闭
- `useCrudPage` 默认在保存成功后刷新当前页列表（可通过 `behavior.refreshAfterSave` 配置）
- 如无特殊需求，优先使用默认错误提示；只有需要分阶段提示时再传 `onError`

## 5. 表单模型与组件约束

### 5.1 form.ts 只做三件事

1. `defaultForm`
2. `formRules`
3. `toForm / toPayload`

### 5.2 EditForm 组件实现要求

与 Position 一致：

- 使用 `defineModel<Form>({ required: true })`
- 暴露 `CrudFormLike`（`validate/clearValidate/resetFields`）
- 只负责字段渲染，不处理接口和弹层状态

### 5.3 SearchForm 组件实现要求

- 使用 `defineModel<SearchForm>({ required: true })`
- 暴露 `resetFields` 供 `ObTableBox` 的重置动作调用
- 仅承载筛选项 UI，不耦合查询触发逻辑

## 6. 表格列与操作区规范

### 6.1 列定义

- 列集中在 `columns.tsx`
- `operation` 列固定在右侧，明确 `slot: 'operation'`
- `minWidth` 优先于固定宽度，减少拥挤
- 对齐规则统一：**表头全部左对齐**；数量/金额等数值列右对齐；操作列右对齐；其余常规列左对齐

### 6.2 行操作按钮

推荐使用 `ObActionButtons` 包裹操作按钮：

- 默认处理“超过阈值折叠更多”
- 自动保持删除按钮在直出区最右侧
- 降低每页手写按钮排序逻辑成本

### 6.3 删除流程编排（避免重复刷新）

- `useTable.deleteRow` 内部已包含删除成功后的 `refreshRemove` 刷新策略（可通过 `remove.refreshAfterDelete='none'` 关闭）。
- 页面层删除成功回调只处理提示/状态收尾（如关闭确认框、清理临时变量），**不要再额外 `onSearch(false)`**，避免重复请求。
- 常规单删默认走 `tableOpt.remove` / `actions.remove(row)`，不要在页面或 composable 里重写一条 `obConfirm + 删除接口 + onSearch(false)` 例外链路。
- 推荐直接在 `useTable` 配置删除参数，不再为常规单删额外封装流程：
  - `remove.api`：删除接口
  - `remove.idKey`：从行数据提取删除 id 的字段（默认 `id`）
  - `remove.payloadKey`：删除接口参数 key（默认同 `idKey`）
  - `remove.deleteConfirm`：删除确认配置（`nameKey` + `requireInput`）
  - `remove.onSuccess/onError`：删除后的页面收尾
- 推荐优先使用 `deleteConfirm` 完成“确认提示/输入确认”：
  - 普通确认：`remove: { deleteConfirm: { nameKey: 'postName', message: '是否确认删除职位「{name}」？' } }`
  - 输入确认：`remove: { deleteConfirm: { nameKey: 'orgName', requireInput: true, message: '此操作不可逆，请输入组织名称「{name}」确认删除' } }`

## 7. 命名与复用建议

遵循项目既有命名约定（短、清楚、动词 + 名词）：

- API：`page/add/update/remove/checkUnique`
- 转换：`toXxxForm/toXxxPayload`
- 事件：`onResetSearch/handleDelete/tableSearchByName`

避免：

- `resolve/assemble/orchestrate` 连续堆叠
- 页面内重复定义同构 `onError`/`payload` 转换逻辑

## 8. 新 CRUD 模块落地清单（可直接照抄）

1. 复制 Position 目录骨架（`api.ts + form.ts + columns.tsx + list.vue + components/*`）
2. 替换实体字段与接口地址，优先改 `form.ts` 映射函数
3. 接入路由（`routes.ts`）并设置 `meta.title/keepAlive`
4. 路由防漏自检：新增/迁移的 `list.vue` 必须在同次变更注册到 `routes.ts`；并确认不存在指向无效页面的路由项
5. 若本次改动涉及 UserManagement 角色域，必须同时核对两条路由：
   - `角色管理`：`/system/role/management`
   - `角色分配`：`/system/role/assign`
6. 在页面只保留编排：`useCrudPage + slots`
7. 跑验证命令并补文档

推荐验证命令：

```bash
pnpm -C apps/admin typecheck
pnpm -C apps/admin lint
pnpm -C apps/docs build
```

## 9. 什么时候偏离 Position 模板

仅在以下场景允许偏离：

- 编辑表单字段明显超多，需 `drawerColumns=2` 或拆分子表单组件
- 编辑前必须拉取字典/树数据，需在 `beforeOpen` 预加载
- 删除接口入参不是 `id`，需定制 `remove.buildPayload`

如果不满足上述条件，**默认按 Position 模板收敛实现**，可最大化减少页面差异与维护成本。

## 10. 组织管理完整迁移补充（UserManagement/org）

当你迁移的是“树形 + 多弹窗协作”的复杂 CRUD（例如组织管理），建议在 Position 模板基础上补齐以下能力：

- **树表模式切换**：无关键字时走懒加载树表；有关键字时走扁平搜索列表（`search` 接口）。
- **懒加载缓存**：按 `parentId` 做节点缓存，并设置过期时间（例如 5 分钟），减少重复请求。
- **组织表单约束**：`parentId` 支持树选择，编辑时禁选自身与子孙节点，避免形成环。
- **名称唯一性**：在提交前与字段 blur 双重校验（`/org/unique/check`），保证交互及时与提交安全。
- **能力分层弹窗**：主编辑用 `ObCrudContainer`；组织管理员与等级管理拆成独立组件，页面只保留编排逻辑。
- **删除确认统一链路**：组织等级管理等子弹窗删除操作，优先使用 `useTable.remove.deleteConfirm`，避免手写 `obConfirm + 删除 API` 分散实现。
- **通讯录弹窗请求守卫**：像组织管理员这类同时存在“初始化、进入节点、面包屑跳转、搜索”的弹窗，所有会回写当前节点/面包屑/已选态的异步链路都要补 `latest request guard`，关闭时统一失效会话。
- **懒加载树展开兜底**：`api.ts#getOrgTree` 需要补齐 `hasChildren` 回退（后端未返回时默认 `true`），保证 `ObTable` 树表展示展开入口；子节点空数组时再由懒加载链路回写 `hasChildren=false`。

## 11. 用户管理跨页勾选（adminManagement/user）

- 跨页勾选状态属于“页面级业务编排状态”，应优先放在 `useUserCrudState` 这类模块 composable 管理，不要放进 `ObTable` 通用壳组件。
- `ObTable` 负责“当前页勾选事件 + 行 key 能力”（例如 `reserveSelection`）；业务页负责“跨页缓存、筛选/树切换时清空、翻页后回显”。
- 推荐实现基线：
  1. 维护 `id -> row` 的跨页选中缓存；
  2. 当前页 `selection-change` 只覆盖当前页 id；
  3. 翻页后按缓存回放勾选；
  4. 查询条件变化（关键字/组织树切换/导入刷新）时显式清空跨页缓存。

参考实现（本仓库）：

- `apps/admin/src/modules/UserManagement/org/list.vue`
- `apps/admin/src/modules/UserManagement/org/components/OrgEditForm.vue`
- `apps/admin/src/modules/UserManagement/org/components/OrgManagerDialog.vue`
- `apps/admin/src/modules/UserManagement/org/components/OrgLevelManageDialog.vue`

## 11. 用户管理完整迁移补充（UserManagement/user）

当你迁移的是“组织树 + 复杂表单 + 批量操作 + 导入”的场景（例如用户管理），建议在 Position 模板基础上补齐以下能力：

- **树筛选 + 分页列表联动**：左侧组织树仅负责写入 `searchForm.orgId`，列表查询统一走 `buildUserListParams`，避免页面散落时间/布尔字段转换。
- **日期入参兜底过滤**：`startDate/endDate` 仅在存在有效值时透传给 `userApi.page`，避免把空字符串传给后端导致报错。
- **复杂表单分层**：主表单拆成 `UserEditForm`（用户信息）、`UserAccountForm`（修改账号）、`UserBindAccountForm`（关联账号），页面只保留编排和事件路由。
- **嵌套表单映射克制**：`form.ts` 只保留组织/岗位数组关系和协议边界转换；字段契约已明确时，不再继续堆 `trimText`、`toNaturalNumber`、`String/Number/Boolean` 这类过度防御性映射。
- **确认交互统一封装**：UserManagement 模块不直接调用 `ElMessageBox`，统一使用 `obConfirm`（包含输入型删除确认）。
- **非删除确认收敛**：启停、重置密码、表单内行移除等确认交互，优先复用 `modules/UserManagement/shared/confirm.ts`，避免在各页面重复写取消判定。
- **操作列统一收敛**：使用 `ObActionButtons` 后不再叠加手写 `el-dropdown`，更多操作交给组件内置折叠能力。
- **模板事件直连收口**：表单组件、弹窗组件同样不要写内联箭头函数或直接在模板里调 `crud.open*`，统一改成局部 handler。
- **复杂逻辑按语义下沉 composable**：除标准 CRUD 外（批量启停、重置密码、导入映射、命名确认删除等）拆到 `useXxxState/useXxxActions/useXxxQuery`，不再新增汇总式 `actions.ts`。
- **批量操作统一入口**：启用/停用、重置密码、删除二次确认全部收敛到页面脚本函数，保持提示文案和异常处理一致。
- **组织内拖拽排序**：仅在已选组织时启用拖拽，失败后强制重新查询回滚，避免“前端排序成功、后端失败”导致的数据错位。
- **导入能力组件化**：将上传校验（数量/大小/类型）沉淀到 `ObImportUpload`，页面只负责模板下载和上传成功后的刷新动作。
- **高级筛选抽屉宽度约束**：抽屉内容区默认限制 `width/max-width: 100%` 并关闭横向滚动；底部“重置/确定”按钮统一右对齐，避免布局漂移。
- **左树右表标准布局**：优先使用 `PageContainer` 的 `#left` 插槽承载树，树组件统一使用 `ObTree`（仅叶子节点溢出时 tooltip）；admin 树表页统一按 `ObTable` 口径实现。

参考实现（本仓库）：

- `apps/admin/src/modules/UserManagement/user/list.vue`
- `apps/admin/src/modules/UserManagement/user/api.ts`
- `apps/admin/src/modules/UserManagement/user/form.ts`
- `apps/admin/src/modules/UserManagement/user/components/UserEditForm.vue`

## 12. 内容模块全屏富文本范式（publicity/content）

针对 `apps/admin/src/modules/CmsManagement/content`，当需求包含“新增/编辑/查看全屏 + 正文富文本 + 附件上传”时，推荐以下落地方式：

- 容器层：`ObCrudContainer` 固定 `container="dialog"` + `:dialog-fullscreen="true"`，统一覆盖新增/编辑/查看三种模式。
- 表单层：正文字段改为独立富文本组件（如 `ObRichTextEditor`），查看态使用 `v-html` 预览，编辑态使用组件 `v-model`。
- 富文本基线：
  - `ObRichTextEditor` 默认开启内容安全清洗（去除脚本标签、事件属性、危险 URL）；
  - 支持 `profile=\"full|simple\"` 快速切换工具栏能力层级；
  - 上传前统一校验大小：`imageMaxSizeMb` / `videoMaxSizeMb`。
- 布局层：全屏表单建议采用“左侧基础/发布信息（窄列）+ 右侧正文/附件（宽列）”结构，输入控件集中在左侧避免横向过宽，并在 `1100px` 以下自动收敛为单栏。
- 上传链路：
  - 封面上传：封面字段使用单图上传组件（`list-type="picture-card"` + `limit=1`），上传走 `/cmict/file/resource/upload`，表单值回填资源 `id`，预览地址统一用 `/cmict/file/resource/show?id=...`；
  - 富文本图片/视频：走 `/cmict/file/resource/upload`，并使用 `/cmict/file/resource/show?id=...` 回填资源地址；
  - 附件上传：走 `/cmict/file/upload-file`，回填 `cmsArticleAttachmentList`（`attachmentName/attachmentUrl`）。
- API 层：在模块 `api.ts` 内封装 `uploadResource/uploadAttachment`，页面与表单不直接拼装 `FormData` 细节，避免上传逻辑散落。
- 兼容策略：`api.ts` 上传返回值同时兼容“Biz 包裹”和“直接 data”两种返回形态，降低联调差异。

推荐参考：

- `apps/admin/src/modules/CmsManagement/content/list.vue`
- `apps/admin/src/modules/CmsManagement/content/components/ContentEditForm.vue`
- `apps/admin/src/components/rich-text/ObRichTextEditor.vue`
- `packages/ui/src/components/upload/ImportUpload.vue`

## 13. UserManagement 首批高优修复经验（2026-03）

针对线上高频问题，建议优先落这 5 条“低侵入高收益”修复：

- **查询参数归一化统一**：列表查询统一走 `buildUserListParams`，避免空字符串、无效布尔值和脏日期直接透传到 API。
- **唯一性校验统一收口**：复用 `shared/unique.ts` 的快照与断言方法，禁止在页面层散落重复校验逻辑。
- **弹窗初始化防竞态**：`modelValue + orgId` 双条件弹窗统一单 watch，并增加初始化令牌，避免重复请求与旧请求回写。
- **首屏查询单触发**：`useTable.query.immediate` 与 `onMounted onSearch` 二选一，避免首屏双请求与闪烁。
- **唯一性校验收敛**：保存前仅在关键字段变更时触发唯一性请求（新增必校验，编辑按差异校验），并统一错误断言逻辑。

对应实现可参考：

- `apps/admin/src/modules/UserManagement/user/utils/buildUserListParams.ts`
- `apps/admin/src/modules/UserManagement/org/api.ts`
- `apps/admin/src/modules/UserManagement/org/components/OrgManagerDialog.vue`
- `apps/admin/src/modules/UserManagement/user/list.vue`
- `apps/admin/src/modules/UserManagement/org/list.vue`
- `apps/admin/src/modules/UserManagement/position/list.vue`
- `apps/admin/src/modules/UserManagement/shared/unique.ts`

## 14. 文件长度建议（可维护性）

为避免页面脚本持续膨胀，建议在 CRUD 模块默认遵循以下阈值：

- `list.vue`（编排页）建议控制在 **500 行以内**；超过 **600 行** 时，优先把“业务动作、树查询、拖拽、弹窗状态机”拆到 `composables`。
- `api.ts / form.ts / composables/*.ts` 建议控制在 **300 行以内**；超过 **400 行** 时按职责再拆一层（例如 `useXxxQuery`、`useXxxMutations`）。
- 单个函数建议控制在 **80 行以内**；超过 **120 行** 时拆分子函数，保持“动词 + 名词”命名与单一职责。
- 每次新增需求先判断“是新增流程还是扩展现有流程”：优先复用已有 `shared/*` 与 `composables/*`，避免把逻辑回填到 `list.vue`。

这是一组“建议阈值”，不是硬性限制；但超过阈值时应在 PR/提交说明中标注原因与后续拆分计划。
