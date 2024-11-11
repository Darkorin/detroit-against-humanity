import { useState } from 'react';
import { DeleteButtonIcon } from './Assets/delete-button';

interface CardProps {
    color: 'black' | 'white',
    text: string;
    size?: 'small' | 'medium' | 'large'
    deleteBtn?: boolean;
    handleDelete?: Function;
    selectable?: boolean;
    onClick?: Function;
}

export default (props: CardProps) => {
    const oppositeColor = props.color === 'black' ? 'white' : 'black';
    const [selected, setSelected] = useState<boolean>(false);

    const handleClick = () =>{
        if (props.selectable) {
            setSelected(!selected);
        }
        if (props.onClick) props.onClick();
    }

    return (
        <div style={{
            minWidth: 300,
            width: '14vw',
            height: '15vw',
            minHeight: 200,
            backgroundColor: selected ? 'lightblue' : props.color,
            border: '1px solid black',
            borderRadius: '15px',
            margin: 16,
            color: oppositeColor,
            padding: 20,
            cursor: props.selectable ? 'pointer' : 'auto'
        }}
        onClick={handleClick}
        >
            {props.deleteBtn &&
                <div className="offset-11" onClick={() => props.handleDelete && props.handleDelete()}>
                    <DeleteButtonIcon color={oppositeColor} />
                </div>}
            <h4>{props.text}</h4>
        </div>
    );
};
