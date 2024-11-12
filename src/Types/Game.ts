import { ICard } from "../Pages/CardCreator"

export interface GameState {
    cards?: {
        black?: {
            index: number,
            seed: string[]
        },
        white?: {
            index: number,
            seed: string[]
        }
    }
}

export interface Player {
    waiting: boolean;
    score: number;
    hand: string[];
    submission: {
        [key: string]: string;
    };
};

export interface Players {
    [key: string]: Player;
}

export type GameMode = "selecting" | "judging" | undefined;

export interface Cards { black: ICard, white: ICard }