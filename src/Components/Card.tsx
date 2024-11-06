import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

interface CardProps {
    color: 'black' | 'white',
    text: string;
    size?: 'small' | 'medium' | 'large'
}

export default (props: CardProps) => {
    return (
        <div style={{
            width: '14vw',
            height: '15vw',
            backgroundColor: props.color, 
            border: '1px solid black', 
            borderRadius: '15px', 
            margin: 16, 
            color: props.color === 'black' ? 'white' : 'black', 
            padding: 20
        }}>
            <h4>{props.text}</h4>
        </div>
    );
};
