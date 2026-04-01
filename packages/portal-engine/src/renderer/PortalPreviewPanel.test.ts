/* eslint-disable vue/one-component-per-file */
import { computed, defineComponent, nextTick, type CSSProperties } from 'vue';
import { mount, type VueWrapper } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vite-plus/test';

import {
  PORTAL_PREVIEW_MESSAGE_PAGE_RUNTIME,
  PORTAL_PREVIEW_MESSAGE_SHELL_DETAILS,
  PORTAL_PREVIEW_MESSAGE_VIEWPORT
} from '../editor/preview-bridge/messages';
import {
  createDefaultPortalPageSettingsV2,
  type PortalPageSettingsV2
} from '../schema/page-settings';
import PortalPreviewPanel from './PortalPreviewPanel.vue';
import type {
  PortalPreviewDataSource,
  PortalPreviewNavigatePayload
} from './portal-preview-panel.types';

interface PortalPreviewPanelExposed {
  getRuntimeSnapshot: () => {
    settings: PortalPageSettingsV2;
    component: Array<{ i: string }>;
  };
}

const ConfigurablePortalHeaderStub = defineComponent({
  name: 'ConfigurablePortalHeader',
  props: {
    config: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['navigate'],
  setup(props) {
    const titleText = computed(() => {
      const config = props.config as { behavior?: { title?: unknown } };
      return typeof config.behavior?.title === 'string' ? config.behavior.title : '';
    });
    return {
      titleText
    };
  },
  template: `
    <div class="configurable-header-stub">
      <span class="header-title">{{ titleText }}</span>
      <button class="nav-tab-btn" @click="$emit('navigate', { key: 'tab-next', label: '下一页', tabId: 'tab-2' })">tab</button>
      <button class="nav-url-btn" @click="$emit('navigate', { key: 'url-next', label: '外链', url: 'https://example.com' })">url</button>
    </div>
  `
});

const ConfigurablePortalFooterStub = defineComponent({
  name: 'ConfigurablePortalFooter',
  template: '<div class="configurable-footer-stub" />'
});

const PortalGridRendererStub = defineComponent({
  name: 'PortalGridRenderer',
  template: '<div class="grid-renderer-stub" />'
});

const PortalPreviewLayoutStub = defineComponent({
  name: 'PortalPreviewLayoutStub',
  props: {
    contentScrollStyle: {
      type: Object,
      default: () => ({})
    }
  },
  setup(props) {
    const contentStyle = computed(() => props.contentScrollStyle as CSSProperties);
    return {
      contentStyle
    };
  },
  template: `
    <div class="preview-layout-stub">
      <div class="preview-layout-stub__header"><slot name="header" /></div>
      <div class="preview-layout-stub__content" :style="contentStyle"><slot name="content" /></div>
      <div class="preview-layout-stub__footer"><slot name="footer" /></div>
    </div>
  `
});

function createMockDataSource(): PortalPreviewDataSource {
  const settings = createDefaultPortalPageSettingsV2();
  settings.basic.pageTitle = '初始页面';

  return {
    getTabDetail: vi.fn(async () => ({
      success: true,
      data: {
        templateId: 'tpl-1',
        pageLayout: JSON.stringify({
          settings,
          component: []
        })
      }
    })),
    getTemplateDetail: vi.fn(async () => ({
      success: true,
      data: {
        id: 'tpl-1',
        details: '{}',
        tabList: []
      }
    }))
  };
}

function createWrapper(onNavigate?: (payload: PortalPreviewNavigatePayload) => void) {
  const previewDataSource = createMockDataSource();
  const wrapper = mount(PortalPreviewPanel, {
    props: {
      tabId: 'tab-1',
      templateId: 'tpl-1',
      listenMessage: true,
      previewDataSource,
      materialsMap: {},
      onNavigate
    },
    global: {
      directives: {
        loading: {
          mounted: () => undefined,
          updated: () => undefined
        }
      },
      stubs: {
        ConfigurablePortalHeader: ConfigurablePortalHeaderStub,
        ConfigurablePortalFooter: ConfigurablePortalFooterStub,
        PortalGridRenderer: PortalGridRendererStub,
        PortalPreviewGlobalScrollLayout: PortalPreviewLayoutStub,
        PortalPreviewHeaderFixedContentScrollLayout: PortalPreviewLayoutStub,
        PortalPreviewHeaderFooterFixedContentScrollLayout: PortalPreviewLayoutStub,
        'el-button': true,
        'el-empty': true,
        'el-result': true
      }
    }
  });

  return {
    wrapper,
    previewDataSource
  };
}

async function flushAsync(rounds = 4) {
  for (let index = 0; index < rounds; index += 1) {
    await Promise.resolve();
    await nextTick();
  }
}

function dispatchMessage(type: string, data: unknown) {
  window.dispatchEvent(
    new MessageEvent('message', {
      origin: window.location.origin,
      data: { type, data }
    })
  );
}

function getRuntimeSnapshot(wrapper: VueWrapper<unknown>) {
  const vm = wrapper.vm as unknown as PortalPreviewPanelExposed;
  return vm.getRuntimeSnapshot();
}

describe('PortalPreviewPanel', () => {
  it('preview-page-runtime 消息应更新 settings 与 layout', async () => {
    const { wrapper } = createWrapper();
    await flushAsync();

    const nextSettings = createDefaultPortalPageSettingsV2();
    nextSettings.basic.pageTitle = '运行时页面';
    nextSettings.layoutMode = 'global-scroll';
    const nextComponent = [
      {
        i: 'runtime-item-1',
        x: 0,
        y: 0,
        w: 6,
        h: 4
      }
    ];

    dispatchMessage(PORTAL_PREVIEW_MESSAGE_PAGE_RUNTIME, {
      templateId: 'tpl-1',
      tabId: 'tab-1',
      settings: nextSettings,
      component: nextComponent
    });
    await flushAsync();

    const snapshot = getRuntimeSnapshot(wrapper);
    expect(snapshot.settings.basic.pageTitle).toBe('运行时页面');
    expect(snapshot.settings.layoutMode).toBe('global-scroll');
    expect(snapshot.component).toHaveLength(1);
    expect(snapshot.component[0]?.i).toBe('runtime-item-1');

    wrapper.unmount();
  });

  it('preview-shell-details 与 preview-viewport 消息应生效', async () => {
    const { wrapper } = createWrapper();
    await flushAsync();

    dispatchMessage(PORTAL_PREVIEW_MESSAGE_SHELL_DETAILS, {
      templateId: 'tpl-1',
      details: JSON.stringify({
        pageHeader: 1,
        pageFooter: 1,
        shell: {
          header: {
            behavior: {
              title: '运行时壳层标题'
            }
          }
        }
      })
    });
    await flushAsync();

    expect(wrapper.find('.header-title').text()).toBe('运行时壳层标题');

    dispatchMessage(PORTAL_PREVIEW_MESSAGE_VIEWPORT, {
      templateId: 'tpl-1',
      tabId: 'tab-1',
      width: 1280,
      height: 720
    });
    await flushAsync();

    const previewShell = wrapper.find('.preview-shell');
    expect(previewShell.classes()).toContain('preview-shell--fixed');
    expect(previewShell.attributes('style')).toContain('width: 1280px;');
    expect(previewShell.attributes('style')).toContain('min-height: 720px;');

    wrapper.unmount();
  });

  it('onNavigate 在 tab/url 场景应抛出正确 payload', async () => {
    const onNavigate = vi.fn();
    const { wrapper } = createWrapper(onNavigate);
    await flushAsync();

    await wrapper.find('.nav-tab-btn').trigger('click');
    await wrapper.find('.nav-url-btn').trigger('click');

    expect(onNavigate).toHaveBeenCalledTimes(2);
    expect(onNavigate).toHaveBeenNthCalledWith(1, {
      type: 'tab',
      tabId: 'tab-2',
      item: {
        key: 'tab-next',
        label: '下一页',
        tabId: 'tab-2'
      }
    });
    expect(onNavigate).toHaveBeenNthCalledWith(2, {
      type: 'url',
      url: 'https://example.com',
      item: {
        key: 'url-next',
        label: '外链',
        url: 'https://example.com'
      }
    });

    wrapper.unmount();
  });

  it('Banner 开启且内容间距为负值时，内容区应向上覆盖 Banner', async () => {
    const { wrapper } = createWrapper();
    await flushAsync();

    const nextSettings = createDefaultPortalPageSettingsV2();
    nextSettings.banner.enabled = true;
    nextSettings.banner.contentSpacing = -24;

    dispatchMessage(PORTAL_PREVIEW_MESSAGE_PAGE_RUNTIME, {
      templateId: 'tpl-1',
      tabId: 'tab-1',
      settings: nextSettings,
      component: []
    });
    await flushAsync();

    const contentMain = wrapper.find('.content-main');
    expect(contentMain.attributes('style')).toContain('margin-top: -24px;');

    wrapper.unmount();
  });
});
