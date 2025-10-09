import { IRecipe } from "../types";

const items: IRecipe[] = [
  {
    name: "recipe_hay_hand_1",
    label: "Recipe: Hay hand wraps",
    craftableItem: "hay_hand_1"
  },
  {
    name: "recipe_bench_basic_1",
    label: "Recipe: Basic crafting table",
    craftableFurniture: "furniture_bench_basic_1",
  },
  {
    name: "recipe_hay_head_1",
    label: "Recipe: Hay bandana",
    craftableItem: "hay_head_1"
  },
  {
    name: "recipe_hay_chest_1",
    label: "Recipe: Hay vest",
    craftableItem: "hay_chest_1"
  }
].map(
  (item) => ({
    ...item,
    useVerb: "Read",
    category: "book",
    exclusive: true,
    use: (gameCtx, inventCtx, playerCtx, storyCtx) => {
      storyCtx?.onTask({
        noRepeat: true,
        label: `Learning`,
        description: item.label,
        duration: 100,
        onComplete: () => {
          if (!playerCtx?.recipes()?.find((r) => r.craftableItem === item.craftableItem)) {
            playerCtx?.onAddRecipe(item.name);
            gameCtx?.setState("prohibitedItems", [...(gameCtx?.state.prohibitedItems ?? []), item.name]);
          }
          inventCtx?.removeInventory(item.name, 1);
          gameCtx?.onNavigate("_back");
          return true;
        }
      });
      return false;
    }
  })
);

export default items;
