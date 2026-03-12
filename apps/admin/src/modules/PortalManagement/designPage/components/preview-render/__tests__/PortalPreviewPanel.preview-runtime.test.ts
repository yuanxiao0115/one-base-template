import { describe, expect, it, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, nextTick } from 'vue';

import PortalPreviewPanel from '../PortalPreviewPanel.vue';
import { normalizePortalPageSettingsV2, type PortalPageSettingsV2 } from '@one-base-template/portal-engine';

const apiMocks = vi.hoisted(() => ({
  tabPublicDetail: vi.fn(),
  tabDetail: vi.fn(),
  templateDetail: vi.fn(),
}));

vi.mock('@/modules/PortalManagement/api', () => ({
  portalApi: {
    tabPublic: {
      detail: apiMocks.tabPublicDetail,
    },
    tab: {
      detail: apiMocks.tabDetail,
    },
    template: {
      detail: apiMocks.templateDetail,
    },
  },
}));

vi.mock('@/modules/PortalManagement/materials/useMaterials', () => ({
  useMaterials: () => ({
    materialsMap: {},
  }),
}));

vi.mock('@one-base-template/portal-engine', async () => {
  const actual = await vi.importActual<typeof import('@one-base-template/portal-engine')>('@one-base-template/portal-engine');

  return {
    ...actual,
    PortalGridRenderer: defineComponent({
      name: 'PortalGridRenderer',
      props: {
        pageSettingData: {
          type: Object,
          required: true,
        },
      },
      template: '<div data-testid="portal-grid-renderer" :data-settings="JSON.stringify(pageSettingData)"></div>',
    }),
  };
});

function createInitialSettings(): PortalPageSettingsV2 {
  return normalizePortalPageSettingsV2({
    version: '2.0',
    basic: {
      pageTitle: '初始标题',
      slug: 'init-page',
      isVisible: true,
    },
    layoutMode: 'header-fixed-content-scroll',
    layout: {
      colNum: 12,
      colSpace: 16,
      rowSpace: 16,
    },
    layoutContainer: {
      widthMode: 'fixed',
      fixedWidth: 1200,
      customWidth: 1200,
      contentAlign: 'center',
      contentMinHeight: 720,
      overflowMode: 'auto',
    },
    spacing: {
      marginTop: 0,
      marginRight: 0,
      marginBottom: 0,
      marginLeft: 0,
      paddingTop: 8,
      paddingRight: 8,
      paddingBottom: 8,
      paddingLeft: 8,
    },
    background: {
      scope: 'page',
      backgroundColor: '#ffffff',
      backgroundImage: '',
      backgroundRepeat: 'no-repeat',
      backgroundSizeMode: 'cover',
      backgroundSizeCustom: '100% 100%',
      backgroundPosition: 'center center',
      backgroundAttachment: 'scroll',
      overlayColor: '#000000',
      overlayOpacity: 0,
    },
    banner: {
      enabled: false,
      image: '',
      height: 220,
      fullWidth: false,
      linkUrl: '',
      overlayColor: '#000000',
      overlayOpacity: 0,
    },
    headerFooterBehavior: {
      headerSticky: true,
      headerOffsetTop: 0,
      footerMode: 'normal',
      footerFixedHeight: 80,
    },
    responsive: {
      pad: {
        enabled: false,
        maxWidth: 1200,
        colNum: 12,
        colSpace: 12,
        rowSpace: 12,
        marginTop: 0,
        marginRight: 0,
        marginBottom: 0,
        marginLeft: 0,
        paddingTop: 8,
        paddingRight: 8,
        paddingBottom: 8,
        paddingLeft: 8,
        bannerHeight: 200,
      },
      mobile: {
        enabled: false,
        maxWidth: 768,
        colNum: 8,
        colSpace: 8,
        rowSpace: 8,
        marginTop: 0,
        marginRight: 0,
        marginBottom: 0,
        marginLeft: 0,
        paddingTop: 8,
        paddingRight: 8,
        paddingBottom: 8,
        paddingLeft: 8,
        bannerHeight: 180,
      },
    },
    access: {
      mode: 'public',
      roleIds: [],
    },
    publishGuard: {
      requireTitle: true,
      requireContent: true,
    },
  });
}

