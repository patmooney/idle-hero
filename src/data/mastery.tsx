import { IMastery, MasteryType } from "./types";

import basic from "./mastery/basic";
import utility from "./mastery/utility";

export default [basic, utility].flat().reduce<{ [key in MasteryType]?: IMastery }>(
    (acc, item) => {
        acc[item.name] = item;
        return acc;
    }, {}
);
