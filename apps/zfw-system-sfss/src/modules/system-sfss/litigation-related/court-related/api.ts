import { obHttp } from '@one-base-template/core';
export const fyApi = {
  //涉法涉诉（法院）
  list: params => {
    return obHttp().get("/zfw/sfssFyList", { params });
  },
  add: data => {
    return obHttp().post("/zfw/insertOneSfssFy", { data });
  },
  update: data => {
    return obHttp().put(`/zfw/updateSfssFy`, { data });
  },
  detail: params => {
    return obHttp().get("/zfw/sfssFyDetail", { params });
  },
  import: async data => {
    const formData = new FormData();
    formData.append("file", data.file);
    const res = await obHttp().post("/cmict/person/lawsuits/importFY", {
      data: formData,
      $isUpload: true
    });
    return res;
  },
  districtList: code => {
    return obHttp().get(
      "/cmict/admin/district/listByParentCode?parentCode=" + code
    );
  },
};
