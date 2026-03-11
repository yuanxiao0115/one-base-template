---
outline: false
---

# 文档总览

这里按“**先跑通、再理解、再扩展、最后协作交付**”组织入口。

## 入门导航

<p class="guide-section-intro">先完成本地可运行闭环，再进入架构与模块细节。</p>

<div class="guide-grid">
  <a class="guide-card" href="/guide/quick-start">
    <h3>快速开始</h3>
    <p>安装依赖、启动 admin/portal/template/docs，并跑一轮基础验证命令。</p>
  </a>
  <a class="guide-card" href="/guide/env">
    <h3>环境变量</h3>
    <p>区分构建期配置与运行时 platform-config，避免配置入口混乱。</p>
  </a>
  <a class="guide-card" href="/guide/template-static-app">
    <h3>Template 最小静态菜单项目</h3>
    <p>用于验证模板最小闭环，适合作为新应用的静态起点。</p>
  </a>
</div>

## 架构与运行时

<p class="guide-section-intro">理解分层边界、路由装配和菜单权限模型，避免后续返工。</p>

<div class="guide-grid">
  <a class="guide-card" href="/guide/architecture">
    <h3>目录结构与边界</h3>
    <p>先看决策级架构摘要：分层边界、职责分工与阅读路径。</p>
  </a>
  <a class="guide-card" href="/guide/architecture-runtime-deep-dive">
    <h3>启动链路细节（深度）</h3>
    <p>查看 admin/portal/template 的启动编排、运行时配置与路由收敛细节。</p>
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

## 组件与工程实践

<p class="guide-section-intro">以可复用组件和稳定模式推进页面开发与迁移。</p>

<div class="guide-grid">
  <a class="guide-card" href="/guide/crud-container">
    <h3>CRUD 容器与 Hook</h3>
    <p>统一弹窗/抽屉容器行为，减少页面重复编排代码。</p>
  </a>
  <a class="guide-card" href="/guide/crud-module-best-practice">
    <h3>CRUD 模块最佳实践</h3>
    <p>以 Position 模块为模板，沉淀 API、表单与状态组织方式。</p>
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
    <h3>Utils 工具包</h3>
    <p>工具包定位、使用边界与迁移建议。</p>
  </a>
  <a class="guide-card" href="/guide/utils-api">
    <h3>Utils API 速查</h3>
    <p>按模块检索高频工具方法与示例。</p>
  </a>
</div>

## 扩展能力

<p class="guide-section-intro">门户能力、引擎包和后端适配能力的接入入口。</p>

<div class="guide-grid">
  <a class="guide-card" href="/guide/portal-designer">
    <h3>门户设计器（PC）</h3>
    <p>管理端设计器、编辑器和预览渲染链路。</p>
  </a>
  <a class="guide-card" href="/guide/portal-engine">
    <h3>portal-engine 能力边界</h3>
    <p>共享引擎包职责、导出入口与 admin/portal 复用方式。</p>
  </a>
  <a class="guide-card" href="/guide/adapter-sczfw">
    <h3>sczfw Adapter</h3>
    <p>后端接口适配与字段映射的实现约定。</p>
  </a>
</div>

## 协作与发布

<p class="guide-section-intro">变更前后该做哪些检查、规则如何落盘、版本如何发布。</p>

<div class="guide-grid">
  <a class="guide-card" href="/guide/development">
    <h3>开发规范与维护</h3>
    <p>验证命令、构建策略、文档同步与工程约束。</p>
  </a>
  <a class="guide-card" href="/guide/markdown-doc-style">
    <h3>Markdown 技术文档规范</h3>
    <p>统一页面骨架、排版细节与验收口径，提升文档可执行性。</p>
  </a>
  <a class="guide-card" href="/guide/agent-harness">
    <h3>Agent Harness 与仓库知识</h3>
    <p>明确全局运行时与仓库项目知识的分工边界。</p>
  </a>
  <a class="guide-card" href="/guide/agents-scope">
    <h3>AGENTS 规则分层</h3>
    <p>全仓规则与子项目规则的适用范围和维护方式。</p>
  </a>
  <a class="guide-card" href="/guide/admin-agent-redlines">
    <h3>Admin Agent 红线</h3>
    <p>公共组件复用、CRUD 范式与 lint:arch 门禁的强制基线。</p>
  </a>
  <a class="guide-card" href="/guide/naming-whitelist">
    <h3>命名白名单（CLI）</h3>
    <p>统一动词+名词命名，保证脚手架生成物可维护。</p>
  </a>
  <a class="guide-card" href="/guide/package-release">
    <h3>子包发布与版本控制</h3>
    <p>Changeset、SemVer、发包流程与回滚注意事项。</p>
  </a>
</div>
