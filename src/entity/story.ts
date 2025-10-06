import { IDrop, IEncounter, IItem, IOption, ISkill, IStory, ItemUtilityType, MasteryType, StoryType } from "../data/types";
import itemData from "../data/item";
import { IStoryContext } from "../provider/story";
import { JSXElement } from "solid-js";
import {cumulateDrop} from "../utils/mastery";

export class Story implements IStory {
    name: string;
    label: string;
    description: string | JSXElement;
    type: StoryType;
    encounters?: IEncounter[];
    duration?: number;
    noRepeat?: boolean;
    cooldown?: number;
    limit?: number;
    items?: IDrop[];
    skills?: ISkill[];
    options?: IOption[] | ((ctx: IStoryContext) => IOption[]);
    onComplete?: (() => void) | undefined;
    masteryType?: MasteryType | undefined;
    experience?: number | undefined;
    utilityType?: ItemUtilityType | undefined;

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
        return this.encounters.sort((a, b) => a.chance - b.chance).find(
            (enc) => {
                return rand <= enc.chance;
            }
        );
    }

    getDamage(enc: IEncounter): number | undefined {
        const { attMin, attMax } = enc.stats ?? {};
        if (!attMin || !attMax) {
            return undefined;
        }
        return attMin + Math.round(Math.random() * (attMin - attMax));
    }

    getDrops(enc: IEncounter): IItem[] | undefined {
        return this.getItems(enc?.drops)
    }

    getItems(drops: IDrop[] = this.items ?? [], masteryType?: MasteryType, exp?: number): IItem[] | undefined {
        let dropped: IDrop[] = [];
        for (let drop of drops) {
            let chance = drop.chance;
            if (masteryType && exp) {
                chance = chance + cumulateDrop(drop.name, masteryType, exp);
            }
            while (chance > 0) {
                if (Math.random() <= chance) {
                    dropped.push(drop);
                }
                chance--;
            }
        }
        return dropped?.map(
            (drop) => itemData[drop.name]
        ).filter(Boolean) as IItem[];
    }
}
