import type { RouteRecordRaw } from "vue-router";

import LoginPage from "../pages/login/LoginPage.vue";
import SsoCallbackPage from "../pages/sso/SsoCallbackPage.vue";

import { APP_LOGIN_ROUTE_PATH, APP_SSO_ROUTE_PATH } from "./constants";

export function getPublicRoutes(): RouteRecordRaw[] {
  return [
    {
      path: APP_LOGIN_ROUTE_PATH,
      name: "Login",
      component: LoginPage,
      meta: {
        public: true,
        hiddenTab: true,
      },
    },
    {
      path: APP_SSO_ROUTE_PATH,
      name: "Sso",
      component: SsoCallbackPage,
      meta: {
        public: true,
        hiddenTab: true,
      },
    },
  ];
}
