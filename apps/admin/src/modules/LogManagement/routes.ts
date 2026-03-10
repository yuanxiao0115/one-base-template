import type { RouteRecordRaw } from "vue-router";

export default [
  {
    path: "/system/log",
    name: "SystemLogManagement",
    redirect: "/system/log/login-log",
    meta: {
      title: "日志管理",
    },
  },
  {
    path: "/system/log/login-log",
    name: "SystemLoginLogManagement",
    component: async () => import("./login-log/page.vue"),
    meta: {
      title: "登录日志",
      keepAlive: true,
    },
  },
  {
    path: "/system/log/sys-log",
    name: "SystemSysLogManagement",
    component: async () => import("./sys-log/page.vue"),
    meta: {
      title: "操作日志",
      keepAlive: true,
    },
  },
] satisfies RouteRecordRaw[];
