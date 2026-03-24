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
  <ObPageContainer padding="0" overflow="hidden">
    <div class="material-management-page">
      <div class="toolbar-row">
        <el-radio-group :model-value="activeTab" @change="onTabChange">
          <el-radio-button label="image" value="image">图片</el-radio-button>
          <el-radio-button label="icon" value="icon">图标</el-radio-button>
        </el-radio-group>
        <el-button :loading="listState.materialLoading.value" @click="refreshAll">刷新</el-button>
      </div>

      <div class="material-body">
        <aside class="category-panel">
          <el-input
            v-model.trim="categoryState.categorySearchKey.value"
            clearable
            placeholder="搜索分类"
          />

          <div v-loading="categoryState.categoryLoading.value" class="category-list">
            <button
              v-for="item in categoryState.categoryList.value"
              :key="String(item.id || '')"
              type="button"
              class="category-item"
              :class="{
                active: String(item.id || '') === categoryState.currentCategoryId.value
              }"
              @click="categoryState.selectCategory(item)"
            >
              <span class="category-name">{{ item.labelName }}</span>
              <span class="category-count">{{ item.count || 0 }}</span>
              <span class="category-actions">
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
          </div>

          <el-button
            type="primary"
            plain
            class="new-category-btn"
            @click="categoryState.openCreateCategory"
            >新建分类</el-button
          >
        </aside>

        <section class="material-panel">
          <div class="material-operations">
            <el-input
              v-model.trim="listState.materialSearchKey.value"
              clearable
              placeholder="搜索素材名称"
              class="search-input"
            />

            <div class="operation-actions">
              <el-checkbox
                :model-value="listState.allChecked.value"
                @change="listState.toggleAllChecked(Boolean($event))"
                >全选</el-checkbox
              >
              <el-button :disabled="!selectedIds.length" @click="deleteBatch">批量删除</el-button>
              <el-button type="primary" @click="openUploadDialog">上传素材</el-button>
            </div>
          </div>

          <div v-loading="listState.materialLoading.value" class="material-grid-wrap">
            <el-empty v-if="!listState.materialRows.value.length" description="暂无素材" />
            <div v-else class="material-grid">
              <article
                v-for="row in listState.materialRows.value"
                :key="String(row.id || '')"
                class="card-item"
              >
                <div class="card-preview" @click="listState.openPreview(row)">
                  <el-image
                    v-if="row.previewUrl"
                    :src="row.previewUrl"
                    loading="lazy"
                    fit="contain"
                    class="preview-image"
                  />
                  <div v-else class="preview-image preview-empty">无预览</div>
                </div>

                <div class="card-meta">
                  <div class="name" :title="row.fodderName || '-'">{{ row.fodderName || '-' }}</div>
                  <div class="sub" :title="row.fodderLabelName || '暂未分类'">
                    {{ row.fodderLabelName || '暂未分类' }}
                  </div>
                </div>

                <div class="card-bottom">
                  <el-checkbox
                    :model-value="Boolean(row.checked)"
                    @change="listState.toggleRowChecked(row, Boolean($event))"
                  />
                  <ObActionButtons>
                    <el-button link type="primary" size="small" @click="openEditDialog(row)"
                      >编辑</el-button
                    >
                    <el-button link size="small" @click="listState.openPreview(row)"
                      >预览</el-button
                    >
                    <el-button link type="danger" size="small" @click="deleteSingle(row)"
                      >删除</el-button
                    >
                  </ObActionButtons>
                </div>
              </article>
            </div>
          </div>

          <div class="pagination-row">
            <el-pagination
              :current-page="listState.pagination.value.currentPage"
              :page-size="listState.pagination.value.pageSize"
              :total="listState.pagination.value.total"
              layout="total, prev, pager, next, sizes"
              :page-sizes="[12, 24, 48]"
              @current-change="handleCurrentPageChange"
              @size-change="handlePageSizeChange"
            />
          </div>
        </section>
      </div>
    </div>

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
.material-management-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
}

.toolbar-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.material-body {
  min-height: 0;
  flex: 1;
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 12px;
}

.category-panel {
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  padding: 12px;
  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: 10px;
  min-height: 0;
}

.category-list {
  min-height: 0;
  overflow: auto;
  display: grid;
  gap: 8px;
}

.category-item {
  width: 100%;
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  padding: 8px 10px;
  text-align: left;
  display: grid;
  grid-template-columns: 1fr auto;
  row-gap: 6px;
  background: var(--el-bg-color);
  cursor: pointer;
}

.category-item.active {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.category-name {
  font-weight: 500;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.category-count {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.category-actions {
  grid-column: 1 / span 2;
  justify-self: end;
}

.new-category-btn {
  width: 100%;
}

.material-panel {
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  padding: 12px;
  min-height: 0;
  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: 12px;
}

.material-operations {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.search-input {
  max-width: 340px;
}

.operation-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.material-grid-wrap {
  min-height: 0;
  overflow: auto;
}

.material-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.card-item {
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  padding: 10px;
  display: grid;
  grid-template-rows: auto auto auto;
  gap: 8px;
}

.card-preview {
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  overflow: hidden;
  cursor: zoom-in;
}

.preview-image {
  width: 100%;
  height: 132px;
  display: block;
}

.preview-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-light);
}

.card-meta .name {
  font-weight: 500;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.card-meta .sub {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.card-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.pagination-row {
  display: flex;
  justify-content: flex-end;
}
</style>
