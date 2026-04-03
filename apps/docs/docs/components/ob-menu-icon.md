---
outline: [2, 3]
---

# ObMenuIcon

`ObMenuIcon` 是菜单图标解析组件，支持 class 图标、Iconify、外链 URL、资源 ID（经资产服务解析）四种输入形态。

> 定位：基础能力组件，通常由菜单组件内部消费。

## Props

| 属性   | 类型     | 默认值 | 说明                                      |
| ------ | -------- | ------ | ----------------------------------------- |
| `icon` | `string` | `''`   | 图标值（class / iconify / url / assetId） |

## Emits / Slots / Expose

- Emits：无
- Slots：无
- Expose：无

## 行为说明

1. 自动识别 legacy `icon-*`、`dj-icon-*`、`pure-iconfont-*`、`i-icon-*` 并补齐字体基类。
2. 若值为 Iconify 图标名，会先确保离线图标注册后再渲染。
3. 若值被识别为 URL（`http(s)`/`data`/`blob`）则渲染 `<img>`。
4. 其他情况按资源 ID 走 `assetStore.getImageUrl` 获取图片地址。

## 示例

```vue
<template>
  <ObMenuIcon icon="i-icon-menu i-icon-home" />
  <ObMenuIcon icon="ep:home-filled" />
</template>
```
