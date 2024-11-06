import { DeleteButtonIcon } from './Assets/delete-button';

interface CardProps {
    color: 'black' | 'white',
    text: string;
    size?: 'small' | 'medium' | 'large'
    deleteBtn?: boolean;
    handleDelete?: Function;
}

export default (props: CardProps) => {
    const oppositeColor = props.color === 'black' ? 'white' : 'black';
    return (
        <div style={{
            width: '14vw',
            height: '15vw',
            backgroundColor: props.color,
            border: '1px solid black',
            borderRadius: '15px',
            margin: 16,
            color: oppositeColor,
            padding: 20
        }}>
            {props.deleteBtn &&
                <div className="offset-11" onClick={() => props.handleDelete && props.handleDelete()}>
                    <DeleteButtonIcon color={oppositeColor} />
                </div>}
            <h4>{props.text}</h4>
        </div>
    );
};
