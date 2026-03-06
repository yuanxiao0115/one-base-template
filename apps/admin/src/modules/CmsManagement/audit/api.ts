import { extractList, toNumberValue, toRecord, toStringValue } from "@/shared/api/normalize";
import { getHttpClient, trimText } from "@/shared/api/utils";

export interface BizResponse<T> {
  code: number;
  data: T;
  message?: string;
}

export type ReviewStatus = 0 | 1 | 2;

export interface ReviewCategoryItem {
  id: number;
  categoryName: string;
}

export interface PageData<T> {
  records: T[];
  total: number;
  currentPage: number;
  pageSize: number;
}

export interface ArticleListParams {
  articleTitle?: string;
  articleType?: number | string;
  reviewStatus?: number | string;
  currentPage?: number;
  pageSize?: number;
}

export interface CommentListParams {
  articleTitle?: string;
  commentatorName?: string;
  reviewStatus?: number | string;
  currentPage?: number;
  pageSize?: number;
}

export interface ArticleAuditRecord {
  id: number;
  articleTitle: string;
  articleType: number;
  articleTypeLabel: string;
  articleAuthorName: string;
  publishTime: string;
  reviewStatus: ReviewStatus;
  reviewerName: string;
  creator: string;
}

export interface ArticleDetail {
  id: number;
  articleTitle: string;
  articleAuthorName: string;
  articleContent: string;
  publishTime: string;
  reviewStatus: ReviewStatus;
  reviewOpinion: string;
}

export interface ArticleReviewPayload {
  id: number;
  reviewStatus: 1 | 2;
  reviewOpinion: string;
}

export interface CommentAuditRecord {
  id: number;
  cmsArticleId: number;
  articleTitle: string;
  articleType: number;
  articleTypeLabel: string;
  commentatorName: string;
  commentContent: string;
  commentTime: string;
  reviewStatus: ReviewStatus;
  reviewerName: string;
}

export interface CommentDetail {
  id: number;
  cmsArticleId: number;
  articleTitle: string;
  articleType: number;
  articleTypeLabel: string;
  commentatorName: string;
  commentContent: string;
  commentTime: string;
  reviewStatus: ReviewStatus;
  reviewerName: string;
  reviewOpinion: string;
  cmsCategoryList: ReviewCategoryItem[];
}

export interface CommentReviewPayload {
  id: number;
  reviewStatus: 1 | 2;
  reviewOpinion: string;
}

export type CommentDeletePayload = { id: number; cmsArticleId: number } | { ids: number[] };

const ARTICLE_TYPE_LABEL_MAP: Record<number, string> = {
  1: "原创",
  2: "转载",
};

function normalizeOptionalNumber(value: number | string | undefined): number | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  const result = toNumberValue(value, NaN);
  return Number.isFinite(result) ? result : undefined;
}

function normalizeReviewStatus(value: unknown): ReviewStatus {
  const status = toNumberValue(value, 0);
  if (status === 1 || status === 2) {
    return status;
  }
  return 0;
}

function resolveArticleTypeLabel(articleType: number): string {
  return ARTICLE_TYPE_LABEL_MAP[articleType] || "未知";
}

function toPageData<T>(data: unknown, rowMapper: (item: unknown) => T): PageData<T> {
  const payload = toRecord(data);
  const result = toRecord(payload.result);
  const records = extractList(payload).length > 0 ? extractList(payload).map(rowMapper) : extractList(result).map(rowMapper);

  return {
    records,
    total: toNumberValue(
      payload.totalCount ?? payload.total ?? payload.count ?? result.totalCount ?? result.total ?? result.count,
      records.length
    ),
    currentPage: toNumberValue(payload.currentPage ?? payload.current ?? payload.page ?? result.currentPage ?? result.current ?? result.page, 1),
    pageSize: toNumberValue(payload.pageSize ?? payload.size ?? result.pageSize ?? result.size, 10),
  };
}

function toReviewCategoryItem(item: unknown): ReviewCategoryItem {
  const row = toRecord(item);
  return {
    id: toNumberValue(row.id, 0),
    categoryName: toStringValue(row.categoryName),
  };
}

function toArticleAuditRecord(item: unknown): ArticleAuditRecord {
  const row = toRecord(item);
  const articleType = toNumberValue(row.articleType, 0);

  return {
    id: toNumberValue(row.id, 0),
    articleTitle: toStringValue(row.articleTitle),
    articleType,
    articleTypeLabel: resolveArticleTypeLabel(articleType),
    articleAuthorName: toStringValue(row.articleAuthorName),
    publishTime: toStringValue(row.publishTime),
    reviewStatus: normalizeReviewStatus(row.reviewStatus),
    reviewerName: toStringValue(row.reviewerName),
    creator: toStringValue(row.creator ?? row.creatorName),
  };
}

