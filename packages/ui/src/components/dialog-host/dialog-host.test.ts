import { describe, expect, it } from 'vite-plus/test';
import { closeAllDialogs, closeDialog, getDialogHostQueue, openDialog } from './dialog-host';

describe('dialog-host api', () => {
  it('openDialog 应返回可追踪 id，并写入队列', () => {
    closeAllDialogs();

    const id = openDialog({
      title: '测试弹窗',
      contentRenderer: () => 'content'
    });

    const queue = getDialogHostQueue().value;
    const target = queue.find((item) => item.id === id);

    expect(id).toContain('ob-dialog-host-');
    expect(target).toBeTruthy();
    expect(target?.visible).toBe(true);
    expect(target?.title).toBe('测试弹窗');
  });

  it('closeDialog / closeAllDialogs 应收敛可见状态', () => {
    closeAllDialogs();

    const first = openDialog({ title: 'A', contentRenderer: () => 'a' });
    openDialog({ title: 'B', contentRenderer: () => 'b' });

    closeDialog(first);
    let queue = getDialogHostQueue().value;
    expect(queue.find((item) => item.id === first)?.visible).toBe(false);

    closeAllDialogs();
    queue = getDialogHostQueue().value;
    expect(queue.every((item) => item.visible === false)).toBe(true);
  });
});
