# useTagAPI 完整功能参考

## 📋 概述

`useTagAPI()` 是 @one-base-template/tag v1.0.13 包的核心 API，提供了标签页管理的所有功能。它是一个组合式函数，返回一个包含 30+ 个方法和属性的对象。

> **重要更新**: v1.0.13 中 `deleteMenu` 已被 `deleteDynamicTag` 替代，提供更统一的删除操作。

## 🎯 使用方式

```typescript
import { useTagAPI } from '@one-base-template/tag';

const tagAPI = useTagAPI();

// 使用各种功能
tagAPI.tagOnClick(item); // 点击标签
tagAPI.deleteDynamicTag(tag); // 删除标签
tagAPI.dynamicRouteTag('/path'); // 动态路由跳转
tagAPI.refreshTag(); // 刷新当前页
```

## 📚 完整 API 列表

### 🎯 核心操作 (5个)

#### `tagOnClick(item: TagItem)`

- **功能**: 标签点击事件处理
- **参数**: `item` - 标签项对象
- **用途**: 切换到指定标签页

#### `deleteDynamicTag(obj: TagItem, tag?: string)`

- **功能**: 删除标签（统一删除方法，替代 deleteMenu）
- **参数**:
  - `obj` - 要删除的标签项
  - `tag` - 删除类型 ('left' | 'right' | 'other' | undefined)
- **用途**: 删除指定标签或批量删除，支持复杂的激活逻辑

#### `dynamicRouteTag(path: string)`

- **功能**: 动态路由跳转
- **参数**: `path` - 路由路径
- **用途**: 跳转到指定路由并添加标签

#### `refreshTag()`

- **功能**: 刷新当前页面
- **用途**: 重新加载当前标签页内容

#### `onClickDrop(key: string, item: any, selectRoute: any)`

- **功能**: 右键菜单操作处理
- **参数**:
  - `key` - 操作类型
  - `item` - 菜单项
  - `selectRoute` - 选中的路由

### 🎨 菜单操作 (2个)

#### `openMenu(tag: TagItem, event: MouseEvent)`

- **功能**: 打开右键菜单
- **参数**:
  - `tag` - 标签项
  - `event` - 鼠标事件
- **用途**: 显示标签的右键上下文菜单

#### `closeMenu()`

- **功能**: 关闭右键菜单
- **用途**: 隐藏当前显示的右键菜单

### 📊 状态访问 (3个)

#### `multiTags: Ref<TagItem[]>`

- **功能**: 获取所有标签列表
- **类型**: 响应式数组
- **用途**: 访问当前所有打开的标签

#### `currentSelect: Ref<TagItem | null>`

- **功能**: 获取当前选中的标签
- **类型**: 响应式对象
- **用途**: 访问当前激活的标签信息

#### `activeTag: ComputedRef<TagItem | null>`

- **功能**: 获取当前激活的标签
- **类型**: 计算属性
- **用途**: 访问 store 中的激活标签

### 🗄️ Store 操作 (8个)

#### `addTag(tag: TagItem)`

- **功能**: 添加标签
- **参数**: `tag` - 标签项
- **用途**: 向标签列表添加新标签

#### `removeTag(tag: TagItem)`

- **功能**: 删除标签
- **参数**: `tag` - 标签项
- **用途**: 从标签列表移除指定标签

#### `updateTagTitle(tag: TagItem)`

- **功能**: 更新标签标题
- **参数**: `tag` - 标签项
- **用途**: 修改标签的显示标题

#### `clearAllTags()`

- **功能**: 清空所有标签
- **用途**: 移除所有标签（包括首页）

#### `closeLeftTags(tag: TagItem)`

- **功能**: 关闭左侧标签
- **参数**: `tag` - 参考标签项
- **用途**: 关闭指定标签左侧的所有标签

#### `closeRightTags(tag: TagItem)`

- **功能**: 关闭右侧标签
- **参数**: `tag` - 参考标签项
- **用途**: 关闭指定标签右侧的所有标签

#### `closeOtherTags(tag: TagItem)`

