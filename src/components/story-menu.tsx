import { Component, useContext } from "solid-js";
import { StoryContext } from "../provider/story";

export const Story_Menu: Component = () => {
  const ctx = useContext(StoryContext);
  return (
    <div onClick={ctx?.onClearState}>RESET</div>
  );
};
