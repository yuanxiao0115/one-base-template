# 开发实践总览

## 适用范围

- 适用于 `apps/admin`、`apps/admin-lite` 以及通用前端页面开发中的实现规范对齐。
- 目标是让开发实践从“按文档名找”变成“按任务直达”。

## 四级导航定位

1. 顶部菜单：进入“指南”域。
2. 顶部下拉：走“开发实践总览”最短路径。
3. 左侧菜单：在开发实践域内横跳（CRUD / 表格 / 组件 / 图标 / Utils）。
4. 右侧锚点：只用于本页段落定位，不承担跨页导航。

## 常见任务直达

| 任务                         | 首选入口                                                             | 补充入口                                                             |
| ---------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------- |
| 新建管理模块并落地列表/弹层  | [/guide/crud-module-best-practice](/guide/crud-module-best-practice) | [/guide/crud-container](/guide/crud-container)                       |
| 对齐表格页面结构与交互规则   | [/guide/table-vxe-migration](/guide/table-vxe-migration)             | [/guide/crud-module-best-practice](/guide/crud-module-best-practice) |
| 选择或复用 Ob 组件能力       | [/guide/built-in-components](/guide/built-in-components)             | [/components/](/components/)                                         |
| 处理菜单图标与 Iconfont 接入 | [/guide/iconfont](/guide/iconfont)                                   | [/components/ob-menu-icon-input](/components/ob-menu-icon-input)     |
| 查询工具函数与 API 约定      | [/guide/utils](/guide/utils)                                         | [/guide/utils-api](/guide/utils-api)                                 |

## 专题地图

### CRUD 主线

- [CRUD 开发规范](/guide/crud-module-best-practice)
- [CRUD 容器与 Hook（进阶）](/guide/crud-container)

### 表格主线

- [表格开发规范](/guide/table-vxe-migration)

### 组件与图标

- [内置组件（Ob 系列）](/guide/built-in-components)
- [Iconfont 集成](/guide/iconfont)
- [组件库总览](/components/)

### 工具与 API

- [Utils 工具包（总览）](/guide/utils)
- [Utils API 速查（按模块）](/guide/utils-api)

## 最小执行建议

1. 先按“任务直达”进入主文档，再根据侧栏做邻接扩展阅读。
2. 同一轮改动只跟一条主线，避免 CRUD/表格/组件规则交叉切换导致返工。
3. 规则更新后同步检查 [开发规范与维护](/guide/development) 的验证与文档落盘要求。
