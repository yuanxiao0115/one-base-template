import { beforeEach, describe, expect, it } from 'vite-plus/test';

import { ImportUpload } from '@one-base-template/ui';

import PersonnelSelector from '@/components/PersonnelSelector/PersonnelSelector.vue';
import ObRichTextEditor from '@/components/rich-text/ObRichTextEditor.vue';

import {
  getDocumentFormAdminAdapters,
  resetDocumentFormEngineAdminSetupForTesting,
  setupDocumentFormEngineForAdmin
} from './register';

describe('DocumentFormManagement/engine/register', () => {
  beforeEach(() => {
    resetDocumentFormEngineAdminSetupForTesting();
  });

  it('应注入默认适配器', () => {
    const context = setupDocumentFormEngineForAdmin();
    const adapters = getDocumentFormAdminAdapters(context);

    expect(adapters.personnelSelector).toBe(PersonnelSelector);
    expect(adapters.attachmentUpload).toBe(ImportUpload);
    expect(adapters.richTextEditor).toBe(ObRichTextEditor);
  });

  it('重复 setup 应复用同一 context 并允许覆盖适配器', () => {
    const customEditor = {
      name: 'CustomEditor'
    };

    const firstContext = setupDocumentFormEngineForAdmin();
    const secondContext = setupDocumentFormEngineForAdmin({
      adapters: {
        richTextEditor: customEditor
      }
    });
    const adapters = getDocumentFormAdminAdapters(secondContext);

    expect(secondContext).toBe(firstContext);
    expect(adapters.richTextEditor).toBe(customEditor);
  });
});
