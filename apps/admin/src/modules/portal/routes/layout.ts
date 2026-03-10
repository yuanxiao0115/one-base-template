import type { RouteRecordRaw } from "vue-router";
import { createAllowlistSkipMenuAuthMeta } from "@/router/route-meta";

export default [
  {
    // 菜单分组节点（后端菜单常用 /portal 作为父节点），这里做 redirect 避免访问 404
    path: "portal",
    redirect: "/portal/templates",
    meta: {
      title: "门户",
    },
  },
  {
    path: "portal/templates",
    name: "PortalTemplateList",
    component: async () => import("../pages/PortalTemplateListPage.vue"),
    meta: {
      ...createAllowlistSkipMenuAuthMeta({
        title: "门户模板",
        keepAlive: true,
        // 不要求后端改菜单：用老路径做权限归属（menuStore.allowedPaths 里通常是 /portal/setting）
        activePath: "/portal/setting",
      }),
    },
  },
] satisfies RouteRecordRaw[];
