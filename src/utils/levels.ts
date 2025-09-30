export const LEVEL_EXP_BASE = 80;
export const LEVEL_EXPONENT = 1.7;

export const levelsXP = new Array(99 * 5).fill(1).map(
  (_, idx) => Math.floor(LEVEL_EXP_BASE * Math.pow(idx + 1, LEVEL_EXPONENT))
);

export const getProgress = (exp: number) => {
    if (!exp) {
        return 0;
    }
    const nextLevelExpIdx = levelsXP.findIndex((xp) => xp > exp);
    const base = exp - (levelsXP[nextLevelExpIdx - 1] ?? 0);
    const required = levelsXP[nextLevelExpIdx] - (levelsXP[nextLevelExpIdx - 1] ?? 0);
    return base / required;
}

export const getLevel = (exp: number) => levelsXP.findIndex((xp) => xp > exp);
