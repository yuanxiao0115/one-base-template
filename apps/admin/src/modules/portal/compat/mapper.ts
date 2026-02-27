import type { BizResponse, PortalTemplate } from '../types';

export function normalizeTemplateWhiteList(res: BizResponse<PortalTemplate>): BizResponse<PortalTemplate> {
  // 兼容老接口：有些环境返回 whiteList 而不是 whiteDTOS
  const data = res.data;
  if (!data || typeof data !== 'object') return res;

  const whiteDTOS = data.whiteDTOS;
  const whiteList = data.whiteList;

  if ((!Array.isArray(whiteDTOS) || whiteDTOS.length === 0) && whiteList) {
    return {
      ...res,
      data: {
        ...data,
        whiteDTOS: Array.isArray(whiteList) ? [...whiteList] : [whiteList]
      }
    };
  }

  return res;
}
