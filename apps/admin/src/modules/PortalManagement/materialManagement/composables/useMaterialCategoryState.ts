import { computed, reactive, ref, watch, type Ref } from 'vue';
import { confirm, message } from '@one-base-template/ui';
import { materialApi } from '../api';
import type { MaterialCategoryRecord } from '../types';
import {
  isBizSuccess,
  MATERIAL_CATEGORY_MAX_LENGTH,
  normalizeCategoryList,
  toIdLike,
  toSafeName
} from './material-helpers';
import { createDebouncedTask } from './debounced-task';
import { createLatestRequestGuard } from './latest-request';
import { createMemoryCache } from './material-cache';

interface UseMaterialCategoryStateOptions {
  fodderType: Ref<number>;
  onCategoryChanged?: () => void;
}

interface CategoryDialogForm {
  id: string;
  labelName: string;
}

const CATEGORY_CACHE_TTL_MS = 60 * 1000;

export function useMaterialCategoryState(options: UseMaterialCategoryStateOptions) {
  const listGuard = createLatestRequestGuard();
  const categoryCache = createMemoryCache<MaterialCategoryRecord[]>({
    ttlMs: CATEGORY_CACHE_TTL_MS
  });
  const categoryLoading = ref(false);
  const categorySearchKey = ref('');
  const categoryList = ref<MaterialCategoryRecord[]>([]);
  const currentCategoryId = ref('');
  const categoryDialogVisible = ref(false);
  const categoryDialogLoading = ref(false);
  const categoryDialogMode = ref<'create' | 'edit'>('create');
  const categoryDialogForm = reactive<CategoryDialogForm>({ id: '', labelName: '' });
  const categoryDialogTitle = computed(() =>
    categoryDialogMode.value === 'create' ? '新建分类' : '编辑分类'
  );

  function getCacheKey() {
    return `${options.fodderType.value}:${categorySearchKey.value.trim()}`;
  }

  function clearCategoryCache() {
    categoryCache.clear(`${options.fodderType.value}:`);
  }
  function applyCategoryList(rows: MaterialCategoryRecord[]) {
    categoryList.value = rows;
    if (rows.some((item) => toIdLike(item.id) === currentCategoryId.value)) {
      return;
    }
    const firstId = toIdLike(rows[0]?.id);
    const changed = currentCategoryId.value !== firstId;
    currentCategoryId.value = firstId;
    if (changed) {
      options.onCategoryChanged?.();
    }
  }

  async function loadCategories(force = false) {
    const cacheKey = getCacheKey();
    if (!force) {
      const cache = categoryCache.get(cacheKey);
      if (cache) {
        applyCategoryList(cache);
        return;
      }
    }
    const requestToken = listGuard.next();
    categoryLoading.value = true;
    try {
      const response = await materialApi.listCategories({
        fodderType: options.fodderType.value,
        searchKey: categorySearchKey.value.trim() || undefined
      });
      if (!listGuard.isLatest(requestToken)) {
        return;
      }
      if (!isBizSuccess(response)) {
        message.error(response?.message || '加载分类失败');
        applyCategoryList([]);
        return;
      }

      const rows = normalizeCategoryList(response?.data);
      categoryCache.set(cacheKey, rows);
      applyCategoryList(rows);
    } catch (error) {
      if (!listGuard.isLatest(requestToken)) {
        return;
      }
      message.error(error instanceof Error ? error.message : '加载分类失败');
      applyCategoryList([]);
    } finally {
      if (listGuard.isLatest(requestToken)) {
        categoryLoading.value = false;
      }
    }
  }

  function selectCategory(row: MaterialCategoryRecord) {
    const rowId = toIdLike(row.id);
    if (!rowId || rowId === currentCategoryId.value) {
      return;
    }
    currentCategoryId.value = rowId;
    options.onCategoryChanged?.();
  }

  function openCreateCategory() {
    categoryDialogMode.value = 'create';
    categoryDialogForm.id = '';
    categoryDialogForm.labelName = '';
    categoryDialogVisible.value = true;
  }

  function openEditCategory(row: MaterialCategoryRecord) {
    categoryDialogMode.value = 'edit';
    categoryDialogForm.id = toIdLike(row.id);
    categoryDialogForm.labelName = toSafeName(row.labelName);
    categoryDialogVisible.value = true;
  }

  async function submitCategory() {
    const labelName = categoryDialogForm.labelName.trim();
    if (!labelName) {
      message.warning('请输入分类名称');
      return;
    }
    if (labelName.length > MATERIAL_CATEGORY_MAX_LENGTH) {
      message.warning(`分类名称不能超过 ${MATERIAL_CATEGORY_MAX_LENGTH} 个字符`);
      return;
    }
    categoryDialogLoading.value = true;
    try {
      const isCreate = categoryDialogMode.value === 'create';
      const response = isCreate
        ? await materialApi.addCategory({ fodderType: options.fodderType.value, labelName })
        : await materialApi.updateCategory({
            id: categoryDialogForm.id,
            fodderType: options.fodderType.value,
            labelName
          });

      if (!isBizSuccess(response)) {
        message.error(response?.message || (isCreate ? '新建分类失败' : '编辑分类失败'));
        return;
      }
      categoryDialogVisible.value = false;
      message.success(isCreate ? '新建分类成功' : '编辑分类成功');
      clearCategoryCache();
      await loadCategories(true);
    } catch (error) {
      message.error(error instanceof Error ? error.message : '保存分类失败');
    } finally {
      categoryDialogLoading.value = false;
    }
  }

  async function removeCategory(row: MaterialCategoryRecord) {
    const id = toIdLike(row.id);
    if (!id) {
      return;
    }
    try {
      await confirm.warn('确定删除该分类吗？', '删除分类');
    } catch {
      return;
    }

    const response = await materialApi.removeCategory({ id });
    if (!isBizSuccess(response)) {
      message.error(response?.message || '删除分类失败');
      return;
    }

    message.success('删除分类成功');
    clearCategoryCache();
    await loadCategories(true);
  }

  const searchTask = createDebouncedTask(() => {
    void loadCategories(true);
  }, 300);
  watch(categorySearchKey, () => searchTask.run());

  watch(
    () => options.fodderType.value,
    () => {
      categorySearchKey.value = '';
      currentCategoryId.value = '';
      listGuard.invalidate();
      clearCategoryCache();
      void loadCategories(true);
    },
    { immediate: true }
  );

  return {
    categoryLoading,
    categorySearchKey,
    categoryList,
    currentCategoryId,
    categoryDialogVisible,
    categoryDialogLoading,
    categoryDialogTitle,
    categoryDialogForm,
    loadCategories,
    selectCategory,
    openCreateCategory,
    openEditCategory,
    submitCategory,
    removeCategory,
    clearCategoryCache
  };
}
