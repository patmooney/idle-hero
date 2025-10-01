import { IEncounter, IItem, IOption, ISkill, IStory, StoryType } from "../data/types";
import itemData from "../data/item";

export class Story implements IStory {
  name: string;
  label: string;
  type: StoryType;
  encounters?: IEncounter[];
  duration?: number;
  cooldown?: number;
  items?: IItem[];
  skills?: ISkill[];
  options?: IOption[];

  constructor(story: IStory) {
    this.label = story.label;
    this.type = story.type;
    this.name = story.name;
    Object.assign(this, story);
  }

  getEncounter(): IEncounter | undefined {
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
    const drops = enc.drops?.filter(
      (drop) => {
        return Math.random() <= drop.chance;
      }
    );
    return drops?.map(
      (drop) => itemData[drop.name]
    ).filter(Boolean) as IItem[];
  }
}
