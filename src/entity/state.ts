import type { IGameState } from "../data/types";

export class GameState implements IGameState {
    // Will check this on item drop, anything listed will not be added to bag
    prohibitedItems: string[];
    furniture: string[];

    constructor (state: Partial<IGameState>) {
        this.prohibitedItems = [];
        this.furniture = [];
        Object.assign(this, state);
    }
};
