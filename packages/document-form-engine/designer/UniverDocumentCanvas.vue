<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue';
import { createUniver, LocaleType, type IDisposable, type IRange } from '@univerjs/presets';
import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core';
import zhCN from '@univerjs/preset-sheets-core/locales/zh-CN';
import '@univerjs/preset-sheets-core/lib/index.css';

import type { DocumentSheetRange } from '../schema/sheet';
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
  (e: 'sync-univer-snapshot', snapshot: Record<string, unknown>): void;
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
const suppressSnapshotSyncRef = ref(false);
const snapshotSyncScheduledRef = ref(false);
const snapshotSyncTimerRef = ref<ReturnType<typeof setTimeout> | null>(null);
const lastSnapshotHashRef = ref('');
const lastLoadedSnapshotHashRef = ref('');
const lastStructureHashRef = ref('');
const renderedCellRootsRef = ref<Set<string>>(new Set());

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

function safeSerialize(value: unknown) {
  try {
    return JSON.stringify(value);
  } catch {
    return '';
  }
}

function extractTemplateSnapshot() {
  const snapshot = props.template.designer?.univerSnapshot;
  if (!snapshot || typeof snapshot !== 'object') {
    return null;
  }

  return snapshot as Record<string, unknown>;
}

function buildStructureHash() {
  return safeSerialize({
    rows: props.template.sheet.rows,
    columns: props.template.sheet.columns,
    staticCells: props.template.sheet.cells.map((item) => ({
      row: item.row,
      col: item.col,
      rowspan: item.rowspan,
      colspan: item.colspan,
      value: item.value
    })),
    placements: props.template.placements.map((item) => ({
      id: item.id,
      fieldId: item.fieldId,
      range: item.range
    }))
  });
}

function emitSnapshotIfChanged() {
  if (suppressSnapshotSyncRef.value) {
    return;
  }

  const runtime = runtimeRef.value;
  if (!runtime || !canvasReadyRef.value) {
    return;
  }

  const snapshot = runtime.worksheet.getWorkbook().save();
  const nextHash = safeSerialize(snapshot);
  if (!nextHash || nextHash === lastSnapshotHashRef.value) {
    return;
  }

  lastSnapshotHashRef.value = nextHash;
  emit('sync-univer-snapshot', snapshot as unknown as Record<string, unknown>);
}

function scheduleSnapshotSync(delay = 0) {
  if (delay > 0) {
    if (snapshotSyncTimerRef.value) {
      clearTimeout(snapshotSyncTimerRef.value);
    }

    snapshotSyncTimerRef.value = setTimeout(() => {
      snapshotSyncTimerRef.value = null;
      scheduleSnapshotSync();
    }, delay);
    return;
  }

  if (snapshotSyncScheduledRef.value) {
    return;
  }

  snapshotSyncScheduledRef.value = true;
  queueMicrotask(() => {
    snapshotSyncScheduledRef.value = false;
    emitSnapshotIfChanged();
  });
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
  suppressSnapshotSyncRef.value = false;
  snapshotSyncScheduledRef.value = false;
  if (snapshotSyncTimerRef.value) {
    clearTimeout(snapshotSyncTimerRef.value);
  }
  snapshotSyncTimerRef.value = null;
  lastLoadedSnapshotHashRef.value = '';
  lastStructureHashRef.value = '';
  renderedCellRootsRef.value = new Set();
}

