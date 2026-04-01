import { describe, expect, it } from 'vite-plus/test';
import {
  shouldCheckTenantUnique,
  toTenantUniqueSnapshot
} from '@/modules/adminManagement/tenant-info/utils/tenantUnique';

describe('tenant-info/utils/tenantUnique', () => {
  it('toTenantUniqueSnapshot 应裁剪文本', () => {
    expect(
      toTenantUniqueSnapshot({
        tenantName: '  租户A  ',
        contactPhone: ' 13800138000 '
      })
    ).toEqual({
      tenantName: '租户A',
      contactPhone: '13800138000'
    });
  });

  it('baseline 缺失时应执行唯一性校验', () => {
    expect(
      shouldCheckTenantUnique(
        toTenantUniqueSnapshot({
          tenantName: '租户A',
          contactPhone: '13800138000'
        }),
        null
      )
    ).toBe(true);
  });

  it('仅当租户名称或联系方式变化时才重新校验', () => {
    const baseline = toTenantUniqueSnapshot({
      tenantName: '租户A',
      contactPhone: '13800138000'
    });

    expect(
      shouldCheckTenantUnique(
        toTenantUniqueSnapshot({
          tenantName: '租户A',
          contactPhone: '13800138000'
        }),
        baseline
      )
    ).toBe(false);

    expect(
      shouldCheckTenantUnique(
        toTenantUniqueSnapshot({
          tenantName: '租户B',
          contactPhone: '13800138000'
        }),
        baseline
      )
    ).toBe(true);

    expect(
      shouldCheckTenantUnique(
        toTenantUniqueSnapshot({
          tenantName: '租户A',
          contactPhone: '13900139000'
        }),
        baseline
      )
    ).toBe(true);
  });
});
