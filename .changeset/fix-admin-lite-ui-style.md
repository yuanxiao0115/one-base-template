---
'@one-base-template/create-admin-lite': patch
'@one-base-template/ui': patch
---

修复 admin-lite 独立项目未加载 UI 包 scoped 样式的问题。CLI 模板、doctor 与 upgrade 会检查并补齐 `@one-base-template/ui` dist 样式入口，UI 包新增 `./style` 样式导出供后续稳定消费。
