import { systemSfssApiApi } from '../api/client';

export const systemSfssService = {
  list() {
    return systemSfssApiApi.list();
  }
};
