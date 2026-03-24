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
        <div class="toolbar-title">
          <h2 class="page-title">素材管理</h2>
          <p class="page-subtitle">统一维护图片与图标素材，支持分类检索与批量操作。</p>
        </div>
        <div class="toolbar-actions">
          <div class="toolbar-metrics">
            <span class="metric-pill">分类 {{ categoryState.categoryList.value.length }}</span>
            <span class="metric-pill">素材 {{ listState.pagination.value.total }}</span>
          </div>
          <el-radio-group :model-value="activeTab" @change="onTabChange">
            <el-radio-button label="image" value="image">图片</el-radio-button>
            <el-radio-button label="icon" value="icon">图标</el-radio-button>
          </el-radio-group>
          <el-button :loading="listState.materialLoading.value" @click="refreshAll">刷新</el-button>
        </div>
      </div>

      <div class="material-body">
        <aside class="category-panel">
          <div class="panel-head">
            <span class="panel-title">分类列表</span>
            <span class="panel-meta">{{ categoryState.categoryList.value.length }} 项</span>
          </div>

          <el-input
            v-model.trim="categoryState.categorySearchKey.value"
            clearable
            placeholder="搜索分类"
            class="category-search-input"
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
            <div class="material-operations-head">
              <span class="panel-title">素材列表</span>
              <span class="panel-meta">已选 {{ selectedIds.length }} 项</span>
            </div>

            <div class="material-operations-actions">
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
          </div>

          <div v-loading="listState.materialLoading.value" class="material-grid-wrap">
            <el-empty
              v-if="!listState.materialRows.value.length"
              class="material-empty"
              description="暂无素材"
            />
            <div v-else class="material-grid">
              <article
                v-for="(row, index) in listState.materialRows.value"
                :key="String(row.id || '')"
                class="card-item"
                :style="{ '--item-index': index }"
              >
                <div class="card-preview" @click="listState.openPreview(row)">
                  <span class="card-tag">{{
                    row.fileType || (activeTab === 'image' ? '图片' : '图标')
                  }}</span>
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
  --mm-surface: #fff;
  --mm-surface-soft: #f8fafc;
  --mm-border: #dce5f0;
  --mm-border-strong: #c8d6e5;
  --mm-text-main: #0f172a;
  --mm-text-sub: #52637a;
  --mm-shadow: 0 16px 36px rgb(15 23 42 / 8%);
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 12px;
  background:
    radial-gradient(circle at right top, rgb(37 99 235 / 10%) 0%, transparent 38%),
    radial-gradient(circle at left bottom, rgb(14 165 233 / 7%) 0%, transparent 42%),
    linear-gradient(180deg, #f8fbff 0%, #f1f5f9 100%);
}

.toolbar-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  border: 1px solid var(--mm-border);
  border-radius: 16px;
  padding: 14px 16px;
  background: rgb(255 255 255 / 90%);
  box-shadow: var(--mm-shadow);
  backdrop-filter: blur(8px);
}

.toolbar-title {
  min-width: 0;
}

.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--mm-text-main);
  letter-spacing: 0.2px;
}

.page-subtitle {
  margin: 6px 0 0;
  color: var(--mm-text-sub);
  font-size: 13px;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
}

.toolbar-metrics {
  display: flex;
  align-items: center;
  gap: 8px;
}

.metric-pill {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 0 10px;
  border: 1px solid var(--mm-border);
  border-radius: 999px;
  background: #f8fbff;
  color: var(--mm-text-sub);
  font-size: 12px;
}

.material-body {
  min-height: 0;
  flex: 1;
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 12px;
}

.category-panel {
  border: 1px solid var(--mm-border);
  border-radius: 14px;
  padding: 12px 12px 14px;
  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: 12px;
  min-height: 0;
  background: var(--mm-surface);
  box-shadow: var(--mm-shadow);
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  min-height: 32px;
}

.panel-title {
  color: var(--mm-text-main);
  font-size: 14px;
  font-weight: 600;
}

.panel-meta {
  color: var(--mm-text-sub);
  font-size: 12px;
}

.category-search-input {
  min-height: 32px;
}

.category-list {
  min-height: 0;
  overflow: auto;
  display: grid;
  gap: 10px;
  padding-right: 2px;
}

