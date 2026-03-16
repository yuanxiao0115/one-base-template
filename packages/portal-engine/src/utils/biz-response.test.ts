import { describe, expect, it } from 'vite-plus/test';

import { isPortalBizOk } from './biz-response';

describe('biz-response', () => {
  it('应识别 success/code 成功响应', () => {
    expect(isPortalBizOk({ success: true })).toBe(true);
    expect(isPortalBizOk({ code: 0 })).toBe(true);
    expect(isPortalBizOk({ code: 200 })).toBe(true);
    expect(isPortalBizOk({ code: '0' })).toBe(true);
    expect(isPortalBizOk({ code: '200' })).toBe(true);
  });

  it('应识别失败响应', () => {
    expect(isPortalBizOk({ success: false, code: 500 })).toBe(false);
    expect(isPortalBizOk({ code: '500' })).toBe(false);
    expect(isPortalBizOk(undefined)).toBe(false);
    expect(isPortalBizOk(null)).toBe(false);
  });
});
