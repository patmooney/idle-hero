import type { IStory } from "./types";

import begin from "./story/begin";
import home from "./story/home";
import forest from "./story/forest";
import town from "./story/town";

export default [begin, home, forest, town].flat().reduce<{ [key: string]: IStory }>(
    (acc, story) => {
        acc[story.name] = story;
        return acc;
    }, {}
);
