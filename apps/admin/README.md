# apps/admin 架构与升级指南（示例子项目）

> 适用目录：`apps/admin/**`
> 
> 目标：`admin` 既能承载当前业务二开，也能作为后续新子项目的参考模板；同时保证基建升级时与业务代码低冲突。

## 1. 一句话架构

`apps/admin` 采用“**启动编排层（bootstrap）+ 路由装配层（router）+ 运行时基础设施层（infra）+ 共享能力层（shared）+ 业务模块层（modules）**”分层。

核心原则：

- 基建能力尽量收敛在 `bootstrap/router/infra/shared` 与 `packages/*`
- 业务页面与业务编排集中在 `modules/**`
- 同事二开尽量只改 `modules/**` 与少量 `config/**`
- `admin` 作为示例子项目，后续新增 `apps/<new-project>` 时复用这套分层边界

## 2. src 全层级说明

```text
src/
  main.ts                    # 最小入口：触发 startAdminApp（共享启动骨架）
  bootstrap/                 # 启动编排（create app/router/pinia/http/core + 插件 + 守卫）
  router/                    # 模块注册与路由装配（manifest 扫描、白名单、保留路由）
  infra/                     # 运行时基础设施（env/confirm/sczfw crypto）
  shared/                    # admin 应用内跨模块共享能力（认证/SSO service、logger、共享 API 类型）
  config/                    # admin 项目级配置（layout/theme/sso/systems/platform-config）
  modules/                   # 业务模块（User/System/Log/Cms/portal/home）
  components/                # 跨模块复用组件（如 PersonnelSelector、富文本）
  pages/                     # 公共入口页（login/sso）
  styles/                    # 全局样式与 Element Plus 覆盖
  utils/                     # admin 侧通用工具（如 message）
  types/                     # 全局类型补丁声明
```

## 3. 依赖方向与解耦契约

推荐依赖方向（稳定）：

- `main -> bootstrap`
- `bootstrap -> router/config/infra/shared`
- `router -> modules/config/infra`
- `modules -> shared/core/ui`（按页面需求）
- `shared -> infra`

禁止/不建议：

- `modules/**` 直接依赖 `@/infra/http`
- `modules/**` 直接读取 `import.meta.env`
- 在页面/模块里创建 `createApp/createPinia/createRouter`
- 把单模块私有逻辑（仅一处使用的 mapper/normalize/helper）上提到 `shared`

`shared` 目录边界说明：

- 定位：`apps/admin` 内跨模块共享层，不是跨应用公共层
- 允许：`shared/api/types.ts`、登录/SSO 相关 `shared/services/*`、`shared/logger.ts`
- 不允许：业务模块私有实现上提到 `shared`（仍放 `modules/<module>/**`）
- 若形成跨应用复用价值，优先下沉 `packages/core` / `packages/adapters`

这样做的目的：

- 基建升级主要落在 `bootstrap/router/infra/shared` 与 `packages/*`
- 业务模块尽量不感知启动链路和底层实现细节
- 减少“升级基建=大面积改业务文件”的连锁冲突
- 启动链路统一复用 `@one-base-template/app-starter`，多子项目可同步升级

## 4. 为什么这套结构更易升级

把改动分成两类：

- 基建改动：路由守卫、主题系统、HTTP 拦截、SSO、layout 壳层
- 业务改动：模块页面、表单、表格、接口字段、交互流程

在当前分层下：

- 基建改动优先改 `packages/core` / `packages/ui` / `apps/admin/src/bootstrap|router|infra|shared`
- 业务改动优先改 `apps/admin/src/modules/**`
- 两类改动天然分离，减少同文件冲突概率

## 5. 同事新建子项目的最小接入流程（建议）

以“新建一个与 admin 并行的业务子项目”为目标：

