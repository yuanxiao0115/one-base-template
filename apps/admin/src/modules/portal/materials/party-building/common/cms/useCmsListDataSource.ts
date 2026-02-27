import { onMounted, ref, type Ref } from 'vue';
import { cmsApi } from '../../../../api';

export interface CmsListItem {
  id: string;
  articleTitle: string;
  coverUrl?: string;
  linkUrl?: string;
  publishTime?: string;
}

export interface CmsListDataSourceModel<T extends CmsListItem = CmsListItem> {
  categoryId?: string;
  items: T[];
}

interface UseCmsListOptions {
  autoLoad?: boolean;
}

const defaultOptions: UseCmsListOptions = {
  autoLoad: true
};

export const useCmsListDataSource = <T extends CmsListItem>(
  modelValue: Ref<CmsListDataSourceModel<T> | undefined>,
  options: UseCmsListOptions = defaultOptions
) => {
  const resolvedOptions = { ...defaultOptions, ...options };
  const columns = ref<any[]>([]);
  const articles = ref<CmsListItem[]>([]);
  const columnsLoading = ref<boolean>(false);
  const articlesLoading = ref<boolean>(false);

  const updateModelData = (items: CmsListItem[]) => {
    if (!modelValue.value) return;
    modelValue.value.items = items as T[];
  };

  const loadColumns = async () => {
    columnsLoading.value = true;
    try {
      const res = (await cmsApi.getCategoryTree()) as any;
      if (res.code === 200) {
        columns.value = res.data;
      }
    } catch (error) {
      console.error('获取专栏列表失败', error);
    } finally {
      columnsLoading.value = false;
    }
  };

  const loadArticlesByCategory = async (categoryId: string) => {
    if (!categoryId) return;

    articlesLoading.value = true;
    try {
      const res = (await cmsApi.getUserArticlesByCategory(categoryId)) as any;
      if (res.code === 200) {
        const records = (res.data.records || []) as CmsListItem[];
        articles.value = records;
        updateModelData(records);
      }
    } catch (error) {
      console.error('获取文章列表失败', error);
    } finally {
      articlesLoading.value = false;
    }
  };

  const handleCategoryChange = async (categoryId: string) => {
    if (!categoryId) return;
    await loadArticlesByCategory(categoryId);
  };

  const handleRefresh = () => {
    if (modelValue.value?.categoryId) {
      loadArticlesByCategory(modelValue.value.categoryId);
    }
  };

  if (resolvedOptions.autoLoad) {
    onMounted(() => {
      loadColumns();
      if (modelValue.value?.categoryId) {
        loadArticlesByCategory(modelValue.value.categoryId);
      }
    });
  }

  return {
    columns,
    articles,
    columnsLoading,
    articlesLoading,
    handleCategoryChange,
    handleRefresh,
    loadColumns,
    loadArticlesByCategory
  };
};
