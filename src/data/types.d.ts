export interface IEncounter {
    name: string;
    label: string;
    health: number;
    chance: number;
    drops?: IDrop[];
    experience?: number;
}

export type EquipSlotType = "head" | "shoulder" | "chest" | "hand" | "leg" | "foot" | "weapon" | "offhand";

export interface IItem {
    name: string;
    label: string;
    stats?: IStats;
    exclusive?: boolean; // can only hold 1
    stackable?: boolean;
    maxStack?: number;

    equipSlot?: EquipSlotType;
    masteryType?: MasteryType;
}

export interface IDrop {
    name: string;
    chance: number;
}

export type MasteryType = "unarmed" | "sword" | "axe" | "pickaxe" | "battleaxe" | "scythe" | "spear" | "flail" | "mace" | "staff" | "alchemy" | "smithing";

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

export type StoryType = "task" | "encounter" | "dialogue";

export interface IStory {
    name: string;
    type: StoryType;
    label: string;
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
}
