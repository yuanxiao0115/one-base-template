import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";
import { getAppEnv } from "../infra/env";

export function createAppRouter(routes: RouteRecordRaw[]) {
  const appEnv = getAppEnv();
  return createRouter({
    history: createWebHistory(appEnv.baseUrl),
    routes,
    strict: true,
  });
}
