import { obHttp } from '@one-base-template/core';
import { systemSfssApiEndpoints } from './endpoints';

export const systemSfssApiApi = {
  list() {
    return obHttp().get(systemSfssApiEndpoints.list);
  }
};
