<script setup lang="ts">
  import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
  import { onClickOutside } from '@vueuse/core'
  import { Icon } from '@iconify/vue'
  import { useTagOperations } from '../hooks/useTagOperations'
  import { useDropdownMenuDisplay } from '../hooks/useDropdownMenuDisplay'

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

  const props = withDefaults(defineProps<Props>(), {
    trigger: 'click',
    placement: 'bottom-end',
  })

  const emit = defineEmits<Emits>()

  // ===== 响应式数据 =====
  const visible = ref(false)
  const triggerRef = ref<HTMLElement>()
  const dropdownRef = ref<HTMLElement>()
  const hoverTimer = ref<number>()

  // ===== Hooks =====
  const { onClickDrop } = useTagOperations()
  const { dropdownMenuViews, configureDropdownMenu } = useDropdownMenuDisplay()

  // ===== 计算属性 =====
  /** 过滤后的菜单项 */
  const visibleMenuItems = computed(() => {
    return dropdownMenuViews
      .map((item, index) => ({ ...item, originalIndex: index }))
      .filter((item) => !item.disabled)
  })

  /** 下拉菜单样式 */
  const dropdownStyle = computed(() => {
    if (!visible.value || !triggerRef.value) return { display: 'none' }

    const triggerRect = triggerRef.value.getBoundingClientRect()
    const placement = props.placement

    let top = 0
    let left = 0

    // 根据placement计算位置
    switch (placement) {
      case 'bottom':
      case 'bottom-start':
      case 'bottom-end':
        top = triggerRect.bottom + 4
        break
      case 'top':
      case 'top-start':
      case 'top-end':
        top = triggerRect.top - 4
        break
      case 'left':
      case 'left-start':
      case 'left-end':
        left = triggerRect.left - 4
        break
      case 'right':
      case 'right-start':
      case 'right-end':
        left = triggerRect.right + 4
        break
    }

    // 水平对齐
    if (placement.includes('start')) {
      left = triggerRect.left
    } else if (placement.includes('end')) {
      left = triggerRect.right - 140 // 假设菜单宽度160px
    } else if (!placement.includes('left') && !placement.includes('right')) {
      left = triggerRect.left + triggerRect.width / 2 - 80 // 居中
    }

    // 垂直对齐
    if (
      placement.includes('start') &&
      (placement.includes('left') || placement.includes('right'))
    ) {
      top = triggerRect.top
    } else if (
      placement.includes('end') &&
      (placement.includes('left') || placement.includes('right'))
    ) {
      top = triggerRect.bottom - 100 // 假设菜单高度
    } else if (placement.includes('left') || placement.includes('right')) {
      top = triggerRect.top + triggerRect.height / 2 - 50
    }

    return {
      position: 'fixed' as const,
      top: `${top}px`,
      left: `${left}px`,
      zIndex: 2000,
    }
  })

  // ===== 方法 =====
  /** 显示下拉菜单 */
  const showDropdown = () => {
    if (visible.value) return
    visible.value = true
    emit('visible-change', true)
    nextTick(() => {
      configureDropdownMenu()
    })
  }

  /** 隐藏下拉菜单 */
  const hideDropdown = () => {
    if (!visible.value) return
    visible.value = false
    emit('visible-change', false)
  }

  /** 切换下拉菜单 */
  const toggleDropdown = () => {
    if (visible.value) {
      hideDropdown()
    } else {
      showDropdown()
    }
  }

  /** 处理命令 */
  const handleCommand = (command: number | string) => {
    const index = typeof command === 'string' ? parseInt(command) : command
    const item = dropdownMenuViews[index]

    if (item && item.disabled) return

    onClickDrop(index, item)
    hideDropdown()
  }

  /** 处理触发器点击 */
  const handleTriggerClick = () => {
    if (props.trigger === 'click') {
      toggleDropdown()
    }
  }

  /** 处理触发器鼠标进入 */
  const handleTriggerMouseEnter = () => {
    if (props.trigger === 'hover') {
      clearTimeout(hoverTimer.value)
      showDropdown()
    }
  }

  /** 处理触发器鼠标离开 */
  const handleTriggerMouseLeave = () => {
    if (props.trigger === 'hover') {
      hoverTimer.value = window.setTimeout(() => {
        hideDropdown()
      }, 150)
    }
  }

  /** 处理下拉菜单鼠标进入 */
  const handleDropdownMouseEnter = () => {
    if (props.trigger === 'hover') {
      clearTimeout(hoverTimer.value)
    }
  }

  /** 处理下拉菜单鼠标离开 */
  const handleDropdownMouseLeave = () => {
    if (props.trigger === 'hover') {
      hoverTimer.value = window.setTimeout(() => {
        hideDropdown()
      }, 150)
    }
  }

  /** 处理键盘事件 */
  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      hideDropdown()
    }
  }

  // ===== 生命周期 =====
  onMounted(() => {
    document.addEventListener('keydown', handleKeydown)
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
    clearTimeout(hoverTimer.value)
  })

  // 点击外部关闭
  onClickOutside(
    dropdownRef,
    () => {
      if (props.trigger === 'click') {
        hideDropdown()
      }
    },
    { ignore: [triggerRef] },
  )
