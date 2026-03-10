import type { RouteRecordRaw } from "vue-router";
import { createAllowlistSkipMenuAuthMeta } from "@/router/route-meta";

export default [
  {
    path: "/publicity/column",
    name: "PublicityColumn",
    component: async () => import("./column/page.vue"),
    meta: {
      ...createAllowlistSkipMenuAuthMeta({
        title: "栏目管理",
        keepAlive: true,
        rank: 100,
      }),
    },
  },
  {
    path: "/publicity/content",
    name: "PublicityContent",
    component: async () => import("./content/page.vue"),
    meta: {
      ...createAllowlistSkipMenuAuthMeta({
        title: "宣传内容管理",
        keepAlive: true,
        rank: 200,
      }),
    },
  },
  {
    path: "/publicity/article-list/:categoryId",
    name: "ArticleList",
    component: async () => import("./content/page.vue"),
    meta: {
      ...createAllowlistSkipMenuAuthMeta({
        title: "文章列表",
        keepAlive: true,
        hideInMenu: true,
        activePath: "/publicity/content",
      }),
    },
  },
  {
    path: "/publicity/audit",
    name: "PublicityAudit",
    component: async () => import("./audit/page.vue"),
    meta: {
      ...createAllowlistSkipMenuAuthMeta({
        title: "审核管理",
        keepAlive: true,
        rank: 300,
      }),
    },
  },
] satisfies RouteRecordRaw[];
