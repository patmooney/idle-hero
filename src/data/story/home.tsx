import { IStoryContext } from "../../provider/story";
import { IItemCraftable, IStory } from "../types";
import { furniture } from "../home";
import itemData from "../item";

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
    options: (ctx: IStoryContext) => {
      return ctx.state.furniture.map((f) => furniture[f]).filter((f) => f.type === "craft")
        .map((f) => ({ label: f.label, goto: `story_craft_${f.cratingType}_1` }))
    }
  },
  {
    name: "story_craft_basic_1",
    label: "Basic crafting",
    description: "A very simple crafting table",
    type: "dialogue",
    options: (ctx: IStoryContext) => {
      return ctx.player.recipes.map((r) => itemData[r]).filter((i) => (i as IItemCraftable).craftType === "basic")
        .map((i) => ({
          label: i.label,
          action: (ctx: IStoryContext) => {
            ctx.onTask({
              noRepeat: true,
              label: `Crafting`,
              description: i.label,
              duration: 100,
              onComplete: () => craftItem(ctx, i as IItemCraftable)
            });
          },
          isDisabled: !hasIngredients(ctx, i as IItemCraftable),
          subtext: (i as IItemCraftable).ingredients?.map((ing) => `${itemData[ing[0]].label} (${ing[1]})`).join(" - ")
        }));
    }
  }
];

const craftItem = (ctx: IStoryContext, item: IItemCraftable) => {
  // TODO - this should take time like an encounter
  ctx.addInventory(item);
  item.ingredients?.forEach(
    (ing) => ctx.removeInventory(...ing)
  );
};

const hasIngredients = (ctx: IStoryContext, item: IItemCraftable) => {
  if (!item.ingredients?.length) {
    return true;
  }
  return item.ingredients.every((ing) => {
    const count = ctx.player.invent.reduce<number>((acc, inv) => {
      if (inv?.name === ing[0]) {
        acc = acc + (inv.stack ?? 1)
      }
      return acc;
    }, 0);
    return count >= ing[1];
  });
};


export default story;
