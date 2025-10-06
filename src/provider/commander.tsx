import { Accessor, createContext, createSignal, onMount, ParentComponent, Show } from "solid-js";
import { MAX_CATCHUP_MS, MIN_TICK_TIME_MS } from "../utils/constants";

export const CommandContext = createContext<{
  evt: EventTarget;
  fire: () => void;
  pause: Accessor<boolean>;
}>();

export const TickEvent = new Event("tick");

export const Commander: ParentComponent = (props) => {
  const [currentTick, setTick] = createSignal<number>(0);
  const [pause, setPause] = createSignal<boolean>(true);
  const [actionCount, setActionCount] = createSignal<number>(0);
  const evt: EventTarget = new EventTarget();

  onMount(() => {
    setInterval(() => {
      if (pause()) {
        return;
      }
      setTick(currentTick() + 1);
      evt?.dispatchEvent(TickEvent); 
    }, MIN_TICK_TIME_MS);
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      setPause(true);
      window.localStorage.setItem("freeze_time", `${Date.now()}`);
    } else {
      catchUp();
    }
  });

  const catchUp = () => {
      setPause(true);
      const timeStart = parseInt(window.localStorage.getItem("freeze_time") ?? `${Date.now()}`);
      const totalTime = Math.min(Date.now() - timeStart, MAX_CATCHUP_MS);
      let actionTime = Math.floor(totalTime / MIN_TICK_TIME_MS);
      setActionCount(actionTime);
      doCatchup();
  };

  const doCatchup = () => {
    let todo = actionCount();
    if (todo > 0) {
      requestIdleCallback(() => {
        let i = 1000;
        while (todo > 0 && i > 0) {
          evt?.dispatchEvent(TickEvent);
          setTick(currentTick() + 1);
          todo--;
          i--;
        }
        setActionCount(todo);
        if (todo > 0) {
          doCatchup();
        } else {
          setPause(false);
        }
      })
    } else {
      setPause(false);
    }
  };

  window.addEventListener("load", () => setTimeout(catchUp, 200));
  window.addEventListener("beforeunload", () => {
    window.localStorage.setItem("freeze_time", `${Date.now()}`);
  });

  const fire = () => evt?.dispatchEvent(TickEvent);

  return <CommandContext.Provider value={{ evt, fire, pause }}>
    {props.children}
    <Show when={pause()}>
      <div class="flex w-full absolute h-full items-center bg-main justify-center text-white text-xl top-0 left-0">Catching up... ({actionCount()})</div>
    </Show>
  </CommandContext.Provider>;
};
