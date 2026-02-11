<script setup lang="ts">
import SidebarMenu from '../components/menu/SidebarMenu.vue';
import TopBar from '../components/top/TopBar.vue';
import TabsBar from '../components/tabs/TabsBar.vue';
import KeepAliveView from '../components/view/KeepAliveView.vue';
</script>

<template>
  <div class="h-screen w-screen flex bg-[var(--el-bg-color-page)]">
    <aside class="w-64 shrink-0 border-r border-[var(--el-border-color)] bg-white">
      <div class="h-14 shrink-0 flex items-center px-4 border-b border-[var(--el-border-color)]">
        <div class="font-semibold">standard-base</div>
      </div>
      <SidebarMenu />
    </aside>

    <div class="flex-1 min-w-0 flex flex-col">
      <header class="shrink-0">
        <TopBar />
        <TabsBar />
      </header>
      <main class="flex-1 min-h-0 overflow-auto p-4">
        <KeepAliveView />
      </main>
    </div>
  </div>
</template>
