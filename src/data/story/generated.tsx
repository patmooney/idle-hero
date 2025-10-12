import type { IDrop, IStory, StoryMarker, IEncounter, IOption } from "../types";

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

const getEncounter = (level = 0): IEncounter => {
  const attMin = minDamage[level][0] + Math.round(Math.random() * (minDamage[level][1] - minDamage[level][0]));
  const attMax = maxDamage[level][0] + Math.round(Math.random() * (maxDamage[level][1] - maxDamage[level][0]));
  const maxHealth = health[level][0] + Math.round(Math.random() * (health[level][1] - health[level][0]));
  const attSpeed = speed[level][0] + Math.round(Math.random() * (speed[level][1] - speed[level][0]));

  let findDrops = true;
  const drops = [];

  do {
    const r = Math.random();
    let fd = levelDrops[level].reverse().find((d) => r <= d[1]);
    let dropCandidates = fd ? levelDrops[level].filter((d) => d[1] === fd[1]) : [] // drops with same chance
    let drop = dropCandidates?.length ? (dropCandidates ?? [])[(Math.floor(Math.random() * dropCandidates.length))] : undefined;
    if (drop) {
      drops.push(drop);
    }
    findDrops = Math.random() <= (0.5 / (drops.length || 1));
  } while(findDrops);

  const name = [
    adjectives[level][Math.floor(Math.random() * adjectives[level].length)],
    monsterNames[level][Math.floor(Math.random() * monsterNames[level].length)]
  ].join(" ");
  return       {
    name: name.replaceAll(/\s/g, "_").toLowerCase() + "_1",
    label: name,
    drops: drops.map<IDrop>((d) => ({ name: d[0], chance: 1 })),
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
    encounters: () => getEncounter(level)
  };
  return story;
};
