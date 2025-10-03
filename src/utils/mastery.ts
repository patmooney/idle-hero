import { IStats, MasteryType } from "../data/types";
import { getLevel, masteryXP } from "./levels";
import masteryData from "../data/mastery";

export const cumulateBonus = (mastery: MasteryType, exp: number): IStats => {
    const data = masteryData[mastery];
    if (!data) {
        return {};
    }
    const level = getLevel(exp, masteryXP);
    const stats = data.bonus.filter(
        (bonus) => bonus.level <= level
    );
    return stats?.reduce<IStats>(
        (acc, stat) => {
            Object.entries(stat.stats).forEach(
                ([k, v]) => {
                    acc[k as keyof IStats] = (acc[k as keyof IStats] ?? 0) + v;
                }
            );
            return acc;
        }, {}
    ) ?? {};
}

export const cumulateDrop = (dropName: string, mastery: MasteryType, exp: number): number => {
    const data = masteryData[mastery];
    if (!data) {
        return 0;
    }
    const level = getLevel(exp, masteryXP);
    const stats = data.bonus.filter(
        (bonus) => bonus.level <= level
    );
    return stats?.reduce<number>(
        (acc, stat) => acc + (stat.dropModifiers?.find((sm) => sm.name === dropName)?.chance ?? 0)
        , 0
    );
}
