import type { ApiPageData } from "@/shared/api/types";

export type { ApiResponse } from "@/shared/api/types";

export type ReviewStatus = 0 | 1 | 2;
type LooseField = string | number | boolean | null | undefined | Array<unknown> | Record<string, unknown>;

export interface ReviewCategoryItem {
  id: number;
  categoryName?: string;
  [key: string]: LooseField;
}

export type AuditPageData<T> = ApiPageData<T>;

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
  reviewStatus: ReviewStatus | number;
  articleTitle?: string;
  articleType?: number;
  articleTypeLabel?: string;
  articleAuthorName?: string;
  publishTime?: string;
  reviewerName?: string;
  creator?: string;
  [key: string]: LooseField;
}

export interface ArticleDetail {
  id: number;
  reviewStatus: ReviewStatus | number;
  articleTitle?: string;
  articleAuthorName?: string;
  articleContent?: string;
  publishTime?: string;
  reviewOpinion?: string;
  [key: string]: LooseField;
}

export interface ArticleReviewPayload {
  id: number;
  reviewStatus: 1 | 2;
  reviewOpinion: string;
}

export interface CommentAuditRecord {
  id: number;
  cmsArticleId: number;
  reviewStatus: ReviewStatus | number;
  articleTitle?: string;
  articleType?: number;
  articleTypeLabel?: string;
  commentatorName?: string;
  commentContent?: string;
  commentTime?: string;
  reviewerName?: string;
  [key: string]: LooseField;
}

export interface CommentDetail {
  id: number;
  cmsArticleId: number;
  reviewStatus: ReviewStatus | number;
  articleTitle?: string;
  articleType?: number;
  articleTypeLabel?: string;
  commentatorName?: string;
  commentContent?: string;
  commentTime?: string;
  reviewerName?: string;
  reviewOpinion?: string;
  cmsCategoryList?: ReviewCategoryItem[];
  [key: string]: LooseField;
}

export interface CommentReviewPayload {
  id: number;
  reviewStatus: 1 | 2;
  reviewOpinion: string;
}

export type CommentDeletePayload = { id: number; cmsArticleId: number } | { ids: number[] };
