export interface LatestRequestGuard {
  next: () => number;
  isLatest: (token: number) => boolean;
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
    reset() {
      token = 0;
    },
    current() {
      return token;
    }
  };
}
