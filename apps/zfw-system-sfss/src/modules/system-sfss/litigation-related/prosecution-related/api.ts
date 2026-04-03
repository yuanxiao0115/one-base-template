import { obHttp } from '@one-base-template/core';
export const jcApi = {
  //涉法涉诉（检察）
  list: params => {
    return obHttp().get("/zfw/sfssJcList", { params });
  },
  add: data => {
    return obHttp().post("/zfw/insertOneSfssJc", { data });
  },
  update: data => {
    return obHttp().put(`/zfw/updateSfssJc`, { data });
  },
  detail: params => {
    return obHttp().get("/zfw/sfssJcDetail", { params });
  },
  import: async data => {
    const formData = new FormData();
    formData.append("file", data.file);
    const res = await obHttp().post("/cmict/person/lawsuits/importJC", {
      data: formData,
      $isUpload: true
    });
    return res;
  },
  districtList: code => {
    return obHttp().get(
      "/cmict/admin/district/listByParentCode?parentCode=" + code
    );
  }
};
