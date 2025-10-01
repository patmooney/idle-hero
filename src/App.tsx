import './App.css'

import { Component, createMemo, createSignal, For, Match, Switch, useContext } from 'solid-js'
import { createStore } from 'solid-js/store';

import { getLevel, getProgress } from './utils/levels';

import { Commander } from './provider/commander'
import { LogType, StoryContext, StoryProvider } from './provider/story';

import { Story_Dialogue } from './components/story-dialogue';
import { Story_Invent } from './components/story-invent';
import { Story_Skills } from './components/story-skills';
import { Action_Encounter } from './components/action-encounter';
import { Story_Stats } from "./components/story-stats";

type ContextScreen = "story" | "invent" | "stats" | "skills" | "menu";

function App() {
  const [view, setView] = createSignal<ContextScreen>("story");

  return (
    <>
      <StoryProvider>
        <Commander>
          <div class="w-dvw h-dvh lg:w-[360px] lg:h-[800px] flex flex-col justify-between">
            <div class="h-2/10 bg-gray-400">
              <Overview />
              <ActionView />
            </div>
            <div class="h-1/10">
              <Log />
            </div>
            <div class="h-6/10 bg-gray-800">
              <Switch fallback={<div>Unknown view</div>}>
                <Match when={view() === "story"}>
                  <Story_Dialogue />
                </Match>
                <Match when={view() === "invent"}>
                  <Story_Invent />
                </Match>
                <Match when={view() === "skills"}>
                  <Story_Skills />
                </Match>
                <Match when={view() === "stats"}>
                  <Story_Stats />
                </Match>
                <Match when={view() === "menu"}>
                  <Story_Skills />
                </Match>
              </Switch>
            </div>
            <Menu onChange={setView} view={view()} />
          </div>
        </Commander>
      </StoryProvider>
    </>
  )
}

export const Menu: Component<{ onChange: (view: ContextScreen) => void, view: ContextScreen }> = (props) => {
  return (
    <div class="h-1/10 w-full flex flex-row justify-between font-bold">
      <ContextButton label="Story" onClick={() => props.onChange("story")} view={props.view} type="story" />
      <ContextButton label="Invent" onClick={() => props.onChange("invent")} view={props.view} type="invent" />
      <ContextButton label="Skills" onClick={() => props.onChange("skills")} view={props.view} type="skills" />
      <ContextButton label="Stats" onClick={() => props.onChange("stats")} view={props.view} type="stats" />
      <ContextButton label="Menu" onClick={() => props.onChange("menu")} view={props.view} type="menu" />
    </div>
  );
}

export const ActionView: Component = () => {
  const ctx = useContext(StoryContext);

  return (
    <Switch>
      <Match when={ctx?.story().type === "dialogue"}>
        <div class="flex flex-col gap-2 p-1">
          <div class="bg-black">{ctx?.story().label ?? "Story"}</div>
          <div class="text-black whitespace-pre-wrap">{ctx?.story().description}</div>
        </div>
      </Match>
      <Match when={ctx?.story().type === "encounter"}>
        <Action_Encounter />
      </Match>
    </Switch>
  );
};

export const Log: Component = () => {
  const [logRef, setLogRef] = createSignal<HTMLDivElement>();
  const { log } = useContext(StoryContext) ?? {};

  const [show, setShow] = createStore<Record<LogType, boolean>>({
    good: true,
    bad: true,
    meta: true,
    drop: true,
    basic: true
  })

  const logLines = createMemo(() => {
    const c = logRef();
    if (!c) {
      return;
    }
    const isBot = (c.scrollTop + c.clientHeight) > c.scrollHeight - 10;
    setTimeout(() => isBot && c.scrollTo(0, c.scrollHeight ?? 0))
    return log?.().filter((item) => show[item.type]);
  });

  return (
    <div class="h-full bg-white flex flex-row">
      <div class="text-black bottom-0 left-0 border border-gray-100 p-1 flex flex-col gap-1 bg-white">
        <div
          class="rounded h-4 w-4 cursor-pointer"
          classList={{ "bg-red-100": !show.bad, "bg-red-500": show.bad }}
          onClick={() => setShow("bad", !show.bad)}
          title="Show/hide bad"
        ></div>
        <div
          class="rounded h-4 w-4 cursor-pointer"
          classList={{ "bg-green-100": !show.good, "bg-green-500": show.good }}
          onClick={() => setShow("good", !show.good)}
          title="Show/hide good"
        ></div>
        <div
          class="rounded h-4 w-4 cursor-pointer"
          classList={{ "bg-yellow-100": !show.meta, "bg-yellow-500": show.meta }}
          onClick={() => setShow("meta", !show.meta)}
          title="Show/hide meta"
        ></div>
        <div
          class="rounded h-4 w-4 cursor-pointer"
          classList={{ "bg-blue-100": !show.drop, "bg-blue-500": show.drop }}
          onClick={() => setShow("drop", !show.drop)}
          title="Show/hide drop"
        ></div>
        <div
          class="rounded h-4 w-4 cursor-pointer"
          classList={{ "bg-gray-100": !show.basic, "bg-gray-500": show.basic }}
          onClick={() => setShow("basic", !show.basic)}
          title="Show/hide basic"
        ></div>
      </div>
      <div class="text-black h-full overflow-y-auto flex flex-col w-full" ref={setLogRef}>
        <For each={logLines()}>{
          (item) => (
            <div
              class="flex flex-row items-center px-1 transition-colors duration-500 border-t border-gray-200"
              classList={{
                "last:bg-red-500 last:text-white bg-red-200": item.type === "bad",
                "last:bg-green-500 last:text-white bg-green-200": item.type === "good",
                "last:bg-yellow-500 bg-yellow-200": item.type === "meta",
                "last:bg-blue-500 last:text-white bg-blue-200": item.type === "drop",
              }}
            >
              <div class="text-xs text-blue-400 mr-1">[{item.time}]</div>
              <div class="text-wrap text-xs text-left">{item.msg}</div>
            </div>
          )
        }</For>
      </div>
    </div>
  );
};

const Overview: Component = () => {
  const ctx = useContext(StoryContext);
  return (
    <div class="flex flex-row bg-black px-1 justify-between">
      <div class="text-red-500">HP {ctx?.player.stats.health}/{ctx?.player.stats.maxHealth}</div>
      <div class="text-yellow-500">Gold {ctx?.player.stats.gold}</div>
      <div class="text-green-500">Lvl {getLevel(ctx?.player.stats.experience ?? 0)} ({(getProgress(ctx?.player.stats.experience ?? 0) * 100).toFixed(0)}%)</div>
    </div>
  );
};

export const ContextButton: Component<{ label: string, onClick: () => void, view: ContextScreen, type: ContextScreen }> = (props) =>
  <div class="content-center w-1/4 border border-l-0 cursor-pointer last:border-r-0" onClick={props.onClick} classList={{ "border-t-0 bg-gray-800": props.view === props.type }}>{props.label}</div>

export default App
