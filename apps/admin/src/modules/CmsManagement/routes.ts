import AuditPage from "./audit/page.vue";
import ColumnPage from "./column/page.vue";
import ContentPage from "./content/page.vue";
import type { RouteRecordRaw } from "vue-router";

export default [
  {
    path: "/publicity/column",
    name: "PublicityColumn",
    component: ColumnPage,
    meta: {
      title: "栏目管理",
      keepAlive: true,
      rank: 100,
      skipMenuAuth: true,
    },
  },
  {
    path: "/publicity/content",
    name: "PublicityContent",
    component: ContentPage,
    meta: {
      title: "宣传内容管理",
      keepAlive: true,
      rank: 200,
      skipMenuAuth: true,
    },
  },
  {
    path: "/publicity/article-list/:categoryId",
    name: "ArticleList",
    component: ContentPage,
    meta: {
      title: "文章列表",
      keepAlive: true,
      hideInMenu: true,
      activePath: "/publicity/content",
      skipMenuAuth: true,
    },
  },
  {
    path: "/publicity/audit",
    name: "PublicityAudit",
    component: AuditPage,
    meta: {
      title: "审核管理",
      keepAlive: true,
      rank: 300,
      skipMenuAuth: true,
    },
  },
] satisfies RouteRecordRaw[];
