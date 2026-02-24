<script setup lang="ts">
  import {
    ref,
    unref,
    computed,
    onMounted,
    nextTick,
    watch,
    getCurrentInstance,
    type CSSProperties,
  } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { Icon } from '@iconify/vue'

  // 导入已有的 utils 方法
  import { isEqual, delay, useResizeObserver } from './utils'
  import { getLinkActiveClass } from './utils/tagState'
  import { useTagStoreHook } from './store'

  // 导入新的菜单显示管理 Hook
  import { useContextMenuDisplay } from './hooks/useContextMenuDisplay'
  import { useTagOperations } from './hooks/useTagOperations'

  // 导入菜单组件
  import ContextMenu from './components/ContextMenu.vue'
  import DropdownMenu from './components/DropdownMenu.vue'

  // 图标
  import ArrowRightSLine from '@iconify-icons/ri/arrow-right-s-line'
  import ArrowLeftSLine from '@iconify-icons/ri/arrow-left-s-line'

  const route = useRoute()
  const router = useRouter()
  const instance = getCurrentInstance()
  const store = useTagStoreHook()

  // ===== 菜单显示管理 =====
  const menuDisplay = useContextMenuDisplay()
  const { tagsViews, configureContextMenu } = menuDisplay

  // ===== 标签操作管理 =====
  const { deleteDynamicTag } = useTagOperations()

  // ===== DOM 引用 =====
  const containerDom = ref()
  const scrollbarDom = ref()
  const tabDom = ref()

  // ===== 状态管理 =====
  const buttonTop = ref(0)
  const buttonLeft = ref(0)
  const translateX = ref(0)
  const visible = ref(false)
  const activeIndex = ref(-1)
  const currentSelect = ref<any>({})
  const isScrolling = ref(false)
  const isShowArrow = ref(false)

  // ===== 计算属性 =====
  const multiTags = computed(() => store.multiTags)

  const linkIsActive = computed(() => {
    return (item: any) => getLinkActiveClass(route, item)
  })

  const getTabStyle = computed((): CSSProperties => {
    return {
      transform: `translateX(${translateX.value}px)`,
      transition: isScrolling.value ? 'none' : 'transform 0.5s ease-in-out',
    }
  })

  // ===== 核心方法 =====
  const closeMenu = () => {
    visible.value = false
  }

  /** 移动到指定视图 */
  const moveToView = async (index: number): Promise<void> => {
    await nextTick()
    const tabNavPadding = 10
    if (!instance?.refs || !instance.refs['dynamic' + index]) return

    const tabItemEl = (instance.refs['dynamic' + index] as any)[0]
    const tabItemElOffsetLeft = tabItemEl?.offsetLeft || 0
    const tabItemOffsetWidth = tabItemEl?.offsetWidth || 0

    // 标签页导航栏可视长度（不包含溢出部分）
    const scrollbarDomWidth = scrollbarDom.value ? scrollbarDom.value?.offsetWidth : 0
    // 已有标签页总长度（包含溢出部分）
    const tabDomWidth = tabDom.value ? tabDom.value?.offsetWidth : 0

    isShowArrow.value = scrollbarDomWidth <= tabDomWidth

    if (tabDomWidth < scrollbarDomWidth || tabItemElOffsetLeft === 0) {
      translateX.value = 0
    } else if (tabItemElOffsetLeft < -translateX.value) {
      // 标签在可视区域左侧
      translateX.value = -tabItemElOffsetLeft + tabNavPadding
    } else if (
      tabItemElOffsetLeft > -translateX.value &&
      tabItemElOffsetLeft + tabItemOffsetWidth < -translateX.value + scrollbarDomWidth
    ) {
      // 标签在可视区域
      translateX.value = Math.min(
        0,
        scrollbarDomWidth - tabItemOffsetWidth - tabItemElOffsetLeft - tabNavPadding,
      )
    } else {
      // 标签在可视区域右侧
      translateX.value = -(
        tabItemElOffsetLeft -
        (scrollbarDomWidth - tabNavPadding - tabItemOffsetWidth)
      )
    }
  }

  /** 处理滚动 */
  const handleScroll = (offset: number): void => {
    const scrollbarDomWidth = scrollbarDom.value ? scrollbarDom.value?.offsetWidth : 0
    const tabDomWidth = tabDom.value ? tabDom.value.offsetWidth : 0

    if (offset > 0) {
      translateX.value = Math.min(0, translateX.value + offset)
    } else {
      if (scrollbarDomWidth < tabDomWidth) {
        if (translateX.value >= -(tabDomWidth - scrollbarDomWidth)) {
          translateX.value = Math.max(translateX.value + offset, scrollbarDomWidth - tabDomWidth)
        }
      } else {
        translateX.value = 0
      }
    }
    isScrolling.value = false
  }

  /** 处理鼠标滚轮事件 */
  const handleWheel = (event: WheelEvent): void => {
    isScrolling.value = true
    const scrollIntensity = Math.abs(event.deltaX) + Math.abs(event.deltaY)
    let offset = 0
    if (event.deltaX < 0) {
      offset = scrollIntensity > 0 ? scrollIntensity : 100
    } else {
      offset = scrollIntensity > 0 ? -scrollIntensity : -100
    }
    smoothScroll(offset)
  }

  /** 平滑滚动 */
  const smoothScroll = (offset: number): void => {
    const scrollAmount = 20
    let remaining = Math.abs(offset)

    const scrollStep = () => {
      const scrollOffset = Math.sign(offset) * Math.min(scrollAmount, remaining)
      handleScroll(scrollOffset)
      remaining -= Math.abs(scrollOffset)

      if (remaining > 0) {
        requestAnimationFrame(scrollStep)
      }
    }

    requestAnimationFrame(scrollStep)
  }

  /** 动态标签视图 */
  const dynamicTagView = async () => {
    await nextTick()
    // 检查是否存在完全匹配的标签（路径和参数都相同）
    const index = multiTags.value.findIndex((item: any) => {
      const queryEqual = isEqual(route.query || {}, item.query || {})
      const paramsEqual = isEqual(route.params || {}, item.params || {})
      return item.path === route.path && queryEqual && paramsEqual
    })

    // 如果没有找到完全匹配的标签，且路由有有效标题，则添加新标签
    if (index === -1) {
      // 检查是否是有效的路由（必须有name或meta.title，避免创建"未命名页面"）
      if (route.name || route.meta?.title) {
        store.handleTags('push', {
          path: route.path,
          name: route.name,
          meta: route.meta || { title: route.name },
          query: route.query,
          params: route.params,
        })
        // 重新查找索引
        const newIndex = multiTags.value.findIndex((item: any) => {
          const queryEqual = isEqual(route.query || {}, item.query || {})
          const paramsEqual = isEqual(route.params || {}, item.params || {})
          return item.path === route.path && queryEqual && paramsEqual
        })
        moveToView(newIndex)
      }
    } else {
      moveToView(index)
    }
  }

  /** 标签点击事件 */
  function tagOnClick(item: any) {
    const { path, query, params } = item

    // 优先使用 path 进行跳转，避免 name 字段包含标题导致的路由匹配问题
    const routeConfig: any = {
      path: path,
      query: query || undefined,
      params: params || undefined,
    }

    // 移除未定义的属性
    Object.keys(routeConfig).forEach(
      (key) => routeConfig[key] === undefined && delete routeConfig[key],
    )

    router.push(routeConfig)
  }

  /** 鼠标移入添加激活样式 */
  function onMouseenter(index: number) {
    if (index) activeIndex.value = index
    // 这里可以添加样式切换逻辑
  }

  /** 鼠标移出恢复默认样式 */
  function onMouseleave(_index: number) {
    activeIndex.value = -1
    // 这里可以添加样式切换逻辑
  }

  /** 打开右键菜单 */
  function openMenu(tag: any, e: MouseEvent) {
    closeMenu()
    console.log(tag)
    currentSelect.value = tag

    // 配置右键菜单显示状态
    configureContextMenu(
      tag.path,
      tag.query || {},
      route.path, // 当前激活页路径
      route.query || {}, // 当前激活页查询参数
    )

    const menuMinWidth = 140

    // 获取容器的位置信息
    const containerRect = unref(containerDom)?.getBoundingClientRect()
    const offsetLeft = containerRect?.left || 0
    const offsetWidth = containerRect?.width || 0

    // 计算水平位置
    const maxLeft = offsetWidth - menuMinWidth
    const left = e.clientX - offsetLeft + 5

    if (left > maxLeft) {
      buttonLeft.value = maxLeft
    } else {
      buttonLeft.value = left
    }

    // 计算垂直位置：菜单显示在标签下方
    // 使用绝对定位，坐标相对于容器
    // e.offsetY 是鼠标相对于触发元素的位置
    // 加上标签高度让菜单显示在标签下方
    const tagHeight = (e.target as HTMLElement)?.offsetHeight || 32
    buttonTop.value = e.offsetY + tagHeight + 10

    nextTick(() => {
      visible.value = true
    })
  }

  // ===== 生命周期 =====
  watch(
    route,
    (to, from) => {
      activeIndex.value = -1
      // 只在路由真正变化时才调用dynamicTagView
      if (
        to.path !== from.path ||
        !isEqual(to.query, from.query) ||
        !isEqual(to.params, from.params)
      ) {
        dynamicTagView()
      }
    },
    {
      deep: true,
    },
  )

  onMounted(() => {
    if (!instance) return

    // 根据当前路由初始化右键菜单显示状态
    // 下拉菜单状态由 DropdownMenu 组件自己管理

    useResizeObserver(scrollbarDom, dynamicTagView)
    delay().then(() => dynamicTagView())
  })
