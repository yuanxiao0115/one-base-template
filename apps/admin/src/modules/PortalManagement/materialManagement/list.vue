<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { message } from '@one-base-template/ui';
import type { MaterialRecord } from './types';
import { toIdLike } from './composables/material-helpers';
import { useMaterialCategoryState } from './composables/useMaterialCategoryState';
import { useMaterialListState } from './composables/useMaterialListState';
import MaterialCategoryDialog from './components/MaterialCategoryDialog.vue';
import MaterialEditDialog from './components/MaterialEditDialog.vue';
import MaterialUploadDialog from './components/MaterialUploadDialog.vue';

defineOptions({
  name: 'PortalMaterialManagement'
});

const activeTab = ref<'image' | 'icon'>('image');
const editDialogVisible = ref(false);
const editMaterialId = ref('');
const uploadDialogVisible = ref(false);

const fodderType = computed(() => (activeTab.value === 'image' ? 1 : 2));

const currentCategoryId = ref('');

const listState = useMaterialListState({
  fodderType,
  currentCategoryId,
  onAfterMutation: async () => {
    categoryState.clearCategoryCache();
    await categoryState.loadCategories(true);
  }
});

const categoryState = useMaterialCategoryState({
  fodderType,
  onCategoryChanged: () => {
    listState.clearSelection();
  }
});

watch(categoryState.currentCategoryId, (value) => {
  currentCategoryId.value = value;
});

const selectedIds = computed(() => listState.selectedRowIds.value.filter(Boolean));

function openUploadDialog() {
  uploadDialogVisible.value = true;
}

function openEditDialog(row: MaterialRecord) {
  const id = toIdLike(row.id);
  if (!id) {
    return;
  }
  editMaterialId.value = id;
  editDialogVisible.value = true;
}

async function deleteSingle(row: MaterialRecord) {
  const id = toIdLike(row.id);
  if (!id) {
    return;
  }
  await listState.removeMaterials([id]);
}

async function deleteBatch() {
  if (!selectedIds.value.length) {
    message.warning('请先勾选素材');
    return;
  }
  await listState.removeMaterials(selectedIds.value);
}

async function refreshAll() {
  categoryState.clearCategoryCache();
  listState.clearMaterialCache();
  await categoryState.loadCategories(true);
  await listState.loadMaterials(1, true);
}

async function handleUploaded() {
  listState.clearMaterialCache();
  categoryState.clearCategoryCache();
  await categoryState.loadCategories(true);
  await listState.loadMaterials(1, true);
}

async function handleUpdated() {
  listState.clearMaterialCache();
  categoryState.clearCategoryCache();
  await categoryState.loadCategories(true);
  await listState.loadMaterials(listState.currentPage.value, true);
}

function onTabChange(value: string | number | boolean | undefined) {
  activeTab.value = value === 'icon' ? 'icon' : 'image';
  categoryState.categorySearchKey.value = '';
  listState.materialSearchKey.value = '';
}

function handleCurrentPageChange(page: number) {
  void listState.loadMaterials(Number(page), true);
}

function handlePageSizeChange(size: number) {
  listState.pageSize.value = Number(size);
  void listState.loadMaterials(1, true);
}
</script>

