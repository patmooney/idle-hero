import { Accessor, batch, createContext, createEffect, createMemo, ParentComponent } from "solid-js";

import itemData from "../data/item";
import furnitureData from "../data/furniture";

import { MAX_INVENT } from "../utils/constants";
import { IGameState, InventItem } from "../data/types";
import { SetStoreFunction, Store } from "solid-js/store";

export interface IInventoryContext {
  addInventory: (item: string, count?: number) => number;
  removeInventory: (item: string, count?: number) => number;
  addStash: (item: string, count?: number) => number;
  removeStash: (item: string, count?: number) => number;
  inventory: Accessor<InventItem[]>;
  stash: Accessor<InventItem[]>;
}

export const InventoryContext = createContext<IInventoryContext>();

export const InventoryProvider: ParentComponent<{
  state: Store<IGameState>, setState: SetStoreFunction<IGameState>
}> = (props) => {
  const addInventory = (name: string, toAdd = 1): number => {
    const [newInvent, addedCount] = addToContainer(props.state.inventory, name, toAdd);
    if (addedCount > 0) {
      props.setState("inventory", newInvent);
    }
    return addedCount;
  };

  const inventory = createMemo(() => props.state.inventory)
  const stash = createMemo(() => props.state.stash)

  createEffect((stashSize: number) => {
    const stashCount = props.state.furniture.map((f) => furnitureData[f])
      .filter((f) => f.type === "stash")
      .reduce<number>((acc, f) => acc + (f.storageSize ?? 0), 0);
    if (stashCount === stashSize) {
      return stashCount;
    }
    const existingStash = props.state.stash.filter(Boolean);
    if (stashCount < existingStash.length) {
      throw new Error("Invalid stash, size too small for contents");
    }
    props.setState("stash", [...existingStash, ...(new Array(stashCount - existingStash.length).fill(null))]);
    return stashCount;
  }, 0)

  const removeInventory = (name: string, toRemove = 1): number => {
    const [newInvent, removedCount] = removeFromContainer(props.state.inventory, name, toRemove);
    if (removedCount > 0) {
      props.setState("inventory", newInvent);
    }
    return removedCount;
  };

  // always from the invent
  const addStash = (name: string, toAdd = 1): number => {
    const [newStash, addedCount] = addToContainer(props.state.stash, name, toAdd);
    const [newInvent, removedCount] = removeFromContainer(props.state.inventory, name, toAdd);
    if (removedCount !== addedCount) {
      console.error(`Unable to move ${name} from invent to stash`);
      return 0;
    }
    if (addedCount > 0) {
      batch(() => {
        props.setState("inventory", newInvent);
        props.setState("stash", newStash);
      });
    }
    return addedCount;
  };

  // always to the invent
  const removeStash = (name: string, toRemove = 1): number => {
    const [newStash, removedCount] = removeFromContainer(props.state.stash, name, toRemove);
    const [newInvent, addedCount] = addToContainer(props.state.inventory, name, toRemove);
    if (removedCount !== addedCount) {
      console.error(`Unable to move ${name} from stash to invent`);
      return 0;
    }
    if (removedCount > 0) {
      batch(() => {
        props.setState("inventory", newInvent);
        props.setState("stash", newStash);
      });
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
    if (item.maxStack) {
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
      newInvent = newInvent.map<InventItem>(
        (inv) => {
          if (!remaining) {
            return inv;
          }
          if (inv === null) {
            const count = Math.min(remaining, item.maxStack ?? 1);
            remaining -= count;
            return {
              name: item.name,
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
    if (toRemove === Infinity) {
      toRemove = container.reduce<number>((acc, i) => i?.name === name ? acc + i.count : acc, 0);
    }

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
    inventory, stash,

    addInventory, removeInventory,
    addStash, removeStash
  };

  return <InventoryContext.Provider value={value}>{props.children}</InventoryContext.Provider>;
};
