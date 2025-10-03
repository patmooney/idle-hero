import { Component, createSignal, onCleanup, onMount, Show, useContext } from "solid-js";
import { Ticker } from "./ticker";
import { StoryContext } from "../provider/story";
import { MIN_TICK_TIME_MS } from "../utils/constants";

export const Action_Task: Component = () => {
  const ctx = useContext(StoryContext);
  const [active, setActive] = createSignal<boolean>(false);
  let timer: number | undefined;

  onMount(() => {
    setActive(true);
  });

  const onFinish = () => {
    const [ player, story ] = [ctx?.player, ctx?.story()];
    if (!player || !story) {
      return;
    }
    if (!active()) {
      setActive(true);
      return;
    }
    setActive(false);
    ctx?.onLog(
      <>
        You finished
        <span class="text-red-800 font-bold m-1">{/*@once*/story.description}</span>
      </>, "good"
    );
    const drops = story.getItems()?.filter((drop) => !ctx?.state.prohibitedItems.includes(drop.name)).filter(
      (drop) => !!ctx?.addInventory(drop)
    );
    if (drops?.length) {
      ctx?.onLog(
        <>
          You gained:
          <span class="font-bold m-1">{/*@once*/drops?.map((d) => d.label).join(", ")}</span>
        </>, "drop"
      );
    }
    if (story.noRepeat) {
      return story.onComplete?.() ?? ctx?.onNavigate("_back");
    }
    timer = setTimeout(() => onFinish(), (story.cooldown ?? 0) * MIN_TICK_TIME_MS);
  }

  onCleanup(() => {
    if (timer) {
      clearTimeout(timer);
    }
  });

  return (
    <div class="flex flex-col gap-1 p-1 h-full">
      <div class="bg-black">
        {ctx?.story().label}
      </div>
      <Show when={active()} fallback={"Waiting.. Searching.. Wondering.."}>
        <div class="text-red-800">{ctx?.story().description}</div>
        <div class="h-8">
          <Ticker ticks={ctx?.story().duration ?? 100} onFinish={onFinish} label="Task" showPc />
        </div>
      </Show>
    </div>
  );
};
