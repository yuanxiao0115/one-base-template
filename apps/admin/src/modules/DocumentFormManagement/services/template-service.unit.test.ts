import { beforeEach, describe, expect, it } from 'vite-plus/test';

import { createMockDocumentTemplate } from '../mock/template';
import {
  createDocumentTemplateService,
  resetDocumentTemplateServiceForTesting
} from './template-service';

describe('DocumentFormManagement/services/template-service', () => {
  beforeEach(() => {
    resetDocumentTemplateServiceForTesting();
  });

  it('应支持草稿保存与发布版本递增', () => {
    const service = createDocumentTemplateService();
    const baseTemplate = createMockDocumentTemplate();

    const draft = service.ensureDraft(baseTemplate);
    draft.template.title = '草稿标题';
    service.updateDraft(draft.template);

    const firstPublished = service.publishDraft('首次发布');
    const secondPublished = service.publishDraft('二次发布');
    const snapshot = service.getSnapshot();

    expect(draft.status).toBe('draft');
    expect(firstPublished.version).toBe(1);
    expect(secondPublished.version).toBe(2);
    expect(snapshot.history.filter((item) => item.status === 'published')).toHaveLength(2);
    expect(snapshot.published?.template.title).toBe('草稿标题');
  });

  it('应支持回滚到指定发布版本并生成草稿', () => {
    const service = createDocumentTemplateService();
    const baseTemplate = createMockDocumentTemplate();

    service.ensureDraft(baseTemplate);
    service.publishDraft('版本1');

    const nextDraft = createMockDocumentTemplate();
    nextDraft.title = '版本2草稿';
    service.updateDraft(nextDraft);
    service.publishDraft('版本2');

    const rollbackDraft = service.rollbackToPublished(1);

    expect(rollbackDraft).toBeTruthy();
    expect(rollbackDraft?.status).toBe('draft');
    expect(rollbackDraft?.template.title).toBe(baseTemplate.title);
  });
});
