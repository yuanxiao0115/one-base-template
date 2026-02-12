import { createRouter, createWebHistory } from 'vue-router';
import { routes } from '../router';

export function createAppRouter() {
  return createRouter({
    history: createWebHistory(),
    routes,
    strict: true
  });
}

