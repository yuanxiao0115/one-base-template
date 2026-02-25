# Tag 组件 CSS 变量

Tag 组件支持通过 CSS 变量定制样式。主色相关变量已统一跟随 `--one-*` 设计 token。

## 变量列表

### 基础颜色

| 变量名                | 默认值（引用）                          | 说明         |
| --------------------- | --------------------------------------- | ------------ |
| `--tag-text-color`    | `var(--one-text-color-regular)`         | 标签文本颜色 |
| `--tag-bg-color`      | `var(--one-bg-color-page)`              | 标签背景颜色 |
| `--tag-container-bg`  | `var(--one-fill-color-blank)`           | 容器背景颜色 |

### 激活状态

| 变量名                    | 默认值（引用）                          | 说明             |
| ------------------------- | --------------------------------------- | ---------------- |
| `--tag-active-bg-color`   | `var(--one-color-primary-light-1)`      | 激活状态背景颜色 |
| `--tag-active-text-color` | `var(--one-color-primary)`              | 激活状态文本颜色 |

### 悬停状态

| 变量名              | 默认值（引用）                          | 说明         |
| ------------------- | --------------------------------------- | ------------ |
| `--tag-hover-color` | `var(--one-color-primary)`              | 悬停状态颜色 |

### 使用方法

### 全局自定义

```css
/* 主色统一从 one 主题变量控制 */
:root {
  --one-color-primary: #0f79e9;
  --one-color-primary-light-1: #e7f1fc;
}

/* 仍可按需覆盖 tag 专属变量 */
.tags-view {
  --tag-border-radius: 6px;
  --tag-font-size: 13px;
}
```

### 局部自定义

```css
.my-custom-tag .tags-view {
  --tag-bg-color: #f3f4f6;
  --tag-text-color: #111827;
}
```

### 主题切换

```javascript
// 切换主色（tag 会自动跟随）
document.documentElement.style.setProperty('--one-color-primary', '#d60817')
document.documentElement.style.setProperty('--one-color-primary-light-1', '#fce5e7')
```

## 迁移指南

| 旧用法                     | 新建议用法                 |
| -------------------------- | -------------------------- |
| Tag 组件私有主色变量         | `--one-color-primary`      |
| 激活背景直接写死色值         | `--one-color-primary-light-1` |

## 注意事项

1. **主色统一**：Tag 主色相关样式统一由 `--one-color-primary` 驱动。
2. **作用域化**：支持在 `.tags-view` 作用域内覆写 Tag 专属变量。
3. **默认回退**：未提供 `--one-*` 时，仍有内置回退值，不影响渲染。
