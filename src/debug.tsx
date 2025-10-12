import { Component, createSignal, For, Show, useContext } from "solid-js";
import { Searcher  } from "fast-fuzzy";

import itemData from "./data/item";
import { InventoryContext } from "./provider/inventory";
import { GameContext } from "./provider/game";
import {IStats} from "./data/types";
import {PlayerContext} from "./provider/player";

const searcher = new Searcher(Object.keys(itemData));

export const Debug: Component = () => {
  const invent = useContext(InventoryContext);
  const game = useContext(GameContext);
  const player = useContext(PlayerContext);

  const [results, setResults] = createSignal<string[]>();
  const [selected, setSelected] = createSignal<string>();

  const [stat, setStat] = createSignal<keyof IStats>("strength");
  const onAddStat = (amnt: number) => {
    if (!stat()) {
      return;
    }
    player?.onAddStat(stat()!, amnt);
  };

  const onAdd = (amnt: number = 1) => {
    const sel = selected();
    if (!sel) {
      return;
    }
    invent?.addInventory(sel, amnt);
  };

  const onInput = (v: string) => {
    const results = searcher.search(v);
    setResults(results);
  }

  const onClearInv = () => {
    invent?.inventory().filter(Boolean).forEach(
      (i) => invent.removeInventory(i!.name, i!.count)
    )
  };

  const onClearMarkers = () => {
    game?.setState("markers", []);
  };

  return (
    <div class="w-128 h-128 absolute bg-white top-0 left-0 p-2 text-black">
      <Show when={!selected()}>
        <div class="flex flex-col gap-2 p-2">
          <div class="flex flex-row gap-2">
            <div class="border rounded cursor-pointer px-2" onClick={() => onClearInv()}>CLEAR INV</div> 
            <div class="border rounded cursor-pointer px-2" onClick={() => onClearMarkers()}>CLEAR MARKERS</div>
            <div class="flex flex-row border p-1">
              <select value={stat()} onChange={(e) => setStat(e.target.value as keyof IStats)}>
                <option value={"strength"}>Strength</option>
                <option value={"agility"}>Agility</option>
                <option value={"charisma"}>Charisma</option>
                <option value={"dexterity"}>Dexterity</option>
                <option value={"intelligence"}>Intelligence</option>
                <option value={"constitution"}>Constitution</option>
              </select>
              <div class="border rounded cursor-pointer px-2" onClick={() => onAddStat(1)}>+1</div>
              <div class="border rounded cursor-pointer px-2" onClick={() => onAddStat(10)}>+10</div>
            </div>
            <div class="border rounded cursor-pointer px-2" onClick={() => player?.onAddStat("health", 10)}>HEAL</div>
          </div>
          <input type="text" placeholder="item search" class="border border-black" onKeyPress={(e) => onInput((e.target as HTMLInputElement).value)} />
          <For each={results() ?? []}>{
            (r) => (
              <div class="hover:bg-blue-200 cursor-pointer" onClick={() => setSelected(r)}>{r}</div>
            )
          }</For>
        </div>
      </Show>
      <Show when={selected()}>
        <div class="cursor-pointer" onClick={() => setSelected(undefined)}>BACK</div>
        <div class="flex flex-row gap-2 mt-5">
          <div class="font-bold">{selected()}</div> - 
          <div class="border rounded cursor-pointer px-2" onClick={() => onAdd(1)}>1</div>
          <div class="border rounded cursor-pointer px-2" onClick={() => onAdd(10)}>10</div>
          <div class="border rounded cursor-pointer px-2" onClick={() => onAdd(100)}>100</div>
        </div>
      </Show>
    </div>
  );
};
