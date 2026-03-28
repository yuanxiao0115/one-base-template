<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue';
import { createUniver, LocaleType, type IDisposable, type IRange } from '@univerjs/presets';
import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core';
import zhCN from '@univerjs/preset-sheets-core/locales/zh-CN';
import '@univerjs/preset-sheets-core/lib/index.css';

import type { DocumentMaterialDefinition } from '../materials/types';
import type { DocumentMaterialAnchor, DocumentTemplateSchema } from '../schema/types';
import {
  anchorToCanvasRange,
  canvasRangeToAnchor,
  clampCanvasRange,
  normalizeCanvasRange,
  type CanvasGridRange
} from './canvas-bridge';

defineOptions({
  name: 'UniverDocumentCanvas'
});

const props = defineProps<{
  template: DocumentTemplateSchema;
  materials: DocumentMaterialDefinition[];
  selectedNodeId?: string | null;
}>();

const emit = defineEmits<{
  (e: 'select', nodeId: string): void;
  (e: 'update-anchor', nodeId: string, anchor: DocumentMaterialAnchor): void;
}>();

type UniverSetup = ReturnType<typeof createUniver>;
type UniverWorkbook = ReturnType<UniverSetup['univerAPI']['createWorkbook']>;
type UniverWorksheet = ReturnType<UniverWorkbook['getActiveSheet']>;

interface UniverRuntime {
  setup: UniverSetup;
  worksheet: UniverWorksheet;
  disposables: IDisposable[];
}

interface GridMetrics {
  maxRows: number;
  maxColumns: number;
  rowHeight: number;
  columnWidth: number;
}

const hostRef = ref<HTMLElement | null>(null);
const runtimeRef = shallowRef<UniverRuntime | null>(null);
const renderingRef = ref(false);
const selectionMoveStartRef = ref<CanvasGridRange | null>(null);

function resolveGridMetrics(template: DocumentTemplateSchema): GridMetrics {
  const maxColumns = Math.max(1, template.grid.columns);
  const maxRows = Math.max(1, Math.ceil(template.page.minHeight / template.grid.rowHeight));
  const rowHeight = Math.max(20, template.grid.rowHeight);
  const columnWidth = Math.max(32, Math.floor(template.page.width / maxColumns));

  return {
    maxRows,
    maxColumns,
    rowHeight,
    columnWidth
  };
}

function isSameRange(a: CanvasGridRange | null, b: CanvasGridRange | null) {
  if (!a || !b) {
    return false;
  }

  return (
    a.startRow === b.startRow &&
    a.startColumn === b.startColumn &&
    a.endRow === b.endRow &&
    a.endColumn === b.endColumn
  );
}

function isSameAnchor(a: DocumentMaterialAnchor, b: DocumentMaterialAnchor) {
  return a.row === b.row && a.col === b.col && a.rowspan === b.rowspan && a.colspan === b.colspan;
}

function resolveNodeById(nodeId: string | null | undefined) {
  if (!nodeId) {
    return null;
  }
  return props.template.materials.find((item) => item.id === nodeId) ?? null;
}

function rangeFromSelection(range: IRange): CanvasGridRange {
  return {
    startRow: range.startRow,
    startColumn: range.startColumn,
    endRow: range.endRow,
    endColumn: range.endColumn
  };
}

function resolveNodeIdByRange(range: CanvasGridRange): string | null {
  const normalized = normalizeCanvasRange(range);
  const selectedRow = normalized.startRow + 1;
  const selectedCol = normalized.startColumn + 1;

  const matched = props.template.materials.find((node) => {
    const rowEnd = node.anchor.row + node.anchor.rowspan - 1;
    const colEnd = node.anchor.col + node.anchor.colspan - 1;

    return (
      selectedRow >= node.anchor.row &&
      selectedRow <= rowEnd &&
      selectedCol >= node.anchor.col &&
      selectedCol <= colEnd
    );
  });

  return matched?.id ?? null;
}

function disposeRuntime() {
  const runtime = runtimeRef.value;
  if (!runtime) {
    return;
  }

  runtime.disposables.forEach((item) => {
    item.dispose();
  });
  runtime.setup.univer.dispose();
  runtimeRef.value = null;
  selectionMoveStartRef.value = null;
}

