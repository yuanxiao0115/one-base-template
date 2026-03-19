import { ref } from 'vue';
import { describe, expect, it, vi } from 'vite-plus/test';

import { usePortalCurrentTabActions } from './current-tab-actions';

interface MockTab {
  id: string;
  tabType: number;
}

describe('portal current tab actions', () => {
  function createActions(tab: MockTab | null = null, tabId = '', templateId = 'tpl-1') {
    const notifyWarning = vi.fn();
    const onEditTab = vi.fn();
    const onOpenAttribute = vi.fn();
    const onOpenPageSettings = vi.fn();
    const onToggleHide = vi.fn();
    const onDeleteTab = vi.fn();
    const openWindow = vi.fn();
    const resolvePreviewHref = vi.fn().mockReturnValue('/portal/preview?tabId=tab-1');

    const actions = usePortalCurrentTabActions<MockTab, string>({
      templateId: ref(templateId),
      currentTabId: ref(tabId),
      currentTab: ref(tab),
      previewMode: ref('safe'),
      resolvePreviewHref,
      isTabEditable: (current) => current.tabType === 2,
      notifyWarning,
      onEditTab,
      onOpenAttribute,
      onOpenPageSettings,
      onToggleHide,
      onDeleteTab,
      openWindow
    });

    return {
      actions,
      notifyWarning,
      onEditTab,
      onOpenAttribute,
      onOpenPageSettings,
      onToggleHide,
      onDeleteTab,
      openWindow,
      resolvePreviewHref
    };
  }

  it('编辑时无选中页或不可编辑应提示', () => {
    const emptyCase = createActions(null, 'tab-1');
    emptyCase.actions.editCurrentTab();
    expect(emptyCase.notifyWarning).toHaveBeenCalledWith('请先选择可编辑页面');

    const readonlyCase = createActions({ id: 'tab-1', tabType: 1 }, 'tab-1');
    readonlyCase.actions.editCurrentTab();
    expect(readonlyCase.notifyWarning).toHaveBeenCalledWith('请先选择可编辑页面');
    expect(readonlyCase.onEditTab).not.toHaveBeenCalled();
  });

  it('编辑可编辑页应触发 onEditTab', () => {
    const { actions, onEditTab, notifyWarning } = createActions(
      { id: 'tab-1', tabType: 2 },
      'tab-1'
    );

    actions.editCurrentTab();

    expect(onEditTab).toHaveBeenCalledWith('tab-1');
    expect(notifyWarning).not.toHaveBeenCalled();
  });

  it('页面设置和删除/隐藏应按当前页触发', () => {
    const tab = { id: 'tab-1', tabType: 2 };
    const { actions, onOpenPageSettings, onToggleHide, onDeleteTab } = createActions(tab, 'tab-1');

    actions.openCurrentPageSettings();
    actions.toggleCurrentTabHide();
    actions.deleteCurrentTab();

    expect(onOpenPageSettings).toHaveBeenCalledWith('tab-1');
    expect(onToggleHide).toHaveBeenCalledWith(tab);
    expect(onDeleteTab).toHaveBeenCalledWith(tab);
  });

  it('预览窗口动作应检查参数并发起打开', () => {
    const missingCase = createActions({ id: 'tab-1', tabType: 2 }, '', 'tpl-1');
    missingCase.actions.openPreviewWindow();
    expect(missingCase.notifyWarning).toHaveBeenCalledWith('请先选择可预览页面');

    const okCase = createActions({ id: 'tab-1', tabType: 2 }, 'tab-1', 'tpl-1');
    okCase.actions.openPreviewWindow();

    expect(okCase.resolvePreviewHref).toHaveBeenCalledWith({
      templateId: 'tpl-1',
      tabId: 'tab-1',
      previewMode: 'safe'
    });
    expect(okCase.openWindow).toHaveBeenCalledWith(
      '/portal/preview?tabId=tab-1',
      '_blank',
      'noopener,noreferrer'
    );
  });
});
