---
outline: [2, 3]
---

# ObActionButtons

`ObActionButtons` 用于行操作按钮排布：

- 自动把“删除类操作”放到末位
- 操作超出阈值后自动折叠到“更多”下拉
- 保留原按钮 click/disabled 语义

## Props

该组件**无显式 props**。

## 行为规则

1. 最多直接展示 `4` 个操作按钮。
2. 若出现溢出，直接展示区按“最多 3 个”控制，并尽量保留一个删除按钮在末位。
3. 删除识别规则（命中任一即视为删除操作）：
   - `data-action="delete"`
   - `type="danger"`
   - class 包含 `danger`
   - 按钮文本包含“删除”

## Slots

| 插槽名    | 说明                                |
| --------- | ----------------------------------- |
| `default` | 传入若干 `el-button`/自定义按钮节点 |

## Emits / Expose

- 无自定义 emits
- 无 defineExpose API

## 示例

```vue
<template>
  <ObActionButtons>
    <el-button link type="primary">详情</el-button>
    <el-button link type="primary">编辑</el-button>
    <el-button link>重置密码</el-button>
    <el-button link>分配角色</el-button>
    <el-button link type="danger" data-action="delete">删除</el-button>
  </ObActionButtons>
</template>
```
