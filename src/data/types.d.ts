import { JSX, JSXElement } from "solid-js";
import { IGameContext } from "../provider/game";
import { IInventoryContext } from "../provider/inventory";
import { IPlayerContext } from "../provider/player";
import { IStoryContext } from "../provider/story";

export interface IEncounter {
    name: string;
    label: string;
    chance: number;
    health: number;
    drops?: IDrop[];
    experience?: number;
    stats?: IStats;
    isUnique?: boolean; // i.e. can kill once (per run)  
};

export type StoryMarker = "story_farmer_gift_1";

export type StoryType = "task" | "encounter" | "dialogue";
export type MasteryType = "unarmed" | "sword" | "axe" | "pickaxe" | "battleaxe" | "scythe" | "spear" | "flail" | "mace" | "staff" | "alchemy" | "smithing" | "woodcutting";
export type ItemUtilityType = "axe" | "pickaxe";
export type EquipSlotType = "head" | "shoulder" | "chest" | "hand" | "leg" | "foot" | "weapon" | "offhand";
export type CraftingType = "basic" | "weapon" | "armour" | "food";
export type ItemCategory = "misc" | "food" | "resource" | "book" | "unique";

export type LearnType = "recipe" | "skill";
export type ItemCount = { name: string, count: number };
export type InventItem = ItemCount | null;
export type FurnitureType = "stash" | "craft";

export interface IFurniture {
    type: FurnitureType;
    name: string;
    label: string;
    storageSize?: number;
    cratingType?: CraftingType;
    craftingComplexity?: number;
    ingredients?: ItemCount[];
}

export type IItem = IItemBase | IItemEquipable | IItemCraftable;
export type IRecipe = IItem & { craftableItem?: string, craftableFurniture?: string };

export interface IItemBase {
    name: string;
    label: string;
    category?: ItemCategory;
    stats?: IStats;
    exclusive?: boolean; // can only hold 1
    maxStack?: number;
    useVerb?: string;
    use?: (gameCtx: IGameContext, inventCtx: IInventoryContext, playerCtx: IPlayerContext, storyCtx: IStoryContext) => boolean;
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
    ingredients?: ItemCount[];
}

export interface ISkill {}

export interface IDrop {
    name: string;
    chance: number;
}

export interface IMasteryBonus {
    level: number;
    stats: IStats;
    dropModifiers?: IDrop[];
}

export interface IMastery {
    name: MasteryType;
    label: string;
    bonus: IMasteryBonus[]; // cumulative
}

export type IOption = {
    label: string | JSXElement;
    goto?: string;
    action?: (gameCtx: IGameContext, inventCtx: IInventoryContext, playerCtx: IPlayerContext, storyCtx: IStoryContext) => void;
    subtext?: string;
    isDisabled?: boolean;
}

export interface IStory {
    type: StoryType;
    name: string;
    label: string;
    description: string | JSXElement;
    // dialogue
    options?: IOption[] | ((gameCtx: IGameContext, inventCtx: IInventoryContext, playerCtx: IPlayerContext, storyCtx: IStoryContext) => IOption[]);
    // encounter
    encounters?: IEncounter[];
    cooldown?: number;
    limit?: number;
    // task
    duration?: number;
    noRepeat?: boolean;
    items?: IDrop[];
    onComplete?: (gameCtx: IGameContext, inventCtx: IInventoryContext, playerCtx: IPlayerContext, storyCtx: IStoryContext) => void;
    masteryType?: MasteryType;
    experience?: number;
    utilityType?: ItemUtilityType;
}

export interface IStats {
    maxHealth?: number;
    strength?: number;
    agility?: number;
    dexterity?: number;
    intelligence?: number;
    charisma?: number;
    constitution?: number;
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
    equipment: string[];
    mastery: { [key in MasteryType]?: number };
    recipes: string[];
}

export interface IGameState {
    prohibitedItems: string[];
    furniture: string[];
    inventory: InventItem[];
    stash: InventItem[];
    blockedEncounters: string[];
    markers: StoryMarker[];
    points?: number;
}

export type LogType = "bad" | "good" | "meta" | "drop" | "basic";

export type ILogItem = {
  time: string;
  msg: (string | JSXElement);
  type: LogType;
}
