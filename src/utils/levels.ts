import { LEVEL_EXP_BASE, LEVEL_EXPONENT, MASTERY_EXP_BASE } from "./constants";

export const levelsXP = new Array(99 * 5).fill(1).map(
  (_, idx) => Math.floor(LEVEL_EXP_BASE * Math.pow(idx + 1, LEVEL_EXPONENT))
);

export const masteryXP = new Array(100 * 5).fill(1).map(
  (_, idx) => Math.floor(MASTERY_EXP_BASE * Math.pow(idx + 1, LEVEL_EXPONENT))
)

export const getProgress = (exp: number, lvls = levelsXP) => {
    if (!exp) {
        return 0;
    }
    const nextLevelExpIdx = lvls.findIndex((xp) => xp > exp);
    const base = exp - (lvls[nextLevelExpIdx - 1] ?? 0);
    const required = lvls[nextLevelExpIdx] - (lvls[nextLevelExpIdx - 1] ?? 0);
    return base / required;
}

export const getLevel = (exp: number, lvls = levelsXP) => lvls.findIndex((xp) => xp > exp);
