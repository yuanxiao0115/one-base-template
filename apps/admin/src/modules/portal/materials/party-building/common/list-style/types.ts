export interface ListStyleModelType {
  titleColor?: string;
  titleFontSize?: number;
  titleFontWeight?: string;
  titleHoverColor?: string;
  dateColor?: string;
  dateFontSize?: number;
  dotColor?: string;
  dotSize?: number;
  dotGap?: number;
  rowDividerColor?: string;
  rowDividerStyle?: 'solid' | 'dashed' | 'dotted' | 'none';
  rowDividerWidth?: number;
  rowPaddingY?: number;
  imageWidth?: number;
  imageHeight?: number;
  imageBorderRadius?: number;
}

export interface ListDisplayConfigModelType {
  maxDisplayCount?: number;
  showDot?: boolean;
}
