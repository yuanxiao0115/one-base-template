type Size = { width: string; height: string };

type ResetSizeVm = {
  $el?: Element;
  imgSize?: Size;
  barSize?: Size;
};

export function resetSize(vm: ResetSizeVm) {
  // 图片的宽度、高度，移动条的宽度、高度
  let imgWidth: string;
  let imgHeight: string;
  let barWidth: string;
  let barHeight: string;

  const parentEl = (vm.$el?.parentNode as HTMLElement | null) ?? null;
  const parentWidth = parentEl?.offsetWidth || window.innerWidth;
  const parentHeight = parentEl?.offsetHeight || window.innerHeight;

  const imgSize = vm?.imgSize ?? { width: '310px', height: '155px' };
  const barSize = vm?.barSize ?? { width: '310px', height: '50px' };

  if (typeof imgSize.width === 'string' && imgSize.width.includes('%')) {
    imgWidth = `${(parseInt(imgSize.width) / 100) * parentWidth}px`;
  } else {
    imgWidth = imgSize.width;
  }

  if (typeof imgSize.height === 'string' && imgSize.height.includes('%')) {
    imgHeight = `${(parseInt(imgSize.height) / 100) * parentHeight}px`;
  } else {
    imgHeight = imgSize.height;
  }

  if (typeof barSize.width === 'string' && barSize.width.includes('%')) {
    barWidth = `${(parseInt(barSize.width) / 100) * parentWidth}px`;
  } else {
    barWidth = barSize.width;
  }

  if (typeof barSize.height === 'string' && barSize.height.includes('%')) {
    barHeight = `${(parseInt(barSize.height) / 100) * parentHeight}px`;
  } else {
    barHeight = barSize.height;
  }

  return {
    imgWidth,
    imgHeight,
    barWidth,
    barHeight
  };
}