<template>
  <ObPageContainer padding="0" overflow="hidden" left-width="268px">
    <template #left>
      <section class="material-category">
        <div class="material-category__head">
          <div>
            <p class="material-category__title">素材分类</p>
            <p class="material-category__sub">
              共 {{ categoryState.categoryList.value.length }} 项
            </p>
          </div>
          <el-radio-group :model-value="activeTab" size="small" @change="onTabChange">
            <el-radio-button label="image" value="image">图片</el-radio-button>
            <el-radio-button label="icon" value="icon">图标</el-radio-button>
          </el-radio-group>
        </div>

        <el-input
          v-model.trim="categoryState.categorySearchKey.value"
          clearable
          placeholder="搜索分类"
          class="material-category__search"
        />

        <el-scrollbar
          v-loading="categoryState.categoryLoading.value"
          class="material-category__list"
        >
          <button
            v-for="item in categoryState.categoryList.value"
            :key="String(item.id || '')"
            type="button"
            class="material-category__item"
            :class="{ active: String(item.id || '') === categoryState.currentCategoryId.value }"
            @click="categoryState.selectCategory(item)"
          >
            <span class="material-category__name">{{ item.labelName }}</span>
            <span class="material-category__count">{{ item.count || 0 }}</span>
            <span class="material-category__actions">
              <el-button
                link
                type="primary"
                size="small"
                @click.stop="categoryState.openEditCategory(item)"
                >编辑</el-button
              >
              <el-button
                link
                type="danger"
                size="small"
                @click.stop="categoryState.removeCategory(item)"
                >删除</el-button
              >
            </span>
          </button>
        </el-scrollbar>

        <el-button
          type="primary"
          plain
          class="material-category__create"
          @click="categoryState.openCreateCategory"
          >新建分类</el-button
        >
      </section>
    </template>

    <section class="material-main">
      <ObCardTable
        :data="listState.materialRows.value"
        :loading="listState.materialLoading.value"
        :pagination="listState.pagination.value"
        :page-sizes="[12, 24, 48]"
        min-card-width="210px"
        gap="14px"
        empty-description="暂无素材"
        @page-current-change="handleCurrentPageChange"
        @page-size-change="handlePageSizeChange"
      >
        <template #toolbar>
          <div class="material-toolbar">
            <div class="material-toolbar__head">
              <div>
                <p class="material-toolbar__title">素材列表</p>
                <p class="material-toolbar__sub">
                  当前 {{ activeTab === 'image' ? '图片' : '图标' }}，已选
                  {{ selectedIds.length }} 项
                </p>
              </div>
              <el-button :loading="listState.materialLoading.value" @click="refreshAll"
                >刷新</el-button
              >
            </div>

            <div class="material-toolbar__actions">
              <el-input
                v-model.trim="listState.materialSearchKey.value"
                clearable
                placeholder="搜索素材名称"
                class="material-toolbar__search"
              />
              <div class="material-toolbar__buttons">
                <el-checkbox
                  :model-value="listState.allChecked.value"
                  @change="listState.toggleAllChecked(Boolean($event))"
                  >全选</el-checkbox
                >
                <el-button :disabled="!selectedIds.length" @click="deleteBatch">批量删除</el-button>
                <el-button type="primary" @click="openUploadDialog">上传素材</el-button>
              </div>
            </div>
          </div>
        </template>

        <template #default="{ row }">
          <article
            class="material-card"
            v-memo="[
              row.id,
              row.checked,
              row.fodderName,
              row.fodderLabelName,
              row.previewUrl,
              row.fileType
            ]"
          >
            <div class="material-card__preview" @click="listState.openPreview(row)">
              <span class="material-card__tag">{{
                row.fileType || (activeTab === 'image' ? '图片' : '图标')
              }}</span>
              <el-image
                v-if="row.previewUrl"
                :src="row.previewUrl"
                loading="lazy"
                fit="contain"
                class="material-card__image"
              />
              <div v-else class="material-card__image material-card__image--empty">无预览</div>
            </div>

            <div class="material-card__meta">
              <div class="material-card__name" :title="row.fodderName || '-'">
                {{ row.fodderName || '-' }}
              </div>
              <div class="material-card__sub" :title="row.fodderLabelName || '暂未分类'">
                {{ row.fodderLabelName || '暂未分类' }}
              </div>
            </div>

            <div class="material-card__footer">
              <el-checkbox
                :model-value="Boolean(row.checked)"
                @change="listState.toggleRowChecked(row, Boolean($event))"
              />
              <ObActionButtons>
                <el-button link type="primary" size="small" @click="openEditDialog(row)"
                  >编辑</el-button
                >
                <el-button link size="small" @click="listState.openPreview(row)">预览</el-button>
                <el-button link type="danger" size="small" @click="deleteSingle(row)"
                  >删除</el-button
                >
              </ObActionButtons>
            </div>
          </article>
        </template>
      </ObCardTable>
    </section>

    <el-image-viewer
      v-if="listState.previewVisible.value"
      :url-list="listState.previewList.value"
      :initial-index="listState.previewIndex.value"
      :hide-on-click-modal="true"
      @close="listState.previewVisible.value = false"
    />

    <MaterialCategoryDialog
      v-model="categoryState.categoryDialogVisible.value"
      :title="categoryState.categoryDialogTitle.value"
      :loading="categoryState.categoryDialogLoading.value"
      :label-name="categoryState.categoryDialogForm.labelName"
      @update:label-name="categoryState.categoryDialogForm.labelName = $event"
      @confirm="categoryState.submitCategory"
    />

    <MaterialUploadDialog
      v-model="uploadDialogVisible"
      :fodder-type="fodderType"
      :default-category-id="categoryState.currentCategoryId.value"
      :categories="categoryState.categoryList.value"
      @uploaded="handleUploaded"
    />

    <MaterialEditDialog
      v-model="editDialogVisible"
      :material-id="editMaterialId"
      :fodder-type="fodderType"
      :categories="categoryState.categoryList.value"
      @updated="handleUpdated"
    />
  </ObPageContainer>
