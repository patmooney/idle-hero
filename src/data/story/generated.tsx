import type { IGameContext } from "../../provider/game";
import type { IStory, StoryMarker, IEncounter, IOption, IStats, IItem, EquipSlotType, MasteryType } from "../types";

const DROP_CHANCE = 0.05;
const ATTR_BOOST_CHANCE = 0.2;

const itemAdjectives = ["marginal", "somewhat", "evident", "proven", "considerable", "superb", "extraordinary", "legendary", "monstrous", "psychotic", "mythic", "divine", "world-ending"];

const weaponTier = [
    ["wooden", "stone", "bone", "obsidian"],
    ["copper", "bronze", "iron", "steel"],
    ["damascus", "cold iron", "silver", "titanium"],
    ["meteor", "mithril", "adamantine", "orichalcum"],
    ["light", "water", "earth", "fire"]
];
const armourTier = [
    ["cloth", "leather", "bone", "obsidian"],
    ["copper", "bronze", "iron", "steel"],
    ["damascus", "cold iron", "silver", "titanium"],
    ["meteor", "mithril", "adamantine", "orichalcum"],
    ["light", "water", "earth", "fire"]
];

const weaponTypes: [EquipSlotType, string, MasteryType][] = [
  ["weapon", "staff", "staff"],
  ["weapon","sword", "sword"],
  ["weapon", "great axe", "battleaxe"],
  ["weapon", "dagger", "dagger"],
  ["weapon", "spear", "spear"]
];
const armourTypes: [EquipSlotType, string][] = [["head", "helmet"], ["shoulder", "paldron"], ["hand", "gauntlets"], ["chest", "armour"], ["leg", "grieves"], ["foot", "boots"]];

const weaponStats: [keyof IStats, string][] = [["attMin", "attack"], ["attMax", "attack"], ["attSpeed", "speed"]];
const armourStats: [keyof IStats, string][] = [["maxHealth", "health"], ["physRes", "defence"], ["magRes", "resistance"]];

const weaponBaseStats: { [key in MasteryType]?: IStats } = {
  "staff": { attMin: 4, attMax: 4, attSpeed: 0.1 },
  "sword": { attMin: 2, attMax: 3, attSpeed: 0.3 },
  "battleaxe": { attMin: 1, attMax: 6, attSpeed: 0.2 },
  "dagger": { attMin: 1, attMax: 2, attSpeed: 0.5 },
  "spear": { attMin: 2, attMax: 4, attSpeed: 0.2 }
};

const armourBaseStats: Record<string, IStats> = {
  "helmet": { maxHealth: 5 },
  "paldron": { magRes: 1, physRes: 1 },
  "gauntlets": { attSpeed: 0.1, physRes: 1, strength: 1 },
  "armour": { physRes: 2, magRes: 2, maxHealth: 5, constitution: 1 },
  "grieves": { physRes: 1, magRes: 1 },
  "boots": { physRes: 1, magRes: 1, agility: 1 }
};

const monsterNames = [
    ["Rat", "Bat", "Slime", "Beetle", "Crab", "Snake", "Frog", "Spider", "Worm", "Crow"],
    ["Wolf", "Goblin", "Boar", "Lizard", "Scorpion", "Bandit", "Imp", "Wasp", "Monkey", "Skeleton"],
    ["Troll", "Ogre", "Harpy", "Basilisk", "Minotaur", "Wyvern", "Centaur", "Golem", "Manticore", "Wraith"],
    ["Chimera", "Hydra", "Vampire", "Lich", "Griffin", "Djinn", "Kraken", "Behemoth", "Leviathan", "Shade"],
    ["Dragon", "Phoenix", "Titan", "Seraph", "Demon", "Colossus", "Archon", "World Serpent", "Voidborn"]
];

