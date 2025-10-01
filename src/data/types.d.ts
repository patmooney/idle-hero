import type { IStoryContext } from "../provider/story";

export interface IEncounter {
    name: string;
    label: string;
    health: number;
    chance: number;
    drops?: IDrop[];
    experience?: number;
}

export type StoryType = "task" | "encounter" | "dialogue";
export type MasteryType = "unarmed" | "sword" | "axe" | "pickaxe" | "battleaxe" | "scythe" | "spear" | "flail" | "mace" | "staff" | "alchemy" | "smithing";
export type EquipSlotType = "head" | "shoulder" | "chest" | "hand" | "leg" | "foot" | "weapon" | "offhand";

export type LearnType = "recipe" | "skill";

export type FurnitureType = "stash" | "craft";

export interface IFurniture {
    type: FurnitureType;
    name: string;
    label: string;
    storageSize?: number;
    craftingComplexity?: number;
}

export interface IItem {
    name: string;
    label: string;
    stats?: IStats;
    exclusive?: boolean; // can only hold 1
    stackable?: boolean;
    maxStack?: number;

    equipSlot?: EquipSlotType;
    masteryType?: MasteryType;

    use?: (ctx: IStoryContext) => void;
}

export interface ISkill {}

export interface IDrop {
    name: string;
    chance: number;
}

export interface IMasteryBonus {
    level: number;
    stats: IStats;
}

export interface IMastery {
    name: MasteryType;
    label: string;
    bonus: IMasteryBonus[]; // cumulative
}

export type IOption = {
    label: string;
    goto?: string;
    action?: string;
}

export interface IStory {
    name: string;
    type: StoryType;
    label: string;
    description: string;
    encounters?: IEncounter[];
    duration?: number;
    cooldown?: number;
    options?: IOption[];

    // Does this story precipitate any items or skills on entry?
    items?: IItem[];
    skills?: ISkill[];
}

export interface IStats {
    maxHealth?: number;
    strength?: number;
    agility?: number;
    attSpeed?: number;
    attMin?: number;
    attMax?: number;
}

export interface IAttributes {
    health: number;
    gold: number;
    experience: number;
}

export type IPlayerStats = IAttributes & IStats;

export interface IPlayer {
    stats: IPlayerStats;
    equipment: IItem[];
    mastery: { [key in MasteryType]?: number };
    recipes: string[];
}

export interface IGameState {
    prohibitedItems?: string[];
    furniture?: string[];
}
