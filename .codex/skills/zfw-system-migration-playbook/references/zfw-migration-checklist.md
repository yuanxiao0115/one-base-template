# ZFW 迁移检查清单

## A. 范围确认

- [ ] 来源仓库路径已确认
- [ ] 目标 app 与目标模块目录已确认
- [ ] 本次范围是“路由/配置收口”还是“业务页面完整迁移”

## B. 脚手架与目录

- [ ] 已执行 `pnpm new:app <app-id>`（若需要）
- [ ] 已执行 `pnpm new:module <module-id> --title <title> --app <app-id>`
- [ ] 模块目录存在 `index.ts + routes.ts + pages/**`

## C. 平台配置对齐

- [ ] `defaultSystemCode` 对齐老系统编码
- [ ] `systemHomeMap` 指向可访问业务首页
- [ ] `enabledModules` 包含迁移模块 id
- [ ] `appcode` 与老项目请求头口径一致

## D. 路由与菜单对齐

- [ ] 老菜单 URL 在新模块 `routes.ts` 中可命中
- [ ] 父路由必要时使用 `redirect` 收口
- [ ] `keepAlive=true` 的路由都设置稳定 `name`
- [ ] 非菜单页通过 `meta.access='auth'` 收口

## E. 页面迁移策略

- [ ] 简单页面已直接迁移
- [ ] 复杂页面先用占位页保证可运行
- [ ] legacy 原始代码保留到 app 的非编译目录

## F. 验证

- [ ] `pnpm -C apps/<app-id> typecheck`
- [ ] `pnpm -C apps/<app-id> lint`
- [ ] `pnpm -C apps/<app-id> lint:arch`
- [ ] `pnpm -C apps/<app-id> build`
- [ ] 文档变更时：`pnpm -C apps/docs lint && pnpm -C apps/docs build`

## G. 证据与文档

- [ ] `.codex/operations-log.md` 记录改动
- [ ] `.codex/testing.md` 记录命令与结果
- [ ] `.codex/verification.md` 与当日详情文件已更新
- [ ] `apps/docs` 已同步新口径
