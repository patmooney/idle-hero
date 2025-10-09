import { Component, createEffect, createMemo, createSignal, onCleanup, onMount, Show, useContext } from "solid-js";
import { Ticker } from "./ticker";
import { StoryContext } from "../provider/story";
import { cumulateBonus } from "../utils/mastery";
import { GameContext } from "../provider/game";
import { InventoryContext } from "../provider/inventory";
import { PlayerContext } from "../provider/player";

export const Action_Task: Component = () => {
  const gameCtx = useContext(GameContext);
  const inventCtx = useContext(InventoryContext);
  const playerCtx = useContext(PlayerContext);
  const storyCtx = useContext(StoryContext);

  const [name, setName] = createSignal<string>();
  const [active, setActive] = createSignal<boolean>(false);
  const [wait, setWait] = createSignal<number>(0);
  const [remaining, setRemaining] = createSignal<number>(0);

  const duration = createMemo(() => {
    const masteryType = storyCtx?.story()?.masteryType;
    if (masteryType) {
      const cumulative = cumulateBonus(masteryType, playerCtx?.player.mastery[masteryType] ?? 0);
      return Math.max(1, (storyCtx?.story()?.duration ?? 100) - (cumulative.durationModifier ?? 0));
    }
    return storyCtx?.story()?.duration ?? 100;
  });

  createEffect(() => {
    if (!storyCtx?.story()?.utilityType) {
      return;
    }
    if (!playerCtx?.equipment().find((eq) => eq.utilityType === storyCtx?.story()?.utilityType)) {
      gameCtx?.onNavigate("_back");
    }
  })

  createEffect((started: boolean) => {
    if (!duration()) {
      return started;
    }
    if (storyCtx?.story()?.name && gameCtx?.pause() && !started) {
      setName(storyCtx?.story()?.name);
      setRemaining(remaining() ?? duration());
      gameCtx?.startActivity(`${name()}_catchup`, onSyncAttack);
      return !started;
    } else if (!gameCtx?.pause() && started) {
      gameCtx?.endActivity(`${name()}_catchup`);
      return !started;
    }
    return started;
  }, false);

  const onSyncAttack = () => {
    if (remaining() <= 0 && active()) {
      onFinish();
    } else {
      setRemaining(remaining() - 1);
    }
  };

  onMount(() => {
    setName(storyCtx?.story()?.name);
    setActive(true);
  });

  const onFinish = () => {
    const story = storyCtx?.story();
    if (!playerCtx || !storyCtx || !story) {
      return;
    }
    if (!active()) {
      setRemaining(duration());
      setActive(true);
      return;
    }
    setActive(false);
    gameCtx?.onLog(
      <>
        You finished
        <span class="text-red-800 font-bold m-1">{/*@once*/story.description}</span>
      </>, "good"
    );
    if (story.masteryType) {
      playerCtx?.onAddMastery(story.masteryType, story.experience ?? 0);
    }
    const drops = storyCtx.getItems()?.
      filter((drop) => !gameCtx?.state.prohibitedItems?.includes(drop)).filter(
        (drop) => !!inventCtx?.addInventory(drop)
      );
    if (drops?.length) {
      gameCtx?.onLog(
        <>
          You gained:
          <span class="font-bold m-1">{/*@once*/drops?.join(", ")}</span>
        </>, "drop"
      );
    }
    if (story.noRepeat) {
      return story.onComplete?.(gameCtx!, inventCtx!, playerCtx!, storyCtx!) ?? gameCtx?.onNavigate("_back");
    }
    setWait(story.cooldown ?? 0);
    gameCtx?.startActivity(`${name()}_wait`, doWait);
  }

  const doWait = () => {
    if (wait() <= 0) {
      gameCtx?.endActivity(`${name()}_wait`);
      return onFinish();
    }
    setWait(wait() - 1);
  };

  onCleanup(() => {
    gameCtx?.endActivity(`${name()}_wait`);
    gameCtx?.endActivity(`${name()}_catchup`);
  });

  return (
    <Show when={!gameCtx?.pause()}>
      <div class="flex flex-col gap-1 p-1 h-full">
        <div class="bg-black">
          {storyCtx?.story()?.label}
        </div>
        <Show when={active()} fallback={"Waiting.. Searching.. Wondering.."}>
          <div class="text-red-800">{storyCtx?.story()?.description}</div>
          <div class="h-8">
            <Ticker name={`${name()}_task`} ticks={duration()} onFinish={onFinish} label="Task" showPc />
          </div>
        </Show>
      </div>
    </Show>
  );
};
