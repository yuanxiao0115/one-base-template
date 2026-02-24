# Tag 组件 CSS 变量

Tag 组件提供了一套完整的 CSS 变量，允许用户自定义组件的外观和主题。

## 变量列表

### 基础颜色

| 变量名                | 默认值    | 说明         |
| --------------------- | --------- | ------------ |
| `--tag-text-color`    | `#333`    | 标签文本颜色 |
| `--tag-bg-color`      | `#f8f8f8` | 标签背景颜色 |
| `--tag-primary-color` | `#0f79e9` | 主色调       |
| `--tag-container-bg`  | `#ffffff` | 容器背景颜色 |

### 激活状态

| 变量名                    | 默认值    | 说明             |
| ------------------------- | --------- | ---------------- |
| `--tag-active-bg-color`   | `#e7f1fc` | 激活状态背景颜色 |
| `--tag-active-text-color` | `#0f79e9` | 激活状态文本颜色 |

### 悬停状态

| 变量名              | 默认值    | 说明         |
| ------------------- | --------- | ------------ |
| `--tag-hover-color` | `#0f79e9` | 悬停状态颜色 |

### 关闭按钮

| 变量名                    | 默认值    | 说明             |
| ------------------------- | --------- | ---------------- |
| `--tag-close-color`       | `#333`    | 关闭按钮颜色     |
| `--tag-close-hover-color` | `#0f79e9` | 关闭按钮悬停颜色 |

### 箭头导航

| 变量名              | 默认值 | 说明         |
| ------------------- | ------ | ------------ |
| `--tag-arrow-color` | `#333` | 箭头导航颜色 |

## 使用方法

### 全局自定义

在你的 CSS 文件中重新定义这些变量：

```css
/* 全局覆盖所有 tag 组件 */
.tags-view {
  --tag-primary-color: #409eff;
  --tag-active-bg-color: #ecf5ff;
  --tag-hover-color: #409eff;
}
```

### 局部自定义

为特定的 tag 组件实例自定义样式：

```css
/* 为特定组件实例自定义 */
.my-custom-tag .tags-view {
  --tag-primary-color: #67c23a;
  --tag-active-bg-color: #f0f9ff;
}
```

### 兼容旧版本（不推荐）

如果需要兼容旧版本的全局变量方式：

```css
:root {
  --tag-primary-color: #409eff;
  --tag-active-bg-color: #ecf5ff;
  --tag-hover-color: #409eff;
}
```

> **注意**：从 v2.0 开始，CSS 变量已作用域化到 `.tags-view` 选择器内，避免全局样式污染。推荐使用新的作用域化方式。

### 主题切换

可以通过动态修改 CSS 变量来实现主题切换：

```javascript
// 方法1：通过样式表动态修改（推荐）
const tagElement = document.querySelector('.tags-view')
if (tagElement) {
  tagElement.style.setProperty('--tag-text-color', '#ffffff')
  tagElement.style.setProperty('--tag-bg-color', '#2d2d2d')
  tagElement.style.setProperty('--tag-container-bg', '#1a1a1a')
}

// 方法2：通过CSS类切换
// 在CSS中定义主题类
// .dark-theme .tags-view {
//   --tag-text-color: #ffffff;
//   --tag-bg-color: #2d2d2d;
//   --tag-container-bg: #1a1a1a;
// }
document.body.classList.add('dark-theme')
```

## 迁移指南

如果你之前使用的是旧版本的 tag 组件，以下是变量映射关系：

| 旧变量                          | 新变量                  |
| ------------------------------- | ----------------------- |
| `--el-text-color-primary`       | `--tag-text-color`      |
| `--one-bg-color-page`           | `--tag-bg-color`        |
| `--one-color-primary`           | `--tag-primary-color`   |
| `--one-color-primary-light-100` | `--tag-active-bg-color` |

## 注意事项

1. **作用域化**：从 v2.0 开始，CSS 变量已作用域化到 `.tags-view` 选择器内，避免全局样式污染
2. **变量前缀**：所有变量都采用 `--tag-` 前缀，避免与其他组件冲突
3. **默认值**：所有变量都有默认值，无需担心未定义的情况
4. **颜色格式**：颜色值建议使用十六进制格式，确保兼容性
5. **实时更新**：修改变量后，组件会自动应用新的样式，无需重新渲染
6. **样式隔离**：组件样式使用 Vue 的 scoped 特性，不会影响其他组件
