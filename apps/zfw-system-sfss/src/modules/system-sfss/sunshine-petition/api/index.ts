import { obHttp } from '@one-base-template/core';

export const petitionApi = {
  tree: () => {
    return obHttp().get("/cmict/person/petition/typeTreeSelect");
  },
  list: params => {
    return obHttp().get("/zfw/getShangFangList", { params });
  },
  add: data => {
    return obHttp().post("/zfw/insertShangFang", { data });
  },
  update: data => {
    return obHttp().put("/zfw/updateShangFang", { data });
  },
  importSS: async data => {
    const formData = new FormData();
    formData.append("file", data.file);
    formData.append("source", data.source);
    return obHttp().post("/cmict/person/petition/importSS", {
      data: formData,
      $isUpload: true
    });
  },
  importJJ: async data => {
    const formData = new FormData();
    formData.append("file", data.file);
    return obHttp().post("/cmict/person/petition/importJJ", {
      data: formData,
      $isUpload: true
    });
  },
  districtList: code => {
    return obHttp().get(
      `/cmict/admin/district/listByParentCode?parentCode=${code}`
    );
  }
};