</template>

<style scoped>
:deep(.ob-page-container__main) {
  padding: 12px 12px 0;
  background: #fff;
}

:deep(.ob-page-container__left) {
  padding: 12px;
  margin-right: 16px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.material-category {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  gap: 12px;
}

.material-category__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

.material-category__title {
  margin: 0;
  color: var(--el-text-color-primary);
  font-size: 14px;
  font-weight: 600;
}

.material-category__sub {
  margin: 4px 0 0;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.material-category__search {
  flex-shrink: 0;
}

.material-category__list {
  flex: 1;
  min-height: 0;
  padding-right: 2px;
}

.material-category__item {
  width: 100%;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 10px 12px;
  margin-bottom: 10px;
  text-align: left;
  display: grid;
  grid-template-columns: 1fr auto;
  row-gap: 6px;
  background: var(--el-fill-color-extra-light);
  transition: border-color 0.2s ease;
}

.material-category__item:hover {
  border-color: var(--el-border-color);
}

.material-category__item.active {
  border-color: var(--el-color-primary);
  background: #f5f8fd;
}

.material-category__name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--el-text-color-primary);
  font-weight: 600;
}

.material-category__count {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.material-category__actions {
  grid-column: 1 / span 2;
  justify-self: end;
}

.material-category__create {
  width: 100%;
}

.material-main {
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 12px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.material-main :deep(.ob-card-table) {
  flex: 1;
  min-height: 0;
  height: 100%;
}

.material-toolbar {
  display: grid;
  gap: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #ebeef5;
}

.material-toolbar__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.material-toolbar__title {
  margin: 0;
  color: var(--el-text-color-primary);
  font-size: 22px;
  font-weight: 600;
}

.material-toolbar__sub {
  margin: 6px 0 0;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.material-toolbar__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.material-toolbar__search {
  max-width: 360px;
}

.material-toolbar__buttons {
  display: flex;
  align-items: center;
  gap: 12px;
}

.material-card {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 11px;
  display: grid;
  grid-template-rows: auto auto auto;
  gap: 10px;
  background: #fff;
  transition: border-color 0.22s ease;
  content-visibility: auto;
  contain-intrinsic-size: 220px;
}

.material-card:hover {
  border-color: var(--el-border-color);
}

.material-card__preview {
  position: relative;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  overflow: hidden;
  cursor: zoom-in;
  background: var(--el-fill-color-extra-light);
}

.material-card__tag {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  background: rgb(15 23 42 / 62%);
  color: #f8fafc;
  font-size: 11px;
  line-height: 1;
}

.material-card__image {
  width: 100%;
  height: 142px;
  display: block;
}

.material-card__image--empty {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-light);
}

.material-card__meta {
  min-width: 0;
}

.material-card__name {
  color: var(--el-text-color-primary);
  font-weight: 600;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.material-card__sub {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.material-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

@media (width <= 1024px) {
  :deep(.ob-page-container__main) {
    padding: 10px 10px 0;
  }

  :deep(.ob-page-container__left) {
    margin-right: 12px;
  }

  .material-toolbar__actions {
    flex-direction: column;
    align-items: stretch;
  }

  .material-toolbar__search {
    max-width: none;
  }

  .material-toolbar__buttons {
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;
  }
}

@media (width <= 768px) {
  :deep(.ob-page-container__left) {
    margin-right: 8px;
    padding: 10px;
  }

  .material-main {
    padding: 10px;
  }

  .material-category__head {
    flex-direction: column;
    align-items: stretch;
  }

  .material-card__image {
    height: 112px;
  }

  .material-card__footer {
    flex-wrap: wrap;
  }
}

@media (prefers-reduced-motion: reduce) {
  .material-category__item,
  .material-card {
    transition: none;
    animation: none;
  }
}
</style>
