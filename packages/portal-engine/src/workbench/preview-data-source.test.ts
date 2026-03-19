import { describe, expect, it, vi } from 'vite-plus/test';

import { isPortalBizOk } from '../utils/biz-response';
import { createPortalPreviewDataSource, isPortalPreviewBizOk } from './preview-data-source';

describe('preview-data-source', () => {
  it('兼容导出应复用统一 Biz 判定方法', () => {
    expect(isPortalPreviewBizOk).toBe(isPortalBizOk);
  });

  it('应识别 success/code 成功响应', () => {
    expect(isPortalPreviewBizOk({ success: true })).toBe(true);
    expect(isPortalPreviewBizOk({ code: 200 })).toBe(true);
    expect(isPortalPreviewBizOk({ code: '0' })).toBe(true);
    expect(isPortalPreviewBizOk({ code: 500 })).toBe(false);
    expect(isPortalPreviewBizOk(undefined)).toBe(false);
  });

  it('公开 tab 接口成功时应直接返回', async () => {
    const getPublicTabDetail = vi.fn().mockResolvedValue({ code: 200, data: { pageLayout: '{}' } });
    const getTabDetail = vi.fn().mockResolvedValue({ code: 200, data: { pageLayout: '{}' } });
    const getTemplateDetail = vi.fn();

    const dataSource = createPortalPreviewDataSource({
      getPublicTabDetail,
      getTabDetail,
      getTemplateDetail
    });

    await dataSource.getTabDetail('tab-1');
    expect(getPublicTabDetail).toHaveBeenCalledTimes(1);
    expect(getTabDetail).not.toHaveBeenCalled();
  });

  it('公开 tab 接口失败时应回退 detail 接口', async () => {
    const getPublicTabDetail = vi.fn().mockResolvedValue({ code: 500, message: 'fail' });
    const getTabDetail = vi.fn().mockResolvedValue({ code: 200, data: { pageLayout: '{}' } });
    const getTemplateDetail = vi.fn();

    const dataSource = createPortalPreviewDataSource({
      getPublicTabDetail,
      getTabDetail,
      getTemplateDetail
    });

    await dataSource.getTabDetail('tab-2');
    expect(getPublicTabDetail).toHaveBeenCalledTimes(1);
    expect(getTabDetail).toHaveBeenCalledTimes(1);
  });

  it('公开 tab 接口异常时应回退 detail 接口', async () => {
    const getPublicTabDetail = vi.fn().mockRejectedValue(new Error('network'));
    const getTabDetail = vi.fn().mockResolvedValue({ code: 200, data: { pageLayout: '{}' } });
    const getTemplateDetail = vi.fn();

    const dataSource = createPortalPreviewDataSource({
      getPublicTabDetail,
      getTabDetail,
      getTemplateDetail
    });

    await dataSource.getTabDetail('tab-3');
    expect(getPublicTabDetail).toHaveBeenCalledTimes(1);
    expect(getTabDetail).toHaveBeenCalledTimes(1);
  });

  it('模板详情应直接透传', async () => {
    const getTemplateDetail = vi.fn().mockResolvedValue({ code: 200, data: { id: 'tpl-1' } });
    const dataSource = createPortalPreviewDataSource({
      getTabDetail: vi.fn().mockResolvedValue({ code: 200, data: { pageLayout: '{}' } }),
      getTemplateDetail
    });

    await dataSource.getTemplateDetail('tpl-1');
    expect(getTemplateDetail).toHaveBeenCalledWith('tpl-1');
  });
});
