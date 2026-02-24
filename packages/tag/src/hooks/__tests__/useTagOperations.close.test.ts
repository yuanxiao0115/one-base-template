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

describe('useTagOperations - 关闭页签行为测试', () => {
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

  describe('关闭页签操作验证', () => {
    it('1. 关闭当前标签页 - 应该删除指定标签', () => {
      const { onClickDrop } = useTagOperations()

      // 关闭 /page2（索引2）
      const operationTag = { path: '/page2', meta: { title: 'Page 2' }, query: {}, params: {} }

      onClickDrop(1, { disabled: false }, operationTag) // case 1: 关闭当前标签页

      // 验证：应该删除指定标签
      expect(mockStore.handleTags).toHaveBeenCalledWith('splice', operationTag)
    })

    it('2. 关闭左侧标签页 - 应该删除左侧所有标签（除首页）', () => {
      const { onClickDrop } = useTagOperations()

      // 右键点击 /page3（索引3），关闭左侧标签页
      const operationTag = { path: '/page3', meta: { title: 'Page 3' }, query: {}, params: {} }

      onClickDrop(2, { disabled: false }, operationTag) // case 2: 关闭左侧标签页

      // 验证：应该从索引1开始删除2个标签（/page1, /page2）
      // 验证：应该删除左侧标签
      expect(mockStore.handleTags).toHaveBeenCalledWith('splice', operationTag, {
        position: 'left',
      })
    })

    it('3. 关闭右侧标签页 - 应该删除右侧所有标签', () => {
      const { onClickDrop } = useTagOperations()

      // 右键点击 /page1（索引1），关闭右侧标签页
      const operationTag = { path: '/page1', meta: { title: 'Page 1' }, query: {}, params: {} }

      onClickDrop(3, { disabled: false }, operationTag) // case 3: 关闭右侧标签页

      // 验证：应该从索引2开始删除到末尾
      // 验证：应该删除右侧标签
      expect(mockStore.handleTags).toHaveBeenCalledWith('splice', operationTag, {
        position: 'right',
      })
    })

    it('4. 关闭其他标签页 - 应该只保留首页和操作页签', () => {
      const { onClickDrop } = useTagOperations()

      // 右键点击 /page1，关闭其他标签页
      const operationTag = { path: '/page1', meta: { title: 'Page 1' }, query: {}, params: {} }

      onClickDrop(4, { disabled: false }, operationTag) // case 4: 关闭其他标签页

      // 验证：应该使用 equal 操作，只保留首页和操作页签
      expect(mockStore.handleTags).toHaveBeenCalledWith('equal', [
        { path: '/home', meta: { title: '首页' }, query: {}, params: {} },
        operationTag,
      ])
    })

    it('5. 关闭全部标签页 - 应该删除除首页外的所有标签', () => {
      const { onClickDrop } = useTagOperations()

      onClickDrop(5, { disabled: false }) // case 5: 关闭全部标签页

      // 验证：应该重置为只有首页
      expect(mockStore.handleTags).toHaveBeenCalledWith('equal', [
        { path: '/home', meta: { title: '首页' }, query: {}, params: {} },
      ])
    })
  })

  describe('边界情况测试', () => {
    it('关闭左侧标签页 - 当操作页签是第一个非首页标签时', () => {
      const { onClickDrop } = useTagOperations()

      // 右键点击 /page1（索引1），关闭左侧标签页
      const operationTag = { path: '/page1', meta: { title: 'Page 1' }, query: {}, params: {} }

      onClickDrop(2, { disabled: false }, operationTag) // case 2: 关闭左侧标签页

      // 验证：应该删除左侧标签（即使没有左侧标签）
      expect(mockStore.handleTags).toHaveBeenCalledWith('splice', operationTag, {
        position: 'left',
      })
    })

    it('关闭右侧标签页 - 当操作页签是最后一个标签时', () => {
      const { onClickDrop } = useTagOperations()

      // 右键点击 /page4（索引4），关闭右侧标签页
      const operationTag = { path: '/page4', meta: { title: 'Page 4' }, query: {}, params: {} }

      onClickDrop(3, { disabled: false }, operationTag) // case 3: 关闭右侧标签页

      // 验证：应该删除右侧标签（即使没有右侧标签）
      expect(mockStore.handleTags).toHaveBeenCalledWith('splice', operationTag, {
        position: 'right',
      })
    })
  })

  describe('激活逻辑验证', () => {
    it('关闭激活页时应该正确激活新页签', () => {
      const { onClickDrop } = useTagOperations()

      // 关闭当前激活页 /page2（索引2）
      const operationTag = { path: '/page2', meta: { title: 'Page 2' }, query: {}, params: {} }

      onClickDrop(1, { disabled: false }, operationTag)

      // 验证激活逻辑：应该激活左侧的 /page1
      expect(mockRouter.push).toHaveBeenCalledWith({
        path: '/page1',
        query: {},
      })
    })

    it('关闭非激活页时不应该改变激活页', () => {
      const { onClickDrop } = useTagOperations()

      // 关闭非激活页 /page1（索引1）
      const operationTag = { path: '/page1', meta: { title: 'Page 1' }, query: {}, params: {} }

      onClickDrop(1, { disabled: false }, operationTag)

      // 验证：不应该有路由跳转
      expect(mockRouter.push).not.toHaveBeenCalled()
    })
  })
})
