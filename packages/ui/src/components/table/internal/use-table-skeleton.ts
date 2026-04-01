import { computed, onBeforeUnmount, ref, watch, type ComputedRef } from 'vue';
import type { TableColumnList } from '../types';

interface UseTableSkeletonOptions {
  enabled: ComputedRef<boolean>;
  loading: ComputedRef<boolean>;
  dataLength: ComputedRef<number>;
  columns: ComputedRef<TableColumnList>;
  skeletonRows: ComputedRef<number>;
  skeletonDelayMs: ComputedRef<number>;
  skeletonMinDurationMs: ComputedRef<number>;
}

export function useTableSkeleton(options: UseTableSkeletonOptions) {
  const showFirstLoadSkeleton = ref(false);
  const skeletonShownAt = ref(0);
  let skeletonDelayTimer: ReturnType<typeof setTimeout> | null = null;
  let skeletonHideTimer: ReturnType<typeof setTimeout> | null = null;

  const resolvedSkeletonRows = computed(() => {
    const rows = Number(options.skeletonRows.value || 0);
    if (!Number.isFinite(rows) || rows <= 0) {
      return 8;
    }
    return Math.max(1, Math.floor(rows));
  });

  const skeletonCellCount = computed(() => {
    const count = Array.isArray(options.columns.value) ? options.columns.value.length : 0;
    return Math.min(Math.max(count || 4, 3), 8);
  });

  const shouldUseFirstLoadSkeleton = computed(
    () => options.enabled.value && options.loading.value && options.dataLength.value === 0
  );

  function showSkeletonNow() {
    if (showFirstLoadSkeleton.value) {
      return;
    }
    skeletonShownAt.value = Date.now();
    showFirstLoadSkeleton.value = true;
  }

  function hideFirstLoadSkeleton() {
    showFirstLoadSkeleton.value = false;
    skeletonShownAt.value = 0;
  }

  function clearSkeletonTimers() {
    if (skeletonDelayTimer) {
      clearTimeout(skeletonDelayTimer);
      skeletonDelayTimer = null;
    }
    if (skeletonHideTimer) {
      clearTimeout(skeletonHideTimer);
      skeletonHideTimer = null;
    }
  }

  function scheduleShowFirstLoadSkeleton() {
    if (showFirstLoadSkeleton.value || skeletonDelayTimer) {
      return;
    }

    if (skeletonHideTimer) {
      clearTimeout(skeletonHideTimer);
      skeletonHideTimer = null;
    }

    skeletonDelayTimer = setTimeout(() => {
      skeletonDelayTimer = null;
      if (shouldUseFirstLoadSkeleton.value) {
        showSkeletonNow();
      }
    }, options.skeletonDelayMs.value);
  }

  function scheduleHideFirstLoadSkeleton() {
    if (skeletonDelayTimer) {
      clearTimeout(skeletonDelayTimer);
      skeletonDelayTimer = null;
    }
    if (!showFirstLoadSkeleton.value) {
      return;
    }

    const elapsed = Date.now() - skeletonShownAt.value;
    const remaining = Math.max(options.skeletonMinDurationMs.value - elapsed, 0);
    if (remaining <= 0) {
      hideFirstLoadSkeleton();
      return;
    }

    if (skeletonHideTimer) {
      clearTimeout(skeletonHideTimer);
    }
    skeletonHideTimer = setTimeout(() => {
      skeletonHideTimer = null;
      hideFirstLoadSkeleton();
    }, remaining);
  }

  watch(
    shouldUseFirstLoadSkeleton,
    (enabled) => {
      if (enabled) {
        scheduleShowFirstLoadSkeleton();
        return;
      }
      scheduleHideFirstLoadSkeleton();
    },
    { immediate: true }
  );

  onBeforeUnmount(() => {
    clearSkeletonTimers();
    hideFirstLoadSkeleton();
  });

  return {
    showFirstLoadSkeleton,
    resolvedSkeletonRows,
    skeletonCellCount,
    shouldUseFirstLoadSkeleton
  };
}
