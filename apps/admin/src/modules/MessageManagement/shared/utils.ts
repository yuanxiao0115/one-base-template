export function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export function isCancelled(error: unknown): boolean {
  return error === 'cancel' || error === 'close';
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
