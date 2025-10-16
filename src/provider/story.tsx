import { IDrop, IEncounter, IStory } from "../data/types";
import { Accessor, createContext, createEffect, createSignal, ParentComponent, Setter, useContext } from "solid-js";
import { cumulateDrop } from "../utils/mastery";
import storyData from "../data/story";
import { DEFAULT_STORY } from "../utils/constants";
import { PlayerContext } from "./player";
import { GameContext } from "./game";
import { InventoryContext } from "./inventory";

export interface IStoryContext {
  story: Accessor<IStory | undefined>;
  getEncounter: () => IEncounter | undefined;
  getDamage: (enc: IEncounter) => number | undefined;
  getDrops: (enc: IEncounter) => string[] | undefined;
  getItems: (drops?: IDrop[]) => string[] | undefined;
  getGold: (range?: [number, number]) => number | undefined;
  onTask: (opts: Pick<IStory, "label" | "description" | "noRepeat" | "duration" | "onComplete">) => void;
  onStory: (story: IStory) => void;
}

export const StoryContext = createContext<IStoryContext>();

export const StoryProvider: ParentComponent<{ story: Accessor<string>, setStory: Setter<string> }> = (props) => {
  const game = useContext(GameContext);
  const player = useContext(PlayerContext);
  const invent = useContext(InventoryContext);

  const [story, setStory] = createSignal<IStory>();

  createEffect(() => {
    const name = props.story() ?? DEFAULT_STORY;
    if (name === "task") {
      return;
    }
    setStory(storyData[name] ?? storyData[DEFAULT_STORY]);
  });

  const getEncounter = (): IEncounter | undefined => {
    const s = story();
    if (!s) {
      return;
    }
    if (s.type === "task") {
      const taskEncounter: IEncounter = {
        name: "task",
        label: s.label,
        health: s.duration ?? 0,
        chance: 1,
        drops: s.items
      };
      return taskEncounter;
    }
    if (typeof s.encounters === "function") {
      return s.encounters(game!, invent!, player!, value);
    }
    const rand = Math.random();
    if (s.type !== "encounter" || !s.encounters?.length) {
      return;
    }
    return s.encounters.filter((e) => !game?.state.blockedEncounters.includes(e.name)).sort((a, b) => a.chance - b.chance).find(
      (enc) => {
        return rand <= enc.chance;
      }
    );
  };

  const getDamage = (enc: IEncounter): number | undefined => {
    const { attMin, attMax } = enc.stats ?? {};
    if (!attMin || !attMax) {
      return undefined;
    }
    return attMin + Math.round(Math.random() * (attMin - attMax));
  }

  const getDrops = (enc: IEncounter): string[] | undefined => {
    return getItems(enc?.drops)
  }

  const getItems = (drops?: IDrop[]): string[] | undefined => {
    const s = story();
    if (!s) {
      return;
    }
    drops = drops ?? s.items ?? [];
    let dropped: IDrop[] = [];
    const exp = s.masteryType ? player?.player.mastery[s.masteryType] ?? 0 : 0;
    for (let drop of drops) {
      let chance = drop.chance;
      if (exp) {
        chance = chance + cumulateDrop(drop.name, s.masteryType!, exp);
      }
      while (chance > 0) {
        if (Math.random() <= chance) {
          dropped.push(drop);
        }
        chance--;
      }
    }
    return dropped?.map(
      (drop) => {
        const item = game?.getItemData(drop.name);
        if (!item) {
          console.error(`Unable to find drop ${drop.name}`);
          return undefined;
        }
        return item.name;
      }
    ).filter(Boolean) as string[];
  };

  const getGold = (range?: [number, number]): number | undefined => {
    if (!range) {
      return;
    }
    const gold = range[0] + Math.round(Math.random() * (range[1] - range[0]));
    return gold || undefined;
  };

  const onTask = (opts: Pick<IStory, "label" | "description" | "noRepeat" | "duration" | "onComplete">) => {
    game?.setNav([...(game?.nav() ?? []), "task"]);
    props.setStory("task");
    setStory(
      {
        name: "task",
        type: "task",
        ...opts,
        onComplete: opts.noRepeat ? opts.onComplete ?? (() => game?.onNavigate("_back")) : undefined
      }
    );
  };

  const onStory = (story: IStory) => {
    game?.setNav([...(game?.nav() ?? []), story.name]);
    props.setStory(story.name);
    setStory(story);
  };

  const value: IStoryContext = {
    story, getEncounter, getDamage, getDrops, getItems, onTask, getGold, onStory
  };

  return <StoryContext.Provider value={value}>{props.children}</StoryContext.Provider>
};
