import { extractList, toNumberValue, toRecord, toStringValue } from "@/shared/api/normalize";
import { getHttpClient, trimText } from "@/shared/api/utils";

export interface BizResponse<T> {
  code: number;
  data: T;
  message?: string;
}

export interface ContentAttachment {
  id?: string;
  attachmentName: string;
  attachmentUrl: string;
}

export interface ContentCategoryRecord {
  id: string;
  categoryName: string;
  parentCategoryId: string;
  children?: ContentCategoryRecord[];
}

export interface ContentRecord {
  id: string;
  articleTitle: string;
  articleType: number;
  articleAuthorName: string;
  articleContent: string;
  publishTime: string;
  coverUrl: string;
  articleSource: string;
  outerHref: string;
  browseAmount: number;
  likeAmount: number;
  commentAmount: number;
  reviewStatus: number;
  cmsCategoryIdList: string[];
  cmsArticleAttachmentList: ContentAttachment[];
}

export interface ContentDetail extends ContentRecord {
  cmsCategoryList: Array<{
    id: string;
    categoryName: string;
  }>;
}

export interface ContentPageParams {
  articleTitle?: string;
  cmsCategoryId?: string;
  articleType?: number | "";
  currentPage?: number;
  pageSize?: number;
}

export interface ContentPageData {
  records: ContentRecord[];
  total: number;
  currentPage: number;
  pageSize: number;
}

export interface ContentSavePayload {
  id?: string;
  articleTitle: string;
  cmsCategoryIdList: string[];
  articleType: number;
  articleAuthorName: string;
  articleContent: string;
  publishTime: string;
  coverUrl: string;
  articleSource: string;
  outerHref: string;
  cmsArticleAttachmentList: ContentAttachment[];
}

interface RawPageData {
  records?: unknown[];
  list?: unknown[];
  rows?: unknown[];
  items?: unknown[];
  total?: number | string | null;
  totalCount?: number | string | null;
  count?: number | string | null;
  currentPage?: number | string | null;
  current?: number | string | null;
  page?: number | string | null;
  pageSize?: number | string | null;
  size?: number | string | null;
}

interface RawContentAttachment {
  id?: number | string | null;
  attachmentName?: string | null;
  attachmentUrl?: string | null;
  fileName?: string | null;
  url?: string | null;
}

interface RawCategoryItem {
  id?: number | string | null;
  categoryName?: string | null;
}

interface RawContentRecord {
  id?: number | string | null;
  articleTitle?: string | null;
  articleType?: number | string | null;
  articleAuthorName?: string | null;
  articleContent?: string | null;
  publishTime?: string | null;
  coverUrl?: string | null;
  articleSource?: string | null;
  outerHref?: string | null;
  browseAmount?: number | string | null;
  likeAmount?: number | string | null;
  commentAmount?: number | string | null;
  reviewStatus?: number | string | null;
  cmsCategoryIdList?: unknown;
  cmsCategoryList?: unknown;
  cmsArticleAttachmentList?: unknown;
}

interface RawCategoryRecord {
  id?: number | string | null;
  parentCategoryId?: number | string | null;
  categoryName?: string | null;
  name?: string | null;
  children?: unknown;
}

function toPageData<T>(data: unknown, mapRow: (item: unknown) => T) {
  const payload = toRecord(data) as RawPageData;
  const records = extractList(payload).map((item) => mapRow(item));

  return {
    records,
    total: toNumberValue(payload.totalCount ?? payload.total ?? payload.count, records.length),
    currentPage: toNumberValue(payload.currentPage ?? payload.current ?? payload.page, 1),
    pageSize: toNumberValue(payload.pageSize ?? payload.size, 10),
  };
}

function toContentAttachment(item: unknown): ContentAttachment {
  const row = (item ?? {}) as RawContentAttachment;

  return {
    id: toStringValue(row.id),
    attachmentName: toStringValue(row.attachmentName || row.fileName),
    attachmentUrl: toStringValue(row.attachmentUrl || row.url),
  };
}

