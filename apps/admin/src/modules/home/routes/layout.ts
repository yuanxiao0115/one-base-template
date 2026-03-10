import type { RouteRecordRaw } from "vue-router";

export default [
  {
    path: "home/index",
    name: "HomeIndex",
    component: async () => import("../pages/HomePage.vue"),
    meta: {
      title: "首页",
      keepAlive: true,
      affix: true,
      // 首页是本地静态路由，允许登录后直接访问，不依赖远端菜单返回。
      skipMenuAuth: true,
    },
  },
] as RouteRecordRaw[];
