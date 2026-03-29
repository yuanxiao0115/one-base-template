<script setup lang="ts">
import { computed } from 'vue';

import type {
  DocumentFieldOption,
  DocumentTemplateField,
  DocumentTemplatePlacement,
  DocumentTemplateSchema
} from '../schema/types';
import type { DocumentSheetRange } from '../schema/sheet';
import type { DocumentSheetStylePatch } from './sheet-ops';
import MergeEditor from './panels/MergeEditor.vue';
import SheetStyleEditor from './panels/SheetStyleEditor.vue';

defineOptions({
  name: 'DocumentPropertyInspector'
});

const DISPLAY_MODE_OPTIONS: Array<{
  label: string;
  value: DocumentTemplatePlacement['displayMode'];
}> = [
  { label: '单元格', value: 'singleCell' },
  { label: '合并区域', value: 'mergedRange' },
  { label: '行内文本', value: 'inlineText' },
  { label: '图片槽位', value: 'imageSlot' },
  { label: '表格区域', value: 'tableRegion' }
];

const SECTION_OPTIONS: Array<{
  label: string;
  value: NonNullable<DocumentTemplatePlacement['section']>;
}> = [
  { label: '页眉', value: 'header' },
  { label: '主送/抄送', value: 'recipient' },
  { label: '正文', value: 'body' },
  { label: '意见', value: 'opinion' },
  { label: '附件', value: 'attachment' },
  { label: '页脚', value: 'footer' },
  { label: '元信息', value: 'meta' }
];

const props = defineProps<{
  template: DocumentTemplateSchema;
  activeRange: DocumentSheetRange | null;
  selectedPlacement: DocumentTemplatePlacement | null;
  selectedField: DocumentTemplateField | null;
}>();

const emit = defineEmits<{
  (e: 'select-placement', placementId: string | null): void;
  (e: 'update-field', patch: Partial<DocumentTemplateField>): void;
  (e: 'update-field-options', options: DocumentFieldOption[]): void;
  (
    e: 'update-placement',
    patch: Partial<Pick<DocumentTemplatePlacement, 'displayMode' | 'section' | 'readonly'>>
  ): void;
  (e: 'remove-placement'): void;
  (e: 'apply-sheet-style', value: DocumentSheetStylePatch): void;
  (e: 'add-current-merge'): void;
  (e: 'remove-merge', index: number): void;
}>();

function isSameRange(a: DocumentSheetRange, b: DocumentSheetRange) {
  return a.row === b.row && a.col === b.col && a.rowspan === b.rowspan && a.colspan === b.colspan;
}

function formatOptions(options: DocumentFieldOption[] | undefined) {
  if (!options || options.length === 0) {
    return '';
  }

  return options.map((item) => `${item.label}:${item.value}`).join('\n');
}

function parseOptions(value: string) {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [labelPart, ...valueParts] = line.split(':');
      const label = (labelPart ?? '').trim();
      const nextValue = valueParts.join(':').trim() || label;

      return {
        label,
        value: nextValue
      };
    });
}

const selectedRangeStyle = computed(() => {
  if (!props.activeRange) {
    return null;
  }

  return props.template.sheet.styles.find((item) => isSameRange(item, props.activeRange!)) ?? null;
});

const placementSummaries = computed(() =>
  props.template.placements.map((placement) => {
    const field = props.template.fields.find((item) => item.id === placement.fieldId);

    return {
      id: placement.id,
      label: field?.label ?? placement.fieldId,
      type: field?.type ?? 'field',
      section: placement.section ?? 'body'
    };
  })
);

const optionsText = computed(() => formatOptions(props.selectedField?.dataSource?.options));

const showPlaceholderInput = computed(() => {
  const type = props.selectedField?.type;
  return Boolean(
    type &&
    type !== 'attachment' &&
    type !== 'stamp' &&
    type !== 'radio' &&
    type !== 'checkbox' &&
    type !== 'select'
  );
});

