import { Component, For, Show } from "solid-js";

export const Speech: Component<{ lines: string[] }> = (props) => {
  return (
    <div class="font-bold m-2">
      <For each={props.lines}>{
        (line, idx) => (
          <div>
            <Show when={idx() === 0}>" .. </Show>{/*@once*/line}<Show when={idx() === props.lines.length - 1}> .. "</Show>
          </div>
        )
      }</For>
    </div>
  );
};
