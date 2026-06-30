# @one-base-template/create-admin-lite

## 0.1.2

### Patch Changes

- 134058d: 修复 `@one-base-template/tag/style` 样式入口，确保独立项目能引入编译后的 tag 组件完整样式。
- 5fb849f: 修复独立项目模板的 Tailwind 扫描源，避免已发布 UI 包中的工具类未生成导致样式缺失。

## 0.1.1

### Patch Changes

- 8e97b56: 生成项目内置 @one-base-template scope registry 配置，避免公共依赖误走企业 one-package 仓库。

## 0.1.0

### Minor Changes

- 发布第二批公共运行时包，并新增 admin-lite 最小项目初始化 CLI。
