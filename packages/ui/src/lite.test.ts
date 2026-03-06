import { describe, expect, it } from 'vitest';

import * as oneUiLite from './lite';

describe('ui lite entry', () => {
  it('导出登录组件，供业务页按需局部引用', () => {
    expect(oneUiLite.LoginBox).toBeTruthy();
    expect(oneUiLite.LoginBoxV2).toBeTruthy();
    expect(oneUiLite.PageContainer).toBeTruthy();
    expect(oneUiLite.registerOneLiteUiComponents).toBeTypeOf('function');
  });
});
