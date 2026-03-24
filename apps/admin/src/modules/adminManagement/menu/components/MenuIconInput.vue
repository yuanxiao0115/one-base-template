<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { Grid } from '@element-plus/icons-vue';
import { getMenuIconifyNames, type MenuIconifyPrefix } from '@one-base-template/ui';
import { message } from '@one-base-template/ui';
import {
  buildMenuIconfontValue,
  MENU_ICONFONT_SOURCES,
  type MenuIconfontSource,
  type MenuIconfontSourceKey,
  normalizeIconfontClass
} from '../constants/iconfont-sources';

type MenuIconSelectorTab = MenuIconfontSourceKey | MenuIconifyPrefix;

interface IconfontJsonGlyph {
  name?: string;
  font_class?: string;
}

interface IconfontJsonResponse {
  glyphs?: IconfontJsonGlyph[];
}

interface MenuIconCandidate {
  key: string;
  name: string;
  icon: string;
  searchText: string;
}

interface MenuIconTabOption {
  key: MenuIconSelectorTab;
  label: string;
}

const props = withDefaults(
  defineProps<{
    disabled?: boolean;
    placeholder?: string;
  }>(),
  {
    disabled: false,
    placeholder: '支持 class / url / minio id / ep:* / ri:*'
  }
);

const model = defineModel<string>({ required: true });

const pageSize = ref(35);
const dialogVisible = ref(false);
const iconfontLoading = ref(false);
const iconifyLoading = reactive<Record<MenuIconifyPrefix, boolean>>({
  ep: false,
  ri: false
});
const activeTab = ref<MenuIconSelectorTab>('cp');
const keyword = ref('');
const currentPage = ref(1);
const draftValue = ref('');

const iconfontCandidates = reactive<Record<MenuIconfontSourceKey, MenuIconCandidate[]>>({
  cp: [],
  dj: [],
  om: [],
  od: []
});

const ICON_TAB_OPTIONS: MenuIconTabOption[] = [
  {
    key: 'cp',
    label: 'CP（产品 Iconfont）'
  },
  {
    key: 'dj',
    label: 'DJ（党建 Iconfont）'
  },
  {
    key: 'om',
    label: 'OM（OM Iconfont）'
  },
  {
    key: 'od',
    label: 'OD（公文 Iconfont）'
  },
  {
    key: 'ep',
    label: 'EP（Element Plus）'
  },
  {
    key: 'ri',
    label: 'RI（Remix Icon）'
  }
];

const TAB_ABBR_HINT =
  'CP=产品 Iconfont · DJ=党建 Iconfont · OM=OM Iconfont · OD=公文 Iconfont · EP=Element Plus · RI=Remix Icon';

const iconifyCandidates = reactive<Record<MenuIconifyPrefix, MenuIconCandidate[]>>({
  ep: [],
  ri: []
});

const iconfontCandidateCache = new Map<MenuIconfontSourceKey, MenuIconCandidate[]>();
const iconifyCandidateCache = new Map<MenuIconifyPrefix, MenuIconCandidate[]>();
const iconifyLoadTasks = new Map<MenuIconifyPrefix, Promise<void>>();
let iconfontLoadTask: Promise<void> | null = null;

const activeCandidates = computed(() => {
  const tab = activeTab.value;
  if (isIconfontTab(tab)) {
    return iconfontCandidates[tab];
  }

  return iconifyCandidates[tab];
});

const normalizedKeyword = computed(() => keyword.value.trim().toLowerCase());

const filteredCandidates = computed(() => {
  const filterText = normalizedKeyword.value;
  if (!filterText) {
    return activeCandidates.value;
  }

  return activeCandidates.value.filter((candidate) => candidate.searchText.includes(filterText));
});

const total = computed(() => filteredCandidates.value.length);
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)));

const pageCandidates = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredCandidates.value.slice(start, start + pageSize.value);
});

function buildIconifyCandidates(prefix: MenuIconifyPrefix, names: string[]): MenuIconCandidate[] {
  return names.map((name) => {
    const icon = `${prefix}:${name}`;
    return {
      key: icon,
      name,
      icon,
      searchText: `${name} ${icon}`.toLowerCase()
    };
  });
}

