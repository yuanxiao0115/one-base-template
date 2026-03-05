<script setup lang="ts">
import { FontIcon as ObFontIcon } from '@one-base-template/ui';

defineOptions({
  name: 'DemoPageB'
});

const cpIcons = ['tongxunlu2', 'tongzhigonggao', 'wodexiangmu', 'caidandaohang'];
const djIcons = ['icon-1', 'icon-2', 'icon-3', 'icon-4'];
const omIcons = ['wenjianjia1', 'diannaoduandenglushu', 'a-yonghuguanli1x', 'a-jiaoseguanli1x'];
</script>

<template>
  <div class="space-y-4">
    <el-card>
      <template #header>
        <div class="font-medium">页面 B：Iconfont 集成示例</div>
      </template>
      <p class="mb-4 text-[var(--el-text-color-regular)] text-sm">
        这里展示 `ObFontIcon` 在 cp/dj/om 三套字体库中的引入效果，并保留 legacy OD 菜单图标的 class 兼容。
      </p>

      <div class="space-y-4">
        <section>
          <h4 class="font-medium mb-2 text-sm">CP Icons（library=\"cp\"）</h4>
          <div class="flex flex-wrap gap-4">
            <div v-for="iconName in cpIcons" :key="`cp-${iconName}`" class="flex gap-2 items-center">
              <ObFontIcon :name="iconName" library="cp" :size="22" />
              <code class="text-xs">{{ `icon-${iconName}` }}</code>
            </div>
          </div>
        </section>

        <section>
          <h4 class="font-medium mb-2 text-sm">DJ Icons（library=\"dj\"）</h4>
          <div class="flex flex-wrap gap-4">
            <div v-for="iconName in djIcons" :key="`dj-${iconName}`" class="flex gap-2 items-center">
              <ObFontIcon :name="iconName" library="dj" :size="22" color="#C40000" />
              <code class="text-xs">{{ `dj-icon-${iconName}` }}</code>
            </div>
          </div>
        </section>

        <section>
          <h4 class="font-medium mb-2 text-sm">OM Icons（library=\"om\"）</h4>
          <div class="flex flex-wrap gap-4">
            <div v-for="iconName in omIcons" :key="`om-${iconName}`" class="flex gap-2 items-center">
              <ObFontIcon :name="iconName" library="om" :size="22" color="#0F79E9" />
              <code class="text-xs">{{ `i-icon-${iconName}` }}</code>
            </div>
          </div>
        </section>
      </div>
    </el-card>

    <el-card>
      <template #header>
        <div class="font-medium">class 兼容示例</div>
      </template>
      <p class="mb-4 text-[var(--el-text-color-regular)] text-sm">
        除 `ObFontIcon` 外，仍支持直接使用 class 方式渲染 iconfont。
      </p>
      <div class="flex flex-wrap gap-4">
        <div class="flex gap-2 items-center">
          <i class="icon-tongxunlu2 iconfont text-xl" />
          <code class="text-xs">iconfont + icon-tongxunlu2</code>
        </div>
        <div class="flex gap-2 items-center">
          <i class="dj-icon-icon-1 dj-icons text-[#C40000] text-xl" />
          <code class="text-xs">dj-icons + dj-icon-icon-1</code>
        </div>
        <div class="flex gap-2 items-center">
          <i class="i-icon-menu i-icon-wenjianjia1 text-[#0F79E9] text-xl" />
          <code class="text-xs">i-icon-menu + i-icon-wenjianjia1</code>
        </div>
        <div class="flex gap-2 items-center">
          <i class="icon-huishouzhan iconfont-od text-[#0955DF] text-xl" />
          <code class="text-xs">iconfont-od + icon-huishouzhan（legacy OD）</code>
        </div>
      </div>
    </el-card>
  </div>
</template>
