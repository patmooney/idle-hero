import { Component, createMemo, createSignal, For, Show, useContext } from "solid-js";

import itemData from "../data/item";
import { Button } from "./Button";
import { InventoryContext } from "../provider/inventory";
import { GameContext } from "../provider/game";
import { InventorySlot } from "./story-invent";

export const Story_Stash: Component = () => {
  const inventCtx = useContext(InventoryContext);
  const gameCtx = useContext(GameContext);
  const [selected, setSelected] = createSignal<number>();

  const onSelect = (idx: number) => {
    if (idx < 0 || !inventCtx?.stash()[idx]) {
      return;
    }
    setSelected(idx);
  };

  const selectedItem = createMemo(() => {
    const idx = selected() ?? -1;
    if (idx < 0) {
      return;
    }
    const item = inventCtx?.stash().at(idx);
    return item ? { item: itemData[item.name], count: item.count } : null;
  });


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

  const onStash = (count: number) => {
    const item = selectedItem();
    if (!item) {
      return;
    }
    count = count === Infinity
      ? inventCtx?.stash().reduce<number>((acc, i) => i?.name === item.item.name ? acc + i.count : acc, 0) ?? 0
      : count;
    inventCtx?.removeStash(item.item.name, count)
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

  return (
    <div class="h-full relative pb-2">
      <div class="flex flex-col gap-2 h-7/8 overflow-auto p-2" onClick={() => setSelected(undefined)}>
        <For each={inventCtx?.stash()}>{
          (item, idx) => <InventorySlot item={item} onSelect={() => onSelect(idx())} />
        }</For>
      </div>
      <Show when={selectedItem()}>
        <div class="absolute bottom-0 left-0 w-full border-t content-center p-2 bg-slate-500">
          <div class="flex flex-col gap-2">
            <div class="flex flex-row justify-center relative mb-3">
              <span class="absolute left-0 top-0 font-bold cursor-pointer border-2 rounded-xl px-2 hover:bg-white hover:text-black" onClick={() => setSelected(undefined)}>X</span>
              <div class="font-bold">{selectedItem()?.item.label} ({selectedItem()?.count})</div>
            </div>
            <div class="flex flex-col gap-1 justify-between">
              <div class="px-2 py-1 bg-blue-900 border border-blue-500 rounded w-full flex flex-row justify-between items-center mb-2">
                <span class="font-bold text-xl text-black">Transfer</span>
                <div class="flex flex-row gap-4">
                  <Button onClick={() => onStash(1)}>One</Button>
                  <Button onClick={() => onStash(selectedItem()?.count ?? 1)}>Stack</Button>
                  <Button onClick={() => onStash(Infinity)}>All</Button>
                </div>
              </div>
              <Show when={canDrop()}>
                <div class="px-2 py-1 bg-red-900 border border-red-500 rounded w-full flex flex-row justify-between items-center mb-2">
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
      <div class="w-full border content-center cursor-pointer h-12 text-lg font-bold mt-auto" onClick={() => gameCtx?.onNavigate("_back")}>
        Leave stash
      </div>
    </div>
  );
}
