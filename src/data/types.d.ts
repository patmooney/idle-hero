import {JSX, JSXElement} from "solid-js";
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
export type MasteryType = "unarmed" | "sword" | "axe" | "pickaxe" | "battleaxe" | "scythe" | "spear" | "flail" | "mace" | "staff" | "alchemy" | "smithing" | "woodcutting";
export type ItemUtilityType = "axe" | "pickaxe";
export type EquipSlotType = "head" | "shoulder" | "chest" | "hand" | "leg" | "foot" | "weapon" | "offhand";
export type CraftingType = "basic" | "weapon" | "armour";

export type LearnType = "recipe" | "skill";

export type FurnitureType = "stash" | "craft";

export interface IFurniture {
    type: FurnitureType;
    name: string;
    label: string;
    storageSize?: number;
    cratingType?: CraftingType;
    craftingComplexity?: number;
}

export type IItem = IItemBase | IItemEquipable | IItemCraftable;
export type IRecipe = IItem & { craftableItem: string };

export interface IItemBase {
    name: string;
    label: string;
    stats?: IStats;
    exclusive?: boolean; // can only hold 1
    stackable?: boolean;
    maxStack?: number;
    use?: (ctx: IStoryContext) => boolean;
}

export interface IItemEquipable extends IItemBase {
    utilityType?: ItemUtilityType;
    equipSlot: EquipSlotType;
    equipRequirements?: Partial<IPlayerStats>;
    masteryType?: MasteryType;
}

export interface IItemCraftable extends IItemBase {
    craftType: CraftingType;
    craftComplexity: number;
    craftLevel: number;
    ingredients?: [string, number][];
}

export interface ISkill {}

export interface IDrop {
    name: string;
    chance: number;
}

export interface IMasteryBonus {
    level: number;
    stats: IStats;
    dropModifiers?: Idrop[];
}

export interface IMastery {
    name: MasteryType;
    label: string;
    bonus: IMasteryBonus[]; // cumulative
}

export type IOption = {
    label: string | JSXElement;
    goto?: string;
    action?: (ctx: IStoryContext) => void;
    subtext?: string;
    isDisabled?: boolean;
}

export interface IStory {
    type: StoryType;
    name: string;
    label: string;
    description: string | JSXElement;
    // dialogue
    options?: IOption[] | ((ctx: IStoryContext) => IOption[]);
    // encounter
    encounters?: IEncounter[];
    cooldown?: number;
    // task
    duration?: number;
    noRepeat?: boolean;
    items?: IDrop[];
    onComplete?: () => void;
    masteryType?: MasteryType;
    experience?: number;
}

export interface IStats {
    maxHealth?: number;
    strength?: number;
    agility?: number;
    attSpeed?: number;
    attMin?: number;
    attMax?: number;
    physRes?: number;
    magRes?: number;

    // i.e. make tasks faster
    durationModifier?: number;
}

export interface IAttributes {
    health: number;
    gold: number;
    experience: number;
}

export type IPlayerStats = IAttributes & IStats;

export interface IPlayer {
    stats: IPlayerStats;
    equipment: IItemEquipable[];
    mastery: { [key in MasteryType]?: number };
    recipes: string[];
}

export interface IGameState {
    prohibitedItems?: string[];
    furniture?: string[];
}
