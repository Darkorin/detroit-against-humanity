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

export interface Players {
    [key: string]: {
        waiting: boolean;
        score: number;
        hand: string[];
    };
}

export interface Cards { black: ICard, white: ICard }