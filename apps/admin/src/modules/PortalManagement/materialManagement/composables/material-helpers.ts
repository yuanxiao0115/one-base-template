import type {
  MaterialBizResponse,
  MaterialCategoryRecord,
  MaterialPageData,
  MaterialRecord,
  MaterialSavePayload,
  MaterialUploadDraft,
  UploadResourceResult
} from '../types';

export const MATERIAL_IMAGE_ACCEPT = [
  'image/png',
  'image/gif',
  'image/jpg',
  'image/jpeg',
  'image/bmp',
  'image/svg+xml',
  'image/webp'
] as const;

export const MATERIAL_UPLOAD_LIMIT = 20;
export const MATERIAL_NAME_MAX_LENGTH = 32;
export const MATERIAL_CATEGORY_MAX_LENGTH = 24;
export const MATERIAL_FILE_MAX_SIZE_MB = 10;

export function isBizSuccess(response: MaterialBizResponse<unknown> | null | undefined): boolean {
  const code = response?.code;
  return (
    response?.success === true ||
    code === 200 ||
    code === 0 ||
    String(code) === '200' ||
    String(code) === '0'
  );
}

export function toIdLike(value: unknown): string {
  if (typeof value === 'string') {
    return value.trim();
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }
  return '';
}

export function toSafeName(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function resolveResourceUrl(resourceId: string): string {
  const id = resourceId.trim();
  if (!id) {
    return '';
  }
  if (/^https?:\/\//.test(id) || id.startsWith('/')) {
    return id;
  }
  return `/cmict/file/resource/show?id=${encodeURIComponent(id)}`;
}

export function normalizeCategoryList(input: unknown): MaterialCategoryRecord[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input
    .map((item) => {
      const row = (item ?? {}) as MaterialCategoryRecord;
      return {
        ...row,
        id: toIdLike(row.id),
        labelName: toSafeName(row.labelName),
        count: Number(row.count) || 0
      };
    })
    .filter((item) => typeof item.labelName === 'string' && item.labelName.length > 0);
}

export function normalizeMaterialRows(data: MaterialPageData | null | undefined): MaterialRecord[] {
  const list = Array.isArray(data?.records) ? data?.records : [];
  return list.map((item) => {
    const row = (item ?? {}) as MaterialRecord;
    const fileId = toIdLike(row.fileId);
    return {
      ...row,
      id: toIdLike(row.id),
      fileId,
      fodderName: toSafeName(row.fodderName),
      fodderLabelId: toIdLike(row.fodderLabelId),
      fodderLabelName: toSafeName(row.fodderLabelName),
      previewUrl: resolveResourceUrl(fileId)
    };
  });
}

export function normalizePageTotal(data: MaterialPageData | null | undefined): number {
  const raw = data?.total ?? data?.totalCount ?? 0;
  const total = Number(raw);
  return Number.isFinite(total) ? total : 0;
}

export function normalizeUploadResult(
  data: UploadResourceResult | null | undefined
): UploadResourceResult {
  return {
    ...data,
    id: toIdLike(data?.id),
    fileSize: toSafeName(data?.fileSize),
    fileLength: toSafeName(data?.fileLength),
    fileType: toSafeName(data?.fileType),
    savedPath: toSafeName(data?.savedPath),
    joinUrl: toSafeName(data?.joinUrl)
  };
}

export function toMaterialSavePayload(
  draft: MaterialUploadDraft,
  fodderType: number
): MaterialSavePayload {
  const width = Number(draft.width);
  const height = Number(draft.height);
  const dpi = Number.isFinite(width) && Number.isFinite(height) ? `${width} * ${height}` : '';
  return {
    fodderName: draft.name,
    fodderType,
    fileId: draft.fileId,
    fileLength: draft.fileLength,
    fileSize: draft.fileSize,
    fileType: draft.fileType,
    dpi,
    fodderLabelList:
      draft.fodderLabelIds.length > 0
        ? draft.fodderLabelIds.map((id) => ({ fodderLabelId: id }))
        : [{ fodderLabelId: 0 }]
  };
}

export function toMaterialUpdatePayload(
  row: MaterialRecord,
  fodderType: number
): MaterialSavePayload {
  const rowId = toIdLike(row.id);
  const labelIds = String(row.fodderLabelId || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  return {
    id: rowId,
    fodderName: toSafeName(row.fodderName),
    fodderType,
    fileId: toIdLike(row.fileId),
    fileLength: toSafeName(row.fileLength),
    fileSize: toSafeName(row.fileSize),
    fileType: toSafeName(row.fileType),
    dpi: toSafeName(row.dpi),
    fodderLabelList:
      labelIds.length > 0 ? labelIds.map((id) => ({ fodderLabelId: id })) : [{ fodderLabelId: 0 }]
  };
}
