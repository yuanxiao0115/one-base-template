# 主题系统（Core 内置 + Admin 注册）

## 目标

主题能力下沉到 `packages/core`，`apps/admin` 只做项目级注册：

- **Core 负责**：内置主题、token 计算、`--one-*` 与 `--el-*` 映射
- **Admin 负责**：注册项目主题、传入存储命名空间、提供业务主题名称

## 开发者快速接入（3 步）

### 步骤 1：配置持久化命名空间（防项目污染）

在 `apps/admin/public/platform-config.json` 配置：

```json
{
  "appcode": "od",
  "storageNamespace": "one-base-template-admin"
}
```

说明：

- 主题持久化 key 形态：`${storageNamespace}:ob_theme`
- `storageNamespace` 未配置时，默认回退 `appcode`
- 推荐每个项目都显式配置 `storageNamespace`

### 步骤 2：在 admin 注册主题

在 `apps/admin/src/config/theme.ts` 注册主题（含展示名）：

```ts
import { ONE_BUILTIN_THEMES, type CoreOptions, type ThemePrimaryScale } from '@one-base-template/core';

const ADMIN_PURPLE_SCALE: ThemePrimaryScale = {
  light1: '#F3EBFF',
  light2: '#E1CCFF',
  light3: '#CFAAFF',
  light4: '#B887FF',
  light5: '#9F65FF',
  light6: '#8745F2',
  light7: '#7A3EE0',
  light8: '#6933C7',
  light9: '#592AAE'
};

export const appThemeOptions: CoreOptions['theme'] = {
  defaultTheme: 'blue',
  allowCustomPrimary: true,
  themes: {
    ...ONE_BUILTIN_THEMES,
    adminOrange: {
      name: '管理橙',
      primary: '#FF7D00'
    },
    adminPurple: {
      name: '管理紫',
      primary: '#7A3EE0',
      primaryScale: { ...ADMIN_PURPLE_SCALE }
    }
  }
};
```

### 步骤 3：安装 core 时传入 `storageNamespace`

`apps/admin/src/bootstrap/core.ts` 已内置该逻辑，确保使用 `appEnv.storageNamespace`：

```ts
theme: {
  ...appThemeOptions,
  storageNamespace
}
```

### 步骤 4：了解 token 挂载方式（StyleTag 双层）

One 主题不再把 token 写到 `html.style`，而是写入 `head` 下的两个样式节点：

- `style#one-theme-base`：静态 token（基础变量 + 色板变量），内容稳定时不重复写入
- `style#one-theme-runtime`：动态 token（primary 链路 + 反馈状态色 + Element Plus 桥接变量），主题切换时覆盖

这样做的好处：

- 避免 `html` 行内样式堆积大量变量，DOM 更干净
- DevTools 中更容易对比不同主题下变量变化
- base/runtime 分层后，切换时只更新真正会变的部分

---

## 如何“注册主题”

`ThemeDefinition` 字段说明（`packages/core/src/stores/theme.ts`）：

- `name?: string`：主题显示名，`ThemeSwitcher` 优先展示该字段
- `primary: string`：主题主色（**大写 HEX**）
- `tokenPresetKey?: 'blue' | 'red'`：命中 core 内置预设时使用固定主色链路
- `primaryScale?: { light1..light9 }`：业务自定义完整九阶主色链路
- `semantic?: { success/warning/error/info }`：语义状态色扩展位（One 默认应用器当前不消费）
- `link`：链接状态色链路由 core 统一维护（固定 7 阶），不在 `semantic` 字段内单独配置

### 注册方式 A：只给主色（动态计算九阶）

适用于“业务只关心主色，不想维护整套色阶”：

```ts
myTheme: {
  name: '业务青',
  primary: '#00A3A3'
}
```

### 注册方式 B：给完整九阶（固定色阶）

适用于“设计已给定 9 阶，不允许算法推导偏差”：

```ts
myTheme: {
  name: '业务紫',
  primary: '#7A3EE0',
  primaryScale: {
    light1: '#F3EBFF',
    light2: '#E1CCFF',
    light3: '#CFAAFF',
    light4: '#B887FF',
    light5: '#9F65FF',
    light6: '#8745F2',
    light7: '#7A3EE0',
    light8: '#6933C7',
    light9: '#592AAE'
  }
}
```

### 注册方式 C：复用 core 预设

适用于与 core 标准主题完全一致：

```ts
blueTheme: {
  name: '移动蓝',
  primary: '#0F79E9',
  tokenPresetKey: 'blue'
}
```

---

## 如何“使用主题”

### 1) 用户侧：ThemeSwitcher 组件

- 组件：`packages/ui/src/components/theme/ThemeSwitcher.vue`
- 入口：顶部栏用户头像下拉菜单 -> “主题设置”弹窗
- 能力：
  - 切换 `preset/custom`
  - 选择内置主题 + 业务注册主题
  - 自定义主色
  - 恢复预设

> `ThemeSwitcher` 内部主题列表标签读取 `theme.name`，因此开发者只要在注册时填 `name` 即可自动展示。

### 2) 工程侧：自动注册组件