function extractCategoryIds(row: RawContentRecord): string[] {
  const directIds = extractList(row.cmsCategoryIdList).map((item) => toStringValue(item)).filter(Boolean);

  if (directIds.length > 0) {
    return Array.from(new Set(directIds));
  }

  return extractList(row.cmsCategoryList)
    .map((item) => toStringValue(toRecord(item).id))
    .filter(Boolean);
}

function toContentRecord(item: unknown): ContentRecord {
  const row = (item ?? {}) as RawContentRecord;

  return {
    id: toStringValue(row.id),
    articleTitle: toStringValue(row.articleTitle),
    articleType: toNumberValue(row.articleType, 1),
    articleAuthorName: toStringValue(row.articleAuthorName),
    articleContent: toStringValue(row.articleContent),
    publishTime: toStringValue(row.publishTime),
    coverUrl: toStringValue(row.coverUrl),
    articleSource: toStringValue(row.articleSource),
    outerHref: toStringValue(row.outerHref),
    browseAmount: toNumberValue(row.browseAmount, 0),
    likeAmount: toNumberValue(row.likeAmount, 0),
    commentAmount: toNumberValue(row.commentAmount, 0),
    reviewStatus: toNumberValue(row.reviewStatus, 0),
    cmsCategoryIdList: extractCategoryIds(row),
    cmsArticleAttachmentList: extractList(row.cmsArticleAttachmentList)
      .map((attachment) => toContentAttachment(attachment))
      .filter((attachment) => Boolean(attachment.attachmentUrl)),
  };
}

function toContentDetail(item: unknown): ContentDetail {
  const row = (item ?? {}) as RawContentRecord;
  const record = toContentRecord(item);

  return {
    ...record,
    cmsCategoryList: extractList(row.cmsCategoryList)
      .map((category) => {
        const categoryRecord = toRecord(category) as RawCategoryItem;
        const id = toStringValue(categoryRecord.id);

        return {
          id,
          categoryName: toStringValue(categoryRecord.categoryName),
        };
      })
      .filter((category) => Boolean(category.id)),
  };
}

function toCategoryRecord(item: unknown): ContentCategoryRecord {
  const row = (item ?? {}) as RawCategoryRecord;
  const children = extractList(row.children).map((child) => toCategoryRecord(child));

  return {
    id: toStringValue(row.id),
    parentCategoryId: toStringValue(row.parentCategoryId),
    categoryName: toStringValue(row.categoryName || row.name),
    children: children.length > 0 ? children : undefined,
  };
}

function normalizeArticleType(value: ContentPageParams["articleType"]) {
  if (value === "" || value === undefined || value === null) {
    return undefined;
  }
  return Number(value);
}

export const contentApi = {
  page: async (params: ContentPageParams) =>
    getHttpClient()
      .get<BizResponse<ContentPageData>>("/cmict/cms/cmsArticleManage", {
        params: {
          articleTitle: trimText(params.articleTitle),
          cmsCategoryId: trimText(params.cmsCategoryId),
          articleType: normalizeArticleType(params.articleType),
          currentPage: params.currentPage,
          pageSize: params.pageSize,
        },
      })
      .then((response) => ({
        ...response,
        data: toPageData(response.data, toContentRecord),
      })),

  detail: async (id: string) =>
    getHttpClient().get<BizResponse<ContentDetail>>(`/cmict/cms/cmsArticleManage/${id}`).then((response) => ({
      ...response,
      data: toContentDetail(response.data),
    })),

  add: async (data: ContentSavePayload) =>
    getHttpClient().post<BizResponse<boolean>>("/cmict/cms/cmsArticleManage", {
      data,
    }),

  update: async (data: ContentSavePayload) =>
    getHttpClient().put<BizResponse<boolean>>("/cmict/cms/cmsArticleManage", {
      data,
    }),

  remove: async (data: { id: string }) =>
    getHttpClient().delete<BizResponse<boolean>>("/cmict/cms/cmsArticleManage", {
      data,
    }),

  categoryTree: async () =>
    getHttpClient().get<BizResponse<ContentCategoryRecord[]>>("/cmict/cms/cmsCategory/tree").then((response) => ({
      ...response,
      data: extractList(response.data).map((item) => toCategoryRecord(item)),
    })),
};

export default contentApi;
