<script setup lang="ts">
import ButtonStyleDocDemo from './components/ButtonStyleDocDemo.vue'
</script>

# 组件样式（按钮）

本页用于说明 **Element Plus 按钮在本项目中的统一样式能力**：支持哪些样式、如何使用、禁用态如何保持一致。

## 支持的样式类型

- 实体按钮：`<el-button type="primary|success|warning|info|danger">`
- 描边按钮：`<el-button plain ...>`
- 虚线按钮：`<el-button plain class="ob-button--dashed" ...>`
- 文字按钮：`<el-button text ...>`
- Link 按钮：`<el-button link ...>`
- 网址按钮（仅链接场景）：`<el-button link class="ob-link-underline" ...>`

> 说明：`link` 属于 Element Plus 按钮能力，不归入 core feedback 状态集合。

## 尺寸规范（固定三档）

- `large`：40px
- `default`：32px
- `small`：24px

使用方式：

```vue
<template>
  <el-button size="large" type="primary">40 按钮</el-button>
  <el-button type="primary">32 按钮</el-button>
  <el-button size="small" type="primary">24 按钮</el-button>
</template>
```

## 禁用态统一策略（按变体）

同一变体在不同 `type` 下禁用外观一致：

- 实体：禁用文字/背景/边框统一
- 描边/虚线：禁用文字与边框统一，背景使用禁用背景
- text/link：禁用仅文字置灰，背景保持透明

颜色链路全部来自主题变量：

```css
--one-button-disabled-text-color
--one-button-disabled-bg-color
--one-button-disabled-border-color
  -> 映射到
--el-button-disabled-text-color
--el-button-disabled-bg-color
--el-button-disabled-border-color
```

## 常用代码示例

```vue
<template>
  <!-- 主按钮 -->
  <el-button type="primary">提交</el-button>

  <!-- 次按钮 -->
  <el-button plain>取消</el-button>

  <!-- 虚线按钮 -->
  <el-button plain class="ob-button--dashed">更多操作</el-button>

  <!-- 文字按钮 -->
  <el-button text type="primary">查看详情</el-button>

  <!-- Link 按钮 -->
  <el-button link type="primary">普通链接</el-button>

  <!-- 网址按钮（带下划线） -->
  <el-button link type="primary" class="ob-link-underline">https://example.com</el-button>
</template>
```

## 在线示例（Vue 组件）

下面直接引入文档内 Vue 示例组件，展示尺寸、样式和禁用一致性效果：

<ButtonStyleDocDemo />

## 相关实现文件

- 主题 token：`packages/core/src/theme/one/theme-tokens.ts`
- Element 变量桥接：`packages/core/src/theme/one/apply-theme.ts`
- 按钮覆盖样式：`apps/admin/src/styles/element-plus/button-overrides.css`
- admin 演示页：`/demo/button-style`
