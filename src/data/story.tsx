import type { IStory } from "./types";
import begin from "./story/begin";
import home from "./story/home";

export default [begin, home].flat().reduce<{ [key: string]: IStory }>(
    (acc, story) => {
        acc[story.name] = story;
        return acc;
    }, {}
);
