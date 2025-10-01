import { IStory } from "../types";

const story: IStory[] = [
  {
    name: "story_town_1",
    label: "Town",
    description: "You are in town",
    type: "dialogue",
    options: [
      { label: "Visit Farm", goto: "story_farmer_1" },
      { label: "Home", goto: "story_home_1" },
    ]
  },
  {
    name: "story_home_1",
    label: "Home",
    description: "Home sweet home",
    type: "dialogue",
    options: [
      { label: "Build", goto: "story_home_2" },
      { label: "Stash", goto: "story_home_3" },
      { label: "Craft", goto: "story_home_4" },
    ]
  },
  {
    name: "story_farmer_1",
    label: "Farm",
    description: "A farmer approaches you...\n*Hick*\nFeel free to beat up on some scarecrows. I'll buy any hay you find!",
    type: "dialogue",
    options: [
      { label: "Fight scarecrows", goto: "story_scarecrows_1" },
      { label: "Sell Hay", action: "action_sell_hay_1" }
    ]
  },
  {
    name: "story_scarecrows_1",
    label: "Scarecrows",
    description: "Fighting scarecrows",
    type: "encounter",
    encounters: [
      {
        name: "enc_scarecrow_1",
        label: "Scarecrow",
        health: 10,
        chance: 1,
        experience: 50,
        drops: [
          { name: "hay_1", chance: 1 },
          { name: "recipe_hay_hand_1", chance: 1 },
        ]
      }
    ]
  }
];

export default story;
