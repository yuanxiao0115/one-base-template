import { describe, expect, it } from 'vite-plus/test';

import {
  calcPortalManualPanRange,
  calcPortalPreviewPanBounds,
  calcPortalPreviewStagePosition,
  clampPortalPreviewOffset,
  clampPortalPreviewPercent
} from './preview-stage-utils';

describe('portal preview stage utils', () => {
  it('应限制手动缩放百分比范围', () => {
    expect(clampPortalPreviewPercent(10)).toBe(50);
    expect(clampPortalPreviewPercent(120)).toBe(120);
    expect(clampPortalPreviewPercent(260)).toBe(200);
  });

  it('应计算手动平移基础范围', () => {
    expect(calcPortalManualPanRange(1200, 900, 80)).toBe(150);
    expect(calcPortalManualPanRange(1200, 1190, 80)).toBe(80);
    expect(calcPortalManualPanRange(900, 1200, 80)).toBe(0);
  });

  it('自动模式应返回零偏移边界', () => {
    const bounds = calcPortalPreviewPanBounds({
      manualMode: false,
      hostWidth: 1200,
      hostHeight: 700,
      stageWidth: 800,
      stageHeight: 600,
      minOffset: 80
    });

    expect(bounds.centeredX).toBe(200);
    expect(bounds.minX).toBe(0);
    expect(bounds.maxX).toBe(0);
    expect(bounds.minY).toBe(0);
    expect(bounds.maxY).toBe(0);
  });

  it('手动模式下应基于容器计算平移边界', () => {
    const bounds = calcPortalPreviewPanBounds({
      manualMode: true,
      hostWidth: 1200,
      hostHeight: 700,
      stageWidth: 800,
      stageHeight: 500,
      minOffset: 80
    });

    expect(bounds.centeredX).toBe(200);
    expect(bounds.minX).toBe(-200);
    expect(bounds.maxX).toBe(200);
    expect(bounds.minY).toBe(-100);
    expect(bounds.maxY).toBe(100);
  });

  it('应对平移偏移量做边界钳制并计算舞台位置', () => {
    const bounds = calcPortalPreviewPanBounds({
      manualMode: true,
      hostWidth: 1000,
      hostHeight: 700,
      stageWidth: 1200,
      stageHeight: 900,
      minOffset: 80
    });

    const offset = clampPortalPreviewOffset({ x: 80, y: -300 }, bounds);
    expect(offset).toEqual({ x: 0, y: -200 });

    const stagePos = calcPortalPreviewStagePosition(bounds, offset);
    expect(stagePos).toEqual({ x: -100, y: -200 });
  });
});
