import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Card from "../Components/Card";
import { getDatabase, onValue, ref, remove, set } from "firebase/database";
import { ICard } from "./CardCreator";

interface Players {
    [key: string]: {
        score: number
        hand: string[];
    };
}

interface GameState {
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

export default () => {
    const database = getDatabase();
    const [nickname, setNickName] = useState<string>("");
    const [players, setPlayers] = useState<Players>({});
    const [cards, setCards] = useState<{ black: ICard, white: ICard }>({ black: {}, white: {} });
    const [isHost, setIsHost] = useState<boolean>(false);
    const [gameStateExists, setGameStateExists] = useState<boolean>(true);
    const [gameState, setGameState] = useState<GameState | undefined>();
    const [hand, setHand] = useState<string[]>([]);

    const playersRef = ref(database, 'game/players');

    useEffect(() => {
        const nickname = localStorage.getItem('nickname');
        nickname && setNickName(nickname);
        const playerRef = ref(database, `game/players/${nickname}`);
        onValue(playerRef, (snapshot) => {
            if (snapshot.exists()) {
                sessionStorage.setItem('score', snapshot.val().score);
                sessionStorage.setItem('hand', JSON.stringify(snapshot.val().hand) || '[]');
                setHand(snapshot.val().hand);
            } else {
                const score = sessionStorage.getItem('score');
                const hand = sessionStorage.getItem('hand');
                set(playerRef, { 
                    score: score ? parseInt(score) : 0, 
                    hand: hand ? JSON.parse(hand) : [] 
                });
            }
        });
        onValue(playersRef, (snapshot) => {
            if (snapshot.exists()) {
                setPlayers(snapshot.val());
                if (nickname === Object.keys(snapshot.val())[0]) setIsHost(true);
            }
        });
        let gameCardsRef = ref(database, "game/cards");
        onValue(gameCardsRef, (snapshot) => {
            if (snapshot.exists()) {
                setGameStateExists(true);
                setGameState({ ...gameState, cards: snapshot.val() });
            } else {
                setGameStateExists(false);
            }
        });
        window.addEventListener('beforeunload', () => {
            remove(playerRef);
        });
        return () => {
            remove(playerRef);
            setIsHost(false);
        }
    }, []);

    const shuffleCards = (color: 'black' | 'white') => {
        let shuffled = Object.keys(cards[color])
            .map(value => ({ value, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ value }) => value);
        const gameCardRef = ref(database, `game/cards/${color}`);
        set(gameCardRef, { seed: shuffled, index: 0 });
        setGameState({
            ...gameState,
            cards: {
                ...gameState?.cards,
                [color]: {
                    seed: shuffled,
                    index: 0
                }
            }
        });
    }

    const dealWhiteCards = () => {
        let cardIndex = gameState?.cards?.white?.index || 0;
        Object.values(players).forEach((player, index) => {
            const playerHandRef = ref(database, `game/players/${Object.keys(players)[index]}/hand`);
            if(cardIndex+5 > (gameState?.cards?.white?.seed?.length || 0)) {
                shuffleCards('white');
                cardIndex = 0;
            };
            set(playerHandRef, gameState?.cards?.white?.seed?.slice(cardIndex, cardIndex + 5) || []);
            cardIndex = cardIndex + 6;
        });
    }

    useEffect(() => {
        if (isHost) {
            const cardsRef = ref(database, "cards");
            onValue(cardsRef, (snapshot) => {
                if (snapshot.exists()) {
                    setCards(snapshot.val());
                }
            });
        }
    }, [isHost]);

    useEffect(() => {
        if (isHost && cards.black && cards.white && !gameStateExists) {
            shuffleCards('black');
            shuffleCards('white');
            dealWhiteCards();
            setGameStateExists(true);
        }
    }, [gameStateExists, cards.black, cards.white]);

    const getBlackCardText = () => {
        const cardIndex = gameState?.cards?.black?.index || 0;
        const cardSeed = gameState?.cards?.black?.seed;
        if (cardSeed) {
            return cards?.black[cardSeed[cardIndex]];
        } else return "";
    }

    return (
        <div className="row col-12">
            <div className="col-11">
                <h1 className="offset-md-4">Detroit Against Humanity<span className="offset-3"><Link to="/">Home</Link></span></h1>
                <Card color="black" text={getBlackCardText()} />
                <div className="row col offset-1">
                    {hand?.map(card => <Card color="white" text={cards.white[card]} />)}
                </div>
            </div>
            <div className="col-1" style={{ borderLeft: '1px solid black', minHeight: '100vh' }}>
                <h3>Scoreboard:</h3>
                {Object.keys(players).map((player, index) => <p key={index}>{player}: {players[player].score}</p>)}
            </div>
        </div>
    );
};
