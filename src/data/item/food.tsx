import type { IItem } from "../types";

const food: (IItem & { hp: number })[] = [
  {
    name: "food_acorn_1",
    label: "Raw acorn (+2hp)",
    useVerb: "Eat",
    maxStack: 10,
    hp: 2
  },
  {
    name: "food_worm_1",
    label: "Raw worm (+1hp)",
    useVerb: "Eat",
    maxStack: 10,
    hp: 1
  }
].map((f) => ({
    ...f,
    category: "food",
    use: (_, inventCtx, playerCtx) => {
      const h = playerCtx.player.stats.health;
      const mH = playerCtx.player.stats.maxHealth ?? 10;
      const toAdd = Math.min(f.hp, mH - h);
      if (h < mH) {
        console.log(`use food - add hp: ${toAdd} to ${Math.min(h + f.hp, mH)}`);
        playerCtx.onAddStat("health", toAdd);
        inventCtx.removeInventory(f.name, 1);
        return true;
      }
      return false;
    }
}));

export default food;
