import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Card from "../Components/Card";
import {
  DatabaseReference,
  getDatabase,
  increment,
  onValue,
  ref,
  remove,
  set,
  update,
} from "firebase/database";
import {
  dealwhiteCards,
  getBlackCardText,
  shuffleBothPiles,
  shuffleCards,
} from "../Utils/card-helper";
import { Cards, GameMode, GameState, Player, Players } from "../Types/Game";
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
  const [selectedCards, setSelectedCards] = useState<{ [key: string]: string }>(
    {}
  );
  const [selectedPlayer, setSelectedPlayer] = useState<string>("");
  const [waiting, setWaiting] = useState<boolean>(true);
  const [gameMode, setGameMode] = useState<GameMode>();
  const [nextRound, setNextRound] = useState<boolean>(false);
  const [scoreSnapShot, setScoreSnapShot] = useState<Players>({});

  const playersRef = ref(database, "game/players");
  const gameStateRef = ref(database, "game/game-state");

  const nickname = localStorage.getItem("nickname");
  const playerRef = ref(database, `game/players/${nickname}`);
  const gameCardsRef = ref(database, "game/cards");
  const gameModeRef = ref(database, "game/game-mode");

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
    onValue(gameModeRef, (snapshot) => {
      if (snapshot.exists()) {
        setGameMode(snapshot.val());
      } else {
        set(gameModeRef, "selecting");
        setGameMode("selecting");
      }
    });
    onValue(gameCardsRef, (snapshot) => {
      if (snapshot.exists()) {
        setGameState({ ...gameState, cards: snapshot.val() });
      }
    });
  }, []);

  useEffect(() => {
    if (nickname && gameStateExists !== undefined) {
      getBlackCardText(setBlackCardText, database, gameState, cards);
      setScoreSnapShot(players);
      onValue(playerRef, (snapshot) => {
        if (snapshot.exists()) {
          setHand(snapshot.val().hand);
          setWaiting(snapshot.val().waiting);
        } else {
          set(playerRef, {
            waiting: true,
            score: 0,
            votes: 0,
            hand: [],
          });
        }
      });
    }
  }, [gameStateExists]);

  const handleNewGame = () => {
    if (gameStateExists) {
      remove(gameCardsRef);
      set(gameStateRef, false);
      set(gameModeRef, "selecting");
      setGameState(undefined);
      remove(playersRef);
    } else {
      const newGameState = shuffleBothPiles(
        cards,
        database,
        setGameState,
        players,
        gameState
      );
      set(gameStateRef, true);
      getBlackCardText(setBlackCardText, database, newGameState, cards);
      dealwhiteCards(setGameState, database, players, cards, newGameState);
    }
  };

  const submitCards = () => {
    setWaiting(false);
    const submissionRef = ref(database, `game/players/${nickname}/submission`);
    set(submissionRef, selectedCards);
    const waitingRef = ref(database, `game/players/${nickname}/waiting`);
    set(waitingRef, false);
  };

  useEffect(() => {
    setSelectedCards({});
    setSelectedPlayer("");
    getBlackCardText(setBlackCardText, database, gameState, cards);
    const waitingRef = ref(database, `game/players/${nickname}/waiting`);
    set(waitingRef, true);
    setScoreSnapShot({ ...players });
    if (isHost && gameMode !== "reviewing") {
      Object.entries(players).forEach((player) => {
        if (player[1].votes > 0) {
          const votesRef = ref(database, `game/players/${player[0]}/votes`);
          set(votesRef, 0);
        }
      });
    }
    if (
      isHost &&
      gameMode === "selecting" &&
      (hand?.length || 0) < parseInt(process.env.REACT_APP_HAND_SIZE || "0")
    ) {
      Object.entries(players).forEach((player) => {
        const submissionRef = ref(
          database,
          `game/players/${player[0]}/submission`
        );
        remove(submissionRef);
      });
      dealwhiteCards(setGameState, database, players, cards, gameState);
    }
  }, [gameMode]);

  useEffect(() => {
    if (isHost) {
      if (gameMode === "selecting") {
        let doneWaiting = true;
        const waitingRefArr: DatabaseReference[] = [];
        Object.entries(players).forEach((player) => {
          if (player[1].waiting) doneWaiting = false;
          waitingRefArr.push(
            ref(database, `game/players/${player[0]}/waiting`)
          );
        });
        if (doneWaiting) {
          set(gameModeRef, "judging");
          waitingRefArr.forEach((wRef) => {
            set(wRef, true);
          });
        }
      } else if (gameMode === "judging") {
        let doneWaiting = true;
        const handRefArr: DatabaseReference[] = [];
        Object.entries(players).forEach((player) => {
          if (player[1].waiting) doneWaiting = false;
          handRefArr.push(ref(database, `game/players/${player[0]}/hand`));
        });
        if (doneWaiting) {
          setNextRound(true);
          set(gameModeRef, "reviewing");
          handRefArr.forEach((hRef, index) => {
            const newHand = [...(Object.values(players)[index].hand || [])];
            nickname &&
              Object.keys(Object.values(players)[index].submission).forEach(
                (card) => {
                  const index = newHand.indexOf(card);
                  if (index >= 0) newHand.splice(index, 1);
                }
              );
            set(hRef, newHand);
          });
        }
      }
    }
  }, [players]);

  const judgingSelect = (player: [string, Player], isSelected: boolean) => {
    if (
      hand &&
      player[1].submission &&
      !hand?.includes(Object.keys(player[1].submission)[0])
    ) {
      setSelectedCards(isSelected ? {} : player[1].submission);
      setSelectedPlayer(player[0]);
    }
  };

  const judgingSubmit = () => {
    setWaiting(false);
    const scoreRef = ref(database, `game/players/${selectedPlayer}/score`);
    set(scoreRef, increment(1));
    const votesRef = ref(database, `game/players/${selectedPlayer}/votes`);
    set(votesRef, increment(1));
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
        {(gameMode === "judging" || gameMode === "reviewing") && (
          <>
            <button
              className="col-1 offset-1"
              onClick={judgingSubmit}
              disabled={!waiting || !selectedPlayer}
            >
              Select
            </button>
            {isHost && (
              <button
                className="col-1 offset-1"
                onClick={() => {
                  const cardIndexRef = ref(database, "game/cards/black/index");
                  set(cardIndexRef, increment(1));
                  set(gameModeRef, "selecting");
                }}
                disabled={!nextRound}
              >
                Next Round
              </button>
            )}
            <div className="row" style={{ margin: 16 }}>
              {Object.entries(players).map((player) => {
                const isSelected =
                  selectedCards &&
                  player[1].submission &&
                  JSON.stringify(selectedCards) ===
                    JSON.stringify(player[1].submission);
                return (
                  <div
                    key={`judging${player[0]}box`}
                    style={{
                      border: "1px solid gray",
                      width: "fit-content",
                      cursor: `${
                        player[1].submission &&
                        !hand?.includes(Object.keys(player[1].submission)[0])
                          ? "pointer"
                          : "auto"
                      }`,
                    }}
                    onClick={() => judgingSelect(player, isSelected)}
                  >
                    {gameMode === "reviewing" && (
                      <>
                        <h4>Votes: {player[1].votes}</h4>
                        <h4>Player: {player[0]}</h4>
                      </>
                    )}
                    {player[1].submission &&
                      Object.entries(player[1].submission).map((submission) => {
                        return (
                          <Card
                            key={`judging${submission[0]}card`}
                            color="white"
                            text={submission[1]}
                            cardId={submission[0]}
                            selectable={!hand?.includes(submission[0])}
                            selected={isSelected}
                          />
                        );
                      })}
                  </div>
                );
              })}
            </div>
          </>
        )}
        {gameMode === "selecting" && (
          <div style={{ borderTop: "1px solid gray", paddingTop: 16 }}>
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
                  key={`hand${card}`}
                  color="white"
                  text={cards.white[card]}
                  selectable={waiting}
                  onClick={() => {
                    setSelectedCards({
                      ...selectedCards,
                      [card]: cards.white[card],
                    });
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      <div
        className="col-1"
        style={{ borderLeft: "1px solid gray", minHeight: "100vh" }}
      >
        <h3>Scoreboard:</h3>
        {Object.entries(players).map((player) => (
          <p key={`score${player[0]}${player[1].score}`}>
            {player[1].waiting ? (
              <AccessTimeIcon fontSize="small" color="secondary" />
            ) : (
              <DoneIcon fontSize="small" color="success" />
            )}{" "}
            {player[0]}:{" "}
            {scoreSnapShot[player[0]] && scoreSnapShot[player[0]].score}{" "}
            <ClearIcon
              fontSize="small"
              color="error"
              style={{ cursor: "pointer" }}
              onClick={() => {
                const playerRef = ref(database, `game/players/${player[0]}`);
                remove(playerRef);
              }}
            />
          </p>
        ))}
      </div>
    </div>
  );
};
