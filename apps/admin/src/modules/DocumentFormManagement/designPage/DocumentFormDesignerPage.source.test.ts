import { describe, expect, it } from 'vite-plus/test';

import pageSource from './DocumentFormDesignerPage.vue?raw';

describe('DocumentFormDesignerPage source', () => {
  it('Phase 1 设计页应只保留草稿编辑壳，不再暴露发布链路', () => {
    expect(pageSource).not.toContain('发布历史');
    expect(pageSource).not.toContain('回滚版本');
    expect(pageSource).not.toContain('handlePreview');
    expect(pageSource).not.toContain('publishDraft');
    expect(pageSource).not.toContain('rollbackToPublished');
    expect(pageSource).not.toContain('预览');
    expect(pageSource).not.toContain('发布');
    expect(pageSource).not.toContain('回滚');
  });
});