function renderCanvas() {
  const runtime = runtimeRef.value;
  if (!runtime || !canvasReadyRef.value) {
    return;
  }

  const metrics = resolveCanvasGridMetrics(props.template);
  const cells = buildCanvasSheetCells(props.template, props.selectedPlacementId);
  const mergedRanges = collectMergedRanges().map((item) => anchorToCanvasRange(item));
  const templateSnapshot = extractTemplateSnapshot();
  const hasTemplateSnapshot = Boolean(templateSnapshot);
  const templateSnapshotHash = templateSnapshot ? safeSerialize(templateSnapshot) : '';
  const shouldLoadTemplateSnapshot =
    Boolean(templateSnapshotHash) && templateSnapshotHash !== lastLoadedSnapshotHashRef.value;
  const workbook = runtime.worksheet.getWorkbook();
  const structureHash = buildStructureHash();
  const structureChanged = structureHash !== lastStructureHashRef.value;
  if (structureHash) {
    lastStructureHashRef.value = structureHash;
  }

  renderingRef.value = true;
  suppressSnapshotSyncRef.value = true;

  try {
    if (templateSnapshot && shouldLoadTemplateSnapshot) {
      workbook.load(templateSnapshot as never);
      lastLoadedSnapshotHashRef.value = templateSnapshotHash;
      lastSnapshotHashRef.value = templateSnapshotHash;
    } else if (!templateSnapshotHash) {
      lastLoadedSnapshotHashRef.value = '';
    }

    runtime.worksheet.setRowCount(metrics.maxRows);
    runtime.worksheet.setColumnCount(metrics.maxColumns);
    runtime.worksheet.setHiddenGridlines(!props.template.sheet.viewport.showGrid);
    runtime.worksheet.zoom(
      Math.max(0.1, Math.min(4, (props.template.sheet.viewport.zoom || 100) / 100))
    );
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

    if (!hasTemplateSnapshot) {
      mergedRanges.forEach((range) => {
        runtime.worksheet
          .getRange(
            range.startRow,
            range.startColumn,
            range.endRow - range.startRow + 1,
            range.endColumn - range.startColumn + 1
          )
          .merge({
            isForceMerge: true
          });
      });
    }
    if (!hasTemplateSnapshot || structureChanged) {
      renderedCellRootsRef.value.forEach((key) => {
        const [rowPart, colPart] = key.split(':');
        const row = Number(rowPart);
        const col = Number(colPart);
        if (!Number.isFinite(row) || !Number.isFinite(col)) {
          return;
        }

        runtime.worksheet.getRange(row, col, 1, 1).setValue('');
      });

      const nextRoots = new Set<string>();
      cells.forEach((cell) => {
        runtime.worksheet
          .getRange(cell.range.startRow, cell.range.startColumn, 1, 1)
          .setValue(cell.label);
        nextRoots.add(`${cell.range.startRow}:${cell.range.startColumn}`);
      });
      renderedCellRootsRef.value = nextRoots;
    }
  } catch (error) {
    console.error('[UniverDocumentCanvas] render failed', error);
  } finally {
    suppressSnapshotSyncRef.value = false;
    renderingRef.value = false;
    scheduleSnapshotSync();
  }
}

function bindCanvasEvents(runtime: UniverRuntime) {
  const host = hostRef.value;
  const triggerSnapshotSync = () => {
    if (renderingRef.value) {
      return;
    }

    scheduleSnapshotSync(120);
  };

  const selectionChangedDisposable = runtime.setup.univerAPI.addEvent(
    runtime.setup.univerAPI.Event.SelectionChanged,
    ({ selections }) => {
      if (renderingRef.value || selections.length === 0) {
        return;
      }

      const range = canvasRangeToAnchor(rangeFromSelection(selections[0]!));
      emit('select-range', range);
      emit('select-placement', resolvePlacementByRange(range)?.id ?? null);
      scheduleSnapshotSync();
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

      scheduleSnapshotSync();
    }
  );

  const cellDataChangeDisposable = runtime.worksheet.onCellDataChange(() => {
    if (renderingRef.value) {
      return;
    }

    scheduleSnapshotSync();
  });

  const interactiveEventNames = ['pointerup', 'keyup', 'paste', 'cut', 'drop'];
  if (host) {
    interactiveEventNames.forEach((eventName) => {
      host.addEventListener(eventName, triggerSnapshotSync, true);
    });
  }

  runtime.disposables.push(
    selectionChangedDisposable,
    selectionMoveStartDisposable,
    selectionMoveEndDisposable
  );
  if (cellDataChangeDisposable) {
    runtime.disposables.push(cellDataChangeDisposable);
  }
  runtime.disposables.push({
    dispose: () => {
      if (!host) {
        return;
      }

      interactiveEventNames.forEach((eventName) => {
        host.removeEventListener(eventName, triggerSnapshotSync, true);
      });
    }
  });
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
        header: true,
        toolbar: true,
        formulaBar: true,
        footer: false,
        contextMenu: true
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