async function ensureIconifyLoaded(prefix: MenuIconifyPrefix) {
  const cached = iconifyCandidateCache.get(prefix);
  if (cached) {
    iconifyCandidates[prefix] = cached;
    return;
  }

  const pending = iconifyLoadTasks.get(prefix);
  if (pending) {
    await pending;
    return;
  }

  iconifyLoading[prefix] = true;
  const task = getMenuIconifyNames(prefix)
    .then((names) => {
      const list = buildIconifyCandidates(prefix, names);
      iconifyCandidateCache.set(prefix, list);
      iconifyCandidates[prefix] = list;
    })
    .finally(() => {
      iconifyLoadTasks.delete(prefix);
      iconifyLoading[prefix] = false;
    });

  iconifyLoadTasks.set(prefix, task);
  await task;
}

function isIconfontTab(tab: MenuIconSelectorTab): tab is MenuIconfontSourceKey {
  return tab === 'cp' || tab === 'dj' || tab === 'om' || tab === 'od';
}

function detectDefaultTab(iconValue: string): MenuIconSelectorTab {
  const value = iconValue.trim();
  if (value.startsWith('ep:')) {
    return 'ep';
  }
  if (value.startsWith('ri:')) {
    return 'ri';
  }

  if (value.includes('iconfont-od') || value.includes('icon-huishouzhan')) {
    return 'od';
  }

  if (value.includes('dj-icons') || value.includes('dj-icon-')) {
    return 'dj';
  }

  if (value.includes('i-icon-menu') || value.includes('i-icon-')) {
    return 'om';
  }

  return 'cp';
}

async function loadIconfontCandidates(source: MenuIconfontSource): Promise<MenuIconCandidate[]> {
  const cached = iconfontCandidateCache.get(source.key);
  if (cached) {
    return cached;
  }

  const response = await fetch(source.jsonPath, { cache: 'force-cache' });
  if (!response.ok) {
    throw new Error(`加载图标资源失败：${source.jsonPath}`);
  }

  const payload = (await response.json()) as IconfontJsonResponse;
  const glyphs = Array.isArray(payload.glyphs) ? payload.glyphs : [];

  const candidates = glyphs
    .map((glyph) => {
      const fontClass = normalizeIconfontClass(source, glyph.font_class ?? '');
      const iconValue = buildMenuIconfontValue(source, fontClass);
      if (!(fontClass && iconValue)) {
        return null;
      }

      const label = (glyph.name ?? '').trim() || fontClass;
      return {
        key: `${source.key}:${fontClass}`,
        name: label,
        icon: iconValue,
        searchText: `${label} ${fontClass} ${iconValue}`.toLowerCase()
      };
    })
    .filter((candidate): candidate is MenuIconCandidate => Boolean(candidate));

  iconfontCandidateCache.set(source.key, candidates);
  return candidates;
}

async function ensureIconfontLoaded() {
  const hasLoadedAll = MENU_ICONFONT_SOURCES.every((source) =>
    iconfontCandidateCache.has(source.key)
  );
  if (hasLoadedAll) {
    MENU_ICONFONT_SOURCES.forEach((source) => {
      iconfontCandidates[source.key] = iconfontCandidateCache.get(source.key) ?? [];
    });
    return;
  }

  if (iconfontLoadTask) {
    await iconfontLoadTask;
    return;
  }

  iconfontLoading.value = true;
  iconfontLoadTask = Promise.all(
    MENU_ICONFONT_SOURCES.map(async (source) => {
      const list = await loadIconfontCandidates(source);
      iconfontCandidates[source.key] = list;
    })
  )
    .then(() => {
      iconfontLoadTask = null;
    })
    .catch((error) => {
      iconfontLoadTask = null;
      throw error;
    });

  try {
    await iconfontLoadTask;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '加载 iconfont 图标失败';
    message.error(errorMessage);
  } finally {
    iconfontLoading.value = false;
  }
}

async function openSelectorDialog() {
  if (props.disabled) {
    return;
  }

  draftValue.value = (model.value ?? '').trim();
  activeTab.value = detectDefaultTab(draftValue.value);
  keyword.value = '';
  currentPage.value = 1;
  dialogVisible.value = true;

  await ensureIconfontLoaded();
  if (!isIconfontTab(activeTab.value)) {
    try {
      await ensureIconifyLoaded(activeTab.value);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '加载 Iconify 图标失败';
      message.error(errorMessage);
    }
  }
}

