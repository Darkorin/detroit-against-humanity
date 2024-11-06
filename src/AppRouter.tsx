import { useSearchParams } from "react-router-dom";
import CardCreator from "./Pages/CardCreator";
import HomePage from "./Pages/HomePage";
import Game from "./Pages/Game";
import { useEffect } from "react";
import { getDatabase, ref, remove } from "firebase/database";

export default () => {
  const [params, setParams] = useSearchParams();
  const paramsArry = Array.from(params) || [[]];

  const database = getDatabase();

  const nickname = localStorage.getItem('nickname');

  useEffect(() => {
    window.addEventListener('beforeunload', () => {
      if (nickname) {
        const playerRef = ref(database, `game/players/${nickname}`);
        remove(playerRef);
      }
    });
    return () => {
      if (nickname) {
        const playerRef = ref(database, `game/players/${nickname}`);
        remove(playerRef);
      }
    }
  }, [])

  return (
    <>
      {paramsArry[0]?.includes('card-creator') && <CardCreator />}
      {paramsArry[0]?.includes('game') && <Game />}
      {(!paramsArry[0]?.includes('card-creator') && !paramsArry[0]?.includes('game')) && <HomePage />}
    </>
  );
};
