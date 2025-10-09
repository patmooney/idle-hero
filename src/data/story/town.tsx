import { IOption, IStory } from "../types";
import itemData from "../item";
import { Speech } from "./format";

const toolItems: { name: string, cost: number }[] = [
  { name: "utility_axe_1", cost: 1 }
]

const buildingRecipes: { name: string, cost: number }[] = [
  { name: "recipe_bench_basic_1", cost: 1 }
];

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
    options: (gameCtx, inventCtx, playerCtx): IOption[] => {
      const gold = playerCtx?.player.stats.gold;
      return toolItems.map<IOption>(
        (tool) => {
          const item = itemData[tool.name];
          return {
            label: `${item?.label ?? "UNKNOWN"} - ${tool.cost}g`,
            action: () => {
              inventCtx?.addInventory(item.name, 1);
              playerCtx?.onAddStat("gold", 0 - tool.cost);
              gameCtx?.onNavigate("story_town_merchant_tool_1");
            },
            isDisabled: tool.cost > (gold ?? 0)
          };
        }
      );
    }
  },
  {
    type: "dialogue",
    name: "story_town_merchant_building_1",
    label: "Building Merchant",
    description: <>Beard down to his bare nipples <Speech lines={[`DIY... home improvements`, `Sweat...`, `Muscles...`]} /></>,
    options: (gameCtx, inventCtx, playerCtx): IOption[] => {
      const gold = playerCtx?.player.stats.gold;
      return buildingRecipes.map<IOption>(
        (recipe) => {
          const item = itemData[recipe.name];
          return {
            label: `${item?.label ?? "UNKNOWN"} - ${recipe.cost}g`,
            action: () => {
              inventCtx?.addInventory(item.name, 1);
              playerCtx?.onAddStat("gold", 0 - recipe.cost);
              gameCtx?.onNavigate("story_town_merchant_building_1");
            },
            isDisabled: recipe.cost > (gold ?? 0)
          };
        }
      );
    }
  }

];

export default town;
