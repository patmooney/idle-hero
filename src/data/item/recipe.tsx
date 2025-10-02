import { IStoryContext } from "../../provider/story";
import { IRecipe } from "../types";

const items: IRecipe[] = [
  {
    name: "recipe_hay_hand_1",
    label: "Recipe: Hay hand wraps",
    stackable: false,
    exclusive: true,
    craftableItem: "hay_hand_1"
  },
  {
    name: "recipe_hay_head_1",
    label: "Recipe: Hay bandana",
    stackable: false,
    exclusive: true,
    craftableItem: "hay_head_1"
  },
  {
    name: "recipe_hay_chest_1",
    label: "Recipe: Hay vest",
    stackable: false,
    exclusive: true,
    craftableItem: "hay_chest_1"
  }
].map(
  (item) => ({
    ...item,
    use: (ctx: IStoryContext) => {
      if (!ctx.player.recipes.includes(item.craftableItem)) {
        ctx.setPlayer("recipes", [...ctx.player.recipes, item.craftableItem]);
        ctx.setState("prohibitedItems", [...ctx.state.prohibitedItems, item.name]);
      }
      ctx.removeInventory(item.name);
      return true;
    }
  })
);

export default items;
