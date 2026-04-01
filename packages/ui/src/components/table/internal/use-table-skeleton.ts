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

const FIRST_LOAD_PREHEAT_MAX_WAIT_MS = 800;

export function useTableSkeleton(options: UseTableSkeletonOptions) {
  const showFirstLoadSkeleton = ref(false);
  const skeletonShownAt = ref(0);
  const hasFirstLoadStarted = ref(false);
  const hasFirstLoadCompleted = ref(false);
  let skeletonHideTimer: ReturnType<typeof setTimeout> | null = null;
  let firstLoadBailoutTimer: ReturnType<typeof setTimeout> | null = null;

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

  const shouldKeepFirstLoadPending = computed(() => {
    if (!options.enabled.value) {
      return false;
    }
    if (hasFirstLoadCompleted.value) {
      return false;
    }
    if (options.dataLength.value > 0) {
      return false;
    }
    return true;
  });

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
    if (skeletonHideTimer) {
      clearTimeout(skeletonHideTimer);
      skeletonHideTimer = null;
    }
    if (firstLoadBailoutTimer) {
      clearTimeout(firstLoadBailoutTimer);
      firstLoadBailoutTimer = null;
    }
  }

  function scheduleFirstLoadBailout() {
    if (firstLoadBailoutTimer) {
      clearTimeout(firstLoadBailoutTimer);
    }

    const dynamicWait = options.skeletonDelayMs.value + options.skeletonMinDurationMs.value;
    const maxWait = Math.max(FIRST_LOAD_PREHEAT_MAX_WAIT_MS, dynamicWait);

    firstLoadBailoutTimer = setTimeout(() => {
      firstLoadBailoutTimer = null;
      if (
        !hasFirstLoadCompleted.value &&
        !options.loading.value &&
        options.dataLength.value === 0
      ) {
        completeFirstLoad();
      }
    }, maxWait);
  }

  function startFirstLoad() {
    if (hasFirstLoadStarted.value) {
      return;
    }

    hasFirstLoadStarted.value = true;
    showSkeletonNow();
    scheduleFirstLoadBailout();
  }

  function scheduleHideFirstLoadSkeleton() {
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

  function completeFirstLoad() {
    if (hasFirstLoadCompleted.value) {
      return;
    }

    if (firstLoadBailoutTimer) {
      clearTimeout(firstLoadBailoutTimer);
      firstLoadBailoutTimer = null;
    }

    hasFirstLoadCompleted.value = true;
    scheduleHideFirstLoadSkeleton();
  }

  watch(
    shouldKeepFirstLoadPending,
    (pending) => {
      if (!pending) {
        completeFirstLoad();
        return;
      }

      if (!hasFirstLoadStarted.value) {
        startFirstLoad();
      }
    },
    { immediate: true }
  );

  watch(
    () => options.loading.value,
    (loading) => {
      if (!shouldKeepFirstLoadPending.value) {
        return;
      }

      if (loading) {
        if (!hasFirstLoadStarted.value) {
          startFirstLoad();
        }
        if (firstLoadBailoutTimer) {
          clearTimeout(firstLoadBailoutTimer);
          firstLoadBailoutTimer = null;
        }
        return;
      }

      if (hasFirstLoadStarted.value) {
        completeFirstLoad();
      }
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
    shouldKeepFirstLoadPending
  };
}
