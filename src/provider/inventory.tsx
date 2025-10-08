import { Accessor, createContext, ParentComponent, Setter, useContext } from "solid-js";

import itemData from "../data/item";
import { MAX_INVENT } from "../utils/constants";
import { InventItem } from "../data/types";
import { GameContext } from "./game";

export interface IInventoryContext {
  addInventory: (item: string, count?: number) => number;
  removeInventory: (item: string, count?: number) => number;
  addStash: (item: string, count?: number) => number;
  removeStash: (item: string, count?: number) => number;
  inventory: Accessor<InventItem[]>;
}

export const InventoryContext = createContext<IInventoryContext>();

export const InventoryProvider: ParentComponent<{ inventory: Accessor<InventItem[]>, setInventory: Setter<InventItem[]> }> = (props) => {
  const gameCtx = useContext(GameContext);

  const addInventory = (name: string, toAdd = 1): number => {
    const [newInvent, addedCount] = addToContainer(props.inventory(), name, toAdd);
    if (addedCount > 0) {
      props.setInventory([...newInvent]);
    }
    return addedCount;
  };

  const removeInventory = (name: string, toRemove = 1): number => {
    const [newInvent, removedCount] = removeFromContainer(props.inventory(), name, toRemove);
    if (removedCount > 0) {
      props.setInventory([...newInvent]);
    }
    return removedCount;
  };

  const addStash = (name: string, toAdd = 1): number => {
    if (!gameCtx?.state.stash) {
      return 0;
    }
    const [newStash, addedCount] = addToContainer(gameCtx.state.stash, name, toAdd);
    if (addedCount > 0) {
      gameCtx.setState("stash", newStash);
    }
    return addedCount;
  };

  const removeStash = (name: string, toRemove = 1): number => {
    if (!gameCtx?.state.stash) {
      return 0;
    }
    const [newStash, removedCount] = removeFromContainer(gameCtx.state.stash, name, toRemove);
    if (removedCount > 0) {
      gameCtx.setState("stash", newStash);
    }
    return removedCount;
  };

  const addToContainer = (container: InventItem[], name: string, toAdd: number): [InventItem[], number] => {
    if (!itemData[name]) {
      console.warn("Invalid or not found item", name);
      return [container, 0];
    }
    const item = itemData[name];
    if (!toAdd) {
      return [container, 0];
    }
    if (toAdd === Infinity) {
      console.error("Cannot add infinite items to invent");
      return [container, 0];
    }

    let newInvent = [...container];
    if (item.exclusive && newInvent.find((inv) => inv?.name === item.name)) {
      return [newInvent, 0];
    }
    let remaining = toAdd;
    if (item.stackable && item.maxStack) {
      // fill up any stacks first
      newInvent = newInvent.map(
        (inv) => {
          if (!inv?.name || !remaining) {
            return inv;
          }
          if (inv.name === item.name && inv.count < item.maxStack!) {
            let count = Math.min(inv.count + remaining, item.maxStack!);
            remaining -= count - inv.count;
            return {
              ...inv,
              count
            }
          }
          return inv;
        }
      );
    }
    if (remaining) {
      newInvent = newInvent.map(
        (inv) => {
          if (!remaining) {
            return inv;
          }
          if (inv === null) {
            const count = Math.min(remaining, item.maxStack ?? 1);
            remaining -= count;
            return {
              ...item,
              count
            };
          }
          return inv;
        }
      );
    }
    return [newInvent, toAdd - remaining];
  };

  const removeFromContainer = (container: InventItem[], name: string, toRemove = 1): [InventItem[], number] => {
    if (!toRemove) {
      return [container, 0];
    }

    if (!itemData[name]) {
      console.warn("Invalid or not found name", name);
      return [container, 0];
    }
    const item = itemData[name];

    const i = container.findLastIndex((inv) => inv?.name === item.name);
    if (i < 0) {
      return [container, 0];
    }

    let remaining = toRemove;

    const newInvent = [
      ...container.toReversed().map(
        (inv) => {
          if (!remaining || inv?.name !== item.name) {
            return inv;
          }
          if (inv.count <= remaining) {
            remaining -= inv.count;
            return null;
          }
          const count = inv.count - remaining;
          remaining = 0;
          return {
            ...inv,
            count
          };
        }
      ).reverse()
    ].filter(Boolean);
    newInvent.push(...new Array(MAX_INVENT - newInvent.length).fill(null)); // put nulls at end
    return [newInvent, toRemove - remaining];
  };

  const value: IInventoryContext = {
    inventory: props.inventory,
    addInventory, removeInventory,
    addStash, removeStash
  };

  return <InventoryContext.Provider value={value}>{props.children}</InventoryContext.Provider>;
};
