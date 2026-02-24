import { describe, it, expect, beforeEach, vi } from 'vitest'
import { MENU_INDICES } from '../../types'

// Mock store
vi.mock('../../store', () => ({
  useTagStoreHook: vi.fn(),
}))

// Mock vue-router
vi.mock('vue-router', () => ({
  useRoute: () => ({
    path: '/test',
    query: {},
  }),
}))

// Mock config manager
vi.mock('../../config/configManager', () => ({
  configManager: {
    getHomePath: () => '/home',
  },
}))

// Mock utils
vi.mock('../../utils', () => ({
  isEqual: (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b),
}))

// Import after mocks
import { useContextMenuDisplay } from '../useContextMenuDisplay'
import { useTagStoreHook } from '../../store'

describe('useContextMenuDisplay', () => {
  let menuDisplay: ReturnType<typeof useContextMenuDisplay>

  beforeEach(() => {
    // Mock multiTags for different test scenarios
    vi.mocked(useTagStoreHook).mockReturnValue({
      multiTags: [
        { path: '/home', query: {} },
        { path: '/dashboard', query: {} },
        { path: '/profile', query: {} },
      ],
    } as any)

    menuDisplay = useContextMenuDisplay()
  })

  describe('首页菜单显示规则', () => {
    it('首页激活状态 - 只有首页一个标签', () => {
      // Mock只有首页
      vi.mocked(useTagStoreHook).mockReturnValue({
        multiTags: [{ path: '/home', query: {} }],
      } as any)
      menuDisplay = useContextMenuDisplay()

      menuDisplay.configureContextMenu('/home', {}, '/home', {})

      const { tagsViews } = menuDisplay

      // 重新加载：显示（激活页）
      expect(tagsViews[MENU_INDICES.REFRESH].show).toBe(true)

      // 关闭当前标签页：隐藏（首页常驻）
      expect(tagsViews[MENU_INDICES.CLOSE_CURRENT].show).toBe(false)

      // 关闭左侧标签页：隐藏（左侧没有标签）
      expect(tagsViews[MENU_INDICES.CLOSE_LEFT].show).toBe(false)

      // 关闭右侧标签页：隐藏（右侧没有标签）
      expect(tagsViews[MENU_INDICES.CLOSE_RIGHT].show).toBe(false)

      // 关闭其他标签页：隐藏（没有其他标签）
      expect(tagsViews[MENU_INDICES.CLOSE_OTHER].show).toBe(false)

      // 关闭全部标签页：隐藏（只有首页）
      expect(tagsViews[MENU_INDICES.CLOSE_ALL].show).toBe(false)
    })

    it('首页激活状态 - 有其他标签', () => {
      menuDisplay.configureContextMenu('/home', {}, '/home', {})

      const { tagsViews } = menuDisplay

      // 重新加载：显示（激活页）
      expect(tagsViews[MENU_INDICES.REFRESH].show).toBe(true)

      // 关闭当前标签页：隐藏（首页常驻）
      expect(tagsViews[MENU_INDICES.CLOSE_CURRENT].show).toBe(false)

      // 关闭左侧标签页：隐藏（左侧没有标签）
      expect(tagsViews[MENU_INDICES.CLOSE_LEFT].show).toBe(false)

      // 关闭右侧标签页：显示（右侧有标签）
      expect(tagsViews[MENU_INDICES.CLOSE_RIGHT].show).toBe(true)

      // 关闭其他标签页：显示（有其他标签）
      expect(tagsViews[MENU_INDICES.CLOSE_OTHER].show).toBe(true)

      // 关闭全部标签页：显示（有其他标签）
      expect(tagsViews[MENU_INDICES.CLOSE_ALL].show).toBe(true)
    })

    it('首页非激活状态', () => {
      menuDisplay.configureContextMenu('/home', {}, '/dashboard', {})

      const { tagsViews } = menuDisplay

      // 重新加载：隐藏（非激活页）
      expect(tagsViews[MENU_INDICES.REFRESH].show).toBe(false)

      // 其他菜单项应该和激活状态一样
      expect(tagsViews[MENU_INDICES.CLOSE_CURRENT].show).toBe(false)
      expect(tagsViews[MENU_INDICES.CLOSE_LEFT].show).toBe(false)
      expect(tagsViews[MENU_INDICES.CLOSE_RIGHT].show).toBe(true)
      expect(tagsViews[MENU_INDICES.CLOSE_OTHER].show).toBe(true)
      expect(tagsViews[MENU_INDICES.CLOSE_ALL].show).toBe(true)
    })
  })

  describe('普通页面菜单显示规则', () => {
    it('首页右侧第一个标签（索引1）激活状态', () => {
      menuDisplay.configureContextMenu('/dashboard', {}, '/dashboard', {})

      const { tagsViews } = menuDisplay

      // 重新加载：显示（激活页）
      expect(tagsViews[MENU_INDICES.REFRESH].show).toBe(true)

      // 关闭当前标签页：显示（普通页面）
      expect(tagsViews[MENU_INDICES.CLOSE_CURRENT].show).toBe(true)

      // 关闭左侧标签页：隐藏（左侧只有首页，首页不能关闭）
      expect(tagsViews[MENU_INDICES.CLOSE_LEFT].show).toBe(false)

      // 关闭右侧标签页：显示（右侧有标签）
      expect(tagsViews[MENU_INDICES.CLOSE_RIGHT].show).toBe(true)

      // 关闭其他标签页：显示
      expect(tagsViews[MENU_INDICES.CLOSE_OTHER].show).toBe(true)

      // 关闭全部标签页：显示
      expect(tagsViews[MENU_INDICES.CLOSE_ALL].show).toBe(true)
    })

    it('中间标签（索引2）激活状态', () => {
      menuDisplay.configureContextMenu('/profile', {}, '/profile', {})

      const { tagsViews } = menuDisplay

      // 重新加载：显示（激活页）
      expect(tagsViews[MENU_INDICES.REFRESH].show).toBe(true)

      // 关闭当前标签页：显示（普通页面）
      expect(tagsViews[MENU_INDICES.CLOSE_CURRENT].show).toBe(true)

      // 关闭左侧标签页：显示（左侧有可关闭的标签）
      expect(tagsViews[MENU_INDICES.CLOSE_LEFT].show).toBe(true)

      // 关闭右侧标签页：隐藏（这是最右侧标签）
      expect(tagsViews[MENU_INDICES.CLOSE_RIGHT].show).toBe(false)

      // 关闭其他标签页：显示
      expect(tagsViews[MENU_INDICES.CLOSE_OTHER].show).toBe(true)

      // 关闭全部标签页：显示
      expect(tagsViews[MENU_INDICES.CLOSE_ALL].show).toBe(true)
    })

    it('普通页面非激活状态', () => {
      menuDisplay.configureContextMenu('/dashboard', {}, '/profile', {})

      const { tagsViews } = menuDisplay

      // 重新加载：隐藏（非激活页）
      expect(tagsViews[MENU_INDICES.REFRESH].show).toBe(false)

      // 其他菜单项应该和激活状态一样
      expect(tagsViews[MENU_INDICES.CLOSE_CURRENT].show).toBe(true)
      expect(tagsViews[MENU_INDICES.CLOSE_LEFT].show).toBe(false)
      expect(tagsViews[MENU_INDICES.CLOSE_RIGHT].show).toBe(true)
      expect(tagsViews[MENU_INDICES.CLOSE_OTHER].show).toBe(true)
      expect(tagsViews[MENU_INDICES.CLOSE_ALL].show).toBe(true)
    })
  })

  describe('特殊场景测试', () => {
    it('只有两个标签：首页 + 一个普通页面', () => {
      // Mock只有两个标签
      vi.mocked(useTagStoreHook).mockReturnValue({
        multiTags: [
          { path: '/home', query: {} },
          { path: '/dashboard', query: {} },
        ],
      } as any)
      menuDisplay = useContextMenuDisplay()

      // 测试普通页面（索引1）
      menuDisplay.configureContextMenu('/dashboard', {}, '/dashboard', {})

      const { tagsViews } = menuDisplay

      // 重新加载：显示（激活页）
      expect(tagsViews[MENU_INDICES.REFRESH].show).toBe(true)

      // 关闭当前标签页：显示
      expect(tagsViews[MENU_INDICES.CLOSE_CURRENT].show).toBe(true)

      // 关闭左侧标签页：隐藏（左侧只有首页）
      expect(tagsViews[MENU_INDICES.CLOSE_LEFT].show).toBe(false)

      // 关闭右侧标签页：隐藏（右侧没有标签）
      expect(tagsViews[MENU_INDICES.CLOSE_RIGHT].show).toBe(false)

      // 关闭其他标签页：显示
      expect(tagsViews[MENU_INDICES.CLOSE_OTHER].show).toBe(true)

      // 关闭全部标签页：显示
      expect(tagsViews[MENU_INDICES.CLOSE_ALL].show).toBe(true)
    })

    it('多个标签中的中间标签', () => {
      // Mock多个标签
      vi.mocked(useTagStoreHook).mockReturnValue({
        multiTags: [
          { path: '/home', query: {} },
          { path: '/dashboard', query: {} },
          { path: '/profile', query: {} },
          { path: '/settings', query: {} },
        ],
      } as any)
      menuDisplay = useContextMenuDisplay()

      // 测试中间标签（索引2）
      menuDisplay.configureContextMenu('/profile', {}, '/profile', {})

      const { tagsViews } = menuDisplay

      // 关闭左侧标签页：显示（左侧有可关闭的标签）
      expect(tagsViews[MENU_INDICES.CLOSE_LEFT].show).toBe(true)

      // 关闭右侧标签页：显示（右侧有标签）
      expect(tagsViews[MENU_INDICES.CLOSE_RIGHT].show).toBe(true)
    })

    it('多个标签中的另一个中间标签（索引3）', () => {
      // Mock更多标签
      vi.mocked(useTagStoreHook).mockReturnValue({
        multiTags: [
          { path: '/home', query: {} },
          { path: '/dashboard', query: {} },
          { path: '/profile', query: {} },
          { path: '/settings', query: {} },
          { path: '/about', query: {} },
        ],
      } as any)
      menuDisplay = useContextMenuDisplay()

      // 测试中间标签（索引3）
      menuDisplay.configureContextMenu('/settings', {}, '/settings', {})

      const { tagsViews } = menuDisplay

      // 重新加载：显示（激活页）
      expect(tagsViews[MENU_INDICES.REFRESH].show).toBe(true)

      // 关闭当前标签页：显示（普通页面）
      expect(tagsViews[MENU_INDICES.CLOSE_CURRENT].show).toBe(true)

      // 关闭左侧标签页：显示（左侧有可关闭的标签）
      expect(tagsViews[MENU_INDICES.CLOSE_LEFT].show).toBe(true)

      // 关闭右侧标签页：显示（右侧有标签）
      expect(tagsViews[MENU_INDICES.CLOSE_RIGHT].show).toBe(true)

      // 关闭其他标签页：显示
      expect(tagsViews[MENU_INDICES.CLOSE_OTHER].show).toBe(true)

      // 关闭全部标签页：显示
      expect(tagsViews[MENU_INDICES.CLOSE_ALL].show).toBe(true)
    })
  })

  describe('下拉菜单测试', () => {
    it('下拉菜单始终操作当前激活页', () => {
      menuDisplay.configureDropdownMenu('/dashboard', {})

      const { tagsViews } = menuDisplay

      // 下拉菜单应该显示重新加载（因为操作的是激活页）
      expect(tagsViews[MENU_INDICES.REFRESH].show).toBe(true)
    })
  })

  describe('工具方法测试', () => {
    it('isHomePage 正确判断首页', () => {
      expect(menuDisplay.isHomePage('/home')).toBe(true)
      expect(menuDisplay.isHomePage('/dashboard')).toBe(false)
    })

    it('resetMenuState 重置所有菜单状态', () => {
      // 先隐藏一些菜单项
      menuDisplay.hideMenuItems([MENU_INDICES.REFRESH, MENU_INDICES.CLOSE_CURRENT])

      // 重置状态
      menuDisplay.resetMenuState()

      const { tagsViews } = menuDisplay

      // 所有菜单项应该都显示且启用
      tagsViews.forEach((item) => {
        expect(item.show).toBe(true)
        expect(item.disabled).toBe(false)
      })
    })
  })
})
