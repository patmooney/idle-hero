import basic from "./item/basic";
import recipe from "./item/recipe";
import resource from "./item/resource";
import early from "./item/early";
import food from "./item/food";
import unique from "./item/unique";

import { IItem } from "./types";

export default [basic, recipe, resource, early, food, unique].flat().reduce<{ [key: string]: IItem }>(
    (acc, item) => {
        acc[item.name] = item;
        return acc;
    }, {}
);
