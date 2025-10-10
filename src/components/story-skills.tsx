import { Component, createMemo, createSignal, For, Match, Switch, useContext } from "solid-js";
import { MasteryType } from "../data/types";
import { getLevel, getProgress, masteryXP } from "../utils/levels";
import { Progress } from "./ticker";

import itemData from "../data/item";
import masteryData from "../data/mastery";
import { PlayerContext } from "../provider/player";

type views = "skills" | "mastery" | "recipes";
type masteryDisplay = { label: string, progress: number, level: number, name: MasteryType };

export const Story_Skills: Component = () => {
  const [view, setView] = createSignal<views>("mastery");
  const playerCtx = useContext(PlayerContext);

  const [selected, setSelected] = createSignal<MasteryType>();

  const mastery = createMemo<masteryDisplay[]>(() => {
    return Object.entries(playerCtx?.player.mastery ?? {}).map(
      ([k, v]) => {
        const m = masteryData[k as MasteryType];
        return { label: m?.label ?? "", progress: (getProgress(v, masteryXP) * 100), level: getLevel(v, masteryXP), name: k as MasteryType };
      }
    ) ?? [];
  });

  const selectedMastery = createMemo(() => {
    const name = selected();
    if (!name) {
      return;
    }
    const exp = playerCtx?.player.mastery[name] ?? 0;
    const m = masteryData[name];
    return { label: m?.label ?? "", progress: (getProgress(exp, masteryXP) * 100), level: getLevel(exp, masteryXP), name };
  });

  const onChangeView = (name: views) => {
    setSelected(undefined);
    setView(name);
  }

  const masteryDetails = createMemo(() => {
    const name = selected();
    if (name === undefined) {
      return;
    }
    const level = getLevel(playerCtx?.player.mastery[name] ?? 0, masteryXP);
    const indexOf = masteryData[name]?.bonus.findLastIndex((b) => b.level <= level);
    return masteryData[name]?.bonus.slice(0, (indexOf ?? 0)+2).map(
      (b, idx, arr) => ({
        level: b.level,
        stats: (b.dropModifiers ?? []).map((e) => `[${itemData[e.name]?.label}: +${e.chance}]`) + Object.entries(b.stats ?? {}).filter(([_, v]) => Boolean(v)).map(([k, v]) => `[${k}: ${v}]`).join(""),
        isLast: idx === arr.length - 1
      })
    );
  });

  return (
    <div class="flex flex-col h-full">
      <div class="h-7/8 p-2">
        <Switch>
          <Match when={view() === "skills"}>TODO</Match>
          <Match when={view() === "mastery" && !selected()}>
            <For each={mastery()}>{
              (m) => (
                <div class="flex flex-row justify-between items-center cursor-pointer" onClick={() => setSelected(m.name)}>
                  <div>{m.label}</div>
                  <div class="h-4 w-32">
                    <Progress label={`${m.level}`} type="yellow" max={100} value={m.progress} showPc></Progress>
                  </div>
                </div>
              )
            }</For>
          </Match>
          <Match when={view() === "mastery" && selected()}>
            <div class="flex flex-col justify-between items-center cursor-pointer">
              <div class="text-xl font-bold">{selectedMastery()?.label}</div>
              <div class="h-4 w-32">
                <Progress label={`${selectedMastery()!.level}`} type="yellow" max={100} value={selectedMastery()!.progress} showPc></Progress>
              </div>
            </div>

            <div class="flex flex-row justify-between items-center font-bold mb-2">
              <div>Level</div>
              <div>Stats</div>
            </div>
            <For each={masteryDetails()}>{
              (m) => (
                <div class="flex flex-row justify-between items-center border-b border-gray-700">
                  <div>{m.level}</div>
                  <div class="text-xs">{m.isLast ? "???" : m.stats}</div>
                </div>
              )
            }</For>
          </Match>
          <Match when={view() === "recipes"}>
            <For each={playerCtx?.recipes()}>{
              (m) => (
                <div class="flex flex-row justify-between items-center">
                  <div>{m.label}</div>
                </div>
              )
            }</For>
          </Match>

        </Switch>
      </div>
      <div class="h-1/8 flex flex-row justify-between gap-2 p-2">
        <button classList={{ "selected": view() === "skills"}} onClick={() => onChangeView("skills")}>Skills</button>
        <button classList={{ "selected": view() === "mastery"}} onClick={() => onChangeView("mastery")}>Mastery</button>
        <button classList={{ "selected": view() === "recipes"}} onClick={() => onChangeView("recipes")}>Recipes</button>
      </div>
    </div>
  );
}
