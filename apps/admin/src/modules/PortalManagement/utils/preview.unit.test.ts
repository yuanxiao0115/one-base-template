import { describe, expect, it } from 'vite-plus/test';

import {
  calcPreviewScale,
  PREVIEW_VIEWPORT_DEFAULT,
  resolvePreviewMode,
  resolvePreviewViewport
} from '@one-base-template/portal-engine';

describe('PortalManagement/utils/preview', () => {
  it('应解析 previewMode，非法值回退 safe', () => {
    expect(resolvePreviewMode('safe')).toBe('safe');
    expect(resolvePreviewMode('live')).toBe('live');
    expect(resolvePreviewMode('unknown')).toBe('safe');
    expect(resolvePreviewMode(undefined)).toBe('safe');
  });

  it('应解析视口尺寸，非法值回退默认值', () => {
    expect(resolvePreviewViewport('1920', '1080')).toEqual({ width: 1920, height: 1080 });
    expect(resolvePreviewViewport('-1', '0')).toEqual(PREVIEW_VIEWPORT_DEFAULT);
    expect(resolvePreviewViewport(undefined, 'abc')).toEqual(PREVIEW_VIEWPORT_DEFAULT);
  });

  it('应按容器与目标视口计算缩放比例', () => {
    expect(calcPreviewScale(960, 540, 1920, 1080)).toBe(0.5);
    expect(calcPreviewScale(3000, 2000, 1920, 1080)).toBe(1);
    expect(calcPreviewScale(3000, 2000, 1920, 1080, true)).toBeCloseTo(1.5625);
    expect(calcPreviewScale(0, 200, 1920, 1080)).toBe(1);
  });
});
