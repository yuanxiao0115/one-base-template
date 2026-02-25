---
outline: false
---

# 文档总览

这里按**上手顺序**组织文档入口，优先帮助你快速定位需要的能力。

## 开始使用

<div class="guide-grid">
  <a class="guide-card" href="/guide/quick-start">
    <h3>快速开始</h3>
    <p>安装依赖、启动项目、完成首次运行。</p>
  </a>
  <a class="guide-card" href="/guide/env">
    <h3>环境变量</h3>
    <p>了解运行时配置与环境变量约定。</p>
  </a>
</div>

## 核心能力

<div class="guide-grid">
  <a class="guide-card" href="/guide/architecture">
    <h3>目录结构与边界</h3>
    <p>理解 apps / packages 分层与边界约束。</p>
  </a>
  <a class="guide-card" href="/guide/theme-system">
    <h3>主题系统</h3>
    <p>掌握主题 token、切换机制与扩展方式。</p>
  </a>
  <a class="guide-card" href="/guide/layout-menu">
    <h3>布局与菜单</h3>
    <p>布局模式、菜单权限与路由协同说明。</p>
  </a>
  <a class="guide-card" href="/guide/iconfont">
    <h3>Iconfont 集成</h3>
    <p>图标库接入、预览方式与兼容用法。</p>
  </a>
  <a class="guide-card" href="/guide/utils">
    <h3>Utils 工具包（总览）</h3>
    <p>工具包定位、常见场景与迁移策略。</p>
  </a>
  <a class="guide-card" href="/guide/utils-api">
    <h3>Utils API 速查（按模块）</h3>
    <p>按能力分类检索 API 与高频示例。</p>
  </a>
</div>

## 扩展能力

<div class="guide-grid">
  <a class="guide-card" href="/guide/portal-designer">
    <h3>门户设计器（PC）</h3>
    <p>门户布局设计与组件联动方案。</p>
  </a>
  <a class="guide-card" href="/guide/adapter-sczfw">
    <h3>sczfw Adapter</h3>
    <p>后端适配层约定与接入注意事项。</p>
  </a>
</div>

## 协作规范

<div class="guide-grid">
  <a class="guide-card" href="/guide/development">
    <h3>开发规范与维护</h3>
    <p>协作流程、提交规范与维护约定。</p>
  </a>
</div>

<style scoped>
.guide-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  margin: 12px 0 24px;
}

.guide-card {
  display: block;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 14px 14px 12px;
  background: var(--vp-c-bg-soft);
  text-decoration: none;
  transition: border-color 0.2s ease, transform 0.2s ease;
}

.guide-card:hover {
  border-color: var(--vp-c-brand-1);
  transform: translateY(-1px);
}

.guide-card h3 {
  margin: 0 0 6px;
  color: var(--vp-c-text-1);
  font-size: 15px;
  line-height: 1.35;
}

.guide-card p {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 13px;
  line-height: 1.6;
}
</style>
