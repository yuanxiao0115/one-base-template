import type { RouteRecordRaw } from "vue-router";

export default [
  {
    path: "/publicity/column",
    name: "PublicityColumn",
    component: async () => import("./column/page.vue"),
    meta: {
      title: "栏目管理",
      keepAlive: true,
      rank: 100,
      skipMenuAuth: true,
      skipMenuAuthLevel: "allowlist",
    },
  },
  {
    path: "/publicity/content",
    name: "PublicityContent",
    component: async () => import("./content/page.vue"),
    meta: {
      title: "宣传内容管理",
      keepAlive: true,
      rank: 200,
      skipMenuAuth: true,
      skipMenuAuthLevel: "allowlist",
    },
  },
  {
    path: "/publicity/article-list/:categoryId",
    name: "ArticleList",
    component: async () => import("./content/page.vue"),
    meta: {
      title: "文章列表",
      keepAlive: true,
      hideInMenu: true,
      activePath: "/publicity/content",
      skipMenuAuth: true,
      skipMenuAuthLevel: "allowlist",
    },
  },
  {
    path: "/publicity/audit",
    name: "PublicityAudit",
    component: async () => import("./audit/page.vue"),
    meta: {
      title: "审核管理",
      keepAlive: true,
      rank: 300,
      skipMenuAuth: true,
      skipMenuAuthLevel: "allowlist",
    },
  },
] satisfies RouteRecordRaw[];
