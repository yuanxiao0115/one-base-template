import { obHttp } from '@one-base-template/core';

export const gaApi = {
  //涉法涉诉（公安）
  list: params => {
    return obHttp().get("/zfw/sfssGaList", { params });
  },
  import: async data => {
    const formData = new FormData();
    formData.append("file", data.file);
    const res = await obHttp().post("/cmict/person/lawsuits/importGA", {
      data: formData,
      $isUpload: true
    });
    return res;
  }
};
