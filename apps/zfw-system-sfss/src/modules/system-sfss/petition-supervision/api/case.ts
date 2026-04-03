import { obHttp } from '@one-base-template/core';

export const api = {
  list: params => {
    return obHttp().get("/zfw/caseList", { params });
  },
  detail: params => {
    return obHttp().get("/zfw/getCaseDetail", { params });
  }
};
