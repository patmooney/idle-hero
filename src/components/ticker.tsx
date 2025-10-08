import { Component, createMemo, createSignal, Match, onCleanup, onMount, Switch, useContext } from "solid-js";
import { GameContext } from "../provider/game";

export type TickerType = "green" | "yellow" | "blue" | "red";

export const Ticker: Component<{
  name: string,
  ticks: number,
  onFinish: () => void,
  type?: TickerType,
  showPc?: boolean,
  showNumber?: boolean,
  label?: string,
  isSmall?: boolean
}> = (props) => {
  const ctx = useContext(GameContext)
  const [remaining, setRemaining] = createSignal<number>(props.ticks);

  const cb = () => {
    let r = remaining();
    if (r <= 0) {
      props.onFinish();
      r = props.ticks + 1;
    }
    setRemaining(r - 1);
  };
  onMount(() => ctx?.startActivity(props.name, cb));
  onCleanup(() => ctx?.endActivity(props.name));

  return <Progress max={props.ticks} value={props.ticks - remaining()} type={props.type} showPc={props.showPc} showNumber={props.showNumber} label={props.label} />
}

export const Progress: Component<{ max: number, value: number, type?: TickerType, label?: string, showNumber?: boolean, showPc?: boolean, isSmall?: boolean }> = (props) => {
  const pc = createMemo(() => Math.min(props.value / props.max * 100, 100));
  return (
    <div class="w-full border rounded relative text-black bg-gray-500" classList={{ "h-full": !props.isSmall }}>
      <div
        class="ease-linear w-0 h-full rounded"
        style={{ width: pc() + "%" }}
        classList={{
          "bg-white": !props.type,
          "bg-green-500": props.type === "green",
          "bg-yellow-500": props.type === "yellow",
          "bg-blue-500": props.type === "blue",
          "bg-red-500": props.type === "red"
        }}
      ></div>
      <div class="absolute left-1/2 top-1/2 -translate-1/2 whitespace-nowrap">
        <Switch>
          <Match when={props.showPc}>
            {props.label} ({pc().toFixed(0)}%)
          </Match>
          <Match when={props.showNumber}>
            {props.label} {props.value}
          </Match>
        </Switch>
      </div>
    </div>
  );
}
