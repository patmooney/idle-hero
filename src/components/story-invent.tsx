import { Component, createMemo, createSignal, For, Show, useContext } from "solid-js";
import { StoryContext } from "../provider/story";
import { IItem, IItemEquipable } from "../data/types";
import {Button} from "./Button";

export const Story_Invent: Component = () => {
  const ctx = useContext(StoryContext);
  const [selected, setSelected] = createSignal<number>();

  const onSelect = (idx: number) => {
    if (idx < 0 || !ctx?.player.invent[idx]) {
      return;
    }
    setSelected(idx);
  };

  const selectedItem = createMemo(() => {
    const idx = selected() ?? -1;
    if (idx < 0) {
      return;
    }
    return ctx?.player.invent.at(idx);
  });

  const onUse = () => {
    const item = selectedItem();
    if (!item || !ctx) {
      return;
    }
    if (item?.use?.(ctx)) {
      setSelected(undefined);
    }
  };

  const onEquip = () => {
    const item = selectedItem();
    if (!(item as IItemEquipable)?.equipSlot || !ctx) {
      return;
    }
    if (ctx.onEquip(item as IItemEquipable)) {
      setSelected(undefined);
    }
  };

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
      ? ctx?.player.invent.reduce<number>((acc, i) => i?.name === item.name ? acc + (i!.stack ?? 0) : acc, 0) ?? 0
      : count;

    console.log({ item, count });

    if (item) {
      const added = ctx?.addStash(item, count);
      console.log(added);
      ctx?.removeInventory(item, added)
    };
  };
  const isInStash = createMemo(() => {
    return ctx?.navStack().includes("story_home_1");
  });

  return (
    <div class="h-full relative">
      <div class="flex flex-col gap-2 h-7/8 overflow-auto p-2" onClick={() => setSelected(undefined)}>
        <For each={ctx?.player.invent ?? []}>{
          (item, idx) => <InventorySlot item={item} onSelect={() => onSelect(idx())} />
        }</For>
      </div>
      <Show when={selectedItem()}>
        <div class="absolute bottom-0 left-0 w-full border-t content-center p-2 bg-slate-500">
          <div class="flex flex-col gap-2">
            <div class="flex flex-row justify-center relative">
              <span class="absolute left-0 top-0 font-bold cursor-pointer border-2 rounded-xl px-2 hover:bg-white hover:text-black" onClick={() => setSelected(undefined)}>X</span>
              <div class="font-bold">{selectedItem()?.label} ({selectedItem()?.stack})</div>
            </div>
            <Show when={selectedItem()!.stats}>
              <div class="text-sm">{
                Object.entries(selectedItem()!.stats ?? {}).filter(([_, v]) => Boolean(v)).map(([k, v]) => `[${k}: ${v}]`).join("")
              }</div>
            </Show>
            <div class="flex flex-col gap-1 justify-between">
              <div class="w-full flex flex-row justify-between gp-2 mb-2">
                <Show when={selectedItem()?.use}>
                  <button class="m-auto" onClick={onUse}>use</button>
                </Show>
                <Show when={(selectedItem() as IItemEquipable).equipSlot}>
                  <button class="m-auto" onClick={onEquip}>equip</button>
                </Show>
              </div>
              <Show when={isInStash()}>
                <div class="px-2 py-1 bg-blue-300 w-full flex flex-row justify-between items-center mb-2">
                  <span class="font-bold text-xl text-black">Stash</span>
                  <div class="flex flex-row gap-4">
                    <Button onClick={() => onStash(1)}>One</Button>
                    <Button onClick={() => onStash(selectedItem()?.stack ?? 1)}>Stack</Button>
                    <Button onClick={() => onStash(Infinity)}>All</Button>
                  </div>
                </div>
              </Show>
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
