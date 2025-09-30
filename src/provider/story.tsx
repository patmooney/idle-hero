import { createContext, Accessor, ParentComponent, createSignal } from "solid-js";
import { IEncounter, IItem, IOption, ISkill, IStory, StoryType } from "../data/types";
import storyData from "../data/story";

export const DEFAULT_STORY = "story_town_1";

export class Story implements IStory {
  name: string;
  label: string;
  type: StoryType;
  encounters?: IEncounter[];
  duration?: number;
  cooldown?: number;
  items?: IItem[];
  skills?: ISkill[];
  options?: IOption[];

  constructor(story: IStory) {
    this.label = story.label;
    this.type = story.type;
    this.name = story.name;
    Object.assign(this, story);
  }
}

export const StoryContext = createContext<{
  story: Accessor<Story>;
  navigate: (name: string) => void;
}>();

const loadStory = (name: string) => {
  return new Story(storyData[name] ?? storyData[DEFAULT_STORY]);
};

export const StoryProvider: ParentComponent = (props) => {
  const [story, setStory] = createSignal<Story>(loadStory(DEFAULT_STORY));
  const [navStack, setNavStack] = createSignal<string[]>([DEFAULT_STORY]);
  const navigate = (name: string) => {
    if (name !== "_back" && !storyData[name]) {
      console.error(`Unknown story ${name}`);
      return;
    }
    if (name === "_back") {
      name = navStack().at(-2) ?? DEFAULT_STORY;
      if (navStack().length > 1) {
        setNavStack(navStack().slice(0, -1));
      }
    } else {
      setNavStack([...navStack(), name]);
    }
    setStory(loadStory(name));
  };
  return <StoryContext.Provider value={{ story, navigate }}>{props.children}</StoryContext.Provider>
};
