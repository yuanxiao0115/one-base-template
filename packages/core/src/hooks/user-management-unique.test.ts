import { describe, expect, it } from 'vite-plus/test';
import {
  assertUniqueCheck,
  shouldCheckOrgUnique,
  shouldCheckPositionUnique,
  shouldCheckUserUnique,
  toOrgUniqueSnapshot,
  toPositionUniqueSnapshot,
  toUserUniqueSnapshot
} from '../../../../apps/admin/src/modules/adminManagement/shared/unique';

describe('user-management unique helpers', () => {
  it('assertUniqueCheck 在 code 非 200 时抛出业务错误', () => {
    expect(() =>
      assertUniqueCheck({ code: 500, data: false, message: '服务异常' }, '校验失败')
    ).toThrow('服务异常');
  });

  it('assertUniqueCheck 在 code=200 时返回布尔结果', () => {
    expect(assertUniqueCheck({ code: 200, data: true }, '校验失败')).toBe(true);
    expect(assertUniqueCheck({ code: 200, data: false }, '校验失败')).toBe(false);
  });

  it('shouldCheckUserUnique 在编辑未变化时返回 false', () => {
    const baseline = toUserUniqueSnapshot({
      userAccount: 'admin',
      phone: '13800000000',
      mail: 'a@b.com'
    });
    const current = toUserUniqueSnapshot({
      userAccount: 'admin',
      phone: '13800000000',
      mail: 'a@b.com'
    });

    expect(shouldCheckUserUnique(current, baseline)).toBe(false);
  });

  it('shouldCheckUserUnique 在新增或字段变化时返回 true', () => {
    const baseline = toUserUniqueSnapshot({
      userAccount: 'admin',
      phone: '13800000000',
      mail: 'a@b.com'
    });
    const current = toUserUniqueSnapshot({
      userAccount: 'admin2',
      phone: '13800000000',
      mail: 'a@b.com'
    });

    expect(shouldCheckUserUnique(current, null)).toBe(true);
    expect(shouldCheckUserUnique(current, baseline)).toBe(true);
  });

  it('org/position 唯一性判断符合预期', () => {
    const orgBaseline = toOrgUniqueSnapshot({ orgName: '机构A', parentId: '1' });
    const orgCurrentSame = toOrgUniqueSnapshot({ orgName: '机构A', parentId: '1' });
    const orgCurrentChanged = toOrgUniqueSnapshot({ orgName: '机构B', parentId: '1' });

    const positionBaseline = toPositionUniqueSnapshot({ postName: '管理员' });
    const positionCurrentSame = toPositionUniqueSnapshot({ postName: '管理员' });
    const positionCurrentChanged = toPositionUniqueSnapshot({ postName: '审计员' });

    expect(shouldCheckOrgUnique(orgCurrentSame, orgBaseline)).toBe(false);
    expect(shouldCheckOrgUnique(orgCurrentChanged, orgBaseline)).toBe(true);
    expect(shouldCheckPositionUnique(positionCurrentSame, positionBaseline)).toBe(false);
    expect(shouldCheckPositionUnique(positionCurrentChanged, positionBaseline)).toBe(true);
  });
});
