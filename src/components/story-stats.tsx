import { Component, createSignal, For, Match, Switch, useContext } from "solid-js";
import { StoryContext } from "../provider/story";

export const Story_Stats: Component = () => {
  const [view, setView] = createSignal<"equip" | "stats">("equip");
  const ctx = useContext(StoryContext);

  return (
    <div class="flex flex-col h-full">
      <div class="h-7/8 p-2">
        <Switch>
          <Match when={view() === "stats"}>TODO</Match>
          <Match when={view() === "equip"}>
            <For each={ctx?.player.equipment ?? []}>{
              (e) => (
                <div class="flex flex-row justify-between items-center">
                  <div>{e.label}</div>
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
