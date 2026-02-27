export const portalEndpoints = {
  template: {
    list: '/cmict/portal/template/page',
    detail: '/cmict/portal/template/detail',
    getDetail: '/cmict/portal/template/get-detail',
    add: '/cmict/portal/template/add',
    copy: '/cmict/portal/template/copy',
    update: '/cmict/portal/template/update',
    publish: '/cmict/portal/template/publish',
    hideToggle: '/cmict/portal/template/hide',
    delete: '/cmict/portal/template/delete'
  },
  tab: {
    list: '/cmict/portal/tab/page',
    detail: '/cmict/portal/tab/detail',
    add: '/cmict/portal/tab/add',
    update: '/cmict/portal/tab/update',
    delete: '/cmict/portal/tab/delete'
  },
  templatePublic: {
    getDetail: '/cmict/portal/public/portal/template/get-detail'
  },
  tabPublic: {
    detail: '/cmict/portal/public/portal/tab/detail'
  },
  cms: {
    categoryTree: '/cmict/cms/cmsCategory/tree',
    userArticleListPrefix: '/cmict/cms/cmsUser/category',
    userCarouselListPrefix: '/cmict/cms/cmsUser/category'
  }
} as const;
