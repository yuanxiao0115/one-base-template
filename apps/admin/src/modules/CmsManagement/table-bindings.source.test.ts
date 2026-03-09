import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

function readContentPageSource() {
  return readFileSync(new URL('./content/page.vue', import.meta.url), 'utf8');
}

function readColumnPageSource() {
  return readFileSync(new URL('./column/page.vue', import.meta.url), 'utf8');
}

describe('CmsManagement table bindings source', () => {
  it('content 页面应把 useTable 的 ref 字段解包后再传给 ObVxeTable', () => {
    const source = readContentPageSource();

    expect(source).not.toContain(':loading="table.loading"');
    expect(source).not.toContain(':data="table.dataList"');
    expect(source).toContain(':loading="tableLoading"');
    expect(source).toContain(':data="tableRows"');
  });

  it('column 页面应把 useTable 的 ref 字段解包后再传给 ObVxeTable', () => {
    const source = readColumnPageSource();

    expect(source).not.toContain(':loading="table.loading"');
    expect(source).not.toContain(':data="table.dataList"');
    expect(source).toContain(':loading="tableLoading"');
    expect(source).toContain(':data="tableRows"');
  });
});
