import type { IGameState } from "../data/types";

import { MIN_STASH } from "../utils/constants";

export class GameState implements IGameState {
    // Will check this on item drop, anything listed will not be added to bag
    prohibitedItems: string[];
    furniture: string[];
    stash: ({ name: string, stack: number } | null)[];

    constructor (state: Partial<IGameState>) {
        this.prohibitedItems = [];
        this.furniture = [];
        this.stash = new Array(MIN_STASH).fill(null)
        Object.assign(this, state);
    }
};
