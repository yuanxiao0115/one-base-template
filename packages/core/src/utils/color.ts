function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const normalized = hex.replace('#', '').trim();
  const full = normalized.length === 3
    ? normalized
        .split('')
        .map(s => s + s)
        .join('')
    : normalized;

  if (!/^[0-9a-fA-F]{6}$/.test(full)) {
    throw new Error(`[theme] 非法颜色值: ${hex}`);
  }

  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return { r, g, b };
}

function rgbToHex(rgb: { r: number; g: number; b: number }): string {
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

/**
 * 颜色混合：ratio=0 -> c1；ratio=1 -> c2
 */
export function mix(hex1: string, hex2: string, ratio: number): string {
  const r = clamp01(ratio);
  const c1 = hexToRgb(hex1);
  const c2 = hexToRgb(hex2);

  const mixed = {
    r: Math.round(c1.r + (c2.r - c1.r) * r),
    g: Math.round(c1.g + (c2.g - c1.g) * r),
    b: Math.round(c1.b + (c2.b - c1.b) * r)
  };

  return rgbToHex(mixed);
}