function handleDialogClose() {
  keyword.value = '';
  currentPage.value = 1;
}

function setDraftIcon(iconValue: string) {
  draftValue.value = iconValue;
}

function applySelectedIcon() {
  model.value = draftValue.value.trim();
  dialogVisible.value = false;
}

function clearDraftValue() {
  draftValue.value = '';
}

function clearModelValue() {
  if (props.disabled) {
    return;
  }

  model.value = '';
  draftValue.value = '';
}

function onCurrentChange(page: number) {
  currentPage.value = page;
}

function isActiveCandidate(iconValue: string) {
  return draftValue.value.trim() === iconValue;
}

function getCandidateAriaLabel(item: MenuIconCandidate) {
  return `选择图标 ${item.name}（${item.icon}）`;
}

function isTabLoading(tab: MenuIconSelectorTab) {
  if (isIconfontTab(tab)) {
    return iconfontLoading.value;
  }

  return iconifyLoading[tab];
}

watch([activeTab, normalizedKeyword], () => {
  currentPage.value = 1;
});

watch([dialogVisible, activeTab], async ([visible, tab]) => {
  if (!(visible && !isIconfontTab(tab))) {
    return;
  }

  try {
    await ensureIconifyLoaded(tab);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '加载 Iconify 图标失败';
    message.error(errorMessage);
  }
});

watch(totalPages, (nextPages) => {
  if (currentPage.value > nextPages) {
    currentPage.value = nextPages;
  }
});
</script>

<template>
  <div class="menu-icon-input">
    <el-input
      v-model.trim="model"
      class="menu-icon-input__field"
      :disabled="props.disabled"
      :placeholder="props.placeholder"
      clearable
      @clear="clearModelValue"
    >
      <template #prefix>
        <span class="menu-icon-input__prefix-preview">
          <ObMenuIcon v-if="model" :icon="model" />
          <span v-else class="menu-icon-input__prefix-placeholder">--</span>
        </span>
      </template>
      <template #append>
        <el-button
          class="menu-icon-input__append-btn"
          :disabled="props.disabled"
          :icon="Grid"
          title="选择图标"
          aria-label="选择图标"
          @click="openSelectorDialog"
        />
      </template>
    </el-input>

    <el-dialog
      v-model="dialogVisible"
      width="min(980px, calc(100vw - 32px))"
      title="选择图标"
      append-to-body
      @close="handleDialogClose"
    >
      <el-input
        v-model="keyword"
        placeholder="支持按名称、类名、图标值搜索"
        clearable
        class="menu-icon-input__search"
      />
      <p class="menu-icon-input__tab-hint">{{ TAB_ABBR_HINT }}</p>

      <el-tabs v-model="activeTab" class="menu-icon-input__tabs">
        <el-tab-pane
          v-for="tab in ICON_TAB_OPTIONS"
          :key="tab.key"
          :label="tab.label"
          :name="tab.key"
        >
          <div v-loading="isTabLoading(tab.key)" class="menu-icon-input__panel">
            <template v-if="pageCandidates.length > 0">
              <button
                v-for="item in pageCandidates"
                :key="item.key"
                type="button"
                class="menu-icon-input__item"
                :class="{ 'is-active': isActiveCandidate(item.icon) }"
                :title="item.icon"
                :aria-label="getCandidateAriaLabel(item)"
                :aria-pressed="isActiveCandidate(item.icon)"
                @click="() => setDraftIcon(item.icon)"
              >
                <span class="menu-icon-input__item-preview">
                  <ObMenuIcon :icon="item.icon" />
                </span>
                <span class="menu-icon-input__item-name">{{ item.name }}</span>
                <span class="menu-icon-input__item-icon">{{ item.icon }}</span>
              </button>
            </template>

            <el-empty v-else description="未找到匹配图标" :image-size="72" />
          </div>
        </el-tab-pane>
      </el-tabs>

      <div class="menu-icon-input__dialog-footer">
        <el-pagination
          :current-page
          :page-size
          :total
          background
          layout="prev, pager, next"
          :pager-count="7"
          @current-change="onCurrentChange"
        />

        <div class="menu-icon-input__dialog-actions">
          <el-button @click="clearDraftValue">清空已选</el-button>
          <el-button type="primary" @click="applySelectedIcon">应用图标</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<style src="./MenuIconInput.css" scoped></style>
