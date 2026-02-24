<template>
  <component
    :is="tag"
    class="pb-list-title"
    :class="{ 'with-dot': showDot }"
    v-bind="linkAttrs"
  >
    <slot>{{ text }}</slot>
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    text?: string;
    showDot?: boolean;
    tag?: 'div' | 'span' | 'a' | 'p';
    href?: string;
    target?: string;
  }>(),
  {
    text: '',
    showDot: false,
    tag: 'div',
    target: '_blank'
  }
);

const linkAttrs = computed(() => {
  if (props.tag === 'a') {
    return {
      href: props.href,
      target: props.target
    };
  }
  return {};
});

defineOptions({
  name: 'pb-list-title'
});
</script>

<style scoped>
.pb-list-title {
  display: block;
  overflow: hidden;
  font-size: var(--list-title-font-size, 16px);
  font-weight: var(--list-title-font-weight, normal);
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--list-title-color, #333);
}

.pb-list-title.with-dot::before {
  display: inline-block;
  margin-right: var(--list-dot-gap, 8px);
  border-radius: 50%;
  width: var(--list-dot-size, 8px);
  height: var(--list-dot-size, 8px);
  background-color: var(--list-dot-color, #cdd3d9);
  content: "";
  vertical-align: middle;
}
</style>
