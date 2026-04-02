# System-sfss 路由基线（老 URL 对齐）

## 路由组

1. `/law-supervison/sunshine-petition`
2. `/law-supervison/petition-supervision`
3. `/law-supervison/petition-processing`
4. `/law-supervison/special-petition-management`
5. `/law-supervison/petition-query`
6. `/lawsuit-petitions/litigation-related/relatedMenu`

## 推荐做法

- 每个路由组先落“父路由 + redirect + 子路由”结构。
- 子路由路径保持与后端菜单 URL 一致。
- 页面未完成时，统一使用可运行占位页承接。

## 常见首页映射

- systemCode: `judicial_petition_management_system`
- homePath: `/law-supervison/sunshine-petition/shi`

> 如果后端菜单配置不同，以联调环境实际返回的菜单 URL 为准。
