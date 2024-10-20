import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const WordListPage = () => {
    const [wordList, setWordList] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const storedWordList = localStorage.getItem('wordList');
        if (storedWordList) {
            setWordList(JSON.parse(storedWordList).join(', '));
        }
    }, []);

    const handleStartGame = () => {
        const words = wordList.split(',').map(word => word.trim());
        localStorage.setItem('wordList', JSON.stringify(words));
        navigate('/');
    };

    return (
        <div className="container">
            <h1 className="page-title">Set Word List</h1>
            <textarea
                value={wordList}
                onChange={(e) => setWordList(e.target.value)}
                placeholder="Enter words separated by commas (e.g., apple, banana, grape)"
                className="word-input"
            />
            <button onClick={handleStartGame} className="start-button">Start Game</button>
        </div>
    );
};

export default WordListPage;