function bindCanvasEvents(runtime: UniverRuntime) {
  const selectionChangedDisposable = runtime.setup.univerAPI.addEvent(
    runtime.setup.univerAPI.Event.SelectionChanged,
    ({ selections }) => {
      if (renderingRef.value || selections.length === 0) {
        return;
      }

      const nodeId = resolveNodeIdByRange(rangeFromSelection(selections[0]!));
      if (nodeId && nodeId !== props.selectedNodeId) {
        emit('select', nodeId);
      }
    }
  );

  const selectionMoveStartDisposable = runtime.setup.univerAPI.addEvent(
    runtime.setup.univerAPI.Event.SelectionMoveStart,
    ({ selections }) => {
      if (renderingRef.value || selections.length === 0) {
        return;
      }

      selectionMoveStartRef.value = normalizeCanvasRange(rangeFromSelection(selections[0]!));
    }
  );

  const selectionMoveEndDisposable = runtime.setup.univerAPI.addEvent(
    runtime.setup.univerAPI.Event.SelectionMoveEnd,
    ({ selections }) => {
      if (renderingRef.value || selections.length === 0 || !props.selectedNodeId) {
        return;
      }

      const selectedNode = resolveNodeById(props.selectedNodeId);
      if (!selectedNode) {
        return;
      }

      const metrics = resolveGridMetrics(props.template);
      const selectedNodeRange = clampCanvasRange(anchorToCanvasRange(selectedNode.anchor), metrics);
      const startedRange = selectionMoveStartRef.value;
      selectionMoveStartRef.value = null;

      if (!isSameRange(startedRange, selectedNodeRange)) {
        return;
      }

      const nextRange = clampCanvasRange(rangeFromSelection(selections[0]!), metrics);
      const nextAnchor = canvasRangeToAnchor(nextRange);

      if (!isSameAnchor(nextAnchor, selectedNode.anchor)) {
        emit('update-anchor', selectedNode.id, nextAnchor);
      }
    }
  );

  runtime.disposables.push(
    selectionChangedDisposable,
    selectionMoveStartDisposable,
    selectionMoveEndDisposable
  );
}

function renderCanvas() {
  const runtime = runtimeRef.value;
  if (!runtime) {
    return;
  }

  const { worksheet } = runtime;
  const metrics = resolveGridMetrics(props.template);

  renderingRef.value = true;

  try {
    worksheet.clear();
    worksheet.setColumnWidths(0, metrics.maxColumns, metrics.columnWidth);
    worksheet.setRowHeightsForced(0, metrics.maxRows, metrics.rowHeight);

    props.template.materials.forEach((node) => {
      const normalizedRange = clampCanvasRange(anchorToCanvasRange(node.anchor), metrics);
      const rowCount = normalizedRange.endRow - normalizedRange.startRow + 1;
      const columnCount = normalizedRange.endColumn - normalizedRange.startColumn + 1;
      const cellRange = worksheet.getRange(
        normalizedRange.startRow,
        normalizedRange.startColumn,
        rowCount,
        columnCount
      );

      if (rowCount > 1 || columnCount > 1) {
        cellRange.merge({
          isForceMerge: true
        });
      }

      const isActive = node.id === props.selectedNodeId;
      const materialLabel =
        props.materials.find((item) => item.type === node.type)?.label ?? node.type;

      cellRange
        .setValue(`${materialLabel} · ${node.title}`)
        .setWrap(true)
        .setHorizontalAlignment('center')
        .setVerticalAlignment('middle')
        .setFontSize(12)
        .setBackground(isActive ? '#dbeafe' : '#f8fafc');

      cellRange.setBorder(
        runtime.setup.univerAPI.Enum.BorderType.ALL,
        runtime.setup.univerAPI.Enum.BorderStyleTypes.THIN,
        isActive ? '#2563eb' : '#cbd5e1'
      );
    });

    const selectedNode = resolveNodeById(props.selectedNodeId);
    if (selectedNode) {
      const selectedRange = clampCanvasRange(anchorToCanvasRange(selectedNode.anchor), metrics);
      worksheet.scrollToCell(selectedRange.startRow, selectedRange.startColumn, 0);
    }
  } finally {
    renderingRef.value = false;
  }
}

function initializeUniverCanvas() {
  if (!hostRef.value) {
    return;
  }

  disposeRuntime();

  const setup = createUniver({
    locale: LocaleType.ZH_CN,
    locales: {
      [LocaleType.ZH_CN]: zhCN
    },
    presets: [
      UniverSheetsCorePreset({
        container: hostRef.value,
        header: false,
        toolbar: false,
        formulaBar: false,
        footer: false,
        contextMenu: false
      })
    ]
  });

  const workbook = setup.univerAPI.createWorkbook({
    id: 'document-form-designer',
    name: '公文设计画布'
  });
  const worksheet = workbook.getActiveSheet();

  const runtime: UniverRuntime = {
    setup,
    worksheet,
    disposables: []
  };

  bindCanvasEvents(runtime);
  runtimeRef.value = runtime;
  renderCanvas();
}

watch(
  () => props.template,
  () => {
    renderCanvas();
  },
  { deep: true }
);

watch(
  () => props.selectedNodeId,
  () => {
    renderCanvas();
  }
);

onMounted(() => {
  initializeUniverCanvas();
});

onBeforeUnmount(() => {
  disposeRuntime();
});
</script>

<template>
  <section class="univer-canvas-shell">
    <div ref="hostRef" class="univer-canvas-host" />
    <div v-if="props.template.materials.length === 0" class="univer-canvas-empty">
      从左侧选择一个物料开始编排
    </div>
  </section>
</template>

<style scoped>
.univer-canvas-shell {
  position: relative;
  min-width: 0;
  min-height: 0;
  padding: 16px;
  background:
    linear-gradient(180deg, rgb(226 232 240 / 40%) 0%, rgb(241 245 249 / 90%) 100%),
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 23px,
      rgb(148 163 184 / 10%) 23px,
      rgb(148 163 184 / 10%) 24px
    );
}

.univer-canvas-host {
  position: absolute;
  inset: 16px;
  border: 1px solid #d6deea;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 18px 48px -30px rgb(15 23 42 / 45%);
}

.univer-canvas-empty {
  position: absolute;
  inset: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-size: 14px;
  pointer-events: none;
}
</style>
