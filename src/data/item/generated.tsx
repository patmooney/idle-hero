import { levelDrops } from "../story/generated";
import { IItem } from "../types";

const items: IItem[] = levelDrops.reduce<IItem[]>(
  (items, level) => {
    items.push(
      ...level.map<IItem>(
        (d) => ({
          name: d[0],
          label: d[0],
          maxStack: 100,
          category: "misc"
        })
      )
    );
    return items;
  }, []
);

export default items;
