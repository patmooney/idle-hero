import { IStory } from "../types";

const begin: IStory[] = [
    {
        name: "story_town_1",
        label: "You are in town",
        type: "dialogue",
        options: [
            { label: "Visit Farm", goto: "story_farmer_1" },
        ]
    },
    {
        name: "story_farmer_1",
        label: "A farmer approaches you...\n*Hick*\nFeel free to beat up on some scarecrows. I'll buy any hay you find!",
        type: "dialogue",
        options: [
            { label: "Fight scarecrows", goto: "story_scarecrows_1" }
        ]
    },
    {
        name: "story_scarecrows_1",
        label: "Fighting scarecrows",
        type: "encounter",
        encounters: [
            {
                name: "enc_scarecrow_1",
                label: "Scarecrow",
                health: 10
            }
        ]
    }
];

export default begin;