.category-item {
  width: 100%;
  border: 1px solid var(--mm-border);
  border-radius: 12px;
  padding: 10px 12px;
  text-align: left;
  display: grid;
  grid-template-columns: 1fr auto;
  row-gap: 6px;
  background: var(--mm-surface-soft);
  cursor: pointer;
  transition:
    transform 0.22s ease,
    border-color 0.22s ease,
    box-shadow 0.22s ease;
  will-change: transform;
}

.category-item:hover {
  transform: translateY(-1px);
  border-color: var(--mm-border-strong);
  box-shadow: 0 10px 18px rgb(15 23 42 / 8%);
}

.category-item.active {
  border-color: var(--el-color-primary-light-5);
  background: var(--el-color-primary-light-9);
  box-shadow: 0 10px 18px rgb(37 99 235 / 14%);
}

.category-name {
  font-weight: 600;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--mm-text-main);
}

.category-count {
  color: var(--mm-text-sub);
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
  border: 1px solid var(--mm-border);
  border-radius: 14px;
  padding: 12px 12px 14px;
  min-height: 0;
  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: 12px;
  background: var(--mm-surface);
  box-shadow: var(--mm-shadow);
}

.material-operations {
  display: grid;
  gap: 12px;
}

.material-operations-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.material-operations-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.search-input {
  max-width: 360px;
}

.operation-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.material-grid-wrap {
  min-height: 0;
  overflow: auto;
  padding-right: 2px;
}

.material-empty {
  padding: 28px 0;
}

.material-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 14px;
}

.card-item {
  border: 1px solid var(--mm-border);
  border-radius: 14px;
  padding: 11px;
  display: grid;
  grid-template-rows: auto auto auto;
  gap: 10px;
  background: linear-gradient(180deg, #fff 0%, #f8fbff 100%);
  box-shadow: 0 12px 24px rgb(15 23 42 / 7%);
  transition:
    transform 0.22s ease,
    border-color 0.22s ease,
    box-shadow 0.22s ease;
  animation: card-enter 0.36s ease both;
  animation-delay: calc(var(--item-index) * 26ms);
}

.card-item:hover {
  transform: translateY(-2px);
  border-color: var(--mm-border-strong);
  box-shadow: 0 16px 30px rgb(15 23 42 / 10%);
}

.card-preview {
  position: relative;
  border: 1px solid var(--mm-border);
  border-radius: 10px;
  overflow: hidden;
  cursor: zoom-in;
  background:
    radial-gradient(circle at 80% 10%, rgb(37 99 235 / 18%) 0%, transparent 44%),
    linear-gradient(180deg, #fff 0%, #f0f6ff 100%);
}

.card-tag {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  background: rgb(15 23 42 / 70%);
  color: #f8fafc;
  font-size: 11px;
  line-height: 1;
  backdrop-filter: blur(2px);
}

.preview-image {
  width: 100%;
  height: 142px;
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
  color: var(--mm-text-main);
  font-weight: 600;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.card-meta .sub {
  font-size: 12px;
  color: var(--mm-text-sub);
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
  margin-top: 2px;
}

@keyframes card-enter {
  from {
    opacity: 0;
    transform: translateY(6px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (width <= 1280px) {
  .material-body {
    grid-template-columns: 232px 1fr;
  }
}

@media (width <= 1024px) {
  .toolbar-row {
    flex-direction: column;
    align-items: stretch;
  }

  .toolbar-actions {
    justify-content: flex-start;
  }

  .material-body {
    grid-template-columns: 1fr;
    gap: 14px;
  }

  .category-panel {
    max-height: 320px;
  }
}

@media (width <= 768px) {
  .material-management-page {
    gap: 12px;
    padding: 10px;
  }

  .toolbar-row,
  .category-panel,
  .material-panel {
    border-radius: 12px;
  }

  .toolbar-actions {
    width: 100%;
    gap: 8px;
  }

  .toolbar-metrics {
    width: 100%;
  }

  .metric-pill {
    flex: 1;
    justify-content: center;
  }

  .material-operations-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .search-input {
    max-width: none;
  }

  .operation-actions {
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;
  }

  .material-grid {
    grid-template-columns: repeat(auto-fill, minmax(158px, 1fr));
    gap: 10px;
  }

  .preview-image {
    height: 112px;
  }

  .card-bottom {
    flex-wrap: wrap;
  }
}

@media (prefers-reduced-motion: reduce) {
  .category-item,
  .card-item {
    transition: none;
    animation: none;
  }
}
</style>