const adjectives = [
    ["Small", "Wild", "Feral", "Hungry", "Quick", "Silent", "Agile", "Savage", "Venomous", "Rabid", "Stalking", "Stone", "Iron", "Ashen", "Muddy"],
    ["Shadow", "Ember", "Frost", "Storm", "Thorn", "Crystal", "Winged", "Clawed", "Bladed", "Blooded", "Vicious", "Twisted", "Warped", "Cursed", "Blighted"],
    ["Arcane", "Runic", "Mystic", "Phantom", "Spectral", "Infernal", "Corrupted", "Lunar", "Solar", "Tidal", "Venomous", "Void", "Enchanted", "Temporal", "Primeval"],
    ["Ancient", "Forgotten", "Eternal", "Eldritch", "Celestial", "Dread", "Malevolent", "Sacred", "Forbidden", "Prime", "Abyssal", "Astral", "Titan", "Leviathan", "Demonic"],
    ["Mythic", "Divine", "Eternal", "Worldforged", "Cataclysmic", "Apocalyptic", "Transcendent", "Omniscient", "Voidborn", "Infinite", "Cosmic", "Godbound", "Alpha", "Omega", "Absolute"]
];

const minDamage = [[0, 5], [5, 10], [10, 30], [30, 60], [60, 100]];
const maxDamage = [[5, 10], [10, 30], [30, 60], [60, 100], [100, 150]];
const health = [[20, 50], [50, 100], [100, 200], [200, 400], [400, 1000]];
const speed = [[50, 100], [40, 90], [30, 80], [20, 60], [10, 50]];

export const levelDrops: [string, number][][] = [
    [["easy_drop_1", 0.2], ["easy_drop_2", 0.1], ["easy_drop_3", 0.1], ["easy_drop_4", 0.1], ["easy_drop_rare_1", 0.01], ["easy_drop_rare_2", 0.01], ["easy_drop_ultra_1", 0.001]],
    [["med_drop_1", 0.2], ["med_drop_2", 0.1], ["med_drop_3", 0.1], ["med_drop_4", 0.1], ["med_drop_rare_1", 0.01], ["med_drop_rare_2", 0.01], ["med_drop_ultra_1", 0.001]],
    [["hard_drop_1", 0.2], ["hard_drop_2", 0.1], ["hard_drop_3", 0.1], ["hard_drop_4", 0.1], ["hard_drop_rare_1", 0.01], ["hard_drop_rare_2", 0.01], ["hard_drop_ultra_1", 0.001]],
    [["insane_drop_1", 0.2], ["insane_drop_2", 0.1], ["insane_drop_3", 0.1], ["insane_drop_4", 0.1], ["insane_drop_rare_1", 0.01], ["insane_drop_rare_2", 0.01], ["insane_drop_ultra_1", 0.001]],
    [["demonic_drop_1", 0.2], ["demonic_drop_2", 0.1], ["demonic_drop_3", 0.1], ["demonic_drop_4", 0.1], ["demonic_drop_rare_1", 0.01], ["demonic_drop_rare_2", 0.01], ["demonic_drop_ultra_1", 0.001]]
];

const levelGold: [number, number][] = [[0, 5], [5, 20], [20, 30], [30, 50], [50, 100]];

const getEncounter = (level = 0, gameCtx: IGameContext): IEncounter => {
  const attMin = minDamage[level][0] + Math.round(Math.random() * (minDamage[level][1] - minDamage[level][0]));
  const attMax = maxDamage[level][0] + Math.round(Math.random() * (maxDamage[level][1] - maxDamage[level][0]));
  const maxHealth = health[level][0] + Math.round(Math.random() * (health[level][1] - health[level][0]));
  const attSpeed = speed[level][0] + Math.round(Math.random() * (speed[level][1] - speed[level][0]));

  const drops = [];
  if (Math.random() < DROP_CHANCE) {
    const item = generateItem(level);
    gameCtx.onCreateItem(item);
    drops.push({ name: item.name, chance: 1 });
  }

  const name = [
    adjectives[level][Math.floor(Math.random() * adjectives[level].length)],
    monsterNames[level][Math.floor(Math.random() * monsterNames[level].length)]
  ].join(" ");
  return       {
    name: name.replaceAll(/\s/g, "_").toLowerCase() + "_1",
    label: name,
    drops,
    chance: 1,
    health: maxHealth,
    gold: levelGold[level],
    stats: {
      attMax, attMin, attSpeed
    }
  };
}

