import OrgPage from "./org/page.vue";
import PositionPage from "./position/page.vue";
import RoleAssignPage from "./role-assign/page.vue";
import RolePage from "./role/page.vue";
import type { RouteRecordRaw } from "vue-router";
import UserPage from "./user/page.vue";

export default [
  {
    path: "/system/user",
    name: "SystemUserManagement",
    component: UserPage,
    meta: {
      title: "用户管理",
      keepAlive: true,
    },
  },
  {
    path: "/system/org",
    name: "SystemOrgManagement",
    component: OrgPage,
    meta: {
      title: "组织管理",
      keepAlive: true,
    },
  },
  {
    path: "/system/position",
    name: "SystemPositionManagement",
    component: PositionPage,
    meta: {
      title: "职位管理",
      keepAlive: true,
    },
  },
  {
    path: "/system/role/management",
    name: "SystemRoleManagement",
    component: RolePage,
    meta: {
      title: "角色管理",
      keepAlive: true,
    },
  },
  {
    path: "/system/role/assign",
    name: "SystemRoleAssign",
    component: RoleAssignPage,
    meta: {
      title: "角色分配",
      keepAlive: true,
    },
  },
] satisfies RouteRecordRaw[];
