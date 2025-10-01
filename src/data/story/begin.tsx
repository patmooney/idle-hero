import { IStory } from "../types";

const story: IStory[] = [
  {
    name: "story_town_1",
    label: "Town",
    description: "You are in town",
    type: "dialogue",
    options: [
      { label: "Visit Farm", goto: "story_farmer_1" },
      { label: "Home", goto: "story_home_1" },
    ]
  },
  {
    name: "story_farmer_1",
    label: "Farm",
    description: "A farmer approaches you...\n*Hick*\nFeel free to beat up on some scarecrows. I'll buy any hay you find!",
    type: "dialogue",
    options: [
      { label: "Fight scarecrows", goto: "story_scarecrows_1" },
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
    name: "story_scarecrows_1",
    label: "Scarecrows",
    description: "Fighting scarecrows",
    type: "encounter",
    encounters: [
      {
        name: "enc_scarecrow_1",
        label: "Scarecrow",
        health: 10,
        chance: 1,
        experience: 50,
        drops: [
          { name: "hay_1", chance: 1 },
          { name: "recipe_hay_hand_1", chance: 1 },
        ]
      }
    ]
  }
];

export default story;
