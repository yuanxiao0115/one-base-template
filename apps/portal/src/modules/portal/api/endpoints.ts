export const portalEndpoints = {
  tab: {
    detail: "/cmict/portal/tab/detail",
  },
  templatePublic: {
    getDetail: "/cmict/portal/public/portal/template/get-detail",
  },
  tabPublic: {
    detail: "/cmict/portal/public/portal/tab/detail",
  },
  cms: {
    categoryTree: "/cmict/cms/cmsCategory/tree",
    userArticleListPrefix: "/cmict/cms/cmsUser/category",
    userCarouselListPrefix: "/cmict/cms/cmsUser/category",
  },
} as const;
