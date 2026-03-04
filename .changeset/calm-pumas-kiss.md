---
"@one-base-template/lint-ruleset": patch
---

完善 `@one-base-template/lint-ruleset` 的可发布能力：

- 将子包从私有模式切换为可发布模式，补齐 `publishConfig/files`。
- 调整配置运行时依赖与 peerDependencies，确保外部项目可直接接入。
- 新增 `prepublishOnly` 自检钩子，发布前自动执行 lint 校验。
- 同步补充文档站的接入、发布与版本管理说明。