</script>

<template>
  <div ref="containerDom" class="tags-view">
    <span v-show="isShowArrow" class="arrow-left">
      <Icon :icon="ArrowLeftSLine" @click="handleScroll(200)" />
    </span>
    <div ref="scrollbarDom" class="scroll-container" @wheel.prevent="handleWheel">
      <div ref="tabDom" class="tab select-none" :style="getTabStyle">
        <div
          v-for="(item, index) in multiTags"
          :ref="'dynamic' + index"
          :key="index"
          :class="['scroll-item is-closable', linkIsActive(item)]"
          @contextmenu.prevent="openMenu(item, $event)"
          @mouseenter.prevent="onMouseenter(index)"
          @mouseleave.prevent="onMouseleave(index)"
          @click="tagOnClick(item)"
        >
          <span class="tag-title">
            {{ item.meta?.title }}
          </span>
          <span v-if="index !== 0" class="tag-close-icon" @click.stop="deleteDynamicTag(item)">
            <Icon icon="ep:close" />
          </span>
        </div>
      </div>
    </div>
    <span v-show="isShowArrow" class="arrow-right">
      <Icon :icon="ArrowRightSLine" @click="handleScroll(-200)" />
    </span>

    <!-- 右键菜单 -->
    <transition name="tag-zoom-in-top">
      <ContextMenu
        v-show="visible"
        :position="{ left: buttonLeft, top: buttonTop }"
        :menu-items="tagsViews"
        :container-ref="containerDom"
        :current-select="currentSelect"
        @close="closeMenu"
      />
    </transition>

    <!-- 右侧功能按钮 -->
    <DropdownMenu />
  </div>
