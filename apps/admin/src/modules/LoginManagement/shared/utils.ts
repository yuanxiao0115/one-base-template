export function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

type PageLikeData<T> =
  | {
      records?: T[];
      total?: number;
      totalCount?: number;
    }
  | T[]
  | null
  | undefined;

export function normalizePageRecords<T>(data: PageLikeData<T>): T[] {
  if (Array.isArray(data)) {
    return data;
  }

  if (!data || typeof data !== 'object') {
    return [];
  }

  const records = (data as { records?: T[] }).records;
  return Array.isArray(records) ? records : [];
}

export function normalizePageTotal(data: PageLikeData<unknown>): number {
  if (Array.isArray(data)) {
    return data.length;
  }

  if (!data || typeof data !== 'object') {
    return 0;
  }

  const pageData = data as { total?: number; totalCount?: number; records?: unknown[] };
  if (typeof pageData.total === 'number') {
    return pageData.total;
  }
  if (typeof pageData.totalCount === 'number') {
    return pageData.totalCount;
  }
  return Array.isArray(pageData.records) ? pageData.records.length : 0;
}

export function isHttpUrl(url: string): boolean {
  if (!url) {
    return false;
  }
  return /^(http|https):\/\/[^\s/$.?#].[^\s]*$/i.test(url);
}

export function normalizeFodderId(value: unknown): string {
  if (!value || typeof value !== 'object') {
    if (typeof value === 'string' || typeof value === 'number') {
      return String(value);
    }
    return '';
  }

  const record = value as {
    id?: string | number;
    fodderId?: string | number;
    fileId?: string | number;
  };
  if (record.fodderId != null && record.fodderId !== '') {
    return String(record.fodderId);
  }
  if (record.id != null && record.id !== '') {
    return String(record.id);
  }
  if (record.fileId != null && record.fileId !== '') {
    return String(record.fileId);
  }
  return '';
}
