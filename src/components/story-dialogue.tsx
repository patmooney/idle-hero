import { Component, createMemo, For, Show, useContext } from "solid-js";
import { DEFAULT_STORY, StoryContext } from "../provider/story";
import { IOption } from "../data/types";

export const Story_Dialogue: Component = () => {
  const ctx = useContext(StoryContext);
  const onClick = (option: IOption) => {
    if (option.goto) {
      return ctx?.onNavigate(option.goto);
    }
    if (option.action) {
      return ctx?.onAction(option.action);
    }
  }
  const options = createMemo(() => {
    const opts = ctx?.story().options;
    if (Array.isArray(opts)) {
      return opts;
    }
    return opts?.(ctx!) ?? [];
  });
  return (
    <div class="flex flex-col gap-5 pt-5">
      <For each={options()}>{
        (opt) => <div class="w-full border content-center cursor-pointer h-12 text-lg font-bold" onClick={() => onClick(opt)}>{opt.label}</div>
      }</For>
      <Show when={ctx?.story()?.name !== DEFAULT_STORY}>
        <div class="w-full border content-center cursor-pointer h-12 text-lg font-bold" onClick={() => onClick({ label: "Go back", goto: "_back" })}>
          Go back
        </div>
      </Show>
    </div>
  );
};
