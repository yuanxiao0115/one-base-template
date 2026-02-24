<script setup lang="ts">
  import { Icon } from '@iconify/vue'
  import CustomDropdown from './CustomDropdown.vue'

  // ===== Props 定义 =====
  interface Props {
    /** 触发方式 */
    trigger?: 'hover' | 'click' | 'focus' | 'contextmenu'
    /** 弹出位置 */
    placement?:
      | 'top'
      | 'top-start'
      | 'top-end'
      | 'bottom'
      | 'bottom-start'
      | 'bottom-end'
      | 'left'
      | 'left-start'
      | 'left-end'
      | 'right'
      | 'right-start'
      | 'right-end'
  }

  // ===== Emits 定义 =====
  interface Emits {
    /** 可见性变化事件 */
    'visible-change': [visible: boolean]
  }

  withDefaults(defineProps<Props>(), {
    trigger: 'click',
    placement: 'bottom-end',
  })

  const emit = defineEmits<Emits>()

  // ===== 方法 =====

  /** 处理可见性变化 */
  const handleVisibleChange = (visible: boolean) => {
    emit('visible-change', visible)
  }
</script>

<template>
  <CustomDropdown :trigger="trigger" :placement="placement" @visible-change="handleVisibleChange">
    <!-- 触发器插槽 -->
    <template #trigger>
      <slot name="trigger">
        <span class="dropdown-trigger">
          <Icon icon="ri:arrow-down-s-line" class="dark:text-white" />
        </span>
      </slot>
    </template>
  </CustomDropdown>
</template>

<style lang="scss">
  .dropdown-trigger {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 40px;
    height: 34px;
    color: var(--tag-text-color);
    cursor: pointer;
    transition: color var(--tag-transition-duration);

    svg {
      width: 20px;
      height: 20px;
    }

    &:hover {
      color: var(--tag-hover-color);
    }
  }
</style>