function createUpdatedSettings(): PortalPageSettingsV2 {
  return normalizePortalPageSettingsV2({
    version: '2.0',
    basic: {
      pageTitle: '实时配置标题',
      slug: 'live-config',
      isVisible: false,
    },
    layoutMode: 'header-fixed-footer-fixed-content-scroll',
    layout: {
      colNum: 24,
      colSpace: 18,
      rowSpace: 20,
    },
    layoutContainer: {
      widthMode: 'custom',
      fixedWidth: 1280,
      customWidth: 940,
      contentAlign: 'left',
      contentMinHeight: 960,
      overflowMode: 'scroll',
    },
    spacing: {
      marginTop: 12,
      marginRight: 18,
      marginBottom: 22,
      marginLeft: 26,
      paddingTop: 14,
      paddingRight: 16,
      paddingBottom: 24,
      paddingLeft: 28,
    },
    background: {
      scope: 'content',
      backgroundColor: '#ffe5cc',
      backgroundImage: 'https://example.com/bg.png',
      backgroundRepeat: 'repeat-x',
      backgroundSizeMode: 'custom',
      backgroundSizeCustom: '100% 260px',
      backgroundPosition: 'left top',
      backgroundAttachment: 'fixed',
      overlayColor: '#123456',
      overlayOpacity: 0.35,
    },
    banner: {
      enabled: true,
      image: 'https://example.com/banner.png',
      height: 360,
      fullWidth: true,
      linkUrl: 'https://example.com',
      overlayColor: '#654321',
      overlayOpacity: 0.4,
    },
    headerFooterBehavior: {
      headerSticky: false,
      headerOffsetTop: 42,
      footerMode: 'fixed',
      footerFixedHeight: 132,
    },
    responsive: {
      pad: {
        enabled: true,
        maxWidth: 1180,
        colNum: 16,
        colSpace: 14,
        rowSpace: 14,
        marginTop: 8,
        marginRight: 10,
        marginBottom: 12,
        marginLeft: 10,
        paddingTop: 6,
        paddingRight: 8,
        paddingBottom: 10,
        paddingLeft: 8,
        bannerHeight: 300,
      },
      mobile: {
        enabled: true,
        maxWidth: 780,
        colNum: 10,
        colSpace: 6,
        rowSpace: 7,
        marginTop: 4,
        marginRight: 6,
        marginBottom: 8,
        marginLeft: 6,
        paddingTop: 5,
        paddingRight: 7,
        paddingBottom: 9,
        paddingLeft: 7,
        bannerHeight: 240,
      },
    },
    access: {
      mode: 'role',
      roleIds: ['role-a', 'role-b'],
    },
    publishGuard: {
      requireTitle: false,
      requireContent: false,
    },
  });
}

function createLayoutModeSettings(
  layoutMode: PortalPageSettingsV2['layoutMode'],
  options?: {
    headerSticky?: boolean;
    footerMode?: PortalPageSettingsV2['headerFooterBehavior']['footerMode'];
    widthMode?: PortalPageSettingsV2['layoutContainer']['widthMode'];
    contentAlign?: PortalPageSettingsV2['layoutContainer']['contentAlign'];
    overflowMode?: PortalPageSettingsV2['layoutContainer']['overflowMode'];
  }
): PortalPageSettingsV2 {
  return normalizePortalPageSettingsV2({
    ...createInitialSettings(),
    layoutMode,
    headerFooterBehavior: {
      ...createInitialSettings().headerFooterBehavior,
      headerSticky: options?.headerSticky ?? false,
      footerMode: options?.footerMode ?? 'normal',
    },
    layoutContainer: {
      ...createInitialSettings().layoutContainer,
      widthMode: options?.widthMode ?? 'fixed',
      contentAlign: options?.contentAlign ?? 'center',
      fixedWidth: 960,
      customWidth: 960,
      overflowMode: options?.overflowMode ?? 'auto',
    },
  });
}

const initialSettings = createInitialSettings();
const updatedSettings = createUpdatedSettings();
const initialLayout = [{ i: 'cmp-1', x: 0, y: 0, w: 6, h: 2, component: {} }];
const updatedLayout = [{ i: 'cmp-live', x: 2, y: 1, w: 8, h: 3, component: {} }];

async function flushAsync() {
  await Promise.resolve();
  await nextTick();
  await new Promise((resolve) => setTimeout(resolve, 0));
}

function getByPath(target: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (!acc || typeof acc !== 'object') {
      return undefined;
    }
    return (acc as Record<string, unknown>)[key];
  }, target);
}

