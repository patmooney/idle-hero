import { IFurniture, IItemCraftable, IStory, ItemCount } from "../types";

import itemData from "../item";
import furnitureData from "../furniture";
import { IInventoryContext } from "../../provider/inventory";
import { IGameContext } from "../../provider/game";

const story: IStory[] = [
  {
    name: "story_home_1",
    label: "Home",
    description: "Home sweet home",
    type: "dialogue",
    options: [
      { label: "Build", goto: "story_home_2" },
      { label: "Stash", goto: "story_stash_1" },
      { label: "Craft", goto: "story_home_4" },
    ]
  },
  {
    name: "story_stash_1",
    label: "Stash",
    type: "dialogue",
    description: <>
      <div class="font-bold">Stash</div>
      <div>Retrieve items from stash here, place in stash from your invent</div>
    </>
  },
  {
    name: "story_home_2",
    label: "Building",
    description: "Build new appliances",
    type: "dialogue",
    options: (gameCtx, inventCtx, playerCtx, storyCtx) => {
      if (!playerCtx || !inventCtx) {
        return [];
      }
      const availableBuilding = playerCtx?.recipes()?.filter((r) => !!r.craftableFurniture)
        .map((r) => furnitureData[r.craftableFurniture!]);
      return availableBuilding
        .map((i) => ({
          label: i.label,
          action: () => {
            storyCtx?.onTask({
              noRepeat: true,
              label: `Building`,
              description: i.label,
              duration: 100,
              onComplete: () => buildFurniture(gameCtx, inventCtx!, i)
            });
          },
          isDisabled: !hasIngredients(inventCtx, i),
          subtext: i.ingredients?.map((ing) => `${itemData[ing.name].label} (${ing.count})`).join(" - ")
        })) ?? [];
    }
  },
  {
    name: "story_home_4",
    label: "Crafting",
    description: "A workshop",
    type: "dialogue",
    options: (ctx) => {
      return ctx?.state.furniture?.map((f) => furnitureData[f]).filter((f) => f.type === "craft")
        .map((f) => ({ label: f.label, goto: `story_craft_${f.cratingType}_1` })) ?? []
    }
  },
  {
    name: "story_craft_basic_1",
    label: "Basic crafting",
    description: "A very simple crafting table",
    type: "dialogue",
    options: (_, inventCtx, playerCtx, storyCtx) => {
      if (!playerCtx || !inventCtx) {
        return [];
      }
      const basicRecipes = playerCtx?.recipes()?.filter((r) => !!r.craftableItem)
        .map((r) => itemData[r.craftableItem!])
        .filter((i) => (i as IItemCraftable).craftType === "basic" && (i as IItemCraftable).craftComplexity === 1);
      return basicRecipes
        .map((i) => ({
          label: i.label,
          action: () => {
            storyCtx?.onTask({
              noRepeat: true,
              label: `Crafting`,
              description: i.label,
              duration: 100,
              onComplete: () => craftItem(inventCtx!, i as IItemCraftable)
            });
          },
          isDisabled: !hasIngredients(inventCtx, i as IItemCraftable),
          subtext: (i as IItemCraftable).ingredients?.map((ing) => `${itemData[ing?.name].label} (${ing?.count})`).join(" - ")
        })) ?? [];
    }
  }
];

const craftItem = (ctx: IInventoryContext, item: IItemCraftable) => {
  ctx.addInventory(item.name, 1);
  item.ingredients?.forEach(
    (ing) => ctx.removeInventory(ing.name, ing.count)
  );
};

const buildFurniture = (ctx: IGameContext, inventCtx: IInventoryContext, build: IFurniture) => {
  ctx.setState("furniture", [...ctx.state.furniture, build.name]);
  build.ingredients?.forEach(
    (ing) => inventCtx.removeInventory(ing.name, ing.count)
  );
}

const hasIngredients = (ctx: IInventoryContext | undefined, item: { ingredients?: ItemCount[] }) => {
  if (!item.ingredients?.length) {
    return true;
  }
  return item.ingredients.every((ing) => {
    const count = ctx?.inventory().reduce<number>((acc, inv) => {
      if (inv?.name === ing.name) {
        acc = acc + (inv!.count ?? 1)
      }
      return acc;
    }, 0) ?? 0;
    return count >= ing.count;
  });
};

export default story;