const showRowsInput = computed(() => {
  const type = props.selectedField?.type;
  return type === 'textarea' || type === 'opinion';
});

const showAttachmentLimit = computed(() => props.selectedField?.type === 'attachment');

const showOptionsEditor = computed(() => {
  const type = props.selectedField?.type;
  return (
    type === 'select' ||
    type === 'radio' ||
    type === 'checkbox' ||
    Boolean(props.selectedField?.dataSource)
  );
});
</script>

<template>
  <aside class="inspector">
    <div class="panel-title">字段与表格设置</div>

    <section class="panel">
      <div class="panel-head">
        <strong>字段清单</strong>
        <span class="panel-count">{{ placementSummaries.length }} 项</span>
      </div>
      <div v-if="placementSummaries.length > 0" class="placement-list">
        <button
          v-for="placement in placementSummaries"
          :key="placement.id"
          type="button"
          class="placement-item"
          :class="{ 'placement-item--active': placement.id === props.selectedPlacement?.id }"
          @click="emit('select-placement', placement.id)"
        >
          <span class="placement-item__label">{{ placement.label }}</span>
          <span class="placement-item__meta">{{ placement.type }} · {{ placement.section }}</span>
        </button>
      </div>
      <div v-else class="empty-text">当前模板还没有字段绑定</div>
    </section>

    <section class="panel">
      <div class="panel-head">
        <strong>当前选区</strong>
        <span v-if="props.activeRange" class="range-pill">
          R{{ props.activeRange.row }} C{{ props.activeRange.col }} ·
          {{ props.activeRange.rowspan }} x {{ props.activeRange.colspan }}
        </span>
      </div>
      <div v-if="props.activeRange" class="range-meta">
        当前画布操作以选区为准：合并、边框、底色、字号都直接写入 `template.sheet`。
      </div>
      <div v-else class="empty-text">先在 Univer 画布里选中一个单元格或区域</div>
      <MergeEditor
        :active-range="props.activeRange"
        :merges="props.template.sheet.merges"
        @add-current="emit('add-current-merge')"
        @remove="(index) => emit('remove-merge', index)"
      />
      <SheetStyleEditor
        :model-value="selectedRangeStyle"
        @apply="(value) => emit('apply-sheet-style', value)"
      />
    </section>

    <section class="panel">
      <div class="panel-head">
        <strong>字段属性</strong>
        <button
          v-if="props.selectedPlacement && props.selectedField"
          type="button"
          class="danger-btn"
          @click="emit('remove-placement')"
        >
          删除字段
        </button>
      </div>
      <template v-if="props.selectedPlacement && props.selectedField">
        <div class="field-grid">
          <label class="field">
            <span>字段标签</span>
            <input
              :value="props.selectedField.label"
              type="text"
              @input="emit('update-field', { label: ($event.target as HTMLInputElement).value })"
            />
          </label>
          <label class="field">
            <span>字段类型</span>
            <input :value="props.selectedField.type" type="text" readonly />
          </label>
          <label class="field checkbox-field">
            <input
              :checked="Boolean(props.selectedField.required)"
              type="checkbox"
              @change="
                emit('update-field', { required: ($event.target as HTMLInputElement).checked })
              "
            />
            <span>必填</span>
          </label>
          <label class="field checkbox-field">
            <input
              :checked="Boolean(props.selectedPlacement.readonly)"
              type="checkbox"
              @change="
                emit('update-placement', { readonly: ($event.target as HTMLInputElement).checked })
              "
            />
            <span>只读</span>
          </label>
          <label v-if="showPlaceholderInput" class="field field--full">
            <span>占位提示</span>
            <input
              :value="String(props.selectedField.widgetProps?.placeholder ?? '')"
              type="text"
              @input="
                emit('update-field', {
                  widgetProps: {
                    placeholder: ($event.target as HTMLInputElement).value
                  }
                })
              "
            />
          </label>
          <label v-if="showRowsInput" class="field">
            <span>默认行数</span>
            <input
              :value="Number(props.selectedField.widgetProps?.rows ?? 4)"
              type="number"
              min="2"
              max="12"
              @input="
                emit('update-field', {
                  widgetProps: {
                    rows: Number(($event.target as HTMLInputElement).value || 4)
                  }
                })
              "
            />
          </label>
          <label v-if="showAttachmentLimit" class="field">
            <span>附件数量</span>
            <input
              :value="Number(props.selectedField.widgetProps?.maxCount ?? 9)"
              type="number"
              min="1"
              max="99"
              @input="
                emit('update-field', {
                  widgetProps: {
                    maxCount: Number(($event.target as HTMLInputElement).value || 1)
                  }
                })
              "
            />
          </label>
          <label class="field">
            <span>展示模式</span>
            <select
              :value="props.selectedPlacement.displayMode"
              @change="
                emit('update-placement', {
                  displayMode: ($event.target as HTMLSelectElement)
                    .value as DocumentTemplatePlacement['displayMode']
                })
              "
            >
              <option
                v-for="option in DISPLAY_MODE_OPTIONS"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </label>
          <label class="field">
            <span>所属区块</span>
            <select
              :value="props.selectedPlacement.section ?? 'body'"
              @change="
                emit('update-placement', {
                  section: ($event.target as HTMLSelectElement)
                    .value as DocumentTemplatePlacement['section']
                })
              "
            >
              <option v-for="option in SECTION_OPTIONS" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </label>
          <label v-if="showOptionsEditor" class="field field--full">
            <span>静态选项</span>
            <textarea
              :value="optionsText"
              rows="5"
              placeholder="每行一个选项，格式：标签:值"
              @input="
                emit(
                  'update-field-options',
                  parseOptions(($event.target as HTMLTextAreaElement).value)
                )
              "
            />
          </label>
        </div>
      </template>
      <div v-else class="empty-text">当前未选中字段，可先在画布里点中某个字段区域。</div>
    </section>
  </aside>
