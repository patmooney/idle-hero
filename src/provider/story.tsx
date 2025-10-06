import { createContext, Accessor, ParentComponent, createSignal, JSXElement, onMount, createMemo, batch } from "solid-js";
import { IItem, IItemEquipable, IPlayerStats, IStory, MasteryType } from "../data/types";
import { createStore, SetStoreFunction, Store, unwrap } from "solid-js/store";

import itemData from "../data/item";
import storyData from "../data/story";
import furnitureData from "../data/furniture";

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
  onEquip: (item: IItemEquipable) => boolean;
  navStack: Accessor<string[]>;
  onUnequip: (item: IItemEquipable) => boolean;
  onAddStat: (name: keyof IPlayerStats, amount: number) => void;
  onAddMastery: (name: MasteryType, amount: number) => void;
  onLog: (msg: string | JSXElement, type?: LogType) => void;
  onTask: (opts: Pick<IStory, "label" | "description" | "noRepeat" | "duration" | "onComplete">) => void;
  addInventory: (item: IItem | string, count?: number) => number;
  removeInventory: (item: IItem | string, count?: number) => boolean;
  addStash: (item: IItem | string, count?: number) => number;
  removeStash: (item: IItem | string, count?: number) => boolean;
  onClearState: () => void;
};
export const StoryContext = createContext<IStoryContext>();

const loadStory = (name: string) => {
  return new Story(storyData[name] ?? storyData[DEFAULT_STORY]);
};

