import { IItem } from "../types";

const items: IItem[] = [
  // --- WOOD TIER ---
  {
    name: "wood_club_1",
    label: "Wooden Club",
    equipSlot: "weapon",
    craftType: "weapon",
    craftComplexity: 1,
    craftLevel: 1,
    ingredients: [{ name: "wood_log_1", count: 15 }],
    masteryType: "mace",
    stats: {
      attMin: 2,
      attMax: 5,
      attSpeed: -0.1, // slightly slower than fists
    }
  },
  {
    name: "wood_shield_1",
    label: "Wooden Shield",
    equipSlot: "offhand",
    craftType: "armour",
    craftComplexity: 1,
    craftLevel: 1,
    ingredients: [{ name: "wood_log_1", count: 20 }],
    stats: {
      physRes: 2,
      maxHealth: 10
    }
  },
  {
    name: "wood_chest_1",
    label: "Wooden Plank Vest",
    equipSlot: "chest",
    craftType: "armour",
    craftComplexity: 2,
    craftLevel: 1,
    ingredients: [{ name: "wood_log_1", count: 40 }],
    stats: {
      physRes: 3,
      agility: -1 // bulky
    }
  },

  // --- STONE TIER ---
  {
    name: "stone_axe_1",
    label: "Stone Axe",
    equipSlot: "weapon",
    craftType: "weapon",
    craftComplexity: 2,
    craftLevel: 2,
    ingredients: [{ name: "wood_log_1", count: 10 }, { name: "stone_1", count: 10 }],
    masteryType: "axe",
    stats: {
      attMin: 3,
      attMax: 8,
      attSpeed: -0.05,
      strength: 1
    }
  },
  {
    name: "stone_helm_1",
    label: "Stone Helm",
    equipSlot: "head",
    craftType: "armour",
    craftComplexity: 2,
    craftLevel: 2,
    ingredients: [{ name: "stone_1", count: 20 }, { name: "hay_1", count: 10 }],
    stats: {
      physRes: 4,
      maxHealth: 10,
      intelligence: -1 // heavy, clunky
    }
  },

  // --- COPPER/BRONZE TIER ---
  {
    name: "copper_sword_1",
    label: "Copper Shortsword",
    equipSlot: "weapon",
    craftType: "weapon",
    craftComplexity: 3,
    craftLevel: 2,
    ingredients: [{ name: "copper_ingot_1", count: 8 }, { name: "wood_log_1", count: 5 }],
    masteryType: "sword",
    stats: {
      attMin: 4,
      attMax: 10,
      attSpeed: 0.1, // faster than axe
      dexterity: 1
    }
  },
  {
    name: "copper_chest_1",
    label: "Copper Breastplate",
    equipSlot: "chest",
    craftType: "armour",
    craftComplexity: 3,
    craftLevel: 2,
    ingredients: [{ name: "copper_ingot_1", count: 15 }],
    stats: {
      physRes: 5,
      magRes: 1,
      strength: 1
    }
  },

  // --- IRON TIER ---
  {
    name: "iron_spear_1",
    label: "Iron Spear",
    equipSlot: "weapon",
    craftType: "weapon",
    craftComplexity: 4,
    craftLevel: 3,
    ingredients: [{ name: "iron_ingot_1", count: 12 }, { name: "wood_log_1", count: 8 }],
    masteryType: "spear",
    stats: {
      attMin: 6,
      attMax: 14,
      attSpeed: 0,
      dexterity: 2
    }
  },
  {
    name: "iron_helm_1",
    label: "Iron Helmet",
    equipSlot: "head",
    craftType: "armour",
    craftComplexity: 4,
    craftLevel: 3,
    ingredients: [{ name: "iron_ingot_1", count: 8 }],
    stats: {
      physRes: 6,
      maxHealth: 15,
      charisma: -1 // intimidating but ugly
    }
  },
  {
    name: "iron_boots_1",
    label: "Iron Greaves",
    equipSlot: "foot",
    craftType: "armour",
    craftComplexity: 4,
    craftLevel: 3,
    ingredients: [{ name: "iron_ingot_1", count: 6 }],
    stats: {
      physRes: 3,
      agility: -1
    }
  }
];

export default items;
