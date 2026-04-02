import type { CrudFormLike } from '@one-base-template/core';
import type { Ref } from 'vue';

export interface SearchFormExpose {
  resetFields?: () => void;
}

export interface DictSearchFormState {
  dictCode: string;
  dictName: string;
}

export interface DictItemSearchFormState {
  dictId: string;
  itemName: string;
  itemValue: string;
}

export interface DictPageRefs {
  tableRef: Ref<unknown>;
  searchRef: Ref<SearchFormExpose | undefined>;
  editFormRef: Ref<CrudFormLike | undefined>;
  itemTableRef: Ref<unknown>;
  itemSearchRef: Ref<SearchFormExpose | undefined>;
  itemEditFormRef: Ref<CrudFormLike | undefined>;
}

export function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}
