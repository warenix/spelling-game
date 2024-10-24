import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const WordListPage = () => {
    const [wordListName, setWordListName] = useState('');
    const [wordList, setWordList] = useState('');
    const [wordLists, setWordLists] = useState({});
    const [editingListName, setEditingListName] = useState('');
    const [shareLink, setShareLink] = useState('');
    const [importLink, setImportLink] = useState('');
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

    const handleGenerateShareLink = (listName) => {
        const words = wordLists[listName].join(',');
        const link = `${window.location.origin}/import?wordList=${encodeURIComponent(words)}`;
        setShareLink(link);
    };

    const handleImportWordList = () => {
        const urlParams = new URLSearchParams(new URL(importLink).search);
        const importedWordList = urlParams.get('wordList');
        if (importedWordList) {
            setWordList(importedWordList);
            setWordListName('Imported List');
        }
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
            {shareLink && (
                <div>
                    <p>Share this link to import the word list:</p>
                    <input type="text" value={shareLink} readOnly className="share-link-input" />
                    <button onClick={() => navigator.clipboard.writeText(shareLink)} className="start-button">Copy Link</button>
                </div>
            )}
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
                        <button
                            onClick={() => handleGenerateShareLink(listName)}
                            className="share-word-list-button"
                        >
                            Share
                        </button>
                    </div>
                ))}
            </div>
            <div>
                <h2>Import Word List</h2>
                <input
                    type="text"
                    value={importLink}
                    onChange={(e) => setImportLink(e.target.value)}
                    placeholder="Enter share link"
                    className="share-link-input"
                />
                <button onClick={handleImportWordList} className="start-button">Import</button>
            </div>
        </div>
    );
};

export default WordListPage;
