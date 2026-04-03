import { obHttp } from '@one-base-template/core';
import type { DemoUserForm, DemoUserQueryParams } from './types';

export const demoUserApi = {
  page(params: DemoUserQueryParams) {
    return obHttp().post('/api/demo-management/user/page', { data: params });
  },
  detail(id: string) {
    return obHttp().get('/api/demo-management/user/detail/' + id);
  },
  save(payload: DemoUserForm) {
    return obHttp().post('/api/demo-management/user/save', { data: payload });
  },
  remove(id: string) {
    return obHttp().post('/api/demo-management/user/remove/' + id);
  }
};
