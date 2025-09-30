export interface IEncounter {
    name: string;
    label: string;
    health: number;
    chance: number;
    drops?: IDrop[];
}

export interface IItem {
    name: string;
    label: string;
    stats?: IStats;
    exclusive?: boolean; // can only hold 1
    stackable?: boolean;
    maxStack?: number;
}

export interface IDrop {
    name: string;
    chance: number;
}

export interface ISkill {}

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
    items?: IItem[];
    skills?: ISkill[];
    options?: IOption[];
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
}