</template>

<style lang="scss">
  @use './styles/variables.scss';
  /* Tag 组件样式 - 作用域化避免全局污染 */
  .tags-view {
    position: relative;
    display: flex;
    align-items: center;
    padding: var(--tag-container-padding);
    width: 100%;
    height: var(--tag-container-height);
    font-size: var(--tag-font-size);
    color: var(--tag-text-color);
    background: var(--tag-container-bg);
    border-bottom: var(--tag-container-border);
    white-space: nowrap;
    // overflow: hidden;

    .arrow-left,
    .arrow-right,
    .arrow-down {
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 40px;
      height: 34px;
      color: var(--tag-arrow-color);

      svg {
        width: 20px;
        height: 20px;
      }
    }

    .arrow-left {
      box-shadow: 5px 0 5px -6px var(--tag-border-color);

      &:hover {
        cursor: w-resize;
      }
    }

    .arrow-right {
      border-right: 0.5px solid var(--tag-border-color);
      box-shadow: -5px 0 5px -6px var(--tag-border-color);

      &:hover {
        cursor: e-resize;
      }
    }

    .scroll-item {
      position: relative;
      display: inline-block;
      margin: 0 var(--tag-margin-right) 0 0;
      border-radius: var(--tag-border-radius-small);
      padding: var(--tag-padding-vertical) var(--tag-padding-horizontal);
      line-height: var(--tag-line-height);
      background-color: var(--tag-bg-color);
      border: var(--tag-border-width) var(--tag-border-style) var(--tag-border-color);
      transition: all var(--tag-transition-duration);
      cursor: pointer;
      white-space: nowrap;
      flex-shrink: 0;

      &:hover {
        color: var(--tag-hover-color) !important;

        .tag-close-icon {
          color: var(--tag-close-hover-color) !important;
        }
      }

      &:not(:first-child) {
        padding-right: 24px;
      }

      .tag-close-icon {
        position: absolute;
        top: 50%;
        display: inline-flex;
        justify-content: center;
        align-items: center;
        border-radius: var(--tag-border-radius);
        width: 18px;
        height: 18px;
        color: var(--tag-close-color);
        transition:
          background-color var(--tag-transition-fast),
          color var(--tag-transition-fast);
        cursor: pointer;
        transform: translate(0, -50%);
      }
    }

    .tag-title {
      padding: 0 4px;
      text-decoration: none;
      color: var(--tag-text-color);
    }

    .scroll-container {
      position: relative;
      flex: 1;
      overflow: hidden;
      white-space: nowrap;
      display: flex;
      align-items: center;

      .tab {
        position: relative;
        display: flex;
        align-items: center;
        overflow: visible;
        white-space: nowrap;
        list-style: none;

        .scroll-item {
          transition: all var(--tag-transition-fast) var(--tag-transition-timing);

          &:nth-child(1) {
            padding: var(--tag-padding-vertical) var(--tag-padding-horizontal);
            line-height: var(--tag-line-height);
          }
        }
      }
    }
  }

  .scroll-item.is-active {
    position: relative;
    color: var(--tag-active-text-color);
    background-color: var(--tag-active-bg-color);

    .tag-title {
      color: var(--tag-active-text-color) !important;
    }

    .tag-close-icon {
      color: var(--tag-active-text-color) !important;
    }
  }

  /* 过渡动画 */
  .tag-zoom-in-top-enter-active,
  .tag-zoom-in-top-leave-active {
    opacity: 1;
    transform: scaleY(1);
    transition:
      transform var(--tag-transition-duration) var(--tag-transition-timing),
      opacity var(--tag-transition-duration) var(--tag-transition-timing);
    transform-origin: center top;
  }

  .tag-zoom-in-top-enter-from,
  .tag-zoom-in-top-leave-to {
    opacity: 0;
    transform: scaleY(0);
  }
</style>
