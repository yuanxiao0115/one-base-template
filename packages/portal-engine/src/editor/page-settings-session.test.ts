import { describe, expect, it } from 'vitest';

import { createPortalPageSettingsSession } from './page-settings-session';

interface MockSettings {
  title: string;
}

describe('portal page settings session', () => {
  function createSession() {
    return createPortalPageSettingsSession<MockSettings>({
      clone: <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T,
    });
  }

  it('应在打开时锁定 tab 并写入加载结果', () => {
    const session = createSession();

    session.prepareOpen('tab-1', 'advanced');
    expect(session.loading.value).toBe(true);
    expect(session.editingTabId.value).toBe('tab-1');
    expect(session.activeTab.value).toBe('advanced');

    session.applyLoadedDetail({
      settings: { title: '页面A' },
      components: [{ id: 'c1' }],
    });

    expect(session.loading.value).toBe(false);
    expect(session.visible.value).toBe(true);
    expect(session.form.value).toEqual({ title: '页面A' });
    expect(session.persisted.value).toEqual({ title: '页面A' });
    expect(session.components.value).toEqual([{ id: 'c1' }]);
  });

  it('关闭抽屉且存在草稿时应返回回滚指令', () => {
    const session = createSession();

    session.prepareOpen('tab-1');
    session.applyLoadedDetail({ settings: { title: '已保存' }, components: [] });
    session.markPageShellPreviewDraft('draft-details');

    const result = session.onDrawerClosed('persisted-details');

    expect(result.restoreShellDetails).toBe('persisted-details');
    expect(result.restoreRuntimeSettings).toEqual({ title: '已保存' });
    expect(session.pageShellPreviewDetailsDraft.value).toBe('');
    expect(session.editingTabId.value).toBe('');
    expect(session.activeTab.value).toBe('layout');
  });

  it('页面设置保存后关闭不应触发运行态回滚', () => {
    const session = createSession();

    session.prepareOpen('tab-1');
    session.applyLoadedDetail({ settings: { title: '旧值' }, components: [] });
    session.markPageSettingsSaved({ title: '新值' });

    const result = session.onDrawerClosed('persisted-details');

    expect(result.restoreShellDetails).toBeNull();
    expect(result.restoreRuntimeSettings).toBeNull();
    expect(session.pageSavedInRound.value).toBe(false);
    expect(session.editingTabId.value).toBe('');
  });

  it('切换当前 tab 时应清空会话并关闭抽屉', () => {
    const session = createSession();

    session.prepareOpen('tab-2', 'header');
    session.applyLoadedDetail({ settings: { title: '标题' }, components: [] });

    const result = session.resetOnCurrentTabChange();

    expect(result.shouldCloseDrawer).toBe(true);
    expect(session.visible.value).toBe(false);
    expect(session.form.value).toBeNull();
    expect(session.persisted.value).toBeNull();
    expect(session.editingTabId.value).toBe('');
    expect(session.activeTab.value).toBe('layout');
  });
});
