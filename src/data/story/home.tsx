import { IItemCraftable, IStory } from "../types";

import itemData from "../item";
import furnitureData from "../furniture";
import { IInventoryContext } from "../../provider/inventory";

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
      return playerCtx?.recipes()?.filter((i) => (i as IItemCraftable).craftType === "basic")
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
          subtext: (i as IItemCraftable).ingredients?.map((ing) => `${itemData[ing[0]].label} (${ing[1]})`).join(" - ")
        })) ?? [];
    }
  }
];

const craftItem = (ctx: IInventoryContext, item: IItemCraftable) => {
  ctx.addInventory(item.name, 1);
  item.ingredients?.forEach(
    (ing) => ctx.removeInventory(...ing)
  );
};

const hasIngredients = (ctx: IInventoryContext | undefined, item: IItemCraftable) => {
  if (!item.ingredients?.length) {
    return true;
  }
  return item.ingredients.every((ing) => {
    const count = ctx?.inventory().reduce<number>((acc, inv) => {
      if (inv?.name === ing[0]) {
        acc = acc + (inv.count ?? 1)
      }
      return acc;
    }, 0) ?? 0;
    return count >= ing[1];
  });
};


export default story;
