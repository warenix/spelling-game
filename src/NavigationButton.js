import React from 'react';
import { useNavigate } from 'react-router-dom';

const NavigationButton = ({ to, icon }) => {
    const navigate = useNavigate();

    return (
        <button onClick={() => navigate(to)} className="navigation-button rounded">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" width="1em">
                {icon}
            </svg>
        </button>
    );
};

export default NavigationButton;
