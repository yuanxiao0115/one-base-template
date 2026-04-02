import { sanitizeHtmlContent } from '@one-base-template/core';

export type RichTextProfile = 'full' | 'simple';

const TOOLBAR_EXCLUDE_KEYS_MAP: Record<RichTextProfile, string[]> = {
  full: ['fullScreen'],
  simple: ['fullScreen', 'group-video', 'insertTable', 'codeBlock', 'todo', 'emotion']
};

export function sanitizeRichTextHtml(html: string): string {
  return sanitizeHtmlContent(html);
}

export function normalizeRichTextHtml(html: string): string {
  const source = String(html || '');
  const text = source
    .replace(/<[^<p>]+>/g, '')
    .replace(/<[</p>$]+>/g, '')
    .replace(/&nbsp;/gi, '')
    .replace(/<[^<br/>]+>/g, '')
    .trim();

  return text ? source : '';
}

export function toSafeRichTextHtml(html: string): string {
  return normalizeRichTextHtml(sanitizeRichTextHtml(html));
}

export function getRichTextToolbarExcludeKeys(profile: RichTextProfile): string[] {
  return TOOLBAR_EXCLUDE_KEYS_MAP[profile] || TOOLBAR_EXCLUDE_KEYS_MAP.full;
}
