import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
var Hypher = require('hypher'),
    english = require('hyphenation.en-us'),
    h = new Hypher(english);

    const getWordsFromStorage = () => {
        const activeWordList = localStorage.getItem('activeWordList');
        const wordLists = localStorage.getItem('wordLists');
        if (activeWordList && wordLists) {
            const parsedWordLists = JSON.parse(wordLists);
            return parsedWordLists[activeWordList] || ["birthday", "afternoon", "teacher"];
        }
        return ["birthday", "afternoon", "teacher"];
    };
    


const getMaskedWordAndChoices = (word) => {
    const chunks = h.hyphenate(word);
    let maskedWord = '';
    let choices = [];
    chunks.forEach(chunk => {
        const index = Math.floor(Math.random() * chunk.length);
        maskedWord += chunk.substr(0, index) + '_' + chunk.substr(index + 1) + '-';
        choices.push(chunk[index]);
    });
    // maskedWord is sliced to remove trailing hyphen for neatness
    maskedWord = maskedWord.slice(0, -1);
    let maskedWordToDisplay = maskedWord.replace(/_/g, '<span class="highlight">_</span>');
    const alphabets = 'abcdefghijklmnopqrstuvwxyz';
    while (choices.length < chunks.length + 2) {
        const randomLetter = alphabets[Math.floor(Math.random() * alphabets.length)];
        if (!choices.includes(randomLetter)) {
            choices.push(randomLetter);
        }
    }
    choices = choices.sort(() => Math.random() - 0.5);
    return { maskedWord, choices, maskedWordToDisplay };
}

const Game = () => {
    const words = getWordsFromStorage();
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [currentWord, setCurrentWord] = useState(words[0]);
    const [maskedWordData, setMaskedWordData] = useState(getMaskedWordAndChoices(words[0]));
    const [selectedLetters, setSelectedLetters] = useState([]);
    const [feedback, setFeedback] = useState('');
    const [showCorrectWord, setShowCorrectWord] = useState(false);
    const [wordClass, setWordClass] = useState('masked-word');
    const [shake, setShake] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        setCurrentWord(words[currentWordIndex]);
        setMaskedWordData(getMaskedWordAndChoices(words[currentWordIndex]));
        setSelectedLetters([]);
        setFeedback('');
    }, [currentWordIndex]);

    const handleChoiceClick = (letter, index) => {
        const updatedSelectedLetters = [...selectedLetters];
        if (updatedSelectedLetters[index] === letter) {
            updatedSelectedLetters[index] = null;
        } else {
            updatedSelectedLetters[index] = letter;
        }
        setSelectedLetters(updatedSelectedLetters);
    };

    const checkGuess = () => {
        const maskedParts = maskedWordData.maskedWord.split('-');
        const underscoresCount = maskedParts.reduce((count, part) => count + (part.match(/_/g) || []).length, 0);
        const validSelectedLetters = selectedLetters.filter(letter => letter !== null && letter !== undefined);
        if (validSelectedLetters.length !== underscoresCount) {
            setFeedback('Please select the correct number of letters.');
            return;
        }
        const allPermutations = getAllPermutations(validSelectedLetters);
        for (const permutation of allPermutations) {
            let reconstructedWord = '';
            let selectionIndex = 0;
            maskedParts.forEach(chunk => {
                let updatedChunk = chunk;
                for (let i = 0; i < chunk.length; i++) {
                    if (chunk[i] === '_') {
                        updatedChunk = updatedChunk.substr(0, i) + permutation[selectionIndex] + updatedChunk.substr(i + 1);
                        selectionIndex++;
                    }
                }
                reconstructedWord += updatedChunk + '-';
            });
            reconstructedWord = reconstructedWord.slice(0, -1);
            if (reconstructedWord === h.hyphenate(currentWord).join('-')) {
                setShowCorrectWord(true);
                setWordClass('masked-word correct');
                setTimeout(() => {
                    setFeedback('Correct!');
                    setShowCorrectWord(false);
                    setWordClass('masked-word');
                    if (currentWordIndex < words.length - 1) {
                        setCurrentWordIndex(currentWordIndex + 1);
                    } else {
                        setFeedback('You’ve completed all the words! Great job!');
                    }
                }, 1500);
                return;
            }
        }
        setFeedback('Try again.');
        setShake(true);
        setTimeout(() => setShake(false), 500);
    };

    const getAllPermutations = (arr) => {
        if (arr.length <= 1) {
            return [arr];
        }
        let permutations = [];
        for (let i = 0; i < arr.length; i++) {
            let remaining = arr.slice(0, i).concat(arr.slice(i + 1));
            let remainingPermutations = getAllPermutations(remaining);
            for (let j = 0; j < remainingPermutations.length; j++) {
                permutations.push([arr[i]].concat(remainingPermutations[j]));
            }
        }
        return permutations;
    };

    const pronounceWord = () => {
        const utterance = new SpeechSynthesisUtterance(currentWord);
        utterance.rate = 0.8; // Slower speech rate (1 is normal, <1 is slower)
        const voices = speechSynthesis.getVoices();
        const femaleVoice = voices.find(voice => voice.name === 'Google UK English Female') || voices.find(voice => voice.gender === 'female');
        if (femaleVoice) {
            utterance.voice = femaleVoice;
        }
        speechSynthesis.speak(utterance);
    };

    return (
        <div className="container">
            <h1 className="game-title">Spelling Game</h1>
            <p>
            <span className={`${wordClass} ${shake ? 'shake incorrect' : ''}`} dangerouslySetInnerHTML={{ __html: showCorrectWord ? currentWord : maskedWordData.maskedWordToDisplay }}></span>
                <button onClick={pronounceWord} className="speak-button">
                    Speak
                </button>
            </p>
            <div className="button-group">
                {maskedWordData.choices.map((choice, index) => (
                    <button key={index}
                        className={`choice-button ${selectedLetters[index] ? 'selected' : ''}`}
                        onClick={() => handleChoiceClick(choice, index)}>
                        {choice}
                    </button>
                ))}
            </div>
            <div>
                <button onClick={checkGuess} className="submit-button">Submit</button>
            </div>
            <p className="feedback">{feedback}</p>
            <button onClick={() => navigate('/wordList')} className="word-list-button">Set Word List</button>
        </div>
    );
}

export default Game;
