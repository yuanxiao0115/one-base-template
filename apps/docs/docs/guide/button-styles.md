<script setup lang="ts">
import ButtonStyleDocDemo from './components/ButtonStyleDocDemo.vue'
</script>

# 组件样式（按钮）

<div class="doc-tldr">
  <strong>TL;DR：</strong>本项目统一基于 Element Plus 按钮做样式覆盖，按“实体/描边/虚线/text/link”五类变体使用；禁用态颜色统一走 `--one-* -> --el-*` 变量映射，保证不同按钮类型外观一致。
</div>

## 适用范围

- 适用目录：`packages/core/src/theme/one/*`、`apps/admin/src/styles/element-plus/button-overrides.css`
- 适用场景：后台页面按钮规范、禁用态一致性、链接按钮样式
- 目标读者：业务页面开发者、UI 样式维护者

## 1. 支持的样式类型

1. 实体按钮：`<el-button type="primary|success|warning|info|danger">`
2. 描边按钮：`<el-button plain ...>`
3. 虚线按钮：`<el-button plain class="ob-button--dashed" ...>`
4. 文字按钮：`<el-button text ...>`
5. Link 按钮：`<el-button link ...>`
6. 网址按钮：`<el-button link class="ob-link-underline" ...>`

> 说明：`link` 属于 Element Plus 按钮能力，不归入 core feedback 状态集合。

## 2. 尺寸规范（固定三档）

- `large`：40px
- `default`：32px
- `small`：24px

示例：

```vue
<template>
  <el-button size="large" type="primary">40 按钮</el-button>
  <el-button type="primary">32 按钮</el-button>
  <el-button size="small" type="primary">24 按钮</el-button>
</template>
```

## 3. 禁用态统一策略

### 3.1 变体表现

- 实体：禁用文字/背景/边框统一
- 描边/虚线：禁用文字与边框统一，背景使用禁用背景
- text/link：禁用仅文字置灰，背景保持透明

### 3.2 变量链路

```css
--one-button-disabled-text-color
--one-button-disabled-bg-color
--one-button-disabled-border-color
  ->
--el-button-disabled-text-color
--el-button-disabled-bg-color
--el-button-disabled-border-color
```

## 4. 常用代码示例

```vue
<template>
  <el-button type="primary">提交</el-button>
  <el-button plain>取消</el-button>
  <el-button plain class="ob-button--dashed">更多操作</el-button>
  <el-button text type="primary">查看详情</el-button>
  <el-button link type="primary">普通链接</el-button>
  <el-button link type="primary" class="ob-link-underline">https://example.com</el-button>
</template>
```

## 5. 在线示例（Vue 组件）

<ButtonStyleDocDemo />

## 6. 最小可运行路径

在仓库根目录执行：

```bash
pnpm -C apps/docs lint
pnpm -C apps/docs build
```

通过标准：

1. docs lint/build 通过。
2. 示例组件按钮展示与文档描述一致。

## 7. 实现文件定位

- 主题 token：`packages/core/src/theme/one/theme-tokens.ts`
- Element 变量桥接：`packages/core/src/theme/one/apply-theme.ts`
- 按钮覆盖样式：`apps/admin/src/styles/element-plus/button-overrides.css`

## 8. 常见问题

| 问题                     | 原因                             | 处理方式                                  |
| ------------------------ | -------------------------------- | ----------------------------------------- |
| 不同页面按钮禁用态不一致 | 局部样式覆盖了全局变量           | 检查页面是否覆盖 `--el-button-disabled-*` |
| link 按钮颜色异常        | 使用了 feedback 语义色心智       | link 走独立链路，按按钮规范使用           |
| 虚线按钮样式失效         | 未添加 `ob-button--dashed` class | 在 plain 按钮上补充该 class               |