1. 复制 `apps/admin` 的启动骨架（`main.ts + bootstrap + router + infra + shared + config`）
2. 保留 `router/registry.ts + module manifest` 机制（`modules/**/module.ts`）
3. 把业务代码只放进新项目的 `modules/**`
4. 若后端协议不同，优先改 adapter/shared service，不在页面散落兼容逻辑
5. 保持“模块只依赖 shared/core/ui”的边界
6. 新项目独有的主题/布局/系统入口，放到该项目自己的 `config/**`
7. 基建公共能力优先上移 `packages/core` / `packages/ui` / `packages/adapters`

### 5.1 子项目升级友好约定（关键）

1. **子项目只做组装，不复制基建实现**：`bootstrap/router/infra` 只保留薄编排，通用逻辑优先沉淀到 `packages/*`
2. **模块契约稳定优先**：模块只暴露 `module.ts + routes.ts + apiNamespace` 等稳定接口，避免直接耦合启动细节
3. **兼容能力集中声明**：历史路径与菜单归属统一写在 `module.compat`，不在页面里散落跳转兼容代码
4. **升级入口单点化**：路由装配、守卫、HTTP、主题等升级点集中在少量文件，业务模块尽量无感

## 6. admin 二开建议（不新建子项目时）

- 优先新增/修改 `modules/**`
- 谨慎改 `bootstrap/index.ts` 与 `router/assemble-routes.ts`（这是升级敏感区）
- 若要做全局策略（如统一错误处理、鉴权、主题、tabs），优先改 `packages/*` 或 `shared/infra`

## 7. 本轮已落地的结构收敛

已完成：

1. HTTP 运行时访问器下沉到 core：删除 `src/shared/api/http-client.ts` 与 `src/infra/http.ts`，统一从 `@one-base-template/core` 使用 `getObHttpClient/setObHttpClient`
2. 统一模块路由入口写法：
   - `home/module.ts` 改为从 `./routes` 导入
   - `portal/module.ts` 改为从 `./routes` 统一导入 `layout + standalone`
   - `portal/routes.ts` 增加 `standaloneRoutes` 聚合导出
3. `bootstrap` 的 `baseUrl/storageNamespace` 已由 `bootstrap/index.ts` 显式下传（减少隐式全局依赖）
4. 模块路由组件改为懒加载（`component: () => import(...)`），降低 `admin-app-shell` 首包压力
5. 登录/SSO 与认证 service 的响应类型统一复用 `shared/api/types.ts`，减少重复 `BizResponse` 定义与类型漂移

## 8. 本轮已完成的升级友好收敛（新增）

1. `router/assemble-routes.ts` 已完全参数化：通过 `AppRouteAssemblyOptions` 显式传入 `enabledModules/defaultSystemCode/systemHomeMap/storageNamespace`，装配层不再直接读取 `getAppEnv()`
2. `module manifest compat` 已进入执行链：
   - `compat.activePathMap`：在路由未声明 `meta.activePath` 时补齐归属
   - `compat.routeAliases`：生成历史路径 `redirect` 兼容路由（冲突或保留路径会自动跳过并告警）
3. `bootstrap/index.ts` 已承担统一注入职责，环境读取与路由装配边界更清晰

## 9. 后续可选优化（跨子项目推广）

1. 提供 `pnpm new:app <name>` 子项目脚手架，默认生成与 admin 相同的分层骨架
2. 将 `router/assemble-routes` 抽象为可复用包（如 `packages/core/router-assembler`），admin 仅做项目化参数注入
3. 约束 `apps/*` 的依赖边界（ESLint + 构建检查），防止子项目反向耦合到其他业务项目
4. 建立“基建升级变更日志”文档模板，发布时明确需要子项目关注的 break/change 点

## 10. 验证命令

```bash
pnpm -C packages/core exec vitest run src/http/runtime.test.ts
pnpm -C apps/admin exec vitest run src/infra/__tests__/env.unit.test.ts src/bootstrap/__tests__/http.unit.test.ts
pnpm -C apps/admin typecheck
pnpm -C apps/admin lint:arch
pnpm -C apps/admin lint
pnpm -C apps/admin test:run
pnpm -C apps/admin build
```
