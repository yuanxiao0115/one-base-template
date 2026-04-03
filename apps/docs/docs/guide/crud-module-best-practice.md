# CRUD 开发规范（合并版）

> 本页合并“模块最佳实践 + 容器用法”的主线内容，优先给可落地模板。

## TL;DR

1. 目录先固定：`list.vue + api.ts + types.ts + routes.ts`。
2. 页面先固定：`ObPageContainer + ObTableBox + ObTable`。
3. 弹层先固定：`ObCrudContainer + useEntityEditor`。
4. 提交前至少跑：`typecheck + lint + build`。

## 1) 推荐目录结构

```text
<module>/
├── routes.ts
├── list.vue
├── api.ts
├── types.ts
└── components/
    ├── EditForm.vue
    └── SearchForm.vue
```

适用边界：

1. 常规管理后台（列表、搜索、分页、新增、编辑、详情、删除）。
2. 不涉及复杂工作流引擎或跨系统编排。

## 2) 页面骨架（标准）

```vue
<ObPageContainer padding="0">
  <ObTableBox ...>
    <template #default="{ size, dynamicColumns }">
      <ObTable ... />
    </template>
  </ObTableBox>

  <ObCrudContainer
    v-model="editor.visible"
    :mode="editor.mode"
    :title="editor.title"
    :loading="editor.submitting"
    @confirm="editor.confirm"
    @cancel="editor.close"
  >
    <EditForm v-model="editor.form" :disabled="editor.readonly" />
  </ObCrudContainer>
</ObPageContainer>
```

## 3) 职责划分（必须收口）

1. `list.vue`：只保留页面编排和事件连接。
2. `api.ts`：只保留接口调用，不做业务归一化。
3. `types.ts`：只保留页面真实使用字段。
4. `EditForm/SearchForm`：只负责表单渲染。

## 4) 交互与风格红线

1. 列表页禁止直接用 `el-table`，统一用 `ObTable`。
2. CRUD 弹层禁止手写 `el-dialog/el-drawer`，统一用 `ObCrudContainer`。
3. 提示与确认统一用 `message`、`obConfirm`。
4. 模板事件禁止内联箭头函数。

## 5) 最短落地步骤

1. 生成或复制模块骨架。
2. 填充 `api.ts` 与 `types.ts`。
3. 完成 `list.vue` 编排和表单组件。
4. 在 `routes.ts` 注册路由。
5. 在 `app.ts` 的 `enabledModules` 中加入模块 id。

## 6) 验证命令

```bash
pnpm -C apps/admin typecheck
pnpm -C apps/admin lint
pnpm -C apps/admin build
pnpm -C apps/docs lint
pnpm -C apps/docs build
```

## 7) 深入参考

- [CRUD 容器与 Hook（进阶）](/guide/crud-container)
- [表格开发规范](/guide/table-vxe-migration)
- [内置组件（Ob 系列）](/guide/built-in-components)