</template>

<style scoped>
.inspector {
  display: flex;
  min-height: 0;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border-left: 1px solid #d8dee8;
  background: linear-gradient(180deg, #f8fafc 0%, #eef3f8 100%);
  overflow: auto;
}

.panel-title {
  font-size: 13px;
  font-weight: 700;
  color: #0f172a;
}

.panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  border: 1px solid #d8dee8;
  background: #fff;
  box-shadow: 0 10px 30px -28px rgb(15 23 42 / 45%);
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.panel-count,
.range-meta,
.empty-text {
  color: #64748b;
  font-size: 12px;
  line-height: 1.6;
}

.range-pill {
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 600;
}

.placement-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.placement-item {
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  padding: 8px 10px;
  border: 1px solid #d8dee8;
  background: #f8fafc;
  color: #0f172a;
  cursor: pointer;
}

.placement-item--active {
  border-color: #93c5fd;
  background: #eff6ff;
}

.placement-item__label {
  font-size: 13px;
  font-weight: 600;
}

.placement-item__meta {
  color: #64748b;
  font-size: 12px;
}

.field-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.field {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 6px;
  color: #334155;
  font-size: 12px;
}

.field--full {
  grid-column: 1 / -1;
}

.field input,
.field textarea,
.field select {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #cbd5e1;
  background: #fff;
  color: #0f172a;
}

.field input[readonly] {
  background: #f8fafc;
  color: #64748b;
}

.field textarea {
  resize: vertical;
}

.checkbox-field {
  flex-direction: row;
  align-items: center;
  gap: 8px;
  padding-top: 24px;
}

.checkbox-field input {
  width: 16px;
  height: 16px;
  padding: 0;
}

.danger-btn {
  padding: 6px 10px;
  border: 1px solid #fda4af;
  background: #fff1f2;
  color: #be123c;
  cursor: pointer;
}

@media (max-width: 960px) {
  .field-grid {
    grid-template-columns: 1fr;
  }

  .checkbox-field {
    padding-top: 0;
  }
}
</style>
