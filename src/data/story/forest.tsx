import type { IEncounter, IOption, IStory } from "../types";

const forestEncounters: IEncounter[] = [
  {
    name: "enc_rabbit_1",
    label: "Little rabbit",
    chance: 0.4,
    experience: 20,
    drops: [],
    health: 5,
    stats: {
      attMin: 0,
      attMax: 1,
      attSpeed: 10,
    }
  },
  {
    name: "enc_deer_1",
    label: "Frightened deer",
    chance: 0.2,
    experience: 40,
    drops: [],
    health: 10,
    stats: {
      attMin: 0,
      attMax: 4,
      attSpeed: 45,
    }
  },
  {
    name: "enc_dead_tree_1",
    label: "Dead tree",
    chance: 1,
    experience: 10,
    health: 10,
    drops: [
      { name: "food_acorn_1", chance: 0.5 }
    ]
  },
  { // an early boss?
    name: "enc_demonic_tree_1",
    label: "Demonic tree",
    chance: 0.001,
    experience: 2000,
    health: 400,
    drops: [
      { name: "demonic_essense_1", chance: 1 }
    ]
  }
];

const forest: IStory[] = [
  {
    type: "dialogue",
    name: "story_forest_1",
    label: "Forest border",
    description: "The canopy casts a shadow. Sounds, eyes ... movement",
    options: (_, _1, playerCtx): IOption[] => {
      const hasAxe = !!playerCtx?.equipment().find((eq) => eq.equipSlot === "weapon" && eq.utilityType === "axe");
      return [
        { label: "Chop wood", goto: "task_chop_wood_1", isDisabled: !hasAxe },
        { label: <span class="text-red-500">Venture deeper</span>, goto: "story_forest_2" },
      ];
    }
  },
  {
    type: "task",
    name: "task_chop_wood_1",
    label: "Surrounded by trees",
    description: "Chopping wood",
    duration: 100,
    masteryType: "woodcutting",
    cooldown: 10,
    experience: 1,
    utilityType: "axe",
    items: [
      { name: "wood_log_1", chance: 1 },
      { name: "food_acorn_1", chance: 0.1 },
    ]
  },
  {
    name: "story_forest_2",
    label: "Deep forest",
    description: "Creatures block your path...",
    type: "encounter",
    limit: 5,
    onComplete: (gameCtx) => {
      gameCtx?.onNavigate("story_forest_3");
    },
    cooldown: 20,
    encounters: forestEncounters
  },
  {
    name: "story_forest_4",
    label: "Deep forest hunt",
    description: "You aren't scared of a few forest creatures",
    type: "encounter",
    onComplete: (gameCtx) => {
      gameCtx?.onNavigate("story_forest_3");
    },
    cooldown: 20,
    encounters: forestEncounters
  },
  {
    name: "story_forest_3",
    label: "welcome to the deep forest",
    type: "dialogue",
    description: "You made it!"
  }
];

export default forest;
