---
outline: false
---

# 文档总览

文档按“大目录”组织：**入门 → 架构 → 开发实践 → 扩展能力 → 维护治理**。

## 🧭 按水平进入（推荐主入口）

<p class="guide-section-intro">先按能力层级选路径，再按任务跳到专题页，能明显降低上手心智负担。</p>

<div class="guide-grid">
  <a class="guide-card" href="/guide/levels/p2">
    <h3>P2 路线（上手）</h3>
    <p>30-45 分钟跑通首个开发闭环，并附“升级到 P4”判断信号。</p>
  </a>
  <a class="guide-card" href="/guide/levels/p4">
    <h3>P4 路线（独立开发）</h3>
    <p>围绕模块开发与验证门禁稳定交付，并附“升级到 P6”信号。</p>
  </a>
  <a class="guide-card" href="/guide/levels/p6">
    <h3>P6 路线（架构治理）</h3>
    <p>聚焦规则分层与治理策略，并给出“何时回看 P4/P2”路径。</p>
  </a>
</div>

## 📈 成长信号（升级与回看）

<p class="guide-section-intro">如果你不确定该进阶还是回退，先看层级页里的“升级信号”章节，再决定下一步。</p>

<div class="guide-grid">
  <a class="guide-card" href="/guide/levels/p2">
    <h3>P2 → P4</h3>
    <p>当你能独立完成模块新增并通过验证时，进入 P4 主线。</p>
  </a>
  <a class="guide-card" href="/guide/levels/p4">
    <h3>P4 → P6</h3>
    <p>当你开始承担规则治理与跨模块收口时，进入 P6 主线。</p>
  </a>
  <a class="guide-card" href="/guide/levels/p6">
    <h3>P6 回看 P4/P2</h3>
    <p>当任务仅是模块实现或首跑问题时，按信号回看更低层路径。</p>
  </a>
</div>

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
    <h3>zfw-system-sfss 快速手册</h3>
    <p>聚焦 zfw 项目的默认配置口径、System-sfss 模块路径与迁移起步方式。</p>
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
    <p>基于 moduleMeta/module 的模块装配、白名单过滤与兼容策略。</p>
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
  <a class="guide-card" href="/guide/crud-module-best-practice">
    <h3>CRUD 开发规范</h3>
    <p>合并 CRUD 容器与模块实践，按一条主线完成列表与弹层开发。</p>
  </a>
  <a class="guide-card" href="/guide/table-vxe-migration">
    <h3>表格开发规范</h3>
    <p>统一 `ObPageContainer + ObTableBox + ObTable` 的页面编排与交互约定。</p>
  </a>
  <a class="guide-card" href="/guide/built-in-components">
    <h3>内置组件（Ob 系列）</h3>
    <p>快速了解已封装组件能力边界与最小接入方式。</p>
  </a>
  <a class="guide-card" href="/components/">
    <h3>组件库（Ob 系列）</h3>
    <p>查看每个组件的完整属性、事件 API、插槽、暴露方法与示例。</p>
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
  <a class="guide-card" href="/guide/document-form-designer">
    <h3>公文表单</h3>
    <p>覆盖设计引擎与 Sheet Schema，聚焦表单设计与渲染协议。</p>
  </a>
  <a class="guide-card" href="/guide/portal/">
    <h3>门户设计器</h3>
    <p>聚焦管理端接入、portal-engine 边界与内置组件复用。</p>
  </a>
  <a class="guide-card" href="/guide/adapter-basic">
    <h3>basic Adapter</h3>
    <p>后端接口适配与字段映射的实现约定。</p>
  </a>
</div>

## 🧰 维护治理

<p class="guide-section-intro">变更前后检查、规则落盘与版本发布。</p>

<div class="guide-grid">
  <a class="guide-card" href="/guide/development">
    <h3>开发规范与维护</h3>
    <p>验证命令、构建策略、文档同步与工程约束。</p>
  </a>
  <a class="guide-card" href="/guide/tech-doc-collaboration">
    <h3>技术文档协作与改造</h3>
    <p>按“分析 -> 改造 -> 验收”主线执行 docs 页面治理与持续维护。</p>
  </a>
  <a class="guide-card" href="/guide/monorepo-web-migration-pitfalls">
    <h3>迁移踩坑清单（monorepo-web）</h3>
    <p>沉淀已踩坑与纠偏动作，减少迁移重复返工。</p>
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

## 👥 角色入口（辅助）

角色入口用于“同层任务分流”，建议先走分层主线再进入角色页。

- [框架使用者阅读入口](/guide/for-users)
- [仓库维护者阅读入口](/guide/for-maintainers)
