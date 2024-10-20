import React from 'react';
import './App.css'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import WordListPage from './WordListPage';
import Game from './Game';

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/game" element={<Game />} />
                <Route path="/" element={<WordListPage />} />
            </Routes>
        </Router>
    );
};

export default App;
