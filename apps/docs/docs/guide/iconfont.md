# Iconfont 集成与预览

本页说明如何在当前模板中使用 `packages/ui` 内置的 iconfont 能力，并提供 cp/dj/om 三套字体库与 legacy OD 菜单字体的 demo HTML 预览。

## Admin 中引入

`apps/admin/src/bootstrap/index.ts` 已通过 `OneUiPlugin` 全局注册组件，因此页面里可以直接使用 `ObFontIcon`。

```vue
<template>
  <!-- CP -->
  <ObFontIcon name="tongxunlu2" library="cp" :size="20" />

  <!-- DJ（已命名空间化为 dj-icon-*） -->
  <ObFontIcon name="icon-1" library="dj" :size="20" color="#C40000" />

  <!-- OM -->
  <ObFontIcon name="wenjianjia1" library="om" :size="20" color="#0F79E9" />
</template>
```

兼容模式下，也可以继续直接写 class：

```html
<i class="iconfont icon-tongxunlu2"></i>
<i class="dj-icons dj-icon-icon-1"></i>
<i class="i-icon-menu i-icon-wenjianjia1"></i>
<i class="iconfont-od icon-huishouzhan"></i>
```

> 说明：legacy OD 菜单图标常见写法是 `icon-xxx`，其字体基类为 `iconfont-od`。`MenuIcon` 已做兼容补齐。

## Demo HTML 预览

### CP Icons

[新窗口打开 CP Demo](/fonts/cp-icons/demo_index.html)

<iframe
  src="/fonts/cp-icons/demo_index.html"
  style="width: 100%; height: 620px; border: 1px solid var(--vp-c-divider); border-radius: 8px;"
  loading="lazy"
></iframe>

### DJ Icons

[新窗口打开 DJ Demo](/fonts/dj-icons/demo_index.html)

<iframe
  src="/fonts/dj-icons/demo_index.html"
  style="width: 100%; height: 620px; border: 1px solid var(--vp-c-divider); border-radius: 8px;"
  loading="lazy"
></iframe>

### OM Icons

[新窗口打开 OM Demo](/fonts/om-icons/demo_index.html)

<iframe
  src="/fonts/om-icons/demo_index.html"
  style="width: 100%; height: 620px; border: 1px solid var(--vp-c-divider); border-radius: 8px;"
  loading="lazy"
></iframe>

### Legacy OD Icons（菜单兼容）

[新窗口打开 OD Demo](/fonts/od-icons/demo_index.html)

<iframe
  src="/fonts/od-icons/demo_index.html"
  style="width: 100%; height: 620px; border: 1px solid var(--vp-c-divider); border-radius: 8px;"
  loading="lazy"
></iframe>
