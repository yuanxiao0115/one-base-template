export interface PortalPreviewStageOffset {
  x: number;
  y: number;
}

export interface PortalPreviewPanBounds {
  centeredX: number;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export interface PortalPreviewPanBoundsInput {
  manualMode: boolean;
  hostWidth: number;
  hostHeight: number;
  stageWidth: number;
  stageHeight: number;
  minOffset?: number;
}

export function clampPortalPreviewPercent(value: number, min = 50, max = 200): number {
  return Math.min(max, Math.max(min, value));
}

export function calcPortalManualPanRange(hostSize: number, stageSize: number, minOffset = 80): number {
  if (stageSize > hostSize) {
    return 0;
  }
  return Math.max((hostSize - stageSize) / 2, minOffset);
}

export function calcPortalPreviewPanBounds(input: PortalPreviewPanBoundsInput): PortalPreviewPanBounds {
  const centeredX = (input.hostWidth - input.stageWidth) / 2;

  if (!input.manualMode) {
    return {
      centeredX,
      minX: 0,
      maxX: 0,
      minY: 0,
      maxY: 0,
    };
  }

  const minOffset = input.minOffset ?? 80;
  const minX =
    input.stageWidth <= input.hostWidth
      ? -calcPortalManualPanRange(input.hostWidth, input.stageWidth, minOffset)
      : input.hostWidth - input.stageWidth;
  const maxX =
    input.stageWidth <= input.hostWidth
      ? calcPortalManualPanRange(input.hostWidth, input.stageWidth, minOffset)
      : 0;
  const minY =
    input.stageHeight <= input.hostHeight
      ? -calcPortalManualPanRange(input.hostHeight, input.stageHeight, minOffset)
      : input.hostHeight - input.stageHeight;
  const maxY =
    input.stageHeight <= input.hostHeight
      ? calcPortalManualPanRange(input.hostHeight, input.stageHeight, minOffset)
      : 0;

  return {
    centeredX,
    minX,
    maxX,
    minY,
    maxY,
  };
}

export function clampPortalPreviewOffset(
  offset: PortalPreviewStageOffset,
  bounds: PortalPreviewPanBounds
): PortalPreviewStageOffset {
  return {
    x: Math.min(bounds.maxX, Math.max(bounds.minX, offset.x)),
    y: Math.min(bounds.maxY, Math.max(bounds.minY, offset.y)),
  };
}

export function calcPortalPreviewStagePosition(
  bounds: PortalPreviewPanBounds,
  offset: PortalPreviewStageOffset
): PortalPreviewStageOffset {
  return {
    x: bounds.centeredX + offset.x,
    y: offset.y,
  };
}
