import LoginLogPage from "./login-log/page.vue";
import type { RouteRecordRaw } from "vue-router";
import SysLogPage from "./sys-log/page.vue";

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
    component: LoginLogPage,
    meta: {
      title: "登录日志",
      keepAlive: true,
    },
  },
  {
    path: "/system/log/sys-log",
    name: "SystemSysLogManagement",
    component: SysLogPage,
    meta: {
      title: "操作日志",
      keepAlive: true,
    },
  },
] satisfies RouteRecordRaw[];
