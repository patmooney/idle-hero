import { ParentComponent } from "solid-js";

export const Button: ParentComponent<{ class?: string, onClick: () => void }> = (props) => {
  return <div
    class={`${props.class ?? ""} bg-black rounded py-1 px-2 cursor-pointer hover:outline hover:outline-blue-500 font-bold text-xs h-full`}
    onClick={props.onClick}
  >{props.children}</div>
};
