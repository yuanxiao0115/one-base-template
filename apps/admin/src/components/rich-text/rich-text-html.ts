export type RichTextProfile = 'full' | 'simple';

const BLOCKED_TAG_NAMES = new Set([
  'script',
  'style',
  'iframe',
  'object',
  'embed',
  'link',
  'meta',
  'base',
  'form',
  'input',
  'button',
  'textarea',
  'select'
]);

const URL_ATTR_NAMES = new Set(['href', 'src', 'poster']);
const SAFE_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:', 'blob:']);
const STYLE_DANGEROUS_PATTERNS = [
  /expression\s*\(/i,
  /javascript\s*:/i,
  /url\s*\(\s*['"]?\s*javascript\s*:/i
];

const TOOLBAR_EXCLUDE_KEYS_MAP: Record<RichTextProfile, string[]> = {
  full: ['fullScreen'],
  simple: ['fullScreen', 'group-video', 'insertTable', 'codeBlock', 'todo', 'emotion']
};

function isSafeDataUrl(value: string): boolean {
  const normalized = value.toLowerCase();
  return normalized.startsWith('data:image/') || normalized.startsWith('data:video/');
}

function isSafeUrl(value: string): boolean {
  const normalized = value.trim();
  if (!normalized) {
    return false;
  }

  if (
    normalized.startsWith('#') ||
    normalized.startsWith('/') ||
    normalized.startsWith('./') ||
    normalized.startsWith('../')
  ) {
    return true;
  }

  if (normalized.toLowerCase().startsWith('data:')) {
    return isSafeDataUrl(normalized);
  }

  try {
    const url = new URL(normalized, 'https://safe-rich-text.local');
    return SAFE_PROTOCOLS.has(url.protocol);
  } catch {
    return false;
  }
}

function sanitizeStyleValue(style: string): string {
  const normalized = style.trim();
  if (!normalized) {
    return '';
  }
  if (STYLE_DANGEROUS_PATTERNS.some((pattern) => pattern.test(normalized))) {
    return '';
  }
  return normalized;
}

function sanitizeElement(element: Element) {
  const tagName = element.tagName.toLowerCase();
  if (BLOCKED_TAG_NAMES.has(tagName)) {
    element.remove();
    return;
  }

  const attrs = [...element.attributes];
  for (const attr of attrs) {
    const name = attr.name.toLowerCase();
    const value = attr.value;

    if (name.startsWith('on') || name === 'srcdoc') {
      element.removeAttribute(attr.name);
      continue;
    }

    if (URL_ATTR_NAMES.has(name) && !isSafeUrl(value)) {
      element.removeAttribute(attr.name);
      continue;
    }

    if (name === 'style') {
      const safeStyle = sanitizeStyleValue(value);
      if (!safeStyle) {
        element.removeAttribute(attr.name);
      } else {
        element.setAttribute(attr.name, safeStyle);
      }
      continue;
    }

    if (name === 'target' && value === '_blank') {
      const relValue = element.getAttribute('rel') || '';
      const relSet = new Set(
        relValue
          .split(/\s+/)
          .map((item) => item.trim())
          .filter(Boolean)
      );
      relSet.add('noopener');
      relSet.add('noreferrer');
      element.setAttribute('rel', [...relSet].join(' '));
    }
  }
}

function sanitizeHtmlByRegexFallback(html: string): string {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
    .replace(/\son\w+=(["']).*?\1/gi, '')
    .replace(/\s(href|src|poster)=(["'])\s*javascript:[\s\S]*?\2/gi, '');
}

export function sanitizeRichTextHtml(html: string): string {
  const source = String(html || '');
  if (!source.trim()) {
    return '';
  }

  if (typeof DOMParser === 'undefined') {
    return sanitizeHtmlByRegexFallback(source);
  }

  const parser = new DOMParser();
  const documentNode = parser.parseFromString(source, 'text/html');
  const elements = [...documentNode.body.querySelectorAll('*')];
  for (const element of elements) {
    sanitizeElement(element);
  }
  return documentNode.body.innerHTML;
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
