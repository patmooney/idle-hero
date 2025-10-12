import { IStory } from "../types";
import { Speech } from "./format";

import itemData from "../item";
import {generateStory} from "./generated";

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
      { label: "Generated", action: (_1, _2, _3, storyCtx) => storyCtx.onStory(generateStory(0)) }
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
        action: (gameCtx, inventCtx, playerCtx) => {
          if (!inventCtx) {
            return;
          }
          const invent = inventCtx.inventory();
          const count = invent.filter((inv) => inv?.name === "hay_1").reduce<number>((acc, inv) => acc + (inv?.count ?? 0), 0);
          if (!count) {
            return;
          }
          inventCtx.removeInventory("hay_1", count);
          playerCtx?.onAddStat("gold", count);
          gameCtx?.onLog(
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
    options: (gameCtx, inventCtx) => {
      const cost = 200;
      const showGift = !gameCtx.state.markers.includes("story_farmer_gift_1");
      const isDisabled = inventCtx.inventory().reduce<number>((acc, i) => i?.name === "hay_1" ? acc + i?.count : acc, 0) < cost;
      const action = () => {
        const [kabab, campf] = ["recipe_worm_kabab_1", "recipe_camp_fire_1"].map((r) => itemData[r]);
        if (inventCtx.removeInventory("hay_1", cost) === cost) {
          inventCtx.addInventory("recipe_worm_kabab_1", 1);
          inventCtx.addInventory("recipe_camp_fire_1");
          gameCtx.setState("markers", [...gameCtx.state.markers, "story_farmer_gift_1"]);
          gameCtx.onLog(
            <>
              The farmer reciprocates:
              <span class="font-bold m-1">{/*@once*/kabab?.label}, {/*@once*/campf?.label}</span>
            </>, "drop"
          );

        }
      };
      return [
        ...(showGift ? [{ label: "A gift... (200 Hay)", action, isDisabled }] : []),
        { label: "Silently leave", goto: "_back.2" }
      ];
    }
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
        experience: 10,
        drops: [
          { name: "hay_1", chance: 0.5 },
          { name: "food_worm_1", chance: 1 },
          { name: "recipe_hay_hand_1", chance: 0.05 },
          { name: "recipe_hay_head_1", chance: 0.05 },
          { name: "recipe_hay_chest_1", chance: 0.05 },
        ]
      }
    ]
  }
];

export default story;
