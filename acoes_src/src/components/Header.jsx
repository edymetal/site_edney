import React from 'react';
import '../styles/Header.css';

const Header = ({ toggleSidebar }) => {
    const today = new Date().toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <header className="header">
            <div className="header-left">
                <button className="menu-btn" onClick={toggleSidebar}>
                    <i className="bi bi-list"></i>
                </button>
                <h2 className="page-title">Visão Geral do Mercado</h2>
            </div>
            <div className="header-right">
                <span className="date-display">
                    <i className="bi bi-calendar3"></i>
                    {today}
                </span>
            </div>
        </header>
    );
};

export default Header;