在 bootstrap 安装 `OneUiPlugin` 后可直接使用 `<ObThemeSwitcher />`：

```ts
import { OneUiPlugin } from '@one-base-template/ui';

app.use(OneUiPlugin, { prefix: 'Ob' });
```

### 3) 代码侧：通过 store 主动切换

```ts
import { useThemeStore } from '@one-base-template/core';

const themeStore = useThemeStore();

themeStore.setTheme('adminOrange');   // 切内置/注册主题
themeStore.setThemeMode('custom');    // 切到自定义模式
themeStore.setCustomPrimary('#FF7D00');
themeStore.resetCustomPrimary();      // 回到 preset
```

---

## 主题模式与行为

### 1) 内置主题（preset）

- Core 内置 `blue`（移动蓝）/`red`（党建红）
- 可直接复用 `ONE_BUILTIN_THEMES`

### 2) 自定义主色（custom）

- `custom` 仅覆盖主色链路（`--one-color-primary-light-1..9`）
- 与 `preset` 互斥，切回预设可恢复

### 3) 反馈状态色规则（含 link，固定）

- 反馈状态色（`success/warning/error/info/link`）固定，不随主题变化
- 其中 `link` 固定 7 阶：
  - `#E7F1FC #C3DDF9 #9FC9F6 #7BB5F2 #5491EB #0F79E9 #0B61E2`

---

## token 分层（Core）

### 1) One Token（设计 token）

- 文件：`packages/core/src/theme/one/theme-tokens.ts`
- 规则：
  - 主色链路统一 9 阶（`light1..light9`）
  - 蓝色链路已移除 `#0D6DE6` 并顺延

### 2) 应用映射层（One -> Element Plus）

- 文件：`packages/core/src/theme/one/apply-theme.ts`
- 职责：
  - 将 token 分层写入 `#one-theme-base` 与 `#one-theme-runtime`
  - 同步映射到 `--el-*`
  - 处理 link 变量桥接（`--el-link-*`）

### 3) Store 接入层

- 文件：`packages/core/src/stores/theme.ts`
- 默认应用器：`applyOneTheme`（可通过 `onThemeApplied` 覆盖）

### 4) 可复用导出 API

- `buildOneStaticTokens()`：构建静态 token（基础变量 + 色板变量）
- `buildOneRuntimeTokens()`：构建运行时 token（primary + feedback）
- `buildOneTokens()`：兼容 API（等价于 `static + runtime` 合并）

---

## 字体策略（按系统切换）

本仓库已内置跨系统字体栈，并统一纳入 `--one-*` token 体系：

- token 定义：`packages/core/src/theme/one/theme-tokens.ts`
  - `--one-font-family-macos`：macOS 优先（苹方优先，包含微软雅黑与思源黑体兜底）
  - `--one-font-family-windows`：Windows 优先（微软雅黑优先，包含思源黑体兜底）
  - `--one-font-family-fallback`：其他系统兜底（思源黑体优先）
  - `--one-font-family-base`：默认引用 macOS 栈，可被运行时覆盖
- Element Plus 桥接：`packages/core/src/theme/one/apply-theme.ts`
  - `--el-font-family` 统一映射到 `var(--one-font-family-base)`
- admin 运行时系统识别：`apps/admin/src/main.ts`
  - 启动时在根节点写入 `data-one-os=macos|windows|other`
- admin 样式切换：`apps/admin/src/styles/index.css`
  - 通过 `:root[data-one-os='windows'|'other']` 覆盖 `--one-font-family-base`

这样做可以保证：

1. **主题 token 与字体策略一致收口在 core**，避免业务侧重复维护字体常量。
2. **UI 壳与 Element Plus 使用同一字体入口**，减少组件间字体不一致。
3. **Windows/macOS 在同一套代码下自动切栈**，并保留思源黑体作为跨端备用。

---

## 持久化结构

```json
{
  "version": 1,
  "mode": "preset",
  "presetKey": "blue",
  "customPrimary": null
}
```

---

## 常见坑位

1. **忘记配 `storageNamespace`**：多项目可能互相污染主题状态。
2. **HEX 未大写或格式不合法**：会触发主题校验异常。
3. **误以为 `semantic` 已生效**：One 默认实现中反馈状态色固定，`semantic` 目前仅作为扩展位保留。
4. **同时配置 `tokenPresetKey` 和自定义 `primaryScale` 但预期不清晰**：
   - `custom` 模式优先使用 `customPrimary`
   - `preset` 模式下若存在 `primaryScale`，优先固定色阶
   - 否则按预设/primary 规则生成

## 调试指南（推荐）

1. 在 DevTools 的 Elements 面板确认：
   - 存在 `style#one-theme-base`
   - 存在 `style#one-theme-runtime`
2. 切换主题前后对比变量：
   - `--one-color-primary-light-*` 应变化
   - `--one-color-success/warning/error/info/link*` 应保持不变
3. 检查 UI 联动：
   - TopBar 系统菜单激活态跟随 `--one-color-primary-light-9`
   - Link 按钮颜色跟随 `--one-color-link*`
