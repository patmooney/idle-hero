import { createContext, createSignal, onMount, ParentComponent, Show } from "solid-js";
import { MIN_TICK_TIME_MS } from "../utils/constants";

export const CommandContext = createContext<{
  evt: EventTarget
  fire: () => void
}>();

export const TickEvent = new Event("tick");

export const Commander: ParentComponent = (props) => {
  const [currentTick, setTick] = createSignal<number>(0);
  const [pause, setPause] = createSignal<boolean>(true);
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
      const totalTime = Date.now() - timeStart;
      let actionTime = Math.floor(totalTime / MIN_TICK_TIME_MS);
      while (actionTime >= 0) {
        setTick(currentTick() + 1);
        evt?.dispatchEvent(TickEvent);
        actionTime--;
      }
      setPause(false);
  };

  window.addEventListener("load", () => setTimeout(catchUp, 500));
  window.addEventListener("beforeunload", () => {
    window.localStorage.setItem("freeze_time", `${Date.now()}`);
  });

  const fire = () => evt?.dispatchEvent(TickEvent);

  return <CommandContext.Provider value={{ evt, fire }}>
    {props.children}
    <Show when={pause()}>
      <div class="flex w-full absolute h-full items-center bg-main justify-center text-white text-xl top-0 left-0">Catching up...</div>
    </Show>
  </CommandContext.Provider>;
};
