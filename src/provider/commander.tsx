import { createContext, createSignal, onMount, ParentComponent } from "solid-js";
import { MIN_TICK_TIME_MS } from "../utils/constants";

export const CommandContext = createContext<{
  evt: EventTarget
  fire: () => void
}>();

export const TickEvent = new Event("tick");

export const Commander: ParentComponent = (props) => {
  const [currentTick, setTick] = createSignal<number>(0);
  const evt: EventTarget = new EventTarget();

  onMount(() => {
    setInterval(() => {
      setTick(currentTick() + 1);
      evt?.dispatchEvent(TickEvent); 
    }, MIN_TICK_TIME_MS);
  })

  const fire = () => evt?.dispatchEvent(TickEvent);

  return <CommandContext.Provider value={{ evt, fire }}>{props.children}</CommandContext.Provider>;
};
