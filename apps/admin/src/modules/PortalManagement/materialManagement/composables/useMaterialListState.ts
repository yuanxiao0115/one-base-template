import { computed, ref, watch, type Ref } from 'vue';
import { confirm, message } from '@one-base-template/ui';
import { materialApi } from '../api';
import type { MaterialRecord } from '../types';
import { createDebouncedTask } from './debounced-task';
import { createLatestRequestGuard } from './latest-request';
import { createMemoryCache } from './material-cache';
import {
  isBizSuccess,
  normalizeMaterialRows,
  normalizePageTotal,
  toIdLike
} from './material-helpers';
import { useMaterialSelection } from './useMaterialSelection';

interface UseMaterialListStateOptions {
  fodderType: Ref<number>;
  currentCategoryId: Ref<string>;
  onAfterMutation?: () => void;
}

interface MaterialPageCache {
  rows: MaterialRecord[];
  total: number;
}

const MATERIAL_CACHE_TTL_MS = 45 * 1000;

export function useMaterialListState(options: UseMaterialListStateOptions) {
  const listGuard = createLatestRequestGuard();
  const materialCache = createMemoryCache<MaterialPageCache>({ ttlMs: MATERIAL_CACHE_TTL_MS });
  const materialLoading = ref(false);
  const materialRows = ref<MaterialRecord[]>([]);
  const materialSearchKey = ref('');
  const currentPage = ref(1);
  const pageSize = ref(12);
  const total = ref(0);
  const previewVisible = ref(false);
  const previewIndex = ref(0);

  const selection = useMaterialSelection({ rows: materialRows });
  const previewList = computed(() =>
    materialRows.value.map((item) => String(item.previewUrl || '').trim()).filter(Boolean)
  );

  const pagination = computed(() => ({
    currentPage: currentPage.value,
    pageSize: pageSize.value,
    total: total.value
  }));

  function getCachePrefix() {
    return `${options.fodderType.value}:${options.currentCategoryId.value}:`;
  }

  function getCacheKey(page = currentPage.value) {
    return `${getCachePrefix()}${page}:${pageSize.value}:${materialSearchKey.value.trim()}`;
  }

  function clearMaterialCache() {
    materialCache.clear(getCachePrefix());
  }

  async function loadMaterials(page = currentPage.value, force = false) {
    const categoryId = options.currentCategoryId.value;
    if (!categoryId) {
      materialRows.value = [];
      total.value = 0;
      materialLoading.value = false;
      return;
    }

    const cacheKey = getCacheKey(page);
    if (!force) {
      const cache = materialCache.get(cacheKey);
      if (cache) {
        currentPage.value = page;
        total.value = cache.total;
        selection.applyRows(cache.rows);
        return;
      }
    }

    const requestToken = listGuard.next();
    materialLoading.value = true;
    currentPage.value = page;

    try {
      const response = await materialApi.pageMaterials({
        fodderType: options.fodderType.value,
        currentPage: currentPage.value,
        pageSize: pageSize.value,
        fodderLabelId: categoryId === '0' ? undefined : categoryId,
        searchKey: materialSearchKey.value.trim() || undefined
      });

      if (!listGuard.isLatest(requestToken)) {
        return;
      }
      if (!isBizSuccess(response)) {
        message.error(response?.message || '加载素材失败');
        materialRows.value = [];
        total.value = 0;
        return;
      }

      const rows = normalizeMaterialRows(response?.data);
      const nextTotal = normalizePageTotal(response?.data);
      if (rows.length === 0 && page > 1 && nextTotal > 0) {
        await loadMaterials(1, true);
        return;
      }

      total.value = nextTotal;
      selection.applyRows(rows);
      materialCache.set(cacheKey, { rows, total: nextTotal });
    } catch (error) {
      if (!listGuard.isLatest(requestToken)) {
        return;
      }
      message.error(error instanceof Error ? error.message : '加载素材失败');
      materialRows.value = [];
      total.value = 0;
    } finally {
      if (listGuard.isLatest(requestToken)) {
        materialLoading.value = false;
      }
    }
  }

  function openPreview(row: MaterialRecord) {
    const rowId = toIdLike(row.id);
    const idx = materialRows.value.findIndex((item) => toIdLike(item.id) === rowId);
    previewIndex.value = idx > -1 ? idx : 0;
    previewVisible.value = true;
  }

  async function removeMaterials(ids: string[]) {
    if (!ids.length) {
      return;
    }

    try {
      await confirm.warn(`确定删除选中的 ${ids.length} 条素材吗？`, '删除素材');
    } catch {
      return;
    }

    const response = await materialApi.removeMaterials({ id: ids.join(',') });
    if (!isBizSuccess(response)) {
      message.error(response?.message || '删除素材失败');
      return;
    }

    message.success('删除素材成功');
    clearMaterialCache();
    selection.clearSelection();
    const nextPage =
      materialRows.value.length <= ids.length && currentPage.value > 1
        ? currentPage.value - 1
        : currentPage.value;
    await loadMaterials(nextPage, true);
    options.onAfterMutation?.();
  }

  const searchTask = createDebouncedTask(() => {
    void loadMaterials(1, true);
  }, 300);

  watch(materialSearchKey, () => searchTask.run());

  watch(
    () => [options.fodderType.value, options.currentCategoryId.value],
    () => {
      currentPage.value = 1;
      listGuard.invalidate();
      clearMaterialCache();
      selection.clearSelection();
      void loadMaterials(1, true);
    },
    { immediate: true }
  );

  return {
    materialLoading,
    materialRows,
    materialSearchKey,
    pagination,
    previewVisible,
    previewIndex,
    previewList,
    currentPage,
    pageSize,
    selectedRowIds: selection.selectedRowIds,
    allChecked: selection.allChecked,
    loadMaterials,
    clearMaterialCache,
    clearSelection: selection.clearSelection,
    toggleRowChecked: selection.toggleRowChecked,
    toggleAllChecked: selection.toggleAllChecked,
    openPreview,
    removeMaterials
  };
}
