import { IDrop, IEncounter, IItem, IOption, ISkill, IStory, StoryType } from "../data/types";
import itemData from "../data/item";
import { IStoryContext } from "../provider/story";
import { JSXElement } from "solid-js";

export class Story implements IStory {
    name: string;
    label: string;
    description: string | JSXElement;
    type: StoryType;
    encounters?: IEncounter[];
    duration?: number;
    noRepeat?: boolean;
    cooldown?: number;
    items?: IDrop[];
    skills?: ISkill[];
    options?: IOption[] | ((ctx: IStoryContext) => IOption[]);
    onComplete?: (() => void) | undefined;

    constructor(story: IStory) {
        this.label = story.label;
        this.type = story.type;
        this.name = story.name;
        this.description = story.description;
        Object.assign(this, story);
    }

    getEncounter(): IEncounter | undefined {
        if (this.type === "task") {
            const taskEncounter: IEncounter = {
                name: "task",
                label: this.label,
                health: this.duration ?? 0,
                chance: 1,
                drops: this.items
            };
            return taskEncounter;
        }
        const rand = Math.random();
        if (this.type !== "encounter" || !this.encounters?.length) {
            return;
        }
        // if monsterA has a chance of 0.5 and monsterB has a chance of 0.01 then monsterB will only spawn
        // if rand 
        return this.encounters.sort((a, b) => a.chance - b.chance).find(
            (enc) => {
                return rand <= enc.chance;
            }
        );
    }

    getDrops(enc: IEncounter): IItem[] | undefined {
        return this.getItems(enc?.drops)
    }

    getItems(drops: IDrop[] = this.items ?? []): IItem[] | undefined {
        const dropped = drops.filter(
            (drop) => {
                return Math.random() <= drop.chance;
            }
        );
        return dropped?.map(
            (drop) => itemData[drop.name]
        ).filter(Boolean) as IItem[];
    }
}
