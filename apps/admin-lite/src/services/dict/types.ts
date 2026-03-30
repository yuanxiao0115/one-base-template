export interface DictServiceItem {
  itemName?: unknown;
  itemValue?: unknown;
  [key: string]: unknown;
}

export interface DictOption {
  label: string;
  value: string;
}

export interface DictResource {
  list: DictOption[];
  map: Record<string, string>;
}

export interface DictLoadOptions {
  force?: boolean;
  ttlMs?: number;
}

export interface DictServiceDeps {
  fetchItems?: (dictCode: string) => Promise<DictServiceItem[]>;
  getStorageNamespace?: () => string;
  sessionStorage?: Storage | null;
  now?: () => number;
  defaultTtlMs?: number;
}
