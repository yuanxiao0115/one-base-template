export interface FilePreviewUrlSource {
  url: string;
}

export interface FilePreviewFileSource {
  file: File;
}

export type FilePreviewSource = FilePreviewUrlSource | FilePreviewFileSource;

export type FilePreviewEngine =
  | 'pdf'
  | 'office-docx'
  | 'office-excel'
  | 'office-pptx'
  | 'ofd'
  | 'image'
  | 'unsupported';

export interface ResolveFilePreviewMetaInput {
  source: FilePreviewSource;
  fileName?: string;
  mimeType?: string;
}

export interface FilePreviewMeta {
  engine: FilePreviewEngine;
  extension: string;
  fileName: string;
  mimeType: string;
  sourceType: 'url' | 'file';
  sourceFingerprint: string;
}

const DEFAULT_FILE_NAME = '未命名文件';

const IMAGE_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'svg']);

const EXTENSION_ENGINE_MAP: Record<string, FilePreviewEngine> = {
  pdf: 'pdf',
  doc: 'office-docx',
  docx: 'office-docx',
  xls: 'office-excel',
  xlsx: 'office-excel',
  ppt: 'office-pptx',
  pptx: 'office-pptx',
  ofd: 'ofd'
};

function hasUrlSource(source: FilePreviewSource): source is FilePreviewUrlSource {
  return 'url' in source;
}

function normalizeText(value: string | undefined | null): string {
  return String(value || '').trim();
}

function normalizeMimeType(value: string | undefined): string {
  return normalizeText(value).toLowerCase();
}

function decodeFileNameSegment(value: string): string {
  if (!value) {
    return '';
  }

  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function getPathNameFromUrl(url: string): string {
  const raw = normalizeText(url);
  if (!raw) {
    return '';
  }

  try {
    return new URL(raw, 'http://localhost').pathname || '';
  } catch {
    return raw;
  }
}

function extractFileNameFromUrl(url: string): string {
  const pathname = getPathNameFromUrl(url);
  const segment = pathname.split('/').at(-1) || '';
  return normalizeText(decodeFileNameSegment(segment));
}

function extractExtensionFromFileName(fileName: string): string {
  const normalized = normalizeText(fileName);
  if (!normalized || !normalized.includes('.')) {
    return '';
  }

  return normalized.split('.').at(-1)?.toLowerCase() || '';
}

function resolveExtension(source: FilePreviewSource, fallbackName: string): string {
  if (hasUrlSource(source)) {
    const fromUrl = extractExtensionFromFileName(extractFileNameFromUrl(source.url));
    if (fromUrl) {
      return fromUrl;
    }
  }

  if (!hasUrlSource(source)) {
    const fromFile = extractExtensionFromFileName(source.file.name || '');
    if (fromFile) {
      return fromFile;
    }
  }

  return extractExtensionFromFileName(fallbackName);
}

function resolveFileName(input: ResolveFilePreviewMetaInput): string {
  const preferred = normalizeText(input.fileName);
  if (preferred) {
    return preferred;
  }

  if (!hasUrlSource(input.source)) {
    const nameFromFile = normalizeText(input.source.file.name);
    if (nameFromFile) {
      return nameFromFile;
    }
  }

  if (hasUrlSource(input.source)) {
    const nameFromUrl = extractFileNameFromUrl(input.source.url);
    if (nameFromUrl) {
      return nameFromUrl;
    }
  }

  return DEFAULT_FILE_NAME;
}

function resolveMimeType(input: ResolveFilePreviewMetaInput): string {
  const preferred = normalizeMimeType(input.mimeType);
  if (preferred) {
    return preferred;
  }

  if (!hasUrlSource(input.source)) {
    return normalizeMimeType(input.source.file.type);
  }

  return '';
}

function resolveEngineByMimeType(mimeType: string): FilePreviewEngine | null {
  if (!mimeType) {
    return null;
  }

  if (mimeType.startsWith('image/')) {
    return 'image';
  }

  if (mimeType.includes('pdf')) {
    return 'pdf';
  }

  if (mimeType.includes('officedocument.wordprocessingml') || mimeType.includes('msword')) {
    return 'office-docx';
  }

  if (mimeType.includes('officedocument.spreadsheetml') || mimeType.includes('ms-excel')) {
    return 'office-excel';
  }

  if (mimeType.includes('officedocument.presentationml') || mimeType.includes('ms-powerpoint')) {
    return 'office-pptx';
  }

  if (mimeType.includes('ofd')) {
    return 'ofd';
  }

  return null;
}

function resolveEngineByExtension(extension: string): FilePreviewEngine {
  if (!extension) {
    return 'unsupported';
  }

  if (IMAGE_EXTENSIONS.has(extension)) {
    return 'image';
  }

  return EXTENSION_ENGINE_MAP[extension] || 'unsupported';
}

function resolveSourceFingerprint(source: FilePreviewSource): string {
  if (hasUrlSource(source)) {
    return `url:${normalizeText(source.url)}`;
  }

  const { name, size, lastModified } = source.file;
  return `file:${name}:${size}:${lastModified}`;
}

export function resolveFilePreviewMeta(input: ResolveFilePreviewMetaInput): FilePreviewMeta {
  const fileName = resolveFileName(input);
  const mimeType = resolveMimeType(input);
  const extension = resolveExtension(input.source, fileName);

  const engineByMimeType = resolveEngineByMimeType(mimeType);
  const engine = engineByMimeType || resolveEngineByExtension(extension);

  return {
    engine,
    extension,
    fileName,
    mimeType,
    sourceType: hasUrlSource(input.source) ? 'url' : 'file',
    sourceFingerprint: resolveSourceFingerprint(input.source)
  };
}
