import { obHttp } from '@one-base-template/core';
export const api = {
  list: params => {
    return obHttp().get("/zfw/getProvinceData", { params });
  },
  listBigScreen: data => {
    return obHttp().post("/zb/cmict/metric/api/anonymous/zfwcase-jgsjcx", {
      data
    });
  },
  listCmict: data => {
    return obHttp().post("/zb/cmict/metric/api/anonymous/rgzncspt-rgzndbfx", {
      data
    });
  },
  petitionList: params => {
    return obHttp().get("/zfw/petitionList", { params });
  },
  getShangFangList: params => {
    return obHttp().get("/zfw/getShangFangList", { params });
  },
  exportTable: async params => {
    const res = await obHttp().get("/zb/cmict/person/analysis/export", {
      params,
      responseType: "blob",
      headers: { "Content-Type": "application/octet-stream" }
    });
    return res;
  },
  exportTableNew: async params => {
    const res = await obHttp().get("/zb/cmict/person/form/exportAnalysisWsfqData", {
      params,
      responseType: "blob",
      headers: { "Content-Type": "application/octet-stream" }
    });
    return res;
  },
  //信访列表接口
  lostList: data => {
    return obHttp().post("/zb/cmict/metric/api/anonymous/zfwcase-xlqxfy", {
      data
    });
  },
  //查询事件详情
  getCaseDetail: data => {
    return obHttp().post("/zb/cmict/metric/api/anonymous/zfwcase-idcasedeil", {
      data
    });
  },
  //查询事件列表
  getCaseList: data => {
    return obHttp().post("/zb/cmict/metric/api/anonymous/zfwcase-sjlbfy", {
      data
    });
  }
  // add: data => {
  //   return obHttp().post("/cmict/person/car/add", { data });
  // },
  // update: data => {
  //   return obHttp().post("/cmict/person/car/update", { data });
  // },
  // detail: params => {
  //   return obHttp().get("/cmict/person/car/detail", { params });
  // },
  // delete: async id => {
  //   const res: any = await obHttp().post("/cmict/person/car/delete", {
  //     data: { id }
  //   });
  //   return res?.success;
  // }
};
