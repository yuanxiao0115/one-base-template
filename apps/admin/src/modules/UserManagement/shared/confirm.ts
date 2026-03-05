export function isConfirmCancelled (error: unknown): boolean {
  return error === 'cancel' || error === 'close';
}

export async function confirmWarn (message: string, title = '确认') {
  await obConfirm.warn(message, title);
}

export async function tryConfirmWarn (message: string, title = '确认'): Promise<boolean> {
  try {
    await confirmWarn(message, title);
    return true;
  } catch (error) {
    if (isConfirmCancelled(error)) {
      return false;
    }
    throw error;
  }
}
