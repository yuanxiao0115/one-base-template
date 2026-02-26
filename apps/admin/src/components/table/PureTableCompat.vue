<script setup lang="ts">
import { useSlots } from 'vue'
import { VxeTable as ObVxeTable } from '@one-base-template/ui'

defineOptions({
  name: 'PureTableCompat'
})

const slots = useSlots()
</script>

<template>
  <ObVxeTable v-bind="$attrs">
    <template v-for="(_, slotName) in slots" :key="slotName" #[slotName]="slotProps">
      <slot :name="slotName" v-bind="slotProps" />
    </template>
  </ObVxeTable>
</template>
