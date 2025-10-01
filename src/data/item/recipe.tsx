import { IStoryContext } from "../../provider/story";
import { IRecipe } from "../types";

const items: IRecipe[] = [
  {
    name: "recipe_hay_hand_1",
    label: "Recipe: Hay hand wraps",
    stackable: false,
    exclusive: true,
    craftableItem: "hay_hand_1"
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
    }
  })
);

export default items;
