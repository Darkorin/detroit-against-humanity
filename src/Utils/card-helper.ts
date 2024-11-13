import { Database, increment, ref, set } from "firebase/database";
import { ICard } from "../Pages/CardCreator";
import { Cards, GameState, Players } from "../Types/Game";

export const shuffleCards = (
  color: "black" | "white",
  cards: Cards,
  database: Database,
  players: Players
) => {
  if (Object.keys(cards[color]).length > 0) {
    let shuffled = Object.keys(cards[color])
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
    if (color === "white") {
      shuffled.filter((card) => {
        let matchFound = false;
        Object.entries(players).forEach((player) => {
          if (player[1]?.hand?.includes(card)) matchFound = true;
        });
        return !matchFound;
      });
    }
    const gameCardRef = ref(database, `game/cards/${color}`);
    set(gameCardRef, { seed: shuffled, index: 0 });
    return shuffled;
  }
};

export const shuffleBothPiles = (
  cards: Cards,
  database: Database,
  setState: Function,
  players: Players,
  gameState?: GameState
) => {
  const shuffledBlack = shuffleCards("black", cards, database, players) || [];
  const shuffledwhite = shuffleCards("white", cards, database, players) || [];
  const newGameState = {
    ...gameState,
    cards: {
      black: {
        index: 0,
        seed: shuffledBlack,
      },
      white: {
        index: 0,
        seed: shuffledwhite,
      },
    },
  };
  setState(newGameState);
  return newGameState;
};

export const getBlackCardText = (
  setText: Function,
  database: Database,
  gameState?: GameState,
  cards?: Cards
) => {
  const cardIndexRef = ref(database, "game/cards/black/index");
  const cardIndex = gameState?.cards?.black?.index || 0;
  const cardSeed = gameState?.cards?.black?.seed;
  if (cardSeed) {
    setText(cards?.black[cardSeed[cardIndex]]);
    set(cardIndexRef, increment(1));
  } else setText("");
};

export const dealwhiteCards = (
  setState: Function,
  database: Database,
  players: Players,
  cards: Cards,
  gameState?: GameState
) => {
  const handSize = parseInt(process.env.REACT_APP_HAND_SIZE || "0");
  let cardIndex = gameState?.cards?.white?.index || 0;
  Object.entries(players).forEach((player) => {
    const playerHandRef = ref(database, `game/players/${player[0]}/hand`);
    const numToDraw = handSize - (player[1]?.hand?.length || 0);

    if (cardIndex + numToDraw > (gameState?.cards?.white?.seed?.length || 0)) {
      const shuffledwhite =
        shuffleCards("white", cards, database, players) || [];
      setState({
        ...gameState,
        cards: {
          ...gameState?.cards,
          white: {
            index: 0,
            seed: shuffledwhite,
          },
        },
      });
      cardIndex = 0;
    }
    set(playerHandRef, [
      ...(players[player[0]]?.hand || []),
      ...(gameState?.cards?.white?.seed?.slice(
        cardIndex,
        cardIndex + numToDraw
      ) || []),
    ]);
    const cardIndexRef = ref(database, "game/cards/white/index");
    cardIndex = cardIndex + numToDraw;
    set(cardIndexRef, cardIndex);
  });
};
