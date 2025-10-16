import { IItemEquipable, IPlayer, IPlayerStats, IRecipe, IStats, MasteryType } from "../data/types";
import { BASE_ATTACK_DELAY, BASE_MAX_HEALTH, MAX_ATTR_LEVEL } from "../utils/constants";
import { cumulateBonusByLevel } from "../utils/mastery";

import itemData from "../data/item";

import { createContext, Accessor, ParentComponent, createMemo, useContext, batch, onMount } from "solid-js";
import { createStore, SetStoreFunction, Store, unwrap } from "solid-js/store";
import { getLevel, masteryXP } from "../utils/levels";
import { GameContext } from "./game";

export interface IPlayerContext {
  attackDamage: Accessor<[number, number]>;
  attackRate: Accessor<number>;
  equipment: Accessor<IItemEquipable[]>;
  player: Store<IPlayer>;
  recipes: Accessor<IRecipe[]>;
  stats: Accessor<IPlayerStats>;

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
  const gameCtx = useContext(GameContext);
  const [masteryLevels, setMasteryLevels] = createStore<{ [key in MasteryType]: number }>({
    unarmed: 0,
    sword: 0,
    axe: 0,
    pickaxe: 0,
    battleaxe: 0,
    scythe: 0,
    spear: 0,
    flail: 0,
    mace: 0,
    staff: 0,
    alchemy: 0,
    smithing: 0,
    crafting: 0,
    woodcutting: 0,
    cooking: 0,
    dagger: 0
  });

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

  onMount(() => {
    const mL = unwrap(masteryLevels);
    const levels = Object.entries(mL).reduce<{ [key in MasteryType]: number }>(
      (acc, [k]) => {
        const exp = props.player.mastery[k as MasteryType];
        acc[k as MasteryType] = getLevel(exp as number, masteryXP);
        return acc;
      }, mL
    );
    setMasteryLevels(levels);
  });

  const equipment = createMemo(() => {
    return props.player.equipment?.map(
      (name) => gameCtx?.getItemData(name) as IItemEquipable
    ) ?? [];
  });

  const weaponMastery = createMemo(() => {
    return equipment().find((eq) => eq.equipSlot === "weapon")?.masteryType ?? "unarmed";
  });

  const getMasteryPerk = (mastery: MasteryType) => {
      return cumulateBonusByLevel(mastery, masteryLevels[mastery]);
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
    const maxDexterity = 100;
    const dexterity = Math.min(maxDexterity, Math.max(1, props.player.stats?.dexterity ?? 0));
    const minAttackDelay = 1; // not possible to go faster than 4 attacks a second

    // this means that with dexterity at 100 and a 100% delay reduction from items, the fastest is 4 attacks p/s
    const maxDexterityEffect = BASE_ATTACK_DELAY / 5;
    const bonusRatio = dexterity / maxDexterity;
    const statDelayReduce = maxDexterityEffect * bonusRatio;

    const maxItemEffect = BASE_ATTACK_DELAY / 5;
    const itemRatio = Math.min(equiped.reduce<number>((acc, eq) => acc + (eq.stats?.attSpeed ?? 0), 0), 1)// in future will be a %, e.g. a helm of speed gives 10% reduced attack delay (0.1)
    const itemDelayReduce = itemRatio * maxItemEffect;

    const maxMasteryEffect = BASE_ATTACK_DELAY / 5;
    const masteryType = weaponMastery();
    const perk = getMasteryPerk(masteryType);
    const masteryDelayReduce = (perk.attSpeed ?? 0) * maxMasteryEffect;

    const maxCombinedEffect = (BASE_ATTACK_DELAY / 2.5) - 1;
    const combRat = (bonusRatio * 0.33) + (itemRatio * 0.33) + ((perk.attSpeed ?? 0) * 0.33) + 0.01;
    const combinedDelayReduce = maxCombinedEffect * combRat;

    const rate = Math.max(BASE_ATTACK_DELAY - statDelayReduce - itemDelayReduce - combinedDelayReduce - masteryDelayReduce, minAttackDelay);
    return rate;
  });

  const onAddStat = (stat: keyof IPlayerStats, value = 1) => {
    const oldVal = props.player.stats[stat] ?? 0;
    const newVal = oldVal + value;

    if (stat === "experience" && getLevel(newVal) > getLevel(oldVal)) {
      gameCtx?.setState("points", (gameCtx.state.points ?? 0) + 1);
      gameCtx?.onLog("You have levels up! +1 attr. points", "meta");
      batch(() => {
        props.setPlayer("stats", "maxHealth", (props.player.stats.maxHealth ?? 10) + 5);
        props.setPlayer("stats", "health", props.player.stats.health + 5);
      });
    }

    props.setPlayer("stats", stat, newVal);
  };

  const onAddMastery = (mastery: MasteryType, value = 1) => {
    const newVal = (props.player.mastery[mastery] ?? 0) + value;
    const newLevel = getLevel(newVal, masteryXP);
    batch(() => {
      if (newLevel !== masteryLevels[mastery]) {
        setMasteryLevels(mastery, newLevel);
      }
      props.setPlayer("mastery", mastery, newVal);
    });
  };

  const itemBonus = (stat: keyof IStats, max: number = Infinity) =>
    Math.min(equipment().reduce<number>((acc, eq) => acc + (eq.stats?.[stat] ?? 0), 0), max);

  const stats = createMemo<IPlayerStats>(() => {
    const stats: IPlayerStats = {
      ...props.player.stats
    };

    const con = props.player.stats.constitution;
    const baseMaxHealth = props.player.stats.maxHealth ?? BASE_MAX_HEALTH;
    const [aMin, aMax] = attackDamage();

    stats.maxHealth = itemBonus("maxHealth") + (con ? Math.round(baseMaxHealth * (1 + (con / MAX_ATTR_LEVEL))) : baseMaxHealth);
    stats.attSpeed = attackRate();
    stats.attMin = aMin;
    stats.attMax = aMax;
    stats.magRes = itemBonus("magRes");
    stats.physRes = itemBonus("physRes");

    return stats;
  });

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
    equipment, stats,
    onAddStat, onAddMastery, onEquip, onUnequip,
    recipes, getMasteryPerk, weaponMastery, onAddRecipe
  };

  return <PlayerContext.Provider value={playerValue}>{props.children}</PlayerContext.Provider>
};
