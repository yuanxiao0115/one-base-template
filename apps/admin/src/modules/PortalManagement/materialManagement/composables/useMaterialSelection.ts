import { computed, ref, type Ref } from 'vue';
import type { MaterialRecord } from '../types';
import { toIdLike } from './material-helpers';

interface UseMaterialSelectionOptions {
  rows: Ref<MaterialRecord[]>;
}

export function useMaterialSelection(options: UseMaterialSelectionOptions) {
  const selectedRowIds = ref<string[]>([]);

  const allChecked = computed(() => {
    if (!options.rows.value.length) {
      return false;
    }
    return options.rows.value.every((item) => item.checked === true);
  });

  function clearSelection() {
    selectedRowIds.value = [];
    options.rows.value = options.rows.value.map((item) => ({ ...item, checked: false }));
  }

  function applyRows(rows: MaterialRecord[]) {
    const selectedSet = new Set(selectedRowIds.value);
    options.rows.value = rows.map((item) => {
      const rowId = toIdLike(item.id);
      return {
        ...item,
        checked: selectedSet.has(rowId)
      };
    });
  }

  function toggleRowChecked(row: MaterialRecord, checked: boolean) {
    const id = toIdLike(row.id);
    if (!id) {
      return;
    }

    const nextSet = new Set(selectedRowIds.value);
    if (checked) {
      nextSet.add(id);
    } else {
      nextSet.delete(id);
    }
    selectedRowIds.value = Array.from(nextSet);
    row.checked = checked;
  }

  function toggleAllChecked(checked: boolean) {
    const nextSet = new Set(selectedRowIds.value);
    options.rows.value.forEach((row) => {
      row.checked = checked;
      const id = toIdLike(row.id);
      if (!id) {
        return;
      }
      if (checked) {
        nextSet.add(id);
      } else {
        nextSet.delete(id);
      }
    });
    selectedRowIds.value = Array.from(nextSet);
  }

  return {
    selectedRowIds,
    allChecked,
    clearSelection,
    applyRows,
    toggleRowChecked,
    toggleAllChecked
  };
}
