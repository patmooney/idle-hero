import { Component, createSignal, For, Show, useContext } from "solid-js";
import { StoryContext } from "../provider/story";
import { IItem } from "../data/types";

export const Story_Invent: Component = () => {
  const ctx = useContext(StoryContext);
  const [selected, setSelected] = createSignal<IItem | null>();

  return (
    <div class="h-full relative">
      <div class="flex flex-col gap-2 h-7/8 overflow-auto">
        <For each={ctx?.player.invent ?? []}>{
          (item) => <InventorySlot item={item} onSelect={() => setSelected(item)} />
        }</For>
      </div>
      <Show when={selected()}>
        <div class="absolute bottom-0 left-0 w-full border-t content-center">
          <div class="flex flex-col gap-2">
            <div>{selected()?.label}</div>
            <div class="flex flex-row gap-1 justify-between">
              <button>drop</button>
              <button>drop all</button>
              <Show when={selected()?.use}>
                <button onClick={() => selected()?.use?.(ctx!)}>use</button>
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
      <div class="border p-1 cursor-pointer" onClick={props.onSelect}>{props.item?.label} ({props.item?.stack})</div>
    </Show>
  );
}
