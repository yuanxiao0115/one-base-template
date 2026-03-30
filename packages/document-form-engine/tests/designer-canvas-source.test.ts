import { describe, expect, it } from 'vite-plus/test';

import canvasSource from '../designer/UniverDocumentCanvas.vue?raw';
import inspectorSource from '../designer/DocumentPropertyInspector.vue?raw';

describe('document designer canvas source', () => {
  it('应单独同步外部 activeRange 到 Univer 选区，而不是只依赖结构重绘', () => {
    expect(canvasSource).toContain('function syncCanvasSelection');
    expect(canvasSource).toContain('() => props.activeRange');
  });

  it('Phase 1 不应继续暴露结构视图面板', () => {
    expect(inspectorSource).not.toContain("activePanel = 'structure'");
    expect(inspectorSource).not.toContain("activePanel === 'structure'");
    expect(inspectorSource).not.toContain('结构视图');
  });
});
