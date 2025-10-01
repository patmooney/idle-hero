import { Component, createSignal, For, Show, useContext } from "solid-js";
import { StoryContext } from "../provider/story";
import { IItem, IItemEquipable } from "../data/types";

export const Story_Invent: Component = () => {
  const ctx = useContext(StoryContext);
  const [selected, setSelected] = createSignal<IItem | null>();

  return (
    <div class="h-full relative">
      <div class="flex flex-col gap-2 h-7/8 overflow-auto p-2">
        <For each={ctx?.player.invent ?? []}>{
          (item) => <InventorySlot item={item} onSelect={() => setSelected(item)} />
        }</For>
      </div>
      <Show when={selected()}>
        <div class="absolute bottom-0 left-0 w-full border-t content-center p-2">
          <div class="flex flex-col gap-2">
            <div>{selected()?.label} {(selected() as IItemEquipable)?.equipSlot}</div>
            <div class="flex flex-row gap-1 justify-between">
              <button onClick={() => ctx?.removeInventory(selected()!)}>drop</button>
              <button onClick={() => ctx?.removeInventory(selected()!, Infinity)}>drop all</button>
              <Show when={selected()?.use}>
                <button onClick={() => selected()?.use?.(ctx!)}>use</button>
              </Show>
              <Show when={(selected() as IItemEquipable).equipSlot}>
                <button onClick={() => ctx?.onEquip(selected() as IItemEquipable)}>equip</button>
              </Show>
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
  return (
    <Show when={props.item}>
      <div class="border p-1 cursor-pointer flex flex-row justify-between" onClick={props.onSelect}>
        <div>{props.item?.label}</div>
        <div>({props.item?.stack})</div>
      </div>
    </Show>
  );
}
