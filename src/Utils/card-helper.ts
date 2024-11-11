import { Database, ref, set } from "firebase/database";
import { ICard } from "../Pages/CardCreator";
import { Cards, GameState, Players } from "../Types/Game";

export const shuffleCards = (color: 'black' | 'white', cards: Cards, database: Database) => {
    if (Object.keys(cards[color]).length > 0) {
        let shuffled = Object.keys(cards[color])
            .map(value => ({ value, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ value }) => value);
        const gameCardRef = ref(database, `game/cards/${color}`);
        set(gameCardRef, { seed: shuffled, index: 0 });
        return shuffled;
    }
}

export const shuffleBothPiles = (cards: Cards, database: Database, setState: Function, gameState?: GameState) => {
    const shuffledBlack = shuffleCards('black', cards, database) || [];
    const shuffledWhite = shuffleCards('white', cards, database) || [];
    setState({
        ...gameState,
        cards: {
            black: {
                index: 0,
                seed: shuffledBlack
            },
            white: {
                index: 0,
                seed: shuffledWhite
            }
        }
    })
}

export const getBlackCardText = (setText: Function, gameState?: GameState, cards?: Cards) => {
    const cardIndex = gameState?.cards?.black?.index || 0;
    const cardSeed = gameState?.cards?.black?.seed;
    if (cardSeed) {
        setText(cards?.black[cardSeed[cardIndex]]);
    } else setText("");
}


export const dealWhiteCards = (setState: Function, database: Database, players: Players, cards: Cards, gameState?: GameState) => {
    let cardIndex = gameState?.cards?.white?.index || 0;
    Object.values(players).forEach((player, index) => {
        const playerHandRef = ref(database, `game/players/${Object.keys(players)[index]}/hand`);
        if (cardIndex + 5 > (gameState?.cards?.white?.seed?.length || 0)) {
            const shuffledWhite = shuffleCards('white', cards, database) || [];
            setState({
                ...gameState,
                cards: {
                    ...gameState?.cards,
                    white: {
                        index: 0,
                        seed: shuffledWhite
                    }
                }
            })
            cardIndex = 0;
        };
        set(playerHandRef, gameState?.cards?.white?.seed?.slice(cardIndex, cardIndex + 5) || []);
        cardIndex = cardIndex + 6;
    });
}