import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";
import { appEnv } from "../infra/env";

export function createAppRouter(routes: RouteRecordRaw[]) {
  return createRouter({
    history: createWebHistory(appEnv.baseUrl),
    routes,
    strict: true,
  });
}