- **功能**: 关闭其他标签
- **参数**: `tag` - 保留的标签项
- **用途**: 关闭除指定标签外的所有标签

#### `clear()`

- **功能**: 清空除首页外的所有标签
- **用途**: 保留首页，清空其他所有标签

#### `reset(defaultTags?: TagItem[])`

- **功能**: 重置标签为默认状态
- **参数**: `defaultTags` - 可选的默认标签数组
- **用途**: 恢复到初始标签状态

### 🛠️ 工具函数 (1个)

#### `updateTabTitle(path: string, title: string, query?: any, params?: any)`

- **功能**: 更新标签标题（工具方法）
- **参数**:
  - `path` - 路径
  - `title` - 新标题
  - `query` - 查询参数
  - `params` - 路由参数
- **用途**: 精确更新指定路径标签的标题

### ⚙️ 配置方法 (3个)

#### `configure(config: TagConfig)`

- **功能**: 配置标签页
- **参数**: `config` - 配置选项
- **用途**: 设置标签页的各种配置

#### `getConfig(): TagConfig`

- **功能**: 获取当前配置
- **返回**: 当前的配置对象
- **用途**: 读取当前标签页配置

#### `initStorage()`

- **功能**: 初始化标签存储
- **用途**: 手动初始化存储系统

### 🛡️ 路由守卫 (2个)

#### `enableAutoTags(router: Router)`

- **功能**: 启用自动标签管理
- **参数**: `router` - Vue Router 实例
- **用途**: 自动根据路由变化管理标签

#### `addFromRoute(route: RouteLocationNormalized)`

- **功能**: 手动从路由添加标签
- **参数**: `route` - 路由信息
- **用途**: 根据路由信息手动添加标签

### 🔧 Store 配置 (1个)

#### `setPiniaInstance(pinia: Pinia)`

- **功能**: 设置外部 Pinia 实例
- **参数**: `pinia` - Pinia 实例
- **用途**: 集成到现有应用的状态管理

### 📡 事件 API (3个)

#### `triggerMenuSelect(path: string)`

- **功能**: 触发菜单选择事件
- **参数**: `path` - 路由路径
- **用途**: 供菜单组件调用，触发标签切换

#### `onMenuSelect(handler: (path: string) => void)`

- **功能**: 监听菜单选择事件
- **参数**: `handler` - 事件处理函数
- **用途**: 监听菜单选择变化

#### `offMenuSelect(handler?: (path: string) => void)`

- **功能**: 取消监听菜单选择事件
- **参数**: `handler` - 事件处理函数（可选）
- **用途**: 移除事件监听器

## 📊 API 统计

- **总计**: 30+ 个方法和属性
- **核心操作**: 5 个
- **菜单操作**: 2 个
- **状态访问**: 3 个
- **Store 操作**: 8 个
- **工具函数**: 1 个
- **配置方法**: 3 个
- **路由守卫**: 2 个
- **Store 配置**: 1 个
- **事件 API**: 3 个

## 🆕 v1.0.13 更新说明

### 重要变更

1. **`deleteMenu` → `deleteDynamicTag`**: 统一删除方法，提供更好的激活逻辑
2. **移除 `homeName` 配置**: 统一使用 `homeTitle`
3. **简化参数**: `deleteDynamicTag(obj, tag)` 移除了无用的 `current` 参数

### 迁移指南

```typescript
// 旧版本
tagAPI.deleteMenu(tag, 'left');

// 新版本
tagAPI.deleteDynamicTag(tag, 'left');

// 配置变更
// 旧版本
setConfig({ homeName: 'Home', homeTitle: '首页' });

// 新版本
setConfig({ homeTitle: '首页' });
```

## 💡 使用建议

1. **基础使用**: 主要使用 `tagOnClick`、`deleteDynamicTag`、`dynamicRouteTag`
2. **批量操作**: 使用 `deleteDynamicTag` 的不同 tag 参数实现批量删除
3. **配置管理**: 使用 `configure` 和 `getConfig` 管理配置
4. **事件监听**: 使用 `onMenuSelect` 监听菜单变化
5. **自动化**: 使用 `enableAutoTags` 实现自动标签管理
