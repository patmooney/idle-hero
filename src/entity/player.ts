import { IItem, IItemEquipable, IPlayer, IPlayerStats, IStats, MasteryType } from "../data/types";
import { MAX_INVENT, BASE_ATTACK_DELAY } from "../utils/constants";
import { cumulateBonus } from "../utils/mastery";

export class Player implements IPlayer {
    equipment: IItemEquipable[];
    stats: IPlayerStats;
    mastery: { [key in MasteryType]?: number };
    invent: ((IItem & { stack?: number }) | null)[];
    recipes: string[];

    constructor(player: Partial<IPlayer> = {}, invent: (IItem | null)[] = new Array(MAX_INVENT).fill(null)) {
      this.equipment = player.equipment ?? [];
      this.mastery = player.mastery ?? {};
      this.recipes = player.recipes ?? [];
      this.stats = player.stats ?? {
        gold: 120,
        experience: 0,
        health: 10,
        maxHealth: 10,
        strength: 1,
        agility: 1,
        attSpeed: 0,
      };
      this.invent = invent;
    }

    weaponMastery(): MasteryType {
      return this.equipment.find((eq) => eq.equipSlot === "weapon")?.masteryType ?? "unarmed";
    }

    getMasteryPerk(mastery: MasteryType): IStats {
      return cumulateBonus(mastery, this.mastery[mastery] ?? 0);
    }

    attackDamage(): [number, number] {
      let totalEqMin = this.equipment.reduce<number>((acc, eq) => acc + (eq.stats?.attMin ?? 0), 1);
      let totalEqMax = this.equipment.reduce<number>((acc, eq) => acc + (eq.stats?.attMax ?? 0), 1);
      
      const masteryType = this.weaponMastery();
      const perk = this.getMasteryPerk(masteryType);
      totalEqMin += perk?.attMin ?? 0;
      totalEqMax += perk?.attMax ?? 0;

      const strRatio = 1 + Math.pow((this.stats.strength ?? 0) / 100, 0.7);
      const min = Math.round(totalEqMin * strRatio);
      const max = Math.round(totalEqMax * strRatio);

      return [min, max];
    }

    attackRate() {
      const maxAgility = 100;
      const agility = Math.min(maxAgility, Math.max(1, this.stats.agility ?? 0));
      const minAttackDelay = 1; // not possible to go faster than 4 attacks a second

      // this means that with agility at 100 and a 100% delay reduction from items, the fastest is 4 attacks p/s
      const maxAgilityEffect = BASE_ATTACK_DELAY / 5;
      const bonusRatio = Math.sqrt(agility / maxAgility);
      const statDelayReduce = maxAgilityEffect * bonusRatio;

      const maxItemEffect = BASE_ATTACK_DELAY / 5;
      const itemRatio = Math.min(this.equipment.reduce<number>((acc, eq) => acc + (eq.stats?.attSpeed ?? 0), 0), 1)// in future will be a %, e.g. a helm of speed gives 10% reduced attack delay (0.1)
      const itemDelayReduce = itemRatio * maxItemEffect;

      const maxMasteryEffect = BASE_ATTACK_DELAY / 5;
      const masteryType = this.weaponMastery();
      const perk = this.getMasteryPerk(masteryType);
      const masteryDelayReduce = (perk.attSpeed ?? 0) * maxMasteryEffect;

      const maxCombinedEffect = (BASE_ATTACK_DELAY / 2.5) - 1;
      const combinedDelayReduce = maxCombinedEffect * ((bonusRatio + itemRatio + (perk.attSpeed ?? 0)) / 3);

      const rate = Math.max(BASE_ATTACK_DELAY - statDelayReduce - itemDelayReduce - combinedDelayReduce - masteryDelayReduce, minAttackDelay);
      return rate;
    }
}
