import { createContext, Accessor, ParentComponent, createSignal, JSXElement } from "solid-js";
import { IItem, IItemEquipable, IPlayerStats, MasteryType } from "../data/types";
import { createStore, SetStoreFunction, Store } from "solid-js/store";

import itemData from "../data/item";
import storyData from "../data/story";
import { Story } from "../entity/story";
import { Player } from "../entity/player";
import { MAX_INVENT } from "../utils/constants";
import { GameState } from "../entity/state";

export const DEFAULT_STORY = "story_town_1";

export type LogType = "bad" | "good" | "meta" | "drop" | "basic";
export type ILogItem = {
  time: string;
  msg: (string | JSXElement);
  type: LogType;
}

export interface IStoryContext {
  story: Accessor<Story>;
  state: Store<GameState>;
  player: Store<Player>;
  log: Accessor<ILogItem[]>;
  setPlayer: SetStoreFunction<Player>;
  setState: SetStoreFunction<GameState>;
  onNavigate: (name: string) => void;
  onEquip: (item: IItemEquipable) => void;
  onAddStat: (name: keyof IPlayerStats, amount: number) => void;
  onAddMastery: (name: MasteryType, amount: number) => void;
  onLog: (msg: string | JSXElement, type?: LogType) => void;
  addInventory: (item: IItem | string, count?: number) => void;
  removeInventory: (item: IItem | string, count?: number) => void;
};
export const StoryContext = createContext<IStoryContext>();

const loadStory = (name: string) => {
  return new Story(storyData[name] ?? storyData[DEFAULT_STORY]);
};

export const StoryProvider: ParentComponent = (props) => {
  const [story, setStory] = createSignal<Story>(loadStory(DEFAULT_STORY));
  const [player, setPlayer] = createStore<Player>(new Player({}));
  const [state, setState] = createStore<GameState>(new GameState({ furniture: ["bench_simple"] }));
  const [navStack, setNavStack] = createSignal<string[]>([DEFAULT_STORY]);
  const [log, setLog] = createSignal<ILogItem[]>([]);

  const onShouldDrop = (_: IItem) => true;

  const addInventory = (item: IItem | string, count = 1): number => {
    if (typeof item === "string") {
      if (!itemData[item]) {
        console.warn("Invalid or not found item", item);
        return count;
      }
      item = itemData[item];
    }
    let newInvent = [...player.invent];
    if (item.exclusive && newInvent.find((inv) => inv?.name === item.name)) {
      return 0;
    }
    if (!onShouldDrop(item)) {
      return 0;
    }
    let remaining = count;
    if (item.stackable && item.maxStack) {
      // fill up any stacks first
      newInvent = newInvent.map(
        (inv) => {
          if (!inv?.name || !inv?.stack || !inv.maxStack || !remaining) {
            return inv;
          }
          if (inv.name === item.name && inv.stack < inv.maxStack) {
            let stack = Math.min(inv.stack + remaining, inv.maxStack);
            remaining -= stack - inv.stack;
            return {
              ...inv,
              stack 
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
            const stack = Math.min(remaining, item.maxStack ?? 1);
            remaining -= stack;
            return {
              ...item,
              stack
            };
          }
          return inv;
        }
      );
    }
    if (remaining < count) {
      setPlayer("invent", newInvent);
    }
    // number of items added to bag
    return count - remaining;
  };

  const removeInventory = (item: IItem | string, count = 1): boolean => {
    if (typeof item === "string") {
      if (!itemData[item]) {
        console.warn("Invalid or not found item", item);
        return false;
      }
      item = itemData[item];
    }

    const i = player.invent.findLastIndex((inv) => inv?.name === item.name);
    if (i < 0) {
      return false;
    }
    const newInvent = [
      ...player.invent.toReversed().map(
        (inv) => {
          if (!count || inv?.name !== item.name || !inv?.stack) {
            return inv;
          }
          if (inv.stack <= count) {
            count -= inv.stack;
            return null;
          }
          const stack = inv.stack - count;
          count = 0;
          return {
            ...inv,
            stack: stack
          };
        }
      ).reverse()
    ].filter(Boolean);
    newInvent.push(...new Array(MAX_INVENT - newInvent.length).fill(null)); // put nulls at end
    setPlayer("invent", newInvent);
    return true;
  };

    // number of items added to bag
  const onNavigate = (name: string) => {
    if (name !== "_back" && !storyData[name]) {
      console.error(`Unknown story ${name}`);
      return;
    }
    if (name === "_back") {
      name = navStack().at(-2) ?? DEFAULT_STORY;
      if (navStack().length > 1) {
        setNavStack(navStack().slice(0, -1));
      }
    } else {
      setNavStack([...navStack(), name]);
    }
    setStory(loadStory(name));
  };

  const onAddStat = (stat: keyof IPlayerStats, value = 1) => {
    const newVal = (player.stats[stat] ?? 0) + value;
    setPlayer("stats", stat, newVal);
  };

  const onAddMastery = (mastery: MasteryType, value = 1) => {
    const newVal = (player.mastery[mastery] ?? 0) + value;
    setPlayer("mastery", mastery, newVal);
  };

  const onLog = (msg: string | JSXElement, type: LogType = "basic") => {
    const d = new Date();
    const item = {
      msg,
      time: [d.getHours(), d.getMinutes(), d.getSeconds()].join(":"),
      type
    };
    setLog([...log().slice(Math.min(log()?.length - 99, 0)), item]);
  }

  const onEquip = (item: IItemEquipable) => {
    if (removeInventory(item)) {
      let isEquiped = false;
      setPlayer(
        "equipment",
        [
          ...player.equipment.map(
            (eq) => {
              if(eq.equipSlot === item.equipSlot) {
                isEquiped = true;
                addInventory(eq);
                return item;
              }
              return eq;
            }
          ),
          ...(isEquiped ? [] : [item])
        ]
      )
    }
  }

  const storyValue = {
    story, onNavigate, onAddStat, player, state, setState,
    setPlayer, addInventory, removeInventory, log, onLog, onAddMastery,
    onEquip
  };

  return <StoryContext.Provider value={storyValue}>{props.children}</StoryContext.Provider>
};
