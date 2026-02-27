# Template 基建收口清单（执行中）

## P0（必须先完成）

- [x] **P0-1 core 存储命名空间化**：auth/system/menu/layout/tabs/assets 支持 namespace + legacy 兼容读取
- [x] **P0-2 admin 去耦内部 key**：admin 不再直接读取 `ob_*` key，改为调用 core 导出能力
- [x] **P0-3 安全口径收口**：公开配置字段统一改为 `clientSignatureSalt`，并在 schema 中显式拦截废弃 `clientSignatureSecret`

## P1（模板化前建议完成）

- [x] **P1-1 通用鉴权编排抽离**：`fetchMe -> loadMenus -> redirect` 归一到 core（通用流程已抽离，sczfw 特有分支待下一批下沉）
- [x] **P1-2 tabs 单轨化决策**：admin/ui 运行时统一使用 `@one-base-template/tag`（core 不再维护 tabs 运行时逻辑）
- [x] **P1-3 配置 schema 下沉**：`platform-config` 解析/校验迁移至 core，admin 仅保留加载封装

## P2（对外分发优化）

- [ ] **P2-1 包分发形态**：构建产物、exports、版本策略准备
- [ ] **P2-2 质量门禁**：core/ui/adapters/admin 增加最低限度回归测试
- [ ] **P2-3 文档站模板化章节**：新增“消费者接入手册”和“迁移指南”

## 验收口径

- 代码：`pnpm -C packages/core typecheck && pnpm -C packages/core lint && pnpm -C apps/admin typecheck`
- 产物：`pnpm -C apps/admin build && pnpm -C apps/docs build`
- 文档：架构文档与配置文档已同步、示例路径可追溯
