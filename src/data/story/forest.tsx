import {IStoryContext} from "../../provider/story";
import { IOption, IStory } from "../types";

const forest: IStory[] = [
  {
    type: "dialogue",
    name: "story_forest_1",
    label: "Forest border",
    description: "The canopy casts a shadow. Sounds, eyes ... movement",
    options: (ctx: IStoryContext): IOption[] => {
      const hasAxe = !!ctx.player.equipment.find((eq) => eq.equipSlot === "weapon" && eq.utilityType === "axe");
      return [
        { label: "Chop wood", goto: "task_chop_wood_1", isDisabled: !hasAxe }
      ];
    }
  },
  {
    type: "task",
    name: "task_chop_wood_1",
    label: "Surrounded by trees",
    description: "Chopping wood",
    duration: 100,
    items: [{ name: "wood_log_1", chance: 1 }]
  }
];

export default forest;
