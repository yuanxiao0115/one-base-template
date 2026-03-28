import { describe, expect, it } from 'vite-plus/test';
import { DEFAULT_DOCUMENT_MATERIALS } from '../materials/default-materials';
import { DEFAULT_DOCUMENT_MATERIAL_STYLE_PRESET } from '../materials/sheet-style';

describe('document material sheet style', () => {
  it('默认物料应包含 sheetLayout 与 stylePreset', () => {
    expect(DEFAULT_DOCUMENT_MATERIALS.length).toBeGreaterThan(0);

    DEFAULT_DOCUMENT_MATERIALS.forEach((material) => {
      expect(material.sheetLayout.regions.length).toBeGreaterThan(0);
      expect(material.sheetLayout.regions[0]).toMatchObject({
        rowOffset: 0,
        colOffset: 0,
        rowspan: material.defaultSize.rowspan,
        colspan: material.defaultSize.colspan
      });

      expect(material.stylePreset.style.border?.top?.color).toBeTruthy();
      expect(material.stylePreset.style.border?.right?.color).toBeTruthy();
      expect(material.stylePreset.style.border?.bottom?.color).toBeTruthy();
      expect(material.stylePreset.style.border?.left?.color).toBeTruthy();
    });
  });

  it('样式预设应保留基础预设并可被物料复用', () => {
    const stamp = DEFAULT_DOCUMENT_MATERIALS.find((item) => item.type === 'StampBlock');

    expect(stamp).toBeTruthy();
    expect(stamp?.stylePreset).toMatchObject({
      ...DEFAULT_DOCUMENT_MATERIAL_STYLE_PRESET,
      key: 'stamp'
    });
  });
});
