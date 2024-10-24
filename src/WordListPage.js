import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const WordListPage = () => {
    const [wordListName, setWordListName] = useState('');
    const [wordList, setWordList] = useState('');
    const [wordLists, setWordLists] = useState({});
    const [editingListName, setEditingListName] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const storedWordLists = localStorage.getItem('wordLists');
        if (storedWordLists) {
            setWordLists(JSON.parse(storedWordLists));
        }
    }, []);

    const handleSaveWordList = () => {
        const newWordLists = { ...wordLists, [wordListName]: wordList.split(',').map(word => word.trim()) };
        localStorage.setItem('wordLists', JSON.stringify(newWordLists));
        setWordLists(newWordLists);
        setWordListName('');
        setWordList('');
        setEditingListName('');
    };

    const handleEditWordList = (listName) => {
        setWordListName(listName);
        setWordList(wordLists[listName].join(', '));
        setEditingListName(listName);
    };

    const handleSetActiveWordList = (listName) => {
        localStorage.setItem('activeWordList', listName);
        navigate('/');
    };

    return (
        <div className="container">
            <h1 className="page-title">Set Word Lists</h1>
            <input
                type="text"
                value={wordListName}
                onChange={(e) => setWordListName(e.target.value)}
                placeholder="Enter word list name"
                className="word-list-name"
                disabled={!!editingListName}
            />
            <textarea
                value={wordList}
                onChange={(e) => setWordList(e.target.value)}
                placeholder="Enter words separated by commas (e.g., apple, banana, grape)"
                className="word-input"
            />
            <button onClick={handleSaveWordList} className="start-button">
                {editingListName ? 'Save Changes' : 'Save Word List'}
            </button>
            <h2>Choose Active Word List</h2>
            <div className="word-lists">
                {Object.keys(wordLists).map(listName => (
                    <div key={listName} className="word-list-item">
                        <button
                            onClick={() => handleSetActiveWordList(listName)}
                            className="word-list-button"
                        >
                            {listName}
                        </button>
                        <button
                            onClick={() => handleEditWordList(listName)}
                            className="edit-word-list-button"
                        >
                            Edit
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WordListPage;
