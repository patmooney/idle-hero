import { createContext, Accessor, ParentComponent, createSignal, JSXElement } from "solid-js";
import { IEncounter, IItem, IOption, IPlayer, IPlayerStats, ISkill, IStory, StoryType } from "../data/types";
import { createStore, SetStoreFunction, Store } from "solid-js/store";

import storyData from "../data/story";
import itemData from "../data/item";
import actionData from "../data/action";

export const DEFAULT_STORY = "story_town_1";
export const BASE_ATTACK_DELAY = 25;
export const MAX_INVENT = 20;

export class Story implements IStory {
  name: string;
  label: string;
  type: StoryType;
  encounters?: IEncounter[];
  duration?: number;
  cooldown?: number;
  items?: IItem[];
  skills?: ISkill[];
  options?: IOption[];

  constructor(story: IStory) {
    this.label = story.label;
    this.type = story.type;
    this.name = story.name;
    Object.assign(this, story);
  }

  getEncounter(): IEncounter | undefined {
    const rand = Math.random();
    if (this.type !== "encounter" || !this.encounters?.length) {
      return;
    }
    // if monsterA has a chance of 0.5 and monsterB has a chance of 0.01 then monsterB will only spawn
    // if rand 
    return this.encounters.sort((a, b) => a.chance - b.chance).find(
      (enc) => {
        return rand <= enc.chance;
      }
    );
  }

  getDrops(enc: IEncounter): IItem[] | undefined {
    const drops = enc.drops?.filter(
      (drop) => {
        return Math.random() <= drop.chance;
      }
    );
    return drops?.map(
      (drop) => itemData[drop.name]
    ).filter(Boolean) as IItem[];
  }
}

export class Player implements IPlayer {
    equipment: IItem[];
    stats: IPlayerStats;
    invent: ((IItem & { stack?: number }) | null)[];

    constructor(player: Partial<IPlayer>, invent?: IItem[]) {
      this.equipment = player.equipment ?? [];
      this.invent = invent ?? new Array(MAX_INVENT).fill(null);
      this.stats = player.stats ?? {
        gold: 0,
        experience: 0,
        health: 10,
        maxHealth: 10,
        strength: 1,
        agility: 1,
        attSpeed: 0,
      };
    }

    weaponMastery(): string {
      return "";
    }
    getMasteryPerk(_: string): any {
      return {};
    }

    attackDamage(): [number, number] {
      let totalEqMin = this.equipment.reduce<number>((acc, eq) => acc + (eq.stats?.attMin ?? 0), 1);
      let totalEqMax = this.equipment.reduce<number>((acc, eq) => acc + (eq.stats?.attMax ?? 0), 1);
      
      const masteryType = this.weaponMastery();
      const perk = this.getMasteryPerk(masteryType);
      totalEqMin += perk?.attack_min ?? 0;
      totalEqMax += perk?.attack_max ?? 0;

      const strRatio = 1 + Math.pow((this.stats.strength ?? 0) / 100, 0.7);
      const min = Math.round(totalEqMin * strRatio);
      const max = Math.round(totalEqMax * strRatio);

      return [min, max];
    }

    attackRate() {
      const maxAgility = 100;
      const agility = Math.min(maxAgility, Math.max(1, this.stats.agility ?? 0));
      const minAttackDelay = 1; // not possible to go faster than 4 attacks a second

      const maxAgilityEffect = 5; // this means that with agility at 100 and a 100% delay reduction from items, the fastest is 4 attacks p/s
      const bonusRatio = Math.sqrt(agility / maxAgility);
      const statDelayReduce = maxAgilityEffect * bonusRatio;

      const maxItemEffect = 5;
      const itemRatio = Math.min(this.equipment.reduce<number>((acc, eq) => acc + (eq.stats?.attSpeed ?? 0), 0), 1)// in future will be a %, e.g. a helm of speed gives 10% reduced attack delay (0.1)
      const itemDelayReduce = itemRatio * maxItemEffect;

      const maxMasteryEffect = 5;
      const masteryType = this.weaponMastery();
      const perk = this.getMasteryPerk(masteryType);
      const masteryDelayReduce = (perk.attSpeed ?? 0) * maxMasteryEffect;

      const maxCombinedEffect = 9;
      const combinedDelayReduce = maxCombinedEffect * ((bonusRatio + itemRatio + (perk.attSpeed ?? 0)) / 3);

      const rate = Math.max(BASE_ATTACK_DELAY - statDelayReduce - itemDelayReduce - combinedDelayReduce - masteryDelayReduce, minAttackDelay);
      return rate;
    }
}

export type LogType = "bad" | "good" | "meta" | "drop" | "basic";
export type ILogItem = {
  time: string;
  msg: (string | JSXElement);
  type: LogType;
}

export interface IStoryContext {
  story: Accessor<Story>;
  player: Store<Player>;
  log: Accessor<ILogItem[]>;
  setPlayer: SetStoreFunction<Player>;
  onNavigate: (name: string) => void;
  onAction: (name: string) => void;
  onAddStat: (name: keyof IPlayerStats, amount: number) => void;
  onLog: (msg: string | JSXElement, type?: LogType) => void;
  addInventory: (item: IItem, count?: number) => void;
  removeInventory: (item: IItem, count?: number) => void;
};
export const StoryContext = createContext<IStoryContext>();

const loadStory = (name: string) => {
  return new Story(storyData[name] ?? storyData[DEFAULT_STORY]);
};

export const StoryProvider: ParentComponent = (props) => {
  const [story, setStory] = createSignal<Story>(loadStory(DEFAULT_STORY));
  const [player, setPlayer] = createStore<Player>(new Player({}));
  const [navStack, setNavStack] = createSignal<string[]>([DEFAULT_STORY]);
  const [log, setLog] = createSignal<ILogItem[]>([]);

  const onShouldDrop = (_: IItem) => true;

  const addInventory = (item: IItem, count = 1): number => {
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

  const onAction = (name: string) => {
    if (!actionData[name]) {
      return;
    }
    return actionData[name]({ story, onNavigate, onAddStat, onAction, player, setPlayer, addInventory, removeInventory, log, onLog });
  };

  const removeInventory = (item: IItem, count = 1): boolean => {
    const i = player.invent.findLastIndex((inv) => inv?.name === item.name);
    if (i < 0) {
      return false;
    }
    const newInvent = [
      ...player.invent.reverse().map(
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

  const onLog = (msg: string | JSXElement, type: LogType = "basic") => {
    const d = new Date();
    const item = {
      msg,
      time: [d.getHours(), d.getMinutes(), d.getSeconds()].join(":"),
      type
    };
    setLog([...log().slice(Math.min(log()?.length - 99, 0)), item]);
  }

  return <StoryContext.Provider
    value={{ story, onNavigate, onAddStat, onAction, player, setPlayer, addInventory, removeInventory, onLog, log }}
  >{props.children}</StoryContext.Provider>
};
