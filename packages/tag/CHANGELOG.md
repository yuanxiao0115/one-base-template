# @one/tag 更新日志

## v2.1.0 (2025-07-19)

### 🎯 重大改进

- 🎨 **移除scoped样式**：完全移除Vue组件的scoped样式，改用类名前缀避免样式冲突
- 🌍 **CSS变量全局化**：确保CSS变量在全局作用域生效，用户可以轻松覆盖样式
- 📦 **组件库架构优化**：提供更好的组件库使用体验，符合现代组件库标准
- 🎨 **主题定制增强**：支持47个CSS变量定制，提供完整的主题定制能力
- 📚 **文档完善**：添加详细的主题定制文档和使用示例

### 🔧 技术改进

- 移除所有Vue组件的scoped属性
- 优化CSS输出结构，变量不再被Vue scoped包裹
- 增强打包配置，禁用source map保护源码
- 完善TypeScript类型定义

### 📖 文档更新

- 新增主题定制文档 `docs/theme-customization.md`
- 更新README.md，添加主题定制示例
- 完善使用指南和API文档

## v1.0.10 (2025-06-25)

- Bug fixes and improvements

## v1.0.9 (2025-06-25)

- Bug fixes and improvements

## v2.0.3 (2025-07-18)

### Features

- 🎨 **样式隔离优化**：完全解决样式污染问题

  - 将CSS变量从`:root`作用域化到`.tags-view`选择器内
  - 移除了全局样式导入，使用Vue scoped样式确保样式隔离
  - 样式现在完全不会影响其他组件

- 🚀 **移除Element Plus依赖**：使用自定义dropdown组件
  - 徒手实现dropdown组件，完全替换Element Plus依赖
  - 打包体积减小约90%（CSS从约60KB减少到6.44KB）
  - 移除了Element Plus的peerDependency要求
  - 保持完全的API兼容性

### Code Cleanup

- 🧹 **清理未使用样式**：移除了灵动模式和卡片模式相关的未使用样式
  - 删除了`.schedule-active`、`.schedule-in`、`.schedule-out`样式
  - 删除了`.card-in`、`.card-out`样式
  - 删除了相关的CSS变量和动画关键帧
  - 减少了约30行冗余CSS代码

### Documentation

- 📚 **文档更新**：更新了CSS变量使用文档
  - 更新了变量作用域化的使用方法
  - 添加了向后兼容性说明
  - 移除了未使用变量的文档

## 2.0.2 (2024-10-30)

### Bug Fixes

- 修复了在地址栏输入错误地址时会创建"未命名页面"标签的问题
- 增强了路由验证逻辑，要求路由必须有 name 或 meta.title 才能被添加为标签页

## 2.0.1

### Bug Fixes

- 修复了标签页关闭逻辑的问题
- 优化了标签页的性能表现

## 2.0.0

### Major Changes

- 更新了tag首页页签的隐藏逻辑

## 1.0.1

### Patch Changes

- Initial release of @one/tag component - 标签页管理组件

  - 完整的标签页管理功能
  - 支持标签页的创建、关闭、刷新操作
  - 提供丰富的配置选项和事件回调
  - 包含完整的 TypeScript 类型定义
  - 支持 Vue 3 和 Vue Router 4
