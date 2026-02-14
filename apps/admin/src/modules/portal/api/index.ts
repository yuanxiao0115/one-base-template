import { getObHttpClient } from '@/infra/http';

type BizResponse<T> = {
  code?: unknown;
  data?: T;
  message?: string;
  success?: boolean;
};

function getHttp() {
  return getObHttpClient();
}

/**
 * CMS 接口（party-building 组件依赖）
 *
 * 说明：
 * - 这些接口来自老项目 pc-portal/api.ts
 * - 目前仅实现 party-building 已迁移组件所需的最小子集
 */
export const cmsApi = {
  // 获取栏目分类树
  getCategoryTree: () => getHttp().get<BizResponse<unknown>>('/cmict/cms/cmsCategory/tree'),

  // 用户端根据栏目分类获取文章列表
  getUserArticlesByCategory: (category: string, params?: { pageSize?: number; currentPage?: number }) =>
    getHttp().get<BizResponse<unknown>>(`/cmict/cms/cmsUser/category/${category}/article/list`, {
      params: { pageSize: params?.pageSize ?? 20, currentPage: params?.currentPage ?? 1 },
    }),

  // 用户端根据栏目分类获取轮播图列表（固定 pageSize=20,currentPage=1）
  getUserCarouselsByCategory: (category: string) =>
    getHttp().get<BizResponse<unknown>>(`/cmict/cms/cmsUser/category/${category}/carousel/list`, {
      params: { pageSize: 20, currentPage: 1 },
    }),
};

