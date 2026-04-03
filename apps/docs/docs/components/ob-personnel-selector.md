---
outline: [2, 3]
---

# ObPersonnelSelector

`ObPersonnelSelector` 是组织/人员选择组件，支持组织树浏览、关键词搜索、已选列表拖拽排序，并可配合 `openPersonnelSelection` 以弹窗方式调用。

## Props

| 属性                   | 类型                                                  | 默认值      | 说明                                                          |
| ---------------------- | ----------------------------------------------------- | ----------- | ------------------------------------------------------------- |
| `modelValue`           | `PersonnelSelectionModel`                             | 必填        | 双向绑定模型（默认使用 `userIds/orgIds/roleIds/positionIds`） |
| `disabled`             | `boolean`                                             | `false`     | 是否禁用                                                      |
| `mode`                 | `'org' \| 'person' \| 'position' \| 'role'`           | `'person'`  | 选择模式                                                      |
| `fetchNodes`           | `PersonnelFetchNodes`                                 | 必填        | 按父节点加载通讯录节点                                        |
| `searchNodes`          | `PersonnelSearchNodes`                                | 必填        | 关键字搜索节点                                                |
| `allowSelectOrg`       | `boolean`                                             | `false`     | 人员模式下是否允许同时勾选组织                                |
| `selectionField`       | `'userIds' \| 'orgIds' \| 'roleIds' \| 'positionIds'` | `'userIds'` | 当前模式写入哪个 id 字段                                      |
| `initialSelectedUsers` | `PersonnelSelectedUser[]`                             | `[]`        | 初始已选用户快照                                              |

## 数据契约

### `PersonnelNode`

```ts
type PersonnelNodeType = 'org' | 'position' | 'role' | 'user';

interface PersonnelNodeBase {
  id: string;
  parentId: string;
  title: string;
  nodeType: PersonnelNodeType;
}
```

- 组织节点要求：`nodeType: 'org'`，建议补 `orgName`。
- 用户节点要求：`nodeType: 'user'`，建议补 `userId/nickName/userAccount/phone`。

### `PersonnelSelectionModel`

```ts
interface PersonnelSelectionModel {
  userIds?: string[];
  orgIds?: string[];
  roleIds?: string[];
  positionIds?: string[];
}
```

## Expose

| 方法                      | 说明                            |
| ------------------------- | ------------------------------- |
| `loadRootNodes()`         | 重新加载根节点                  |
| `setSelectedItems(items)` | 覆盖已选列表                    |
| `getSelectedItems()`      | 获取当前已选项（含名称/副标题） |

## 弹窗 API：`openPersonnelSelection`

### 入参 `OpenPersonnelSelectionOptions`

| 字段                                       | 类型                      | 说明                       |
| ------------------------------------------ | ------------------------- | -------------------------- |
| `title`                                    | `string`                  | 弹窗标题                   |
| `width`                                    | `number \| string`        | 弹窗宽度，默认 `1120`      |
| `mode`                                     | `PersonnelSelectMode`     | 选择模式，默认 `person`    |
| `selectionField`                           | `PersonnelSelectionField` | 结果写入字段               |
| `allowSelectOrg`                           | `boolean`                 | 人员模式下是否允许勾选组织 |
| `required`                                 | `boolean`                 | 是否必选，默认 `true`      |
| `confirmText/cancelText`                   | `string`                  | 按钮文案                   |
| `model`                                    | `PersonnelSelectionModel` | 初始选中 id                |
| `selectedItems/users/orgs/roles/positions` | `array`                   | 初始选中详情（兼容旧数据） |
| `fetchNodes/searchNodes`                   | 函数                      | 数据源函数（必填）         |
| `appContext`                               | `AppContext`              | 跨应用上下文挂载           |

### 返回值 `OpenPersonnelSelectionResult`

| 字段                         | 说明                                 |
| ---------------------------- | ------------------------------------ |
| `mode/selectionField/ids`    | 当前模式、落位字段、选中 id 列表     |
| `model`                      | 归一化后的完整模型（四类 id 均返回） |
| `selectedItems`              | 全部已选项                           |
| `users/orgs/roles/positions` | 按类型拆分后的已选结果               |

## 示例

### 1. 页面内嵌使用

```vue
<script setup lang="ts">
import { reactive } from 'vue';
import type { PersonnelNode, PersonnelSelectionModel } from '@one-base-template/ui';

const formModel = reactive<PersonnelSelectionModel>({
  userIds: []
});

async function fetchNodes(params: { parentId?: string }) {
  // 替换为真实接口
  return Promise.resolve<PersonnelNode[]>([
    {
      id: 'org-1',
      parentId: params.parentId || '0',
      title: '综合处',
      orgName: '综合处',
      companyId: 'c-1',
      orgType: 1,
      nodeType: 'org'
    }
  ]);
}

async function searchNodes() {
  return Promise.resolve<PersonnelNode[]>([]);
}
</script>

<template>
  <ObPersonnelSelector
    v-model="formModel"
    selection-field="userIds"
    :fetch-nodes="fetchNodes"
    :search-nodes="searchNodes"
  />
</template>
```

### 2. 弹窗调用

```ts
import { openPersonnelSelection } from '@one-base-template/ui';

const result = await openPersonnelSelection({
  title: '选择人员',
  mode: 'person',
  selectionField: 'userIds',
  fetchNodes: async ({ parentId }) => {
    return [];
  },
  searchNodes: async ({ keyword }) => {
    return [];
  }
});

console.log(result.ids, result.users);
```
