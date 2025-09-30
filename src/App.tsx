import { Component, createSignal, Match, Switch, useContext } from 'solid-js'
import './App.css'
import { Progress, Ticker } from './components/ticker'
import { Commander } from './provider/commander'
import { StoryContext, StoryProvider } from './provider/story';
import { Story_Dialogue } from './components/story-dialogue';

type ContextScreen = "story" | "invent" | "stats" | "skills";

function App() {
  const [view, setView] = createSignal<ContextScreen>("story");

  return (
    <>
      <StoryProvider>
        <Commander>
          <div class="w-dvw h-dvh lg:w-[360px] lg:h-[800px] flex flex-col justify-between">
            <div class="h-2/10 bg-gray-400 p-2">
              <ActionView />
            </div>
            <div class="h-7/10 bg-gray-800 p-2">
              <Switch fallback={<div>Unknown view</div>}>
                <Match when={view() === "story"}>
                  <Story_Dialogue />
                </Match>
              </Switch>
            </div>
            <div class="h-1/10 w-full flex flex-row justify-between font-bold">
              <ContextButton label="Story" onClick={() => setView("story")} view={view()} type="story" />
              <ContextButton label="Invent" onClick={() => setView("invent")} view={view()} type="invent" />
              <ContextButton label="Skills" onClick={() => setView("skills")} view={view()} type="skills" />
              <ContextButton label="Stats" onClick={() => setView("stats")} view={view()} type="stats" />
            </div>
          </div>
        </Commander>
      </StoryProvider>
    </>
  )
}

export const ActionView: Component = () => {
  const ctx = useContext(StoryContext);
  const [health, setHealth] = createSignal<number>(20);

  return (
    <Switch>
      <Match when={ctx?.story().type === "dialogue"}>
        <div class="flex flex-col gap-2">
          <div class="bg-black">Story</div>
          <div class="text-black whitespace-pre-wrap">{ctx?.story().label}</div>
        </div>
      </Match>
      <Match when={ctx?.story().type === "encounter"}>
        <div class="text-black">
          Attacking
        </div>
        <Ticker ticks={200} onFinish={() => setHealth(health() - 1)} label="Attack" showPc />
        <Progress type="red" max={20} value={health()} label="Health" showNumber></Progress>
      </Match>
    </Switch>
  );
}

export const ContextButton: Component<{ label: string, onClick: () => void, view: ContextScreen, type: ContextScreen }> = (props) =>
  <div class="content-center w-1/4 border border-l-0 cursor-pointer last:border-r-0" onClick={props.onClick} classList={{ "border-t-0 bg-gray-800": props.view === props.type }}>{props.label}</div>

export default App
