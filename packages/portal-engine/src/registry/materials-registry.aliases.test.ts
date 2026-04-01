import { describe, expect, it } from 'vite-plus/test';

import { resolvePortalMaterialTypeAlias } from './materials-registry';

describe('portal material type aliases', () => {
  it('兼容老项目 pb-* 类型到现有类型', () => {
    expect(resolvePortalMaterialTypeAlias('pb-app-entrance')).toBe('basic-app-entrance');
    expect(resolvePortalMaterialTypeAlias('pb-image-link-list')).toBe('basic-image-link-list');
    expect(resolvePortalMaterialTypeAlias('pb-image-text-list')).toBe('cms-image-text-list');
    expect(resolvePortalMaterialTypeAlias('pb-image-text-column')).toBe('cms-image-text-column');
    expect(resolvePortalMaterialTypeAlias('pb-document-card-list')).toBe('cms-document-card-list');
    expect(resolvePortalMaterialTypeAlias('pb-carousel-text-list')).toBe('cms-carousel-text-list');
    expect(resolvePortalMaterialTypeAlias('pb-publicity-education')).toBe(
      'cms-publicity-education'
    );
    expect(resolvePortalMaterialTypeAlias('pb-mail-list')).toBe('cms-mail-list');
    expect(resolvePortalMaterialTypeAlias('pb-dept-upload-files')).toBe('cms-dept-upload-files');
  });
});
