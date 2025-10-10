import { Component, createMemo, createSignal, For, Show, useContext } from "solid-js";
import type { IItemEquipable, InventItem, ItemCategory } from "../data/types";
import { Button } from "./Button";
import { InventoryContext } from "../provider/inventory";
import { PlayerContext } from "../provider/player";
import { GameContext } from "../provider/game";
import { StoryContext } from "../provider/story";

import itemData from "../data/item";

export const Story_Invent: Component = () => {
  const gameCtx = useContext(GameContext);
  const inventCtx = useContext(InventoryContext);
  const playerCtx = useContext(PlayerContext);
  const storyCtx = useContext(StoryContext);

  const [selected, setSelected] = createSignal<number>();

  const onSelect = (idx: number) => {
    if (idx < 0 || !inventCtx?.inventory().at(idx)) {
      return;
    }
    setSelected(idx);
  };

  const selectedItem = createMemo(() => {
    const idx = selected() ?? -1;
    if (idx < 0) {
      return;
    }
    const item = inventCtx?.inventory().at(idx);
    return item ? { item: itemData[item.name], count: item.count } : null;
  });

  const onUse = () => {
    const item = selectedItem();
    if (!item) {
      return;
    }
    if (!gameCtx || !inventCtx || !playerCtx || !storyCtx) {
      return;
    }
    const inStack = item.count;
    if (item.item.use?.(gameCtx, inventCtx, playerCtx, storyCtx) && inStack <= 1) {
      setSelected(undefined);
    }
  };

  const onEquip = () => {
    const i = selectedItem();
    const item = i ? i.item as IItemEquipable : null;
    if (!(item as IItemEquipable)?.equipSlot) {
      return;
    }
    if (playerCtx?.onEquip(item as IItemEquipable)) {
      inventCtx?.removeInventory(item!.name, 1);
      setSelected(undefined);
    }
  };

  const onRemove = (count: number) => {
    const item = selectedItem();
    if (!item) {
      return;
    }
    inventCtx?.removeInventory(item.item.name, count);
    if (count >= (item.count ?? 1)) {
      setSelected(undefined);
    }
  };

  const canDrop = createMemo(() => {
    if (!selectedItem()) {
      return false;
    }
    if (selectedItem()?.item.category === "unique") {
      return false;
    }
    return true;
  });

  const onStash = (count: number) => {
    const item = selectedItem();
    if (!item) {
      return;
    }
    count = count === Infinity
      ? inventCtx?.inventory().reduce<number>((acc, i) => i?.name === item.item.name ? acc + (i!.count ?? 0) : acc, 0) ?? 0
      : count;

    if (item) {
      inventCtx?.addStash(item.item.name, count);
    };
  };
  const isInStash = createMemo(() => {
    return gameCtx?.nav().includes("story_home_1");
  });

  return (
    <div class="h-full relative">
      <div class="flex flex-col gap-2 h-7/8 overflow-auto p-2" onClick={() => setSelected(undefined)}>
        <For each={inventCtx?.inventory() ?? []}>{
          (item, idx) => <InventorySlot item={item} onSelect={() => onSelect(idx())} />
        }</For>
      </div>
      <Show when={selectedItem()}>
        <div class="absolute bottom-0 left-0 w-full border-t content-center p-2 bg-slate-500">
          <div class="flex flex-col gap-2">
            <div class="flex flex-row justify-center relative">
              <span class="absolute left-0 top-0 font-bold cursor-pointer border-2 rounded-xl px-2 hover:bg-white hover:text-black" onClick={() => setSelected(undefined)}>X</span>
              <div class="font-bold">{selectedItem()?.item.label} ({selectedItem()?.count})</div>
            </div>
            <Show when={selectedItem()!.item.stats}>
              <div class="text-sm">{
                Object.entries(selectedItem()!.item.stats ?? {}).filter(([_, v]) => Boolean(v)).map(([k, v]) => `[${k}: ${v}]`).join("")
              }</div>
            </Show>
            <div class="flex flex-col gap-1 justify-between">
              <div class="w-full flex flex-row justify-between gp-2 mb-2">
                <Show when={selectedItem()?.item.use}>
                  <button class="m-auto" onClick={onUse}>{selectedItem()?.item.useVerb ?? "Use"} </button>
                </Show>
                <Show when={(selectedItem()?.item as IItemEquipable).equipSlot}>
                  <button class="m-auto" onClick={onEquip}>equip</button>
                </Show>
              </div>
              <Show when={isInStash()}>
                <div class="px-2 py-1 bg-blue-900 border border-blue-500 rounded w-full flex flex-row justify-between items-center mb-2">
                  <span class="font-bold text-xl text-black">Stash</span>
                  <div class="flex flex-row gap-4">
                    <Button onClick={() => onStash(1)}>One</Button>
                    <Button onClick={() => onStash(selectedItem()?.count ?? 1)}>Stack</Button>
                    <Button onClick={() => onStash(Infinity)}>All</Button>
                  </div>
                </div>
              </Show>
              <Show when={canDrop()}>
                <div class="px-2 py-1 bg-red-900 border border-red-500 w-full flex flex-row justify-between items-center rounded">
                  <span class="font-bold text-xl text-black">Drop</span>
                  <div class="flex flex-row gap-4">
                    <Button onClick={() => onRemove(1)}>One</Button>
                    <Button onClick={() => onRemove(selectedItem()?.count ?? 1)}>Stack</Button>
                    <Button onClick={() => onRemove(Infinity)}>All</Button>
                  </div>
                </div>
              </Show>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
}

interface IInventorySlotProps {
  item: InventItem | null,
  onSelect: () => void;
}

export const InventorySlot: Component<IInventorySlotProps> = (props) => {
  const onClick = (e: MouseEvent) => {
    e.stopPropagation();
    props.onSelect();
  };

  const item = createMemo(() => {
    if (!props.item) {
      return null;
     }
    return itemData[props.item.name];
  });

  const category = createMemo(() => {
    const i = item();
    if (!i) {
      return null;
    }
    return i.category ?? (i as IItemEquipable).equipSlot ?? "unknown";
  });

  const colour = createMemo<ItemCategory | "equip" | "unknown" | null>(() => {
    const i = item();
    if (!i) {
      return null;
    }
    return i.category ?? ((i as IItemEquipable).equipSlot ? "equip" : "unknown");
  });

  return (
    <Show when={item()} fallback={
      <div class="border p-1 flex flex-row justify-between border-gray-700 text-gray-700">Empty</div>
    }>
      <div class="border p-1 cursor-pointer flex flex-col" onClick={onClick}>
        <div class="flex flex-row justify-between">
          <div>{item()!.label}</div>
          <div class="flex flex-row gap-2 items-center">
            <div
              class="text-sm"
              classList={{
                "text-yellow-500": colour() === "book",
                "text-green-500": colour() === "resource",
                "text-red-500": colour() === "food",
                "text-blue-500": colour() === "equip"
              }}
            >[{category()}]</div>
            ({props.item?.count})
          </div>
        </div>
      </div>
    </Show>
  );
}
