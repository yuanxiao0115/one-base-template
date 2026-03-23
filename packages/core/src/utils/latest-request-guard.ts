export type LatestRequestToken = number;

export interface LatestRequestGuard {
  next: () => LatestRequestToken;
  isLatest: (token: LatestRequestToken) => boolean;
  invalidate: () => void;
}

export function createLatestRequestGuard(): LatestRequestGuard {
  let token: LatestRequestToken = 0;

  return {
    next() {
      token += 1;
      return token;
    },
    isLatest(inputToken) {
      return inputToken === token;
    },
    invalidate() {
      token += 1;
    }
  };
}
