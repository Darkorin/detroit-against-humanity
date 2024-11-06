import React, { useEffect, useState } from "react";
import Card from "../Components/Card";
import { useSelector } from "react-redux";
import { onValue, push, ref, remove, set } from "firebase/database";

interface ICard {
    [key: string]: string
}

export default () => {
    const database = useSelector((state: any) => state?.firebase?.database);

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
        const cardsRef = ref(database, "cards");
        onValue(cardsRef, (snapshot) => {
            if (snapshot.exists()) {
                setCards(snapshot.val());
            } else {
                console.log("No data available");
            }
        });
    }, []);

    const handleDelete = (type: 'black' | 'white', index: number) => {
        const cardKey = Object.keys(cards[type])[index];
        const cardsListRef = ref(database, `cards/${type}/${cardKey}`);
        remove(cardsListRef)
    };

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
                {Object.values(cards.black).map((card, index) => <Card color="black" text={card} deleteBtn handleDelete={() => handleDelete('black', index)}/>)}
                {Object.values(cards.white).map((card, index) => <Card color="white" text={card} deleteBtn handleDelete={() => handleDelete('white', index)} />)}
            </div>
        </div>
    );
};
