# Iconfont 集成与预览（执行版）

<div class="doc-tldr">
  <strong>TL;DR：</strong>项目内统一通过 `ObFontIcon` 使用 `cp/dj/om` 三套字体图标；菜单场景由 `ObMenuIcon` 兼容 `iconfont-od` 等 legacy class。接入后可直接用本页 demo iframe 做视觉核对。
</div>

## 适用范围

- 适用目录：`packages/ui/src/components/icon/FontIcon.vue`、`packages/ui/src/components/menu/MenuIcon.vue`
- 适用场景：业务页面图标、菜单图标、legacy OD 图标兼容
- 目标读者：前端业务开发者、UI 组件维护者

## 1. 接入方式（Admin）

`apps/admin/src/bootstrap/index.ts` 已通过 `OneUiPlugin` 全局注册组件，可直接使用 `ObFontIcon`。

### 1.1 组件写法（推荐）

```vue
<template>
  <!-- CP -->
  <ObFontIcon name="tongxunlu2" library="cp" :size="20" />

  <!-- DJ -->
  <ObFontIcon name="icon-1" library="dj" :size="20" color="#C40000" />

  <!-- OM -->
  <ObFontIcon name="wenjianjia1" library="om" :size="20" color="#0F79E9" />
</template>
```

`library` 可选值：`cp | dj | om`。

### 1.2 class 写法（兼容）

```html
<i class="iconfont icon-tongxunlu2"></i>
<i class="dj-icons dj-icon-icon-1"></i>
<i class="i-icon-menu i-icon-wenjianjia1"></i>
<i class="iconfont-od icon-huishouzhan"></i>
```

## 2. 真实行为（组件职责）

### 2.1 `ObFontIcon`

- 文件：`packages/ui/src/components/icon/FontIcon.vue`
- 行为：根据 `library` 自动补齐 base class 与前缀。
  - `cp -> iconfont + icon-*`
  - `dj -> dj-icons + dj-icon-*`
  - `om -> i-icon-menu + i-icon-*`

### 2.2 `ObMenuIcon`

- 文件：`packages/ui/src/components/menu/MenuIcon.vue`
- 行为：
  1. 支持 iconfont class、url/blob、iconify、资源 id 四类输入。
  2. 对 legacy OD 菜单图标（`icon-xxx`）自动补齐 `iconfont-od` 基类兼容。

## 3. Demo 预览（直接核对）

### 3.1 CP Icons

[新窗口打开 CP Demo](/fonts/cp-icons/demo_index.html)

<iframe
  src="/fonts/cp-icons/demo_index.html"
  style="width: 100%; height: 620px; border: 1px solid var(--vp-c-divider); border-radius: 8px;"
  loading="lazy"
></iframe>

### 3.2 DJ Icons

[新窗口打开 DJ Demo](/fonts/dj-icons/demo_index.html)

<iframe
  src="/fonts/dj-icons/demo_index.html"
  style="width: 100%; height: 620px; border: 1px solid var(--vp-c-divider); border-radius: 8px;"
  loading="lazy"
></iframe>

### 3.3 OM Icons

[新窗口打开 OM Demo](/fonts/om-icons/demo_index.html)

<iframe
  src="/fonts/om-icons/demo_index.html"
  style="width: 100%; height: 620px; border: 1px solid var(--vp-c-divider); border-radius: 8px;"
  loading="lazy"
></iframe>

### 3.4 Legacy OD Icons（菜单兼容）

[新窗口打开 OD Demo](/fonts/od-icons/demo_index.html)

<iframe
  src="/fonts/od-icons/demo_index.html"
  style="width: 100%; height: 620px; border: 1px solid var(--vp-c-divider); border-radius: 8px;"
  loading="lazy"
></iframe>

## 4. 最小可运行路径

在仓库根目录执行：

```bash
pnpm -C apps/docs lint
pnpm -C apps/docs build
```

通过标准：

1. 文档构建成功。
2. demo 页面可访问，`ObFontIcon` 显示与库映射一致。

## 5. 常见问题

| 问题                    | 原因                         | 处理方式                                                 |
| ----------------------- | ---------------------------- | -------------------------------------------------------- |
| 图标不显示              | `library` 与图标前缀不匹配   | 核对 `library` 与 `name`，优先用 `ObFontIcon` 自动补前缀 |
| 菜单 icon 偶发丢失      | 后端下发 legacy class 无基类 | 统一改走 `ObMenuIcon`，不要页面层手写 class 拼接         |
| demo 能显示但页面不显示 | 页面未加载对应组件或样式隔离 | 检查 `OneUiPlugin` 注册与局部样式覆盖                    |

## 6. 相关阅读

- [组件库（Ob 系列）](/components/)
- [布局与菜单](/guide/layout-menu)
