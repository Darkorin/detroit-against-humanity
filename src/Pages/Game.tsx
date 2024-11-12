import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Card from "../Components/Card";
import { getDatabase, onValue, ref, remove, set } from "firebase/database";
import {
  dealWhiteCards,
  getBlackCardText,
  shuffleBothPiles,
  shuffleCards,
} from "../Utils/card-helper";
import { Cards, GameState, Players } from "../Types/Game";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import DoneIcon from "@mui/icons-material/Done";
import ClearIcon from "@mui/icons-material/Clear";

export default () => {
  const database = getDatabase();
  const [players, setPlayers] = useState<Players>({});
  const [cards, setCards] = useState<Cards>({ black: {}, white: {} });
  const [isHost, setIsHost] = useState<boolean>(false);
  const [gameStateExists, setGameStateExists] = useState<boolean | undefined>(
    undefined
  );
  const [gameState, setGameState] = useState<GameState | undefined>();
  const [hand, setHand] = useState<string[] | undefined>(undefined);
  const [blackCardText, setBlackCardText] = useState<string>("");
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [waiting, setWaiting] = useState<boolean>(true);

  const playersRef = ref(database, "game/players");
  const gameStateRef = ref(database, "game/game-state");

  const nickname = localStorage.getItem("nickname");
  const playerRef = ref(database, `game/players/${nickname}`);
  const gameCardsRef = ref(database, "game/cards");

  useEffect(() => {
    onValue(playersRef, (snapshot) => {
      if (snapshot.exists()) {
        setPlayers(snapshot.val());
        if (nickname === Object.keys(snapshot.val())[0]) {
          setIsHost(true);
        } else {
          setIsHost(false);
        }
      } else {
        setIsHost(true);
      }
    });
    const cardsRef = ref(database, "cards");
    onValue(cardsRef, (snapshot) => {
      if (snapshot.exists()) {
        setCards(snapshot.val());
      }
    });
    onValue(gameStateRef, (snapshot) => {
      if (snapshot.exists()) setGameStateExists(snapshot.val());
    });
    onValue(gameCardsRef, (snapshot) => {
      if (snapshot.exists()) {
        setGameState({ ...gameState, cards: snapshot.val() });
      }
    });
  }, []);

  useEffect(() => {
    if (nickname && gameStateExists !== undefined) {
      onValue(playerRef, (snapshot) => {
        if (snapshot.exists()) {
          const hand = gameStateExists ? snapshot.val().hand : [];
          setHand(snapshot.val().hand);
          setWaiting(snapshot.val().waiting);
        } else {
          set(playerRef, {
            waiting: true,
            score: 0,
            hand: [],
          });
        }
      });
    }
  }, [gameStateExists]);

  useEffect(() => {
    getBlackCardText(setBlackCardText, gameState, cards);
  }, [gameState, cards.black, cards.white]);

  const handleNewGame = () => {
    if (gameStateExists) {
      remove(gameCardsRef);
      set(gameStateRef, false);
      setGameState(undefined);
      remove(playersRef);
    } else {
      const newGameState = shuffleBothPiles(
        cards,
        database,
        setGameState,
        gameState
      );
      set(gameStateRef, true);
      dealWhiteCards(setGameState, database, players, cards, newGameState);
    }
  };

  const submitCards = () => {
    setWaiting(false);
    const submissionRef = ref(database, `game/players/${nickname}/submission`);

    const waitingRef = ref(database, `game/players/${nickname}/waiting`);
    set(waitingRef, false);
  };

  return (
    <div className="row col-12">
      <div className="col-11">
        <h1 className="offset-md-4">
          Detroit Against Humanity
          <span className="offset-3">
            <Link to="/">Home</Link>
          </span>
        </h1>
        <Card color="black" text={blackCardText} />
        <div style={{ borderTop: "1px solid black", paddingTop: 16 }}>
          <div className="row">
            {hand && (
              <button
                className="col-1 offset-1"
                onClick={submitCards}
                disabled={!waiting}
              >
                Submit
              </button>
            )}
            {isHost && (
              <button className="col-1 offset-7" onClick={handleNewGame}>
                {gameStateExists ? "End Game" : "Start Game"}
              </button>
            )}
          </div>
          <div className="row col offset-1">
            {hand?.map((card) => (
              <Card
                color="white"
                text={cards.white[card]}
                selectable={waiting}
                onClick={() => {
                  setSelectedCards([...selectedCards, cards.white[card]]);
                }}
              />
            ))}
          </div>
        </div>
      </div>
      <div
        className="col-1"
        style={{ borderLeft: "1px solid black", minHeight: "100vh" }}
      >
        <h3>Scoreboard:</h3>
        {Object.entries(players).map((player, index) => (
          <p key={index}>
            {player[1].waiting ? (
              <AccessTimeIcon fontSize="small" color="secondary" />
            ) : (
              <DoneIcon fontSize="small" color="success" />
            )}{" "}
            {player[0]}: {players[player[0]].score}{" "}
            {isHost && (
              <ClearIcon
                fontSize="small"
                color="error"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  const playerRef = ref(database, `game/players/${player[0]}`);
                  remove(playerRef);
                }}
              />
            )}
          </p>
        ))}
      </div>
    </div>
  );
};
