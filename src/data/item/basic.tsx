import { IStoryContext } from "../../provider/story";
import { IItem } from "../types";

const items: IItem[] = [
  {
    name: "hay_1",
    label: "Hay",
    stackable: true,
    maxStack: 100
  },
  {
    name: "recipe_hay_hand_1",
    label: "Recipe: Hay hand wraps",
    stackable: false,
    exclusive: true,
    use: (ctx: IStoryContext) => {
      if (!ctx.player.recipes.includes("hay_hand_1")) {
        ctx.setPlayer("recipes", [...ctx.player.recipes, "hay_hand_1"]);
        ctx.setState("prohibitedItems", [...ctx.state.prohibitedItems, "recipe_hay_hand_1"]);
      }
      ctx.removeInventory("recipe_hay_hand_1");
    }
  },
  {
    name: "hay_hand_1",
    label: "Hay hand wraps",
    stackable: false,
    stats: {
      attMin: 1,
      attMax: 3
    }
  }
];

export default items;
