import { afterEach, describe, expect, it } from 'vite-plus/test';
import { resetSize } from './util';

const defaultInnerWidth = window.innerWidth;
const defaultInnerHeight = window.innerHeight;

function setWindowSize(width: number, height: number) {
  Object.defineProperty(window, 'innerWidth', {
    value: width,
    configurable: true
  });
  Object.defineProperty(window, 'innerHeight', {
    value: height,
    configurable: true
  });
}

describe('auth util resetSize', () => {
  afterEach(() => {
    setWindowSize(defaultInnerWidth, defaultInnerHeight);
  });

  it('未传尺寸时应返回默认像素值', () => {
    const result = resetSize({});

    expect(result).toEqual({
      imgWidth: '310px',
      imgHeight: '155px',
      barWidth: '310px',
      barHeight: '50px'
    });
  });

  it('百分比尺寸应按父容器宽高换算', () => {
    const parent = document.createElement('div');
    Object.defineProperty(parent, 'offsetWidth', { value: 400, configurable: true });
    Object.defineProperty(parent, 'offsetHeight', { value: 200, configurable: true });
    const child = document.createElement('div');
    parent.appendChild(child);

    const result = resetSize({
      $el: child,
      imgSize: {
        width: '50%',
        height: '25%'
      },
      barSize: {
        width: '10%',
        height: '20%'
      }
    });

    expect(result).toEqual({
      imgWidth: '200px',
      imgHeight: '50px',
      barWidth: '40px',
      barHeight: '40px'
    });
  });

  it('无父容器时应回退使用 window 宽高进行百分比换算', () => {
    setWindowSize(1000, 800);

    const result = resetSize({
      imgSize: {
        width: '10%',
        height: '20%'
      },
      barSize: {
        width: '30%',
        height: '40%'
      }
    });

    expect(result).toEqual({
      imgWidth: '100px',
      imgHeight: '160px',
      barWidth: '300px',
      barHeight: '320px'
    });
  });
});
