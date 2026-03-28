<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue';
import { createUniver, LocaleType, type IDisposable, type IRange } from '@univerjs/presets';
import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core';
import zhCN from '@univerjs/preset-sheets-core/locales/zh-CN';
import '@univerjs/preset-sheets-core/lib/index.css';

import type { DocumentMaterialDefinition } from '../materials/types';
import type { DocumentMaterialAnchor, DocumentTemplateSchema } from '../schema/types';
import {
  canvasRangeToAnchor,
  clampCanvasRange,
  normalizeCanvasRange,
  type CanvasGridRange
} from './canvas-bridge';
import { buildCanvasMaterialCells, resolveCanvasGridMetrics } from './canvas-render-model';

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

const hostRef = ref<HTMLElement | null>(null);
const runtimeRef = shallowRef<UniverRuntime | null>(null);
const renderingRef = ref(false);
const renderQueuedRef = ref(false);
const selectionMoveStartRef = ref<CanvasGridRange | null>(null);

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
  renderQueuedRef.value = false;
}

function renderCanvas() {
  const runtime = runtimeRef.value;
  if (!runtime) {
    return;
  }

  const { worksheet } = runtime;
  const metrics = resolveCanvasGridMetrics(props.template);
  const cells = buildCanvasMaterialCells(props.template, props.materials, props.selectedNodeId);

  renderingRef.value = true;

  try {
    worksheet.clear();
    worksheet.setColumnWidths(0, metrics.maxColumns, metrics.columnWidth);
    worksheet.setRowHeightsForced(0, metrics.maxRows, metrics.rowHeight);

    cells.forEach((cell) => {
      const cellRange = worksheet.getRange(
        cell.range.startRow,
        cell.range.startColumn,
        cell.rowCount,
        cell.columnCount
      );

      if (cell.rowCount > 1 || cell.columnCount > 1) {
        cellRange.merge({
          isForceMerge: true
        });
      }

      cellRange
        .setValue(cell.label)
        .setWrap(true)
        .setHorizontalAlignment('center')
        .setVerticalAlignment('middle')
        .setFontSize(12)
        .setBackground(cell.isActive ? '#dbeafe' : '#f8fafc');

      cellRange.setBorder(
        runtime.setup.univerAPI.Enum.BorderType.ALL,
        runtime.setup.univerAPI.Enum.BorderStyleTypes.THIN,
        cell.isActive ? '#2563eb' : '#cbd5e1'
      );
    });

    const selectedCell = cells.find((item) => item.isActive) ?? null;
    if (selectedCell) {
      worksheet.scrollToCell(selectedCell.range.startRow, selectedCell.range.startColumn, 0);
    }
  } finally {
    renderingRef.value = false;
  }
}

function scheduleRender() {
  if (renderQueuedRef.value) {
    return;
  }

  renderQueuedRef.value = true;
  queueMicrotask(() => {
    renderQueuedRef.value = false;
    renderCanvas();
  });
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

      const metrics = resolveCanvasGridMetrics(props.template);
      const cells = buildCanvasMaterialCells(props.template, props.materials, props.selectedNodeId);
      const selectedCell = cells.find((item) => item.nodeId === props.selectedNodeId) ?? null;
      const startedRange = selectionMoveStartRef.value;
      selectionMoveStartRef.value = null;

      if (!selectedCell || !isSameRange(startedRange, selectedCell.range)) {
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
  scheduleRender();
}

watch(
  () => props.template,
  () => {
    scheduleRender();
  },
  { deep: true }
);

watch(
  () => props.selectedNodeId,
  () => {
    scheduleRender();
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
  display: flex;
  width: 100%;
  height: 100%;
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
  overflow: hidden;
}

.univer-canvas-host {
  position: relative;
  flex: 1;
  min-width: 0;
  min-height: 0;
  border: 1px solid #d6deea;
  background: #fff;
  box-shadow: 0 18px 48px -30px rgb(15 23 42 / 45%);
  overflow: hidden;
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
