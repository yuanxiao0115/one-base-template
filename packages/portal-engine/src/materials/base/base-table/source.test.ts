import { describe, expect, it } from 'vite-plus/test';

import baseTableStyleSource from './style.vue?raw';
import baseTableIndexSource from './index.vue?raw';
import baseTableConfigSource from './config.json?raw';
import baseTableContentSource from './content.vue?raw';

describe('base-table source', () => {
  it('样式面板应支持表头高度与行高配置，且默认值为 56px', () => {
    expect(baseTableStyleSource).toContain('label="表头高度(px)"');
    expect(baseTableStyleSource).toContain('v-model="sectionData.table.headerHeight"');
    expect(baseTableStyleSource).toContain('label="行高(px)"');
    expect(baseTableStyleSource).toContain('v-model="sectionData.table.rowHeight"');
    expect(baseTableStyleSource).toContain('headerHeight: 56');
    expect(baseTableStyleSource).toContain('rowHeight: 56');
    expect(baseTableConfigSource).toContain('"headerHeight": 56');
    expect(baseTableConfigSource).toContain('"rowHeight": 56');
  });

  it('渲染层应应用表头高度与行高，并在隐藏分割线时隐藏 inner-wrapper 伪元素', () => {
    expect(baseTableIndexSource).toContain("'--base-table-header-height':");
    expect(baseTableIndexSource).toContain("'--base-table-row-height':");
    expect(baseTableIndexSource).toContain(
      'toPositiveNumber(tableStyleConfig.value.headerHeight, 56)'
    );
    expect(baseTableIndexSource).toContain(
      'toPositiveNumber(tableStyleConfig.value.rowHeight, 56)'
    );
    expect(baseTableIndexSource).toContain("height: 'var(--base-table-header-height)'");
    expect(baseTableIndexSource).toContain("lineHeight: 'var(--base-table-header-height)'");
    expect(baseTableIndexSource).toContain("height: 'var(--base-table-row-height)'");
    expect(baseTableIndexSource).toContain("lineHeight: 'var(--base-table-row-height)'");
    expect(baseTableIndexSource).toContain(':deep(.el-table__inner-wrapper::before)');
    expect(baseTableIndexSource).toContain('display: none;');
  });

  it('分页器应强制中文文案，列配置应支持 tag 标签展示', () => {
    expect(baseTableIndexSource).toContain("import zhCn from 'element-plus/es/locale/lang/zh-cn'");
    expect(baseTableIndexSource).toContain('<el-config-provider :locale="zhCnLocale">');
    expect(baseTableIndexSource).toContain('prev-text="上一页"');
    expect(baseTableIndexSource).toContain('next-text="下一页"');
    expect(baseTableIndexSource).toContain('class="base-table__tag"');
    expect(baseTableContentSource).toContain('label="标签样式展示"');
    expect(baseTableContentSource).toContain('v-model="column.showTag"');
    expect(baseTableContentSource).toContain('v-model="column.tagBgColor"');
    expect(baseTableContentSource).toContain('v-model="column.tagTextColor"');
    expect(baseTableContentSource).toContain('showTag: false');
  });
});
