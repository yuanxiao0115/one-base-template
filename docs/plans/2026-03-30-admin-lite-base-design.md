# admin-lite 后台基座替换设计稿

> 日期：2026-03-30
> 作用域：`apps/admin-lite`、根脚本、文档站、规则文件

## 背景

当前仓库把 `apps/template` 作为“新子项目孵化 + 迁移承接基座”，但真实使用场景已经转向“快速承接同类后台项目开发”。

在该场景下，`apps/admin` 与目标项目的登录、鉴权、布局、路由装配和后台壳层更加接近，继续维护 `template` 这套更轻但更远离真实后台场景的基座，反而增加起项目成本。

## 目标

1. 删除 `apps/template`。
2. 基于 `apps/admin` 复制并收敛出 `apps/admin-lite`。
3. 让 `apps/admin-lite` 承担后台快速起项目的标准基座职责。
4. 将 `pnpm new:app` 的母版切换到 `apps/admin-lite`。
5. 同步更新 README、文档站和 AGENTS 规则，使仓库口径一致。

## 非目标

1. 不改动现有 `apps/admin` 的业务实现定位。
2. 不处理当前主线已存在但与本次目标无关的 admin 历史 typecheck 报错。
3. 不为 `admin-lite` 做过度抽象或大规模公共包重构。

## 方案选择

采用“方案 2：通用后台基座”。

默认保留模块：

- `home`
- `admin-management`
- `system-management`
- `log-management`

移除当前业务强绑定模块：

- `cms-management`
- `PortalManagement`
- `DocumentFormManagement`

## 设计决策

### 1. 基座来源

`apps/admin-lite` 直接复制 `apps/admin`，保留已验证的：

- 启动链路：`main.ts -> bootstrap/startup.ts -> bootstrap/index.ts -> mount`
- 模块注册：`manifest.ts + module.ts + routes.ts`
- 登录/SSO/鉴权服务
- 路由装配、布局壳、UI 插件装配

原因：这套链路更接近真实后台项目，能够直接承接业务开发，而不是继续在 `template` 上补齐后台壳能力。

### 2. 模块收敛策略

`admin-lite` 不只通过 `enabledModules` 隐藏模块，而是物理删除明显业务化模块目录，避免后续新项目复制出无关代码包袱。

保留的模块以“后台通用基础设施”为准，删除 CMS、Portal、公文表单等场景型模块。

### 3. 管理端扩展开关

`admin-lite` 中当前存在两类不适合强绑定的扩展：

- 顶栏管理端增强（租户切换、个人中心、修改密码、个性设置）
- 素材图片缓存 Service Worker

处理方式：

- 在 `src/config/ui.ts` 新增顶栏功能开关配置。
- `AdminTopBar.vue` 根据配置决定是否渲染对应能力。
- 素材缓存继续保留配置入口，但在 `admin-lite` 默认关闭。

### 4. 脚手架切换

`pnpm new:app` 的复制源从 `apps/template` 改为 `apps/admin-lite`。

同时更新：

- 文本替换规则
- 启动函数 / 样式入口重命名规则
- `lint:arch` 注入脚本
- 文档提示与生成说明

### 5. 规则与文档口径

仓库内所有“当前基座 = template”的公开表述，需要切到“当前后台基座 = admin-lite”。

更新范围至少包括：

- 根 `AGENTS.md`
- `README.md`
- `apps/docs/docs/.vitepress/config.ts`
- `apps/docs/docs/guide/*` 中的基座说明页、快速开始页、规则分层页、开发指南页
- `apps/admin-lite/AGENTS.md` 与 `apps/admin-lite/README.md`

## 验证口径

由于当前 HEAD 存在与本次目标无关的既有 admin typecheck 报错，本轮采用“定向验证 + 文档构建验证”收口：

1. `pnpm -C apps/admin-lite lint`
2. `pnpm -C apps/admin-lite lint:arch`
3. `pnpm -C apps/admin-lite build`
4. `pnpm -C apps/docs build`
5. 视情况补充 `pnpm -C apps/admin-lite test:run:file -- ...` 的定向测试

## 风险

1. `new:app` 若遗漏旧 template 字符串替换，生成的新 app 会残留 `admin-lite` 标识。
2. 文档站若遗漏导航和链接替换，会出现失效页面。
3. 如果只修改 `enabledModules` 而不删物理模块，`admin-lite` 仍会携带明显业务包袱。
4. 若顶栏开关只改文案不改渲染逻辑，仍无法达到“可按项目裁剪”的目的。

## 完成定义

1. 仓库中不再保留 `apps/template`。
2. `apps/admin-lite` 可独立作为后台基座启动与构建。
3. `pnpm new:app` 默认从 `apps/admin-lite` 派生。
4. 文档、README、AGENTS 对基座定位的描述一致。
