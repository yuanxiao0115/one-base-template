export interface LatestRequestGuard {
  next: () => number;
  isLatest: (token: number) => boolean;
  invalidate: () => void;
  reset: () => void;
}

export function createLatestRequestGuard(): LatestRequestGuard {
  let token = 0;

  return {
    next() {
      token += 1;
      return token;
    },
    isLatest(value: number) {
      return value === token;
    },
    invalidate() {
      token += 1;
    },
    reset() {
      token += 1;
    }
  };
}
