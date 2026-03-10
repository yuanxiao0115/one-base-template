import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";

export function createAppRouter(params: { routes: RouteRecordRaw[]; baseUrl: string }) {
  const { routes, baseUrl } = params;
  return createRouter({
    history: createWebHistory(baseUrl),
    routes,
    strict: true,
  });
}
