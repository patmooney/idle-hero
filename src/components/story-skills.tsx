import { Component, createMemo, createSignal, For, Match, Switch, useContext } from "solid-js";
import masteryData from "../data/mastery";
import { StoryContext } from "../provider/story";
import {MasteryType} from "../data/types";
import {getLevel, getProgress, masteryXP} from "../utils/levels";
import {Progress} from "./ticker";

export const Story_Skills: Component = () => {
  const [view, setView] = createSignal<"skills" | "mastery">("mastery");
  const ctx = useContext(StoryContext);

  const mastery = createMemo(() => {
    return Object.entries(ctx?.player.mastery ?? {}).map(
      ([k, v]) => {
        const m = masteryData[k as MasteryType];
        return { label: m?.label, progress: (getProgress(v, masteryXP) * 100), level: getLevel(v, masteryXP) };
      }
    );
  })

  return (
    <div class="flex flex-col h-full">
      <div class="h-7/8">
        <Switch>
          <Match when={view() === "skills"}>TODO</Match>
          <Match when={view() === "mastery"}>
            <For each={mastery()}>{
              (m) => (
                <div class="flex flex-row justify-between items-center">
                  <div>{m.label}</div>
                  <div class="h-4 w-32">
                    <Progress label={`${m.level}`} type="yellow" max={100} value={m.progress} showPc></Progress>
                  </div>
                </div>
              )
            }</For>
          </Match>
        </Switch>
      </div>
      <div class="h-1/8 flex flex-row justify-center gap-2">
        <button classList={{ "selected": view() === "skills"}} onClick={() => setView("skills")}>Skills</button>
        <button classList={{ "selected": view() === "mastery"}} onClick={() => setView("mastery")}>Mastery</button>
      </div>
    </div>
  );
}
