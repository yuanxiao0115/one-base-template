import { obHttp } from '@one-base-template/core';

export const api = {
  //列表
  list: params => {
    return obHttp().post("/zb/cmict/metric/api/anonymous/rgzncspt-xfsjfx", {
      data: params
    });
  },
  //弹窗列表
  xfsjlbList: params => {
    return obHttp().post("/zb/cmict/metric/api/anonymous/rgzncspt-xfsjlb", {
      data: params
    });
  },
  //详情
  detail: params => {
    return obHttp().post("/zb/cmict/metric/api/anonymous/zfwcase-idcasedeil", {
      data: params
    });
  },
  //导出
  exportTable: async params => {
    const res = await obHttp().get(
      "/zb/cmict/person/analysis/exportXfSmartComparison",
      {
        params,
        responseType: "blob",
        headers: { "Content-Type": "application/octet-stream" }
      }
    );
    return res;
  }
};