describe('PortalPreviewPanel preview runtime message', () => {
  beforeEach(() => {
    apiMocks.tabPublicDetail.mockReset();
    apiMocks.tabDetail.mockReset();
    apiMocks.templateDetail.mockReset();

    apiMocks.tabPublicDetail.mockResolvedValue({
      code: 200,
      success: true,
      data: {
        id: 'tab-1',
        templateId: 'tpl-1',
        pageLayout: JSON.stringify({
          settings: initialSettings,
          component: initialLayout,
        }),
      },
    });

    apiMocks.tabDetail.mockResolvedValue({
      code: 200,
      success: true,
      data: {
        id: 'tab-1',
        templateId: 'tpl-1',
        pageLayout: JSON.stringify({
          settings: initialSettings,
          component: initialLayout,
        }),
      },
    });

    apiMocks.templateDetail.mockResolvedValue({
      code: 200,
      success: true,
      data: {
        id: 'tpl-1',
        details: '{}',
        tabList: [{ id: 'tab-1', tabName: '首页', tabType: 2 }],
      },
    });
  });

  it('接收 preview-page-runtime 消息后，应实时更新预览 settings 与 layout', async () => {
    const wrapper = mount(PortalPreviewPanel, {
      props: {
        tabId: '',
        templateId: 'tpl-1',
        listenMessage: true,
      },
    });

    await flushAsync();
    await flushAsync();

    const panelVm = wrapper.vm as unknown as {
      applyRuntimePagePreview: (payload: {
        tabId: string;
        templateId: string;
        settings: PortalPageSettingsV2;
        component: typeof updatedLayout;
      }) => boolean;
      getRuntimeSnapshot: () => {
        settings: Record<string, unknown>;
        component: Array<Record<string, unknown>>;
      };
    };
    const applied = panelVm.applyRuntimePagePreview({
      tabId: '',
      templateId: 'tpl-1',
      settings: updatedSettings,
      component: updatedLayout,
    });
    expect(applied).toBe(true);

    await flushAsync();
    await flushAsync();

    const snapshot = panelVm.getRuntimeSnapshot();
    const renderedSettings = snapshot.settings;
    expect(snapshot.component.length).toBe(1);
    expect(snapshot.component[0]?.i).toBe('cmp-live');

    expect(getByPath(renderedSettings, 'basic.pageTitle')).toBe('实时配置标题');
    expect(getByPath(renderedSettings, 'banner.enabled')).toBe(true);
    expect(getByPath(renderedSettings, 'layoutContainer.widthMode')).toBe('custom');
    expect(getByPath(renderedSettings, 'headerFooterBehavior.footerMode')).toBe('fixed');
  });

  it('全量页面配置字段应透传到预览渲染层', async () => {
    const wrapper = mount(PortalPreviewPanel, {
      props: {
        tabId: '',
        templateId: 'tpl-1',
        listenMessage: true,
      },
    });

    await flushAsync();
    await flushAsync();

    const panelVm = wrapper.vm as unknown as {
      applyRuntimePagePreview: (payload: {
        tabId: string;
        templateId: string;
        settings: PortalPageSettingsV2;
        component: typeof updatedLayout;
      }) => boolean;
      getRuntimeSnapshot: () => {
        settings: Record<string, unknown>;
        component: Array<Record<string, unknown>>;
      };
    };
    const applied = panelVm.applyRuntimePagePreview({
      tabId: '',
      templateId: 'tpl-1',
      settings: updatedSettings,
      component: updatedLayout,
    });
    expect(applied).toBe(true);

    await flushAsync();
    await flushAsync();

    const snapshot = panelVm.getRuntimeSnapshot();
    const renderedSettings = snapshot.settings;

    const checks: Array<[path: string, expected: unknown]> = [
      ['basic.pageTitle', '实时配置标题'],
      ['basic.slug', 'live-config'],
      ['basic.isVisible', false],
      ['layoutMode', 'header-fixed-footer-fixed-content-scroll'],
      ['layout.colNum', 24],
      ['layout.colSpace', 18],
      ['layout.rowSpace', 20],
      ['layoutContainer.widthMode', 'custom'],
      ['layoutContainer.fixedWidth', 1280],
      ['layoutContainer.customWidth', 940],
      ['layoutContainer.contentAlign', 'left'],
      ['layoutContainer.contentMinHeight', 960],
      ['layoutContainer.overflowMode', 'scroll'],
      ['spacing.marginTop', 12],
      ['spacing.marginRight', 18],
      ['spacing.marginBottom', 22],
      ['spacing.marginLeft', 26],
      ['spacing.paddingTop', 14],
      ['spacing.paddingRight', 16],
      ['spacing.paddingBottom', 24],
      ['spacing.paddingLeft', 28],
      ['background.scope', 'content'],
      ['background.backgroundColor', '#ffe5cc'],
      ['background.backgroundImage', 'https://example.com/bg.png'],
      ['background.backgroundRepeat', 'repeat-x'],
      ['background.backgroundSizeMode', 'custom'],
      ['background.backgroundSizeCustom', '100% 260px'],
      ['background.backgroundPosition', 'left top'],
      ['background.backgroundAttachment', 'fixed'],
      ['background.overlayColor', '#123456'],
      ['background.overlayOpacity', 0.35],
      ['banner.enabled', true],
      ['banner.image', 'https://example.com/banner.png'],
      ['banner.height', 360],
      ['banner.fullWidth', true],
      ['banner.linkUrl', 'https://example.com'],
      ['banner.overlayColor', '#654321'],
      ['banner.overlayOpacity', 0.4],
      ['headerFooterBehavior.headerSticky', false],
      ['headerFooterBehavior.headerOffsetTop', 42],
      ['headerFooterBehavior.footerMode', 'fixed'],
      ['headerFooterBehavior.footerFixedHeight', 132],
      ['responsive.pad.enabled', true],
      ['responsive.pad.maxWidth', 1180],
      ['responsive.pad.colNum', 16],
      ['responsive.pad.colSpace', 14],
      ['responsive.pad.rowSpace', 14],
      ['responsive.pad.marginTop', 8],
      ['responsive.pad.marginRight', 10],
      ['responsive.pad.marginBottom', 12],
      ['responsive.pad.marginLeft', 10],
      ['responsive.pad.paddingTop', 6],
      ['responsive.pad.paddingRight', 8],
      ['responsive.pad.paddingBottom', 10],
      ['responsive.pad.paddingLeft', 8],
      ['responsive.pad.bannerHeight', 300],
      ['responsive.mobile.enabled', true],
      ['responsive.mobile.maxWidth', 780],
      ['responsive.mobile.colNum', 10],
      ['responsive.mobile.colSpace', 6],
      ['responsive.mobile.rowSpace', 7],
      ['responsive.mobile.marginTop', 4],
      ['responsive.mobile.marginRight', 6],
      ['responsive.mobile.marginBottom', 8],
      ['responsive.mobile.marginLeft', 6],
      ['responsive.mobile.paddingTop', 5],
      ['responsive.mobile.paddingRight', 7],
      ['responsive.mobile.paddingBottom', 9],
      ['responsive.mobile.paddingLeft', 7],
      ['responsive.mobile.bannerHeight', 240],
      ['access.mode', 'role'],
      ['access.roleIds.0', 'role-a'],
      ['access.roleIds.1', 'role-b'],
      ['publishGuard.requireTitle', false],
      ['publishGuard.requireContent', false],
    ];

    for (const [path, expected] of checks) {
      expect(getByPath(renderedSettings, path), path).toEqual(expected);
    }
  });

  it('三种布局模式应切换不同容器，且页头页脚固定逻辑以页面配置为准', async () => {
    apiMocks.templateDetail.mockResolvedValueOnce({
      code: 200,
      success: true,
      data: {
        id: 'tpl-1',
        details: JSON.stringify({
          shell: {
            header: { tokens: { sticky: true } },
            footer: { behavior: { fixedMode: 'fixed' } },
          },
        }),
        tabList: [{ id: 'tab-1', tabName: '首页', tabType: 2 }],
      },
    });

    const wrapper = mount(PortalPreviewPanel, {
      props: {
        tabId: '',
        templateId: 'tpl-1',
        listenMessage: true,
      },
    });

    await flushAsync();
    await flushAsync();

    const panelVm = wrapper.vm as unknown as {
      applyRuntimePagePreview: (payload: {
        tabId: string;
        templateId: string;
        settings: PortalPageSettingsV2;
        component: typeof updatedLayout;
      }) => boolean;
    };

    const globalScrollSettings = createLayoutModeSettings('global-scroll', {
      headerSticky: false,
      footerMode: 'normal',
    });
    expect(
      panelVm.applyRuntimePagePreview({
        tabId: '',
        templateId: 'tpl-1',
        settings: globalScrollSettings,
        component: updatedLayout,
      })
    ).toBe(true);
    await flushAsync();

    expect(wrapper.find('.preview-layout--global-scroll').exists()).toBe(true);
    expect(wrapper.find('.header-wrap--sticky').exists()).toBe(false);
    expect(wrapper.find('.footer--fixed').exists()).toBe(false);

    const headerFixedSettings = createLayoutModeSettings('header-fixed-content-scroll', {
      headerSticky: true,
      footerMode: 'normal',
    });
    expect(
      panelVm.applyRuntimePagePreview({
        tabId: '',
        templateId: 'tpl-1',
        settings: headerFixedSettings,
        component: updatedLayout,
      })
    ).toBe(true);
    await flushAsync();

    expect(wrapper.find('.preview-layout--header-fixed-content-scroll').exists()).toBe(true);
    const headerWrapInHeaderFixed = wrapper.find('.header-wrap');
    expect(headerWrapInHeaderFixed.attributes('style')).toContain('position: sticky;');
    expect(wrapper.find('.footer--fixed').exists()).toBe(false);

    const headerFooterFixedSettings = createLayoutModeSettings('header-fixed-footer-fixed-content-scroll', {
      headerSticky: true,
      footerMode: 'fixed',
      overflowMode: 'hidden',
    });
    expect(
      panelVm.applyRuntimePagePreview({
        tabId: '',
        templateId: 'tpl-1',
        settings: headerFooterFixedSettings,
        component: updatedLayout,
      })
    ).toBe(true);
    await flushAsync();

    expect(wrapper.find('.preview-layout--header-footer-fixed-content-scroll').exists()).toBe(true);
    expect(wrapper.find('.footer--fixed').exists()).toBe(true);
    expect(wrapper.find('.content').attributes('style')).toContain('overflow-y: auto;');
  });

  it('preview-page-runtime 未传 component 时不应清空已有组件', async () => {
    const wrapper = mount(PortalPreviewPanel, {
      props: {
        tabId: '',
        templateId: 'tpl-1',
        listenMessage: true,
      },
    });

    await flushAsync();
    await flushAsync();

    const panelVm = wrapper.vm as unknown as {
      applyRuntimePagePreview: (payload: {
        tabId: string;
        templateId: string;
        settings: PortalPageSettingsV2;
        component?: typeof initialLayout;
      }) => boolean;
      getRuntimeSnapshot: () => {
        settings: Record<string, unknown>;
        component: Array<Record<string, unknown>>;
      };
    };

    const setupApplied = panelVm.applyRuntimePagePreview({
      tabId: '',
      templateId: 'tpl-1',
      settings: initialSettings,
      component: initialLayout,
    });
    expect(setupApplied).toBe(true);

    const applied = panelVm.applyRuntimePagePreview({
      tabId: '',
      templateId: 'tpl-1',
      settings: updatedSettings,
    });
    expect(applied).toBe(true);

    await flushAsync();

    const snapshot = panelVm.getRuntimeSnapshot();
    expect(snapshot.component.length).toBe(1);
    expect(snapshot.component[0]?.i).toBe('cmp-1');
  });

  it('内容对齐切换时，content-frame 样式应同步切换 left/center', async () => {
    const wrapper = mount(PortalPreviewPanel, {
      props: {
        tabId: '',
        templateId: 'tpl-1',
        listenMessage: true,
      },
    });

    await flushAsync();
    await flushAsync();

    const panelVm = wrapper.vm as unknown as {
      applyRuntimePagePreview: (payload: {
        tabId: string;
        templateId: string;
        settings: PortalPageSettingsV2;
        component: typeof updatedLayout;
      }) => boolean;
    };

    const leftAlignSettings = createLayoutModeSettings('header-fixed-content-scroll', {
      widthMode: 'custom',
      contentAlign: 'left',
    });
    expect(
      panelVm.applyRuntimePagePreview({
        tabId: '',
        templateId: 'tpl-1',
        settings: leftAlignSettings,
        component: [],
      })
    ).toBe(true);
    await flushAsync();

    const contentFrame = wrapper.find('.content-frame');
    expect(contentFrame.attributes('style')).toContain('justify-content: flex-start;');

    const centerAlignSettings = createLayoutModeSettings('header-fixed-content-scroll', {
      widthMode: 'custom',
      contentAlign: 'center',
    });
    expect(
      panelVm.applyRuntimePagePreview({
        tabId: '',
        templateId: 'tpl-1',
        settings: centerAlignSettings,
        component: [],
      })
    ).toBe(true);
    await flushAsync();
    expect(contentFrame.attributes('style')).toContain('justify-content: center;');
  });

  it('预览页加载后应向 opener 上报 preview-page-ready 事件', async () => {
    const postMessage = vi.fn();
    const originalOpener = window.opener;
    Object.defineProperty(window, 'opener', {
      configurable: true,
      value: {
        postMessage,
      },
    });

    const wrapper = mount(PortalPreviewPanel, {
      props: {
        tabId: 'tab-1',
        templateId: 'tpl-1',
        listenMessage: true,
      },
    });

    await flushAsync();
    await flushAsync();

    expect(postMessage).toHaveBeenCalledWith(
      {
        type: 'preview-page-ready',
        data: {
          tabId: 'tab-1',
          templateId: 'tpl-1',
        },
      },
      window.location.origin
    );

    wrapper.unmount();
    Object.defineProperty(window, 'opener', {
      configurable: true,
      value: originalOpener,
    });
  });
});
