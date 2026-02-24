<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { onClickOutside } from '@vueuse/core'
  import { Icon } from '@iconify/vue'
  import type { TagMenuItem, TagItem } from '../types'
  import { useTagOperations } from '../hooks/useTagOperations'

  // ===== Props 定义 =====
  interface Props {
    /** 菜单位置 */
    position: {
      left: number
      top: number
    }
    /** 菜单项列表 */
    menuItems: TagMenuItem[]
    /** 容器 DOM 引用 */
    containerRef?: HTMLElement | null
    /** 当前选中的标签 */
    currentSelect: TagItem | null
  }

  // ===== Emits 定义 =====
  interface Emits {
    /** 关闭菜单事件 */
    close: []
  }

  const props = withDefaults(defineProps<Props>(), {
    containerRef: null,
    currentSelect: null,
  })

  const emit = defineEmits<Emits>()

  // ===== Hooks =====
  const tagOperations = useTagOperations()
  const { onClickDrop } = tagOperations

  // ===== 响应式数据 =====
  const contextmenuRef = ref<HTMLElement>()

  // ===== 计算属性 =====
  /** 菜单样式 */
  const menuStyle = computed(() => ({
    left: props.position.left + 'px',
    top: props.position.top + 'px',
  }))

  /** 过滤后的菜单项（只显示 show 为 true 的项），保留原始索引 */
  const visibleMenuItems = computed(() => {
    return props.menuItems
      .map((item, index) => ({ ...item, originalIndex: index }))
      .filter((item) => item.show)
  })

  // ===== 方法 =====
  /** 处理菜单项点击 */
  const handleItemClick = (originalIndex: number, item: TagMenuItem) => {
    console.log('handleItemClick', originalIndex, item)
    if (item.disabled) return

    // 关闭菜单
    closeMenu()

    // 直接调用标签操作
    // 右键菜单操作的是被右键点击的标签（currentSelect）
    onClickDrop(originalIndex, item, props.currentSelect)
  }

  /** 关闭菜单 */
  const closeMenu = () => {
    emit('close')
  }

  // ===== 点击外部关闭菜单 =====
  onClickOutside(contextmenuRef, closeMenu, {
    detectIframe: true,
  })
</script>

<template>
  <ul ref="contextmenuRef" :style="menuStyle" class="context-menu">
    <li
      v-for="(item, key) in visibleMenuItems"
      :key="key"
      :class="{ 'is-disabled': item.disabled }"
      :data-testid="`menu-item-${item.originalIndex}`"
      class="context-menu-item"
      @click="handleItemClick(item.originalIndex, item)"
    >
      <Icon :icon="item.icon" class="menu-icon" />
      <span class="menu-text">{{ item.text }}</span>
    </li>
  </ul>
</template>

<style lang="scss">
  .context-menu {
    position: absolute;
    z-index: var(--tag-z-index-contextmenu);
    padding: 5px 0;
    margin: 0;
    font-size: var(--tag-font-size-small);
    font-weight: 400;
    color: var(--tag-text-color);
    list-style: none;
    background: var(--tag-menu-bg-color);
    background-clip: padding-box;
    border: 1px solid var(--tag-menu-border-color);
    border-radius: var(--tag-border-radius);
    box-shadow: var(--tag-menu-shadow);

    .context-menu-item {
      display: flex;
      align-items: center;
      padding: 5px 16px;
      margin: 0;
      font-size: var(--tag-font-size);
      line-height: var(--tag-line-height-large);
      color: var(--tag-menu-text-color);
      cursor: pointer;
      background: transparent;
      border: none;
      outline: none;
      transition: all var(--tag-transition-duration);

      &:hover:not(.is-disabled) {
        color: var(--tag-menu-hover-text-color);
        background: var(--tag-menu-hover-bg-color);
      }

      &.is-disabled {
        color: var(--tag-disabled-color);
        cursor: not-allowed;
      }

      .menu-icon {
        margin-right: 10px;
        font-size: var(--tag-font-size);
        flex-shrink: 0;
      }

      .menu-text {
        flex: 1;
      }
    }
  }

  /* 过渡动画 */
  .tag-zoom-in-top-enter-active,
  .tag-zoom-in-top-leave-active {
    opacity: 1;
    transform: scaleY(1);
    transition:
      transform 300ms cubic-bezier(0.23, 1, 0.32, 1),
      opacity 300ms cubic-bezier(0.23, 1, 0.32, 1);
    transform-origin: center top;
  }

  .tag-zoom-in-top-enter-from,
  .tag-zoom-in-top-leave-to {
    opacity: 0;
    transform: scaleY(0);
  }
</style>
