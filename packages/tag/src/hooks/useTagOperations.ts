import { useRoute, useRouter } from 'vue-router'
import { useTagStoreHook } from '../store'
import { isEqual, shouldShowHomeTag } from '../utils'
import { createHomeTag, getConfig } from '../config/configManager'

/**
 * 标签操作管理 Hook
 * 负责处理标签的删除、关闭、刷新等操作
 */
export function useTagOperations() {
  const route = useRoute()
  const router = useRouter()
  const store = useTagStoreHook()

  // 获取配置的首页路径
  const getHomePath = () => {
    const config = getConfig()
    return config.homePath
  }

  // ===== 操作方法 =====
  /** 刷新路由 */
  function onFresh() {
    // 直接刷新当前页面，避免 /redirect 路由匹配问题
    window.location.reload()
  }

  /** 删除标签页 */
  function deleteDynamicTag(obj: any, tag?: string) {
    const rightClickIndex: number = store.multiTags.findIndex((item: any) => {
      const queryEqual = isEqual(item?.query || {}, obj?.query || {})
      const paramsEqual = isEqual(item?.params || {}, obj?.params || {})
      return item.path === obj.path && queryEqual && paramsEqual
    })

    if (rightClickIndex === -1) return // 如果没找到要删除的标签，直接返回

    // 找到当前激活页面的索引
    const activeIndex: number = store.multiTags.findIndex((item: any) => {
      const queryEqual = isEqual(item?.query || {}, route.query || {})
      const paramsEqual = isEqual(item?.params || {}, route.params || {})
      return item.path === route.path && queryEqual && paramsEqual
    })

    // 根据操作类型和位置关系决定新的激活页面
    let nextActiveTag = null

    switch (tag) {
      case undefined: {
        // 关闭当前页
        // 判断是否关闭的是激活页签（需要比较完整的标签信息）
        const isClosingActiveTag = rightClickIndex === activeIndex

        if (isClosingActiveTag) {
          // 关闭激活页：按左侧→右侧→首页的顺序选择下一个激活页
          const currentTags = store.multiTags

          if (rightClickIndex > 0) {
            // 有左侧标签，激活左侧标签
            nextActiveTag = currentTags[rightClickIndex - 1]
          } else if (rightClickIndex < currentTags.length - 1) {
            // 没有左侧标签但有右侧标签，激活右侧标签
            nextActiveTag = currentTags[rightClickIndex + 1]
          } else {
            // 只剩首页，激活首页
            nextActiveTag = createHomeTag()
          }
        }
        // 如果关闭的不是激活页签，激活页保持不变（nextActiveTag 保持 null）
        break
      }

      case 'left':
        if (activeIndex < rightClickIndex) {
          // 激活页在被右击页面左侧，会被删除，激活被右击页面
          nextActiveTag = obj
        }
        // 否则保持原激活（不需要设置 nextActiveTag）
        break

      case 'right':
        if (activeIndex > rightClickIndex) {
          // 激活页在被右击页面右侧，会被删除，激活被右击页面
          nextActiveTag = obj
        }
        // 否则保持原激活
        break

      case 'other':
        // 总是激活被右击页面
        nextActiveTag = obj
        break
    }

    // 执行删除操作
    if (tag === 'other') {
      // 关闭其他标签页时，保留首页和操作页签
      store.handleTags('equal', [createHomeTag(), obj])
    } else if (tag === 'left') {
      // 关闭左侧标签页：删除操作页签左侧的所有标签（除首页）
      store.handleTags('splice', obj, { position: 'left' })
    } else if (tag === 'right') {
      // 关闭右侧标签页：删除操作页签右侧的所有标签
      store.handleTags('splice', obj, { position: 'right' })
    } else {
      // 关闭当前标签页：删除指定标签
      store.handleTags('splice', obj)
    }

    // 删除完成后，如果需要激活新标签则进行跳转
    if (nextActiveTag) {
      // 更新激活标签状态
      useTagStoreHook().setActiveTag(nextActiveTag)

      router.push({
        path: nextActiveTag.path,
        query: nextActiveTag.query || {},
      })
    }
  }

  /** 处理标签页右键菜单点击事件 */
  function onClickDrop(key: number, item: any, selectRoute?: any): void {
    if (item && item.disabled) return

    // selectRoute 是被右键点击的页签信息，应该始终使用它作为操作目标
    // 如果没有 selectRoute，说明是下拉菜单操作，操作当前激活页
    let selectTagRoute: any
    if (selectRoute) {
      selectTagRoute = {
        path: selectRoute.path,
        meta: selectRoute.meta,
        name: selectRoute.name,
        query: selectRoute?.query || {},
        params: selectRoute?.params || {},
      }
    } else {
      // 下拉菜单操作当前激活页
      selectTagRoute = {
        path: route.path,
        meta: route.meta,
        query: route.query || {},
        params: route.params || {},
      }
    }
    console.log(key, item, selectRoute)

    // 当前路由信息
    switch (key) {
      case 0:
        // 刷新路由
        onFresh()
        break
      case 1:
        // 关闭当前标签页
        deleteDynamicTag(selectTagRoute)
        break
      case 2:
        // 关闭左侧标签页
        deleteDynamicTag(selectTagRoute, 'left')
        break
      case 3:
        // 关闭右侧标签页
        deleteDynamicTag(selectTagRoute, 'right')
        break
      case 4:
        // 关闭其他标签页
        deleteDynamicTag(selectTagRoute, 'other')
        break
      case 5: {
        // 关闭全部标签页
        const store = useTagStoreHook()

        if (shouldShowHomeTag()) {
          // 如果显示首页，只保留首页标签
          const homeTag = createHomeTag()
          store.handleTags('equal', [homeTag])

          // 跳转到首页
          router.push(getHomePath())
        } else {
          // 如果隐藏首页，关闭所有标签
          store.handleTags('equal', [])

          // 需要跳转到默认页面或显示空状态
          console.warn('所有标签已关闭且首页被隐藏，请确保有默认页面可跳转')
        }
        break
      }
    }
    // 菜单状态更新现在由 useTagMenuDisplay 在 openMenu 时处理，不需要在这里更新
  }

  /**
   * 动态路由标签
   */
  function dynamicRouteTag(value: string): void {
    // 通过路由跳转来触发标签添加，新标签会插入到当前标签的右侧
    router.push({
      path: value,
      query: route.query || {},
    })
  }

  /**
   * 标签点击事件
   */
  function tagOnClick(item: any): void {
    if (item?.path) {
      router.push({
        path: item.path,
        query: item.query || {},
      })
    }
  }

  return {
    // 方法
    onFresh,
    deleteDynamicTag,
    onClickDrop,
    dynamicRouteTag,
    tagOnClick,
  }
}
