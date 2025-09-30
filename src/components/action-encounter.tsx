import { Component, createSignal, onMount, Show, useContext } from "solid-js";
import { Progress, Ticker } from "./ticker";
import { StoryContext } from "../provider/story";
import { IEncounter } from "../data/types";

export const Action_Encounter: Component = () => {
  const ctx = useContext(StoryContext);
  const [attackRate, setAttackRate] = createSignal<number>(25);

  const [count, setCount] = createSignal<number>(0);
  const [health, setHealth] = createSignal<number>();
  const [encounter, setEncounter] = createSignal<IEncounter>();

  onMount(() => {
    setAttackRate(ctx?.player.attackRate() ?? 25);
    setEncounter(ctx?.story().getEncounter());
    setHealth(encounter()?.health);
  });

  const onFinish = () => {
    const [ player, story ] = [ctx?.player, ctx?.story()];
    const enc = encounter();
    const h = health();

    if (!player || !story) {
      return;
    }
    setAttackRate(ctx?.player.attackRate() ?? 25);

    if (!enc) {
      setEncounter(ctx?.story().getEncounter());
      setHealth(encounter()?.health);
      return;
    }

    if (!h) {
      return;
    }

    const [min, max] = ctx?.player.attackDamage() ?? [0, 1];
    const rand = min + Math.round(Math.random() * (max - min));
    const damage = Math.min(rand, h);
    const newHealth = h - damage;

    ctx?.onLog(
      <>
        You hit the <span class="text-red-800 font-bold">{/*@once*/enc.label}</span> for <span class="text-green-800 font-bold">{/*@once*/damage}</span> damage
      </>, "basic"
    );

    if (newHealth <= 0) {
      ctx?.onLog(
        <>
          You killed the
          <span class="text-red-800 font-bold m-1">{/*@once*/enc.label}</span>
        </>, "good"
      );
      setCount(count() + 1);
      setEncounter(undefined);
      if (enc.experience) {
        ctx?.onAddStat("experience", enc.experience);
      }
      const drops = story.getDrops(enc);
      if (drops?.length) {
        drops.forEach((drop) => ctx?.addInventory(drop))
        ctx?.onLog(
          <>
            It dropped:
            <span class="font-bold m-1">{/*@once*/drops?.map((d) => d.label).join(", ")}</span>
          </>, "drop"
        );
      } else {
      }
      return onFinish();
    }

    setHealth(Math.max(newHealth, 0));
  };

  return (
    <div class="flex flex-col gap-1 p-1">
      <div class="bg-black">
        Attacking ({count()})
      </div>
      <Show when={encounter()}>
        <div class="text-red-800">{encounter()?.label}</div>
        <Ticker ticks={attackRate()} onFinish={onFinish} label="Attack" showPc />
        <Progress type="red" max={encounter()!.health} value={health()!} label="Health" showNumber></Progress>
      </Show>
    </div>
  );
};
