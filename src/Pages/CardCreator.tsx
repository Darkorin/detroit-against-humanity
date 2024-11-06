import React, { useEffect, useState } from "react";
import Card from "../Components/Card";
import { useSelector } from "react-redux";
import { getDatabase, onValue, push, ref, set } from "firebase/database";

interface ICard {
    [key: string]: string
}

export default () => {
    const firebaseApp = useSelector((state: any) => state?.firebase?.firebaseApp);
    const database = useSelector((state: any) => state?.firebase?.database);
    const db = getDatabase(firebaseApp);

    const [blackCardState, setBlackCardState] = useState<string>("");
    const [whiteCardState, setWhiteCardState] = useState<string>("");
    const [cards, setCards] = useState<{ black: ICard, white: ICard }>({black: {}, white: {}});

    const addCard = (type: 'black' | 'white') => {
        const cardsListRef = ref(database, `cards/${type}`);
        const newCardRef = push(cardsListRef);
        set(newCardRef, type === 'black' ? blackCardState : whiteCardState);
        setBlackCardState('');
        setWhiteCardState('');
    }


    useEffect(() => {
        const cardsRef = ref(db, "cards");
        onValue(cardsRef, (snapshot) => {
            if (snapshot.exists()) {
                setCards(snapshot.val());
            } else {
                console.log("No data available");
            }
        });
    }, []);

    return (
        <div>
            <h1>Create Your Cards Here!</h1>
            <div className="row offset-4">
                <Card color="black" text="Enter Text Below" />
                <Card color="white" text="Enter Text Below" />
            </div>
            <div className="row offset-4">
                <textarea style={{ width: '14vw', margin: 16, resize: 'none' }} value={blackCardState} onChange={(e) => setBlackCardState(e.target?.value)} />
                <textarea style={{ width: '14vw', margin: 16, resize: 'none' }} value={whiteCardState} onChange={(e) => setWhiteCardState(e.target?.value)} />
            </div>
            <div className="row offset-4">
                <button style={{ width: '14vw', margin: 16 }} onClick={() => addCard('black')}>add card</button>
                <button style={{ width: '14vw', margin: 16 }} onClick={() => addCard('white')}>add card</button>
            </div>
            <div className="row">
                {Object.values(cards.black).map(card => <Card color="black" text={card}/>)}
                {Object.values(cards.white).map(card => <Card color="white" text={card}/>)}
            </div>
        </div>
    );
};
