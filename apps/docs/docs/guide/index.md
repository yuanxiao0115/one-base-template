---
outline: false
---

# 文档总览

文档按“大目录”组织：**入门 → 架构 → 开发实践 → 扩展能力 → 维护治理**。

## 🚀 入门

<p class="guide-section-intro">先跑通项目，再进入后续专题。</p>

<div class="guide-grid">
  <a class="guide-card" href="/guide/quick-start">
    <h3>快速开始</h3>
    <p>安装依赖、启动 admin/admin-lite/portal/docs，并完成基础验证。</p>
  </a>
  <a class="guide-card" href="/guide/env">
    <h3>环境变量</h3>
    <p>区分构建期变量与运行时 platform-config，避免配置入口混乱。</p>
  </a>
  <a class="guide-card" href="/guide/admin-lite-base-app">
    <h3>admin-lite 后台基座</h3>
    <p>与 admin 同构的后台快速起项目基座，用于直接承接新后台业务开发。</p>
  </a>
  <a class="guide-card" href="/guide/zfw-system-sfss-quick-start">
    <h3>zfw-system-sfss 快速使用手册</h3>
    <p>面向同事交接：一页搞定启动、验证命令与 starter-crud 上手路径。</p>
  </a>
</div>

## 🧱 架构与运行时

<p class="guide-section-intro">明确目录边界、模块装配和路由规范，减少返工。</p>

<div class="guide-grid">
  <a class="guide-card" href="/guide/architecture">
    <h3>目录结构与边界</h3>
    <p>先看决策级架构摘要：分层边界、职责分工与阅读路径。</p>
  </a>
  <a class="guide-card" href="/guide/architecture-runtime-deep-dive">
    <h3>启动链路细节（深度）</h3>
    <p>查看 admin/admin-lite/portal 的启动编排与运行时细节。</p>
  </a>
  <a class="guide-card" href="/guide/module-system">
    <h3>模块系统与切割</h3>
    <p>基于 manifest/module 的模块装配、白名单过滤与兼容策略。</p>
  </a>
  <a class="guide-card" href="/guide/menu-route-spec">
    <h3>菜单与路由规范（Schema）</h3>
    <p>统一 static/remote 两类模式及 route meta 契约。</p>
  </a>
  <a class="guide-card" href="/guide/layout-menu">
    <h3>布局与菜单</h3>
    <p>布局模式、系统切换、标签栏与非菜单路由归属规则。</p>
  </a>
  <a class="guide-card" href="/guide/theme-system">
    <h3>主题系统</h3>
    <p>主题 token、运行时注入与 UI 覆盖策略。</p>
  </a>
</div>

## 🛠️ 开发实践

<p class="guide-section-intro">沉淀组件与页面开发范式，保持实现一致性。</p>

<div class="guide-grid">
  <a class="guide-card" href="/guide/crud-container">
    <h3>CRUD 容器与 Hook</h3>
    <p>统一弹窗/抽屉容器行为，减少页面重复编排代码。</p>
  </a>
  <a class="guide-card" href="/guide/crud-module-best-practice">
    <h3>CRUD 模块最佳实践</h3>
    <p>以 Position 模板沉淀 API、表单和状态组织方式。</p>
  </a>
  <a class="guide-card" href="/guide/table-vxe-migration">
    <h3>VXE 表格迁移</h3>
    <p>从旧表格页面迁移到 ObTableBox + ObVxeTable 的标准路径。</p>
  </a>
  <a class="guide-card" href="/guide/button-styles">
    <h3>组件样式（按钮）</h3>
    <p>按钮视觉规范、状态约束与主题变量映射。</p>
  </a>
  <a class="guide-card" href="/guide/iconfont">
    <h3>Iconfont 集成</h3>
    <p>图标来源、命名约束与菜单图标兼容策略。</p>
  </a>
  <a class="guide-card" href="/guide/utils">
    <h3>Utils 工具包与 API</h3>
    <p>工具包定位、使用边界与按模块 API 速查。</p>
  </a>
