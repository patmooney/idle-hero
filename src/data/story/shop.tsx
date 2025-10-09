import type { IGameContext } from "../../provider/game";
import type { IInventoryContext } from "../../provider/inventory";
import type { IPlayerContext } from "../../provider/player";
import type { IOption } from "../types";

import itemData from "../item";

export type ForSaleItem = { name: string, cost: number };

export const createShop = (items: ForSaleItem[]) => {
  return (gameCtx: IGameContext, inventCtx: IInventoryContext, playerCtx: IPlayerContext): IOption[] => {
    const gold = playerCtx?.player.stats.gold;
    return items.map<IOption>(
      (forSale) => {
        const item = itemData[forSale.name];
        return {
          label: `${item?.label ?? "UNKNOWN"} - ${forSale.cost}g`,
          action: () => {
            inventCtx?.addInventory(item.name, 1);
            playerCtx?.onAddStat("gold", 0 - forSale.cost);
            gameCtx?.onLog(`You purchase the ${item.label} for ${forSale.cost}g`, "meta");
          },
          isDisabled: forSale.cost > (gold ?? 0)
        };
      }
    );
  }
};
