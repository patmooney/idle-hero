import { IItemEquipable, IPlayer, IPlayerStats, IRecipe, IStats, MasteryType } from "../data/types";
import { BASE_ATTACK_DELAY } from "../utils/constants";
import { cumulateBonus } from "../utils/mastery";

import itemData from "../data/item";

import { createContext, Accessor, ParentComponent, createMemo } from "solid-js";
import { SetStoreFunction, Store } from "solid-js/store";

export interface IPlayerContext {
  attackDamage: Accessor<[number, number]>;
  attackRate: Accessor<number>;
  equipment: Accessor<IItemEquipable[]>;
  mastery: Store<{ [key in MasteryType]?: number }>;
  player: Store<IPlayer>;
  recipes: Accessor<IRecipe[]>;

  onEquip: (item: IItemEquipable) => boolean;
  onUnequip: (item: IItemEquipable) => boolean;
  onAddMastery: (mastery: MasteryType, xp: number) => void;
  onAddStat: (stat: keyof IPlayerStats, xp: number) => void;
  weaponMastery: () => MasteryType;
  getMasteryPerk: (mastery: MasteryType) => IStats;
  onAddRecipe: (name: string) => void;
}

export const PlayerContext = createContext<IPlayerContext>();

export const PlayerProvider: ParentComponent<{ player: Store<IPlayer>, setPlayer: SetStoreFunction<IPlayer> }> = (props) => {
  const recipes = createMemo(() => {
    return props.player.recipes?.map(
      (name) => itemData[name] as IRecipe
    ) ??[];
  });

  const onAddRecipe = (recipe: string) => {
    props.setPlayer(
      "recipes",
      [...(props.player.recipes ?? []), recipe].filter((val, idx, arr) => arr.indexOf(val) === idx)
    );
  }

  const equipment = createMemo(() => {
    return props.player.equipment?.map(
      (name) => itemData[name] as IItemEquipable
    ) ?? [];
  });

  const weaponMastery = createMemo(() => {
    return equipment().find((eq) => eq.equipSlot === "weapon")?.masteryType ?? "unarmed";
  });

  const getMasteryPerk = (mastery: MasteryType) => {
      return cumulateBonus(mastery, props.player.mastery?.[mastery] ?? 0);
  };

  const attackDamage = createMemo<[number, number]>(() => {
    const equiped = equipment();
    let totalEqMin = equiped.reduce<number>((acc, eq) => acc + (eq.stats?.attMin ?? 0), 1);
    let totalEqMax = equiped.reduce<number>((acc, eq) => acc + (eq.stats?.attMax ?? 0), 1);

    const masteryType = weaponMastery();
    const perk = getMasteryPerk(masteryType);
    totalEqMin += perk?.attMin ?? 0;
    totalEqMax += perk?.attMax ?? 0;

    const strRatio = 1 + Math.pow((props.player.stats?.strength ?? 0) / 100, 0.7);
    const min = Math.round(totalEqMin * strRatio);
    const max = Math.round(totalEqMax * strRatio);

    return [min, max];
  });

  const attackRate = createMemo<number>(() => {
    const equiped = equipment();
    const maxAgility = 100;
    const agility = Math.min(maxAgility, Math.max(1, props.player.stats?.agility ?? 0));
    const minAttackDelay = 1; // not possible to go faster than 4 attacks a second

    // this means that with agility at 100 and a 100% delay reduction from items, the fastest is 4 attacks p/s
    const maxAgilityEffect = BASE_ATTACK_DELAY / 5;
    const bonusRatio = Math.sqrt(agility / maxAgility);
    const statDelayReduce = maxAgilityEffect * bonusRatio;

    const maxItemEffect = BASE_ATTACK_DELAY / 5;
    const itemRatio = Math.min(equiped.reduce<number>((acc, eq) => acc + (eq.stats?.attSpeed ?? 0), 0), 1)// in future will be a %, e.g. a helm of speed gives 10% reduced attack delay (0.1)
    const itemDelayReduce = itemRatio * maxItemEffect;

    const maxMasteryEffect = BASE_ATTACK_DELAY / 5;
    const masteryType = weaponMastery();
    const perk = getMasteryPerk(masteryType);
    const masteryDelayReduce = (perk.attSpeed ?? 0) * maxMasteryEffect;

    const maxCombinedEffect = (BASE_ATTACK_DELAY / 2.5) - 1;
    const combinedDelayReduce = maxCombinedEffect * ((bonusRatio + itemRatio + (perk.attSpeed ?? 0)) / 3);

    const rate = Math.max(BASE_ATTACK_DELAY - statDelayReduce - itemDelayReduce - combinedDelayReduce - masteryDelayReduce, minAttackDelay);
    return rate;
  });

  const onAddStat = (stat: keyof IPlayerStats, value = 1) => {
    const newVal = (props.player.stats[stat] ?? 0) + value;
    props.setPlayer("stats", stat, newVal);
  };

  const onAddMastery = (mastery: MasteryType, value = 1) => {
    const newVal = (props.player.mastery[mastery] ?? 0) + value;
    props.setPlayer("mastery", mastery, newVal);
  };

  const onEquip = (item: IItemEquipable): boolean => {
    if (equipment().find(eq => eq.equipSlot === item.equipSlot)) {
      return false;
    }
    props.setPlayer(
      "equipment",
      [
        ...props.player.equipment,
        item.name
      ]
    )
    Object.entries(item.stats ?? {}).forEach(
      ([k, v]) => onAddStat(k as keyof IPlayerStats, v)
    );
    return true;
  };

  const onUnequip = (item: IItemEquipable): boolean => {
    const hasEquipped = !!props.player.equipment.includes(item.name);
    if (!hasEquipped) {
      return false;
    }
    props.setPlayer("equipment", [...props.player.equipment.filter(
      (name) => name !== item.name
    )]);
    Object.entries(item.stats ?? {}).forEach(
      ([k, v]) => onAddStat(k as keyof IPlayerStats, 0 - v)
    );
    return true;
  }

  const playerValue: IPlayerContext = {
    attackRate, attackDamage, player: props.player,
    equipment, mastery: props.player.mastery,
    onAddStat, onAddMastery, onEquip, onUnequip,
    recipes, getMasteryPerk, weaponMastery, onAddRecipe
  };

  return <PlayerContext.Provider value={playerValue}>{props.children}</PlayerContext.Provider>
};
