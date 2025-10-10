import { batch, Component, createMemo, createSignal, For, JSXElement, Match, Show, Switch, useContext } from "solid-js";
import { BASE_ATTACK_DELAY, MIN_TICK_TIME_MS } from "../utils/constants";
import type { EquipSlotType, IItemEquipable, IStats } from "../data/types";
import { PlayerContext } from "../provider/player";
import { InventoryContext } from "../provider/inventory";
import { GameContext } from "../provider/game";

export const Story_Stats: Component = () => {
  const [view, setView] = createSignal<"equip" | "stats" | "attributes">("stats");

  const playerCtx = useContext(PlayerContext);
  const inventCtx = useContext(InventoryContext);
  const gameCtx = useContext(GameContext);

  const stats = createMemo<{ label: string, value: number | string | JSXElement }[]>(() => {
    const damage = playerCtx?.attackDamage();
    const tps = 1000 / MIN_TICK_TIME_MS;
    const attackRate = 1 / ((playerCtx?.attackRate() ?? BASE_ATTACK_DELAY) / tps);
    return [
      { label: "Health", value: playerCtx?.player.stats.health ?? 0 },
      { label: "Max health", value: playerCtx?.player.stats.maxHealth ?? 0 },
      { label: "", value: <>&nbsp;</> },
      { label: "Att. min", value: damage?.at(0) ?? 0 },
      { label: "Att. max", value: damage?.at(1) ?? 0 },
      { label: "Att. rate", value: `${attackRate?.toFixed(2) ?? 0} p/s` },
      { label: "", value: <>&nbsp;</> },
      { label: "Phys. res", value: playerCtx?.player.stats.physRes ?? 0 },
      { label: "Mag. res", value: playerCtx?.player.stats.magRes ?? 0 },
    ];
  });

  const attributes = createMemo<{ label: string, value: number | string | JSXElement, name: keyof IStats }[]>(() => {
    return [
      { label: "Strength", value: playerCtx?.player.stats.strength ?? 0, name: "strength" },
      { label: "Agility", value: playerCtx?.player.stats.agility ?? 0, name: "agility" },
      { label: "Dexterity", value: playerCtx?.player.stats.dexterity ?? 0, name: "dexterity" },
      { label: "Intelligence", value: playerCtx?.player.stats.intelligence ?? 0, name: "intelligence" },
      { label: "Charisma", value: playerCtx?.player.stats.charisma ?? 0, name: "charisma" },
      { label: "Constitution", value: playerCtx?.player.stats.constitution ?? 0, name: "constitution" },
    ]
  });

  type EquipItem = {
    label: string | JSXElement,
    isDisabled?: boolean,
    isEmpty?: boolean,
    subtext?: string,
    onClick?: () => void
  };

  const onUnequip = (i: IItemEquipable) => {
    if (inventCtx?.addInventory(i.name, 1)) {
      playerCtx?.onUnequip(i);
    }
  };

  const equip = createMemo<EquipItem[]>(() => {
    const weapons: EquipSlotType[] = ["weapon", "offhand"];
    const armour: EquipSlotType[] = ["head", "shoulder", "chest", "hand", "leg", "foot"];
    return [
      { label: <div class="text-lg font-bold mt-5">Weapon</div>, isDisabled: false, isEmpty: true },
      ...weapons.map(
        (slot) => {
          const item = slot && playerCtx?.equipment().find((eq) => eq.equipSlot === slot);
          return {
            label: item?.label ?? slot, isDisabled: !item,
            subtext: Object.entries(item?.stats ?? {}).map(([k, v]) => `[${k}: ${v}]`).join(""),
            onClick: item ? () => onUnequip(item) : undefined
          };
        }
      ),
      { label: <div class="text-lg font-bold mt-5">Armour</div>, isDisabled: false, isEmpty: true },
      ...armour.map(
        (slot) => {
          const item = slot && playerCtx?.equipment().find((eq) => eq.equipSlot === slot);
          return {
            label: item?.label ?? slot, isDisabled: !item,
            subtext: Object.entries(item?.stats ?? {}).map(([k, v]) => `[${k}: ${v}]`).join(""),
            onClick: item ? () => onUnequip(item) : undefined
          };
        }
      ),
    ];
  });

  const onPoint = (stat: keyof IStats) => {
    const available = (gameCtx?.state.points ?? 0);
    if (available > 0) {
      batch(() => {
        gameCtx?.setState("points", available - 1);
        playerCtx?.onAddStat(stat, 1);
      })
    }
  };

  return (
    <div class="flex flex-col h-full">
      <div class="h-7/8 p-2">
        <Switch>
          <Match when={view() === "stats"}>
            <For each={stats()}>{
              (stat) => <div class="flex flex-row justify-between border-gray-700" classList={{ "border-b": !!stat.label }}>
                <div>{stat.label}</div>
                <div>{stat.value}</div>
              </div>
            }</For>
          </Match>
          <Match when={view() === "attributes"}>
            <For each={attributes()}>{
              (stat) => <div class="flex flex-row justify-between border-gray-700 p-2 items-center" classList={{ "border-b": !!stat.label }}>
                <div>{stat.label}</div>
                <div class="flex flex-row gap-2 items-center">
                  {stat.value}
                  <Show when={!!gameCtx?.state.points}>
                    <button class="h-8" onClick={() => onPoint(stat.name)}>+</button>
                  </Show>
                </div>
              </div>
            }</For>
          </Match>
          <Match when={view() === "equip"}>
            <For each={equip()}>{
              (e) => (
                <div class="flex flex-row justify-between items-center border-gray-700" classList={{ "border-b": !e.isEmpty }} onClick={e.onClick}>
                  <div classList={{ "text-gray-700": e.isDisabled }}>{e.label}</div>
                  <div class="text-xs text-gray-500">{e.subtext}</div>
                </div>
              )
            }</For>
          </Match>

        </Switch>
      </div>
      <div class="h-1/8 flex flex-row justify-between gap-2 p-2">
        <button classList={{ "selected": view() === "equip"}} onClick={() => setView("equip")}>Equip</button>
        <button classList={{ "selected": view() === "attributes"}} onClick={() => setView("attributes")}>Attr.</button>
        <button classList={{ "selected": view() === "stats"}} onClick={() => setView("stats")}>Stats</button>
      </div>
    </div>
  );
}
