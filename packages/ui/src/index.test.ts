import { describe, expect, it } from 'vite-plus/test';

import * as oneUi from './index';

describe('ui root entry', () => {
  it('保留登录组件导出，避免调用方编译期回归', () => {
    expect(oneUi.LoginBox).toBeTruthy();
    expect(oneUi.LoginBoxV2).toBeTruthy();
    expect(oneUi.ObCard).toBeTruthy();
  });
});
