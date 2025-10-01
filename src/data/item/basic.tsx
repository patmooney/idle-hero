import { IItem } from "../types";

const items: IItem[] = [
  {
    name: "hay_hand_1",
    label: "Hay hand wraps",
    stackable: false,
    equipSlot: "hand",
    craftComplexity: 1,
    craftType: "basic",
    craftLevel: 1,
    ingredients: [["hay_1", 25]],
    stats: {
      attMin: 1,
      attMax: 3
    }
  }
];

export default items;
