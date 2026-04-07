import { describe, expect, it } from 'vitest';
import { portalMaterialsRegistry } from './materials-registry';

function getCategoryItems(categoryId: string) {
  return (
    portalMaterialsRegistry.categories.find((category) => category.id === categoryId)?.cmptList ??
    []
  );
}

describe('portal material categories', () => {
  it('按最新规则收口物料分类', () => {
    const listItems = getCategoryItems('list');
    const linkItems = getCategoryItems('link');
    const businessItems = getCategoryItems('business');
    const cmsItems = getCategoryItems('cms');

    expect(listItems.some((item) => item.id === 'cms-mail-list')).toBe(true);
    expect(listItems.some((item) => item.id === 'cms-dept-upload-files')).toBe(true);
    expect(linkItems.some((item) => item.id === 'cms-related-links')).toBe(true);
    expect(businessItems.some((item) => item.id === 'basic-app-entrance')).toBe(true);

    expect(cmsItems.some((item) => item.id === 'cms-mail-list')).toBe(false);
    expect(cmsItems.some((item) => item.id === 'cms-dept-upload-files')).toBe(false);
    expect(cmsItems.some((item) => item.id === 'cms-related-links')).toBe(false);
  });

  it('按最新规则收口物料命名', () => {
    const cmsItems = getCategoryItems('cms');
    const documentCardList = cmsItems.find((item) => item.id === 'cms-document-card-list');
    const publicityEducation = cmsItems.find((item) => item.id === 'cms-publicity-education');

    expect(documentCardList?.cmptName).toBe('卡片专栏');
    expect(publicityEducation?.cmptName).toBe('分页签图文轮播');
  });
});
