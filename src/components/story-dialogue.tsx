import { Component, createMemo, For, Show, useContext } from "solid-js";
import { DEFAULT_STORY, StoryContext } from "../provider/story";
import { IOption } from "../data/types";

export const Story_Dialogue: Component = () => {
  const ctx = useContext(StoryContext);
  const onClick = (option: IOption) => {
    if (option.goto) {
      return ctx?.onNavigate(option.goto);
    }
    if (option.action && ctx) {
      return option.action(ctx);
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
    <div class="flex flex-col gap-5 p-2">
      <For each={options()}>{
        (opt) => <div
          class="w-full border content-center h-12 text-lg font-bold flex flex-col justify-center"
          onClick={() => !opt.isDisabled && onClick(opt)}
          classList={{
            "text-gray-500": opt.isDisabled,
            "cursor-pointer": !opt.isDisabled
          }}
        >
          {opt.label}
          <Show when={opt.subtext}>
            <span class="text-xs text-gray-400">{opt.subtext}</span>
          </Show>
        </div>
      }</For>
      <Show when={ctx?.story()?.name !== DEFAULT_STORY}>
        <div class="w-full border content-center cursor-pointer h-12 text-lg font-bold" onClick={() => onClick({ label: "Go back", goto: "_back" })}>
          Go back
        </div>
      </Show>
    </div>
  );
};
