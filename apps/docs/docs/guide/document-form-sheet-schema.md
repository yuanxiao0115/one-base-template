# 公文表单 Sheet Schema（v2）

> 适用范围：`packages/document-form-engine/schema/sheet.ts`

## 目标

- 把“合并单元格、边框线色、填充、字体、对齐、行高列宽、冻结区”统一落到模板协议。
- 保证设计态、运行态、打印态共享同一份结构化配置。

## 顶层结构

模板中的 `sheet` 字段结构如下：

```ts
interface DocumentTemplateSheetConfig {
  rows: number;
  columns: number;
  rowHeights: Record<string, number>;
  columnWidths: Record<string, number>;
  merges: DocumentSheetMerge[];
  styles: DocumentSheetStyle[];
  viewport: DocumentSheetViewport;
}
```

## 字段说明

### `rows` / `columns`

- 表示网格总行列数。
- 默认值根据 `page.minHeight / grid.rowHeight` 与 `grid.columns` 自动推导。

### `rowHeights` / `columnWidths`

- 按索引覆盖行高列宽（值为正整数）。
- 未配置索引走默认网格尺寸。

### `merges`

```ts
interface DocumentSheetMerge {
  row: number;
  col: number;
  rowspan: number;
  colspan: number;
}
```

- `row/col` 为 1-based。
- `rowspan/colspan` 为合并跨度。

### `styles`

```ts
interface DocumentSheetStyle {
  row: number;
  col: number;
  rowspan: number;
  colspan: number;
  backgroundColor?: string;
  textColor?: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold' | number;
  horizontalAlign?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'middle' | 'bottom';
  wrap?: boolean;
  border?: {
    top?: DocumentSheetBorderSide;
    right?: DocumentSheetBorderSide;
    bottom?: DocumentSheetBorderSide;
    left?: DocumentSheetBorderSide;
  };
}
```

- 区域定位同 `merges`，用于定义样式覆盖范围。
- 当前实现优先级：`template.sheet.styles` 覆盖 `material.stylePreset.style`。

### `viewport`

```ts
interface DocumentSheetViewport {
  showGrid: boolean;
  zoom: number;
  frozenRows: number;
  frozenColumns: number;
}
```

- 控制网格线展示、缩放与冻结区。

## 默认值与规范化

- `createDefaultDocumentSheet(seed)`：基于页面与网格 seed 生成默认 `sheet`。
- `normalizeDocumentSheet(input, fallback)`：对输入做正整数归一、空值补齐与结构裁剪。

## 版本迁移

- `DocumentTemplateSchema` 当前版本为 `2`。
- `parseDocumentTemplate()` 内置 `v1 -> v2` 自动迁移：
  - 保留原 `page/grid/materials/print`。
  - 自动补齐 `sheet` 默认结构。

## 示例

```json
{
  "version": "2",
  "sheet": {
    "rows": 40,
    "columns": 24,
    "rowHeights": {
      "2": 32
    },
    "columnWidths": {
      "3": 120
    },
    "merges": [{ "row": 2, "col": 2, "rowspan": 2, "colspan": 3 }],
    "styles": [
      {
        "row": 2,
        "col": 2,
        "rowspan": 2,
        "colspan": 3,
        "backgroundColor": "#f8fafc",
        "textColor": "#0f172a",
        "border": {
          "top": { "color": "#1e293b", "style": "solid", "width": 1 },
          "right": { "color": "#1e293b", "style": "solid", "width": 1 },
          "bottom": { "color": "#1e293b", "style": "solid", "width": 1 },
          "left": { "color": "#1e293b", "style": "solid", "width": 1 }
        }
      }
    ],
    "viewport": {
      "showGrid": true,
      "zoom": 100,
      "frozenRows": 0,
      "frozenColumns": 0
    }
  }
}
```
