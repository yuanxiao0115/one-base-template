<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue';
import { createUniver, LocaleType, type IDisposable, type IRange } from '@univerjs/presets';
import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core';
import zhCN from '@univerjs/preset-sheets-core/locales/zh-CN';
import '@univerjs/preset-sheets-core/lib/index.css';

import type { DocumentSheetRange, DocumentSheetStyle } from '../schema/sheet';
import type { DocumentTemplateSchema } from '../schema/types';
import {
  anchorToCanvasRange,
  canvasRangeToAnchor,
  clampCanvasRange,
  normalizeCanvasRange,
  type CanvasGridRange
} from './canvas-bridge';
import { buildCanvasSheetCells, resolveCanvasGridMetrics } from './canvas-render-model';

defineOptions({
  name: 'UniverDocumentCanvas'
});

const props = defineProps<{
  template: DocumentTemplateSchema;
  activeRange?: DocumentSheetRange | null;
  selectedPlacementId?: string | null;
}>();

const emit = defineEmits<{
  (e: 'select-placement', placementId: string | null): void;
  (e: 'select-range', range: DocumentSheetRange): void;
  (e: 'update-placement-range', placementId: string, range: DocumentSheetRange): void;
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
const renderPendingRef = ref(false);
const renderScheduledRef = ref(false);
const canvasReadyRef = ref(false);
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

function isSameAnchor(a: DocumentSheetRange, b: DocumentSheetRange) {
  return a.row === b.row && a.col === b.col && a.rowspan === b.rowspan && a.colspan === b.colspan;
}

function isRangeOverlapping(a: DocumentSheetRange, b: DocumentSheetRange) {
  const aEndRow = a.row + a.rowspan - 1;
  const aEndCol = a.col + a.colspan - 1;
  const bEndRow = b.row + b.rowspan - 1;
  const bEndCol = b.col + b.colspan - 1;

  return !(aEndRow < b.row || bEndRow < a.row || aEndCol < b.col || bEndCol < a.col);
}

function createRangeKey(range: DocumentSheetRange) {
  return [range.row, range.col, range.rowspan, range.colspan].join(':');
}

function isRangeCoveringCell(range: DocumentSheetRange, row: number, col: number) {
  return (
    row >= range.row &&
    row <= range.row + range.rowspan - 1 &&
    col >= range.col &&
    col <= range.col + range.colspan - 1
  );
}

function resolvePlacementByRange(range: DocumentSheetRange) {
  return (
    props.template.placements.find((item) =>
      isRangeCoveringCell(item.range, range.row, range.col)
    ) ?? null
  );
}

function resolvePlacementById(placementId: string | null | undefined) {
  if (!placementId) {
    return null;
  }

  return props.template.placements.find((item) => item.id === placementId) ?? null;
}

function rangeFromSelection(range: IRange): CanvasGridRange {
  return {
    startRow: range.startRow,
    startColumn: range.startColumn,
    endRow: range.endRow,
    endColumn: range.endColumn
  };
}

function cloneStyle(style: DocumentSheetStyle): DocumentSheetStyle {
  return {
    row: style.row,
    col: style.col,
    rowspan: style.rowspan,
    colspan: style.colspan,
    backgroundColor: style.backgroundColor,
    textColor: style.textColor,
    fontSize: style.fontSize,
    fontWeight: style.fontWeight,
    horizontalAlign: style.horizontalAlign,
    verticalAlign: style.verticalAlign,
    wrap: style.wrap,
    border: style.border
      ? {
          ...style.border
        }
      : undefined
  };
}

function resolveStyle(styles: DocumentSheetStyle[], row: number, col: number) {
  const matched = styles.filter((item) => isRangeCoveringCell(item, row, col));
  if (matched.length === 0) {
    return null;
  }

  return matched.reduce<DocumentSheetStyle | null>((result, current) => {
    if (!result) {
      return cloneStyle(current);
    }

    return {
      ...result,
      ...cloneStyle(current),
      border: current.border
        ? {
            ...result.border,
            ...current.border
          }
        : result.border
    };
  }, null);
}

function collectMergedRanges() {
  const pickedRanges: DocumentSheetRange[] = [];
  const seenRangeKeys = new Set<string>();
  const candidates: DocumentSheetRange[] = [
    ...props.template.placements.map((item) => item.range),
    ...props.template.sheet.merges,
    ...props.template.sheet.cells
  ];

  candidates
    .filter((item) => item.rowspan > 1 || item.colspan > 1)
    .forEach((item) => {
      const range: DocumentSheetRange = {
        row: item.row,
        col: item.col,
        rowspan: item.rowspan,
        colspan: item.colspan
      };
      const key = createRangeKey(range);

      if (seenRangeKeys.has(key)) {
        return;
      }

      const hasConflict = pickedRanges.some(
        (existing) => !isSameAnchor(existing, range) && isRangeOverlapping(existing, range)
      );
      if (hasConflict) {
        return;
      }

      seenRangeKeys.add(key);
      pickedRanges.push(range);
    });

  return pickedRanges;
}

function flushRender() {
  renderScheduledRef.value = false;

  if (!canvasReadyRef.value || !renderPendingRef.value) {
    return;
  }

  renderPendingRef.value = false;
  renderCanvas();

  if (renderPendingRef.value) {
    scheduleRender();
  }
}

function scheduleRender() {
  renderPendingRef.value = true;

  if (!canvasReadyRef.value || renderScheduledRef.value) {
    return;
  }

  renderScheduledRef.value = true;
  queueMicrotask(flushRender);
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
  runtime.setup.univerAPI.dispose();

  runtimeRef.value = null;
  selectionMoveStartRef.value = null;
  renderPendingRef.value = false;
  renderScheduledRef.value = false;
  canvasReadyRef.value = false;
}

function applyCellStyle(
  runtime: UniverRuntime,
  cellRange: ReturnType<UniverWorksheet['getRange']>,
  style: DocumentSheetStyle | null
) {
  const horizontalAlign =
    style?.horizontalAlign === 'right' ? 'normal' : (style?.horizontalAlign ?? 'center');

  cellRange
    .setWrap(style?.wrap ?? true)
    .setFontSize(style?.fontSize ?? 12)
    .setHorizontalAlignment(horizontalAlign)
    .setVerticalAlignment((style?.verticalAlign ?? 'middle') as never)
    .setBackground(style?.backgroundColor ?? '#ffffff');

  if (style?.fontWeight === 'bold' || Number(style?.fontWeight) >= 600) {
    cellRange.setFontWeight('bold');
  }

  const borderColor = style?.border?.top?.color ?? '#cbd5e1';
  cellRange.setBorder(
    runtime.setup.univerAPI.Enum.BorderType.ALL,
    runtime.setup.univerAPI.Enum.BorderStyleTypes.THIN,
    borderColor
  );
}

function renderCanvas() {
  const runtime = runtimeRef.value;
  if (!runtime || !canvasReadyRef.value) {
    return;
  }

  const metrics = resolveCanvasGridMetrics(props.template);
  const cells = buildCanvasSheetCells(props.template, props.selectedPlacementId);
  const mergedRanges = collectMergedRanges();

  renderingRef.value = true;

  try {
    runtime.worksheet.clear();
    runtime.worksheet.setRowCount(metrics.maxRows);
    runtime.worksheet.setColumnCount(metrics.maxColumns);
    runtime.worksheet.setColumnWidths(0, metrics.maxColumns, metrics.columnWidth);
    runtime.worksheet.setRowHeightsForced(0, metrics.maxRows, metrics.rowHeight);

    for (let colIndex = 1; colIndex <= props.template.sheet.columns; colIndex += 1) {
      const width = props.template.sheet.columnWidths[String(colIndex)];
      if (width) {
        runtime.worksheet.setColumnWidths(colIndex - 1, 1, width);
      }
    }

    for (let rowIndex = 1; rowIndex <= props.template.sheet.rows; rowIndex += 1) {
      const height = props.template.sheet.rowHeights[String(rowIndex)];
      if (height) {
        runtime.worksheet.setRowHeightsForced(rowIndex - 1, 1, height);
      }
    }

    mergedRanges.forEach((range) => {
      runtime.worksheet.getRange(range.row - 1, range.col - 1, range.rowspan, range.colspan).merge({
        isForceMerge: true
      });
    });

    cells.forEach((cell) => {
      const rootRow = cell.range.startRow + 1;
      const rootCol = cell.range.startColumn + 1;
      const baseStyle = resolveStyle(props.template.sheet.styles, rootRow, rootCol);
      const cellRange = runtime.worksheet.getRange(
        cell.range.startRow,
        cell.range.startColumn,
        cell.rowCount,
        cell.columnCount
      );

      const finalStyle: DocumentSheetStyle | null =
        cell.kind === 'field'
          ? {
              row: rootRow,
              col: rootCol,
              rowspan: cell.rowCount,
              colspan: cell.columnCount,
              backgroundColor: cell.isActive
                ? '#dbeafe'
                : (baseStyle?.backgroundColor ?? '#eff6ff'),
              textColor: baseStyle?.textColor ?? '#1d4ed8',
              fontSize: baseStyle?.fontSize,
              fontWeight: baseStyle?.fontWeight ?? 'bold',
              horizontalAlign: baseStyle?.horizontalAlign ?? 'center',
              verticalAlign: baseStyle?.verticalAlign ?? 'middle',
              wrap: baseStyle?.wrap ?? true,
              border: {
                top: {
                  color: cell.isActive ? '#2563eb' : '#93c5fd',
                  style: 'solid' as const,
                  width: 1
                },
                right: {
                  color: cell.isActive ? '#2563eb' : '#93c5fd',
                  style: 'solid' as const,
                  width: 1
                },
                bottom: {
                  color: cell.isActive ? '#2563eb' : '#93c5fd',
                  style: 'solid' as const,
                  width: 1
                },
                left: {
                  color: cell.isActive ? '#2563eb' : '#93c5fd',
                  style: 'solid' as const,
                  width: 1
                }
              }
            }
          : baseStyle;

      cellRange.setValue(cell.label);
      applyCellStyle(runtime, cellRange, finalStyle);
    });
  } catch (error) {
    console.error('[UniverDocumentCanvas] render failed', error);
  } finally {
    renderingRef.value = false;
  }
}

function bindCanvasEvents(runtime: UniverRuntime) {
  const selectionChangedDisposable = runtime.setup.univerAPI.addEvent(
    runtime.setup.univerAPI.Event.SelectionChanged,
    ({ selections }) => {
      if (renderingRef.value || selections.length === 0) {
        return;
      }

      const range = canvasRangeToAnchor(rangeFromSelection(selections[0]!));
      emit('select-range', range);
      emit('select-placement', resolvePlacementByRange(range)?.id ?? null);
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
      if (renderingRef.value || selections.length === 0 || !props.selectedPlacementId) {
        return;
      }

      const placement = resolvePlacementById(props.selectedPlacementId);
      if (!placement) {
        return;
      }

      const startedRange = selectionMoveStartRef.value;
      selectionMoveStartRef.value = null;

      if (!isSameRange(startedRange, normalizeCanvasRange(anchorToCanvasRange(placement.range)))) {
        return;
      }

      const metrics = resolveCanvasGridMetrics(props.template);
      const nextRange = clampCanvasRange(rangeFromSelection(selections[0]!), metrics);
      const nextAnchor = canvasRangeToAnchor(nextRange);

      if (!isSameAnchor(nextAnchor, placement.range)) {
        emit('update-placement-range', placement.id, nextAnchor);
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

  const runtime: UniverRuntime = {
    setup,
    worksheet: workbook.getActiveSheet(),
    disposables: []
  };

  const lifecycleDisposable = setup.univerAPI.addEvent(
    setup.univerAPI.Event.LifeCycleChanged,
    ({ stage }) => {
      const lifecycleEnum = setup.univerAPI.Enum.LifecycleStages;
      if (stage !== lifecycleEnum.Rendered && stage !== lifecycleEnum.Steady) {
        return;
      }

      canvasReadyRef.value = true;
      scheduleRender();
    }
  );

  runtime.disposables.push(lifecycleDisposable);
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
  () => props.selectedPlacementId,
  () => {
    scheduleRender();
  }
);

watch(
  () => props.activeRange,
  () => {
    scheduleRender();
  },
  { deep: true }
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
    <div
      v-if="props.template.placements.length === 0 && props.template.sheet.cells.length === 0"
      class="univer-canvas-empty"
    >
      先在画布里选区，再点击顶部字段按钮插入组件
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
