import { IMastery, IMasteryBonus } from "../types";

const mastery: IMastery[] = [
  {
    name: "unarmed",
    label: "Unarmed",
    bonus: new Array(501).fill(null).map(
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
          stats: { attMin: idx % 10 === 0 ? 1 : 0, attMax: 1, attSpeed: idx % 50 === 0 ? 0.1 : 0 }
        };
      }
    ).filter(Boolean) as IMasteryBonus[]
  }
];

export default mastery;
