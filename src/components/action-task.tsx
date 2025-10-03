import { Component, createEffect, createMemo, createSignal, onCleanup, onMount, Show, useContext } from "solid-js";
import { Ticker } from "./ticker";
import { StoryContext } from "../provider/story";
import { cumulateBonus } from "../utils/mastery";
import { CommandContext, TickEvent } from "../provider/commander";

export const Action_Task: Component = () => {
  const ctx = useContext(StoryContext);
  const commander = useContext(CommandContext);

  const [active, setActive] = createSignal<boolean>(false);
  const [wait, setWait] = createSignal<number>(0);

  const duration = createMemo(() => {
    const masteryType = ctx?.story().masteryType;
    if (masteryType) {
      const cumulative = cumulateBonus(masteryType, ctx.player.mastery[masteryType] ?? 0);
      return Math.max(1, (ctx?.story().duration ?? 100) - (cumulative.durationModifier ?? 0));
    }
    return ctx?.story().duration ?? 100;
  });

  createEffect(() => {
    const [player, story] = [ctx?.player, ctx?.story()];
    if (!player || !story) {
      return;
    }
    if (!story.utilityType) {
      return;
    }
    if (!player.equipment.find((eq) => eq.utilityType === story.utilityType)) {
      ctx?.onNavigate("_back");
    }
  })

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
    if (story.masteryType) {
      ctx?.onAddMastery(story.masteryType, story.experience ?? 0);
    }
    const drops = story.getItems(undefined, story.masteryType, story.masteryType ? player.mastery[story.masteryType] : undefined)?.
      filter((drop) => !ctx?.state.prohibitedItems.includes(drop.name)).filter(
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
    setWait(story.cooldown ?? 0);
    commander?.evt.addEventListener(TickEvent.type, doWait);
  }

  const doWait = () => {
    if (wait() <= 0) {
      commander?.evt.removeEventListener(TickEvent.type, doWait);
      return onFinish();
    }
    setWait(wait() - 1);
  };

  onCleanup(() => {
    commander?.evt.removeEventListener(TickEvent.type, doWait);
  });

  return (
    <div class="flex flex-col gap-1 p-1 h-full">
      <div class="bg-black">
        {ctx?.story().label}
      </div>
      <Show when={active()} fallback={"Waiting.. Searching.. Wondering.."}>
        <div class="text-red-800">{ctx?.story().description}</div>
        <div class="h-8">
          <Ticker ticks={duration()} onFinish={onFinish} label="Task" showPc />
        </div>
      </Show>
    </div>
  );
};
