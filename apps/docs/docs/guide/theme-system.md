# 主题系统（Core 内置 + Admin 注册）

<div class="doc-tldr">
  <strong>TL;DR：</strong>主题能力收敛在 `packages/core`（token 计算与应用），`apps/admin` 只做业务主题注册与存储命名空间配置；落地时先配 `storageNamespace`，再在 `theme.ts` 定义主题，最后验证样式变量与切换行为。
</div>

## 适用范围

- 适用目录：`packages/core/src/theme/**`、`packages/core/src/stores/theme.ts`、`apps/admin/src/config/theme.ts`
- 适用场景：主题新增、主色定制、灰色模式、Element Plus 主题桥接
- 目标读者：UI 基础能力维护者、业务主题接入者

## 1. 架构边界（谁负责什么）

| 层级          | 位置                                | 责任                                                 |
| ------------- | ----------------------------------- | ---------------------------------------------------- |
| Core 主题引擎 | `packages/core/src/theme/one/*`     | token 构建、`--one-*` 与 `--el-*` 桥接、灰色模式应用 |
| Core 状态管理 | `packages/core/src/stores/theme.ts` | 主题状态持久化、模式切换、应用器调用                 |
| 应用层注册    | `apps/admin/src/config/theme.ts`    | 定义业务主题（展示名、主色、可选色阶）               |
| 应用层安装    | `apps/admin/src/bootstrap/core.ts`  | 安装 core 时传入 `theme + storageNamespace`          |

## 2. 最小接入路径（3 步）

### 2.1 配置存储命名空间

文件：`apps/admin/src/config/app.ts`

```ts
storageNamespace: 'one-base-template-admin';
```

说明：主题持久化 key 形态为 `${storageNamespace}:ob_theme`。

### 2.2 注册业务主题

文件：`apps/admin/src/config/theme.ts`

```ts
export const theme: ThemeConfig = {
  defaultTheme: 'blue',
  allowCustomPrimary: true,
  themes: {
    ...ONE_BUILTIN_THEMES,
    adminOrange: {
      name: '管理橙',
      primary: '#FF7D00'
    }
  }
};

```

### 2.3 安装 Core 并透传 storageNamespace

文件：`apps/admin/src/bootstrap/core.ts`

```ts
theme: {
  ...theme,
  storageNamespace
}
```

## 3. 主题定义与模式

### 3.1 `ThemeDefinition` 关键字段

| 字段             | 说明                                 |
| ---------------- | ------------------------------------ |
| `name`           | 切换器展示名                         |
| `primary`        | 主题主色（HEX）                      |
| `tokenPresetKey` | 命中内置预设（`blue`/`red`）         |
| `primaryScale`   | 指定固定九阶主色（`light1..light9`） |
| `semantic`       | 语义色扩展位（默认应用器当前不消费） |

### 3.2 模式说明

- `preset`：使用预设主题。
- `custom`：仅覆盖 primary 链路（与 preset 互斥）。
- `grayscale`：在 `html` 写入 `data-one-grayscale="on"` 并应用灰色滤镜。

## 4. token 应用机制（真实行为）

- 静态 token 写入：`style#one-theme-base`
- 运行时 token 写入：`style#one-theme-runtime`
- 灰色模式样式：`style#one-theme-effect`

好处：

1. 样式变量分层清晰，切换时只更新动态部分。
2. DevTools 调试更直观，不污染 `html.style`。
3. Element Plus 与 One token 一致收口。

## 5. 工程侧 API（Theme Store）

来自：`packages/core/src/stores/theme.ts`

```ts
themeStore.setTheme('adminOrange');
themeStore.setThemeMode('custom');
themeStore.setCustomPrimary('#FF7D00');
themeStore.resetCustomPrimary();
themeStore.setGrayscale(true);
```

## 6. 字体与桥接策略

- 字体 token：`--one-font-family-macos/windows/fallback/base`
- Element Plus 字体桥接：`--el-font-family -> var(--one-font-family-base)`
- 目标：跨系统字体统一入口，避免应用层重复维护字体常量。

## 7. 最小可运行路径

在仓库根目录执行：

```bash
pnpm -C packages/core test:run -- src/stores/theme.test.ts
pnpm -C packages/core lint
pnpm -C apps/docs build
```

通过标准：

1. core 主题相关测试与 lint 通过。
2. docs 构建通过。

## 8. 常见问题

| 问题                   | 原因                             | 处理方式                                     |
| ---------------------- | -------------------------------- | -------------------------------------------- |
| 主题切换后刷新失效     | `storageNamespace` 未配置或变更  | 校对 `app.ts` 与旧 key           |
| 自定义主色不生效       | 未切到 `custom` 模式或颜色值非法 | 调用 `setThemeMode('custom')` 并使用合法 HEX |
| Element 组件颜色不一致 | token 桥接被局部样式覆盖         | 检查 `apply-theme.ts` 映射与页面局部覆盖样式 |

## 9. 相关样式约定

- 按钮规范：[/guide/button-styles](/guide/button-styles)
- 二次确认弹窗样式：`apps/admin/src/styles/element-plus/message-box-overrides.css`
- loading 覆盖样式：`apps/admin/src/styles/element-plus/loading-overrides.css`

## 10. 相关阅读

- [目录结构与边界](/guide/architecture)
- [开发规范与维护](/guide/development)
- [组件样式（按钮）](/guide/button-styles)
