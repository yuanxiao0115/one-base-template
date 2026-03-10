import { getHttpClient } from "@/shared/api/http-client";
import { portalEndpoints } from "./endpoints";

interface BizResponse<T> {
  code?: unknown;
  data?: T;
  message?: string;
  success?: boolean;
}

function getHttp() {
  return getHttpClient();
}

/**
 * cMS 接口（party-building 组件依赖）
 *
 * 说明：
 * - 这些接口来自老项目 pc-portal/api.ts
 * - 目前仅实现 party-building 已迁移组件所需的最小子集
 */
export const cmsApi = {
  // 获取栏目分类树
  getCategoryTree: async () => getHttp().get<BizResponse<unknown>>(portalEndpoints.cms.categoryTree),

  // 用户端根据栏目分类获取文章列表
  getUserArticlesByCategory: async (category: string, params?: { pageSize?: number; currentPage?: number }) =>
    getHttp().get<BizResponse<unknown>>(`${portalEndpoints.cms.userArticleListPrefix}/${category}/article/list`, {
      params: {
        pageSize: params?.pageSize ?? 20,
        currentPage: params?.currentPage ?? 1,
      },
    }),

  // 用户端根据栏目分类获取轮播图列表（固定 pageSize=20,currentPage=1）
  getUserCarouselsByCategory: async (category: string) =>
    getHttp().get<BizResponse<unknown>>(`${portalEndpoints.cms.userCarouselListPrefix}/${category}/carousel/list`, {
      params: {
        pageSize: 20,
        currentPage: 1,
      },
    }),
};
