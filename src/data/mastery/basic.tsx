import { IMastery, IMasteryBonus } from "../types";

const mastery: IMastery[] = [
  {
    name: "unarmed",
    label: "Unarmed",
    bonus: new Array(501).fill(null).map(
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
