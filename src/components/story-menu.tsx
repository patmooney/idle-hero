import { Component, useContext } from "solid-js";
import { StoryContext } from "../provider/story";

export const Story_Menu: Component = () => {
  const ctx = useContext(StoryContext);
  return (
    <div class="flex flex-col p-2 gap-2 w-full">
      <div class="border p-2 font-bold cursor-pointer" onClick={ctx?.onClearState}>RESET</div>
    </div>
  );
};
