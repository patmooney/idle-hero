import { Component, createEffect, createSignal, onCleanup, onMount, Show, useContext } from "solid-js";
import { Progress, Ticker } from "./ticker";
import { StoryContext } from "../provider/story";
import { IEncounter } from "../data/types";
import { CommandContext, TickEvent } from "../provider/commander";

export const Action_Encounter: Component = () => {
  const ctx = useContext(StoryContext);
  const commander = useContext(CommandContext);

  const [attackRate, setAttackRate] = createSignal<number>(25);
  const [wait, setWait] = createSignal<number>(0);
  const [count, setCount] = createSignal<number>(0);
  const [health, setHealth] = createSignal<number>();
  const [encounter, setEncounter] = createSignal<IEncounter>();

  createEffect(() => {
    if (commander?.pause()) {
        commander?.evt.addEventListener(TickEvent.type, onSyncAttack);
    } else {
        commander?.evt.removeEventListener(TickEvent.type, onSyncAttack);
    }
  });

  const onSyncAttack = () => {
    if (attackRate() <= 0 && encounter()) {
      onFinish();
    } else {
      setAttackRate(attackRate() - 1);
    }
  };

  onMount(() => {
    setAttackRate(ctx?.player.attackRate() ?? 25);
    setEncounter(ctx?.story().getEncounter());
    setHealth(encounter()?.health);
  });

  const onFinish = () => {
    const shouldLog = !commander?.pause();
    const [ player, story ] = [ctx?.player, ctx?.story()];
    const enc = encounter();
    const h = health();

    if (!player || !story) {
      return;
    }

    setAttackRate(ctx?.player.attackRate() ?? 25);

    if (!enc && story.limit && count() >= story.limit) {
      story.onComplete?.();
      return;
    }

    if (!enc) {
      setEncounter(ctx?.story().getEncounter());
      setHealth(encounter()?.health);
      return;
    }

    if (!h) {
      return;
    }

    const [min, max] = ctx?.player.attackDamage() ?? [0, 1];
    const damage = min + Math.round(Math.random() * (max - min));
    const newHealth = h - Math.min(damage, h);

    if (shouldLog) {
      ctx?.onLog(
        <>
          You hit the <span class="text-red-800 font-bold">{/*@once*/enc.label}</span> for <span class="text-green-800 font-bold">{/*@once*/damage}</span> damage
        </>, "basic"
      );
    }

    ctx?.onAddMastery(ctx.player.weaponMastery(), damage);

    if (newHealth <= 0) {
      if (shouldLog) {
        ctx?.onLog(
          <>
            You killed the
            <span class="text-red-800 font-bold m-1">{/*@once*/enc.label}</span>
          </>, "good"
        );
      }
      setCount(count() + 1);
      setEncounter(undefined);
      if (enc.experience) {
        ctx?.onAddStat("experience", enc.experience);
      }
      const drops = story.getDrops(enc)?.filter((drop) => !ctx?.state.prohibitedItems.includes(drop.name)).filter(
        (drop) => !!ctx?.addInventory(drop)
      );
      if (drops?.length && shouldLog) {
        ctx?.onLog(
          <>
            It dropped:
            <span class="font-bold m-1">{/*@once*/drops?.map((d) => d.label).join(", ")}</span>
          </>, "drop"
        );
      }
      if (story.noRepeat) {
        return;
      }
      setWait(story.cooldown ?? 0);
      commander?.evt.addEventListener(TickEvent.type, doWait);
    }

    setHealth(Math.max(newHealth, 0));
  };

  const onEnemyAttack = () => {
    const shouldLog = !commander?.pause();
    const [ player, story ] = [ctx?.player, ctx?.story()];
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
    ctx?.onAddStat("health", -damage);
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
    <Show when={!commander?.pause()}>
      <div class="flex flex-col gap-1 p-1 h-full">
        <div class="bg-black">
          Attacking ({count()}<Show when={ctx?.story().limit}> / {ctx?.story().limit}</Show>)
        </div>
        <Show when={!encounter() && ctx?.story().limit && count() >= (ctx.story()?.limit ?? 0)}>
          There is nothing left here to destroy
        </Show>
        <Show when={encounter()} fallback={"Waiting.. Searching.. Wondering.."}>
          <div class="text-red-800">{encounter()?.label}</div>

          <div class="h-8">
            <Progress type="red" max={ctx?.player.stats.maxHealth ?? 10} value={ctx?.player.stats.health ?? 0} label="You" showNumber></Progress>
            <div class="h-2">
              <Ticker ticks={attackRate()} onFinish={onFinish} type="yellow" isSmall />
            </div>
          </div>

          <div class="h-8 mt-5">
            <Progress type="red" max={encounter()!.health} value={health()!} label={encounter()?.label} showNumber></Progress>
            <Show when={encounter()?.stats?.attSpeed}>
              <div class="h-2">
                <Ticker ticks={encounter()!.stats!.attSpeed!} onFinish={onEnemyAttack} type="yellow" isSmall />
              </div>
            </Show>
          </div>

        </Show>
      </div>
    </Show>
  );
};
