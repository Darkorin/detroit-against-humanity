import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Card from "../Components/Card";
import { getDatabase, onValue, ref, remove, set } from "firebase/database";
import { dealWhiteCards, getBlackCardText, shuffleBothPiles, shuffleCards } from "../Utils/card-helper";
import { Cards, GameState, Players } from "../Types/Game";

export default () => {
    const database = getDatabase();
    const [nickname, setNickName] = useState<string>("");
    const [players, setPlayers] = useState<Players>({});
    const [cards, setCards] = useState<Cards>({ black: {}, white: {} });
    const [isHost, setIsHost] = useState<boolean>(false);
    const [gameStateExists, setGameStateExists] = useState<boolean>(true);
    const [gameState, setGameState] = useState<GameState | undefined>();
    const [hand, setHand] = useState<string[]>([]);
    const [blackCardText, setBlackCardText] = useState<string>("");
    const [selectedCards, setSelectedCards] = useState<string[]>([]);

    const playersRef = ref(database, 'game/players');

    useEffect(() => {
        const nickname = localStorage.getItem('nickname');
        nickname && setNickName(nickname);
        const playerRef = ref(database, `game/players/${nickname}`);
        onValue(playerRef, (snapshot) => {
            if (snapshot.exists()) {
                sessionStorage.setItem('score', snapshot.val().score || '0');
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
                if (nickname === Object.keys(snapshot.val())[0]) {
                    setIsHost(true);
                } else {
                    setIsHost(false)
                }
            }
        });
        const cardsRef = ref(database, "cards");
        onValue(cardsRef, (snapshot) => {
            if (snapshot.exists()) {
                setCards(snapshot.val());
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
    }, []);

    useEffect(() => {
        if (isHost && Object.keys(cards.black).length > 0 && Object.keys(cards.white).length > 0 && !gameStateExists) {
            shuffleBothPiles(cards, database, setGameState, gameState);
            setGameStateExists(true);
        }
        if (isHost && gameState?.cards) {
            dealWhiteCards(setGameState, database, players, cards, gameState);
        }
    }, [gameStateExists, cards.black, cards.white, isHost]);

    useEffect(() => {
        getBlackCardText(setBlackCardText, gameState, cards);
    }, [gameState, cards.black, cards.white]);

    return (
        <div className="row col-12">
            <div className="col-11">
                <h1 className="offset-md-4">Detroit Against Humanity<span className="offset-3"><Link to="/">Home</Link></span></h1>
                <Card color="black" text={blackCardText} />
                <div style={{ borderTop: '1px solid black', paddingTop: 16 }}>
                    {hand && <button className="col-1 offset-1">Submit</button>}
                    <div className="row col offset-1">
                        {hand?.map(card =>
                            <Card
                                color="white"
                                text={cards.white[card]}
                                selectable
                                onClick={() => {
                                    setSelectedCards([...selectedCards, cards.white[card]])
                                }}
                            />)}
                    </div>
                </div>
            </div>
            <div className="col-1" style={{ borderLeft: '1px solid black', minHeight: '100vh' }}>
                <h3>Scoreboard:</h3>
                {Object.keys(players).map((player, index) => <p key={index}>{player}: {players[player].score}</p>)}
            </div>
        </div>
    );
};
