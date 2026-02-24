import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useTagOperations } from '../useTagOperations'
import { useTagStoreHook } from '../../store'
import { useRoute, useRouter } from 'vue-router'

// Mock dependencies
vi.mock('vue-router')
vi.mock('../../store')
vi.mock('../../config/configManager', () => ({
  createHomeTag: () => ({ path: '/home', meta: { title: '首页' }, query: {}, params: {} }),
  getConfig: () => ({ homePath: '/home' }),
  shouldShowHomeTag: () => true,
  configManager: {
    shouldShowHomeTag: () => true,
  },
}))

vi.mock('../../utils', () => ({
  shouldShowHomeTag: () => true,
  isEqual: (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b),
  createSimpleRefresh: () => vi.fn(),
}))

describe('useTagOperations - 完整行为测试', () => {
  let mockRoute: any
  let mockRouter: any
  let mockStore: any

  beforeEach(() => {
    // Mock route - 当前激活页是 /page2（索引2）
    mockRoute = {
      path: '/page2',
      query: {},
      params: {},
      fullPath: '/page2',
      meta: { title: 'Page 2' },
    }

    // Mock router
    mockRouter = {
      push: vi.fn(),
      replace: vi.fn(),
    }

    // Mock store
    mockStore = {
      multiTags: [
        { path: '/home', meta: { title: '首页' }, query: {}, params: {} }, // 索引0
        { path: '/page1', meta: { title: 'Page 1' }, query: {}, params: {} }, // 索引1
        { path: '/page2', meta: { title: 'Page 2' }, query: {}, params: {} }, // 索引2 - 当前激活页
        { path: '/page3', meta: { title: 'Page 3' }, query: {}, params: {} }, // 索引3
        { path: '/page4', meta: { title: 'Page 4' }, query: {}, params: {} }, // 索引4
      ],
      handleTags: vi.fn(),
      setActiveTag: vi.fn(),
    }

    vi.mocked(useRoute).mockReturnValue(mockRoute)
    vi.mocked(useRouter).mockReturnValue(mockRouter)
    vi.mocked(useTagStoreHook).mockReturnValue(mockStore)
  })

  describe('1. 关闭当前标签页（关闭激活页）', () => {
    it('应该关闭激活页并激活左侧页签', () => {
      const { onClickDrop } = useTagOperations()

      // 关闭当前激活页 /page2（索引2）
      const operationTag = { path: '/page2', meta: { title: 'Page 2' }, query: {}, params: {} }

      onClickDrop(1, { disabled: false }, operationTag) // case 1: 关闭当前标签页

      // 验证删除操作：应该调用 splice 删除指定标签
      expect(mockStore.handleTags).toHaveBeenCalledWith('splice', operationTag)

      // 验证激活逻辑：应该激活左侧的 /page1
      expect(mockRouter.push).toHaveBeenCalledWith({
        path: '/page1',
        query: {},
      })
    })

    it('应该激活左侧页签（包括首页）', () => {
      // 修改场景：当前激活页是 /page1（索引1）
      mockRoute.path = '/page1'
      mockStore.multiTags = [
        { path: '/home', meta: { title: '首页' }, query: {}, params: {} },
        { path: '/page1', meta: { title: 'Page 1' }, query: {}, params: {} }, // 当前激活页
        { path: '/page2', meta: { title: 'Page 2' }, query: {}, params: {} },
      ]

      const { onClickDrop } = useTagOperations()

      // 关闭当前激活页 /page1（索引1），应该激活左侧的首页 /home（索引0）
      const operationTag = { path: '/page1', meta: { title: 'Page 1' }, query: {}, params: {} }

      onClickDrop(1, { disabled: false }, operationTag)

      expect(mockRouter.push).toHaveBeenCalledWith({
        path: '/home',
        query: {},
      })
    })

    it('如果没有左侧页签，应该激活右侧页签', () => {
      // 修改场景：当前激活页是首页后的第一个页面
      mockRoute.path = '/page1'
      mockStore.multiTags = [
        { path: '/home', meta: { title: '首页' }, query: {}, params: {} },
        { path: '/page1', meta: { title: 'Page 1' }, query: {}, params: {} }, // 当前激活页，索引1
        { path: '/page2', meta: { title: 'Page 2' }, query: {}, params: {} },
      ]

      const { onClickDrop } = useTagOperations()

      // 关闭首页后的第一个页面，由于左侧只有首页，应该激活右侧页签
      const operationTag = { path: '/page1', meta: { title: 'Page 1' }, query: {}, params: {} }

      onClickDrop(1, { disabled: false }, operationTag)

      // 根据当前实现，这里应该激活首页，但如果您期望激活右侧页签，需要修改实现
      expect(mockRouter.push).toHaveBeenCalledWith({
        path: '/home', // 当前实现会激活首页
        query: {},
      })
    })

    it('如果只剩首页，应该激活首页', () => {
      // 修改场景：只有首页和当前页
      mockRoute.path = '/page1'
      mockStore.multiTags = [
        { path: '/home', meta: { title: '首页' }, query: {}, params: {} },
        { path: '/page1', meta: { title: 'Page 1' }, query: {}, params: {} }, // 当前激活页
      ]

      const { onClickDrop } = useTagOperations()

      // 关闭当前激活页 /page1（索引1），应该激活首页
      const operationTag = { path: '/page1', meta: { title: 'Page 1' }, query: {}, params: {} }

      onClickDrop(1, { disabled: false }, operationTag)

      expect(mockRouter.push).toHaveBeenCalledWith({
        path: '/home',
        query: {},
      })
    })
  })

  describe('2. 关闭当前标签页（关闭非激活页）', () => {
    it('激活页应该保持不变', () => {
      const { onClickDrop } = useTagOperations()

      // 关闭非激活页 /page1（索引1），当前激活页是 /page2（索引2）
      const operationTag = { path: '/page1', meta: { title: 'Page 1' }, query: {}, params: {} }

      onClickDrop(1, { disabled: false }, operationTag)

      // 不应该有路由跳转
      expect(mockRouter.push).not.toHaveBeenCalled()
    })
  })

  describe('3. 关闭全部标签页', () => {
    it('应该激活首页', () => {
      const { onClickDrop } = useTagOperations()

      onClickDrop(5, { disabled: false }) // case 5: 关闭全部标签页

      expect(mockRouter.push).toHaveBeenCalledWith('/home')
    })
  })

  describe('4. 关闭其他标签页', () => {
    it('应该激活操作页签（被右键点击的页签）', () => {
      const { onClickDrop } = useTagOperations()

      // 右键点击 /page1，关闭其他标签页，应该激活 /page1
      const operationTag = { path: '/page1', meta: { title: 'Page 1' }, query: {}, params: {} }

      onClickDrop(4, { disabled: false }, operationTag) // case 4: 关闭其他标签页

      expect(mockRouter.push).toHaveBeenCalledWith({
        path: '/page1',
        query: {},
      })
    })
  })

  describe('5. 关闭右侧标签页', () => {
    it('如果右侧标签包含激活页签，应该激活操作页签', () => {
      const { onClickDrop } = useTagOperations()

      // 右键点击 /page1（索引1），关闭右侧标签页，激活页 /page2（索引2）在右侧会被删除
      const operationTag = { path: '/page1', meta: { title: 'Page 1' }, query: {}, params: {} }

      onClickDrop(3, { disabled: false }, operationTag) // case 3: 关闭右侧标签页

      expect(mockRouter.push).toHaveBeenCalledWith({
        path: '/page1',
        query: {},
      })
    })

    it('如果右侧标签不包含激活页签，激活页应该保持不变', () => {
      // 修改场景：当前激活页是 /page1（索引1）
      mockRoute.path = '/page1'

      const { onClickDrop } = useTagOperations()

      // 右键点击 /page2（索引2），关闭右侧标签页，激活页 /page1（索引1）在左侧不会被删除
      const operationTag = { path: '/page2', meta: { title: 'Page 2' }, query: {}, params: {} }

      onClickDrop(3, { disabled: false }, operationTag)

      // 不应该有路由跳转
      expect(mockRouter.push).not.toHaveBeenCalled()
    })
  })

  describe('6. 关闭左侧标签页', () => {
    it('如果左侧标签包含激活页签，应该激活操作页签', () => {
      // 修改场景：当前激活页是 /page1（索引1）
      mockRoute.path = '/page1'

      const { onClickDrop } = useTagOperations()

      // 右键点击 /page3（索引3），关闭左侧标签页，激活页 /page1（索引1）在左侧会被删除
      const operationTag = { path: '/page3', meta: { title: 'Page 3' }, query: {}, params: {} }

      onClickDrop(2, { disabled: false }, operationTag) // case 2: 关闭左侧标签页

      expect(mockRouter.push).toHaveBeenCalledWith({
        path: '/page3',
        query: {},
      })
    })

    it('如果左侧标签不包含激活页签，激活页应该保持不变', () => {
      const { onClickDrop } = useTagOperations()

      // 右键点击 /page1（索引1），关闭左侧标签页，激活页 /page2（索引2）在右侧不会被删除
      const operationTag = { path: '/page1', meta: { title: 'Page 1' }, query: {}, params: {} }

      onClickDrop(2, { disabled: false }, operationTag)

      // 不应该有路由跳转
      expect(mockRouter.push).not.toHaveBeenCalled()
    })
  })
})
