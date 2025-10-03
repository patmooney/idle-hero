import { IStoryContext } from "../../provider/story";
import { IOption, IStory } from "../types";
import itemData from "../item";
import {Speech} from "./format";

const toolItems: { name: string, cost: number }[] = [
  { name: "utility_axe_1", cost: 100 }
]

const town: IStory[] = [
  {
    type: "dialogue",
    name: "story_town_merchants_1",
    label: "Town Bazaar",
    description: "Souks, stalls, spices, hands... hands... hands...",
    options: [
      { label: "Tool merchant", goto: "story_town_merchant_tool_1" }
    ]
  },
  {
    type: "dialogue",
    name: "story_town_merchant_tool_1",
    label: "Tool Merchant",
    description: <>A burly man, skin of leather <Speech lines={[`The very finest tools`]} /></>,
    options: (ctx: IStoryContext): IOption[] => {
      const gold = ctx.player.stats.gold;
      return toolItems.map<IOption>(
        (tool) => {
          const item = itemData[tool.name];
          return {
            label: item?.label ?? "UNKNOWN",
            action: (ctx_1) => {
              ctx_1.addInventory(item);
              ctx_1.onAddStat("gold", 0 - tool.cost);
              ctx_1.onNavigate("story_town_merchant_tool_1");
            },
            isDisabled: tool.cost > gold
          };
        }
      );
    }
  }
];

export default town;