export const generateStory = (level = 0): IStory => {
  const story: IStory = {
    name: `generated_level_${level}`,
    label: `Cave of mystery level ${level}`,
    description: "What is going on?",
    type: "encounter",
    ...(level < 4 ? {
      limit: 1,
      onComplete: (gameCtx, _, _1, storyCtx) => {
        gameCtx.setState("markers", [...gameCtx.state.markers, `generated_level_${level}` as StoryMarker]);
        storyCtx.onStory({
          ...story,
          limit: undefined,
          onComplete: undefined,
          name: `${story.name}_cmpl`,
          options: [
            {
              label: "Go deeper", action: (_1, _2, _3, storyCtx) => storyCtx.onStory(generateStory(level + 1))
            }
          ]
        });
      }
    } : {}),
    options: (gameCtx) => {
      const opt: IOption = { label: "Go deeper", action: (_1, _2, _3, storyCtx) => storyCtx.onStory(generateStory(level + 1)) };
      return [...(gameCtx.state.markers.includes(`generated_level_${level}` as StoryMarker) ? [opt] : [])]
    },
    encounters: (gameCtx: IGameContext) => getEncounter(level, gameCtx)
  };
  return story;
};

export const generateItem = (level = 0): IItem => {
  let ty: ([EquipSlotType, string, MasteryType] | [EquipSlotType, string])[], st, ti;
  if (Math.random() < 0.1) {
    ty = weaponTypes as [EquipSlotType, string, MasteryType][];
    st = weaponStats;
    ti = weaponTier;
  } else {
    ty = armourTypes as [EquipSlotType, string][];
    st = armourStats;
    ti = armourTier;
  }

  let mat;
  const mR = Math.random();
  let mC = 0;
  for (let mIdx = 0; mIdx < ti[level].length; mIdx++) {
    mC += ((mIdx + 1) * 0.1);
    if (mR <= mC) {
      mat = ti[level].toReversed().at(mIdx);
      break;
    }
  }

  const type = ty[Math.floor(Math.random() * ty.length)];
  const matMultiplyer = 1 + (level * 1) + ((ti[level].indexOf(mat ?? "") ?? 0) * 0.25);

  let stats: IStats = {};

  if ((type as [EquipSlotType, string, MasteryType]).at(2)) {
    const statType = (type as [EquipSlotType, string, MasteryType]).at(2) as MasteryType;
    stats = Object.entries(statType ? weaponBaseStats[statType] ?? {} : {}).reduce<IStats>(
      (acc, [k, n]) => {
        acc[k as keyof IStats] = n * matMultiplyer;
        return acc;
      }, {}
    );
  } else {
    const statType = (type as [EquipSlotType, string]).at(1);
    stats = Object.entries(statType ? armourBaseStats[statType] ?? {} : {}).reduce<IStats>(
      (acc, [k, n]) => {
        acc[k as keyof IStats] = n * matMultiplyer;
        return acc;
      }, {}
    );
  }

  let totalAdd = 0;
  if (Math.random() < ATTR_BOOST_CHANCE) {
    while (true) {
      const chance = 0.5;
      if (Math.random() <= chance) {
        const stat = st[Math.floor(Math.random() * st.length)];
        stats[stat[0]] = (stats[stat[0]] ?? 0) + 1;
        totalAdd++;
        continue;
      }
      if (Math.random() <= 0.3) {
        continue;
      }
      break;
    }
  }

  let adj = "";
  let statLabel = "";
  if (totalAdd) {
    const highStat = Object.entries(stats).reduce<[keyof IStats, number] | undefined>(
      (acc, [s, n]) => {
        if (!acc?.[1] || n > acc[1]) {
          return [s as keyof IStats, n];
        }
        return acc;
      }, undefined
    );
    if (highStat?.[0]) {
      const [name, amnt] = highStat as [keyof IStats, number];
      adj = amnt > itemAdjectives.length
        ? itemAdjectives.at(-1) + "+".repeat(amnt - itemAdjectives.length)
        : itemAdjectives[amnt-1]
      statLabel = highStat ? st.find((s) => s[0] === name)?.[1] ?? "unknown" : "unknown";
    }
  }

  stats.attMax = Math.max(stats.attMax ?? 0, stats.attMin ?? 0) || undefined;

  let label = `${mat} ${type[1]}`;
  if (totalAdd) {
    label = `${label} of ${adj} ${statLabel}`;
  }
  return {
    name: crypto.randomUUID(),
    masteryType: (type as [EquipSlotType, string, MasteryType]).at(2) as MasteryType | undefined,
    label,
    stats,
    equipSlot: type[0]
  }
};