export const StoryProvider: ParentComponent = (props) => {
  const [story, setStory] = createSignal<Story>(loadStory(DEFAULT_STORY));
  const [player, setPlayer] = createStore<Player>(new Player({}));
  const [state, setState] = createStore<GameState>(new GameState({ furniture: ["furniture_bench_basic_1", "furniture_stash_1"] }));
  const [navStack, setNavStack] = createSignal<string[]>([DEFAULT_STORY]);
  const [log, setLog] = createSignal<ILogItem[]>([]);

  const onShouldDrop = (_: IItem) => true;

  onMount(() => onLoadState());

  const onLoadState = () => {
    const save = JSON.parse(window.localStorage.getItem("save") ?? "null") as { state: GameState, player: Player, nav: string[], story: string } | null;
    if (save) {
      setPlayer({ ...save.player, invent: save.player.invent.map((i) => i ? ({ ...itemData[i.name], stack: i.stack }) : null) });
      setState(save.state);
      setNavStack(save.nav);
      setStory(loadStory(save.story));
    }
  };

  const onClearState = () => {
    batch(() => {
      setPlayer(new Player({}));
      setState(new GameState({ furniture: ["furniture_bench_basic_1"] }));
      setStory(loadStory(DEFAULT_STORY));
      setNavStack([DEFAULT_STORY]);
    });
    saveState();
  };

  /* SAVE STATE */
  const saveState = () => {
    window.localStorage.setItem(
      "save",
      JSON.stringify({ player: unwrap(player), story: story().name, state: unwrap(state), nav: navStack() })
    )
  };
  window.addEventListener("beforeunload", saveState);
  setInterval(saveState, 10000);

  const addInventory = (item: IItem | string, count = 1): number => {
    if (!count) {
      return count;
    }
    if (count === Infinity) {
      console.error("Cannot add infinite items to invent");
      return 0;
    }
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
    if (!count) {
      return false;
    }

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

  const addStash = (item: IItem | string, count = 1): number => {
    if (!count) {
      return count;
    }
    if (count === Infinity) {
      console.error("Cannot add infinite items to stash");
      return 0;
    }
    if (typeof item === "string") {
      if (!itemData[item]) {
        console.warn("Invalid or not found item", item);
        return count;
      }
      item = itemData[item];
    }
    let newInvent = [...state.stash];
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
          if (!inv?.name || !inv?.stack || !remaining) {
            return inv;
          }
          if (inv.name === item.name && inv.stack < item.maxStack!) {
            let stack = Math.min(inv.stack + remaining, item.maxStack!);
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
              name: item.name,
              stack
            };
          }
          return inv;
        }
      );
    }
    if (remaining < count) {
      setState("stash", newInvent);
    }
    // number of items added to bag
    return count - remaining;
  };


  const stashSlots = createMemo(() => {
    try {
      return state.furniture.map((f) => furnitureData[f]).filter((f) => f.type === "stash").reduce<number>((acc, f) => acc + (f.storageSize ?? 0), 0);
    } catch (err) {
      console.error(err);
      return 0;
    }
  });

  const removeStash = (item: IItem | string, count = 1): boolean => {
    if (!count) {
      return false;
    }

    if (typeof item === "string") {
      if (!itemData[item]) {
        console.warn("Invalid or not found item", item);
        return false;
      }
      item = itemData[item];
    }

    const i = state.stash.findLastIndex((inv) => inv?.name === item.name);
    if (i < 0) {
      return false;
    }
    const newInvent = [
      ...state.stash.toReversed().map(
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
    newInvent.push(...new Array(stashSlots() - newInvent.length).fill(null)); // put nulls at end
    setState("stash", newInvent);
    return true;
  };

  const onNavigate = (name: string) => {
    if (name === "_start") {
      name = DEFAULT_STORY;
    }
    if (name === DEFAULT_STORY) {
      setNavStack([DEFAULT_STORY]);
      setStory(loadStory(DEFAULT_STORY));
      return;
    }
    const isBack = /^_back/.test(name);
    if (!isBack && !storyData[name]) {
      console.error(`Unknown story ${name}`);
      return;
    }
    if (isBack) {
      const [_, _steps] = name.split(".");
      const steps = Math.min(parseInt(_steps ?? "1"), navStack().length + 1);
      name = navStack().at(-1 - steps) ?? DEFAULT_STORY;
      if (navStack().length > 1) {
        setNavStack(navStack().slice(0, -steps));
      }
    } else if (navStack().at(-1) !== name) {
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
    setLog([...log().slice(Math.min(log()?.length - 999, 0)), item]);
  }

  const onEquip = (item: IItemEquipable): boolean => {
    if (removeInventory(item)) {
      let isEquiped = false;
      setPlayer(
        "equipment",
        [
          ...player.equipment.map(
            (eq) => {
              if(eq.equipSlot === item.equipSlot) {
                isEquiped = true;
                Object.entries(eq.stats ?? {}).forEach(
                  ([k, v]) => onAddStat(k as keyof IPlayerStats, 0 - v)
                );
                addInventory(eq);
                return item;
              }
              return eq;
            }
          ),
          ...(isEquiped ? [] : [item])
        ]
      )
      Object.entries(item.stats ?? {}).forEach(
        ([k, v]) => onAddStat(k as keyof IPlayerStats, v)
      );
      return true;
    }
    return false;
  };

  const onUnequip = (item: IItemEquipable): boolean => {
    const hasEquipped = !!player.equipment.find((eq) => eq.name === item.name);
    if (hasEquipped && addInventory(item)) {
      setPlayer("equipment", [...player.equipment.filter(
        (eq) => eq.name !== item.name
      )]);
      Object.entries(item.stats ?? {}).forEach(
        ([k, v]) => onAddStat(k as keyof IPlayerStats, 0 - v)
      );
      return true;
    }
    return false;
  }

  const onTask = (opts: Pick<IStory, "label" | "description" | "noRepeat" | "duration" | "onComplete">) => {
    setNavStack([...navStack(), "task"]);
    setStory(
      new Story({
        name: "task",
        type: "task",
        ...opts,
        onComplete: opts.noRepeat ? opts.onComplete ?? (() => onNavigate("_back")) : undefined
      })
    );
  };

  const storyValue = {
    story, onNavigate, onAddStat, player, state, setState,
    setPlayer, addInventory, removeInventory, log, onLog, onAddMastery,
    onEquip, onUnequip, onTask, navStack, addStash, removeStash, onClearState
  };

  return <StoryContext.Provider value={storyValue}>{props.children}</StoryContext.Provider>
};
