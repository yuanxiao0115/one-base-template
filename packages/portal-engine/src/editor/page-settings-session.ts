import { ref, type Ref } from 'vue';

export type PortalPageSettingsDrawerTab = 'layout' | 'advanced' | 'header' | 'footer';

export interface PortalPageSettingsSessionCloseResult<TSettings> {
  restoreShellDetails: string | null;
  restoreRuntimeSettings: TSettings | null;
}

export interface CreatePortalPageSettingsSessionOptions {
  clone: <T>(value: T) => T;
}

export function createPortalPageSettingsSession<TSettings, TComponent = unknown>(
  options: CreatePortalPageSettingsSessionOptions
) {
  const visible = ref(false);
  const loading = ref(false);
  const saving = ref(false);
  const activeTab = ref<PortalPageSettingsDrawerTab>('layout');
  const editingTabId = ref('');

  const form = ref<TSettings | null>(null);
  const persisted = ref<TSettings | null>(null);
  const components = ref<TComponent[]>([]);

  const pageSavedInRound = ref(false);
  const pageShellSaving = ref(false);
  const pageShellSavedInRound = ref(false);
  const pageShellPreviewDirty = ref(false);
  const pageShellPreviewDetailsDraft = ref('');

  function prepareOpen(tabId: string, tab: PortalPageSettingsDrawerTab = 'layout') {
    editingTabId.value = tabId;
    activeTab.value = tab;
    loading.value = true;
  }

  function applyLoadedDetail(payload: { settings: TSettings; components: TComponent[] }) {
    persisted.value = options.clone(payload.settings);
    components.value = options.clone(payload.components);
    form.value = options.clone(payload.settings);
    pageSavedInRound.value = false;
    pageShellSavedInRound.value = false;
    pageShellPreviewDirty.value = false;
    pageShellPreviewDetailsDraft.value = '';
    visible.value = true;
    loading.value = false;
  }

  function failOpen() {
    editingTabId.value = '';
    loading.value = false;
  }

  function markPageSettingsSaved(settings: TSettings) {
    persisted.value = options.clone(settings);
    form.value = options.clone(settings);
    pageSavedInRound.value = true;
    visible.value = false;
  }

  function markPageShellPreviewDraft(details: string) {
    pageShellPreviewDetailsDraft.value = details;
    pageShellPreviewDirty.value = true;
  }

  function markPageShellSaved(details: string) {
    pageShellSavedInRound.value = true;
    pageShellPreviewDirty.value = false;
    pageShellPreviewDetailsDraft.value = details;
    visible.value = false;
  }

  function resetOnCurrentTabChange() {
    const shouldCloseDrawer = visible.value;

    loading.value = false;
    saving.value = false;
    pageShellSaving.value = false;
    persisted.value = null;
    components.value = [];
    form.value = null;
    pageSavedInRound.value = false;
    activeTab.value = 'layout';
    pageShellSavedInRound.value = false;
    pageShellPreviewDirty.value = false;
    pageShellPreviewDetailsDraft.value = '';
    editingTabId.value = '';

    if (shouldCloseDrawer) {
      visible.value = false;
    }

    return {
      shouldCloseDrawer
    };
  }

  function onDrawerOpened(currentTabId: string) {
    if (!editingTabId.value) {
      editingTabId.value = currentTabId;
    }
    pageSavedInRound.value = false;
    pageShellSavedInRound.value = false;
    pageShellPreviewDirty.value = false;
  }

  function onDrawerClosed(
    persistedDetails: string
  ): PortalPageSettingsSessionCloseResult<TSettings> {
    let restoreShellDetails: string | null = null;
    let restoreRuntimeSettings: TSettings | null = null;

    if (pageShellSavedInRound.value) {
      pageShellSavedInRound.value = false;
    } else if (pageShellPreviewDirty.value || pageShellPreviewDetailsDraft.value) {
      pageShellPreviewDetailsDraft.value = '';
      restoreShellDetails = persistedDetails;
    }

    pageShellPreviewDirty.value = false;
    activeTab.value = 'layout';

    if (pageSavedInRound.value) {
      pageSavedInRound.value = false;
      editingTabId.value = '';
      return {
        restoreShellDetails,
        restoreRuntimeSettings
      };
    }

    if (persisted.value) {
      const restored = options.clone(persisted.value);
      form.value = restored;
      restoreRuntimeSettings = restored;
    }

    editingTabId.value = '';

    return {
      restoreShellDetails,
      restoreRuntimeSettings
    };
  }

  return {
    visible,
    loading,
    saving,
    activeTab,
    editingTabId,
    form,
    persisted,
    components,
    pageSavedInRound,
    pageShellSaving,
    pageShellSavedInRound,
    pageShellPreviewDirty,
    pageShellPreviewDetailsDraft,
    prepareOpen,
    applyLoadedDetail,
    failOpen,
    markPageSettingsSaved,
    markPageShellPreviewDraft,
    markPageShellSaved,
    resetOnCurrentTabChange,
    onDrawerOpened,
    onDrawerClosed
  };
}

export type PortalPageSettingsSession<TSettings, TComponent = unknown> = ReturnType<
  typeof createPortalPageSettingsSession<TSettings, TComponent>
>;

export type PortalPageSettingsSessionState<TSettings, TComponent = unknown> = {
  visible: Ref<boolean>;
  loading: Ref<boolean>;
  saving: Ref<boolean>;
  activeTab: Ref<PortalPageSettingsDrawerTab>;
  editingTabId: Ref<string>;
  form: Ref<TSettings | null>;
  persisted: Ref<TSettings | null>;
  components: Ref<TComponent[]>;
  pageSavedInRound: Ref<boolean>;
  pageShellSaving: Ref<boolean>;
  pageShellSavedInRound: Ref<boolean>;
  pageShellPreviewDirty: Ref<boolean>;
  pageShellPreviewDetailsDraft: Ref<string>;
};
