import basic from "./item/basic";
import { IItem } from "./types";

export default [basic].flat().reduce<{ [key: string]: IItem }>(
    (acc, item) => {
        acc[item.name] = item;
        return acc;
    }, {}
);
