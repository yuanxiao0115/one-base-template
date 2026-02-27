<template>
  <div class="pb-list-row" @click="handleClick">
    <ListTitle
      class="item-title"
      :text="title"
      :show-dot="showDot"
      :tag="titleTag"
      :href="href"
      :target="target"
    />
    <div v-if="date" class="item-date">{{ date }}</div>
  </div>
</template>

<script setup lang="ts">
import ListTitle from './ListTitle.vue';

withDefaults(
  defineProps<{
    title?: string;
    date?: string;
    showDot?: boolean;
    titleTag?: 'div' | 'span' | 'a' | 'p';
    href?: string;
    target?: string;
  }>(),
  {
    title: '',
    date: '',
    showDot: false,
    titleTag: 'div',
    href: '',
    target: '_blank'
  }
);

const emit = defineEmits<{
  (e: 'click'): void;
}>();

const handleClick = () => {
  emit('click');
};

defineOptions({
  name: 'pb-list-row'
});
</script>

<style scoped>
.pb-list-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}
</style>