</script>

<template>
  <div class="custom-dropdown">
    <!-- 触发器 -->
    <div
      ref="triggerRef"
      class="dropdown-trigger"
      @click="handleTriggerClick"
      @mouseenter="handleTriggerMouseEnter"
      @mouseleave="handleTriggerMouseLeave"
    >
      <slot name="trigger">
        <span class="dropdown-trigger-default">
          <Icon icon="ri:arrow-down-s-line" />
        </span>
      </slot>
    </div>

    <!-- 下拉菜单 -->
    <Teleport to="body">
      <Transition name="dropdown-fade">
        <div
          v-show="visible"
          ref="dropdownRef"
          class="dropdown-menu"
          :style="dropdownStyle"
          @mouseenter="handleDropdownMouseEnter"
          @mouseleave="handleDropdownMouseLeave"
        >
          <div class="dropdown-menu-list">
            <div
              v-for="item in visibleMenuItems"
              :key="item.originalIndex"
              class="dropdown-menu-item"
              :class="{ 'is-disabled': item.disabled }"
              @click="handleCommand(item.originalIndex)"
            >
              <Icon :icon="item.icon" class="menu-icon" />
              <span class="menu-text">{{ item.text }}</span>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style>
  .custom-dropdown {
    display: inline-block;
    position: relative;
  }

  .dropdown-trigger {
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .dropdown-trigger-default {
    width: 40px;
    height: 34px;
    color: var(--tag-text-color);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    transition: color var(--tag-transition-duration);
  }

  .dropdown-trigger-default svg {
    width: 20px;
    height: 20px;
  }

  .dropdown-trigger:hover .dropdown-trigger-default {
    color: var(--tag-hover-color);
  }

  .dropdown-menu {
    background: var(--tag-dropdown-bg-color);
    border: 1px solid var(--tag-dropdown-border-color);
    border-radius: var(--tag-border-radius);
    box-shadow: var(--tag-dropdown-shadow);
    padding: 5px 0;
    min-width: 140px;
    z-index: var(--tag-z-index-dropdown);
  }

  .dropdown-menu-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .dropdown-menu-item {
    display: flex;
    align-items: center;
    padding: 5px 16px;
    font-size: var(--tag-font-size);
    color: var(--tag-menu-text-color);
    cursor: pointer;
    transition: all var(--tag-transition-duration);
    line-height: var(--tag-line-height-large);
  }

  .dropdown-menu-item:hover:not(.is-disabled) {
    background-color: var(--tag-dropdown-item-hover-bg);
    color: var(--tag-dropdown-item-hover-color);
  }

  .dropdown-menu-item.is-disabled {
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

  /* 过渡动画 */
  .dropdown-fade-enter-active,
  .dropdown-fade-leave-active {
    transition:
      opacity var(--tag-transition-duration) var(--tag-transition-timing),
      transform var(--tag-transition-duration) var(--tag-transition-timing);
    transform-origin: top;
  }

  .dropdown-fade-enter-from,
  .dropdown-fade-leave-to {
    opacity: 0;
    transform: scaleY(0.8);
  }
</style>
