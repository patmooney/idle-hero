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
  },
  {
    name: "hay_head_1",
    label: "Hay bandana",
    stackable: false,
    equipSlot: "head",
    craftComplexity: 1,
    craftType: "basic",
    craftLevel: 1,
    ingredients: [["hay_1", 25]],
    stats: {
      maxHealth: 5,
    }
  },
  {
    name: "hay_chest_1",
    label: "Hay vest",
    stackable: false,
    equipSlot: "chest",
    craftComplexity: 1,
    craftType: "basic",
    craftLevel: 1,
    ingredients: [["hay_1", 50]],
    stats: {
      physRes: 1
    }
  }
];

export default items;
