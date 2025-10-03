import { IStory } from "../types";
import {Speech} from "./format";

const story: IStory[] = [
  {
    name: "story_town_1",
    label: "Town",
    description: "You are in town",
    type: "dialogue",
    options: [
      { label: "Visit Farm", goto: "story_farmer_1" },
      { label: "Leave the town", goto: "story_forest_1" },
      { label: "Merchants", goto: "story_town_merchants_1" },
      { label: "Home", goto: "story_home_1" },
    ]
  },
  {
    name: "story_farmer_1",
    label: "Farm",
    description: `A vacant expressionless farmer. Hasn't washed in days.`,
    type: "dialogue",
    options: [
      { label: "Approach the farmer", goto: "story_farmer_2" },
      { label: <span class="text-red-500">Fight scarecrows</span>, goto: "story_scarecrows_1" },
      {
        label: "Sell Hay",
        action: (ctx) => {
          const invent = ctx.player.invent;
          const { removeInventory, onAddStat } = ctx;
          const count = invent.filter((inv) => inv?.name === "hay_1").reduce<number>((acc, inv) => acc + (inv?.stack ?? 0), 0);
          if (!count) {
            return;
          }
          removeInventory("hay_1", count);
          onAddStat("gold", count);
          ctx.onLog(
            <>
              You sell<span class="font-bold ml-1">{/*@once*/count}</span> <span class="font-bold text-blue-500 mr-1">Hay</span>
              For <span class="font-bold">{/*@once*/count}</span> gold
            </>,
            "meta"
          );
        }
      }
    ]
  },
  {
    name: "story_farmer_2",
    label: "Farmer",
    description: <>
      You approach, he holds your wrist loosely like an exhausted child.
      <Speech lines={[`Loathsome shadowed cloaks`, `Golden light shimmering, blind eyes`, `Fear, is Death knocking?`]} />
      He sits and cries.
    </>,
    type: "dialogue",
    options: [
      { label: "Console", goto: "story_farmer_3" },
      { label: "Leave", goto: "_back" }
    ]
  },
  {
    name: "story_farmer_3",
    label: "Farmer",
    description: <Speech lines={[`Am *I* the keeper of the wheat?`, `... or is it the keeper of me?`]} />,

    type: "dialogue",
    options: [
      { label: "Silently leave", goto: "_back.2" }
    ]
  },
  {
    name: "story_scarecrows_1",
    label: "Scarecrows",
    description: "Fighting scarecrows",
    type: "encounter",
    cooldown: 20,
    encounters: [
      {
        name: "enc_scarecrow_1",
        label: "Scarecrow",
        health: 10,
        chance: 1,
        experience: 50,
        drops: [
          { name: "hay_1", chance: 1 },
          { name: "recipe_hay_hand_1", chance: 0.05 },
          { name: "recipe_hay_head_1", chance: 0.05 },
          { name: "recipe_hay_chest_1", chance: 0.05 },
        ]
      }
    ]
  }
];

export default story;
