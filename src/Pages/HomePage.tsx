import { getDatabase, ref, set } from "firebase/database";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default () => {
    const [nickname, setNickName] = useState<string>("");
    const navigate = useNavigate();

    useEffect(() => {
        const nickname = localStorage.getItem('nickname');
        nickname && setNickName(nickname);
    }, []);

    const playGame = () => {
        localStorage.setItem('nickname', nickname);
        navigate('?game')
    }

    return (
        <div className="row offset-4">
            <h1>Detroit Against Humanity</h1>
            <Link to="?card-creator" style={{marginTop: 16, marginBottom: 20}}>Create Cards</Link>
            <div style={{width: '5vw', margin: 16, marginBottom: 8, marginLeft: 0}}>
                Nickname: <input type="text" value={nickname} onChange={(e) => setNickName(e.target.value)}/>
                <button disabled={!nickname} onClick={() => playGame()}>Play Game</button>
            </div>
        </div>
    );
};
