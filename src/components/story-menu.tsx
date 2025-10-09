import { Component, useContext } from "solid-js";
import { GameContext } from "../provider/game";

export const Story_Menu: Component = () => {
  const ctx = useContext(GameContext);
  return (
    <div class="flex flex-col p-2 gap-2 w-full">
      <div class="border p-2 font-bold cursor-pointer" onClick={ctx?.onClearState}>RESET</div>
    </div>
  );
};
