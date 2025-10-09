import { Component, createMemo, createSignal, For, JSXElement, Match, Switch, useContext } from "solid-js";
import { BASE_ATTACK_DELAY, MIN_TICK_TIME_MS } from "../utils/constants";
import type { EquipSlotType } from "../data/types";
import { PlayerContext } from "../provider/player";

export const Story_Stats: Component = () => {
  const [view, setView] = createSignal<"equip" | "stats">("stats");
  const playerCtx = useContext(PlayerContext);

  const stats = createMemo<{ label: string, value: number | string | JSXElement }[]>(() => {
    const damage = playerCtx?.attackDamage();
    const tps = 1000 / MIN_TICK_TIME_MS;
    const attackRate = 1 / ((playerCtx?.attackRate() ?? BASE_ATTACK_DELAY) / tps);
    return [
      { label: "Health", value: playerCtx?.stats.health ?? 0 },
      { label: "Max health", value: playerCtx?.stats.maxHealth ?? 0 },
      { label: "", value: <>&nbsp;</> },
      { label: "Att. min", value: damage?.at(0) ?? 0 },
      { label: "Att. max", value: damage?.at(1) ?? 0 },
      { label: "Att. rate", value: `${attackRate?.toFixed(2) ?? 0} p/s` },
      { label: "", value: <>&nbsp;</> },
      { label: "Phys. res", value: playerCtx?.stats.physRes ?? 0 },
      { label: "Mag. res", value: playerCtx?.stats.magRes ?? 0 },
    ];
  });

  type EquipItem = {
    label: string | JSXElement,
    isDisabled?: boolean,
    isEmpty?: boolean,
    subtext?: string,
    onClick?: () => void
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
            onClick: item ? () => playerCtx?.onUnequip(item) : undefined
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
            onClick: item ? () => playerCtx?.onUnequip(item) : undefined
          };
        }
      ),
    ];
  });

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
        <button classList={{ "selected": view() === "stats"}} onClick={() => setView("stats")}>Stats</button>
      </div>
    </div>
  );
}
