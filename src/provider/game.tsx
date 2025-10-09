import { Accessor, batch, createContext, createSignal, JSXElement, onMount, ParentComponent, Setter } from "solid-js";
import { IGameState, ILogItem, IPlayer, LogType } from "../data/types";
import { unstore, store } from "../utils/store";
import { createStore, SetStoreFunction, Store, unwrap } from "solid-js/store";
import { DEFAULT_STORY, MAX_CATCHUP_MS, MAX_INVENT, MIN_TICK_TIME_MS, TICKS_IN_YEAR } from "../utils/constants";
import { InventoryProvider } from "./inventory";
import { PlayerProvider } from "./player";
import { StoryProvider } from "./story";

import storyData from "../data/story";

export interface IGameContext {
  state: Store<IGameState>;
  setState: SetStoreFunction<IGameState>;
  year: Accessor<number>;
  pause: Accessor<boolean>;
  startActivity: (name: string, cb: () => void) => void;
  endActivity: (name: string) => void;

  onNavigate: (name: string) => void;
  nav: Accessor<string[]>;
  setNav: Setter<string[]>;
  onLog: (msg: string | JSXElement, type: LogType) => void;
  log: Accessor<ILogItem[]>;

  onClearState: () => void;
}

export interface IState {
  player: IPlayer;
  state: IGameState;
  ticks: number;
  story: string;
  nav: string[];
}

const defaultPlayer: IPlayer = {
  stats: {
    health: 10,
    maxHealth: 10,
    gold: 0,
    experience: 0
  },
  equipment: [],
  mastery: {},
  recipes: []
};

const defaultState: IGameState = {
  prohibitedItems: [],
  stash: new Array(2).fill(null),
  furniture: [],
  inventory: new Array(MAX_INVENT).fill(null)
}

export const GameContext = createContext<IGameContext>();

const FREEZE_TIME_STORE_KEY = "freeze_time";
const STATE_STORE_KEY = "state";

export const Game: ParentComponent = (props) => {
  const [log, setLog] = createSignal<ILogItem[]>([]);
  const [story, setStory] = createSignal<string>(DEFAULT_STORY);
  const [player, setPlayer] = createStore<IPlayer>(defaultPlayer);
  const [state, setState] = createStore<IGameState>(defaultState);
  const [nav, setNav] = createSignal<string[]>([DEFAULT_STORY]);

  const [ticks, setTicks] = createSignal<number>(0);
  const [pause, setPause] = createSignal<boolean>(true);

  const [nextYear, setNextYear] = createSignal<number>(TICKS_IN_YEAR);
  const [year, setYear] = createSignal<number>(15);
  const [activities, setActivities] = createSignal<([string, (() => void)])[]>([]);

  onMount(() => {
    setInterval(() => {
      if (pause()) {
        return;
      }
      advanceTick();
      activities().forEach(
        ([_, cb]) => cb()
      )
    }, MIN_TICK_TIME_MS);
  });

  const advanceTick = () => {
    if (!activities().length) {
      // only advance time if doing anything
      return;
    }
    setTicks(ticks() + 1);
    if (ticks() > nextYear()) {
      setNextYear(nextYear() + TICKS_IN_YEAR);
      setYear(year() + 1);
    }
    activities().forEach(
      ([_, cb]) => cb()
    );
  };

  // Better than `addEventListener` to a EventTarget because we cannot know
  // if anything is currently subscribed to the event, so time will always be ticking
  // We probably only want time to tick if they are doing anything
  const startActivity = (name: string, cb: () => void) => {
    if (activities().find(([n]) => n === name)) {
      return;
    }
    setActivities([ ...activities(), [name, cb]]);
  };

  const endActivity = (name: string) => {
    setActivities([...activities().filter(([n]) => n !== name)]);
  }

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      saveState();
      store(FREEZE_TIME_STORE_KEY, Date.now());
    } else {
      const freezeTime = unstore<number>(FREEZE_TIME_STORE_KEY);
      if (freezeTime) {
        const totalTime = Math.min(Date.now() - freezeTime, MAX_CATCHUP_MS);
        let actionTime = Math.floor(totalTime / MIN_TICK_TIME_MS);
        doCatchup(actionTime);
      }
    }
  });

  const loadState = () => {
    const state = unstore<IState>(STATE_STORE_KEY);
    if (state) {
      batch(() => {
        setStory(state.story);
        setPlayer(state.player);
        setState(state.state);
        setNav(state.nav);
        setTicks(state.ticks);
      });
    }
    const freezeTime = unstore<number>(FREEZE_TIME_STORE_KEY);
    if (freezeTime) {
      const totalTime = Math.min(Date.now() - freezeTime, MAX_CATCHUP_MS);
      let actionTime = Math.floor(totalTime / MIN_TICK_TIME_MS);
      doCatchup(actionTime);
    }
  };

  const onClearState = () => {
    batch(() => {
      setPlayer(defaultPlayer);
      setState(defaultState);
      setTicks(0);
      onNavigate(DEFAULT_STORY);
    });
    saveState();
  };

  const saveState = () => {
    const toSave: IState = {
      player: unwrap(player),
      state: unwrap(state),
      ticks: ticks(),
      story: story(),
      nav: nav(),
    };
    store(STATE_STORE_KEY, toSave);
  };

  const doCatchup = (todo: number) => {
    if (todo > 0) {
      requestIdleCallback(() => {
        let i = 1000;
        while (todo > 0 && i > 0) {
          advanceTick();
          todo--;
          i--;
        }
        if (todo > 0) {
          doCatchup(todo);
        } else {
          setPause(false);
        }
      })
    } else {
      setPause(false);
    }
  };
 
  window.addEventListener("load", loadState);
  window.addEventListener("beforeunload", () => {
    saveState();
    window.localStorage.setItem(FREEZE_TIME_STORE_KEY, `${Date.now()}`)
  });

  const onNavigate = (name: string) => {
    if (name === "_start") {
      name = DEFAULT_STORY;
    }
    if (name === DEFAULT_STORY) {
      setNav([DEFAULT_STORY]);
      setStory(DEFAULT_STORY);
      return;
    }
    const isBack = /^_back/.test(name);
    if (!isBack && !storyData[name]) {
      console.error(`Unknown story ${name}`);
      return;
    }
    if (isBack) {
      const [_, _steps] = name.split(".");
      const steps = Math.min(parseInt(_steps ?? "1"), nav().length + 1);
      name = nav().at(-1 - steps) ?? DEFAULT_STORY;
      if (nav().length > 1) {
        setNav(nav().slice(0, -steps));
      }
    } else if (nav().at(-1) !== name) {
      setNav([...nav(), name]);
    }
    setStory(name);
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

  const value: IGameContext = {
    state, setState,
    year, startActivity, endActivity,
    onNavigate, nav, onLog, log, pause, setNav,
    onClearState
  };

  return (
    <GameContext.Provider value={value}>
      <InventoryProvider state={state} setState={setState}>
        <PlayerProvider player={player} setPlayer={setPlayer}>
          <StoryProvider story={story} setStory={setStory}>
            {props.children}
          </StoryProvider>
        </PlayerProvider>
      </InventoryProvider>
    </GameContext.Provider>
  );
};
