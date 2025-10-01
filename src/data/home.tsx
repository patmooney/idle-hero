import { IFurniture } from "./types";

const furnitureList: IFurniture[] = [
  {
    type: "craft",
    name: "bench_simple",
    label: "Simple crafting bench",
    craftingComplexity: 1
  }
]

export const furniture = furnitureList.reduce<{ [key: string]: IFurniture }>(
    (acc, item) => {
        acc[item.name] = item;
        return acc;
    }, {}
);
