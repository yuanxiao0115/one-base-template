import type { RouteRecordRaw } from "vue-router";

import { APP_LOGIN_ROUTE_PATH, APP_SSO_ROUTE_PATH } from "./constants";

export function getPublicRoutes(): RouteRecordRaw[] {
  return [
    {
      path: APP_LOGIN_ROUTE_PATH,
      name: "Login",
      component: async () => import("../pages/login/LoginPage.vue"),
      meta: {
        public: true,
        hiddenTab: true,
      },
    },
    {
      path: APP_SSO_ROUTE_PATH,
      name: "Sso",
      component: async () => import("../pages/sso/SsoCallbackPage.vue"),
      meta: {
        public: true,
        hiddenTab: true,
      },
    },
  ];
}
