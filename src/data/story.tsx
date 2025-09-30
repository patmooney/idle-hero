import type { IStory } from "./types";
import begin from "./story/begin";

export default [begin].flat().reduce<{ [key: string]: IStory }>(
    (acc, story) => {
        acc[story.name] = story;
        return acc;
    }, {}
);
