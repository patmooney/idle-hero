import { MAX_MASTERY } from "../../utils/constants";
import { IMastery, IMasteryBonus } from "../types";

const utilityMastery: IMastery[] = [
  {
    name: "woodcutting",
    label: "Woodcutting",
    bonus: new Array(MAX_MASTERY + 1).fill(null).map(
      // Over 500 levels add cumulative stats
      // level 5    - attMax: 1
      // level 10   - attMin: 1, attMax: 2
      // level 50   - attMin: 5, attMax: 10, attSpeed: 0.1
      // level 500  - attMin: 50, attMax: 100, attSpeed: 1
      (_, idx) => {
        if (!idx || idx % 5 !== 0) {
          return;
        }
        return {
          level: idx,
          stats: { durationModifier: idx % 10 === 0 ? 10 : 0 }, // i.e. every 10 levels, take 10 ticks off the duration, by level 100 a basic log will take 1 tick
          dropModifiers: [
            { name: "wood_log_1", chance: idx % 50 === 0 ? 1 : 0 }
          ]
        };
      }
    ).filter(Boolean) as IMasteryBonus[]
  }
];

export default utilityMastery;
