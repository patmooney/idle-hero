import { IDrop, IEncounter, IStory } from "../data/types";
import itemData from "../data/item";
import { Accessor, createContext, createEffect, createSignal, ParentComponent, Setter, useContext } from "solid-js";
import { cumulateDrop } from "../utils/mastery";
import storyData from "../data/story";
import { DEFAULT_STORY } from "../utils/constants";
import { PlayerContext } from "./player";
import { GameContext } from "./game";

export interface IStoryContext {
  story: Accessor<IStory | undefined>;
  getEncounter: () => IEncounter | undefined;
  getDamage: (enc: IEncounter) => number | undefined;
  getDrops: (enc: IEncounter) => string[] | undefined;
  getItems: (drops?: IDrop[]) => string[] | undefined;
  onTask: (opts: Pick<IStory, "label" | "description" | "noRepeat" | "duration" | "onComplete">) => void;
}

export const StoryContext = createContext<IStoryContext>();

export const StoryProvider: ParentComponent<{ story: Accessor<string>, setStory: Setter<string> }> = (props) => {
  const game = useContext(GameContext);
  const player = useContext(PlayerContext);

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
    const rand = Math.random();
    if (s.type !== "encounter" || !s.encounters?.length) {
      return;
    }
    return s.encounters.sort((a, b) => a.chance - b.chance).find(
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
    const exp = s.masteryType ? player?.mastery[s.masteryType] ?? 0 : 0;
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
      (drop) => itemData[drop.name].name
    ).filter(Boolean);
  };

  const onTask = (opts: Pick<IStory, "label" | "description" | "noRepeat" | "duration" | "onComplete">) => {
    game?.setNav([...(game?.nav() ?? []), "task"]);
    setStory(
      {
        name: "task",
        type: "task",
        ...opts,
        onComplete: opts.noRepeat ? opts.onComplete ?? (() => game?.onNavigate("_back")) : undefined
      }
    );
  };

  const value: IStoryContext = {
    story, getEncounter, getDamage, getDrops, getItems, onTask
  };

  return <StoryContext.Provider value={value}>{props.children}</StoryContext.Provider>
};
