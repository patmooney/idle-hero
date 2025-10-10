import { IFurniture } from "../types";

const basic: IFurniture[] = [
  {
    name: "furniture_bench_basic_1",
    label: "Basic bench",
    type: "craft",
    craftingComplexity: 1,
    cratingType: "basic",
    ingredients: [{ name: "wood_log_1", count: 50 }]
  },
  {
    name: "furniture_stash_1",
    label: "Basic stash",
    type: "stash",
    storageSize: 5,
    ingredients: [{ name: "wood_log_1", count: 20 }, { name: "hay_1", count: 50 }]
  },
  {
    name: "furniture_cook_basic_1",
    label: "Camp fire",
    type: "craft",
    cratingType: "food",
    craftingComplexity: 1,
    ingredients: [{ name: "wood_log_1", count: 50 }, { name: "hay_1", count: 50 }]
  }
];

export default basic;
