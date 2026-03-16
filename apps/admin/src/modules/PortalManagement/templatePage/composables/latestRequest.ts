export interface LatestRequestGuard {
  next: () => number;
  isLatest: (token: number) => boolean;
  invalidate: () => void;
  reset: () => void;
  current: () => number;
}

export function createLatestRequestGuard(): LatestRequestGuard {
  let token = 0;

  return {
    next() {
      token += 1;
      return token;
    },
    isLatest(inputToken: number) {
      return inputToken === token;
    },
    invalidate() {
      token += 1;
    },
    reset() {
      token += 1;
    },
    current() {
      return token;
    }
  };
}
