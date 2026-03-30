import { describe, expect, it } from 'vite-plus/test';
import workbenchSource from '../designer/DocumentDesignerWorkbench.vue?raw';

describe('document designer workbench source', () => {
  it('应通过控制层收口模板同步，而不是 deep watch 本地 template', () => {
    expect(workbenchSource).toContain('useDocumentDesignerController');
    expect(workbenchSource).not.toContain('syncingFromParent');
    expect(workbenchSource).not.toContain('watch(\n  template,');
    expect(workbenchSource).not.toContain('{ deep: true }');
  });
});
