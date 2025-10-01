import basic from "./mastery/basic";
import { IMastery, MasteryType } from "./types";

export default [basic].flat().reduce<{ [key in MasteryType]?: IMastery }>(
    (acc, item) => {
        acc[item.name] = item;
        return acc;
    }, {}
);
