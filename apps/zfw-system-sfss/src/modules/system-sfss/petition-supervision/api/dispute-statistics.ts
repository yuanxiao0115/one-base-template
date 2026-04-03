import { obHttp } from '@one-base-template/core';

export const api = {
  list: params => {
    return obHttp().get("/zfw/getCaseTypeStaic", { params });
  },
  exportTable: async () => {
    const res = await obHttp().get("/zb/cmict/person/analysis/exportCaseTypeStatic", {
      responseType: "blob",
      headers: { "Content-Type": "application/octet-stream" }
    });
    return res;
  }
};
