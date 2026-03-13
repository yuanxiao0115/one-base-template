export type UnifiedContainerBorderStyle = 'none' | 'solid' | 'dashed' | 'dotted';

export interface UnifiedContainerContentConfig {
  showTitle: boolean;
  title: string;
  subtitle: string;
  icon: string;
  showExternalLink: boolean;
  externalLinkText: string;
  externalLinkUrl: string;
  openExternalInNewTab: boolean;
}

export interface UnifiedContainerStyleConfig {
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  borderStyle: UnifiedContainerBorderStyle;
  borderRadius: number;
  paddingTop: number;
  paddingRight: number;
  paddingBottom: number;
  paddingLeft: number;
  marginTop: number;
  marginRight: number;
  marginBottom: number;
  marginLeft: number;
  boxShadow: string;
  headerBackgroundColor: string;
  headerDividerColor: string;
  headerPaddingTop: number;
  headerPaddingRight: number;
  headerPaddingBottom: number;
  headerPaddingLeft: number;
  contentTopGap: number;
  titleColor: string;
  titleFontSize: number;
  subtitleColor: string;
  subtitleFontSize: number;
  iconColor: string;
  linkColor: string;
  linkFontSize: number;
}
