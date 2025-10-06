import { Component, createMemo, createSignal, For, Show, useContext } from "solid-js";
import { StoryContext } from "../provider/story";
import { IItem } from "../data/types";

import itemData from "../data/item";
import {Button} from "./Button";

export const Story_Stash: Component = () => {
  const ctx = useContext(StoryContext);
  const [selected, setSelected] = createSignal<number>();

  const stashItems = createMemo(() =>
    (ctx?.state.stash ?? []).map((s) => s ? ({ ...itemData[s.name], stack: s.stack }) : null)
  );

  const onSelect = (idx: number) => {
    if (idx < 0 || !ctx?.state.stash[idx]) {
      return;
    }
    setSelected(idx);
  };

  const selectedItem = createMemo(() => {
    const idx = selected() ?? -1;
    if (idx < 0) {
      return;
    }
    return stashItems().at(idx);
  });

  const onRemove = (count: number) => {
    const item = selectedItem();
    if (!item) {
      return;
    }
    ctx?.removeInventory(item, count);
    if (count >= (item.stack ?? 1)) {
      setSelected(undefined);
    }
  };

  const onStash = (count: number) => {
    const item = selectedItem();
    if (!item) {
      return;
    }
    count = count === Infinity
      ? ctx?.state.stash.reduce<number>((acc, i) => i?.name === item.name ? acc + i.stack : acc, 0) ?? 0
      : count;
    const added = ctx?.addInventory(item, count);
    ctx?.removeStash(item, added)
  };

  return (
    <div class="h-full relative pb-2">
      <div class="flex flex-col gap-2 h-7/8 overflow-auto p-2" onClick={() => setSelected(undefined)}>
        <For each={stashItems()}>{
          (item, idx) => <InventorySlot item={item} onSelect={() => onSelect(idx())} />
        }</For>
      </div>
      <Show when={selectedItem()}>
        <div class="absolute bottom-0 left-0 w-full border-t content-center p-2 bg-slate-500">
          <div class="flex flex-col gap-2">
            <div class="flex flex-row justify-center relative mb-3">
              <span class="absolute left-0 top-0 font-bold cursor-pointer border-2 rounded-xl px-2 hover:bg-white hover:text-black" onClick={() => setSelected(undefined)}>X</span>
              <div class="font-bold">{selectedItem()?.label} ({selectedItem()?.stack})</div>
            </div>
            <div class="flex flex-col gap-1 justify-between">
              <div class="px-2 py-1 bg-blue-300 w-full flex flex-row justify-between items-center mb-2">
                <span class="font-bold text-xl text-black">Transfer</span>
                <div class="flex flex-row gap-4">
                  <Button onClick={() => onStash(1)}>One</Button>
                  <Button onClick={() => onStash(selectedItem()?.stack ?? 1)}>Stack</Button>
                  <Button onClick={() => onStash(Infinity)}>All</Button>
                </div>
              </div>
              <div class="px-2 py-1 bg-red-300 w-full flex flex-row justify-between items-center">
                <span class="font-bold text-xl text-black">Drop</span>
                <div class="flex flex-row gap-4">
                  <Button onClick={() => onRemove(1)}>One</Button>
                  <Button onClick={() => onRemove(selectedItem()?.stack ?? 1)}>Stack</Button>
                  <Button onClick={() => onRemove(Infinity)}>All</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Show>
      <div class="w-full border content-center cursor-pointer h-12 text-lg font-bold mt-auto" onClick={() => ctx?.onNavigate("_back")}>
        Leave stash
      </div>
    </div>
  );
}

interface IInventorySlotProps {
  item: (IItem & { stack?: number }) | null,
  onSelect: () => void;
}

const InventorySlot: Component<IInventorySlotProps> = (props) => {
  const onClick = (e: MouseEvent) => {
    e.stopPropagation();
    props.onSelect();
  };
  return (
    <Show when={props.item} fallback={
      <div class="border p-1 flex flex-row justify-between border-gray-700 text-gray-700">Empty</div>
    }>
      <div class="border p-1 cursor-pointer flex flex-row justify-between" onClick={onClick}>
        <div>{props.item?.label}</div>
        <div>({props.item?.stack})</div>
      </div>
    </Show>
  );
}
