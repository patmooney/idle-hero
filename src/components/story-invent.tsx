import { Component, For, Show, useContext } from "solid-js";
import { StoryContext } from "../provider/story";
import { IItem } from "../data/types";

export const Story_Invent: Component = () => {
  const ctx = useContext(StoryContext);

  return (
    <div class="flex flex-col gap-2 h-full overflow-auto">
      <For each={ctx?.player.invent ?? []}>{
        (item) => <InventorySlot item={item} />
      }</For>
    </div>
  );
}

const InventorySlot: Component<{ item: (IItem & { stack?: number }) | null }> = (props) => {
  return (
    <Show when={props.item}>
      <div class="border p-1">{props.item?.label} ({props.item?.stack})</div>
    </Show>
  );
}
