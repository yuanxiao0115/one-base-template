import { describe, expect, it, vi } from 'vite-plus/test';

import {
  navigatePortalCmsDetail,
  navigatePortalCmsList,
  resetPortalCmsNavigation,
  setPortalCmsNavigation
} from './navigation';

function createRouterStub() {
  return {
    push: vi.fn()
  };
}

describe('portal cms navigation', () => {
  it('默认阻断未配置的列表与详情跳转', async () => {
    const router = createRouterStub();

    resetPortalCmsNavigation();

    const listResult = await navigatePortalCmsList({
      router,
      categoryId: 'cat-1',
      tabId: 'tab-1',
      moreLink: '/frontPortal/cms/list'
    });
    const detailResult = await navigatePortalCmsDetail({
      router,
      articleId: 'article-1',
      categoryId: 'cat-1',
      tabId: 'tab-1'
    });

    expect(listResult).toEqual({
      handled: false,
      message: '当前应用未配置 CMS 列表跳转'
    });
    expect(detailResult).toEqual({
      handled: false,
      message: '当前应用未配置 CMS 详情跳转'
    });
    expect(router.push).not.toHaveBeenCalled();
  });

  it('优先调用应用注入的 handler', async () => {
    const router = createRouterStub();
    const openList = vi.fn().mockResolvedValue({ handled: true });
    const openDetail = vi.fn().mockResolvedValue({ handled: true });

    resetPortalCmsNavigation();
    setPortalCmsNavigation({
      openList,
      openDetail
    });

    const listContext = {
      router,
      categoryId: 'cat-2',
      tabId: 'tab-2',
      moreLink: ''
    };
    const detailContext = {
      router,
      articleId: 'article-2',
      categoryId: 'cat-2',
      tabId: 'tab-2'
    };

    await expect(navigatePortalCmsList(listContext)).resolves.toEqual({ handled: true });
    await expect(navigatePortalCmsDetail(detailContext)).resolves.toEqual({ handled: true });

    expect(openList).toHaveBeenCalledWith(listContext);
    expect(openDetail).toHaveBeenCalledWith(detailContext);
  });
});
