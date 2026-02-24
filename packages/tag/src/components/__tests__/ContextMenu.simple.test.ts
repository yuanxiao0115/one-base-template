import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ContextMenu from '../ContextMenu.vue'
import { useTagOperations } from '../../hooks/useTagOperations'

// Mock dependencies
vi.mock('../../hooks/useTagOperations')
vi.mock('@iconify/vue', () => ({
  Icon: {
    name: 'Icon',
    template: '<span>{{ icon }}</span>',
    props: ['icon'],
  },
}))

describe('ContextMenu 组件测试', () => {
  let mockOnClickDrop: any
  let wrapper: any

  beforeEach(() => {
    // Mock useTagOperations
    mockOnClickDrop = vi.fn()
    vi.mocked(useTagOperations).mockReturnValue({
      onClickDrop: mockOnClickDrop,
      deleteDynamicTag: vi.fn(),
    })

    // 基本的 props
    const props = {
      position: { left: 100, top: 200 },
      menuItems: [
        { text: '刷新页面', disabled: false, show: true, icon: 'refresh' },
        { text: '关闭当前标签页', disabled: false, show: true, icon: 'close' },
        { text: '关闭左侧标签页', disabled: false, show: true, icon: 'close-left' },
        { text: '关闭右侧标签页', disabled: false, show: true, icon: 'close-right' },
        { text: '关闭其他标签页', disabled: false, show: true, icon: 'close-other' },
        { text: '关闭全部标签页', disabled: false, show: true, icon: 'close-all' },
      ],
      currentSelect: {
        path: '/page2',
        meta: { title: 'Page 2' },
        query: {},
        params: {},
      },
    }

    wrapper = mount(ContextMenu, {
      props,
      global: {
        stubs: {
          Icon: true,
        },
      },
    })
  })

  afterEach(() => {
    wrapper?.unmount()
    vi.clearAllMocks()
  })

  describe('问题诊断', () => {
    it('应该输出实际的菜单项数据用于调试', () => {
      console.log('=== ContextMenu 调试信息 ===')

      // 输出组件的 HTML 结构
      console.log('组件 HTML:', wrapper.html())

      // 输出菜单项
      const menuItems = wrapper.findAll('.context-menu-item')
      console.log('菜单项数量:', menuItems.length)

      menuItems.forEach((item, index) => {
        console.log(`菜单项 ${index}:`, {
          text: item.text(),
          testId: item.attributes('data-testid'),
          classes: item.classes(),
        })
      })

      // 输出 visibleMenuItems 的计算结果
      const vm = wrapper.vm as any
      console.log('visibleMenuItems:', vm.visibleMenuItems)
      console.log('props.menuItems:', vm.$props.menuItems)

      // 验证菜单项是否正确渲染
      expect(menuItems.length).toBeGreaterThan(0)
    })

    it('点击测试', async () => {
      const menuItems = wrapper.findAll('.context-menu-item')
      console.log('找到的菜单项数量:', menuItems.length)

      if (menuItems.length > 0) {
        const firstItem = menuItems[0]
        console.log('第一个菜单项:', {
          text: firstItem.text(),
          testId: firstItem.attributes('data-testid'),
          html: firstItem.html(),
        })

        await firstItem.trigger('click')
        console.log('onClickDrop 调用次数:', mockOnClickDrop.mock.calls.length)
        console.log('onClickDrop 调用参数:', mockOnClickDrop.mock.calls)
      }
    })
  })
})