</div>

## 🔌 扩展能力

<p class="guide-section-intro">门户能力与后端适配能力的接入入口。</p>

<div class="guide-grid">
  <a class="guide-card" href="/guide/portal/">
    <h3>门户体系总览</h3>
    <p>先看入口、边界和阅读路径，再进入分层文档。</p>
  </a>
  <a class="guide-card" href="/guide/portal/admin-designer">
    <h3>PortalManagement 管理端接入</h3>
    <p>聚焦 admin 消费者视角：路由、编排与注入链路。</p>
  </a>
  <a class="guide-card" href="/guide/portal/engine-boundary">
    <h3>portal-engine 边界与导出层</h3>
    <p>共享引擎职责、导出约束与跨应用复用边界。</p>
  </a>
  <a class="guide-card" href="/guide/portal/material-extension">
    <h3>门户物料扩展与注册</h3>
    <p>新增分类/物料并注册到 admin 的标准方式。</p>
  </a>
  <a class="guide-card" href="/guide/adapter-basic">
    <h3>basic Adapter</h3>
    <p>后端接口适配与字段映射的实现约定。</p>
  </a>
  <a class="guide-card" href="/guide/document-form-sheet-schema">
    <h3>公文表单 Sheet Schema</h3>
    <p>查看合并、边框线色、样式区域、冻结区与版本迁移口径。</p>
  </a>
</div>

## 🧰 维护治理

<p class="guide-section-intro">变更前后检查、规则落盘与版本发布。</p>

<div class="guide-grid">
  <a class="guide-card" href="/guide/development">
    <h3>开发规范与维护</h3>
    <p>验证命令、构建策略、文档同步与工程约束。</p>
  </a>
  <a class="guide-card" href="/guide/agents-scope">
    <h3>AGENTS 规则分层</h3>
    <p>全仓规则与子项目规则的适用范围和维护方式。</p>
  </a>
  <a class="guide-card" href="/guide/agent-harness">
    <h3>Agent Harness 与仓库知识</h3>
    <p>明确全局运行时与仓库项目知识的分工边界。</p>
  </a>
  <a class="guide-card" href="/guide/admin-agent-redlines">
    <h3>Admin Agent 红线</h3>
    <p>公共组件复用、CRUD 范式与 lint:arch 门禁的强制基线。</p>
  </a>
  <a class="guide-card" href="/guide/admin-lite-agent-redlines">
    <h3>admin-lite Agent 红线</h3>
    <p>约束后台基座的默认模块、启动骨架、可开关扩展与派生边界。</p>
  </a>
  <a class="guide-card" href="/guide/admin-legacy-migration-workflow">
    <h3>Admin 老项目迁移工作流</h3>
    <p>把老项目迁移、管理模块标准化与验证收口串成一条主流程。</p>
  </a>
  <a class="guide-card" href="/guide/naming-whitelist">
    <h3>命名白名单（CLI）</h3>
    <p>统一动词+名词命名，保证脚手架生成物可维护。</p>
  </a>
  <a class="guide-card" href="/guide/package-release">
    <h3>子包发布与版本控制</h3>
    <p>Changeset、SemVer、发包流程与回滚注意事项。</p>
  </a>
  <a class="guide-card" href="/guide/package-version-governance">
    <h3>子包版本治理 SOP（多主线）</h3>
    <p>定义 main/LTS 分支协作方式，支撑 1.x 与 2.x 并行维护。</p>
  </a>
  <a class="guide-card" href="/guide/business-integration-version-matrix">
    <h3>业务接入版本矩阵与迁移模板</h3>
    <p>用矩阵管理业务项目版本线，并提供跨 major 迁移模板。</p>
  </a>
</div>

## 👥 角色入口（可选）

- [框架使用者阅读入口](/guide/for-users)
- [仓库维护者阅读入口](/guide/for-maintainers)
