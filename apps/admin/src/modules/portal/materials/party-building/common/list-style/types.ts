export type ListStyleModelType = {
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
  rowDividerStyle?: 'dashed' | 'dotted' | 'none' | 'solid';
  rowDividerWidth?: number;
  rowPaddingY?: number;
  imageWidth?: number;
  imageHeight?: number;
  imageBorderRadius?: number;
}

export type ListDisplayConfigModelType = {
  maxDisplayCount?: number;
  showDot?: boolean;
}
