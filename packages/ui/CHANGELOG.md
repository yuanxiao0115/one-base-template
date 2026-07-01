# @one-base-template/ui

## 0.1.2

### Patch Changes

- efe0a9b: 修复 admin-lite 独立项目未加载 UI 包 scoped 样式的问题。CLI 模板、doctor 与 upgrade 会检查并补齐 `@one-base-template/ui` dist 样式入口，UI 包新增 `./style` 样式导出供后续稳定消费。
- 优化 admin-lite 顶栏账号区与菜单搜索视觉：账号触发区移除边框和独立底色，菜单搜索触发器与结果激活态改为更克制的主题色层级。

## 0.1.0

### Minor Changes

- 建立首批公共包发布基线，补齐 `core`、`utils`、`tag`、`ui` 的发布元数据、产物构建与本地验证流程。

### Patch Changes

- Updated dependencies
  - @one-base-template/core@0.1.0
  - @one-base-template/tag@0.1.0
