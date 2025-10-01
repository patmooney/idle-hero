import type { IStoryContext } from "../provider/story";

import begin from "./action/begin";

export default [begin].flat().reduce<{ [key: string]: (ctx: IStoryContext, args?: unknown[]) => void }>(
    (acc, action) => {
        acc[action.name] = action.action;
        return acc;
    }, {}
);
