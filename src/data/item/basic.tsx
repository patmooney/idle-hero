import { IItem } from "../types";

const items: IItem[] = [
  {
    name: "hay_hand_1",
    label: "Hay hand wraps",
    equipSlot: "hand",
    craftComplexity: 1,
    craftType: "basic",
    craftLevel: 1,
    ingredients: [{ name: "hay_1", count: 25 }],
    stats: {
      attMin: 1,
      attMax: 3
    }
  },
  {
    name: "hay_head_1",
    label: "Hay bandana",
    equipSlot: "head",
    craftComplexity: 1,
    craftType: "basic",
    craftLevel: 1,
    ingredients: [{ name: "hay_1", count: 25 }],
    stats: {
      maxHealth: 5,
    }
  },
  {
    name: "hay_chest_1",
    label: "Hay vest",
    equipSlot: "chest",
    craftComplexity: 1,
    craftType: "basic",
    craftLevel: 1,
    ingredients: [{ name: "hay_1", count: 50 }],
    stats: {
      physRes: 1
    }
  },
  {
    name: "utility_axe_1",
    label: "Rusty axe",
    equipSlot: "weapon",
    utilityType: "axe",
    stats: {}
  }
];

export default items;