function toArticleDetail(item: unknown): ArticleDetail {
  const row = toRecord(item);

  return {
    id: toNumberValue(row.id, 0),
    articleTitle: toStringValue(row.articleTitle),
    articleAuthorName: toStringValue(row.articleAuthorName),
    articleContent: toStringValue(row.articleContent),
    publishTime: toStringValue(row.publishTime),
    reviewStatus: normalizeReviewStatus(row.reviewStatus),
    reviewOpinion: toStringValue(row.reviewOpinion ?? row.reviewRemark),
  };
}

function toCommentAuditRecord(item: unknown): CommentAuditRecord {
  const row = toRecord(item);
  const articleType = toNumberValue(row.articleType, 0);

  return {
    id: toNumberValue(row.id, 0),
    cmsArticleId: toNumberValue(row.cmsArticleId, 0),
    articleTitle: toStringValue(row.articleTitle),
    articleType,
    articleTypeLabel: resolveArticleTypeLabel(articleType),
    commentatorName: toStringValue(row.commentatorName),
    commentContent: toStringValue(row.commentContent),
    commentTime: toStringValue(row.commentTime),
    reviewStatus: normalizeReviewStatus(row.reviewStatus),
    reviewerName: toStringValue(row.reviewerName),
  };
}

function toCommentDetail(item: unknown): CommentDetail {
  const row = toRecord(item);
  const articleType = toNumberValue(row.articleType, 0);

  return {
    id: toNumberValue(row.id, 0),
    cmsArticleId: toNumberValue(row.cmsArticleId, 0),
    articleTitle: toStringValue(row.articleTitle),
    articleType,
    articleTypeLabel: resolveArticleTypeLabel(articleType),
    commentatorName: toStringValue(row.commentatorName),
    commentContent: toStringValue(row.commentContent),
    commentTime: toStringValue(row.commentTime),
    reviewStatus: normalizeReviewStatus(row.reviewStatus),
    reviewerName: toStringValue(row.reviewerName),
    reviewOpinion: toStringValue(row.reviewOpinion),
    cmsCategoryList: extractList(row.cmsCategoryList).map((entry) => toReviewCategoryItem(entry)),
  };
}

function normalizeCommentDeletePayload(payload: CommentDeletePayload): CommentDeletePayload {
  if ("ids" in payload) {
    return {
      ids: payload.ids.map((id) => toNumberValue(id, 0)).filter((id) => id > 0),
    };
  }

  return {
    id: toNumberValue(payload.id, 0),
    cmsArticleId: toNumberValue(payload.cmsArticleId, 0),
  };
}

export const auditApi = {
  listArticles: async (params: ArticleListParams) =>
    getHttpClient()
      .get<BizResponse<unknown>>("/cmict/cms/cmsArticleManage", {
        params: {
          articleTitle: trimText(params.articleTitle),
          articleType: normalizeOptionalNumber(params.articleType),
          reviewStatus: normalizeOptionalNumber(params.reviewStatus),
          currentPage: params.currentPage,
          pageSize: params.pageSize,
        },
      })
      .then((response) => ({
        ...response,
        data: toPageData(response.data, toArticleAuditRecord),
      })),

  getArticleDetail: async (id: number) =>
    getHttpClient().get<BizResponse<unknown>>(`/cmict/cms/cmsArticleManage/${id}`).then((response) => ({
      ...response,
      data: toArticleDetail(response.data),
    })),

  reviewArticle: async (payload: ArticleReviewPayload) =>
    getHttpClient().post<BizResponse<boolean>>("/cmict/cms/cmsReview", {
      data: {
        id: payload.id,
        reviewStatus: payload.reviewStatus,
        reviewOpinion: trimText(payload.reviewOpinion),
      },
    }),

  listComments: async (params: CommentListParams) =>
    getHttpClient()
      .get<BizResponse<unknown>>("/cmict/cms/cmsComment/list", {
        params: {
          articleTitle: trimText(params.articleTitle),
          commentatorName: trimText(params.commentatorName),
          reviewStatus: normalizeOptionalNumber(params.reviewStatus),
          currentPage: params.currentPage,
          pageSize: params.pageSize,
        },
      })
      .then((response) => ({
        ...response,
        data: toPageData(response.data, toCommentAuditRecord),
      })),

  getCommentDetail: async (id: number) =>
    getHttpClient().get<BizResponse<unknown>>(`/cmict/cms/cmsComment/${id}`).then((response) => ({
      ...response,
      data: toCommentDetail(response.data),
    })),

  reviewComment: async (payload: CommentReviewPayload) =>
    getHttpClient().post<BizResponse<boolean>>("/cmict/cms/cmsComment/review", {
      data: {
        id: payload.id,
        reviewStatus: payload.reviewStatus,
        reviewOpinion: trimText(payload.reviewOpinion),
      },
    }),

  removeComment: async (payload: CommentDeletePayload) =>
    getHttpClient().delete<BizResponse<boolean>>("/cmict/cms/cmsComment", {
      data: normalizeCommentDeletePayload(payload),
    }),
};

export default auditApi;
