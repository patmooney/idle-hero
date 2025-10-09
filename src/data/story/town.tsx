import { IStory } from "../types";
import { Speech } from "./format";
import { createShop } from "./shop";

const town: IStory[] = [
  {
    type: "dialogue",
    name: "story_town_merchants_1",
    label: "Town Bazaar",
    description: "Souks, stalls, spices, hands... hands... hands...",
    options: [
      { label: "Tool merchant", goto: "story_town_merchant_tool_1" },
      { label: "Building merchant", goto: "story_town_merchant_building_1" }
    ]
  },
  {
    type: "dialogue",
    name: "story_town_merchant_tool_1",
    label: "Tool Merchant",
    description: <>A burly man, skin of leather <Speech lines={[`The very finest tools`]} /></>,
    options: createShop([
      { name: "utility_axe_1", cost: 50 }
    ])
  },
  {
    type: "dialogue",
    name: "story_town_merchant_building_1",
    label: "Building Merchant",
    description: <>Beard down to his bare nipples <Speech lines={[`DIY... home improvements`, `Sweat...`, `Muscles...`]} /></>,
    options: createShop([
      { name: "recipe_bench_basic_1", cost: 100 }
    ])
  }
];

export default town;
