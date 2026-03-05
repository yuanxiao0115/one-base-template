import type { RouteRecordRaw } from "vue-router";
import AboutPage from "./pages/AboutPage.vue";

export default [
  {
    path: "demo/about",
    name: "TemplateAbout",
    component: AboutPage,
    meta: {
      title: "关于模板",
      icon: "ep:info-filled",
      order: 2,
      keepAlive: false,
    },
  },
] as RouteRecordRaw[];
