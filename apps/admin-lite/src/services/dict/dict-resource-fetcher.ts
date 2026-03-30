import { obHttp } from '@one-base-template/core';
import type { ApiResponse } from '@/types/api';
import type { DictServiceItem } from './types';

export async function fetchDictItems(dictCode: string): Promise<DictServiceItem[]> {
  const response = await obHttp().get<ApiResponse<DictServiceItem[]>>(
    '/cmict/admin/dict-item/list',
    {
      params: { dictCode }
    }
  );

  if (response.code !== 200) {
    throw new Error(response.message || '加载字典失败');
  }

  return Array.isArray(response.data) ? response.data : [];
}
