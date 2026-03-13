export type PortalPreviewMode = 'safe' | 'live';

export interface PortalPreviewViewport {
  width: number;
  height: number;
}

export const PREVIEW_MODE_SAFE: PortalPreviewMode = 'safe';
export const PREVIEW_MODE_LIVE: PortalPreviewMode = 'live';

export const PREVIEW_VIEWPORT_DEFAULT: PortalPreviewViewport = {
  width: 1920,
  height: 1080,
};

export function resolvePreviewMode(value: unknown): PortalPreviewMode {
  return value === PREVIEW_MODE_LIVE ? PREVIEW_MODE_LIVE : PREVIEW_MODE_SAFE;
}

function toPositiveInt(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return Math.round(value);
  }
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number.parseInt(value, 10);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }
  return null;
}

export function resolvePreviewViewport(width: unknown, height: unknown): PortalPreviewViewport {
  const nextWidth = toPositiveInt(width) ?? PREVIEW_VIEWPORT_DEFAULT.width;
  const nextHeight = toPositiveInt(height) ?? PREVIEW_VIEWPORT_DEFAULT.height;
  return {
    width: nextWidth,
    height: nextHeight,
  };
}

export function calcPreviewScale(
  hostWidth: number,
  hostHeight: number,
  viewportWidth: number,
  viewportHeight: number,
  allowUpscale = false
): number {
  if (!(hostWidth > 0 && hostHeight > 0 && viewportWidth > 0 && viewportHeight > 0)) {
    return 1;
  }

  const widthRatio = hostWidth / viewportWidth;
  const heightRatio = hostHeight / viewportHeight;
  const rawScale = Math.min(widthRatio, heightRatio);

  if (!(rawScale > 0)) {
    return 1;
  }

  if (!allowUpscale) {
    return Math.min(rawScale, 1);
  }

  return rawScale;
}
