export interface IEncounter {
    name: string;
    label: string;
    health: number;
    drops?: IItem[];
}

export interface IItem {
    name: string;
    label: string;
}

export interface ISkill {}

export interface IOption {
    label: string;
    goto: string;
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
