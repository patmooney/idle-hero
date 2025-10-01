import { IStoryContext } from "../../provider/story";
import itemData from "../item";
import { LearnType } from "../types";

const actions: ({ name: string, action: (ctx: IStoryContext, args?: unknown[]) => void })[] = [
  {
    name: "action_sell_hay_1",
    action: (ctx) => {
      const invent = ctx.player.invent;
      const { removeInventory, onAddStat } = ctx;
      const invItem = itemData["hay_1"];
      if (!invItem) {
        return;
      }
      const count = invent.filter((inv) => inv?.name === "hay_1").reduce<number>((acc, inv) => acc + (inv?.stack ?? 0), 0);
      if (!count) {
        return;
      }
      removeInventory(invItem, count);
      onAddStat("gold", count);
      ctx.onLog(
        <>
          You sell<span class="font-bold ml-1">{/*@once*/count}</span> <span class="font-bold text-blue-500 mr-1">{/*@once*/invItem.label}</span>
          For <span class="font-bold">{/*@once*/count}</span> gold
        </>,
        "meta"
      );
    }
  },
  {
    name: "use_item",
    action: (_, args?: unknown[]) => {
      if (!args?.length) {
        return;
      }
      const useArg = args[0];
      if (!Array.isArray(useArg)) {
        console.warn("Invalid use args", args);
        return;
      }
      const type = useArg[0];
      if (type === "learn") {
        const [_, learnType, entityType] = useArg[0] as [string, LearnType, string];
        if (!["recipe", "skill"].includes(learnType)) {
          console.warn("Invalid use args", args);
          return;
        }
      }
    }
  }
];

export default actions;
