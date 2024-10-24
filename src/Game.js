import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavigationButton from './NavigationButton';

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
            <h1 className="game-title">Spelling Game
                <NavigationButton to="/wordList" icon={<path d="M112 0C99.1 0 87.4 7.8 82.5 19.7l-66.7 160-13.3 32c-6.8 16.3 .9 35 17.2 41.8s35-.9 41.8-17.2L66.7 224l90.7 0 5.1 12.3c6.8 16.3 25.5 24 41.8 17.2s24-25.5 17.2-41.8l-13.3-32-66.7-160C136.6 7.8 124.9 0 112 0zm18.7 160l-37.3 0L112 115.2 130.7 160zM256 32l0 96 0 96c0 17.7 14.3 32 32 32l80 0c44.2 0 80-35.8 80-80c0-23.1-9.8-43.8-25.4-58.4c6-11.2 9.4-24 9.4-37.6c0-44.2-35.8-80-80-80L288 0c-17.7 0-32 14.3-32 32zm96 64l-32 0 0-32 32 0c8.8 0 16 7.2 16 16s-7.2 16-16 16zm-32 64l32 0 16 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-48 0 0-32zM566.6 310.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L352 434.7l-73.4-73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l96 96c12.5 12.5 32.8 12.5 45.3 0l192-192z" />} /></h1>
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
            
        </div>
    );
}

export default Game;
