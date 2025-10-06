import basic from "./furniture/basic";

import { IFurniture } from "./types";

export default [basic].flat().reduce<{ [key: string]: IFurniture }>(
    (acc, item) => {
        acc[item.name] = item;
        return acc;
    }, {}
);
