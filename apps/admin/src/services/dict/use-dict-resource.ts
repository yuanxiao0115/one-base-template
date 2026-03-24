import { computed, ref, toValue, watch, type MaybeRefOrGetter, type Ref } from 'vue';
import { loadDictResource } from './dict-resource-service';
import type { DictLoadOptions, DictOption } from './types';

export interface UseDictResourceOptions {
  immediate?: boolean;
  ttlMs?: number;
  resetOnCodeChange?: boolean;
}

export interface UseDictResourceState {
  list: Ref<DictOption[]>;
  map: Ref<Record<string, string>>;
  loading: Ref<boolean>;
  error: Ref<unknown>;
  reload: (
    options?: DictLoadOptions
  ) => Promise<{ list: DictOption[]; map: Record<string, string> }>;
}

function normalizeCode(raw: unknown): string {
  return typeof raw === 'string' ? raw.trim() : '';
}

export function useDictResource(
  dictCode: MaybeRefOrGetter<string>,
  options: UseDictResourceOptions = {}
): UseDictResourceState {
  const list = ref<DictOption[]>([]);
  const map = ref<Record<string, string>>({});
  const loading = ref(false);
  const error = ref<unknown>(null);

  const immediate = options.immediate !== false;
  const resetOnCodeChange = options.resetOnCodeChange !== false;

  const normalizedCode = computed(() => normalizeCode(toValue(dictCode)));

  function resetResource() {
    list.value = [];
    map.value = {};
  }

  async function reload(loadOptions: DictLoadOptions = {}) {
    const code = normalizedCode.value;
    if (!code) {
      error.value = null;
      resetResource();
      return {
        list: list.value,
        map: map.value
      };
    }

    loading.value = true;
    error.value = null;

    try {
      const resource = await loadDictResource(code, {
        ...loadOptions,
        ttlMs: loadOptions.ttlMs ?? options.ttlMs
      });
      list.value = resource.list;
      map.value = resource.map;
      return resource;
    } catch (currentError) {
      error.value = currentError;
      resetResource();
      throw currentError;
    } finally {
      loading.value = false;
    }
  }

  watch(
    normalizedCode,
    (currentCode, previousCode) => {
      if (currentCode === previousCode) {
        return;
      }

      if (resetOnCodeChange) {
        resetResource();
      }

      if (!currentCode) {
        error.value = null;
        return;
      }

      if (immediate) {
        void reload();
      }
    },
    {
      immediate
    }
  );

  return {
    list,
    map,
    loading,
    error,
    reload
  };
}
