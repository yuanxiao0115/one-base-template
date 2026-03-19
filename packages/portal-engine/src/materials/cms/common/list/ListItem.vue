<template>
  <div class="cms-list-item" :class="{ clickable }" @click="handleClick"><slot /></div>
</template>

<script setup lang="ts">
const props = defineProps<{ clickable?: boolean }>();

const emit = defineEmits<(e: 'click') => void>();

const handleClick = () => {
  if (props.clickable) {
    emit('click');
  }
};

defineOptions({
  name: 'PbListItem'
});
</script>

<style scoped>
.cms-list-item {
  display: flex;
  padding: var(--list-row-padding-y, 8px) 0;
  width: 100%;
  flex-direction: row;
  gap: 12px;
}

.cms-list-item + .cms-list-item {
  border-top: var(--list-divider-width, 0) var(--list-divider-style, dashed)
    var(--list-divider-color, #eef0f3);
}

.cms-list-item.clickable {
  cursor: pointer;
}
</style>
