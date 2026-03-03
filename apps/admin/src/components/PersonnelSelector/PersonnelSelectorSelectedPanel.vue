<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import type Sortable from 'sortablejs'
import { Rank } from '@element-plus/icons-vue'
import { Icon } from '@iconify/vue'
import type { PersonnelSelectedItem } from './types'

type SortableCtor = {
  create: (element: HTMLElement, options?: Record<string, unknown>) => Sortable
}

type SortableEndEvent = {
  oldIndex?: number
  newIndex?: number
}

const props = withDefaults(defineProps<{
  disabled: boolean
  selectedItems: PersonnelSelectedItem[]
  emptyText?: string
  sortEnabled?: boolean
}>(), {
  emptyText: '未选择人员',
  sortEnabled: true
})

const emit = defineEmits<{
  (event: 'remove', userId: string): void
  (event: 'clear'): void
  (event: 'reorder', payload: { oldIndex: number; newIndex: number }): void
}>()

const selectedListRef = ref<HTMLElement>()
const sortableCtor = ref<SortableCtor | null>(null)
const sortableInstance = ref<Sortable | null>(null)
let sortableInitToken = 0

const selectedItemCount = computed(() => props.selectedItems.length)
const selectedIdsKey = computed(() => props.selectedItems.map((item) => item.id).join(','))

function getItemLabel(item: PersonnelSelectedItem): string {
  if (!item.subTitle) return item.title
  return `${item.title}（${item.subTitle}）`
}

function destroySortable() {
  sortableInstance.value?.destroy()
  sortableInstance.value = null
}

async function ensureSortableCtor() {
  if (sortableCtor.value) return sortableCtor.value

  const imported = await import('sortablejs')
  const importedRecord = imported as unknown as Record<string, unknown>
  const ctor = (importedRecord.default || importedRecord) as SortableCtor
  sortableCtor.value = ctor
  return ctor
}

async function handleSortEnd(event: SortableEndEvent) {
  const { oldIndex, newIndex } = event
  if (oldIndex == null || newIndex == null || oldIndex === newIndex) return

  emit('reorder', { oldIndex, newIndex })
}

async function initSortable() {
  const currentToken = ++sortableInitToken
  if (props.disabled || !props.sortEnabled || selectedItemCount.value <= 1) {
    destroySortable()
    return
  }

  await nextTick()
  if (currentToken !== sortableInitToken) return

  const container = selectedListRef.value
  if (!container) return

  const ctor = await ensureSortableCtor()
  if (currentToken !== sortableInitToken) return

  destroySortable()
  sortableInstance.value = ctor.create(container, {
    animation: 160,
    handle: '.personnel-selector-selected__drag-handle',
    ghostClass: 'personnel-selector-selected__item--ghost',
    chosenClass: 'personnel-selector-selected__item--chosen',
    onEnd: (evt: unknown) => {
      void handleSortEnd(evt as SortableEndEvent)
    }
  })
}

watch(
  [
    () => props.disabled,
    () => props.sortEnabled,
    selectedIdsKey
  ],
  () => {
    void initSortable()
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  destroySortable()
})
</script>

<template>
  <div class="personnel-selector-selected">
    <div class="personnel-selector-selected__head">
      <div class="personnel-selector-selected__title">
        已选：
        <span>{{ selectedItemCount }}</span>
        <em>（拖动可进行排序）</em>
      </div>
      <el-button link type="primary" :disabled="props.disabled" @click="emit('clear')">清空</el-button>
    </div>

    <div
      ref="selectedListRef"
      class="personnel-selector-selected__list"
      :class="{ 'is-empty': props.selectedItems.length === 0 }"
    >
      <template v-if="props.selectedItems.length > 0">
        <div
          v-for="item in props.selectedItems"
          :key="item.id"
          class="personnel-selector-selected__item"
        >
          <span class="personnel-selector-selected__drag-handle" title="拖动排序">
            <el-icon><Rank /></el-icon>
          </span>
          <span class="personnel-selector-selected__text">{{ getItemLabel(item) }}</span>
          <button
            type="button"
            class="personnel-selector-selected__remove"
            :title="`移除 ${item.title}`"
            :disabled="props.disabled"
            @click="emit('remove', item.id)"
          >
            <Icon icon="mdi:close" width="14" height="14" />
          </button>
        </div>
      </template>

      <div v-else class="personnel-selector-selected__empty">
        <Icon icon="mdi:account-search-outline" width="52" height="52" />
        <span>{{ props.emptyText }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.personnel-selector-selected {
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
  background: var(--el-bg-color);
}

.personnel-selector-selected__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 48px;
  padding: 0 12px;
  border-bottom: 1px solid var(--el-border-color-extra-light);
  background: var(--el-fill-color-blank);
}

.personnel-selector-selected__title {
  color: var(--el-text-color-secondary);
  font-size: 13px;
  line-height: 1;
}

.personnel-selector-selected__title span {
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.personnel-selector-selected__title em {
  color: var(--el-text-color-secondary);
  font-style: normal;
  font-size: 12px;
}

.personnel-selector-selected__list {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 12px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-content: flex-start;
  gap: 8px;
  background: var(--el-fill-color-light);
}

.personnel-selector-selected__list.is-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.personnel-selector-selected__empty {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--el-text-color-placeholder);
  font-size: 13px;
  text-align: center;
}

.personnel-selector-selected__item {
  display: grid;
  grid-template-columns: 18px minmax(0, 1fr) 16px;
  align-items: center;
  gap: 8px;
  min-height: 38px;
  padding: 0 10px;
  border: 1px solid var(--el-border-color-extra-light);
  background: var(--el-bg-color);
  border-radius: 2px;
  transition: border-color 0.2s ease, background-color 0.2s ease;
}

.personnel-selector-selected__item:hover {
  border-color: var(--el-color-primary-light-7);
  background: var(--el-fill-color-lighter);
}

.personnel-selector-selected__item--ghost {
  opacity: 0.65;
}

.personnel-selector-selected__item--chosen {
  border-color: var(--el-color-primary);
  background: var(--one-color-primary-light-100);
}

.personnel-selector-selected__drag-handle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--el-text-color-secondary);
  cursor: move;
}

.personnel-selector-selected__drag-handle:hover {
  color: var(--el-text-color-primary);
}

.personnel-selector-selected__text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.personnel-selector-selected__remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  padding: 0;
  background: transparent;
  color: var(--el-text-color-secondary);
  cursor: pointer;
  line-height: 1;
}

.personnel-selector-selected__remove:hover {
  color: var(--el-color-danger);
}

.personnel-selector-selected__remove:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.personnel-selector-selected__list::-webkit-scrollbar {
  width: 6px;
}

.personnel-selector-selected__list::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: var(--el-border-color);
}

@media (max-width: 1400px) {
  .personnel-selector-selected__list {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
