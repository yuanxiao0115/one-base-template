export interface DebouncedTask {
  run: () => void;
  cancel: () => void;
}

export function createDebouncedTask(task: () => void, delayMs: number): DebouncedTask {
  let timer: ReturnType<typeof setTimeout> | null = null;

  function run() {
    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => {
      timer = null;
      task();
    }, delayMs);
  }

  function cancel() {
    if (!timer) {
      return;
    }

    clearTimeout(timer);
    timer = null;
  }

  return {
    run,
    cancel
  };
}
