import { Component, createEffect, createSignal, onCleanup, onMount, Show, useContext } from "solid-js";
import { Progress, Ticker } from "./ticker";
import { StoryContext } from "../provider/story";
import { IEncounter } from "../data/types";
import { GameContext } from "../provider/game";
import { PlayerContext } from "../provider/player";
import { InventoryContext } from "../provider/inventory";

import itemData from "../data/item";

export const Action_Encounter: Component = () => {
  const ctx = useContext(GameContext);
  const storyCtx = useContext(StoryContext);
  const playerCtx = useContext(PlayerContext);
  const inventCtx = useContext(InventoryContext);

  const [name, setName] = createSignal<string>();
  const [attackRate, setAttackRate] = createSignal<number>(25);
  const [wait, setWait] = createSignal<number>(0);
  const [count, setCount] = createSignal<number>(0);
  const [health, setHealth] = createSignal<number>();
  const [encounter, setEncounter] = createSignal<IEncounter>();

  createEffect((started: boolean) => {
    if (storyCtx?.story()?.name && ctx?.pause() && !started) {
      setName(storyCtx?.story()?.name);
      ctx?.startActivity(`${name()}_catchup`, onSyncAttack);
      return !started;
    } else if (!ctx?.pause() && started) {
      ctx?.endActivity(`${name()}_catchup`);
      return !started;
    }
    return started;
  }, false);

  const onSyncAttack = () => {
    if (attackRate() <= 0 && encounter()) {
      onFinish();
    } else {
      setAttackRate(attackRate() - 1);
    }
  };

  onMount(() => {
    setName(storyCtx?.story()?.name);
    setAttackRate(playerCtx?.attackRate() ?? 25);
    setEncounter(storyCtx?.getEncounter());
    setHealth(encounter()?.health);
  });

  const onFinish = () => {
    const shouldLog = !ctx?.pause();
    const [ player, story ] = [playerCtx, storyCtx?.story()];
    const enc = encounter();
    const h = health();

    if (!player || !story) {
      return;
    }

    setAttackRate(playerCtx?.attackRate() ?? 25);

    if (!enc && story.limit && count() >= story.limit) {
      story.onComplete?.(ctx!, inventCtx!, playerCtx!, storyCtx!);
      return;
    }

    if (!enc) {
      setEncounter(storyCtx?.getEncounter());
      setHealth(encounter()?.health);
      return;
    }

    if (!h) {
      return;
    }

    const [min, max] = playerCtx?.attackDamage() ?? [0, 1];
    const damage = min + Math.round(Math.random() * (max - min));
    const newHealth = h - Math.min(damage, h);

    if (shouldLog) {
      ctx?.onLog(
        <>
          You hit the <span class="text-red-800 font-bold">{/*@once*/enc.label}</span> for <span class="text-green-800 font-bold">{/*@once*/damage}</span> damage
        </>, "basic"
      );
    }

    playerCtx?.onAddMastery(playerCtx?.weaponMastery(), damage);

    if (newHealth <= 0) {
      if (shouldLog) {
        ctx?.onLog(
          <>
            You killed the
            <span class="text-red-800 font-bold m-1">{/*@once*/enc.label}</span>
          </>, "good"
        );
      }
      if (enc.isUnique) {
        ctx?.setState("blockedEncounters", [...ctx.state.blockedEncounters, enc.name]);
      }
      setCount(count() + 1);
      setEncounter(undefined);
      if (enc.experience) {
        playerCtx?.onAddStat("experience", enc.experience);
      }
      const allDrops = storyCtx?.getDrops(enc)?.filter((drop) => !ctx?.state.prohibitedItems?.includes(drop));
      const drops = allDrops?.filter(
        (drop) => !!inventCtx?.addInventory(drop)
      );
      if (drops?.length && shouldLog) {
        ctx?.onLog(
          <>
            It dropped:
            <span class="font-bold m-1">{/*@once*/drops?.map((d) => itemData[d]?.label).join(", ")}</span>
          </>, "drop"
        );
      }
      if (!drops?.length && allDrops?.length) {
        // oh dear, bag full
        ctx?.onLog(
          <>You retreat with a full bag</>, "meta"
        );
        ctx?.onNavigate("_back");
        return;
      }
      if (story.noRepeat) {
        return;
      }
      setWait(story.cooldown ?? 0);
      ctx?.startActivity(`${name()}_wait`, doWait);
    }

    setHealth(Math.max(newHealth, 0));
  };

  const onEnemyAttack = () => {
    const shouldLog = !ctx?.pause();
    const [ player, story ] = [playerCtx?.player, storyCtx?.story()];
    if (!player || !story) {
      return;
    }
    const { attMin, attMax } = encounter()?.stats ?? {};
    if (attMin === undefined || attMax === undefined) {
      return undefined;
    }
    const damage = attMin + Math.round(Math.random() * (attMax - attMin));
    if (shouldLog) {
      ctx?.onLog(
        <>
          <span class="text-red-800 font-bold m-1">{/*@once*/encounter()!.label}</span> hits you for <span class="font-bold">{/*@once*/damage}</span> damage!
        </>, "bad"
      );
    }
    if (player.stats.health <= damage) {
      // you are deid
      ctx?.onNavigate("_start");
      return;
    }
    playerCtx?.onAddStat("health", -damage);
  }

  const doWait = () => {
    if (wait() <= 0) {
      ctx?.endActivity(`${name()}_wait`);
      return onFinish();
    }
    setWait(wait() - 1);
  };

  onCleanup(() => {
    ctx?.endActivity(`${name()}_wait`);
  });

  return (
    <Show when={!ctx?.pause()}>
      <div class="flex flex-col gap-1 p-1 h-full">
        <div class="bg-black">
          Attacking ({count()}<Show when={storyCtx?.story()?.limit}> / {storyCtx?.story()?.limit}</Show>)
        </div>
        <Show when={!encounter() && storyCtx?.story()?.limit && count() >= (storyCtx?.story()?.limit ?? 0)}>
          There is nothing left here to destroy
        </Show>
        <Show when={encounter()} fallback={"Waiting.. Searching.. Wondering.."}>
          <div class="text-red-800">{encounter()?.label}</div>

          <div class="h-8">
            <Progress type="red" max={playerCtx?.player.stats.maxHealth ?? 10} value={playerCtx?.player.stats.health ?? 0} label="You" showNumber></Progress>
            <div class="h-2">
              <Ticker name={`${name()}_att`} ticks={attackRate()} onFinish={onFinish} type="yellow" isSmall />
            </div>
          </div>

          <div class="h-8 mt-5">
            <Progress type="red" max={encounter()!.health} value={health()!} label={encounter()?.label} showNumber></Progress>
            <Show when={encounter()?.stats?.attSpeed}>
              <div class="h-2">
                <Ticker name={`${name()}_enc`} ticks={encounter()!.stats!.attSpeed!} onFinish={onEnemyAttack} type="yellow" isSmall />
              </div>
            </Show>
          </div>

        </Show>
      </div>
    </Show>
  );
};
