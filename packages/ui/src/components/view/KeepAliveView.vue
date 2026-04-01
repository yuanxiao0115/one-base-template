<script setup lang="ts">
import { computed, defineComponent, h, markRaw, type Component } from 'vue';
import { useTagStoreHook } from '@one-base-template/tag';
import type { RouteLocationNormalizedLoaded } from 'vue-router';

const tagStore = useTagStoreHook();
const routeKeepAliveWrapperMap = new Map<string, Component>();

const cacheNames = computed(() => {
  const names = new Set<string>();

  for (const tag of tagStore.multiTags) {
    if (!tag.meta?.keepAlive) {
      continue;
    }

    const name = typeof tag.name === 'string' && tag.name ? tag.name : '';
    if (name) {
      names.add(name);
    }
  }

  return Array.from(names);
});

function isKeepAliveRoute(route: RouteLocationNormalizedLoaded): boolean {
  return route.meta?.keepAlive === true;
}

function getRouteName(route: RouteLocationNormalizedLoaded): string | null {
  if (typeof route.name === 'string' && route.name) {
    return route.name;
  }
  return null;
}

function resolveKeepAliveComponent(
  route: RouteLocationNormalizedLoaded,
  component: Component
): Component {
  const routeName = getRouteName(route);
  if (!routeName) {
    return component;
  }

  const cachedWrapper = routeKeepAliveWrapperMap.get(routeName);
  if (cachedWrapper) {
    return cachedWrapper;
  }

  // KeepAlive include 仅识别组件 name，这里用 route.name 做稳定包装，避免业务组件名与路由名不一致导致缓存失效。
  const wrapper = markRaw(
    defineComponent({
      name: routeName,
      setup() {
        return () => h(component);
      }
    })
  );
  routeKeepAliveWrapperMap.set(routeName, wrapper);
  return wrapper;
}
</script>

<template>
  <router-view v-slot="{ Component, route }">
    <keep-alive :include="cacheNames">
      <component
        v-if="Component && isKeepAliveRoute(route)"
        :is="resolveKeepAliveComponent(route, Component)"
        :key="route.fullPath"
      />
    </keep-alive>
    <component v-if="Component && !isKeepAliveRoute(route)" :is="Component" :key="route.fullPath" />
  </router-view>
</template>
